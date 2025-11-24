# 🔧 Webhook Sorun Giderme Rehberi

Bu rehber, webhook'un neden çalışmadığını tespit etmek için adım adım kontrol listesidir.

## 📋 Adım Adım Kontrol

### Adım 1: Environment Variables Kontrolü

#### Başvuru Sisteminde (basvuru-sistemi)

**Vercel Dashboard:**
1. Vercel → basvuru-sistemi → Settings → Environment Variables
2. Kontrol edin:
   - [ ] `WEBHOOK_URL` var mı?
   - [ ] `WEBHOOK_SECRET` var mı?

**Kontrol komutu (local'de):**
```bash
cd basvuru-sistemi
echo $WEBHOOK_URL
echo $WEBHOOK_SECRET
```

**Beklenen:**
- `WEBHOOK_URL` = `https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru`
- `WEBHOOK_SECRET` = (güçlü bir secret, 32+ karakter)

---

#### Okul Yönetim Sisteminde (okul-yonetim-sistemi)

**Vercel Dashboard:**
1. Vercel → okul-yonetim-sistemi → Settings → Environment Variables
2. Kontrol edin:
   - [ ] `WEBHOOK_SECRET` var mı?
   - [ ] Başvuru sistemi ile **AYNI** mı?

**Kontrol komutu (local'de):**
```bash
cd okul-yonetim-sistemi
echo $WEBHOOK_SECRET
```

**Beklenen:**
- `WEBHOOK_SECRET` = (başvuru sistemi ile TAMAMEN AYNI)

---

### Adım 2: Vercel Logs Kontrolü

#### Başvuru Sisteminde

**Test:**
1. Yeni bir başvuru gönderin
2. Vercel → basvuru-sistemi → Logs
3. Şu logları arayın:

**✅ Başarılı Senaryo:**
```
[Başvuru] Webhook gönderiliyor... { basvuruId: 'xxx', webhookUrl: 'https://...', hasSecret: true }
[Webhook] Başarılı - Başvuru ID: xxx (Deneme: 1)
[Başvuru] ✅ Webhook başarıyla gönderildi: xxx
```

**❌ Hata Senaryoları:**

**Hata 1: WEBHOOK_URL yok**
```
[Webhook] ❌ WEBHOOK_URL tanımlı değil, webhook gönderilmedi!
[Webhook] ⚠️  Vercel Dashboard → Settings → Environment Variables → WEBHOOK_URL ekleyin
```

**Hata 2: Network hatası**
```
[Webhook] Deneme 1/3 başarısız, 1000ms sonra tekrar deneniyor...
[Webhook] Tüm denemeler başarısız - Başvuru ID: xxx
```

**Hata 3: 401 Unauthorized**
```
[Webhook] Client error - Retry yapılmayacak: 401
```

---

#### Okul Yönetim Sisteminde

**Test:**
1. Başvuru gönderdikten sonra
2. Vercel → okul-yonetim-sistemi → Logs
3. Şu logları arayın:

**✅ Başarılı Senaryo:**
```
[Webhook] Başvuru başarıyla alındı: xxx -> yyy
```

**❌ Hata Senaryoları:**

**Hata 1: Secret yanlış**
```
[Webhook] Geçersiz secret - Yetkisiz erişim denemesi
```

**Hata 2: Secret yok**
```
[Webhook] WEBHOOK_SECRET tanımlı değil
```

**Hata 3: Veritabanı hatası**
```
[Webhook] Hata: P2002: Unique constraint failed
```

---

### Adım 3: Manuel Webhook Testi

**Terminal'de test edin:**

```bash
curl -X POST https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET_HERE" \
  -H "X-Webhook-Source: basvuru-sistemi" \
  -d '{
    "id": "test-' + $(date +%s) + '",
    "ogrenciAdSoyad": "TEST ÖĞRENCİ",
    "ogrenciTc": "46879131346",
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
    "createdAt": "' + $(date -u +"%Y-%m-%dT%H:%M:%S.000Z") + '",
    "updatedAt": "' + $(date -u +"%Y-%m-%dT%H:%M:%S.000Z") + '"
  }'
```

**Beklenen yanıt:**
```json
{
  "success": true,
  "message": "Başvuru alındı",
  "id": "..."
}
```

---

### Adım 4: Debug Endpoint Kontrolü

**Okul yönetim sisteminde:**

```
https://okul-yonetim-sistemi.vercel.app/api/debug/basvurular
```

**Beklenen yanıt:**
```json
{
  "count": 1,
  "basvurular": [...],
  "message": "1 başvuru bulundu"
}
```

---

## 🐛 Yaygın Sorunlar ve Çözümleri

### Sorun 1: `WEBHOOK_URL tanımlı değil`

**Sebep:** Environment variable eksik

**Çözüm:**
1. Vercel Dashboard → basvuru-sistemi → Settings → Environment Variables
2. `WEBHOOK_URL` ekleyin: `https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru`
3. **Redeploy yapın** (önemli!)

---

### Sorun 2: `401 Unauthorized`

**Sebep:** Secret'lar farklı

**Çözüm:**
1. Her iki projede de `WEBHOOK_SECRET` kontrol edin
2. **TAMAMEN AYNI** olmalı (karakter karakter)
3. Her iki projeyi de **Redeploy** yapın

**Kontrol:**
- Başvuru sisteminde secret: `abc123...`
- Okul yönetim sisteminde secret: `abc123...` (AYNI olmalı)

---

### Sorun 3: `Connection Refused` veya `Network Error`

**Sebep:** Webhook URL yanlış veya okul yönetim sistemi çalışmıyor

**Çözüm:**
1. `WEBHOOK_URL` doğru mu kontrol edin
2. Okul yönetim sisteminin çalıştığından emin olun
3. Vercel deployment'ını kontrol edin
4. URL'de trailing slash (`/`) olmamalı

---

### Sorun 4: Webhook Gönderiliyor Ama Veritabanında Yok

**Sebep:** Okul yönetim sisteminde hata

**Çözüm:**
1. Okul yönetim sisteminin logs'larını kontrol edin
2. Veritabanı bağlantısını kontrol edin
3. Migration çalıştırıldı mı kontrol edin: `npx prisma db push`

---

### Sorun 5: Environment Variables Değişikliği Sonrası Çalışmıyor

**Sebep:** Redeploy yapılmamış

**Çözüm:**
1. Environment variable ekledikten sonra **MUTLAKA redeploy yapın**
2. Vercel Dashboard → Deployments → Redeploy

---

## ✅ Hızlı Kontrol Listesi

1. [ ] Başvuru sisteminde `WEBHOOK_URL` var mı?
2. [ ] Başvuru sisteminde `WEBHOOK_SECRET` var mı?
3. [ ] Okul yönetim sisteminde `WEBHOOK_SECRET` var mı?
4. [ ] Her iki projede de `WEBHOOK_SECRET` **AYNI** mı?
5. [ ] Environment variables ekledikten sonra **Redeploy** yaptınız mı?
6. [ ] Test başvurusu gönderdiniz mi?
7. [ ] Vercel logs'larını kontrol ettiniz mi?
8. [ ] Debug endpoint'ini kontrol ettiniz mi?

---

## 🔍 Detaylı Debug

### 1. Webhook Gönderilip Gönderilmediğini Kontrol

**Başvuru sisteminde logs:**
```
[Başvuru] Webhook gönderiliyor...
```

Bu log görünüyorsa webhook gönderilmeye çalışılıyor demektir.

### 2. Webhook Alınıp Alınmadığını Kontrol

**Okul yönetim sisteminde logs:**
```
[Webhook] Başvuru başarıyla alındı
```

Bu log görünüyorsa webhook alındı demektir.

### 3. Veritabanına Kaydedilip Kaydedilmediğini Kontrol

**Debug endpoint:**
```
/api/debug/basvurular
```

Count > 0 ise veritabanında kayıt var demektir.

---

## 📞 Hala Çalışmıyorsa

1. **Vercel logs'larını paylaşın:**
   - Başvuru sisteminden webhook logları
   - Okul yönetim sisteminden webhook logları

2. **Environment variables durumunu paylaşın:**
   - Hangi değişkenler var?
   - Secret'ları paylaşmayın, sadece var mı yok mu söyleyin

3. **Manuel test sonucunu paylaşın:**
   - curl komutu çıktısı

4. **Debug endpoint çıktısını paylaşın:**
   - `/api/debug/basvurular` sonucu

