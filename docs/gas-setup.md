# GAS メール自動返信 — セットアップ手順

LP の「メールで受け取る」フォームから届いたアドレスへ、紹介リンクを自動返信する。

## 前提

- Google アカウント（Gmail / Workspace）
- 送信に使うアカウントの [Apps Script](https://script.google.com) 利用可
- 差し込む紹介URL（カード到着・登録後に取得。**Web ページには載せない**）

## 手順

1. [script.google.com](https://script.google.com) で **新しいプロジェクト** を作成する  
2. エディタのコードをすべて消し、リポジトリ直下の `gas_server.js` を全文貼り付けて保存する  
3. `CONFIG` を編集する  

| キー | 必須 | 内容 |
| --- | --- | --- |
| `REFERRAL_URL` | 必須 | 紹介専用URL（PLACEHOLDER のままでは本番送信不可） |
| `FROM_NAME` | 任意 | 送信者表示名 |
| `MAIL_SUBJECT` | 任意 | 件名 |
| `REPLY_TO` | 任意 | 返信先メール |
| `LOG_SHEET_ID` | 任意 | 受信ログ用スプレッドシートの ID |
| `RATE_LIMIT_SECONDS` | 任意 | 同一アドレスの連投抑制（秒） |
| `BLOCK_PLACEHOLDER_REFERRAL` | 任意 | `true` 推奨。PLACEHOLDER のまま送信しない |

4. **デプロイ → 新しいデプロイ → 種類: ウェブアプリ**  
   - 次のユーザーとして実行: **自分**  
   - アクセスできるユーザー: **全員**  
5. 発行された URL（末尾が `/exec`）をコピーする  
6. フロントの `src/config.js` で接続する  

```js
export const CONFIG = {
  LINE_FRIEND_URL: '...',
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/XXXX/exec', // ← ここ
  // REFERRAL_URL はフロントでは使わない（GAS側のみ）
}
```

7. `npm run build` して公開し直す（または Pages が main を自動ビルドするなら push）

## 動作確認

1. ブラウザで Web アプリ URL を開く → `{"ok":true,"ready":true,...}` のような JSON  
   - `ready: false` なら `REFERRAL_URL` がまだ PLACEHOLDER  
2. LP のメールフォームに自分のアドレスを入れて送信  
3. 受信箱（迷惑メールも）に紹介リンクメールが届くか確認  

初回デプロイ時、権限承認（MailApp / SpreadsheetApp）を求められることがある。画面の指示どおり許可する。

## フロントとの約束（CORS）

LP（`src/main.js`）は次の形で POST する。

- `Content-Type: text/plain;charset=utf-8`
- body: `{"email":"...","source":"marriott-amex-lp","timestamp":"..."}`

GAS 側は `e.postData.contents` を `JSON.parse` する。  
`application/json` に変えないこと（プリフライトで失敗しやすい）。

## コード変更後

Apps Script で保存したあと、**デプロイ → デプロイを管理 → 編集 → バージョン: 新バージョン** で再デプロイしないと本番に反映されない。

## トラブルシュート

| 症状 | 確認 |
| --- | --- |
| LP が「準備中」 | `src/config.js` の `GAS_WEBAPP_URL` が PLACEHOLDER のまま |
| LP が送信失敗 | GAS の `ready` / 権限 / 再デプロイ漏れ |
| メールが来ない | 迷惑メール、MailApp 日次上限、`REFERRAL_URL` 未設定 |
| CORS エラーっぽい | Content-Type が text/plain か、デプロイの「全員」か |
