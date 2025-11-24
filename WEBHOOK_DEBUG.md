# 🔍 Webhook Debug Rehberi

Başvurular görünmüyorsa, bu adımları takip edin:

## 📋 Kontrol Listesi

### 1. Environment Variables Kontrolü

#### Başvuru Sisteminde (basvuru-sistemi)

**Vercel Dashboard'da kontrol edin:**
1. Vercel → basvuru-sistemi → Settings → Environment Variables
2. Şu değişkenler olmalı:
   - `WEBHOOK_URL` = `https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru`
   - `WEBHOOK_SECRET` = (güçlü bir secret)

**Kontrol:**
- [ ] `WEBHOOK_URL` var mı?
- [ ] `WEBHOOK_URL` doğru mu? (okul yönetim sisteminin URL'i)
- [ ] `WEBHOOK_SECRET` var mı?

#### Okul Yönetim Sisteminde (okul-yonetim-sistemi)

**Vercel Dashboard'da kontrol edin:**
1. Vercel → okul-yonetim-sistemi → Settings → Environment Variables
2. Şu değişken olmalı:
   - `WEBHOOK_SECRET` = (başvuru sistemi ile AYNI)

**Kontrol:**
- [ ] `WEBHOOK_SECRET` var mı?
- [ ] Başvuru sistemi ile **AYNI** mı?

---

### 2. Vercel Logs Kontrolü

#### Başvuru Sisteminde

**Vercel → basvuru-sistemi → Logs**

**Aranacak loglar:**

✅ **Başarılı:**
```
[Başvuru] Webhook gönderiliyor...
[Webhook] Başarılı - Başvuru ID: xxx (Deneme: 1)
[Başvuru] ✅ Webhook başarıyla gönderildi: xxx
```

❌ **Hata:**
```
[Webhook] ❌ WEBHOOK_URL tanımlı değil, webhook gönderilmedi!
[Webhook] ❌ Tüm denemeler başarısız
[Başvuru] ❌ Webhook gönderilemedi
```

#### Okul Yönetim Sisteminde

**Vercel → okul-yonetim-sistemi → Logs**

**Aranacak loglar:**

✅ **Başarılı:**
```
[Webhook] Başvuru başarıyla alındı: xxx -> yyy
```

❌ **Hata:**
```
[Webhook] Geçersiz secret - Yetkisiz erişim denemesi
[Webhook] WEBHOOK_SECRET tanımlı değil
[Webhook] Hata: ...
```

---

### 3. Manuel Test

#### Adım 1: Webhook URL'ini Test Edin

```bash
curl -X POST https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: YOUR_SECRET_HERE" \
  -H "X-Webhook-Source: basvuru-sistemi" \
  -d '{
    "id": "test-' + Date.now() + '",
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
    "createdAt": "' + new Date().toISOString() + '",
    "updatedAt": "' + new Date().toISOString() + '"
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

#### Adım 2: Debug Endpoint'ini Kontrol Edin

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

### 4. Yaygın Sorunlar ve Çözümleri

#### Sorun 1: `WEBHOOK_URL tanımlı değil`

**Sebep:** Environment variable eksik

**Çözüm:**
1. Vercel Dashboard → basvuru-sistemi → Settings → Environment Variables
2. `WEBHOOK_URL` ekleyin
3. Redeploy yapın

---

#### Sorun 2: `401 Unauthorized`

**Sebep:** Secret'lar farklı

**Çözüm:**
1. Her iki projede de `WEBHOOK_SECRET` aynı olmalı
2. Vercel'de kontrol edin
3. Redeploy yapın

---

#### Sorun 3: `Connection Refused`

**Sebep:** Webhook URL yanlış veya okul yönetim sistemi çalışmıyor

**Çözüm:**
1. `WEBHOOK_URL` doğru mu kontrol edin
2. Okul yönetim sisteminin çalıştığından emin olun
3. Vercel deployment'ını kontrol edin

---

#### Sorun 4: Webhook Gönderiliyor Ama Veritabanında Yok

**Sebep:** Okul yönetim sisteminde hata

**Çözüm:**
1. Okul yönetim sisteminin logs'larını kontrol edin
2. `/api/debug/basvurular` endpoint'ini kontrol edin
3. Veritabanı bağlantısını kontrol edin

---

## 🔧 Hızlı Çözüm

### Adım 1: Environment Variables'ları Kontrol Edin

**Başvuru Sisteminde:**
- `WEBHOOK_URL` = `https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru`
- `WEBHOOK_SECRET` = (güçlü bir secret)

**Okul Yönetim Sisteminde:**
- `WEBHOOK_SECRET` = (başvuru sistemi ile AYNI)

### Adım 2: Redeploy Yapın

Environment variables değiştiyse, her iki projeyi de redeploy yapın:
- Vercel Dashboard → Deployments → Redeploy

### Adım 3: Test Edin

1. Yeni bir başvuru gönderin
2. Vercel logs'larını kontrol edin
3. Debug endpoint'ini kontrol edin: `/api/debug/basvurular`

---

## 📞 Hala Çalışmıyorsa

1. **Vercel logs'larını paylaşın:**
   - Başvuru sisteminden webhook logları
   - Okul yönetim sisteminden webhook logları

2. **Environment variables'ları kontrol edin:**
   - Secret'ları paylaşmayın, sadece var mı yok mu söyleyin

3. **Manuel test sonucunu paylaşın:**
   - curl komutu çıktısı

