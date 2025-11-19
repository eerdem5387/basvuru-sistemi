# 🚀 Deployment Rehberi - Vercel + Neon

Bu rehber, projenizi Vercel'e deploy etmek ve Neon database ile çalıştırmak için adım adım talimatlar içerir.

## 📋 Gereksinimler

- GitHub hesabı
- Vercel hesabı ([vercel.com](https://vercel.com) - ücretsiz)
- Neon hesabı ([neon.tech](https://neon.tech) - ücretsiz)

## 1️⃣ Neon Database Setup

### Database Oluşturma

1. [Neon Console](https://console.neon.tech)'a giriş yapın
2. "Create a Project" butonuna tıklayın
3. Proje ayarları:
   - **Name:** basvuru-sistemi-db
   - **Region:** En yakın region'u seçin (örn: Frankfurt for EU)
   - **PostgreSQL Version:** 16 (önerilen)
4. "Create Project" tıklayın

### Connection String Alma

1. Yeni oluşturulan proje dashboard'ında "Connection Details" bölümüne gidin
2. **Connection string** seçeneğini seçin
3. **Pooled connection** sekmesinden connection string'i kopyalayın
4. String şu formatta olmalı:
   \`\`\`
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   \`\`\`

### Database Güvenliği (Opsiyonel)

1. Neon dashboard'da "Settings" → "Security"
2. **IP Allow List** ekleyin (production için önerilir)
3. Vercel'in IP adreslerini ekleyin

## 2️⃣ GitHub'a Push

### Repository Oluşturma

1. GitHub'da yeni bir repository oluşturun
2. Local projenizde:

\`\`\`bash
git init
git add .
git commit -m "Initial commit: Bursluluk Sınav Başvuru Sistemi"
git branch -M main
git remote add origin https://github.com/username/basvuru-sistemi.git
git push -u origin main
\`\`\`

## 3️⃣ Vercel'e Deploy

### Proje Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. "Add New..." → "Project" tıklayın
3. GitHub repository'nizi seçin
4. "Import" butonuna tıklayın

### Environment Variables Ekleme

**ÖNEMLI:** Deploy etmeden ÖNCE environment variables ekleyin!

"Environment Variables" bölümünde aşağıdakileri ekleyin:

#### 1. DATABASE_URL
- **Name:** \`DATABASE_URL\`
- **Value:** Neon'dan aldığınız connection string
- **Environment:** Production, Preview, Development (hepsini seçin)

#### 2. NEXTAUTH_URL
- **Name:** \`NEXTAUTH_URL\`
- **Value:** \`https://your-project-name.vercel.app\` (henüz bilmiyorsanız boş bırakın, deploy sonrası güncelleyin)
- **Environment:** Production

#### 3. NEXTAUTH_SECRET
- **Name:** \`NEXTAUTH_SECRET\`
- **Value:** Güçlü bir secret key (aşağıdaki komutu local'de çalıştırıp kopyalayın)

Local'de secret oluşturmak için:
\`\`\`bash
npm run generate-secret
\`\`\`

veya Node.js ile:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

- **Environment:** Production, Preview, Development

#### 4. ADMIN_EMAIL
- **Name:** \`ADMIN_EMAIL\`
- **Value:** \`admin@yourdomain.com\` (kendi email'iniz)
- **Environment:** Production, Preview, Development

#### 5. ADMIN_PASSWORD
- **Name:** \`ADMIN_PASSWORD\`
- **Value:** Güçlü bir şifre (en az 12 karakter, büyük/küçük harf, rakam, özel karakter)
- **Environment:** Production, Preview, Development

### Deploy Ayarları

- **Framework Preset:** Next.js (otomatik seçilecek)
- **Build Command:** \`prisma generate && next build\`
- **Output Directory:** \`.next\` (varsayılan)
- **Install Command:** \`npm install\`

"Deploy" butonuna tıklayın!

## 4️⃣ Deploy Sonrası Yapılandırma

### NEXTAUTH_URL Güncelleme

1. Deploy tamamlandıktan sonra, Vercel size bir URL verecek (örn: \`https://basvuru-sistemi.vercel.app\`)
2. Vercel Dashboard → Project → Settings → Environment Variables
3. \`NEXTAUTH_URL\` değişkenini yeni URL ile güncelleyin
4. Projeyi redeploy edin (Settings → Deployments → son deployment → "..." → Redeploy)

### Admin Kullanıcısı Oluşturma

**Yöntem 1: Vercel Dashboard'dan (Önerilen)**

1. Vercel Dashboard → Your Project
2. Terminal sekmesine gidin (veya son deployment'a tıklayın)
3. "Functions" → herhangi bir function seçin
4. Aşağıdaki komutu çalıştırın:

\`\`\`bash
npm run create-admin
\`\`\`

**Yöntem 2: Local'den Production Database'e**

1. \`.env.local\` dosyanızda \`DATABASE_URL\`'i production database URL'i ile değiştirin
2. \`npm run create-admin\` çalıştırın
3. \`DATABASE_URL\`'i tekrar local'e çevirin

### Domain Bağlama (Opsiyonel)

1. Vercel Dashboard → Your Project → Settings → Domains
2. "Add" butonuna tıklayın
3. Domain adınızı girin (örn: basvuru.yourdomain.com)
4. DNS ayarlarınızı Vercel'in verdiği değerler ile güncelleyin
5. \`NEXTAUTH_URL\` environment variable'ını yeni domain ile güncelleyin

## 5️⃣ Test Etme

### Fonksiyonellik Testi

1. Ana sayfayı ziyaret edin: \`https://your-app.vercel.app\`
2. Test başvurusu yapın
3. Admin paneline giriş yapın: \`https://your-app.vercel.app/admin/login\`
4. Başvuruyu dashboard'da görebildiğinizi kontrol edin
5. Excel export'u test edin

### Güvenlik Testi

- [ ] Admin paneli authentication çalışıyor mu?
- [ ] Rate limiting aktif mi? (aynı IP'den 3'ten fazla başvuru yapamıyor musunuz?)
- [ ] TC Kimlik No validasyonu çalışıyor mu?
- [ ] Geçersiz form verileri reddediliyor mu?

## 6️⃣ Monitoring ve Analytics

### Vercel Analytics

1. Vercel Dashboard → Your Project → Analytics
2. "Enable Analytics" tıklayın (ücretsiz quota var)

### Neon Monitoring

1. Neon Console → Your Project → Monitoring
2. Database performansını takip edin
3. Query insights'ı inceleyin

## 7️⃣ Otomatik Deployment

Her GitHub push otomatik olarak deploy edilecektir:

- **main branch:** Production'a deploy
- **diğer branch'ler:** Preview deployment

Preview deployment'lar için ayrı database URL'i kullanmak isterseniz:
1. Neon'da branch oluşturun
2. Vercel'de preview environment için farklı \`DATABASE_URL\` ekleyin

## 8️⃣ Backup Stratejisi

### Neon Backup

1. Neon Console → Your Project → Backups
2. Otomatik backup aktiftir (retention: 7 gün free tier'da)
3. Manual backup almak için: "Create Backup" butonu

### Excel Export Düzenli Alma

Admin panelinden düzenli olarak Excel export alın ve yedekleyin.

## 🔧 Troubleshooting

### Deploy Başarısız

**Hata:** Build failed

**Çözümler:**
1. Vercel logs'u kontrol edin
2. \`DATABASE_URL\` doğru mu?
3. Environment variables tam mı?
4. Local'de \`npm run build\` çalışıyor mu?

### Database Bağlantı Hatası

**Hata:** P1001: Can't reach database server

**Çözümler:**
1. Neon database aktif mi?
2. Connection string doğru mu?
3. \`?sslmode=require\` parametresi var mı?
4. Neon'da IP whitelist varsa Vercel IP'leri eklendi mi?

### Admin Login Çalışmıyor

**Hata:** NextAuth error

**Çözümler:**
1. \`NEXTAUTH_SECRET\` set edildi mi?
2. \`NEXTAUTH_URL\` doğru URL'i gösteriyor mu?
3. Admin kullanıcısı oluşturuldu mu?

### Rate Limiting Çalışmıyor

Vercel serverless fonksiyonlarda in-memory state tutmaz. Production'da Redis veya Vercel KV kullanın:

\`\`\`bash
npm install @vercel/kv
\`\`\`

Vercel Dashboard → Storage → KV oluşturun ve \`app/api/basvuru/route.ts\`'i güncelleyin.

## 📊 Production Önerileri

### Performans

1. **Edge Runtime kullanın** (bazı route'larda):
   \`\`\`typescript
   export const runtime = 'edge'
   \`\`\`

2. **ISR kullanın** (eğer admin paneli public olsaydı):
   \`\`\`typescript
   export const revalidate = 60
   \`\`\`

### Güvenlik

1. **Environment variables'ı asla commit etmeyin**
2. **Güçlü şifreler kullanın** (min 16 karakter)
3. **Rate limiting'i Redis ile yapın** (production için)
4. **CORS ayarlarını kontrol edin**
5. **SSL sertifikası** (Vercel otomatik sağlar)

### Maliyetler

**Free Tier Limitler:**

**Vercel Free:**
- 100 GB bandwidth/ay
- 100 deployments/ay
- Serverless function execution: 100 GB-Saat
- ✅ Çoğu küçük-orta başvuru sistemi için yeterli

**Neon Free:**
- 1 Project
- 0.5 GB storage
- ✅ ~10,000 başvuru için yeterli

### Ölçeklendirme

Büyüme durumunda:
1. Vercel Pro plan (~$20/ay)
2. Neon Scale plan (~$19/ay)
3. Rate limiting için Vercel KV ekleyin
4. CDN için Vercel Edge Network zaten var

## ✅ Production Checklist

Deploy etmeden önce:

- [ ] Environment variables doğru set edildi
- [ ] \`DATABASE_URL\` production database'i gösteriyor
- [ ] \`NEXTAUTH_SECRET\` güçlü ve unique
- [ ] \`NEXTAUTH_URL\` production URL'i gösteriyor
- [ ] Admin şifresi güçlü (min 16 karakter)
- [ ] Local'de \`npm run build\` başarılı
- [ ] Test başvurusu yapıldı
- [ ] Admin girişi test edildi
- [ ] Excel export test edildi
- [ ] Mobile responsive test edildi

Deploy sonrası:

- [ ] Production'da test başvurusu yapıldı
- [ ] Admin paneli çalışıyor
- [ ] Excel export çalışıyor
- [ ] Rate limiting test edildi
- [ ] Domain SSL sertifikası aktif
- [ ] Analytics aktif
- [ ] Backup stratejisi hazır

## 🎉 Tebrikler!

Projeniz başarıyla deploy edildi! 

**Sonraki adımlar:**
1. Kullanıcılara duyurun
2. İlk geri bildirimleri toplayın
3. Analytics'i takip edin
4. Düzenli backup almayı unutmayın

Başarılar! 🚀

