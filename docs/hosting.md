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

## このクラウド環境での実デプロイ状況

- `VERCEL_TOKEN` が無いため、ここからは本番 URL を発行できない  
- `vercel.json` と手順は完備済み。手元または CI で `vercel --prod` / ダッシュボード Import すれば公開できる  
