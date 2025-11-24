# ✅ Webhook Sorun Giderme - Kontrol Listesi

## 🎯 Durum: Environment Variables Doğru ✅

- ✅ `WEBHOOK_SECRET` her iki projede de aynı
- ✅ `WEBHOOK_URL` başvuru sisteminde var
- ✅ Manuel test başarılı (webhook endpoint çalışıyor)

## ❓ Sorun: Başvuru Sisteminden Webhook Gönderilmiyor

### Olası Nedenler:

1. **Environment Variables Redeploy Sonrası Aktif Olmamış**
   - Environment variable ekledikten sonra redeploy yapıldı mı?
   - Vercel'de environment variables değişikliği sonrası **MUTLAKA redeploy gerekir**

2. **Başvuru Sistemi Kodunda Sorun**
   - Webhook gönderme kodu çalışmıyor olabilir
   - Logs'da hata görünüyor olabilir

3. **Vercel Cache Sorunu**
   - Eski environment variables cache'lenmiş olabilir

---

## 🔧 Çözüm Adımları

### Adım 1: Redeploy Kontrolü

**Başvuru Sisteminde:**
1. Vercel Dashboard → basvuru-sistemi → Deployments
2. Son deployment'ın ne zaman yapıldığını kontrol edin
3. Environment variables ekledikten **SONRA** mı deploy edildi?

**Eğer environment variables'dan önce deploy edildiyse:**
1. Vercel Dashboard → basvuru-sistemi → Deployments
2. "Redeploy" butonuna tıklayın
3. Bekleyin (1-2 dakika)

---

### Adım 2: Vercel Logs Kontrolü

**Test Başvurusu Gönderin:**
1. Başvuru formunu doldurun
2. Gönderin
3. Vercel → basvuru-sistemi → Logs

**Aranacak Loglar:**

✅ **Başarılı Senaryo:**
```
[Başvuru] Webhook gönderiliyor... { basvuruId: 'xxx', webhookUrl: 'https://...', hasSecret: true }
[Webhook] Başarılı - Başvuru ID: xxx (Deneme: 1)
[Başvuru] ✅ Webhook başarıyla gönderildi: xxx
```

❌ **Hata Senaryoları:**

**Hata 1: Environment Variable Yok**
```
[Webhook] ❌ WEBHOOK_URL tanımlı değil, webhook gönderilmedi!
```

**Çözüm:** Redeploy yapın

**Hata 2: Network Hatası**
```
[Webhook] Deneme 1/3 başarısız...
[Webhook] Tüm denemeler başarısız
```

**Çözüm:** URL'i kontrol edin, okul yönetim sisteminin çalıştığından emin olun

**Hata 3: 401 Unauthorized**
```
[Webhook] Client error - Retry yapılmayacak: 401
```

**Çözüm:** Secret'ları tekrar kontrol edin

---

### Adım 3: Debug Endpoint Kontrolü

**Okul Yönetim Sisteminde:**
```
https://okul-yonetim-sistemi.vercel.app/api/debug/basvurular
```

**Beklenen:**
- Manuel test sonrası: `count: 1` (veya daha fazla)
- Başvuru gönderdikten sonra: Count artmalı

---

## 🚀 Hızlı Çözüm

### 1. Redeploy Yapın

**Başvuru Sisteminde:**
1. Vercel Dashboard → basvuru-sistemi → Deployments
2. "Redeploy" butonuna tıklayın
3. Bekleyin

**Okul Yönetim Sisteminde:**
1. Vercel Dashboard → okul-yonetim-sistemi → Deployments
2. "Redeploy" butonuna tıklayın (opsiyonel ama önerilir)
3. Bekleyin

### 2. Test Edin

1. Yeni bir test başvurusu gönderin
2. Vercel logs'larını kontrol edin
3. Debug endpoint'ini kontrol edin

---

## 📊 Test Sonuçları

### Manuel Test: ✅ BAŞARILI
- Webhook endpoint çalışıyor
- Veritabanına kayıt yapıyor
- Secret doğrulama çalışıyor

### Gerçek Başvuru: ❓ KONTROL EDİLMELİ
- Başvuru sisteminden webhook gönderiliyor mu?
- Vercel logs'larında ne görünüyor?

---

## 🔍 Sonraki Adımlar

1. **Redeploy yapın** (her iki projede de)
2. **Test başvurusu gönderin**
3. **Vercel logs'larını kontrol edin**
4. **Debug endpoint'ini kontrol edin**

Bu adımları tamamladıktan sonra sonuçları paylaşın!

