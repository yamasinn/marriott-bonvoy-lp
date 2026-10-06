# GAS メール自動返信 — セットアップ手順

LP の「メールで受け取る」フォームから届いたアドレスへ、自動返信する。

## 今やる / 後で差し込む

| いつ | 作業 |
| --- | --- |
| **今** | Apps Script 作成 → `gas_server.js` 貼付 → ウェブアプリ公開 → `GAS_WEBAPP_URL` を LP に貼る |
| **後** | `CONFIG.REFERRAL_URL_REGULAR` と `CONFIG.REFERRAL_URL_PREMIUM` を実URLに差し替え → **新バージョン**で再デプロイ |

カード到着前でもデプロイしてよい。どちらか一方でも PLACEHOLDER の間は「準備中」受付メールを送る（PLACEHOLDER 文字列はメールに載せない）。

紹介URLは **券種ごと**（一般／プレミアム）。メール本文には両方を載せ、受け手が希望券種を選ぶ形です。

---

## 今日のボタン順（5ステップ）

1. [script.google.com](https://script.google.com) → **新しいプロジェクト**
2. エディタのコードを全部消し、リポジトリの `gas_server.js` を**全文貼り付け → 保存**
3. **デプロイ → 新しいデプロイ → 種類: ウェブアプリ**  
   - 次のユーザーとして実行: **自分**  
   - アクセスできるユーザー: **全員**  
   - 初回は権限承認（MailApp 等）を許可
4. 発行 URL（末尾 `/exec`）をコピー
5. `src/config.js` の `GAS_WEBAPP_URL` に貼る → `npm run build`（または Vercel が main を自動ビルドするなら push）

疎通: ブラウザでその URL を開く → `{"ok":true,...}`  
- `ready: false` … 紹介URLまだ（想定どおり。準備中メール）  
- `ready: true` … 一般・プレミアム両方の紹介URL差し込み済み

---

## CONFIG（後差し込み中心）

| キー | いつ | 内容 |
| --- | --- | --- |
| `REFERRAL_URL_REGULAR` | **後** | 一般用の紹介専用URL。PLACEHOLDER のままデプロイ可 |
| `REFERRAL_URL_PREMIUM` | **後** | プレミアム用の紹介専用URL。PLACEHOLDER のままデプロイ可 |
| `FROM_NAME` / `MAIL_SUBJECT` / `HOLDING_SUBJECT` | 任意 | 表示名・件名 |
| `REPLY_TO` | 任意 | 返信先 |
| `LOG_SHEET_ID` | 任意 | 受信ログ用シート ID |
| `RATE_LIMIT_SECONDS` | 任意 | 同一アドレス連投抑制（秒） |
| `BLOCK_PLACEHOLDER_REFERRAL` | 推奨 `true` | PLACEHOLDER を本文に載せない（準備中メールへ） |

実URLはリポジトリにコミットしない（Apps Script 上でのみ差し替え）。

---

## LP への差し込み

```js
export const CONFIG = {
  LINE_FRIEND_URL: '...',
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/XXXX/exec', // ← 今ここ
}
```

紹介URLはフロントに書かない（GAS / LINE のみ）。

---

## フロントとの約束（CORS）

LP（`src/main.js`）は次の形で POST する。

- `Content-Type: text/plain;charset=utf-8`
- body: `{"email":"...","source":"marriott-amex-lp","timestamp":"..."}`

`application/json` に変えないこと（プリフライトで失敗しやすい）。

---

## カード到着後（紹介URL差し込み）

1. Apps Script で `CONFIG.REFERRAL_URL_REGULAR` と `CONFIG.REFERRAL_URL_PREMIUM` を実URLに変更して保存  
2. **デプロイ → デプロイを管理 → 編集 → バージョン: 新バージョン**  
3. ブラウザで WebアプリURL → `ready: true`  
4. LP フォームから自分宛に送り、一般／プレミアム両方のリンクが入ったメールが届くか確認  

---

## トラブルシュート

| 症状 | 確認 |
| --- | --- |
| LP が「準備中」 | `src/config.js` の `GAS_WEBAPP_URL` が空／PLACEHOLDER |
| 準備中メールが来る | どちらかの紹介URLが未差し込み（想定どおり） |
| メールが来ない | 迷惑メール、MailApp 日次上限、権限未承認、再デプロイ漏れ |
| CORS エラーっぽい | Content-Type が text/plain か、デプロイの「全員」か |
