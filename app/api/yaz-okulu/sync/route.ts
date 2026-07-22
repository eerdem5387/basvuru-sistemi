import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendYazOkuluWebhook,
  formatYazOkuluBasvuruForWebhook,
} from '@/lib/webhook'

/**
 * Mevcut yaz okulu başvurularını okul yönetim sistemine yeniden gönderir.
 * Auth: Authorization Bearer WEBHOOK_SECRET veya X-Service-Secret
 */
export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const serviceSecretHeader = request.headers.get('x-service-secret') || ''
    const webhookSecret = process.env.WEBHOOK_SECRET?.trim()
    const serviceSecret =
      process.env.SERVICE_API_SECRET?.trim() ||
      '3QrT/eFINjbCQUZgVqUJa9k7XPHNgU9Cjg22oJwIoFQ='

    const authorized =
      (!!webhookSecret && auth === `Bearer ${webhookSecret}`) ||
      serviceSecretHeader === serviceSecret

    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const basvurular = await prisma.yazOkuluBasvuru.findMany({
      orderBy: { createdAt: 'asc' },
    })

    let synced = 0
    let failed = 0
    const errors: Array<{ id: string; error: string }> = []

    for (const basvuru of basvurular) {
      const result = await sendYazOkuluWebhook(
        formatYazOkuluBasvuruForWebhook(basvuru)
      )
      if (result.success) {
        synced++
      } else {
        failed++
        errors.push({ id: basvuru.id, error: result.error || 'unknown' })
      }
    }

    return NextResponse.json({
      total: basvurular.length,
      synced,
      failed,
      errors,
    })
  } catch (error) {
    console.error('[Yaz Okulu Sync] Hata:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
