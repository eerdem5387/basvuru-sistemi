import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import {
  sendYazOkuluWebhook,
  formatYazOkuluBasvuruForWebhook,
} from '@/lib/webhook'

const yazOkuluBasvuruSchema = z.object({
  studentId: z.string().min(1, 'Öğrenci seçimi zorunludur'),
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

async function fetchStudentFromOkul(studentId: string) {
  const baseUrl =
    process.env.OKUL_YONETIM_API_URL?.trim() ||
    'https://yonetim.leventokullari.com'
  const serviceSecret = process.env.SERVICE_API_SECRET?.trim()

  if (!serviceSecret) {
    return null
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/students/yaz-okulu?id=${encodeURIComponent(studentId)}`

  const response = await fetch(url, {
    headers: {
      'X-Service-Secret': serviceSecret,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json()
  const ogrenciler: Array<{
    id: string
    firstName: string
    lastName: string
    grade?: string | null
  }> = data.ogrenciler || []

  return ogrenciler.find((o) => o.id === studentId) || null
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

    const existing = await prisma.yazOkuluBasvuru.findUnique({
      where: { studentId: validated.studentId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu öğrenci için daha önce yaz okulu başvurusu yapılmış.' },
        { status: 409 }
      )
    }

    const student = await fetchStudentFromOkul(validated.studentId)
    if (!student) {
      return NextResponse.json(
        { error: 'Seçilen öğrenci bulunamadı. Lütfen sayfayı yenileyip tekrar deneyiniz.' },
        { status: 400 }
      )
    }

    const ogrenciAdSoyad = `${student.firstName} ${student.lastName}`.trim()

    const basvuru = await prisma.yazOkuluBasvuru.create({
      data: {
        studentId: student.id,
        ogrenciAdSoyad,
        ogrenciSinifi: student.grade || null,
      },
    })

    // Webhook async - başvuru başarısını engellemez
    sendYazOkuluWebhook(formatYazOkuluBasvuruForWebhook(basvuru)).catch((err) => {
      console.error('[Yaz Okulu] Webhook hatası:', err)
    })

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
          error: 'Geçersiz başvuru verisi',
          details: error.issues.map((e) => ({
            path: e.path.map(String),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu öğrenci için daha önce yaz okulu başvurusu yapılmış.' },
        { status: 409 }
      )
    }

    console.error('[Yaz Okulu] Başvuru hatası:', error)
    return NextResponse.json(
      { error: 'Başvuru kaydedilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
