# ⚡ Hızlı Başlangıç - 3 Adımda Çalıştırın!

## 📦 Kurulum (2 dakika)

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Neon Database Oluşturun

a. [neon.tech](https://neon.tech) üzerinden ücretsiz hesap açın

b. Yeni proje oluşturun

c. Connection string'i kopyalayın (şuna benzer):
```
postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

### 3. Environment Variables

`.env.local` dosyası zaten mevcut, sadece `DATABASE_URL`'i güncelleyin:

```bash
# .env.local dosyasını açın ve DATABASE_URL'i değiştirin
DATABASE_URL="buraya-neon-connection-string"
```

Diğer değişkenler hazır:
- ✅ `NEXTAUTH_SECRET` - Otomatik oluşturuldu
- ✅ `ADMIN_EMAIL` - admin@bursluluk.com
- ✅ `ADMIN_PASSWORD` - Admin123!@#

## 🚀 Başlatma (30 saniye)

```bash
# Database'i setup et ve admin oluştur
npm run setup

# Development server'ı başlat
npm run dev
```

## 🎉 Hazır!

### Ana Sayfa (Başvuru Formu)
👉 [http://localhost:3000](http://localhost:3000)

### Admin Paneli
👉 [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

**Giriş bilgileri:**
- Email: `admin@bursluluk.com`
- Şifre: `Admin123!@#`

## 📝 Test Etme

1. Ana sayfadan test başvurusu yapın
2. Admin paneline giriş yapın
3. Başvurunuzu dashboard'da görün
4. "Excel İndir" butonunu deneyin

## ⚠️ Önemli Notlar

### Production'a Geçerken

1. **Şifreleri değiştirin!**
   ```env
   ADMIN_PASSWORD="cok-guclu-bir-sifre-123!@#ABC"
   ```

2. **NEXTAUTH_URL'i güncelleyin:**
   ```env
   NEXTAUTH_URL="https://your-domain.vercel.app"
   ```

3. **Yeni NEXTAUTH_SECRET oluşturun:**
   ```bash
   npm run generate-secret
   ```

### Yaygın Sorunlar

**Problem:** Database bağlanamıyor  
**Çözüm:** `DATABASE_URL` doğru mu? `?sslmode=require` var mı?

**Problem:** Admin giriş yapamıyor  
**Çözüm:** `npm run create-admin` tekrar çalıştırın

**Problem:** Port 3000 kullanımda  
**Çözüm:** `PORT=3001 npm run dev`

## 📚 Daha Fazla Bilgi

- 📖 **Tam dokümantasyon:** [README.md](README.md)
- 🚀 **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔧 **Özellikler:** [FEATURES.md](FEATURES.md)
- 💻 **Kurulum detayları:** [KURULUM.md](KURULUM.md)

## 🆘 Yardım

Sorun mu yaşıyorsunuz? Adım adım kurulum için `KURULUM.md` dosyasını inceleyin.

---

**Başarılar! 🎓**

