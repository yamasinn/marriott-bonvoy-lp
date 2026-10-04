/**
 * 差し込み定数（ここだけ編集してビルド／再デプロイ）。
 *
 * 紹介URLはページに直貼りしない（LINE あいさつ / GAS メール本文のみ）。
 *
 * ## 今やる（URLが取れたらすぐ）
 * - LINE_FRIEND_URL … docs/line-setup.md で発行した友だち追加URL
 * - GAS_WEBAPP_URL  … docs/gas-setup.md でデプロイした WebアプリURL（末尾 /exec）
 *
 * ## 後で差し込む（カード到着後）
 * - 紹介URL本体 → gas_server.js の CONFIG.REFERRAL_URL と LINE あいさつ文
 *   （このファイルには書かない）
 *
 * 未設定（空文字 or PLACEHOLDER 含む）のとき、CTA は「準備中」表示。
 */
export const CONFIG = {
  /** LINE 友だち追加 URL（CTAボタン）。例: https://lin.ee/xxxx */
  LINE_FRIEND_URL: 'https://lin.ee/UFaAhyT',

  /** GAS Webアプリ URL（メールフォーム送信先）。末尾 /exec */
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbw5VUJDtX4cZ6W9JU-GGMPwwjK7SKQXtyAJvAO4R4OkzqffBq_7VucDM0v0gP6pX7qK/exec',
}
