# 🔗 Webhook Entegrasyonu Kurulum Rehberi

Bu rehber, başvuru sisteminden gelen verilerin diğer projenin yönetim paneline entegre edilmesi için gerekli adımları içerir.

## 📋 İçindekiler

1. [Bu Projede Yapılacaklar](#bu-projede-yapılacaklar)
2. [Diğer Projede Yapılacaklar](#diğer-projede-yapılacaklar)
3. [Test Etme](#test-etme)
4. [Sorun Giderme](#sorun-giderme)

---

## 🎯 Bu Projede Yapılacaklar

### 1. Environment Variables Ekleme

Vercel dashboard'unda veya `.env.local` dosyasına şu değişkenleri ekleyin:

```env
# Webhook URL - Diğer projenizin webhook endpoint'i
WEBHOOK_URL=https://diger-proje.vercel.app/api/webhook/basvuru

# Webhook Secret - Güvenlik için (diğer projede de aynı değeri kullanın)
WEBHOOK_SECRET=your-super-secret-key-here-min-32-chars
```

**Önemli:** `WEBHOOK_SECRET` için güçlü bir key oluşturun:
```bash
# Terminal'de güçlü bir secret oluşturmak için:
openssl rand -base64 32
```

### 2. Vercel Environment Variables

Vercel dashboard'unda:
1. Proje → Settings → Environment Variables
2. Şu değişkenleri ekleyin:
   - `WEBHOOK_URL` (Production, Preview, Development)
   - `WEBHOOK_SECRET` (Production, Preview, Development)

### 3. Kod Zaten Hazır! ✅

Webhook gönderme mekanizması otomatik olarak çalışacak. Yeni başvuru geldiğinde:
- Başvuru veritabanına kaydedilir
- Ardından webhook otomatik gönderilir
- Webhook başarısız olsa bile başvuru kaydedilmiş olur (kullanıcı etkilenmez)

---

## 🎯 Diğer Projede Yapılacaklar

### 1. Webhook Endpoint Oluşturma

Diğer projenizde şu dosyayı oluşturun:

**`app/api/webhook/basvuru/route.ts`**

```typescript
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import crypto from "crypto"

// Neon Database veya kullandığınız veritabanı client'ınızı import edin
// import { db } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // 1. Secret doğrulama
    const headersList = await headers()
    const webhookSecret = headersList.get("x-webhook-secret")
    const expectedSecret = process.env.WEBHOOK_SECRET

    if (!expectedSecret) {
      console.error("[Webhook] WEBHOOK_SECRET tanımlı değil")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (webhookSecret !== expectedSecret) {
      console.warn("[Webhook] Geçersiz secret - Yetkisiz erişim denemesi")
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // 2. Source doğrulama (opsiyonel ama önerilir)
    const source = headersList.get("x-webhook-source")
    if (source !== "basvuru-sistemi") {
      console.warn(`[Webhook] Beklenmeyen source: ${source}`)
      // İsterseniz burada da hata dönebilirsiniz
    }

    // 3. Request body'yi al
    const payload = await request.json()

    // 4. Veri validasyonu (opsiyonel ama önerilir)
    if (!payload.id || !payload.ogrenciTc || !payload.email) {
      return NextResponse.json(
        { error: "Invalid payload - missing required fields" },
        { status: 400 }
      )
    }

    // 5. Veritabanına kaydet
    // ÖRNEK - Kendi veritabanı yapınıza göre düzenleyin:
    
    // Prisma kullanıyorsanız:
    // const basvuru = await prisma.basvuru.create({
    //   data: {
    //     externalId: payload.id, // Başvuru sistemindeki ID
    //     ogrenciAdSoyad: payload.ogrenciAdSoyad,
    //     ogrenciTc: payload.ogrenciTc,
    //     okul: payload.okul,
    //     ogrenciSinifi: payload.ogrenciSinifi,
    //     babaAdSoyad: payload.babaAdSoyad,
    //     babaMeslek: payload.babaMeslek,
    //     babaIsAdresi: payload.babaIsAdresi,
    //     babaCepTel: payload.babaCepTel,
    //     anneAdSoyad: payload.anneAdSoyad,
    //     anneMeslek: payload.anneMeslek,
    //     anneIsAdresi: payload.anneIsAdresi,
    //     anneCepTel: payload.anneCepTel,
    //     email: payload.email,
    //     createdAt: new Date(payload.createdAt),
    //   }
    // })

    // Veya SQL ile:
    // await db.query(`
    //   INSERT INTO basvurular (
    //     external_id, ogrenci_ad_soyad, ogrenci_tc, ...
    //   ) VALUES ($1, $2, $3, ...)
    // `, [payload.id, payload.ogrenciAdSoyad, payload.ogrenciTc, ...])

    // 6. Başarılı yanıt döndür
    console.log(`[Webhook] Başvuru başarıyla alındı: ${payload.id}`)
    
    return NextResponse.json(
      { 
        success: true, 
        message: "Başvuru alındı",
        id: payload.id 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error("[Webhook] Hata:", error)
    
    // Hata durumunda 500 döndür (retry için)
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
```

### 2. Environment Variables Ekleme

Diğer projenizde de `.env.local` veya Vercel'de:

```env
WEBHOOK_SECRET=your-super-secret-key-here-min-32-chars
```

**ÖNEMLİ:** Her iki projede de `WEBHOOK_SECRET` aynı olmalı!

### 3. Veritabanı Schema'sı (Örnek)

Diğer projenizde başvuruları saklamak için bir tablo oluşturmanız gerekebilir:

```sql
-- Prisma schema örneği
model Basvuru {
  id               String   @id @default(cuid())
  externalId       String   @unique // Başvuru sistemindeki ID
  ogrenciAdSoyad   String
  ogrenciTc        String
  okul             String
  ogrenciSinifi    String
  babaAdSoyad      String
  babaMeslek       String
  babaIsAdresi     String?
  babaCepTel       String
  anneAdSoyad      String
  anneMeslek       String
  anneIsAdresi     String?
  anneCepTel       String
  email            String
  createdAt        DateTime
  syncedAt         DateTime @default(now())
  
  @@index([externalId])
  @@index([ogrenciTc])
}
```

### 4. Admin Panelinde Görüntüleme

Mevcut admin panelinizde başvuruları listeleyen bir sayfa oluşturun. Veritabanından çekip gösterin.

---

## 🧪 Test Etme

### 1. Webhook URL'ini Test Etme

```bash
# Terminal'de test edebilirsiniz:
curl -X POST https://diger-proje.vercel.app/api/webhook/basvuru \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: your-secret-key" \
  -H "X-Webhook-Source: basvuru-sistemi" \
  -d '{
    "id": "test-123",
    "ogrenciAdSoyad": "TEST ÖĞRENCİ",
    "ogrenciTc": "12345678901",
    "okul": "Test Okulu",
    "ogrenciSinifi": "5. Sınıf",
    "babaAdSoyad": "TEST BABA",
    "babaMeslek": "Test Meslek",
    "babaIsAdresi": null,
    "babaCepTel": "5551234567",
    "anneAdSoyad": "TEST ANNE",
    "anneMeslek": "Test Meslek",
    "anneIsAdresi": null,
    "anneCepTel": "5557654321",
    "email": "test@example.com",
    "createdAt": "2025-01-27T10:00:00.000Z",
    "updatedAt": "2025-01-27T10:00:00.000Z"
  }'
```

### 2. Gerçek Başvuru ile Test

1. Başvuru formunu doldurup gönderin
2. Diğer projenizin Vercel logs'larını kontrol edin
3. Veritabanında kaydın oluştuğunu kontrol edin

### 3. Log Kontrolü

**Bu projede (başvuru sistemi):**
- Vercel → Proje → Logs
- `[Webhook]` ile başlayan logları kontrol edin

**Diğer projede:**
- Vercel → Proje → Logs
- `[Webhook]` ile başlayan logları kontrol edin

---

## 🔧 Sorun Giderme

### Webhook Gönderilmiyor

1. ✅ `WEBHOOK_URL` doğru mu?
2. ✅ `WEBHOOK_SECRET` her iki projede de aynı mı?
3. ✅ Vercel logs'larını kontrol edin
4. ✅ Network hatası var mı? (CORS, timeout vb.)

### 401 Unauthorized Hatası

- `WEBHOOK_SECRET` her iki projede de aynı olmalı
- Header'da `X-Webhook-Secret` doğru gönderiliyor mu kontrol edin

### 500 Internal Server Error

- Diğer projenin webhook endpoint'inde hata var
- Veritabanı bağlantısı çalışıyor mu?
- Logs'larda detaylı hata mesajını kontrol edin

### Webhook Başarısız Olsa Bile Başvuru Kaydediliyor

Bu normal! Webhook gönderimi asenkron çalışır. Başvuru kesinlikle kaydedilir, webhook başarısız olsa bile kullanıcı etkilenmez.

### Retry Mekanizması

Webhook başarısız olursa:
- 3 kez otomatik deneme yapılır
- Exponential backoff ile (1s, 2s, 4s)
- 5xx hataları için retry yapılır
- 4xx hataları için retry yapılmaz (client error)

---

## 📊 Webhook Payload Yapısı

```typescript
{
  id: string                    // Başvuru ID (cuid)
  ogrenciAdSoyad: string
  ogrenciTc: string              // 11 haneli
  okul: string
  ogrenciSinifi: string         // "5. Sınıf" formatında
  babaAdSoyad: string
  babaMeslek: string
  babaIsAdresi: string | null
  babaCepTel: string            // 10 haneli (5XXXXXXXXX)
  anneAdSoyad: string
  anneMeslek: string
  anneIsAdresi: string | null
  anneCepTel: string            // 10 haneli (5XXXXXXXXX)
  email: string
  createdAt: string             // ISO 8601 format
  updatedAt: string             // ISO 8601 format
}
```

---

## 🚀 Sonraki Adımlar

1. ✅ Her iki projede de environment variables'ları ayarlayın
2. ✅ Diğer projede webhook endpoint'ini oluşturun
3. ✅ Veritabanı schema'sını hazırlayın
4. ✅ Test başvurusu gönderin
5. ✅ Admin panelinde başvuruları görüntüleyin

Sorularınız için issue açabilir veya iletişime geçebilirsiniz! 🎉

