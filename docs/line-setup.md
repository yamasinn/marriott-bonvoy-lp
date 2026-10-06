# LINE 導線 — 設定手順と文面

LP の「LINEで受け取る」は、**友だち追加 URL** に飛ばすだけ。  
紹介URL自体は LINE のあいさつ／自動応答にだけ載せ、Web には載せない。

## 今やる / 後で差し込む

| いつ | 作業 |
| --- | --- |
| **今** | LINE公式アカ作成 → 友だち追加URL取得 → あいさつ／キーワード応答を設定 → `LINE_FRIEND_URL` を LP に貼る |
| **後** | あいさつ／キーワード文中の一般用・プレミアム用プレースホルダを、それぞれの実URLに差し替え |

カード到着前でもアカウントと自動応答は作ってよい。紹介URL行はプレースホルダのままでOK。

紹介URLは **券種ごと**。文面には一般用とプレミアム用の2行を並べ、受け手が希望券種を選ぶ形です。

---

## 今日のボタン順（6ステップ）

1. [LINE Biz](https://www.linebiz.com/jp/) で **LINE公式アカウント作成**（無料プラン可）
2. [Official Account Manager](https://manager.line.biz/) にログイン
3. **設定 → 友だち追加ガイド** で友だち追加 URL（`https://lin.ee/...` など）を控える
4. **トーク → あいさつメッセージ** をオン → `templates/line-greeting.txt` を貼る  
   - LP URL は本番済み: `https://marriott-bonvoy-lp.vercel.app`  
   - `【ここに一般の紹介URLを貼る】`／`【ここにプレミアムの紹介URLを貼る】` は今はそのまま
5. **応答メッセージ** でキーワード「紹介」→ `templates/line-auto-reply.txt` を設定（推奨）
6. `src/config.js` の `LINE_FRIEND_URL` に友だち追加URLを貼る → ビルド／再デプロイ  
   → スマホで友だち追加し、あいさつが届くか確認

---

## LP への差し込み

```js
export const CONFIG = {
  LINE_FRIEND_URL: 'https://lin.ee/XXXX', // ← 今ここ
  GAS_WEBAPP_URL: '...',
}
```

未設定のとき CTA は「LINE受付は準備中」。

---

## カード到着後（紹介URL差し込み）

1. Manager であいさつメッセージの  
   - `【ここに一般の紹介URLを貼る】` → 一般用の実URL  
   - `【ここにプレミアムの紹介URLを貼る】` → プレミアム用の実URL  
2. キーワード応答も同じ2本を差し替え  
3. 自分のLINEで「紹介」を送り、両方のリンクが正しいか確認  

---

## 注意

- 紹介URLを LP・SNS・プロフィール文に直貼りしない  
- 「同じリンクで一般もプレミアムも」とは書かない（券種ごとであることを明記）  
- あいさつ文のリンク切れ・キャンペーン期限に注意（再発行時は差し替え）  
- 実URLはリポジトリにコミットしない  

## 文面ファイル

| ファイル | 用途 |
| --- | --- |
| `templates/line-greeting.txt` | 友だち追加直後のあいさつ |
| `templates/line-auto-reply.txt` | 「紹介」などのキーワード応答 |
