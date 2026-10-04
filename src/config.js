/**
 * 差し込み待ちの定数をここに集約する。
 * 紹介URLはページに直貼りしない（LINE あいさつ / GAS メール本文のみ）。
 *
 * 手順:
 * - LINE: docs/line-setup.md → LINE_FRIEND_URL
 * - GAS:  docs/gas-setup.md  → GAS_WEBAPP_URL
 * - 紹介URL本体は gas_server.js / LINEあいさつ側（ここには実URLを書かない）
 */
export const CONFIG = {
  /** LINE 友だち追加 URL（CTAボタン）。例: https://lin.ee/xxxx */
  LINE_FRIEND_URL: 'https://line.me/R/ti/p/%40PLACEHOLDER_LINE_ID',

  /** GAS Webアプリ URL（メールフォーム送信先）。末尾 /exec */
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/PLACEHOLDER_GAS_DEPLOYMENT_ID/exec',
}
