import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { basvuruSchema } from "@/lib/validations"
import { z } from "zod"
import { sendWebhook, formatBasvuruForWebhook } from "@/lib/webhook"
import { ADRES_IL } from "@/lib/rize-adres"
import { BURSLULUK_DONEM, oturumBul } from "@/lib/basvuru-sabitleri"

// Rate limiting için basit bir in-memory cache
const rateLimit = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const limit = rateLimit.get(ip)
  
  if (!limit || now > limit.resetTime) {
    // Her IP için 15 dakikada maksimum 3 başvuru
    rateLimit.set(ip, {
      count: 1,
      resetTime: now + 15 * 60 * 1000
    })
    return true
  }
  
  if (limit.count >= 3) {
    return false
  }
  
  limit.count++
  return true
}

const DUPLICATE_MESSAGE = "Bu TC Kimlik No ile bu dönemin bursluluk sınavına zaten başvuru yapılmış."

export async function POST(request: Request) {
  try {
    // Rate limiting kontrolü
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Çok fazla başvuru yaptınız. Lütfen 15 dakika sonra tekrar deneyiniz." },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validasyon (istemciyle aynı şema)
    const v = basvuruSchema.parse(body)
    // Şema oturum değerini listeye karşı doğruladığı için burada her zaman bulunur
    const oturum = oturumBul(v.oturum)!

    // Aynı öğrenci bu dönemin sınavına daha önce başvurmuş mu?
    // (Önceki dönemlerdeki başvurular yeni başvuruya engel değildir.)
    const existingBasvuru = await prisma.basvuru.findUnique({
      where: { ogrenciTc_donem: { ogrenciTc: v.ogrenciTc, donem: BURSLULUK_DONEM } }
    })

    if (existingBasvuru) {
      return NextResponse.json(
        { error: DUPLICATE_MESSAGE, details: [{ path: ["ogrenciTc"], message: DUPLICATE_MESSAGE }] },
        { status: 409 }
      )
    }

    // Başvuruyu kaydet
    const basvuru = await prisma.basvuru.create({
      data: {
        ogrenciAdSoyad: `${v.ogrenciAd} ${v.ogrenciSoyad}`,
        ogrenciTc: v.ogrenciTc,
        donem: BURSLULUK_DONEM,
        okul: v.okul,
        ogrenciSinifi: v.ogrenciSinifi,
        sinavGunu: oturum.gun,
        oturum: oturum.oturum,
        anneAdSoyad: `${v.anneAd} ${v.anneSoyad}`,
        anneMeslek: v.anneMeslek,
        anneCepTel: v.anneCepTel,
        babaAdSoyad: `${v.babaAd} ${v.babaSoyad}`,
        babaMeslek: v.babaMeslek,
        babaCepTel: v.babaCepTel,
        adresIl: ADRES_IL,
        adresIlce: v.adresIlce,
        adresMahalle: v.adresMahalle,
        adresDetay: v.adresDetay,
      }
    })
    
    // Webhook'u asenkron olarak gönder (kullanıcıyı bekletme)
    // Hata olsa bile başvuru kaydedildi, webhook başarısız olabilir
    console.log('[Başvuru] Webhook gönderiliyor...', {
      basvuruId: basvuru.id,
      webhookUrl: process.env.WEBHOOK_URL || 'TANIMLI DEĞİL',
      hasSecret: !!process.env.WEBHOOK_SECRET
    })
    
    // Webhook'u bekle: sunucusuz ortamda yanıt döndükten sonra arka plan işi kesilebilir.
    // Hata olsa bile başvuru kaydedildi; okul yönetim sistemi /sync ile sonradan çekebilir.
    try {
      const result = await sendWebhook(formatBasvuruForWebhook(basvuru))
      if (!result.success) {
        console.error('[Başvuru] ❌ Webhook gönderilemedi:', result.error, 'Retries:', result.retries)
      }
    } catch (error) {
      console.error('[Başvuru] ❌ Webhook gönderim hatası:', error)
    }

    return NextResponse.json(
      { 
        success: true, 
        message: "Başvurunuz başarıyla alındı. Teşekkür ederiz.",
        id: basvuru.id 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Formu eksiksiz ve doğru doldurunuz.",
          details: error.issues.map((i) => ({ path: i.path.map(String), message: i.message })),
        },
        { status: 400 }
      )
    }
    
    // Prisma connection errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: DUPLICATE_MESSAGE, details: [{ path: ["ogrenciTc"], message: DUPLICATE_MESSAGE }] },
          { status: 409 }
        )
      }
      if (error.code === 'P1001' || error.code === 'P1002') {
        return NextResponse.json(
          { error: "Veritabanı bağlantı hatası. Lütfen daha sonra tekrar deneyiniz." },
          { status: 503 }
        )
      }
    }
    
    console.error("Başvuru hatası:", error)
    return NextResponse.json(
      { error: "Başvuru kaydedilirken bir hata oluştu. Lütfen tekrar deneyiniz." },
      { status: 500 }
    )
  }
}

