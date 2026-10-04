# Marriott Bonvoyアメックス紹介LP

アメックス紹介規約を守りつつ、Marriott Bonvoyアメックス（プレミアム／一般）の比較ガイドと、LINE／メールでの個別案内導線を提供する静的ランディングページです。**紹介URLはこのサイト上には掲載しません。**

ホスト方針: **Vercel**（[kurokan-lp](https://kurokan-lp.vercel.app/) と同じ系統）。

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

## Vercel で公開（短縮）

1. このリポジトリを GitHub 等に用意する  
2. [Vercel](https://vercel.com/) で Import（`vercel.json` により Build=`npm run build` / Output=`dist`）  
3. Deploy → `https://<project>.vercel.app`  
4. カード到着後に `src/config.js` の `LINE_FRIEND_URL` / `GAS_WEBAPP_URL` を本番値へ（未設定時は CTA が「準備中」）  

CLI:

```bash
npx vercel --prod
```

### いまの一時公開（エージェント環境）

- 一時URL: https://temporary-brisk-quasar-8hm5j25.vercel.app  
- Claim（名義付きに残す）: https://vercel.com/claim-deployment?code=531c54f3-fe87-477f-bdf7-6eeb407df045  
- エージェント側に `VERCEL_TOKEN` が無いため、恒久 `*.vercel.app` 名義付き本番は Claim / Import / 手元 `vercel login` が必要  

詳細: [docs/hosting.md](./docs/hosting.md)

## 技術構成

| 役割 | パス |
| --- | --- |
| LP | `index.html` / `src/*` |
| フロント定数（LINE / GAS） | `src/config.js` |
| メール自動返信（GASコピペ） | `gas_server.js` |
| Vercel 設定 | `vercel.json` |
| 公開手順 | `docs/hosting.md` |
| GAS手順 | `docs/gas-setup.md` |
| LINE手順・文面 | `docs/line-setup.md` / `templates/` |
| 運用要約 | `docs/ops-checklist.md` |

## 差し込み定数

### フロント `src/config.js`

| 定数 | 用途 |
| --- | --- |
| `LINE_FRIEND_URL` | LINE友だち追加 CTA |
| `GAS_WEBAPP_URL` | メールフォーム送信先 |

紹介URL本体は **GAS / LINE 側のみ**（ページ非掲載）。

### GAS `gas_server.js` の `CONFIG`

| 定数 | 用途 |
| --- | --- |
| `REFERRAL_URL` | 自動返信メール本文の紹介リンク（必須） |

## 立ち上げの流れ

1. 紹介URLを取得（ページ非掲載）  
2. [docs/gas-setup.md](./docs/gas-setup.md) → `GAS_WEBAPP_URL`  
3. [docs/line-setup.md](./docs/line-setup.md) → `LINE_FRIEND_URL`  
4. [docs/hosting.md](./docs/hosting.md) で **Vercel** 公開  
5. メール／LINE／ソース直貼りなしをスモークテスト  

チェックリスト: Project ストア `docs/launch-checklist.md`
