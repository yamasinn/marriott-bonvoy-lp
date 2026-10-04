/**
 * 差し込み待ちの定数をここに集約する。
 * 紹介URLはページに直貼りしない（LINE / メール案内側のみで使う）。
 */
export const CONFIG = {
  /** LINE 友だち追加 URL（CTAボタン） */
  LINE_FRIEND_URL: 'https://line.me/R/ti/p/%40PLACEHOLDER_LINE_ID',

  /** GAS Webアプリのデプロイ URL（メールフォーム送信先） */
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/PLACEHOLDER_GAS_DEPLOYMENT_ID/exec',

  /**
   * 紹介URL（ページには出さない）
   * gas_server.js 側の自動返信本文に差し込む。フロントでは参照しない。
   */
  REFERRAL_URL: 'https://americanexpress.com/PLACEHOLDER_REFERRAL_URL',
}
