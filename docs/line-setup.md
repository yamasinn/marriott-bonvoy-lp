# LINE 導線 — 設定手順と文面

LP の「LINEで受け取る」は、**友だち追加 URL** に飛ばすだけ。  
紹介URL自体は LINE のあいさつ／自動応答にだけ載せ、Web には載せない。

## あなたが手で作るもの

1. [LINE Official Account](https://www.linebiz.com/jp/）を作成（無料プラン可）  
2. 友だち追加用の URL / QR を発行  
3. あいさつメッセージに紹介リンクを入れる  
4. LP の `src/config.js` に友だち追加 URL を差し込む  

アカウント作成そのものはユーザー作業（このリポジトリでは代行不可）。

## Official Account Manager での設定

1. [LINE Official Account Manager](https://manager.line.biz/) にログイン  
2. **ホーム → 設定 → 友だち追加ガイド**（または類似メニュー）で  
   - 友だち追加 URL（例: `https://lin.ee/xxxx` や `https://line.me/R/ti/p/@xxxx`）を控える  
3. **トーク → あいさつメッセージ** をオン  
4. 文面に `templates/line-greeting.txt` をベースに貼る  
   - `【ここに紹介URLを貼る】` を実URLに置換  
   - `【ここに公開したLPのURLを貼る】` を公開LPに置換（任意）  
5. 必要なら **応答メッセージ** でキーワード「紹介」に同じリンクを返す  
   - 文面例: `templates/line-auto-reply.txt`  
6. スマホで自分のLINEから友だち追加し、あいさつが届くか確認  

## LP への差し込み

`src/config.js`:

```js
export const CONFIG = {
  LINE_FRIEND_URL: 'https://lin.ee/XXXX', // ← Official Account の友だち追加URL
  GAS_WEBAPP_URL: '...',
}
```

保存後 `npm run build`（または CI の自動ビルド）で公開に反映。

## 注意

- 紹介URLを LP・SNS・プロフィール文に直貼りしない  
- あいさつ文のリンク切れ・期限切れキャンペーンに注意（カード到着後に差し替え）  
- プレミアム／一般どちらも同じ紹介リンクから選べる旨を残す  

## 文面ファイル

| ファイル | 用途 |
| --- | --- |
| `templates/line-greeting.txt` | 友だち追加直後のあいさつ |
| `templates/line-auto-reply.txt` | 「紹介」などのキーワード応答（任意） |
