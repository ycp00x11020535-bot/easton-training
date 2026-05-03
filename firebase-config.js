// ============================================================
// Firebaseの設定ファイル
// ============================================================
// 使い方:
// 1. https://console.firebase.google.com/ でプロジェクトを作成
// 2. 「ウェブアプリを追加」からアプリを登録
// 3. 表示された firebaseConfig の値を下記に貼り付ける
// 4. Firestoreデータベースを作成（テストモードで開始でOK）
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyDPen_JEjnIhuzs2ZPS5wj2iuD8cqSndJw",
  authDomain: "training-system-41408.firebaseapp.com",
  projectId: "training-system-41408",
  storageBucket: "training-system-41408.firebasestorage.app",
  messagingSenderId: "59085024563",
  appId: "1:59085024563:web:3becd864a9ceafe23ba246",
  measurementId: "G-FKTQ5LMZVB"
}

// Firebaseを初期化
firebase.initializeApp(firebaseConfig)

// Firestoreのインスタンスをグローバルに公開
const db = firebase.firestore()

// オフラインキャッシュを有効化（一度読み込んだデータはオフラインでも表示できる）
db.enablePersistence().catch(() => {})
