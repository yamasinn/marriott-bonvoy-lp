/**
 * Google Apps Script コピペ用サーバーコード（本番運用想定）
 * ------------------------------------------------------------
 * ファイル名の目安: Code.gs
 *
 * ## 今やること / 後で差し込むこと
 * - 今: このファイルを貼る → ウェブアプリとしてデプロイ → URL を LP の GAS_WEBAPP_URL へ
 * - 後: CONFIG.REFERRAL_URL だけ実URLに差し替え → 新バージョンで再デプロイ
 *
 * ## デプロイ手順（要約）
 * 1. https://script.google.com → 新しいプロジェクト
 * 2. このファイル全文を貼り付けて保存
 * 3. REFERRAL_URL はカード到着前は PLACEHOLDER のままでよい（準備中メールを送る）
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
 * - PLACEHOLDER の文字列をメール本文に載せない（準備中メールに切替）
 */

var CONFIG = {
  /** 自動返信に差し込む紹介URL（ページ非掲載）。カード到着後に実URLへ */
  REFERRAL_URL: 'https://americanexpress.com/PLACEHOLDER_REFERRAL_URL',

  /** 送信者表示名 */
  FROM_NAME: 'Marriott Bonvoyアメックス比較ガイド',

  /** 件名（紹介URL差し込み後） */
  MAIL_SUBJECT: '【Marriott Bonvoyアメックス】紹介リンクのご案内',

  /** 件名（紹介URLがまだのとき） */
  HOLDING_SUBJECT: '【Marriott Bonvoyアメックス】受け付けました（リンク準備中）',

  /**
   * 返信先（任意）。空なら送信アカウントの既定。
   * 例: 'you@example.com'
   */
  REPLY_TO: '',

  /** 受信ログ用スプレッドシートID（任意。空ならスキップ） */
  LOG_SHEET_ID: '',

  /** 同一メールの連投抑制（秒） */
  RATE_LIMIT_SECONDS: 60,

  /**
   * true: PLACEHOLDER のまま実リンクメールを送らない。
   * 代わりに準備中メールを送り、申し込みを受け付ける（今のセットアップ向け）。
   */
  BLOCK_PLACEHOLDER_REFERRAL: true,
}

/**
 * 疎通確認用 GET
 * ブラウザで Web アプリ URL を開くと JSON が返る
 * ready: true = 紹介URL差し込み済み / false = まだ PLACEHOLDER（準備中メール）
 */
function doGet() {
  return jsonResponse_({
    ok: true,
    service: 'marriott-amex-lp-mail',
    ready: !isPlaceholderReferral_(),
    message: isPlaceholderReferral_()
      ? 'REFERRAL_URL is still a placeholder. POSTs are accepted; holding email is sent until you set the real URL.'
      : 'POST JSON { "email": "you@example.com" } to receive a referral link email.',
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

    if (isRateLimited_(email)) {
      return jsonResponse_({
        ok: true,
        message: 'already accepted recently',
        rateLimited: true,
      })
    }

    var holding = CONFIG.BLOCK_PLACEHOLDER_REFERRAL && isPlaceholderReferral_()

    // 同時送信の取りこぼしを減らす
    var lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      if (holding) {
        sendHoldingMail_(email)
      } else {
        sendReferralMail_(email)
      }
      appendLog_(email, payload, holding ? 'holding' : 'referral')
    } finally {
      lock.releaseLock()
    }

    return jsonResponse_({
      ok: true,
      holding: holding,
      message: holding
        ? 'accepted; holding email sent (set REFERRAL_URL then redeploy)'
        : 'accepted; referral email sent',
    })
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
    '比較ガイド: https://marriott-bonvoy-lp.vercel.app',
    '',
    '—',
    CONFIG.FROM_NAME,
  ].join('\n')
}

function buildHoldingMailBody_(email) {
  return [
    email + ' 様',
    '',
    '受け付けました。ありがとうございます。',
    '',
    '紹介リンクの準備ができ次第、このメールアドレスへ改めてご案内します。',
    '（アメックスの紹介規約に沿い、Webには載せず個別にお送りします）',
    '',
    '先に券種の比較だけ見たい場合は、こちらをどうぞ。',
    'https://marriott-bonvoy-lp.vercel.app',
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

function sendHoldingMail_(email) {
  var options = {
    to: email,
    subject: CONFIG.HOLDING_SUBJECT,
    body: buildHoldingMailBody_(email),
    name: CONFIG.FROM_NAME,
  }
  if (CONFIG.REPLY_TO) {
    options.replyTo = CONFIG.REPLY_TO
  }
  MailApp.sendEmail(options)
}

function appendLog_(email, payload, kind) {
  if (!CONFIG.LOG_SHEET_ID) return

  var ss = SpreadsheetApp.openById(CONFIG.LOG_SHEET_ID)
  var sheet = ss.getSheets()[0]
  sheet.appendRow([
    new Date(),
    email,
    payload && payload.source ? String(payload.source) : '',
    payload && payload.timestamp ? String(payload.timestamp) : '',
    kind || '',
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
