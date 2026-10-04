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
  /** LINE 友だち追加 URL（CTAボタン）。例: https://lin.ee/xxxx — 未設定は空文字 */
  LINE_FRIEND_URL: '',

  /** GAS Webアプリ URL（メールフォーム送信先）。末尾 /exec — 未設定は空文字 */
  GAS_WEBAPP_URL: '',
}
