import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
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
    return NextResponse.json(
      { error: "Başvurular getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}

