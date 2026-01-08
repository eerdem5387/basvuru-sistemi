import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const MAX_4_SINIF_QUOTA = 560

export async function GET() {
  try {
    // 4. sınıf başvurularını say
    const count = await prisma.basvuru.count({
      where: {
        ogrenciSinifi: "4. Sınıf"
      }
    })

    const remaining = Math.max(0, MAX_4_SINIF_QUOTA - count)
    const isFull = count >= MAX_4_SINIF_QUOTA

    return NextResponse.json({
      current: count,
      max: MAX_4_SINIF_QUOTA,
      remaining,
      isFull
    })
  } catch (error) {
    console.error("Kota kontrolü hatası:", error)
    return NextResponse.json(
      { error: "Kota bilgisi alınamadı" },
      { status: 500 }
    )
  }
}

