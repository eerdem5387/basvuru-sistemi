# 🌐 Domain Yapılandırma Rehberi - Natro + Vercel

Bu rehber, `basvuru.leventokullari.com` domain'ini Vercel'e bağlamak için gerekli DNS yapılandırmasını açıklar.

## 📋 Gereksinimler

- Natro'da `leventokullari.com` domain'inin yönetim yetkisi
- Vercel hesabı ve deploy edilmiş proje

## 🔧 Adım Adım Yapılandırma

### 1️⃣ Vercel'de Domain Ekleme

1. [Vercel Dashboard](https://vercel.com/dashboard)'a gidin
2. Projenizi seçin
3. **Settings** → **Domains** sekmesine gidin
4. **Add** butonuna tıklayın
5. Domain adını girin: `basvuru.leventokullari.com`
6. **Add** butonuna tıklayın

### 2️⃣ Vercel DNS Kayıtlarını Alma

Domain ekledikten sonra Vercel size iki seçenek sunar:

#### ✅ Yöntem A: CNAME Kaydı (ÖNERİLEN - En Kolay)

Vercel Dashboard → **DNS Records** sekmesinde göreceğiniz:
- **Type:** CNAME
- **Name:** `basvuru`
- **Value:** `f59bcabfc9a0a95b.vercel-dns-016.com.` (Vercel size özel verdiği değer)

**Bu yöntemi kullanın!** Sadece subdomain için DNS kaydı eklemeniz yeterli.

#### Yöntem B: Nameserver Değiştirme (Tüm Domain İçin)

Vercel Dashboard → **Vercel DNS** sekmesinde göreceğiniz:
- **Nameserver 1:** `ns1.vercel-dns.com`
- **Nameserver 2:** `ns2.vercel-dns.com`

**⚠️ Bu yöntem tüm domain'i etkiler!** Sadece subdomain için CNAME kullanmak daha pratik.

### 3️⃣ Natro'da DNS Kayıtlarını Ekleme

1. [Natro Panel](https://www.natro.com)'e giriş yapın
2. **Domain Yönetimi** → **DNS Yönetimi** bölümüne gidin
3. `leventokullari.com` domain'ini seçin
4. **DNS Kayıtları** veya **DNS Ayarları** sekmesine gidin

#### ✅ CNAME Kaydı Ekleme (ÖNERİLEN YÖNTEM)

Eğer A kaydı yerine CNAME kullanmak isterseniz:

1. **Yeni Kayıt Ekle** butonuna tıklayın
2. Kayıt türünü **CNAME** olarak seçin
3. Aşağıdaki bilgileri girin:
   - **Host/Name:** `basvuru`
   - **Type:** `CNAME`
   - **Value/Target:** Vercel'in verdiği CNAME değeri (örn: `cname.vercel-dns.com`)
   - **TTL:** `3600`
4. **Kaydet** butonuna tıklayın

**⚠️ ÖNEMLİ:** A kaydı VE CNAME kaydını aynı anda kullanmayın! Sadece birini seçin.

### 4️⃣ DNS Yayılımını Bekleme

DNS kayıtları genellikle 5 dakika ile 48 saat arasında yayılır. Çoğu durumda 15-30 dakika içinde aktif olur.

DNS yayılımını kontrol etmek için:
```bash
# Terminal'de kontrol edin
nslookup basvuru.leventokullari.com

# veya online araçlar kullanın
# https://dnschecker.org
```

### 5️⃣ Vercel'de SSL Sertifikası Oluşturma

DNS kayıtları yayıldıktan sonra:

1. Vercel Dashboard → Projeniz → **Domains** sekmesine gidin
2. `basvuru.leventokullari.com` domain'inin yanında **Refresh** butonuna tıklayın
3. Vercel otomatik olarak SSL sertifikası oluşturacak (Let's Encrypt)
4. Sertifika oluşturma işlemi 1-5 dakika sürebilir

### 6️⃣ Environment Variable Güncelleme

Domain aktif olduktan sonra `NEXTAUTH_URL` environment variable'ını güncelleyin:

1. Vercel Dashboard → Projeniz → **Settings** → **Environment Variables**
2. `NEXTAUTH_URL` değişkenini bulun
3. Değerini şu şekilde güncelleyin:
   ```
   https://basvuru.leventokullari.com
   ```
4. **Save** butonuna tıklayın
5. Yeni bir deployment tetiklemek için **Redeploy** yapın

## 🔍 Sorun Giderme

### Hata: "NXDOMAIN looking up A for basvuru.leventokullari.com"

**Sebep:** DNS kayıtları henüz yayılmamış veya yanlış yapılandırılmış.

**Çözüm:**
1. Natro'da DNS kayıtlarının doğru eklendiğini kontrol edin
2. DNS yayılımını kontrol edin: https://dnschecker.org
3. `basvuru.leventokullari.com` için A kaydının doğru IP'yi gösterdiğinden emin olun
4. 15-30 dakika bekleyin ve tekrar deneyin

### Hata: "no valid AAAA records found"

**Sebep:** AAAA kaydı eksik (opsiyonel ama önerilir).

**Çözüm:**
1. AAAA kaydını ekleyin (yukarıdaki adımlara bakın)
2. Veya sadece A kaydı ile devam edin (çalışır ama IPv6 desteği olmaz)

### DNS Kayıtları Yayıldı Ama SSL Oluşturulmuyor

**Çözüm:**
1. Vercel Dashboard → Domains → **Refresh** butonuna tıklayın
2. Birkaç dakika bekleyin
3. Hala çalışmıyorsa, Vercel Support'a başvurun

### Domain Çalışıyor Ama Site Açılmıyor

**Kontrol Listesi:**
- [ ] DNS kayıtları doğru yapılandırılmış mı?
- [ ] `NEXTAUTH_URL` environment variable güncellendi mi?
- [ ] Vercel'de yeni bir deployment yapıldı mı?
- [ ] Browser cache temizlendi mi? (Ctrl+Shift+R veya Cmd+Shift+R)

## 📝 Natro DNS Yapılandırma Örneği

Natro panelinde DNS kayıtları şu şekilde görünmelidir:

```
Type    Host      Value                                    TTL
CNAME   basvuru   f59bcabfc9a0a95b.vercel-dns-016.com.    3600
```

**Not:** Vercel size özel verdiği CNAME değerini kullanın. Her domain için farklı olabilir.

## ✅ Başarı Kontrolü

Domain başarıyla yapılandırıldıysa:

1. ✅ `https://basvuru.leventokullari.com` adresine gidebilmelisiniz
2. ✅ SSL sertifikası aktif olmalı (yeşil kilit ikonu)
3. ✅ Site normal şekilde çalışmalı
4. ✅ Admin paneli erişilebilir olmalı: `https://basvuru.leventokullari.com/admin/login`

## 🎉 Tamamlandı!

Domain başarıyla yapılandırıldı! Artık kullanıcılar `basvuru.leventokullari.com` üzerinden başvuru yapabilir.

**Sonraki Adımlar:**
- Analytics'i aktifleştirin
- Domain'i sosyal medyada paylaşın
- Kullanıcılara duyurun

