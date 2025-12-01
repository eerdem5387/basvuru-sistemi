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

interface WebhookResult {
  success: boolean
  error?: string
  retries?: number
}

/**
 * Webhook gönderme fonksiyonu - Retry mekanizması ile
 */
export async function sendWebhook(
  payload: WebhookPayload,
  retries: number = 3
): Promise<WebhookResult> {
  const webhookUrl = process.env.WEBHOOK_URL
  const webhookSecret = process.env.WEBHOOK_SECRET

  // Webhook URL yapılandırılmamışsa sessizce başarılı döner (opsiyonel özellik)
  if (!webhookUrl) {
    console.error('[Webhook] ❌ WEBHOOK_URL tanımlı değil, webhook gönderilmedi!')
    console.error('[Webhook] ⚠️  Vercel Dashboard → Settings → Environment Variables → WEBHOOK_URL ekleyin')
    return { success: false, error: 'WEBHOOK_URL tanımlı değil' }
  }

  if (!webhookSecret) {
    console.warn('[Webhook] WEBHOOK_SECRET tanımlı değil, güvenlik riski!')
  }

  let lastError: Error | null = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Timeout için AbortController kullan
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 saniye timeout

      const response = await fetch(webhookUrl, {
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
        console.log(`[Webhook] Başarılı - Başvuru ID: ${payload.id} (Deneme: ${attempt})`)
        return { success: true, retries: attempt - 1 }
      }

      // HTTP hata kodları
      const errorText = await response.text().catch(() => 'Unknown error')
      lastError = new Error(
        `Webhook HTTP ${response.status}: ${errorText}`
      )

      // 4xx hataları için retry yapma (client error)
      if (response.status >= 400 && response.status < 500) {
        console.error(`[Webhook] Client error - Retry yapılmayacak: ${response.status}`)
        return {
          success: false,
          error: lastError.message,
          retries: attempt - 1,
        }
      }

      // 5xx hataları için retry yap
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Exponential backoff, max 10s
        console.warn(
          `[Webhook] Deneme ${attempt}/${retries} başarısız, ${delay}ms sonra tekrar deneniyor...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Timeout veya network hataları için retry yap
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000)
        console.warn(
          `[Webhook] Deneme ${attempt}/${retries} hata: ${lastError.message}, ${delay}ms sonra tekrar deneniyor...`
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  // Tüm denemeler başarısız
  console.error(
    `[Webhook] Tüm denemeler başarısız - Başvuru ID: ${payload.id}`,
    lastError
  )

  return {
    success: false,
    error: lastError?.message || 'Unknown error',
    retries: retries - 1,
  }
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

