import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { basvuruSchema } from "@/lib/validations"
import { z } from "zod"

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
    
    // Validasyon
    const validatedData = basvuruSchema.parse(body)
    
    // Telefon numaraları zaten 10 hane olarak geliyor (frontend'de kontrol ediliyor)
    const babaCepTel = validatedData.babaCepTel
    const anneCepTel = validatedData.anneCepTel
    
    // TC Kimlik No ile daha önce başvuru yapılmış mı kontrol et
    const existingBasvuru = await prisma.basvuru.findUnique({
      where: { ogrenciTc: validatedData.ogrenciTc }
    })
    
    if (existingBasvuru) {
      return NextResponse.json(
        { error: "Bu TC Kimlik No ile daha önce başvuru yapılmış." },
        { status: 400 }
      )
    }
    
    // Başvuruyu kaydet
    const basvuru = await prisma.basvuru.create({
      data: {
        ...validatedData,
        babaCepTel,
        anneCepTel,
      }
    })
    
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
        { error: "Formu eksiksiz ve doğru doldurunuz.", details: error.issues },
        { status: 400 }
      )
    }
    
    // Prisma connection errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Bu TC Kimlik No ile daha önce başvuru yapılmış." },
          { status: 400 }
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

