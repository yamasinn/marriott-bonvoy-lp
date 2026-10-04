# Marriott Bonvoyアメックス紹介LP

アメックス紹介規約を守りつつ、Marriott Bonvoyアメックス（プレミアム／一般）の比較ガイドと、LINE／メールでの個別案内導線を提供する静的ランディングページです。紹介URLはこのサイト上には掲載しません。

## 技術構成

- Vite（静的サイト）
- HTML5 + Tailwind CSS（CDN）+ Vanilla JS
- `gas_server.js` … Google Apps Script にコピペするメール自動返信サーバー

## ローカル起動

```bash
npm install
npm run dev
```

開発サーバーは `http://127.0.0.1:45231` で起動します。

本番ビルド:

```bash
npm run build
npm run preview
```

## プレースホルダー（差し込み待ち）

フロント: `src/config.js`

| 定数 | 用途 |
| --- | --- |
| `LINE_FRIEND_URL` | LINE友だち追加 CTA |
| `GAS_WEBAPP_URL` | メールフォームの送信先（GAS Webアプリ） |
| `REFERRAL_URL` | 紹介URL（ページ直貼り禁止。GAS側で使用） |

GAS: `gas_server.js` 先頭の `CONFIG`

| 定数 | 用途 |
| --- | --- |
| `REFERRAL_URL` | 自動返信メール本文に差し込む紹介リンク |
| `LOG_SHEET_ID` | 任意。受信ログ用スプレッドシート |

## GAS セットアップ概要

1. `gas_server.js` を Apps Script に貼る
2. `CONFIG.REFERRAL_URL` を実値に差し替え
3. ウェブアプリとしてデプロイ（実行: 自分 / アクセス: 全員）
4. 発行 URL を `src/config.js` の `GAS_WEBAPP_URL` に設定

フロントは `Content-Type: text/plain;charset=utf-8` で JSON を POST します（プリフライト回避）。

## ページ構成

1. ファーストビュー（ブランド＋キャッチ＋規約一言＋導入ストーリー）
2. カードの魅力（3点）
3. プレミアム／一般の比較表＋決済額の簡易分岐
4. ケース別（向き不向き）
5. FAQ（損益分岐・券種差・紹介リンクの受け取り方）＋ `FAQPage` JSON-LD
6. CTA（LINE友だち追加 / メールフォーム）

GEO 向けに、比較表・箇条書き・`section` / `article` / `table` などのセマンティックHTMLと FAQ を入れています。