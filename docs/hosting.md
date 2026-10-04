# ホスティング公開手順

静的ビルド（`npm run build` → `dist/`）を GitHub Pages または Cloudflare Pages に出す。

## ビルド

```bash
npm install
npm run build
```

成果物は `dist/`。紹介URLはここに含まれない（`src/config.js` の LINE / GAS のみ）。

## オプション A: GitHub Pages（推奨・無料）

リポジトリが GitHub 上にある場合。

1. GitHub にリポジトリを用意し、このコードを push  
2. リポジトリ **Settings → Pages**  
   - Source: **GitHub Actions**  
3. このリポジトリの `.github/workflows/deploy-pages.yml` が `main`（または指定ブランチ）への push でビルド・公開する  
4. 公開 URL 例: `https://<user>.github.io/<repo>/`  
5. カスタムドメインがあれば Pages 設定で追加  

### base パス

リポジトリ名サブパスで公開する場合、`vite.config.js` に次を足す。

```js
export default defineConfig({
  base: '/<repo-name>/',
  // ...
})
```

ルートドメイン／ユーザー Pages（`<user>.github.io`）なら `base: '/'` のままでよい。

## オプション B: Cloudflare Pages

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Pages  
2. Git 連携、または直接アップロード  
3. ビルド設定例  

| 項目 | 値 |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 22（または 20） |

CLI で出す場合（トークンが必要）:

```bash
npx wrangler pages deploy dist --project-name=marriott-amex-lp
```

`wrangler.toml` にプロジェクト名の目安を置いてある。

## 公開前チェック

- [ ] `src/config.js` の `LINE_FRIEND_URL` / `GAS_WEBAPP_URL` が本番値  
- [ ] ページソースに紹介URL（americanexpress の紹介クエリ等）が**出ていない**  
- [ ] メールフォームが本番 GAS に届く  
- [ ] LINE CTA が友だち追加 URL を開く  

## このクラウド環境での実デプロイ状況

- リモートは Origin の一時リポジトリで、GitHub / Cloudflare の認証トークンが無い  
- そのため **この環境からは本番公開 URL の発行まで到達できない**  
- 設定ファイル（ワークフロー / wrangler）と手順は完備済み。ユーザー側で GitHub または Cloudflare に接続すれば公開できる  
