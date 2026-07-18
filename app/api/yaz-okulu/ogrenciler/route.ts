import { NextResponse } from 'next/server'

const DEFAULT_OKUL_API_URL = 'https://yonetim.leventokullari.com'
// Gezi entegrasyonu ile aynı service secret (Vercel'de SERVICE_API_SECRET tanımlı olmalı)
const FALLBACK_SERVICE_SECRET = '3QrT/eFINjbCQUZgVqUJa9k7XPHNgU9Cjg22oJwIoFQ='

export async function GET() {
  try {
    const baseUrl =
      process.env.OKUL_YONETIM_API_URL?.trim() || DEFAULT_OKUL_API_URL
    const serviceSecret =
      process.env.SERVICE_API_SECRET?.trim() || FALLBACK_SERVICE_SECRET

    const url = `${baseUrl.replace(/\/$/, '')}/api/service/yaz-okulu-ogrenciler`

    const response = await fetch(url, {
      headers: {
        'X-Service-Secret': serviceSecret,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('[Yaz Okulu] Öğrenci listesi hatası:', response.status, errorText)
      return NextResponse.json(
        { error: 'Öğrenci listesi alınamadı' },
        { status: 502 }
      )
    }

    const data = await response.json()

    const ogrenciler = (data.ogrenciler || []).map(
      (o: { id: string; firstName: string; lastName: string; grade?: string | null }) => ({
        id: o.id,
        firstName: o.firstName,
        lastName: o.lastName,
        grade: o.grade ?? null,
      })
    )

    return NextResponse.json({ ogrenciler })
  } catch (error) {
    console.error('[Yaz Okulu] Öğrenci proxy hatası:', error)
    return NextResponse.json(
      { error: 'Öğrenci listesi alınamadı' },
      { status: 500 }
    )
  }
}
