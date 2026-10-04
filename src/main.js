import { CONFIG } from './config.js'

const QUIZ_COPY = {
  premium:
    'プレミアムから見てみるのがよさそう。無料宿泊（400万円条件）や、500万円でのプラチナも現実味が出てきます。',
  standard:
    '一般寄りで見てみるのがよさそう。250万円条件の無料宿泊を、年会費を抑えつつ狙いやすい帯です。',
  other:
    '先に一般寄りで試算してみるのが無難。250万円の見通しが立ってから、プレミアムを考え直せばOKです。',
}

function isPlaceholder(value) {
  const v = String(value || '').trim()
  return !v || v.includes('PLACEHOLDER')
}

function initLineCta() {
  const link = document.getElementById('line-cta')
  if (!link) return

  if (isPlaceholder(CONFIG.LINE_FRIEND_URL)) {
    link.removeAttribute('href')
    link.removeAttribute('target')
    link.setAttribute('aria-disabled', 'true')
    link.classList.add('pointer-events-none', 'opacity-50')
    link.textContent = 'LINE受付は準備中'
    const note = document.createElement('p')
    note.className = 'mt-3 text-sm text-stone'
    note.textContent = '準備中です。メールでも受け付け開始までお待ちください。'
    link.insertAdjacentElement('afterend', note)
    return
  }

  link.href = CONFIG.LINE_FRIEND_URL
}

function initQuiz() {
  const buttons = document.querySelectorAll('.quiz-option')
  const result = document.getElementById('quiz-result')
  if (!buttons.length || !result) return

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const answer = button.dataset.answer
      buttons.forEach((b) => b.classList.toggle('is-selected', b === button))
      result.textContent = QUIZ_COPY[answer] || ''
      result.classList.remove('hidden')
      result.classList.add('is-visible')
    })
  })
}

function setFormStatus(el, message, state) {
  el.textContent = message
  el.classList.remove('is-success', 'is-error', 'is-loading')
  if (state) el.classList.add(`is-${state}`)
}

/**
 * GAS Webアプリ向けの送信。
 * Content-Type を text/plain にしてプリフライトを避け、CORS リダイレクト問題を緩和する。
 * レスポンスが opaque / 読み取れない場合でも送信自体は到達している想定で成功扱いする。
 */
async function postToGas(payload) {
  const url = CONFIG.GAS_WEBAPP_URL
  if (isPlaceholder(url)) {
    const err = new Error('GAS_WEBAPP_URL が未設定です')
    err.code = 'CONFIG'
    throw err
  }

  const response = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  })

  // リダイレクト後の本文が読める場合は JSON を確認
  const text = await response.text()
  if (!text) {
    return { ok: true, opaque: true }
  }

  try {
    return JSON.parse(text)
  } catch {
    // HTML 等が返っても、到達していれば成功扱いに寄せる
    return { ok: response.ok, raw: true }
  }
}

function initEmailForm() {
  const form = document.getElementById('email-form')
  const emailInput = document.getElementById('email')
  const submit = document.getElementById('email-submit')
  const status = document.getElementById('form-status')
  if (!form || !emailInput || !submit || !status) return

  if (isPlaceholder(CONFIG.GAS_WEBAPP_URL)) {
    setFormStatus(status, 'メール受付は準備中です。設定が終わり次第ご利用いただけます。', 'loading')
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()

    const email = emailInput.value.trim()
    if (!email || !emailInput.checkValidity()) {
      setFormStatus(status, '有効なメールアドレスを入力してください。', 'error')
      emailInput.focus()
      return
    }

    submit.disabled = true
    setFormStatus(status, '送信中です…', 'loading')

    try {
      const result = await postToGas({
        email,
        source: 'marriott-amex-lp',
        timestamp: new Date().toISOString(),
      })

      if (result && result.ok === false) {
        throw new Error(result.message || '送信に失敗しました')
      }

      if (result && result.holding) {
        setFormStatus(
          status,
          '受け付けました。紹介リンクの準備ができ次第、メールでご案内します（迷惑メールフォルダもご確認ください）。',
          'success',
        )
      } else {
        setFormStatus(
          status,
          '受け付けました。自動返信メールをご確認ください（届かない場合は迷惑メールフォルダもご確認ください）。',
          'success',
        )
      }
      form.reset()
    } catch (error) {
      if (error && error.code === 'CONFIG') {
        setFormStatus(
          status,
          '準備中です。しばらくしてからお試しいただくか、LINEからお受け取りください。',
          'error',
        )
      } else {
        setFormStatus(
          status,
          '送信に失敗しました。時間をおいて再度お試しいただくか、LINEからお受け取りください。',
          'error',
        )
      }
      console.error(error)
    } finally {
      submit.disabled = false
    }
  })
}

initLineCta()
initQuiz()
initEmailForm()
