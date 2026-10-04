# Marriott Bonvoyアメックス紹介LP

アメックス紹介規約を守りつつ、Marriott Bonvoyアメックス（プレミアム／一般）の比較ガイドと、LINE／メールでの個別案内導線を提供する静的ランディングページです。**紹介URLはこのサイト上には掲載しません。**

## ローカル起動

```bash
npm install
npm run dev
```

開発サーバー: `http://127.0.0.1:45231`

```bash
npm run build
npm run preview
```

## 技術構成

| 役割 | パス |
| --- | --- |
| LP | `index.html` / `src/*` |
| フロント定数（LINE / GAS） | `src/config.js` |
| メール自動返信（GASコピペ） | `gas_server.js` |
| GAS手順 | `docs/gas-setup.md` |
| LINE手順・文面 | `docs/line-setup.md` / `templates/` |
| ホスティング | `docs/hosting.md` |
| 運用要約 | `docs/ops-checklist.md` |
| GitHub Pages CI | `.github/workflows/deploy-pages.yml` |
| Cloudflare Pages 目安 | `wrangler.toml` |

## 差し込み定数

### フロント `src/config.js`

| 定数 | 用途 |
| --- | --- |
| `LINE_FRIEND_URL` | LINE友だち追加 CTA |
| `GAS_WEBAPP_URL` | メールフォーム送信先 |

`REFERRAL_URL` コメントはメモ用。**フロントからは送らない・表示しない。** 実体は GAS / LINE 側。

### GAS `gas_server.js` の `CONFIG`

| 定数 | 用途 |
| --- | --- |
| `REFERRAL_URL` | 自動返信メール本文の紹介リンク（必須） |
| `REPLY_TO` / `LOG_SHEET_ID` | 任意 |

## 立ち上げの流れ（短縮）

1. 紹介URLを取得（ページ非掲載）  
2. [docs/gas-setup.md](./docs/gas-setup.md) で GAS をデプロイ → `GAS_WEBAPP_URL` を設定  
3. [docs/line-setup.md](./docs/line-setup.md) であいさつに紹介URL → `LINE_FRIEND_URL` を設定  
4. [docs/hosting.md](./docs/hosting.md) で GitHub Pages または Cloudflare Pages に公開  
5. メール／LINE／ソース直貼りなしをスモークテスト  

詳細チェックリストは Project ストアの `docs/launch-checklist.md` を参照。

## CORS（メール）

フロントは `Content-Type: text/plain;charset=utf-8` で JSON を POST。詳細は `docs/gas-setup.md`。
