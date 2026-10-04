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

## 本番

- URL: https://marriott-bonvoy-lp.vercel.app  
- Project: `marriott-bonvoy-lp` ／ Team: yamasinn0224-2421's projects  

詳細: [docs/hosting.md](./docs/hosting.md)

## 技術構成

| 役割 | パス |
| --- | --- |
| LP | `index.html` / `src/*` |
| フロント定数（LINE / GAS） | `src/config.js` |
| メール自動返信（GASコピペ） | `gas_server.js` |
| Vercel 設定 | `vercel.json` |
| GAS手順 | `docs/gas-setup.md` |
| LINE手順・文面 | `docs/line-setup.md` / `templates/` |
| 運用要約 | `docs/ops-checklist.md` |

## 差し込み定数（1箇所まとめ）

### 今やる → `src/config.js`

| 定数 | どこから取る |
| --- | --- |
| `LINE_FRIEND_URL` | LINE Manager の友だち追加URL |
| `GAS_WEBAPP_URL` | Apps Script ウェブアプリURL（末尾 `/exec`） |

空のとき CTA は「準備中」。値が入ると有効化。

### 後で差し込む（カード到着後）

| 値 | 場所 |
| --- | --- |
| 紹介URL | `gas_server.js` → `CONFIG.REFERRAL_URL`（新バージョン再デプロイ） |
| 紹介URL（同じ） | LINEあいさつ／キーワードの `【ここに紹介URLを貼る】` |

## 立ち上げの流れ（推奨順）

1. **今** [docs/line-setup.md](./docs/line-setup.md) → `LINE_FRIEND_URL`  
2. **今** [docs/gas-setup.md](./docs/gas-setup.md) → `GAS_WEBAPP_URL`  
3. push / Vercel 再デプロイで CTA 有効化  
4. **後** 紹介URLを GAS と LINE にだけ差し込む  
5. スモークテスト（メール実リンク・LINEあいさつ・ソースに紹介URLなし）  

チェックリスト: Project ストア `docs/launch-checklist.md`
