import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  sendYazOkuluWebhook,
  formatYazOkuluBasvuruForWebhook,
} from '@/lib/webhook'

const yazOkuluBasvuruSchema = z.object({
  ogrenciAd: z.string().trim().min(2, 'Öğrenci adı zorunludur'),
  ogrenciSoyad: z.string().trim().min(2, 'Öğrenci soyadı zorunludur'),
  okul: z.string().trim().min(2, 'Okul zorunludur'),
  ogrenciSinifi: z.string().trim().min(1, 'Sınıf zorunludur'),
  veliAd: z.string().trim().min(2, 'Veli adı zorunludur'),
  veliSoyad: z.string().trim().min(2, 'Veli soyadı zorunludur'),
  veliTelefon: z
    .string()
    .regex(/^5\d{9}$/, 'Telefon 5 ile başlayan 10 haneli olmalıdır'),
  kvkkOnay: z
    .boolean()
    .refine((v) => v === true, { message: 'KVKK onayı zorunludur' }),
})

const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimit.get(ip)

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000,
    })
    return true
  }

  if (limit.count >= 5) {
    return false
  }

  limit.count++
  return true
}

export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Çok fazla başvuru yaptınız. Lütfen 15 dakika sonra tekrar deneyiniz.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const validated = yazOkuluBasvuruSchema.parse(body)

    const basvuru = await prisma.yazOkuluBasvuru.create({
      data: {
        ogrenciAd: validated.ogrenciAd,
        ogrenciSoyad: validated.ogrenciSoyad,
        okul: validated.okul,
        ogrenciSinifi: validated.ogrenciSinifi,
        veliAd: validated.veliAd,
        veliSoyad: validated.veliSoyad,
        veliTelefon: validated.veliTelefon,
      },
    })

    // Webhook'u bekle — başvurunun okula düşmesi kritik
    try {
      const webhookResult = await sendYazOkuluWebhook(
        formatYazOkuluBasvuruForWebhook(basvuru)
      )
      if (!webhookResult.success) {
        console.error(
          '[Yaz Okulu] Webhook başarısız (başvuru yerel kaydedildi):',
          webhookResult.error
        )
      }
    } catch (err) {
      console.error('[Yaz Okulu] Webhook hatası:', err)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Başvurunuz alındı',
        id: basvuru.id,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: error.issues[0]?.message || 'Geçersiz başvuru verisi',
          details: error.issues.map((e) => ({
            path: e.path.map(String),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    console.error('[Yaz Okulu] Başvuru hatası:', error)
    return NextResponse.json(
      { error: 'Başvuru kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
