// ============================================================
// イーストン トレーニング管理システム - Vue 3 アプリ本体
// ============================================================

const { createApp, ref, computed, reactive, watch, onMounted } = Vue

// ---- ルーティングユーティリティ ----
function parseRoute(hash) {
  const path = (hash || '#/').replace('#', '') || '/'
  if (path === '/' || path === '') return { name: 'dashboard', params: {} }
  if (path.startsWith('/casting')) return { name: 'casting', params: {} }
  if (path.startsWith('/skills')) return { name: 'skills', params: {} }
  if (path.startsWith('/staff/add')) return { name: 'staff-add', params: {} }
  if (path.startsWith('/import')) return { name: 'import', params: {} }
  const staffMatch = path.match(/^\/staff\/([^/]+)$/)
  if (staffMatch) return { name: 'staff-detail', params: { id: staffMatch[1] } }
  const inputMatch = path.match(/^\/input\/([^/]+)\/([^/]+)$/)
  if (inputMatch) return { name: 'input', params: { staffId: inputMatch[1], itemId: inputMatch[2] } }
  return { name: 'dashboard', params: {} }
}

function navigate(path) {
  window.location.hash = path
}

// ---- バリデーションロジック ----
function calcMaxAllowedScore(ev) {
  if (!ev || !ev.bookConfirmed) return 2
  if (!ev.understandingConfirmed) return 2
  if (!ev.practicalConfirmed) return 2
  return 4
}

function getStatusLabel(ev) {
  if (!ev || !ev.officialScore) return '未教示'
  if (ev.officialScore >= 4) return '教えられる'
  if (ev.officialScore >= 3) return '基準内'
  return '進行中'
}

function getStatusClass(ev) {
  const label = getStatusLabel(ev)
  if (label === '教えられる') return 'badge-teach'
  if (label === '基準内') return 'badge-ok'
  if (label === '進行中') return 'badge-progress'
  return 'badge-none'
}

// ---- PHASEチェック 参照タイプ ----
function refTypeInfo(refType) {
  if (refType === 'book')     return { icon: '📖', label: 'EB', cls: 'ref-book' }
  if (refType === 'video')    return { icon: '🎬', label: '動画', cls: 'ref-video' }
  if (refType === 'roleplay') return { icon: '🎭', label: 'RP', cls: 'ref-roleplay' }
  if (refType === 'test')     return { icon: '📝', label: 'TEST', cls: 'ref-test' }
  return { icon: '─', label: '─', cls: 'ref-none' }
}

// ---- ランク情報 ----
function rankInfo(rankId) {
  return RANK_CONFIG.find(r => r.id === rankId) || RANK_CONFIG[0]
}

// ---- ポジションバッジクラス ----
function posBadgeClass(position) {
  if (position === 'ホール') return 'pos-badge-hall'
  if (position === 'キッチン') return 'pos-badge-kitchen'
  if (position === 'ホール・キッチン兼務') return 'pos-badge-both'
  return 'pos-badge-hall'
}

// ---- トラッキングスコアのバッジ色 ----
function getTrackingBadgeClass(score, maxLevel) {
  if (!score || score === 0) return 'track-score-0'
  if (score >= 4) return 'track-score-4'
  if (score >= 3) return 'track-score-3'
  if (score >= 2) return 'track-score-2'
  return 'track-score-1'
}

// ---- Firestore ヘルパー ----
async function loadStaffList() {
  const snap = await db.collection('staff').where('active', '==', true).get()
  const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'))
}

async function loadStaff(id) {
  const doc = await db.collection('staff').doc(id).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() }
}

async function loadEvaluations(staffId) {
  const snap = await db.collection('evaluations').where('staffId', '==', staffId).get()
  const map = {}
  snap.docs.forEach(d => {
    const data = d.data()
    map[data.itemId] = { id: d.id, ...data }
  })
  return map
}

async function saveEvaluation(staffId, itemId, payload) {
  const snap = await db.collection('evaluations')
    .where('staffId', '==', staffId)
    .where('itemId', '==', itemId)
    .get()

  const data = {
    staffId,
    itemId,
    bookConfirmed: payload.bookConfirmed || false,
    teachingDate: payload.teachingDate || '',
    teacher: payload.teacher || '',
    understandingConfirmed: payload.understandingConfirmed || false,
    practicalConfirmed: payload.practicalConfirmed || false,
    officialScore: payload.officialScore || 0,
    comment: payload.comment || '',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }

  if (!snap.empty) {
    await db.collection('evaluations').doc(snap.docs[0].id).update(data)
    return snap.docs[0].id
  } else {
    const ref = await db.collection('evaluations').add(data)
    return ref.id
  }
}

async function loadPhaseProgress(staffId) {
  const doc = await db.collection('phaseProgress').doc(staffId).get()
  const result = {}
  PHASE_ITEMS.forEach(item => {
    result[item.id] = { taught: false, learned: false, confirmed: false }
  })
  if (doc.exists) {
    const data = doc.data()
    Object.keys(data).forEach(key => {
      if (result[key]) result[key] = { ...result[key], ...data[key] }
    })
  }
  return result
}

// ---- トラッキングスコア Firestore ヘルパー ----
async function loadTrackingScores(staffId) {
  const doc = await db.collection('trackingScores').doc(staffId).get()
  const result = {}
  TRACKING_ITEMS.forEach(item => { result[item.id] = 0 })
  if (doc.exists) {
    const data = doc.data()
    Object.keys(data).forEach(key => {
      if (key in result) result[key] = data[key] || 0
    })
  }
  return result
}

async function saveTrackingScore(staffId, itemId, score) {
  await db.collection('trackingScores').doc(staffId).set(
    { [itemId]: score, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
}

// ---- 目標 Firestore ヘルパー ----
async function loadGoals(staffId) {
  const doc = await db.collection('goals').doc(staffId).get()
  if (!doc.exists) return { goal1: '', goal2: '', goal3: '', trainer: '', deadline: '', updatedAt: null }
  return doc.data()
}

async function saveGoals(staffId, goalData) {
  await db.collection('goals').doc(staffId).set(
    { ...goalData, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
}

// ============================================================
// Vueアプリ
// ============================================================
createApp({
  setup() {
    const route = reactive(parseRoute(window.location.hash))
    const loading = ref(false)
    const error = ref('')

    window.addEventListener('hashchange', () => {
      const r = parseRoute(window.location.hash)
      route.name = r.name
      route.params = r.params
    })

    // ---- ダッシュボード ----
    const staffList = ref([])
    const staffEvalSummaries = ref({})

    async function fetchDashboard() {
      loading.value = true
      error.value = ''
      try {
        staffList.value = await loadStaffList()
        for (const s of staffList.value) {
          const evals = await loadEvaluations(s.id)
          const items = EVALUATION_ITEMS
          let baseCount = 0, teachCount = 0, noneCount = 0, followCount = 0
          items.forEach(item => {
            const ev = evals[item.id]
            if (!ev || !ev.officialScore) { noneCount++; return }
            if (ev.officialScore >= 4) { baseCount++; teachCount++ }
            else if (ev.officialScore >= 3) { baseCount++ }
            else if (ev.bookConfirmed && ev.officialScore <= 2) { followCount++ }
          })
          staffEvalSummaries.value[s.id] = {
            baseCount, teachCount, noneCount, followCount,
            total: items.length
          }
        }
      } catch (e) {
        error.value = 'エラー: ' + (e.message || e.code || JSON.stringify(e))
        console.error(e)
      }
      loading.value = false
    }

    // ---- キャスティングボード ----
    const castingStaff = ref([])

    async function fetchCasting() {
      loading.value = true
      error.value = ''
      try {
        castingStaff.value = await loadStaffList()
      } catch (e) {
        error.value = 'データの読み込みに失敗しました。'
        console.error(e)
      }
      loading.value = false
    }

    // ランク別・ポジション別にスタッフを取得
    function staffByRankAndPosition(rankId, positionGroup) {
      // positionGroup: 'hall' | 'kitchen'
      return castingStaff.value.filter(s => {
        const r = s.rank || 'trainee'
        if (r !== rankId) return false
        const pos = s.position || s.role || ''
        if (positionGroup === 'hall') {
          return pos === 'ホール' || pos === 'ホール・キッチン兼務'
        }
        if (positionGroup === 'kitchen') {
          return pos === 'キッチン' || pos === 'ホール・キッチン兼務'
        }
        return true
      })
    }

    function rankCount(rankId) {
      return castingStaff.value.filter(s => (s.rank || 'trainee') === rankId).length
    }

    // ---- スタッフ詳細 ----
    const currentStaff = ref(null)
    const currentEvals = ref({})
    const staffTab = ref('eval') // 'eval' | 'tracking' | 'phase' | 'goals'
    const phaseProgress = reactive({})
    const expandedPhases = ref([0])
    const phaseSaving = ref(false)

    // トラッキング
    const trackingScores = reactive({})
    const trackingSaving = ref(false)

    // 目標
    const goalsForm = reactive({ goal1: '', goal2: '', goal3: '', trainer: '', deadline: '' })
    const goalsLastSaved = ref(null)
    const goalsSaving = ref(false)
    const goalsSaved = ref(false)

    function isPhaseExpanded(phase) {
      return expandedPhases.value.includes(phase)
    }
    function togglePhase(phase) {
      const idx = expandedPhases.value.indexOf(phase)
      if (idx >= 0) expandedPhases.value.splice(idx, 1)
      else expandedPhases.value.push(phase)
    }
    function phaseConfirmedCount(phase) {
      return PHASE_GROUPS[phase].items.filter(i => phaseProgress[i.id]?.confirmed).length
    }
    function phaseIsComplete(phase) {
      const g = PHASE_GROUPS[phase]
      return g.items.every(i => phaseProgress[i.id]?.confirmed)
    }

    // 対象スタッフのトラッキング項目（tier別グループ）
    const trackingGroups = computed(() => {
      if (!currentStaff.value) return []
      const items = getTrackingItemsForStaff(
        currentStaff.value.position || currentStaff.value.role || 'ホール',
        currentStaff.value.rank || 'trainee'
      )
      // tierの順序
      const order = ['trainee','hall-c','hall-b','hall-a','kitchen-c','kitchen-b','kitchen-a','trainer']
      const grouped = {}
      items.forEach(i => {
        if (!grouped[i.tier]) grouped[i.tier] = []
        grouped[i.tier].push(i)
      })
      return order
        .filter(t => grouped[t])
        .map(t => ({
          tier: t,
          label: TRACKING_TIER_LABELS[t] || t,
          items: grouped[t]
        }))
    })

    function trackingGroupProgress(group) {
      const total = group.items.reduce((sum, it) => sum + it.max, 0)
      const done = group.items.reduce((sum, it) => sum + Math.min(trackingScores[it.id] || 0, it.max), 0)
      return { done, total, pct: total > 0 ? (done / total * 100) : 0 }
    }

    function trackingCriteriaText(item, score) {
      if (!score || score === 0) return '未評価'
      if (score === 1) return item.c1 || ''
      if (score === 2) return item.c2 || ''
      if (score === 3) return item.c3 || ''
      if (score === 4) return item.c4 || ''
      return ''
    }

    async function fetchStaffDetail(id) {
      loading.value = true
      error.value = ''
      staffTab.value = 'eval'
      try {
        currentStaff.value = await loadStaff(id)
        currentEvals.value = await loadEvaluations(id)
        // PHASEプログレスも同時読み込み
        const pp = await loadPhaseProgress(id)
        Object.keys(phaseProgress).forEach(k => delete phaseProgress[k])
        PHASE_ITEMS.forEach(item => {
          phaseProgress[item.id] = pp[item.id]
        })
        // 最初の未完了PHASEを展開
        expandedPhases.value = []
        const firstIncomplete = PHASE_GROUPS.findIndex(g => !g.items.every(i => pp[i.id]?.confirmed))
        expandedPhases.value = [firstIncomplete >= 0 ? firstIncomplete : 0]

        // トラッキングスコア読み込み
        const ts = await loadTrackingScores(id)
        Object.keys(trackingScores).forEach(k => delete trackingScores[k])
        TRACKING_ITEMS.forEach(it => {
          trackingScores[it.id] = ts[it.id] || 0
        })

        // 目標読み込み
        const goals = await loadGoals(id)
        goalsForm.goal1 = goals.goal1 || ''
        goalsForm.goal2 = goals.goal2 || ''
        goalsForm.goal3 = goals.goal3 || ''
        goalsForm.trainer = goals.trainer || ''
        goalsForm.deadline = goals.deadline || ''
        goalsLastSaved.value = goals.updatedAt || null
        goalsSaved.value = false
      } catch (e) {
        error.value = 'データの読み込みに失敗しました。'
        console.error(e)
      }
      loading.value = false
    }

    async function onPhaseCheck(item, field, value) {
      const cur = phaseProgress[item.id] || { taught: false, learned: false, confirmed: false }
      const upd = { ...cur, [field]: value }
      // 依存チェック: 上位チェックを外したら下位も解除
      if (field === 'taught' && !value) { upd.learned = false; upd.confirmed = false }
      if (field === 'learned' && !value) { upd.confirmed = false }
      // 前提チェック: 下位を先にチェックさせない
      if (field === 'learned' && value && !cur.taught) return
      if (field === 'confirmed' && value && !cur.learned) return
      phaseProgress[item.id] = upd
      if (!currentStaff.value) return
      try {
        phaseSaving.value = true
        await db.collection('phaseProgress').doc(currentStaff.value.id).set(
          { [item.id]: upd },
          { merge: true }
        )
      } catch (e) {
        console.error('Phase save error:', e)
      }
      phaseSaving.value = false
    }

    async function onTrackingScoreChange(item, score) {
      if (!currentStaff.value) return
      trackingScores[item.id] = score
      try {
        trackingSaving.value = true
        await saveTrackingScore(currentStaff.value.id, item.id, score)
      } catch (e) {
        console.error('Tracking save error:', e)
      }
      trackingSaving.value = false
    }

    async function submitGoals() {
      if (!currentStaff.value) return
      goalsSaving.value = true
      goalsSaved.value = false
      try {
        await saveGoals(currentStaff.value.id, {
          goal1: goalsForm.goal1,
          goal2: goalsForm.goal2,
          goal3: goalsForm.goal3,
          trainer: goalsForm.trainer,
          deadline: goalsForm.deadline
        })
        goalsLastSaved.value = { seconds: Math.floor(Date.now() / 1000) }
        goalsSaved.value = true
      } catch (e) {
        error.value = '目標の保存に失敗しました。'
        console.error(e)
      }
      goalsSaving.value = false
    }

    function formatTimestamp(ts) {
      if (!ts) return '─'
      try {
        const d = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000)
        return d.toLocaleString('ja-JP', { dateStyle: 'short', timeStyle: 'short' })
      } catch (e) {
        return '─'
      }
    }

    // ---- 評価入力フォーム ----
    const inputStaff = ref(null)
    const inputItem = ref(null)
    const inputForm = reactive({
      bookConfirmed: false,
      teachingDate: '',
      teacher: '',
      understandingConfirmed: false,
      practicalConfirmed: false,
      officialScore: 0,
      comment: ''
    })
    const inputSaving = ref(false)
    const inputSaved = ref(false)

    const maxScore = computed(() => calcMaxAllowedScore(inputForm))

    const scoreOptions = computed(() => {
      return [1, 2, 3, 4].map(n => ({
        value: n,
        label: `${n}：${n === 1 ? '教えた' : n === 2 ? '理解してできる' : n === 3 ? '基準内に正しくできる' : '見本となり教えることができる'}`,
        disabled: n > maxScore.value || (n === 1 && !inputForm.bookConfirmed)
      }))
    })

    watch(() => inputForm.officialScore, (val) => {
      if (val > maxScore.value) inputForm.officialScore = maxScore.value
      if (val === 1 && !inputForm.bookConfirmed) inputForm.officialScore = 0
    })

    watch(() => [inputForm.bookConfirmed, inputForm.understandingConfirmed, inputForm.practicalConfirmed], () => {
      if (inputForm.officialScore > maxScore.value) inputForm.officialScore = maxScore.value
      if (inputForm.officialScore === 1 && !inputForm.bookConfirmed) inputForm.officialScore = 0
    })

    async function fetchInputForm(staffId, itemId) {
      loading.value = true
      error.value = ''
      inputSaved.value = false
      try {
        inputStaff.value = await loadStaff(staffId)
        inputItem.value = EVALUATION_ITEMS.find(i => i.id === itemId) || null
        const evals = await loadEvaluations(staffId)
        const ev = evals[itemId]
        if (ev) {
          inputForm.bookConfirmed = ev.bookConfirmed || false
          inputForm.teachingDate = ev.teachingDate || ''
          inputForm.teacher = ev.teacher || ''
          inputForm.understandingConfirmed = ev.understandingConfirmed || false
          inputForm.practicalConfirmed = ev.practicalConfirmed || false
          inputForm.officialScore = ev.officialScore || 0
          inputForm.comment = ev.comment || ''
        } else {
          inputForm.bookConfirmed = false
          inputForm.teachingDate = ''
          inputForm.teacher = ''
          inputForm.understandingConfirmed = false
          inputForm.practicalConfirmed = false
          inputForm.officialScore = 0
          inputForm.comment = ''
        }
      } catch (e) {
        error.value = 'データの読み込みに失敗しました。'
        console.error(e)
      }
      loading.value = false
    }

    async function submitForm() {
      if (!inputStaff.value || !inputItem.value) return
      inputSaving.value = true
      error.value = ''
      try {
        await saveEvaluation(inputStaff.value.id, inputItem.value.id, { ...inputForm })
        inputSaved.value = true
      } catch (e) {
        error.value = '保存に失敗しました。'
        console.error(e)
      }
      inputSaving.value = false
    }

    // ---- スキルマップ ----
    const skillStaffList = ref([])
    const skillEvals = ref({})

    async function fetchSkillMap() {
      loading.value = true
      error.value = ''
      try {
        skillStaffList.value = await loadStaffList()
        for (const s of skillStaffList.value) {
          skillEvals.value[s.id] = await loadEvaluations(s.id)
        }
      } catch (e) {
        error.value = 'データの読み込みに失敗しました。'
        console.error(e)
      }
      loading.value = false
    }

    // ---- スタッフ追加 ----
    const newStaffForm = reactive({
      name: '',
      role: 'ホール',
      position: 'ホール',
      rank: 'trainee',
      startDate: ''
    })
    const staffAdding = ref(false)
    const staffAddError = ref('')

    async function addStaff() {
      if (!newStaffForm.name.trim()) { staffAddError.value = '名前を入力してください。'; return }
      staffAdding.value = true
      staffAddError.value = ''
      try {
        await db.collection('staff').add({
          name: newStaffForm.name.trim(),
          role: newStaffForm.role,
          position: newStaffForm.position,
          rank: newStaffForm.rank || 'trainee',
          startDate: newStaffForm.startDate,
          active: true
        })
        newStaffForm.name = ''
        newStaffForm.role = 'ホール'
        newStaffForm.position = 'ホール'
        newStaffForm.rank = 'trainee'
        newStaffForm.startDate = ''
        navigate('#/')
      } catch (e) {
        staffAddError.value = '追加に失敗しました。'
        console.error(e)
      }
      staffAdding.value = false
    }

    // ---- CSVインポート ----
    const csvPreview = ref([])
    const csvImporting = ref(false)
    const csvImportDone = ref(0)
    const csvError = ref('')

    function parseCsv(text) {
      const lines = text.split('\n').filter(l => l.trim())
      const rows = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',')
        const name = (cols[10] || '').trim()
        const role = (cols[23] || '').trim() || 'スタッフ'
        const startDate = (cols[21] || '').trim().replace(/\//g, '-')
        const leaveDate = (cols[22] || '').trim()
        const retireDate = (cols[26] || '').trim()
        if (!name) continue
        if (name.includes('Timee') || name.includes('タイミー')) continue
        if (leaveDate || retireDate) continue
        rows.push({ name, role, startDate, position: 'ホール', rank: 'trainee', selected: true })
      }
      return rows
    }

    function onCsvFile(event) {
      const file = event.target.files[0]
      if (!file) return
      csvError.value = ''
      csvPreview.value = []
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const decoder = new TextDecoder('shift-jis')
          const text = decoder.decode(e.target.result)
          const rows = parseCsv(text)
          if (rows.length === 0) { csvError.value = '取り込めるスタッフが見つかりませんでした。'; return }
          csvPreview.value = rows
        } catch(err) {
          csvError.value = 'CSVの読み込みに失敗しました: ' + err.message
        }
      }
      reader.readAsArrayBuffer(file)
    }

    async function importCsv() {
      const targets = csvPreview.value.filter(r => r.selected)
      if (targets.length === 0) return
      csvImporting.value = true
      csvImportDone.value = 0
      csvError.value = ''
      for (const s of targets) {
        await db.collection('staff').add({
          name: s.name,
          role: s.role,
          position: s.position || 'ホール',
          rank: s.rank || 'trainee',
          startDate: s.startDate,
          active: true
        })
        csvImportDone.value++
      }
      csvImporting.value = false
      csvPreview.value = []
      navigate('#/')
    }

    // ---- ルート変更時のデータ取得 ----
    watch(() => route.name, async (name) => {
      if (name === 'dashboard') await fetchDashboard()
      if (name === 'casting') await fetchCasting()
      if (name === 'staff-detail') await fetchStaffDetail(route.params.id)
      if (name === 'input') await fetchInputForm(route.params.staffId, route.params.itemId)
      if (name === 'skills') await fetchSkillMap()
    }, { immediate: true })

    return {
      route, loading, error,
      staffList, staffEvalSummaries,
      castingStaff, staffByRankAndPosition, rankCount,
      currentStaff, currentEvals,
      staffTab, phaseProgress, expandedPhases, phaseSaving,
      isPhaseExpanded, togglePhase, phaseConfirmedCount, phaseIsComplete,
      onPhaseCheck,
      trackingScores, trackingSaving, trackingGroups,
      trackingGroupProgress, trackingCriteriaText, onTrackingScoreChange,
      goalsForm, goalsLastSaved, goalsSaving, goalsSaved, submitGoals, formatTimestamp,
      inputStaff, inputItem, inputForm, inputSaving, inputSaved, scoreOptions, maxScore,
      skillStaffList, skillEvals,
      newStaffForm, staffAdding, staffAddError,
      csvPreview, csvImporting, csvImportDone, csvError,
      onCsvFile, importCsv,
      addStaff, submitForm, navigate,
      getStatusLabel, getStatusClass, calcMaxAllowedScore,
      refTypeInfo, rankInfo, posBadgeClass, getTrackingBadgeClass,
      EVALUATION_ITEMS, PHASE_ITEMS, PHASE_GROUPS,
      RANK_CONFIG, TRACKING_ITEMS, TRACKING_TIER_LABELS
    }
  },

  template: `
<div class="min-h-screen bg-gray-50">

  <!-- ヘッダー -->
  <header class="app-header sticky top-0 z-10">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <button @click="navigate('#/')" class="app-logo text-left hover:opacity-80">
        EASTONE<span>TRAINING SYSTEM</span>
      </button>
      <nav class="hidden sm:flex items-center gap-3 text-sm flex-wrap justify-end">
        <button @click="navigate('#/')" class="nav-link">ダッシュボード</button>
        <button @click="navigate('#/casting')" class="nav-link">キャスティング</button>
        <button @click="navigate('#/skills')" class="nav-link">スキルマップ</button>
        <button @click="navigate('#/import')" class="nav-link">CSV取込</button>
        <button @click="navigate('#/staff/add')" class="btn-primary text-sm px-4 py-2">＋スタッフ追加</button>
      </nav>
    </div>
  </header>

  <main class="max-w-5xl mx-auto px-4 py-6">

    <!-- エラー表示 -->
    <div v-if="error" class="mb-4 bg-red-100 border border-red-300 text-red-700 rounded p-3 text-sm">
      ⚠ {{ error }}
    </div>

    <!-- ローディング -->
    <div v-if="loading" class="text-center py-16 text-gray-400">
      <div class="loading-spinner mx-auto mb-3"></div>
      <p>読み込み中...</p>
    </div>

    <!-- ============ ダッシュボード ============ -->
    <template v-else-if="route.name === 'dashboard'">
      <h1 class="text-xl font-bold text-gray-700 mb-4">スタッフ育成状況</h1>
      <div v-if="staffList.length === 0" class="text-center py-16 text-gray-400">
        <p class="text-4xl mb-3">👥</p>
        <p class="mb-4">スタッフが登録されていません</p>
        <button @click="navigate('#/staff/add')" class="btn-primary">＋スタッフを追加する</button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div v-for="s in staffList" :key="s.id" class="staff-card" @click="navigate('#/staff/' + s.id)">
          <div class="flex items-center justify-between mb-3">
            <div class="min-w-0 flex-1">
              <p class="font-bold text-gray-900">{{ s.name }}</p>
              <div class="flex items-center gap-2 mt-1 flex-wrap">
                <span class="rank-badge"
                  :style="{ color: rankInfo(s.rank || 'trainee').color, background: rankInfo(s.rank || 'trainee').bg, borderColor: rankInfo(s.rank || 'trainee').color }">
                  {{ rankInfo(s.rank || 'trainee').name }}
                </span>
                <span :class="posBadgeClass(s.position || s.role)" class="pos-badge">
                  {{ s.position || s.role }}
                </span>
              </div>
              <p class="text-xs text-gray-400 mt-1">{{ s.startDate ? s.startDate + ' 入社' : '' }}</p>
            </div>
            <div class="text-right text-xs text-gray-500 ml-2">
              <span v-if="staffEvalSummaries[s.id]">
                基準内 <span class="font-black text-base" style="color:#CC1122">{{ staffEvalSummaries[s.id].baseCount }}</span> /
                教えられる <span class="font-black text-base" style="color:#A50E1A">{{ staffEvalSummaries[s.id].teachCount }}</span>
              </span>
            </div>
          </div>
          <div v-if="staffEvalSummaries[s.id]">
            <div class="progress-bar-bg mb-2">
              <div class="progress-bar-ok" :style="{width: (staffEvalSummaries[s.id].baseCount / staffEvalSummaries[s.id].total * 100) + '%'}"></div>
              <div class="progress-bar-teach" :style="{width: (staffEvalSummaries[s.id].teachCount / staffEvalSummaries[s.id].total * 100) + '%'}"></div>
            </div>
            <div class="flex gap-2 flex-wrap">
              <span v-if="staffEvalSummaries[s.id].noneCount > 0" class="badge-none">未教示 {{ staffEvalSummaries[s.id].noneCount }}</span>
              <span v-if="staffEvalSummaries[s.id].followCount > 0" class="badge-progress">要フォロー {{ staffEvalSummaries[s.id].followCount }}</span>
              <span v-if="staffEvalSummaries[s.id].baseCount > 0" class="badge-ok">基準内 {{ staffEvalSummaries[s.id].baseCount }}</span>
              <span v-if="staffEvalSummaries[s.id].teachCount > 0" class="badge-teach">教えられる {{ staffEvalSummaries[s.id].teachCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ キャスティングボード ============ -->
    <template v-else-if="route.name === 'casting'">
      <h1 class="text-xl font-bold text-gray-700 mb-1">キャスティングボード</h1>
      <p class="text-sm text-gray-500 mb-5">ランク別・ポジション別の人員配置一覧</p>
      <div v-if="castingStaff.length === 0" class="text-center py-16 text-gray-400">
        <p>スタッフが登録されていません</p>
      </div>
      <div v-else class="space-y-4">
        <!-- 高ランクから順に -->
        <div v-for="rank in [...RANK_CONFIG].reverse()" :key="rank.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 py-2 flex items-center justify-between"
            :style="{ background: rank.bg, borderBottom: '2px solid ' + rank.color }">
            <div class="flex items-center gap-2">
              <span class="rank-badge"
                :style="{ color: rank.color, background: '#fff', borderColor: rank.color }">
                {{ rank.name }}
              </span>
              <span class="text-xs text-gray-500">{{ rankCount(rank.id) }}名</span>
            </div>
          </div>
          <div class="casting-grid p-3">
            <!-- ホール -->
            <div>
              <p class="text-xs font-bold text-gray-500 mb-2 px-1">🍷 ホール</p>
              <div v-if="staffByRankAndPosition(rank.id, 'hall').length === 0"
                class="text-xs text-gray-300 italic px-1 py-2">─ 配置なし ─</div>
              <div v-for="s in staffByRankAndPosition(rank.id, 'hall')" :key="s.id"
                class="casting-staff-card" @click="navigate('#/staff/' + s.id)">
                <p class="font-semibold text-gray-800 text-sm">{{ s.name }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span :class="posBadgeClass(s.position || s.role)" class="pos-badge text-xs">{{ s.position || s.role }}</span>
                  <span class="text-xs text-gray-400">{{ s.startDate || '' }}</span>
                </div>
              </div>
            </div>
            <!-- キッチン -->
            <div>
              <p class="text-xs font-bold text-gray-500 mb-2 px-1">🍳 キッチン</p>
              <div v-if="staffByRankAndPosition(rank.id, 'kitchen').length === 0"
                class="text-xs text-gray-300 italic px-1 py-2">─ 配置なし ─</div>
              <div v-for="s in staffByRankAndPosition(rank.id, 'kitchen')" :key="s.id"
                class="casting-staff-card" @click="navigate('#/staff/' + s.id)">
                <p class="font-semibold text-gray-800 text-sm">{{ s.name }}</p>
                <div class="flex items-center justify-between mt-1">
                  <span :class="posBadgeClass(s.position || s.role)" class="pos-badge text-xs">{{ s.position || s.role }}</span>
                  <span class="text-xs text-gray-400">{{ s.startDate || '' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ スタッフ詳細 ============ -->
    <template v-else-if="route.name === 'staff-detail' && currentStaff">
      <div class="flex items-center gap-2 mb-1">
        <button @click="navigate('#/')" class="text-gray-500 hover:underline text-sm">← 一覧に戻る</button>
        <span v-if="phaseSaving || trackingSaving" class="text-xs text-gray-400 ml-2">保存中...</span>
      </div>
      <div class="flex items-center gap-2 mb-1 flex-wrap">
        <h1 class="text-xl font-bold text-gray-800">{{ currentStaff.name }}</h1>
        <span class="rank-badge"
          :style="{ color: rankInfo(currentStaff.rank || 'trainee').color, background: rankInfo(currentStaff.rank || 'trainee').bg, borderColor: rankInfo(currentStaff.rank || 'trainee').color }">
          {{ rankInfo(currentStaff.rank || 'trainee').name }}
        </span>
        <span :class="posBadgeClass(currentStaff.position || currentStaff.role)" class="pos-badge">
          {{ currentStaff.position || currentStaff.role }}
        </span>
      </div>
      <p class="text-sm text-gray-400 mb-4">{{ currentStaff.role }} {{ currentStaff.startDate ? '・' + currentStaff.startDate + ' 入社' : '' }}</p>

      <!-- タブ切替 -->
      <div class="flex gap-1 mb-5 border-b border-gray-200 overflow-x-auto">
        <button @click="staffTab = 'eval'"
          :class="['px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
            staffTab === 'eval' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          📊 EB評価（12）
        </button>
        <button @click="staffTab = 'tracking'"
          :class="['px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
            staffTab === 'tracking' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          🎯 トラッキング
        </button>
        <button @click="staffTab = 'phase'"
          :class="['px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
            staffTab === 'phase' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          ✅ PHASE（99）
        </button>
        <button @click="staffTab = 'goals'"
          :class="['px-3 py-2 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
            staffTab === 'goals' ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700']">
          🎯 目標
        </button>
      </div>

      <!-- ─── 評価タブ ─── -->
      <div v-if="staffTab === 'eval'" class="space-y-3">
        <div v-for="item in EVALUATION_ITEMS" :key="item.id"
          class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="font-semibold text-gray-800">{{ item.id }}. {{ item.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ item.bookRef }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="getStatusClass(currentEvals[item.id])" class="text-xs px-2 py-1 rounded-full font-medium">
                {{ getStatusLabel(currentEvals[item.id]) }}
              </span>
              <span v-if="currentEvals[item.id] && currentEvals[item.id].officialScore" class="score-badge">
                {{ currentEvals[item.id].officialScore }}
              </span>
              <button @click="navigate('#/input/' + currentStaff.id + '/' + item.id)"
                class="btn-sm-primary">評価入力</button>
            </div>
          </div>
          <div v-if="currentEvals[item.id] && currentEvals[item.id].officialScore" class="mt-3 pt-3 border-t border-gray-50 grid grid-cols-3 gap-2 text-xs text-gray-500">
            <span>📖 ブック確認: <strong :class="currentEvals[item.id].bookConfirmed ? 'text-green-600' : 'text-red-400'">{{ currentEvals[item.id].bookConfirmed ? '済' : '未' }}</strong></span>
            <span>💡 理解確認: <strong :class="currentEvals[item.id].understandingConfirmed ? 'text-green-600' : 'text-red-400'">{{ currentEvals[item.id].understandingConfirmed ? '済' : '未' }}</strong></span>
            <span>🏃 実技確認: <strong :class="currentEvals[item.id].practicalConfirmed ? 'text-green-600' : 'text-red-400'">{{ currentEvals[item.id].practicalConfirmed ? '済' : '未' }}</strong></span>
            <span v-if="currentEvals[item.id].teachingDate">📅 教示日: {{ currentEvals[item.id].teachingDate }}</span>
            <span v-if="currentEvals[item.id].teacher">👤 教示者: {{ currentEvals[item.id].teacher }}</span>
          </div>
          <div v-if="currentEvals[item.id] && currentEvals[item.id].comment" class="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
            💬 {{ currentEvals[item.id].comment }}
          </div>
          <div v-if="currentEvals[item.id] && currentEvals[item.id].officialScore" class="mt-2 text-xs text-gray-400 italic">
            {{ item.criteria[currentEvals[item.id].officialScore] }}
          </div>
        </div>
      </div>

      <!-- ─── トラッキングタブ ─── -->
      <div v-if="staffTab === 'tracking'" class="space-y-4">
        <div v-if="trackingGroups.length === 0" class="text-center py-12 text-gray-400">
          <p>このスタッフ向けのトラッキング項目がありません</p>
        </div>
        <div v-for="group in trackingGroups" :key="group.tier"
          class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <p class="font-bold text-gray-700 text-sm">{{ group.label }}</p>
              <span class="text-xs text-gray-500">
                {{ trackingGroupProgress(group).done }} / {{ trackingGroupProgress(group).total }}
              </span>
            </div>
            <div class="progress-bar-bg">
              <div class="progress-bar-teach" :style="{width: trackingGroupProgress(group).pct + '%'}"></div>
            </div>
          </div>
          <div class="divide-y divide-gray-100">
            <div v-for="item in group.items" :key="item.id" class="p-3">
              <div class="flex items-start gap-3 mb-2">
                <span class="text-xs text-gray-400 font-mono flex-shrink-0 mt-1 w-6 text-right">{{ item.no }}.</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-gray-800">{{ item.name }}</p>
                </div>
                <div class="flex gap-1 flex-shrink-0">
                  <button
                    @click="onTrackingScoreChange(item, 0)"
                    :class="['track-score-btn', (trackingScores[item.id] || 0) === 0 ? 'track-score-0 active' : '']"
                    title="未評価">─</button>
                  <button v-for="n in item.max" :key="n"
                    @click="onTrackingScoreChange(item, n)"
                    :class="['track-score-btn', 'track-score-' + n, (trackingScores[item.id] || 0) === n ? 'active' : '']">
                    {{ n }}
                  </button>
                </div>
              </div>
              <div v-if="trackingScores[item.id] > 0" class="ml-9 text-xs text-gray-600 bg-gray-50 rounded p-2">
                <span class="font-bold mr-1">レベル{{ trackingScores[item.id] }}:</span>
                {{ trackingCriteriaText(item, trackingScores[item.id]) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── 目標タブ ─── -->
      <div v-if="staffTab === 'goals'" class="space-y-4">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-gray-800">月次目標</h2>
            <span class="text-xs text-gray-400">最終更新: {{ formatTimestamp(goalsLastSaved) }}</span>
          </div>
          <div v-if="goalsSaved" class="mb-3 bg-green-50 border border-green-200 text-green-700 rounded p-2 text-sm">
            ✅ 保存しました。
          </div>
          <form @submit.prevent="submitGoals" class="space-y-4">
            <div>
              <label class="label-text">目標①</label>
              <textarea v-model="goalsForm.goal1" rows="2"
                placeholder="例: バッシングを2名テーブル1分以内で完了する"
                class="form-input resize-none"></textarea>
            </div>
            <div>
              <label class="label-text">目標②</label>
              <textarea v-model="goalsForm.goal2" rows="2" class="form-input resize-none"></textarea>
            </div>
            <div>
              <label class="label-text">目標③</label>
              <textarea v-model="goalsForm.goal3" rows="2" class="form-input resize-none"></textarea>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-text">担当トレーナー</label>
                <input type="text" v-model="goalsForm.trainer" placeholder="名前を入力" class="form-input">
              </div>
              <div>
                <label class="label-text">達成期限</label>
                <input type="date" v-model="goalsForm.deadline" class="form-input">
              </div>
            </div>
            <button type="submit" :disabled="goalsSaving"
              class="w-full btn-primary py-3 text-base disabled:opacity-50">
              {{ goalsSaving ? '保存中...' : '💾 目標を保存する' }}
            </button>
          </form>
        </div>
      </div>

      <!-- ─── PHASEチェックタブ ─── -->
      <div v-if="staffTab === 'phase'">
        <!-- 全体進捗 -->
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
          <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">全体進捗</p>
          <div class="flex items-center gap-3">
            <div class="flex-1">
              <div class="progress-bar-bg">
                <div class="progress-bar-teach" :style="{width: (PHASE_ITEMS.filter(i => phaseProgress[i.id] && phaseProgress[i.id].confirmed).length / PHASE_ITEMS.length * 100) + '%'}"></div>
              </div>
            </div>
            <span class="text-sm font-bold" style="color:#CC1122">
              {{ PHASE_ITEMS.filter(i => phaseProgress[i.id] && phaseProgress[i.id].confirmed).length }} / {{ PHASE_ITEMS.length }}
            </span>
            <span class="text-xs text-gray-400">できた</span>
          </div>
          <div class="flex gap-3 mt-3 flex-wrap">
            <div v-for="g in PHASE_GROUPS" :key="g.phase" class="text-center">
              <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mx-auto mb-1',
                phaseIsComplete(g.phase) ? 'bg-red-600 text-white' :
                phaseConfirmedCount(g.phase) > 0 ? 'bg-red-100 text-red-600 border border-red-300' :
                'bg-gray-100 text-gray-400']">
                P{{ g.phase }}
              </div>
              <p class="text-xs text-gray-400">{{ phaseConfirmedCount(g.phase) }}/{{ g.items.length }}</p>
            </div>
          </div>
        </div>

        <!-- PHASEアコーディオン -->
        <div class="space-y-2">
          <div v-for="g in PHASE_GROUPS" :key="g.phase" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">

            <!-- フェーズヘッダー -->
            <button @click="togglePhase(g.phase)"
              class="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <span :class="['w-7 h-7 rounded-full flex items-center justify-center text
