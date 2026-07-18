import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const baseUrl = process.env.OKUL_YONETIM_API_URL
    const serviceSecret = process.env.SERVICE_API_SECRET

    if (!baseUrl) {
      return NextResponse.json(
        { error: 'OKUL_YONETIM_API_URL tanımlı değil' },
        { status: 500 }
      )
    }

    if (!serviceSecret) {
      return NextResponse.json(
        { error: 'SERVICE_API_SECRET tanımlı değil' },
        { status: 500 }
      )
    }

    const url = `${baseUrl.replace(/\/$/, '')}/api/students/yaz-okulu`

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

    // Dropdown için yalnızca güvenli alanları ilet
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
