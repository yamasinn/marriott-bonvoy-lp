# 運用チェックリスト（リポジトリ内コピー）

ユーザー向けの正式版は Project ストアの  
`docs/launch-checklist.md` を正とする。ここでは開発者向けの要約。

## 今やる

| # | 項目 | 差し込み先 |
| --- | --- | --- |
| 1 | LINE友だち追加URL | `src/config.js` → `LINE_FRIEND_URL` |
| 2 | GAS WebアプリURL | `src/config.js` → `GAS_WEBAPP_URL` |
| 3 | LINEあいさつ／キーワード | Manager（紹介URL行はプレースホルダ可） |
| 4 | GAS デプロイ | `gas_server.js` 貼付・ウェブアプリ公開 |

## 後で差し込む（カード到着後）

| # | 項目 | 差し込み先 |
| --- | --- | --- |
| 1 | 紹介URL | `gas_server.js` → `CONFIG.REFERRAL_URL`（再デプロイ） |
| 2 | 紹介URL（同じ値） | LINEあいさつ／キーワードの `【ここに紹介URLを貼る】` |

紹介URLは **LP・SNS・README に直貼りしない**。

詳細: `docs/gas-setup.md` / `docs/line-setup.md` / `docs/hosting.md`（**Vercel** 本線）
