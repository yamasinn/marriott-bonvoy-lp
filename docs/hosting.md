# ホスティング公開手順（Vercel）

参照実装: [kurokan-lp](https://kurokan-lp.vercel.app/)（同じく Vercel 上の静的LP）

静的ビルド（`npm run build` → `dist/`）を **Vercel** に出す。SPA フォールバックは使わない（単一の `index.html` 静的配信）。

## ビルド

```bash
npm install
npm run build
```

成果物は `dist/`。紹介URLはここに含まれない（`src/config.js` の LINE / GAS のみ）。

`vercel.json` で次を固定している。

| 項目 | 値 |
| --- | --- |
| Framework | vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

## Vercel に載せる（ダッシュボード）

1. コードを GitHub 等の Git リポジトリに置く（Origin 一時リポジトリのままだと Vercel 連携しづらい）  
2. [vercel.com](https://vercel.com/) にログイン → **Add New… → Project**  
3. リポジトリを Import  
4. 設定が `vercel.json` どおりか確認（Framework Preset: Vite、Output: `dist`）  
5. **Deploy**  
6. 発行 URL 例: `https://<project-name>.vercel.app`  
7. （任意）カスタムドメインを Project → Settings → Domains で追加  

kurokan に寄せるなら、プロジェクト名を分かりやすく（例: `marriott-amex-lp`）にしておく。

## Vercel に載せる（CLI）

要: [Vercel トークン](https://vercel.com/account/tokens) と、紐づけるチーム／アカウント権限。

```bash
npm install
npm run build
npx vercel login          # 対話、または VERCEL_TOKEN
npx vercel link           # プロジェクト紐づけ
npx vercel --prod         # 本番デプロイ
```

非対話（CI / エージェント）:

```bash
export VERCEL_TOKEN=xxxx   # 要: Deployments 権限のあるトークン
npx vercel --prod --yes --token "$VERCEL_TOKEN"
```

必要権限の目安:

- トークン: **Create Deployments**（プロジェクト作成まで行うならそれも含む）
- 対象チーム／個人アカウントへのデプロイ権限

## 公開前チェック

- [ ] `src/config.js` の `LINE_FRIEND_URL` / `GAS_WEBAPP_URL` が本番値  
- [ ] ページソースに紹介URLが**出ていない**  
- [ ] メールフォームが本番 GAS に届く  
- [ ] LINE CTA が友だち追加 URL を開く  
- [ ] `https://….vercel.app` がスマホで表示される  

## このクラウド環境での実デプロイ状況（2026-10-04）

| 項目 | 状態 |
| --- | --- |
| 改行修正・CTA準備中表示 | デプロイ済み |
| 名義付き `vercel --prod` | **未達**（`VERCEL_TOKEN` / login 無し） |
| 一時公開URL（約60分） | https://temporary-brisk-quasar-8hm5j25.vercel.app |
| Claim（恒久化） | https://vercel.com/claim-deployment?code=531c54f3-fe87-477f-bdf7-6eeb407df045 |

### 最短で固定本番にする

1. **Claim**: 上の Claim URL を kurokan と同じ Vercel アカウントで開く → プロジェクト名を付けて保持  
2. **Import**: コードを GitHub 等へ置き、Vercel → Add Project → Import（継続デプロイ向き）  
3. **CLI**: 手元で `npx vercel login` 後 `npx vercel --prod --yes`、または CI に `VERCEL_TOKEN` を入れる  

詳細の要約はストア側 `docs/hosting-status.md` も参照。
