const EVALUATION_ITEMS = [
  {
    id: '01',
    name: '元気・笑顔・挨拶',
    bookRef: '「笑顔と挨拶」「5大マスト」',
    bookChapter: '1.イーストンで働くにあたって / 3.接客',
    criteria: {
      1: 'イーストンブックの「笑顔と挨拶」「5大マスト」を確認し、元気・笑顔・挨拶が接客の土台であることを教わっている。',
      2: 'なぜ笑顔と挨拶が必要かを説明でき、入店・退店・スタッフ間の挨拶を意識して実施できる。',
      3: '通常営業で、お客様・仲間に対して明るい声、笑顔、目線のある挨拶を安定して実施できる。',
      4: '忙しい時間帯でも笑顔と挨拶を崩さず、周囲にも良い挨拶を促し、店内の空気を明るくできる。'
    }
  },
  {
    id: '02',
    name: '言葉遣い',
    bookRef: '「言葉遣い」「接客7大用語」',
    bookChapter: '1.イーストンで働くにあたって / 3.接客',
    criteria: {
      1: 'イーストンブックの「言葉遣い」「接客7大用語」を確認し、NGワードと正しい言い方を教わっている。',
      2: '接客7大用語や基本敬語を説明でき、練習では正しい言葉遣いができる。',
      3: '通常営業で、タメ口・雑な返事・NGワードを出さず、丁寧な言葉遣いで接客できる。',
      4: '後輩の言葉遣いの乱れに気づき、イーストンブックを使って具体的に修正指導できる。'
    }
  },
  {
    id: '03',
    name: 'アイコンタクト',
    bookRef: '「接客の基本」',
    bookChapter: '3.接客',
    criteria: {
      1: 'アイコンタクトの該当ページを確認し、安心感・意思疎通につながることを教わっている。',
      2: 'アイコンタクトの目的を説明でき、ロープレや落ち着いた場面で目線を合わせて対応できる。',
      3: '入店、注文、提供、会計、お見送りの場面で自然に目線を合わせて対応できる。',
      4: '複数名のテーブルや繁忙時でも目線配りができ、後輩に良い例・悪い例を見せて教えられる。'
    }
  },
  {
    id: '04',
    name: 'オーバーリアクション',
    bookRef: '「お客様に呼ばれたら」「5大マスト」',
    bookChapter: '3.接客',
    criteria: {
      1: 'オーバーリアクションの該当ページを確認し、「お客様に伝わる反応」が必要な理由を教わっている。',
      2: '呼ばれた時に、声・表情・手振りで反応する意味を説明でき、練習では実施できる。',
      3: '通常営業で「はい、ただいま伺います」と声・表情・動作でお客様に伝わる反応ができる。',
      4: '忙しい営業中でも反応が小さくならず、周囲にも即反応を促し、対応漏れを防げる。'
    }
  },
  {
    id: '05',
    name: '優先順位判断',
    bookRef: '「優先順位」',
    bookChapter: '3.接客',
    criteria: {
      1: '「優先順位」の該当ページを確認し、料理提供・入店対応・レジ・呼ばれているお客様などの基本順位を教わっている。',
      2: '基本の優先順位を説明でき、落ち着いた営業では判断して動ける。',
      3: '通常営業で、温かい料理提供、入店対応、呼ばれ対応などを状況に応じて正しく優先できる。',
      4: '複数業務が重なった時も、遅れ・不満・事故リスクを考えて優先順位を判断し、周囲へ依頼・指示できる。'
    }
  },
  {
    id: '06',
    name: 'お客様に呼ばれた時の対応',
    bookRef: '「お客様に呼ばれたら」',
    bookChapter: '3.接客',
    criteria: {
      1: '「お客様に呼ばれたら」の該当ページを確認し、返事・確認・引き継ぎの基本を教わっている。',
      2: '呼ばれた時の基本対応を説明でき、自分でできない場合に誰へ引き継ぐか理解している。',
      3: '通常営業で、すぐ返事をし、要望を確認し、自分でできない内容は卓番・内容つきで正しく引き継げる。',
      4: '提供中・繁忙時でもお客様を不安にさせず、対応順を整理し、周囲と連携して対応漏れを防げる。'
    }
  },
  {
    id: '07',
    name: '安心・安全な作業',
    bookRef: '「立ち方」「歩き方」「お皿の持ち方」「グラスの持ち方」「トレンチの持ち方」「テーブルへの入り方」',
    bookChapter: '3.接客',
    criteria: {
      1: '立ち方、歩き方、皿・グラス・トレンチ、テーブルへの入り方の該当ページを確認し、安全作業の目的を教わっている。',
      2: '基本動作のポイントを説明でき、練習では安全に実施できる。',
      3: '通常営業で、姿勢・歩き方・持ち方・置き方を基準通りに行い、お客様に不安を与えず作業できる。',
      4: '繁忙時でも雑にならず、安全・丁寧・スピードを両立し、後輩の危険な動作を修正できる。'
    }
  },
  {
    id: '08',
    name: '商品提供',
    bookRef: '「商品提供」「オーダーテイク」',
    bookChapter: '3.接客',
    criteria: {
      1: '「商品提供」および関連する伝票・提供確認の基準を確認し、教わっている。',
      2: '卓番、商品名、提供時の声かけ、安全確認の流れを説明でき、練習では実施できる。',
      3: '通常営業で、卓番・商品・向き・置く位置・声かけを確認し、正しく商品提供できる。',
      4: '料理の温度感、テーブル状況、お客様の会話を見ながら、満足度を高める提供ができ、後輩に教えられる。'
    }
  },
  {
    id: '09',
    name: 'メニュー説明・おすすめ',
    bookRef: '「メニュー説明」',
    bookChapter: '3.接客',
    criteria: {
      1: '「メニュー説明」の該当ページを確認し、説明時の目的・基本手順を教わっている。',
      2: '主力商品の特徴、味、量感、辛さ、シェア向きかを説明できる。',
      3: '通常営業で、お客様の質問に対して分かりやすく説明し、必要に応じておすすめができる。',
      4: '人数・好み・利用シーンに合わせて、前菜・パスタ・ピッツァ・ドリンクなどを組み合わせて提案でき、後輩にも説明方法を教えられる。'
    }
  },
  {
    id: '10',
    name: '中間サービス・テーブルケア',
    bookRef: '「中間サービス」「プレバッシング」「水の注ぎ方」',
    bookChapter: '3.接客',
    criteria: {
      1: '「中間サービス」「プレバッシング」「水の注ぎ方」などの該当ページを確認し、テーブルケアの目的を教わっている。',
      2: '空皿、水、取り皿、グラス、追加注文の確認ポイントを説明でき、練習では声かけできる。',
      3: '通常営業で、言われる前にテーブル状態に気づき、確認してから下げもの・水差し・取り皿提供ができる。',
      4: 'お客様の食事ペースや会話を邪魔せず、自然なタイミングでケアし、後輩に気づき方を教えられる。'
    }
  },
  {
    id: '11',
    name: 'キッチン・ホール連携',
    bookRef: '「オーダー読み上げ、伝票取扱い」「満席・ウェイティング発生時の対応」',
    bookChapter: '3.接客',
    criteria: {
      1: 'オーダー読み上げ、伝票取扱い、商品提供、満席対応など、連携に関わる該当ページを確認し、報連相の必要性を教わっている。',
      2: '料理遅れ、変更、アレルギー、急ぎ、下げ状況など、共有すべき内容を説明できる。',
      3: '通常営業で、必要な情報をホール・キッチン双方に正確に共有し、提供ミスや伝達漏れを防げる。',
      4: '繁忙時にホール状況とキッチン状況をつなぎ、優先順位や提供順を考えて周囲へ声かけ・依頼ができる。'
    }
  },
  {
    id: '12',
    name: '3S・VOEにつながる行動',
    bookRef: '「イーストンの接客「3S」の理解」「5大マストの徹底」「VOEカード」',
    bookChapter: '1.イーストンで働くにあたって / 3.接客',
    criteria: {
      1: '3S、5大マスト、VOEカードの考え方を確認し、イーストンが目指す接客のゴールを教わっている。',
      2: 'Smile・Special・Surpriseの意味と、VOEに沿った行動例を説明できる。',
      3: '通常営業で、笑顔・基本接客を土台に、お客様や仲間に配慮した行動ができる。',
      4: 'お客様に合わせた＋α行動や、仲間を助ける行動を自ら実践し、後輩にもVOEに沿って教えられる。'
    }
  }
]

// ============================================================
// PHASEチェック表アイテムマスタ（PHASE 0〜5 全99項目）
// refType: 'book'=📖イーストンブック / 'video'=🎬動画マニュアル /
//          'roleplay'=🎭ロープレ合格 / 'test'=📝テスト合格 / 'none'=確認なし
// ============================================================
const PHASE_ITEMS = [
  // ── PHASE 0: オリエンテーション（初出勤前）──────────────────
  { id: 'P0-01', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '書類・契約', name: '雇用契約書・必要書類の手続き完了', passCriteria: '─', refType: 'none' },
  { id: 'P0-02', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '書類・契約', name: '社内アプリ登録（MSナビ／らくしふ／TUNAG）', passCriteria: '─', refType: 'none' },
  { id: 'P0-03', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '書類・契約', name: '制服サイズ確認・黒スキニー・靴の準備案内', passCriteria: '─', refType: 'none' },
  { id: 'P0-04', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '理念', name: '会社概要・社名の由来・経営理念・VOEを理解している', passCriteria: '穴埋めシートで確認', refType: 'book' },
  { id: 'P0-05', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '理念', name: 'QSC（Quality/Service/Cleanliness）の3要素を説明できる', passCriteria: '─', refType: 'book' },
  { id: 'P0-06', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '理念', name: '接客7大用語を全て暗唱できる', passCriteria: '7つ全て言えたらOK', refType: 'book' },
  { id: 'P0-07', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: '身だしなみ8項目を説明できる（ヘア・爪・匂い・制服etc.）', passCriteria: '─', refType: 'book' },
  { id: 'P0-08', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: '衛生管理・1分衛生手洗いの手順が分かる', passCriteria: '実演させる', refType: 'none' },
  { id: 'P0-09', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: '1日の勤務の流れ（出勤打刻〜退勤）を理解している', passCriteria: '─', refType: 'none' },
  { id: 'P0-10', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: 'SNS禁止事項・炎上リスクを理解している', passCriteria: '─', refType: 'none' },
  { id: 'P0-11', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: 'マルシー対応3つの基本・サイレントコンプレイナーを理解している', passCriteria: '─', refType: 'book' },
  { id: 'P0-12', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: 'ルール', name: '陰語（1番・マルシー）を理解している', passCriteria: '─', refType: 'none' },
  { id: 'P0-13', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '準備', name: '黒スキニー・黒系の靴を準備している', passCriteria: '─', refType: 'none' },
  { id: 'P0-14', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '準備', name: 'メモ帳・ボールペンを用意している', passCriteria: '─', refType: 'none' },
  { id: 'P0-15', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '準備', name: '商品マニュアル・動画マニュアルを確認している', passCriteria: '─', refType: 'video' },
  { id: 'P0-16', phase: 0, phaseLabel: 'オリエンテーション（初出勤前）', category: '準備', name: '卓番表を見てご案内テストに合格している', passCriteria: '卓番テスト合格', refType: 'test' },
  // ── PHASE 1: 初出勤の流れ（1〜3日目）────────────────────────
  { id: 'P1-01', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '初日', name: '出勤 → 初めて会うスタッフ全員に自己紹介をする', passCriteria: '─', refType: 'none' },
  { id: 'P1-02', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '基本ルール', name: '勤怠打刻の方法を覚える', passCriteria: '3日目までに確認テスト', refType: 'none' },
  { id: 'P1-03', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '身だしなみ', name: '正しい身だしなみの確認（爪・靴下・エプロンなど）', passCriteria: '指摘ゼロで3出勤', refType: 'none' },
  { id: 'P1-04', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '衛生', name: '正しい手洗いを実践できる（1分衛生手洗い）', passCriteria: '─', refType: 'none' },
  { id: 'P1-05', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '店内把握', name: 'フロア名・ポジション名・卓番を覚える', passCriteria: '3日目に確認テスト実施', refType: 'test' },
  { id: 'P1-06', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: '設備・備品', name: '名前と場所を覚える（ステーション・ダスター・アクアなど）', passCriteria: '─', refType: 'none' },
  { id: 'P1-07', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: 'FB・目標', name: 'FBシートの目標設定の仕方・振り返りのルールを覚える', passCriteria: '─', refType: 'none' },
  { id: 'P1-08', phase: 1, phaseLabel: '初出勤の流れ（1〜3日目）', category: 'TUNAG', name: 'TUNAGの使い方・確認方法を覚える', passCriteria: '─', refType: 'none' },
  // ── PHASE 2: 基本動作・基本知識────────────────────────────────
  { id: 'P2-01', phase: 2, phaseLabel: '基本動作・基本知識', category: '接客4大行動', name: '笑顔 — 常に口角を上げ、お客様に安心感を与える', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-02', phase: 2, phaseLabel: '基本動作・基本知識', category: '接客4大行動', name: 'アイコンタクト — お客様の目を見て話す・聞く', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-03', phase: 2, phaseLabel: '基本動作・基本知識', category: '接客4大行動', name: '明るい声 — 元気でハキハキとした声で接客する', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-04', phase: 2, phaseLabel: '基本動作・基本知識', category: '接客4大行動', name: 'オーバーアクション — 大きなリアクション・ジェスチャーで伝える', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-05', phase: 2, phaseLabel: '基本動作・基本知識', category: '挨拶', name: 'スタンダードな挨拶・返事をロープレで実践できる', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-06', phase: 2, phaseLabel: '基本動作・基本知識', category: '挨拶', name: 'お客様に返してもらえる挨拶をする「こんばんは！」', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P2-07', phase: 2, phaseLabel: '基本動作・基本知識', category: '接客7大用語', name: '接客7大用語を場面に合わせて自然に使える', passCriteria: '全7つ使えたらOK', refType: 'book' },
  { id: 'P2-08', phase: 2, phaseLabel: '基本動作・基本知識', category: 'ストップザモーション', name: 'テーブルに近づく際に一呼吸おいて立ち止まれる', passCriteria: 'TR確認3回連続OK', refType: 'none' },
  { id: 'P2-09', phase: 2, phaseLabel: '基本動作・基本知識', category: '返事', name: '呼ばれたらハキハキと返事をする（語尾に小さい「っ」）', passCriteria: '手を挙げて返事ができる', refType: 'none' },
  { id: 'P2-10', phase: 2, phaseLabel: '基本動作・基本知識', category: '返事', name: 'お客様に笑顔で返事をする', passCriteria: '─', refType: 'none' },
  { id: 'P2-11', phase: 2, phaseLabel: '基本動作・基本知識', category: 'ロープレ', name: '「少々お待ちくださいませ」を申し訳なさそうに言える', passCriteria: 'ロープレでOK', refType: 'roleplay' },
  { id: 'P2-12', phase: 2, phaseLabel: '基本動作・基本知識', category: '声掛け', name: '「○卓プロントです」など基本の声掛けフレーズが使える', passCriteria: '声掛けリスト5種以上', refType: 'none' },
  { id: 'P2-13', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本動作', name: '正しい立ち方・歩き方（5m 3.5秒・猫背NG・体はお客様向き）', passCriteria: 'TR確認3回連続OK', refType: 'none' },
  { id: 'P2-14', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本動作', name: '提供時のテーブルへの入り方は90度', passCriteria: '─', refType: 'none' },
  { id: 'P2-15', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本動作', name: 'お皿・シルバー拭き・シルバー組みは姿勢と視線をお客様に向ける', passCriteria: '─', refType: 'none' },
  { id: 'P2-16', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本動作', name: '洗い場の整理整頓・まとめてバッシング下げ物を行う', passCriteria: '─', refType: 'none' },
  { id: 'P2-17', phase: 2, phaseLabel: '基本動作・基本知識', category: 'ハウスルール', name: '勤怠登録・WS表の使い方を完全に覚えている', passCriteria: '─', refType: 'none' },
  { id: 'P2-18', phase: 2, phaseLabel: '基本動作・基本知識', category: 'ハウスルール', name: 'パントリーの使い方・定位置管理を理解している', passCriteria: '─', refType: 'none' },
  { id: 'P2-19', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本知識', name: 'グラスの持ち方・置き方を正しく理解している', passCriteria: '─', refType: 'video' },
  { id: 'P2-20', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本知識', name: 'お皿の持ち方・置き方を正しく理解している', passCriteria: '─', refType: 'video' },
  { id: 'P2-21', phase: 2, phaseLabel: '基本動作・基本知識', category: '基本知識', name: 'トレンチの持ち方・ルールを理解している', passCriteria: '─', refType: 'video' },
  // ── PHASE 3: ランナー業務習得──────────────────────────────────
  { id: 'P3-01', phase: 3, phaseLabel: 'ランナー業務習得', category: 'バッシング', name: 'テーブル・椅子・床、完璧な3ステップバッシングを行う', passCriteria: '─', refType: 'none' },
  { id: 'P3-02', phase: 3, phaseLabel: 'ランナー業務習得', category: 'バッシング', name: '2名テーブルのバッシングを1分以内に完了できる', passCriteria: 'タイムアタック計測', refType: 'none' },
  { id: 'P3-03', phase: 3, phaseLabel: 'ランナー業務習得', category: 'テーブルケア', name: 'プレバッシングへの気づきが1出勤3回以上できる', passCriteria: '回数をカウント', refType: 'none' },
  { id: 'P3-04', phase: 3, phaseLabel: 'ランナー業務習得', category: 'テーブルケア', name: 'プレバッシング時に感じの良い声掛けができる', passCriteria: 'ロープレ確認', refType: 'roleplay' },
  { id: 'P3-05', phase: 3, phaseLabel: 'ランナー業務習得', category: '連携', name: 'ステーションケアを徹底する（下げ物・取り皿・シルバー補充）', passCriteria: '─', refType: 'none' },
  { id: 'P3-06', phase: 3, phaseLabel: 'ランナー業務習得', category: '連携', name: 'デシャップからの配膳を10秒以内に行う', passCriteria: '3出勤連続クリア', refType: 'none' },
  { id: 'P3-07', phase: 3, phaseLabel: 'ランナー業務習得', category: '商品提供', name: '提供時に正式名称で伝えられる', passCriteria: '10品連続OKが基準', refType: 'none' },
  { id: 'P3-08', phase: 3, phaseLabel: 'ランナー業務習得', category: '商品提供', name: '商品名＋αで食べ方や産地を伝えられる', passCriteria: 'Rパルマの説明など', refType: 'none' },
  { id: 'P3-09', phase: 3, phaseLabel: 'ランナー業務習得', category: '商品提供', name: 'お皿の3枚持ちができる', passCriteria: 'TR確認でOK', refType: 'none' },
  { id: 'P3-10', phase: 3, phaseLabel: 'ランナー業務習得', category: 'アクア・ドリンク', name: 'グラスの3個持ちができる', passCriteria: 'TR確認でOK', refType: 'none' },
  { id: 'P3-11', phase: 3, phaseLabel: 'ランナー業務習得', category: 'アクア・ドリンク', name: 'ピッチャーの持ち方でアクアを呼ばれる前に提供できる', passCriteria: '─', refType: 'none' },
  { id: 'P3-12', phase: 3, phaseLabel: 'ランナー業務習得', category: 'アクア・ドリンク', name: 'ファーストドリンクを着席3分以内に届けられる', passCriteria: '3出勤連続クリア', refType: 'none' },
  { id: 'P3-13', phase: 3, phaseLabel: 'ランナー業務習得', category: '1way2job', name: '1way2job（提供→プレバッシング）を理解して実践できる', passCriteria: '1出勤で3回以上確認', refType: 'none' },
  { id: 'P3-14', phase: 3, phaseLabel: 'ランナー業務習得', category: '1way2job', name: '1way2job（提供→追加セールス）を実践できる', passCriteria: '1出勤で3回以上確認', refType: 'none' },
  { id: 'P3-15', phase: 3, phaseLabel: 'ランナー業務習得', category: '優先順位', name: '優先順位の基本（提供最優先）を理解して動ける', passCriteria: '─', refType: 'none' },
  { id: 'P3-16', phase: 3, phaseLabel: 'ランナー業務習得', category: '追加セールス', name: 'ドリンクお代わりのお伺いが1出勤3回以上できる', passCriteria: '回数カウント', refType: 'none' },
  { id: 'P3-16b', phase: 3, phaseLabel: 'ランナー業務習得', category: '追加セールス', name: 'アフタードルチェのおすすめが1出勤1回以上できる', passCriteria: '─', refType: 'none' },
  { id: 'P3-17', phase: 3, phaseLabel: 'ランナー業務習得', category: 'テーブルケア', name: 'アフター管理100%（お客様から言われる前に）できる', passCriteria: '─', refType: 'none' },
  { id: 'P3-18', phase: 3, phaseLabel: 'ランナー業務習得', category: 'テーブルケア', name: '感想伺いを1出勤1回以上実践できる', passCriteria: '─', refType: 'none' },
  { id: 'P3-19', phase: 3, phaseLabel: 'ランナー業務習得', category: '商品知識テスト', name: '商品名（正式名称）テスト 90点以上', passCriteria: 'TR実施・合格証', refType: 'test' },
  { id: 'P3-20', phase: 3, phaseLabel: 'ランナー業務習得', category: '商品知識テスト', name: '商品名（通し名）テスト 90点以上', passCriteria: 'TR実施・合格証', refType: 'test' },
  // ── PHASE 4: ホール基本業務（ウエイター①）───────────────────
  { id: 'P4-01', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'メニュー説明', name: '元気なメニュー説明（隣のテーブルに聞こえる声）ができる', passCriteria: '─', refType: 'none' },
  { id: 'P4-02', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'メニュー説明', name: '新規のお客様バージョンのメニュー説明ができる', passCriteria: 'ロープレ合格', refType: 'roleplay' },
  { id: 'P4-03', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'メニュー説明', name: '常連様バージョンのメニュー説明・名前呼びができる', passCriteria: 'ロープレ合格', refType: 'roleplay' },
  { id: 'P4-04', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'メニュー説明', name: '期間限定メニューや北海道産こだわりを伝えられる', passCriteria: '─', refType: 'none' },
  { id: 'P4-05', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ウェルカム', name: 'ウェルカムシャワー（お客様1人に1回以上挨拶）を徹底できる', passCriteria: '3出勤連続確認', refType: 'none' },
  { id: 'P4-06', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ウェルカム', name: 'ジェスチャーで「何名様ですか？」を伝えられる', passCriteria: '─', refType: 'none' },
  { id: 'P4-07', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'オーダー', name: 'ハンディ操作でお客様と目を合わせてオーダーを取れる', passCriteria: 'ミスなく1テーブル完結', refType: 'none' },
  { id: 'P4-08', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'オーダー', name: '常に目配りをしていてお客様に大声で呼ばれない', passCriteria: '─', refType: 'none' },
  { id: 'P4-09', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'オーダー', name: 'おすすめしてご注文を頂ける', passCriteria: '1出勤1件以上', refType: 'none' },
  { id: 'P4-10', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'オーダー', name: '取り皿の必要な卓に適切なタイミングで提供できる', passCriteria: '─', refType: 'none' },
  { id: 'P4-11', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ラウンド', name: '一か所に留まらず常にホールを見渡して優先順位で動ける', passCriteria: '3出勤連続確認', refType: 'none' },
  { id: 'P4-12', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ラウンド', name: '伝票確認「ご注文の品は以上ですが〜」を漏れなくできる', passCriteria: '1出勤ゼロ漏れ', refType: 'none' },
  { id: 'P4-13', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ラウンド', name: '1way3job（提供→プレバッシング＆追加セールス→ラウンド）ができる', passCriteria: '─', refType: 'none' },
  { id: 'P4-14', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: 'ボトルワイン', name: 'ボトルワインの提供・抜栓ができる', passCriteria: 'TR確認でOK', refType: 'video' },
  { id: 'P4-15', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '販促', name: 'LINE友達登録を1出勤1名以上獲得できる', passCriteria: '回数カウント', refType: 'none' },
  { id: 'P4-16', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '販促', name: '感想伺いから口コミをお願いできる', passCriteria: '1出勤1件以上', refType: 'none' },
  { id: 'P4-17', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '販促', name: 'パーキャン・名刺配布で次回来店アプローチができる', passCriteria: '1出勤全卓チャレンジ', refType: 'none' },
  { id: 'P4-18', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '販促', name: 'お客様に合った言葉を添えたお見送りができる', passCriteria: 'ドアの外まで', refType: 'none' },
  { id: 'P4-19', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '商品知識Lv.1', name: '商品知識テストLv.1 合格', passCriteria: 'TR実施・合格証', refType: 'test' },
  { id: 'P4-20', phase: 4, phaseLabel: 'ホール基本業務（ウエイター①）', category: '動画ロープレ', name: '来店確認〜コンセプト説明〜メニュー説明〜おすすめ〜LINEの通し動画ロープレ合格', passCriteria: 'TR確認', refType: 'roleplay' },
  // ── PHASE 5: フロント・応用業務（ウエイター②・フロント）─────
  { id: 'P5-01', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: '最高の笑顔でお出迎え・5秒以内に気づいて対応できる', passCriteria: '─', refType: 'none' },
  { id: 'P5-02', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: 'ジェスチャー・FLコンタクト・ストップザモーションを統合できる', passCriteria: 'ロープレ合格', refType: 'roleplay' },
  { id: 'P5-03', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: '店内状況を把握して的確な配席・リザーブセットができる', passCriteria: 'TR同席3組連続OK', refType: 'none' },
  { id: 'P5-04', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: 'ウェイティングケアでお客様を帰さない対応ができる', passCriteria: '─', refType: 'none' },
  { id: 'P5-05', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: '予約のお客様の名前を呼んでメニュー説明ができる', passCriteria: '─', refType: 'none' },
  { id: 'P5-06', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: 'お子様対応（イス・食器・声掛け）・段差声掛けができる', passCriteria: '─', refType: 'none' },
  { id: 'P5-07', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'フロント', name: 'バーニョ（お手洗い）を分かりやすく案内できる', passCriteria: '─', refType: 'none' },
  { id: 'P5-08', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'レジ', name: 'レジの基本操作・万券チェック・スタンプができる', passCriteria: 'ミスゼロ3回', refType: 'none' },
  { id: 'P5-09', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'レジ', name: '正しいお見送り（ドアの外まで）ができる', passCriteria: '─', refType: 'none' },
  { id: 'P5-10', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'レジ', name: 'Pカード・チラシで次回来店アプローチができる', passCriteria: '1出勤1名以上', refType: 'none' },
  { id: 'P5-11', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: '電話対応', name: 'はきはきと明るい声で電話対応・予約受付ができる', passCriteria: '─', refType: 'none' },
  { id: 'P5-12', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: 'マルシー', name: 'バッドニュースファーストでお詫び・責任者報告ができる', passCriteria: 'ロープレ合格', refType: 'roleplay' },
  { id: 'P5-13', phase: 5, phaseLabel: 'フロント・応用業務（ウエイター②・フロント）', category: '商品知識Lv.2', name: '商品知識テストLv.2 合格', passCriteria: 'TR実施・合格証', refType: 'test' },
]

// PHASEを番号でグループ化したマスタ（0〜5）
const PHASE_GROUPS = [0, 1, 2, 3, 4, 5].map(p => ({
  phase: p,
  label: PHASE_ITEMS.find(i => i.phase === p)?.phaseLabel || `PHASE ${p}`,
  items: PHASE_ITEMS.filter(i => i.phase === p)
}))
