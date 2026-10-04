/**
 * Google Apps Script コピペ用サーバーコード
 * ------------------------------------------------------------
 * 使い方:
 * 1. https://script.google.com で新規プロジェクトを作成
 * 2. このファイルの内容を Code.gs に貼り付け
 * 3. CONFIG のプレースホルダーを実値に差し替え
 * 4. デプロイ → 新しいデプロイ → 種類: ウェブアプリ
 *    - 実行ユーザー: 自分
 *    - アクセスできるユーザー: 全員
 * 5. 発行された URL をフロントの CONFIG.GAS_WEBAPP_URL に設定
 *
 * CORS / fetch のベストプラクティス:
 * - フロントは Content-Type: text/plain;charset=utf-8 で JSON 文字列を POST する
 *   （application/json だとプリフライトが飛び、GAS リダイレクトと相性が悪い）
 * - 本スクリプトは postData.contents を JSON.parse する
 * - レスポンスは JSON 文字列を返す（ContentService）
 * - doGet は疎通確認用。OPTIONS 相当は GAS では扱えないため text/plain 運用で回避
 */

var CONFIG = {
  /** 自動返信メールに差し込む紹介URL（Webページには載せない） */
  REFERRAL_URL: 'https://americanexpress.com/PLACEHOLDER_REFERRAL_URL',

  /** 送信元として表示したい名前 */
  FROM_NAME: 'Marriott Bonvoyアメックス比較ガイド',

  /** 件名 */
  MAIL_SUBJECT: '【Marriott Bonvoyアメックス】紹介リンクのご案内',

  /** 受信ログを残すスプレッドシートID（任意。空ならスキップ） */
  LOG_SHEET_ID: '',

  /** 同一メールの連投を抑える秒数 */
  RATE_LIMIT_SECONDS: 60,
}

/**
 * 疎通確認用
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'marriott-amex-lp-mail',
    message: 'POST JSON { email } to receive a referral link email.',
  })
}

/**
 * メール登録受付
 * 期待ボディ: { "email": "you@example.com", "source": "...", "timestamp": "..." }
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

    if (isRateLimited_(email)) {
      return jsonResponse_({
        ok: true,
        message: 'already accepted recently',
        rateLimited: true,
      })
    }

    sendReferralMail_(email)
    appendLog_(email, payload)

    return jsonResponse_({ ok: true })
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: String(error && error.message ? error.message : error),
    })
  }
}

function parsePayload_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    // application/x-www-form-urlencoded フォールバック
    if (e && e.parameter) {
      return e.parameter
    }
    throw new Error('empty body')
  }

  var raw = e.postData.contents
  try {
    return JSON.parse(raw)
  } catch (err) {
    // email=... 形式のフォールバック
    if (e.parameter && e.parameter.email) {
      return e.parameter
    }
    throw new Error('invalid JSON body')
  }
}

function normalizeEmail_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildMailBody_(email) {
  return [
    email + ' 様',
    '',
    'Marriott Bonvoyアメックスの紹介リンクをご案内します。',
    'アメックスの紹介規約に基づき、個別にお送りしています。',
    '',
    '▼紹介リンク',
    CONFIG.REFERRAL_URL,
    '',
    '同じリンクからプレミアム／一般のどちらもお選びいただけます。',
    '券種は申込画面で、ご自身の用途に合わせて選択してください。',
    '',
    '特典内容・年会費・無料宿泊の条件は、申込前に必ず公式サイトでご確認ください。',
    '',
    '—',
    CONFIG.FROM_NAME,
  ].join('\n')
}

function sendReferralMail_(email) {
  MailApp.sendEmail({
    to: email,
    subject: CONFIG.MAIL_SUBJECT,
    body: buildMailBody_(email),
    name: CONFIG.FROM_NAME,
  })
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

/**
 * CacheService で簡易レート制限（同一メールの連投抑制）
 */
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
