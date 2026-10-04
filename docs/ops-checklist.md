# 運用チェックリスト（リポジトリ内コピー）

ユーザー向けの正式版は Project ストアの  
`docs/launch-checklist.md` を正とする。ここでは開発者向けの要約。

## カード到着後に差し込むもの

| # | 項目 | 差し込み先 | 済 |
| --- | --- | --- | --- |
| 1 | 紹介URL | `gas_server.js` の `CONFIG.REFERRAL_URL`／LINEあいさつ | ☐ |
| 2 | LINE友だち追加URL | `src/config.js` の `LINE_FRIEND_URL` | ☐ |
| 3 | GAS WebアプリURL | `src/config.js` の `GAS_WEBAPP_URL` | ☐ |

紹介URLは **LP・SNS・README に直貼りしない**。

詳細手順: `docs/gas-setup.md` / `docs/line-setup.md` / `docs/hosting.md`（**Vercel** 本線）
