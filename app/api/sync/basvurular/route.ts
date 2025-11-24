import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatBasvuruForWebhook } from "@/lib/webhook"

/**
 * Sync endpoint - Okul yönetim sisteminin geçmiş başvuruları çekmesi için
 * Secret ile korumalı
 */
export async function GET(request: NextRequest) {
  try {
    // Secret doğrulama
    const authHeader = request.headers.get("authorization")
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    // Authorization header kontrolü: "Bearer SECRET" veya direkt secret
    const providedSecret = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : authHeader

    if (providedSecret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Tüm başvuruları çek
    const basvurular = await prisma.basvuru.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Webhook formatına dönüştür
    const formattedBasvurular = basvurular.map(basvuru => formatBasvuruForWebhook(basvuru))

    return NextResponse.json({
      success: true,
      count: formattedBasvurular.length,
      basvurular: formattedBasvurular
    })
  } catch (error) {
    console.error("[Sync] Hata:", error)
    return NextResponse.json(
      { error: "Failed to fetch basvurular" },
      { status: 500 }
    )
  }
}

