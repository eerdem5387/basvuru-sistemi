import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }
    
    const basvurular = await prisma.basvuru.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(basvurular)
  } catch (error) {
    console.error("Başvurular getirme hatası:", error)
    
    // Prisma connection errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'P1001' || error.code === 'P1002') {
        return NextResponse.json(
          { error: "Veritabanı bağlantı hatası" },
          { status: 503 }
        )
      }
    }
    
    return NextResponse.json(
      { error: "Başvurular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

