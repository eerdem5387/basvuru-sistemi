# 🚀 Hızlı Kurulum Rehberi

Bu rehber, projeyi en hızlı şekilde çalıştırmanız için hazırlanmıştır.

## 📋 Ön Gereksinimler

- Node.js 18+ yüklü olmalı
- Bir Neon hesabı (ücretsiz) - [neon.tech](https://neon.tech)
- Git yüklü olmalı

## ⚡ 5 Adımda Kurulum

### 1️⃣ Bağımlılıkları Yükleyin

\`\`\`bash
npm install
\`\`\`

### 2️⃣ Neon Database Oluşturun

1. [Neon Console](https://console.neon.tech) 'a girin
2. "New Project" tıklayın
3. Proje adı verin ve region seçin
4. "Create Project" butonuna tıklayın
5. Connection string'i kopyalayın (PostgreSQL, Node.js sekmesinden)

### 3️⃣ Environment Variables Oluşturun

\`.env.local\` dosyasını oluşturun:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Ardından \`.env.local\` dosyasını düzenleyin:

\`\`\`env
# Neon'dan aldığınız connection string
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Local development için
NEXTAUTH_URL="http://localhost:3000"

# Secret key oluşturmak için: npm run generate-secret
NEXTAUTH_SECRET="buraya-generate-edilen-secret-key"

# Admin bilgileri (istediğiniz gibi değiştirin)
ADMIN_EMAIL="admin@bursluluk.com"
ADMIN_PASSWORD="GucluBirSifre123!@#"
\`\`\`

**Secret key oluşturmak için:**

\`\`\`bash
npm run generate-secret
\`\`\`

### 4️⃣ Database Setup

\`\`\`bash
npm run setup
\`\`\`

Bu komut:
- ✅ Prisma schema'yı database'e push eder
- ✅ Prisma client'ı generate eder  
- ✅ Admin kullanıcısını oluşturur

### 5️⃣ Uygulamayı Başlatın

\`\`\`bash
npm run dev
\`\`\`

🎉 **Hazır!** Tarayıcınızda şu adresleri açın:

- 🏠 **Ana Sayfa (Başvuru Formu):** [http://localhost:3000](http://localhost:3000)
- 🔐 **Admin Paneli:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

## 🔑 Admin Girişi

Admin paneline giriş yapmak için:

- **Email:** `.env.local` dosyasında belirttiğiniz `ADMIN_EMAIL`
- **Şifre:** `.env.local` dosyasında belirttiğiniz `ADMIN_PASSWORD`

## 🌐 Vercel'e Deploy

### Hızlı Deploy

1. Projeyi GitHub'a push edin:

\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

2. [Vercel Dashboard](https://vercel.com)'a gidin
3. "New Project" → GitHub repo'nuzu seçin
4. Environment Variables ekleyin:
   - \`DATABASE_URL\` - Neon connection string
   - \`NEXTAUTH_URL\` - Production URL (örn: https://yourapp.vercel.app)
   - \`NEXTAUTH_SECRET\` - Generate ettiğiniz secret key
   - \`ADMIN_EMAIL\` - Admin email
   - \`ADMIN_PASSWORD\` - Admin şifresi
5. "Deploy" butonuna tıklayın

### Deploy Sonrası

İlk deploy tamamlandığında, Vercel dashboard'dan "Terminal" sekmesine gidin ve:

\`\`\`bash
npm run create-admin
\`\`\`

komutunu çalıştırın. Bu admin kullanıcısını production database'ine ekleyecektir.

## 🛠️ Yararlı Komutlar

\`\`\`bash
# Development server
npm run dev

# Production build
npm run build

# Production server başlat
npm run start

# Prisma Studio (Database GUI)
npm run db:studio

# Yeni admin kullanıcısı oluştur
npm run create-admin

# Secret key oluştur
npm run generate-secret
\`\`\`

## ❓ Sorun Giderme

### Database bağlantı hatası

**Problem:** \`PrismaClientInitializationError\`

**Çözüm:**
1. \`DATABASE_URL\`'in doğru olduğundan emin olun
2. Connection string sonunda \`?sslmode=require\` olmalı
3. Neon dashboard'da database'in "Active" durumda olduğunu kontrol edin

### Admin giriş yapamıyorum

**Problem:** "Geçersiz email veya şifre"

**Çözüm:**
1. \`npm run create-admin\` komutunu çalıştırın
2. Konsol çıktısında görünen email ve şifreyi kullanın
3. Eğer hala çalışmıyorsa, Prisma Studio ile kontrol edin:
   \`\`\`bash
   npm run db:studio
   \`\`\`

### Prisma generate hatası

**Problem:** \`@prisma/client did not initialize yet\`

**Çözüm:**
\`\`\`bash
npm run db:generate
\`\`\`

### Port zaten kullanımda

**Problem:** \`EADDRINUSE: address already in use :::3000\`

**Çözüm:**
\`\`\`bash
# Farklı bir port kullanın
PORT=3001 npm run dev

# veya çalışan process'i durdurun
lsof -ti:3000 | xargs kill
\`\`\`

## 📞 Destek

Sorunlarınız devam ediyorsa:

1. \`node_modules\` ve \`.next\` klasörlerini silin:
   \`\`\`bash
   rm -rf node_modules .next
   npm install
   \`\`\`

2. Prisma client'ı yeniden generate edin:
   \`\`\`bash
   npm run db:generate
   \`\`\`

3. Tüm setup'ı baştan yapın:
   \`\`\`bash
   npm run setup
   \`\`\`

## ✅ Kontrol Listesi

Kurulumun başarılı olduğunu doğrulamak için:

- [ ] \`npm run dev\` çalışıyor
- [ ] Ana sayfa görüntüleniyor
- [ ] Form doldurulup gönderilebiliyor
- [ ] Admin login sayfası açılıyor
- [ ] Admin girişi başarılı
- [ ] Dashboard'da başvurular görünüyor
- [ ] Excel export çalışıyor

Tüm maddeler ✅ ise, kurulum başarılı! 🎉

## 🎓 Sonraki Adımlar

1. **Özelleştirme:** Form alanlarını, okul listesini vs. kendi ihtiyaçlarınıza göre düzenleyin
2. **Güvenlik:** Production'da mutlaka güçlü şifreler kullanın
3. **Monitoring:** Vercel Analytics'i aktif edin
4. **Backup:** Neon'da otomatik backup'ları ayarlayın

İyi çalışmalar! 🚀

