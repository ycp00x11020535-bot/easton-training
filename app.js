// ============================================================
// イーストン トレーニング管理システム - Vue 3 アプリ本体
// ============================================================

const { createApp, ref, computed, reactive, watch, onMounted } = Vue

// ---- ルーティングユーティリティ ----
function parseRoute(hash) {
  const path = (hash || '#/').replace('#', '') || '/'
  if (path === '/' || path === '') return { name: 'dashboard', params: {} }
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

    // ---- スタッフ詳細 ----
    const currentStaff = ref(null)
    const currentEvals = ref({})

    async function fetchStaffDetail(id) {
      loading.value = true
      error.value = ''
      try {
        currentStaff.value = await loadStaff(id)
        currentEvals.value = await loadEvaluations(id)
      } catch (e) {
        error.value = 'データの読み込みに失敗しました。'
        console.error(e)
      }
      loading.value = false
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
      if (inputForm.officialScore > maxScore.value) {
        inputForm.officialScore = maxScore.value
      }
      if (inputForm.officialScore === 1 && !inputForm.bookConfirmed) {
        inputForm.officialScore = 0
      }
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
    const newStaffForm = reactive({ name: '', role: 'ホール', startDate: '' })
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
          startDate: newStaffForm.startDate,
          active: true
        })
        newStaffForm.name = ''
        newStaffForm.role = 'ホール'
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
        rows.push({ name, role, startDate, selected: true })
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
      if (name === 'staff-detail') await fetchStaffDetail(route.params.id)
      if (name === 'input') await fetchInputForm(route.params.staffId, route.params.itemId)
      if (name === 'skills') await fetchSkillMap()
    }, { immediate: true })

    return {
      route, loading, error,
      staffList, staffEvalSummaries,
      currentStaff, currentEvals,
      inputStaff, inputItem, inputForm, inputSaving, inputSaved, scoreOptions, maxScore,
      skillStaffList, skillEvals,
      newStaffForm, staffAdding, staffAddError,
      csvPreview, csvImporting, csvImportDone, csvError,
      onCsvFile, importCsv,
      addStaff, submitForm, navigate,
      getStatusLabel, getStatusClass, calcMaxAllowedScore,
      EVALUATION_ITEMS
    }
  },

  template: `
<div class="min-h-screen bg-gray-50">

  <!-- ヘッダー -->
  <header class="bg-green-700 text-white shadow-md sticky top-0 z-10">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
      <button @click="navigate('#/')" class="text-lg font-bold tracking-wide hover:opacity-80">
        🌿 イーストン トレーニング
      </button>
      <nav class="flex gap-3 text-sm">
        <button @click="navigate('#/')" class="hover:underline">ダッシュボード</button>
        <button @click="navigate('#/skills')" class="hover:underline">スキルマップ</button>
        <button @click="navigate('#/import')" class="hover:underline">CSV取込</button>
        <button @click="navigate('#/staff/add')" class="bg-white text-green-700 rounded px-3 py-1 font-bold hover:bg-green-50">＋スタッフ追加</button>
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
        <div v-for="s in staffList" :key="s.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition cursor-pointer"
          @click="navigate('#/staff/' + s.id)">
          <div class="flex items-center justify-between mb-3">
            <div>
              <p class="font-bold text-gray-800">{{ s.name }}</p>
              <p class="text-xs text-gray-400">{{ s.role }} {{ s.startDate ? '・' + s.startDate + ' 入社' : '' }}</p>
            </div>
            <div class="text-right text-xs text-gray-500">
              <span v-if="staffEvalSummaries[s.id]">
                基準内 <span class="text-green-600 font-bold text-base">{{ staffEvalSummaries[s.id].baseCount }}</span> /
                教えられる <span class="text-green-800 font-bold text-base">{{ staffEvalSummaries[s.id].teachCount }}</span>
              </span>
            </div>
          </div>
          <div v-if="staffEvalSummaries[s.id]">
            <!-- 進捗バー -->
            <div class="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="absolute h-full bg-green-300 rounded-full"
                :style="{width: (staffEvalSummaries[s.id].baseCount / staffEvalSummaries[s.id].total * 100) + '%'}">
              </div>
              <div class="absolute h-full bg-green-600 rounded-full"
                :style="{width: (staffEvalSummaries[s.id].teachCount / staffEvalSummaries[s.id].total * 100) + '%'}">
              </div>
            </div>
            <div class="flex gap-2 mt-2 flex-wrap">
              <span v-if="staffEvalSummaries[s.id].noneCount > 0" class="badge-none text-xs">未教示 {{ staffEvalSummaries[s.id].noneCount }}</span>
              <span v-if="staffEvalSummaries[s.id].followCount > 0" class="badge-progress text-xs">要フォロー {{ staffEvalSummaries[s.id].followCount }}</span>
              <span v-if="staffEvalSummaries[s.id].baseCount > 0" class="badge-ok text-xs">基準内 {{ staffEvalSummaries[s.id].baseCount }}</span>
              <span v-if="staffEvalSummaries[s.id].teachCount > 0" class="badge-teach text-xs">教えられる {{ staffEvalSummaries[s.id].teachCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ スタッフ詳細 ============ -->
    <template v-else-if="route.name === 'staff-detail' && currentStaff">
      <div class="flex items-center gap-2 mb-1">
        <button @click="navigate('#/')" class="text-green-600 hover:underline text-sm">← 一覧に戻る</button>
      </div>
      <h1 class="text-xl font-bold text-gray-800 mb-1">{{ currentStaff.name }}</h1>
      <p class="text-sm text-gray-400 mb-5">{{ currentStaff.role }} {{ currentStaff.startDate ? '・' + currentStaff.startDate + ' 入社' : '' }}</p>

      <div class="space-y-3">
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
          <!-- 評価基準ヒント -->
          <div v-if="currentEvals[item.id] && currentEvals[item.id].officialScore" class="mt-2 text-xs text-gray-400 italic">
            {{ item.criteria[currentEvals[item.id].officialScore] }}
          </div>
        </div>
      </div>
    </template>

    <!-- ============ 評価入力フォーム ============ -->
    <template v-else-if="route.name === 'input' && inputStaff && inputItem">
      <button @click="navigate('#/staff/' + inputStaff.id)" class="text-green-600 hover:underline text-sm mb-3 block">
        ← {{ inputStaff.name }} の評価一覧に戻る
      </button>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div class="mb-5">
          <p class="text-xs text-gray-400 mb-1">{{ inputStaff.name }} / {{ inputStaff.role }}</p>
          <h2 class="text-lg font-bold text-gray-800">{{ inputItem.id }}. {{ inputItem.name }}</h2>
          <p class="text-xs text-green-600 mt-1">📖 参照: {{ inputItem.bookRef }}</p>
          <p class="text-xs text-gray-400">章: {{ inputItem.bookChapter }}</p>
        </div>

        <!-- 保存完了 -->
        <div v-if="inputSaved" class="mb-4 bg-green-50 border border-green-200 text-green-700 rounded p-3 text-sm">
          ✅ 保存しました。
        </div>

        <form @submit.prevent="submitForm" class="space-y-5">

          <!-- ステップ1: ブック確認 -->
          <div class="section-card">
            <p class="section-title">STEP 1. イーストンブック確認</p>
            <label class="check-label">
              <input type="checkbox" v-model="inputForm.bookConfirmed" class="check-input">
              <span>該当ページ（{{ inputItem.bookRef }}）を本人と一緒に確認した</span>
            </label>
            <p v-if="!inputForm.bookConfirmed" class="text-xs text-orange-500 mt-2">
              ⚠ ブック未確認の場合、正式評価は最大2に制限されます
            </p>
          </div>

          <!-- 教示日・教示者 -->
          <div class="section-card">
            <p class="section-title">教示情報</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-text">教示日</label>
                <input type="date" v-model="inputForm.teachingDate" class="form-input">
              </div>
              <div>
                <label class="label-text">教示者</label>
                <input type="text" v-model="inputForm.teacher" placeholder="名前を入力" class="form-input">
              </div>
            </div>
          </div>

          <!-- ステップ2: 理解確認 -->
          <div class="section-card">
            <p class="section-title">STEP 2. 理解確認</p>
            <label class="check-label">
              <input type="checkbox" v-model="inputForm.understandingConfirmed" class="check-input">
              <span>本人が目的・手順・注意点を自分の言葉で説明できた</span>
            </label>
          </div>

          <!-- ステップ3: 実技確認 -->
          <div class="section-card">
            <p class="section-title">STEP 3. 実技確認</p>
            <label class="check-label">
              <input type="checkbox" v-model="inputForm.practicalConfirmed" class="check-input">
              <span>実際の営業またはロープレで実施できた</span>
            </label>
          </div>

          <!-- 正式評価 -->
          <div class="section-card">
            <p class="section-title">正式評価</p>
            <div class="space-y-2">
              <label v-for="opt in scoreOptions" :key="opt.value"
                :class="['score-option', opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-green-50']"
                :title="opt.disabled ? 'ブック確認・理解確認・実技確認が完了してから選択できます' : ''">
                <input type="radio" :value="opt.value" v-model="inputForm.officialScore"
                  :disabled="opt.disabled" class="mr-2">
                <div>
                  <span class="font-medium">{{ opt.label }}</span>
                  <p class="text-xs text-gray-400 mt-0.5">{{ inputItem.criteria[opt.value] }}</p>
                </div>
              </label>
            </div>
            <p v-if="maxScore < 4" class="text-xs text-orange-500 mt-2">
              ⚠ 現在の最大評価: {{ maxScore }}（前提条件を満たすと3・4が選択可能になります）
            </p>
          </div>

          <!-- コメント -->
          <div class="section-card">
            <p class="section-title">コメント</p>
            <textarea v-model="inputForm.comment" rows="3"
              placeholder="良かった点・次の課題・特記事項など"
              class="form-input resize-none"></textarea>
          </div>

          <!-- 保存ボタン -->
          <button type="submit" :disabled="inputSaving"
            class="w-full btn-primary py-3 text-base disabled:opacity-50">
            {{ inputSaving ? '保存中...' : '💾 保存する' }}
          </button>
        </form>
      </div>
    </template>

    <!-- ============ スキルマップ ============ -->
    <template v-else-if="route.name === 'skills'">
      <h1 class="text-xl font-bold text-gray-700 mb-4">スキルマップ</h1>
      <div class="mb-3 flex gap-3 text-xs flex-wrap">
        <span class="badge-teach">教えられる（4）</span>
        <span class="badge-ok">基準内（3）</span>
        <span class="badge-progress">進行中（1-2）</span>
        <span class="badge-none">未教示（-）</span>
      </div>
      <div class="overflow-x-auto">
        <table class="skill-table">
          <thead>
            <tr>
              <th class="skill-th-name">スタッフ</th>
              <th v-for="item in EVALUATION_ITEMS" :key="item.id" class="skill-th-item" :title="item.name">
                <span class="skill-item-label">{{ item.id }}<br>{{ item.name.slice(0, 4) }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in skillStaffList" :key="s.id" class="hover:bg-gray-50 cursor-pointer"
              @click="navigate('#/staff/' + s.id)">
              <td class="skill-td-name">{{ s.name }}</td>
              <td v-for="item in EVALUATION_ITEMS" :key="item.id" class="skill-td-cell">
                <div v-if="skillEvals[s.id] && skillEvals[s.id][item.id] && skillEvals[s.id][item.id].officialScore"
                  :class="['skill-cell', skillCellClass(skillEvals[s.id][item.id])]">
                  {{ skillEvals[s.id][item.id].officialScore }}
                </div>
                <div v-else class="skill-cell skill-cell-none">-</div>
              </td>
            </tr>
            <tr v-if="skillStaffList.length === 0">
              <td :colspan="EVALUATION_ITEMS.length + 1" class="text-center py-8 text-gray-400">スタッフが登録されていません</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ============ スタッフ追加 ============ -->
    <template v-else-if="route.name === 'staff-add'">
      <button @click="navigate('#/')" class="text-green-600 hover:underline text-sm mb-3 block">← 一覧に戻る</button>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-md">
        <h2 class="text-lg font-bold text-gray-800 mb-5">スタッフを追加</h2>
        <div v-if="staffAddError" class="mb-3 text-red-500 text-sm">{{ staffAddError }}</div>
        <form @submit.prevent="addStaff" class="space-y-4">
          <div>
            <label class="label-text">名前 <span class="text-red-500">*</span></label>
            <input type="text" v-model="newStaffForm.name" placeholder="山田 太郎" class="form-input">
          </div>
          <div>
            <label class="label-text">役割</label>
            <select v-model="newStaffForm.role" class="form-input">
              <option>ホール</option>
              <option>キッチン</option>
              <option>ホール・キッチン兼務</option>
              <option>店長</option>
              <option>副店長</option>
              <option>アルバイト</option>
            </select>
          </div>
          <div>
            <label class="label-text">入社日</label>
            <input type="date" v-model="newStaffForm.startDate" class="form-input">
          </div>
          <button type="submit" :disabled="staffAdding" class="w-full btn-primary py-3 disabled:opacity-50">
            {{ staffAdding ? '追加中...' : '追加する' }}
          </button>
        </form>
      </div>
    </template>

    <!-- ============ CSVインポート ============ -->
    <template v-else-if="route.name === 'import'">
      <button @click="navigate('#/')" class="text-green-600 hover:underline text-sm mb-3 block">← 一覧に戻る</button>
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 max-w-2xl">
        <h2 class="text-lg font-bold text-gray-800 mb-1">従業員名簿CSVから一括登録</h2>
        <p class="text-xs text-gray-400 mb-4">タイミー・退店済みスタッフは自動で除外されます</p>

        <div v-if="csvError" class="mb-3 text-red-500 text-sm">{{ csvError }}</div>

        <div v-if="csvPreview.length === 0" class="section-card">
          <label class="block cursor-pointer">
            <p class="section-title mb-2">CSVファイルを選択</p>
            <input type="file" accept=".csv" @change="onCsvFile" class="form-input">
          </label>
        </div>

        <template v-else>
          <div class="flex items-center justify-between mb-3">
            <p class="text-sm text-gray-600">{{ csvPreview.filter(r=>r.selected).length }}名を登録します</p>
            <label class="text-xs text-gray-400 cursor-pointer">
              <input type="checkbox" @change="e => csvPreview.forEach(r => r.selected = e.target.checked)" checked class="mr-1">
              全選択
            </label>
          </div>
          <div class="border border-gray-200 rounded-lg overflow-hidden mb-4">
            <table class="w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="p-2 w-8"></th>
                  <th class="p-2 text-left">名前</th>
                  <th class="p-2 text-left">雇用形態</th>
                  <th class="p-2 text-left">入店日</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in csvPreview" :key="i"
                  :class="['border-t border-gray-100', row.selected ? '' : 'opacity-40']">
                  <td class="p-2 text-center">
                    <input type="checkbox" v-model="row.selected">
                  </td>
                  <td class="p-2 font-medium">{{ row.name }}</td>
                  <td class="p-2 text-gray-500">{{ row.role }}</td>
                  <td class="p-2 text-gray-500">{{ row.startDate }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex gap-3">
            <button @click="csvPreview = []" class="flex-1 border border-gray-300 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
              やり直す
            </button>
            <button @click="importCsv" :disabled="csvImporting || csvPreview.filter(r=>r.selected).length === 0"
              class="flex-1 btn-primary py-2 disabled:opacity-50">
              {{ csvImporting ? csvImportDone + '名登録中...' : '登録する' }}
            </button>
          </div>
        </template>
      </div>
    </template>

  </main>
</div>
  `,

  methods: {
    skillCellClass(ev) {
      if (!ev || !ev.officialScore) return 'skill-cell-none'
      if (ev.officialScore >= 4) return 'skill-cell-teach'
      if (ev.officialScore >= 3) return 'skill-cell-ok'
      return 'skill-cell-progress'
    }
  }
}).mount('#app')
