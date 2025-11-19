import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import * as XLSX from "xlsx"

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
    
    // Excel için veriyi hazırla
    const excelData = basvurular.map((b, index) => ({
      'Sıra': index + 1,
      'Öğrenci Ad Soyad': b.ogrenciAdSoyad,
      'TC Kimlik No': b.ogrenciTc,
      'Okul': b.okul,
      'Sınıf': b.ogrenciSinifi,
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
    return NextResponse.json(
      { error: "Excel dosyası oluşturulurken bir hata oluştu" },
      { status: 500 }
    )
  }
}

