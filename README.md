# イーストン トレーニング管理システム

店舗スタッフの育成状況をイーストンブック基準で管理するWebアプリです。

## 機能

- **ダッシュボード**: スタッフ一覧と育成進捗バー
- **スタッフ詳細**: 12評価項目の現在状況と教示履歴
- **評価入力**: ブック確認→理解確認→実技確認→正式評価の順に入力（前提未完了で3以上は選択不可）
- **スキルマップ**: スタッフ×スキルのグリッド一覧

## セットアップ手順

### 1. Firebase プロジェクトを作成

1. https://console.firebase.google.com/ にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名（例: `easton-training`）を入力して作成
4. Googleアナリティクスは「有効にしない」でOK

### 2. Firestoreデータベースを作成

1. 左メニューの「Firestore Database」→「データベースの作成」
2. **テストモードで開始**を選択（開発中はこれでOK）
3. ロケーションは `asia-northeast1`（東京）を選択

### 3. ウェブアプリを登録

1. プロジェクトの概要画面で `</>` アイコンをクリック
2. アプリのニックネームを入力（例: `easton-web`）
3. 「アプリを登録」→ 表示された `firebaseConfig` をコピー

### 4. firebase-config.js を書き換え

`js/firebase-config.js` を開いて、コピーした値を貼り付ける：

```javascript
const firebaseConfig = {
  apiKey: "AIza...（コピーした値）",
  authDomain: "easton-training.firebaseapp.com",
  projectId: "easton-training",
  storageBucket: "easton-training.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

### 5. ローカルで動作確認

`index.html` をブラウザで直接開く（ダブルクリック）。
スタッフを追加してデータが保存されることを確認する。

> ⚠ ブラウザのセキュリティ制限でLocalファイルからFirebaseが接続できない場合は、  
> VS Code の「Live Server」拡張を使うか、下記のGitHub Pages公開を先に行う。

### 6. GitHub Pages で公開（PC・スマホ共有アクセス用）

1. GitHubアカウントを作成（https://github.com）
2. 新しいリポジトリを作成（`easton-training` など）
3. このフォルダのファイルをリポジトリにアップロード
4. リポジトリの「Settings」→「Pages」→「Source: main branch / root」で公開
5. 数分後に `https://[ユーザー名].github.io/easton-training/` でアクセス可能

### 7. Firestoreセキュリティルール（運用前に設定推奨）

Firebaseコンソール > Firestore > ルール に以下を設定：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 誰でも読み書き可（店内限定URL運用の場合）
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> 将来的にはFirebase Authでログイン認証を追加することを推奨します。

---

## ファイル構成

```
easton-training/
├── index.html              # メインHTML（CDN読み込み）
├── js/
│   ├── app.js              # Vue 3アプリ本体（4画面+ロジック）
│   ├── data.js             # 評価項目マスタ（12項目×基準1〜4）
│   └── firebase-config.js  # ★Firebaseの設定（要書き換え）
├── css/
│   └── custom.css          # スタイル定義
└── README.md               # このファイル
```

## 評価ロジック

| 状態 | 正式評価の上限 |
|---|---|
| ブック確認が未 | 最大2 |
| 理解確認が未 | 最大2 |
| 実技確認が未 | 最大2 |
| 全て完了 | 最大4 |

| 正式評価 | ステータス |
|---|---|
| 4 | 教えられる |
| 3 | 基準内 |
| 1〜2 | 進行中 |
| 未入力 | 未教示 |
