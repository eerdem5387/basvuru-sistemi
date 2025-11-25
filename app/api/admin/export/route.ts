import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 401 }
      )
    }
    
    // Query parametrelerini al
    const { searchParams } = new URL(request.url)
    const tarihBaslangic = searchParams.get('tarihBaslangic')
    const tarihBitis = searchParams.get('tarihBitis')
    const sinif = searchParams.get('sinif')
    const okul = searchParams.get('okul')
    
    // Filtreleme için where koşulları
    const where: any = {}
    
    if (tarihBaslangic || tarihBitis) {
      where.createdAt = {}
      if (tarihBaslangic) {
        where.createdAt.gte = new Date(tarihBaslangic)
      }
      if (tarihBitis) {
        where.createdAt.lte = new Date(tarihBitis + 'T23:59:59')
      }
    }
    
    if (sinif) {
      where.ogrenciSinifi = sinif
    }
    
    if (okul) {
      where.okul = okul
    }
    
    const basvurular = await prisma.basvuru.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Excel için veriyi hazırla
    const excelData = basvurular.map((b, index) => ({
      'Sıra': index + 1,
      'Öğrenci Ad Soyad': b.ogrenciAdSoyad,
      'TC Kimlik No': b.ogrenciTc,
      'Okul': b.okul,
      'Sınıf': b.ogrenciSinifi,
      'Şube': b.ogrenciSube,
      'Baba Ad Soyad': b.babaAdSoyad,
      'Baba Meslek': b.babaMeslek,
      'Baba İş Adresi': b.babaIsAdresi || '-',
      'Baba Cep Tel': b.babaCepTel,
      'Anne Ad Soyad': b.anneAdSoyad,
      'Anne Meslek': b.anneMeslek,
      'Anne İş Adresi': b.anneIsAdresi || '-',
      'Anne Cep Tel': b.anneCepTel,
      'E-posta': b.email,
      'Başvuru Tarihi': new Date(b.createdAt).toLocaleString('tr-TR'),
    }))
    
    // Excel workbook oluştur
    const ws = XLSX.utils.json_to_sheet(excelData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Başvurular")
    
    // Buffer'a çevir
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    
    // Response oluştur
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="basvurular-${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error("Excel export hatası:", error)
    
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
      { error: "Excel dosyası oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

