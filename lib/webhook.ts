/**
 * Webhook utility - Diğer projeye başvuru verilerini gönderir
 */

interface WebhookPayload {
  id: string
  ogrenciAdSoyad: string
  ogrenciTc: string
  okul: string
  ogrenciSinifi: string
  ogrenciSube: string
  sinavGunu: string
  babaAdSoyad: string
  babaMeslek: string
  babaIsAdresi: string
  babaCepTel: string
  anneAdSoyad: string
  anneMeslek: string
  anneIsAdresi: string
  anneCepTel: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface YazOkuluWebhookPayload {
  id: string
  studentId: string
  ogrenciAdSoyad: string
  ogrenciSinifi: string | null
  createdAt: string
  updatedAt: string
}

interface WebhookResult {
  success: boolean
  error?: string
  retries?: number
}

async function postWebhook(
  url: string,
  payload: unknown,
  idForLog: string,
  retries: number = 3
): Promise<WebhookResult> {
  const webhookSecret = process.env.WEBHOOK_SECRET

  if (!webhookSecret) {
    console.warn('[Webhook] WEBHOOK_SECRET tanımlı değil, güvenlik riski!')
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': webhookSecret || '',
          'X-Webhook-Source': 'basvuru-sistemi',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log(`[Webhook] Başarılı - ID: ${idForLog} (Deneme: ${attempt})`)
        return { success: true, retries: attempt - 1 }
      }

      const errorText = await response.text().catch(() => 'Unknown error')
      lastError = new Error(`Webhook HTTP ${response.status}: ${errorText}`)

      if (response.status >= 400 && response.status < 500) {
        console.error(`[Webhook] Client error - Retry yapılmayacak: ${response.status}`)
        return {
          success: false,
          error: lastError.message,
          retries: attempt - 1,
        }
      }

      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.warn(
          `[Webhook] Deneme ${attempt}/${retries} başarısız, ${delay}ms sonra tekrar deneniyor...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.warn(
          `[Webhook] Deneme ${attempt}/${retries} hata: ${lastError.message}, ${delay}ms sonra tekrar deneniyor...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  console.error(`[Webhook] Tüm denemeler başarısız - ID: ${idForLog}`, lastError)

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    retries: retries - 1,
  }
}

/**
 * Webhook gönderme fonksiyonu - Retry mekanizması ile
 */
export async function sendWebhook(
  payload: WebhookPayload,
  retries: number = 3
): Promise<WebhookResult> {
  const webhookUrl = process.env.WEBHOOK_URL

  if (!webhookUrl) {
    console.error('[Webhook] ❌ WEBHOOK_URL tanımlı değil, webhook gönderilmedi!')
    console.error('[Webhook] ⚠️  Vercel Dashboard → Settings → Environment Variables → WEBHOOK_URL ekleyin')
    return { success: false, error: 'WEBHOOK_URL tanımlı değil' }
  }

  return postWebhook(webhookUrl, payload, payload.id, retries)
}

/**
 * Yaz okulu başvurusunu okul yönetim sistemine gönderir
 */
export async function sendYazOkuluWebhook(
  payload: YazOkuluWebhookPayload,
  retries: number = 3
): Promise<WebhookResult> {
  const webhookUrl =
    process.env.YAZ_OKULU_WEBHOOK_URL ||
    (process.env.OKUL_YONETIM_API_URL
      ? `${process.env.OKUL_YONETIM_API_URL.replace(/\/$/, '')}/api/webhook/yaz-okulu-basvuru`
      : '')

  if (!webhookUrl) {
    console.error('[Webhook] ❌ YAZ_OKULU_WEBHOOK_URL / OKUL_YONETIM_API_URL tanımlı değil')
    return { success: false, error: 'Yaz okulu webhook URL tanımlı değil' }
  }

  return postWebhook(webhookUrl, payload, payload.id, retries)
}

/**
 * Başvuru verisini webhook formatına dönüştürür
 */
export function formatBasvuruForWebhook(basvuru: any): WebhookPayload {
  return {
    id: basvuru.id,
    ogrenciAdSoyad: basvuru.ogrenciAdSoyad,
    ogrenciTc: basvuru.ogrenciTc,
    okul: basvuru.okul,
    ogrenciSinifi: basvuru.ogrenciSinifi,
    ogrenciSube: basvuru.ogrenciSube,
    sinavGunu: basvuru.sinavGunu,
    babaAdSoyad: basvuru.babaAdSoyad,
    babaMeslek: basvuru.babaMeslek,
    babaIsAdresi: basvuru.babaIsAdresi,
    babaCepTel: basvuru.babaCepTel,
    anneAdSoyad: basvuru.anneAdSoyad,
    anneMeslek: basvuru.anneMeslek,
    anneIsAdresi: basvuru.anneIsAdresi,
    anneCepTel: basvuru.anneCepTel,
    email: basvuru.email,
    createdAt: basvuru.createdAt.toISOString(),
    updatedAt: basvuru.updatedAt.toISOString(),
  }
}

export function formatYazOkuluBasvuruForWebhook(basvuru: {
  id: string
  studentId: string
  ogrenciAdSoyad: string
  ogrenciSinifi: string | null
  createdAt: Date
  updatedAt: Date
}): YazOkuluWebhookPayload {
  return {
    id: basvuru.id,
    studentId: basvuru.studentId,
    ogrenciAdSoyad: basvuru.ogrenciAdSoyad,
    ogrenciSinifi: basvuru.ogrenciSinifi,
    createdAt: basvuru.createdAt.toISOString(),
    updatedAt: basvuru.updatedAt.toISOString(),
  }
}
