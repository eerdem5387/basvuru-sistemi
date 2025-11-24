# 🧪 Test TC Kimlik Numaraları

Bu TC kimlik numaraları sadece **test amaçlı** kullanılmalıdır. Gerçek kişilere ait değildir.

## ✅ Geçerli Test TC Numaraları

**Bu TC numaraları gerçek TC algoritmasına uygundur ve sistem tarafından kabul edilir.**

### Test TC 1:
```
46879131346
```

### Test TC 2:
```
27020491960
```

### Test TC 3:
```
20017876450
```

### Test TC 4:
```
43476402022
```

### Test TC 5:
```
71923252180
```

### Test TC 6:
```
30180641182
```

### Test TC 7:
```
42832563070
```

### Test TC 8:
```
16369224834
```

### Test TC 9:
```
83877434048
```

### Test TC 10:
```
76867548382
```

---

## 📝 Test Başvuru Örneği

Aşağıdaki bilgileri kullanarak test başvurusu yapabilirsiniz:

### Öğrenci Bilgileri:
- **Ad Soyad:** TEST ÖĞRENCİ
- **TC Kimlik No:** `46879131346` (veya yukarıdaki listeden herhangi biri)
- **Okul:** Herhangi bir okul seçin
- **Sınıf:** 5. Sınıf (veya istediğiniz sınıf)

### Baba Bilgileri:
- **Ad Soyad:** TEST BABA
- **Meslek:** Öğretmen (veya listeden herhangi biri)
- **Cep Telefonu:** `5551234567`
- **İş Adresi:** (Boş bırakabilirsiniz)

### Anne Bilgileri:
- **Ad Soyad:** TEST ANNE
- **Meslek:** Hemşire (veya listeden herhangi biri)
- **Cep Telefonu:** `5557654321`
- **İş Adresi:** (Boş bırakabilirsiniz)

### İletişim:
- **E-posta:** `test@example.com` (veya kendi email'iniz)

---

## ⚠️ Önemli Notlar

1. **Her test için farklı TC kullanın** - Aynı TC ile tekrar başvuru yapamazsınız
2. **Telefon numaraları:** 5 ile başlamalı ve 10 haneli olmalı
3. **E-posta:** Geçerli bir format olmalı (test@example.com gibi)
4. **Ad Soyad:** Sadece harf ve boşluk (büyük harf otomatik)

---

## 🔄 Farklı Test Senaryoları İçin

### Senaryo 1: İlk Başvuru
- TC: `46879131346` (veya listeden herhangi biri)
- Normal form doldurma

### Senaryo 2: Duplicate Kontrolü
- Aynı TC ile tekrar başvuru yapmayı deneyin
- "Bu TC Kimlik No ile daha önce başvuru yapılmış" hatası almalısınız

### Senaryo 3: Webhook Testi
- Yeni bir TC ile başvuru yapın
- Okul yönetim sisteminde `/api/debug/basvurular` endpoint'ini kontrol edin
- Yeni başvuru görünmeli

---

## 🧮 TC Numarası Algoritması

Bu TC numaraları gerçek TC algoritmasına uygundur:
- İlk hane 0 olamaz
- 10. hane: (tek hanelerin toplamı × 7 - çift hanelerin toplamı) mod 10
- 11. hane: (ilk 10 hanenin toplamı) mod 10

---

## 💡 İpucu

Eğer tüm test TC'lerini kullandıysanız, veritabanından eski test başvurularını silebilirsiniz veya yeni TC numaraları oluşturabilirsiniz.

