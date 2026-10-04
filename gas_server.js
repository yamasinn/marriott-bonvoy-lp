/**
 * Google Apps Script コピペ用サーバーコード（本番運用想定）
 * ------------------------------------------------------------
 * ファイル名の目安: Code.gs
 *
 * ## デプロイ手順（要約）
 * 1. https://script.google.com → 新しいプロジェクト
 * 2. このファイル全文を貼り付けて保存
 * 3. 下の CONFIG を実値に差し替え（特に REFERRAL_URL）
 * 4. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
 *    - 説明: marriott-amex-lp-mail など
 *    - 次のユーザーとして実行: 自分
 *    - アクセスできるユーザー: 全員
 * 5. 「デプロイ」後の Web アプリ URL をコピー
 * 6. フロント `src/config.js` の GAS_WEBAPP_URL に貼る → ビルド／公開
 *
 * ## CORS / フロント連携
 * - LP は Content-Type: text/plain;charset=utf-8 で JSON 文字列を POST する
 *   （application/json はプリフライトが飛び、GAS のリダイレクトと相性が悪い）
 * - 本スクリプトは e.postData.contents を JSON.parse する
 * - レスポンスは ContentService の JSON
 * - OPTIONS は GAS では扱えないため text/plain 運用で回避
 *
 * ## 注意
 * - 紹介URLは Web ページに直貼りしない（このメール本文にだけ入れる）
 * - REFERRAL_URL が PLACEHOLDER のままだとメールは送らずエラーを返す
 */

var CONFIG = {
  /** 自動返信に差し込む紹介URL（ページ非掲載） */
  REFERRAL_URL: 'https://americanexpress.com/PLACEHOLDER_REFERRAL_URL',

  /** 送信者表示名 */
  FROM_NAME: 'Marriott Bonvoyアメックス比較ガイド',

  /** 件名 */
  MAIL_SUBJECT: '【Marriott Bonvoyアメックス】紹介リンクのご案内',

  /**
   * 返信先（任意）。空なら送信アカウントの既定。
   * 例: 'you@example.com'
   */
  REPLY_TO: '',

  /** 受信ログ用スプレッドシートID（任意。空ならスキップ） */
  LOG_SHEET_ID: '',

  /** 同一メールの連投抑制（秒） */
  RATE_LIMIT_SECONDS: 60,

  /** true のとき、PLACEHOLDER のまま送信しようとしても拒否する */
  BLOCK_PLACEHOLDER_REFERRAL: true,
}

/**
 * 疎通確認用 GET
 * ブラウザで Web アプリ URL を開くと JSON が返る
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'marriott-amex-lp-mail',
    ready: !isPlaceholderReferral_(),
    message: 'POST JSON { "email": "you@example.com" } to receive a referral link email.',
  })
}

/**
 * メール登録受付
 * 期待ボディ: { "email": "...", "source": "marriott-amex-lp", "timestamp": "..." }
 */
function doPost(e) {
  try {
    var payload = parsePayload_(e)
    var email = normalizeEmail_(payload.email)

    if (!email) {
      return jsonResponse_({ ok: false, message: 'email is required' })
    }
    if (!isValidEmail_(email)) {
      return jsonResponse_({ ok: false, message: 'invalid email' })
    }
    if (CONFIG.BLOCK_PLACEHOLDER_REFERRAL && isPlaceholderReferral_()) {
      return jsonResponse_({
        ok: false,
        message: 'REFERRAL_URL is still a placeholder. Set CONFIG.REFERRAL_URL before going live.',
      })
    }

    if (isRateLimited_(email)) {
      return jsonResponse_({
        ok: true,
        message: 'already accepted recently',
        rateLimited: true,
      })
    }

    // 同時送信の取りこぼしを減らす
    var lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      sendReferralMail_(email)
      appendLog_(email, payload)
    } finally {
      lock.releaseLock()
    }

    return jsonResponse_({ ok: true })
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: String(error && error.message ? error.message : error),
    })
  }
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents)
    } catch (err) {
      if (e.parameter && e.parameter.email) {
        return e.parameter
      }
      throw new Error('invalid JSON body')
    }
  }
  if (e && e.parameter) {
    return e.parameter
  }
  throw new Error('empty body')
}

function normalizeEmail_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isPlaceholderReferral_() {
  var url = String(CONFIG.REFERRAL_URL || '')
  return !url || url.indexOf('PLACEHOLDER') !== -1
}

function buildMailBody_(email) {
  return [
    email + ' 様',
    '',
    'Marriott Bonvoyアメックスの紹介リンクです。',
    'アメックスの紹介規約に沿って、個別にお送りしています。',
    '',
    '▼紹介リンク（あなた専用の入り口）',
    CONFIG.REFERRAL_URL,
    '',
    'このリンクから申し込むと、紹介経由の新規入会特典の対象になります。',
    'ポイント数や条件は時期とカードで変わるので、申込画面と公式で確認してください。',
    '',
    '同じリンクから、プレミアムでも一般でも選べます。',
    '券種は申込画面で、用途に合わせて選んでください。',
    '',
    '年会費・無料宿泊・エリートなどの条件も、申込前に公式サイトでご確認を。',
    '',
    '—',
    CONFIG.FROM_NAME,
  ].join('\n')
}

function sendReferralMail_(email) {
  var options = {
    to: email,
    subject: CONFIG.MAIL_SUBJECT,
    body: buildMailBody_(email),
    name: CONFIG.FROM_NAME,
  }
  if (CONFIG.REPLY_TO) {
    options.replyTo = CONFIG.REPLY_TO
  }
  MailApp.sendEmail(options)
}

function appendLog_(email, payload) {
  if (!CONFIG.LOG_SHEET_ID) return

  var ss = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID)
  var sheet = ss.getSheets()[0]
  sheet.appendRow([
    new Date(),
    email,
    payload && payload.source ? String(payload.source) : '',
    payload && payload.timestamp ? String(payload.timestamp) : '',
  ])
}

function isRateLimited_(email) {
  var cache = CacheService.getScriptCache()
  var key = 'mail:' + email
  if (cache.get(key)) {
    return true
  }
  cache.put(key, '1', CONFIG.RATE_LIMIT_SECONDS)
  return false
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
