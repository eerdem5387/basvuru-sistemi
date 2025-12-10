'use client'

import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { basvuruSchema, type BasvuruFormData } from '@/lib/validations'
import { motion } from 'framer-motion'
import Link from 'next/link'

const okullar = [
  // ARDEŞEN
  'RİZE - ARDEŞEN - Alparslan Ortaokulu',
  'RİZE - ARDEŞEN - Ardeşen Anadolu İmam Hatip Lisesi',
  'RİZE - ARDEŞEN - Ardeşen Fırtına Vadisi İrfan Tufan Karaoğlu Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ARDEŞEN - Ardeşen İmam Hatip Ortaokulu',
  'RİZE - ARDEŞEN - Ardeşen Lokman Hekim Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ARDEŞEN - Ardeşen Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ARDEŞEN - ARDEŞEN NECİP FAZIL KISAKÜREK İMAM HATİP ORTAOKULU',
  'RİZE - ARDEŞEN - Ardeşen Piri Reis Denizcilik Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ARDEŞEN - Ardeşen Şehit Ömer Halisdemir Fen Lisesi',
  'RİZE - ARDEŞEN - Işıklı 60 Yıl Ortaokulu',
  'RİZE - ARDEŞEN - Köprüköy Ortaokulu',
  'RİZE - ARDEŞEN - RABİA HATUN KIZ ANADOLU İMAM HATİP LİSESİ',
  'RİZE - ARDEŞEN - Seslıkaya Ziya Okutan Ortaokulu',
  'RİZE - ARDEŞEN - Türk Telekom Kanuni Anadolu Lisesi',
  'RİZE - ARDEŞEN - Yavuz Selim Ortaokulu',
  'RİZE - ARDEŞEN - Ardeşen Cumhuriyet İlkokulu',
  'RİZE - ARDEŞEN - Ardeşen Merkez Fatih İlkokulu',
  'RİZE - ARDEŞEN - Seslıkaya Ziya Okutan İlkokulu',
  'RİZE - ARDEŞEN - Tunca Şehit Cumalı Ayçiçek İlkokulu',
  'RİZE - ARDEŞEN - Fikri Keçeli İlkokulu',
  'RİZE - ARDEŞEN - Ardeşen Fatih İlkokulu',
  // ÇAMLIHEMŞİN
  'RİZE - ÇAMLIHEMŞİN - Atatürk Ortaokulu',
  'RİZE - ÇAMLIHEMŞİN - Çamlıhemşin Anadolu İmam Hatip Lisesi',
  'RİZE - ÇAMLIHEMŞİN - Çamlıhemşin Çok Programlı Anadolu Lisesi',
  'RİZE - ÇAMLIHEMŞİN - DİKKAYA ORTAOKULU',
  'RİZE - ÇAMLIHEMŞİN - İstanbul Ticaret Odası Şehit Binbaşı Ömer Aktuğ Ortaokulu',
  // ÇAYELİ
  'RİZE - ÇAYELİ - Ahmet Hamdi-Nurzan İshakoğlu Anadolu Lisesi',
  'RİZE - ÇAYELİ - Beyazsu Ortaokulu',
  'RİZE - ÇAYELİ - Büyükköy Ortaokulu',
  'RİZE - ÇAYELİ - Çayeli Ahmet Hamdi İshakoğlu Denizcilik Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ÇAYELİ - Çayeli Anadolu İmam Hatip Lisesi',
  'RİZE - ÇAYELİ - Çayeli Anadolu Lisesi',
  'RİZE - ÇAYELİ - Çayeli Barbaros Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ÇAYELİ - Çayeli Fen Lisesi',
  'RİZE - ÇAYELİ - Çayeli Hacı Ahmet Hamdi İshakoğlu Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ÇAYELİ - Çayeli Halk Eğitimi Merkezi',
  'RİZE - ÇAYELİ - Çayeli Kız Anadolu İmam Hatip Lisesi',
  'RİZE - ÇAYELİ - Çayeli Kız Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - ÇAYELİ - Hüseyin Rüştü Altunbaş Ortaokulu',
  'RİZE - ÇAYELİ - Kaptanpaşa İzzet Akcal Yatılı Bölge Ortaokulu',
  'RİZE - ÇAYELİ - Madenli Ortaokulu',
  'RİZE - ÇAYELİ - Merkez Atatürk Ortaokulu',
  'RİZE - ÇAYELİ - Şehit Muhammet Ambar İmam Hatip Ortaokulu',
  'RİZE - ÇAYELİ - Yamantürk Ortaokulu',
  'RİZE - ÇAYELİ - Çayeli Yamaç İlkokulu',
  'RİZE - ÇAYELİ - Hasan Yılmaz İlkokulu',
  'RİZE - ÇAYELİ - Çayeli Beyazsu İlkokulu',
  'RİZE - ÇAYELİ - 9 Mart İlkokulu',
  // DEREPAZARI
  'RİZE - DEREPAZARI - Adem Özdemir Anadolu Lisesi',
  'RİZE - DEREPAZARI - Ali Rıza Yılmaz Ortaokulu',
  'RİZE - DEREPAZARI - DEREPAZARI İMAM HATİP ORTAOKULU',
  // FINDIKLI
  'RİZE - FINDIKLI - Aksu Atatürk Ortaokulu',
  'RİZE - FINDIKLI - Arılı Ortaokulu',
  'RİZE - FINDIKLI - Çağlayan Osman Hacıalioğlu Ortaokulu',
  'RİZE - FINDIKLI - Fındıklı 15 Temmuz Şehitleri Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - FINDIKLI - Fındıklı TOBB Anadolu İmam Hatip Lisesi',
  'RİZE - FINDIKLI - İbn-i Sina Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - FINDIKLI - Muammer Çiçekoğlu Ortaokulu',
  'RİZE - FINDIKLI - 11 Mart İlkokulu',
  'RİZE - FINDIKLI - Aksu Atatürk İlkokulu',
  // GÜNEYSU
  'RİZE - GÜNEYSU - Osman Erkan Kız Anadolu İmam Hatip Lisesi',
  'RİZE - GÜNEYSU - Borsa İstanbul Ortaokulu',
  'RİZE - GÜNEYSU - Güneysu Şehit Kemal Mutlu Fen Lisesi',
  'RİZE - GÜNEYSU - Güneysu Spor Lisesi',
  'RİZE - GÜNEYSU - Kaptan Ahmet Erdoğan Anadolu İmam Hatip Lisesi',
  'RİZE - GÜNEYSU - Güneysu İmam Hatip Ortaokulu',
  'RİZE - GÜNEYSU - Güneysu Anadolu Lisesi',
  'RİZE - GÜNEYSU - Adacami İlkokulu',
  'RİZE - GÜNEYSU - ÖZEL BİLGE İLKOKULU',
  'RİZE - GÜNEYSU - ÖZEL GÜNEYSU OKULLARI İLKOKULU',
  'RİZE - GÜNEYSU - ÖZEL GÜNEYSU OKULLARI ORTAOKULU',
  // HEMŞİN
  'RİZE - HEMŞİN - MERKEZ ORTAOKULU',
  'RİZE - HEMŞİN - Hemşin Çok Programlı Anadolu Lisesi',
  // İKİZDERE
  'RİZE - İKİZDERE - İkizdere Anadolu İmam Hatip Lisesi',
  'RİZE - İKİZDERE - ATATÜRK ORTAOKULU',
  'RİZE - İKİZDERE - Fazliye Hüseyin Turanlı Çok Programlı Anadolu Lisesi',
  // İYİDERE
  'RİZE - İYİDERE - Merkez Ortaokulu',
  'RİZE - İYİDERE - Çiftlik Ortaokulu',
  'RİZE - İYİDERE - Hazar Çaysan Ortaokulu',
  'RİZE - İYİDERE - İyidere Anadolu Lisesi',
  'RİZE - İYİDERE - İyidere İmam Hatip Ortaokulu',
  'RİZE - İYİDERE - İYİDERE MESLEKİ VE TEKNİK ANADOLU LİSESİ',
  // KALKANDERE
  'RİZE - KALKANDERE - Kalkandere Anadolu İmam Hatip Lisesi',
  'RİZE - KALKANDERE - Şehit Fikret Metin Öztürk Çok Programlı Anadolu Lisesi',
  'RİZE - KALKANDERE - ORMANLI ORTAOKULU',
  'RİZE - KALKANDERE - YOLBAŞI ORTAOKULU',
  'RİZE - KALKANDERE - ÇAYIRLI ORTAOKULU',
  'RİZE - KALKANDERE - ATATÜRK ORTAOKULU',
  'RİZE - KALKANDERE - DAĞDİBİ ORTAOKULU',
  // MERKEZ
  'RİZE - MERKEZ - Ambarlık Ortaokulu',
  'RİZE - MERKEZ - Gülbahar Hatun Kız Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Ekrem Orhon Turizm Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Elmalı Ortaokulu',
  'RİZE - MERKEZ - Kendirli Şehit Azim ÖZDEMİR Ortaokulu',
  'RİZE - MERKEZ - Merkez Atatürk Ortaokulu',
  'RİZE - MERKEZ - Rize Türkiye Odalar ve Borsalar Birliği Fen Lisesi',
  'RİZE - MERKEZ - Rize Sosyal Bilimler Lisesi',
  'RİZE - MERKEZ - Tevfik İleri Anadolu Lisesi',
  'RİZE - MERKEZ - Tevfik İleri Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Rize Merkez Ticaret Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Rize Anadolu Lisesi',
  'RİZE - MERKEZ - Rize Anadolu İmam Hatip Lisesi',
  'RİZE - MERKEZ - Taşlıdere Gazi Ortaokulu',
  'RİZE - MERKEZ - Ömer Halaç İşitme Engelliler Ortaokulu',
  'RİZE - MERKEZ - Veliköy Uzun Mustafa Kopuz Ortaokulu',
  'RİZE - MERKEZ - Kasarcılar Ortaokulu',
  'RİZE - MERKEZ - Hasan Kemal Yardımcı Denizcilik Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Kömürcüler Ortaokulu',
  'RİZE - MERKEZ - Çaykur Ortaokulu',
  'RİZE - MERKEZ - Reşadiye Zihni Derin Ortaokulu',
  'RİZE - MERKEZ - Şehit Nedim ÇALIK Ortaokulu',
  'RİZE - MERKEZ - Fatih Anadolu Lisesi',
  'RİZE - MERKEZ - Mehmet Akif Ersoy Ortaokulu',
  'RİZE - MERKEZ - Ali Metin Kazancı Rize Lisesi',
  'RİZE - MERKEZ - Şehit Murat Çalışkaner İmam Hatip Ortaokulu',
  'RİZE - MERKEZ - Karasu Ortaokulu',
  'RİZE - MERKEZ - Çay Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - 100. Yıl Cumhuriyet Ortaokulu',
  'RİZE - MERKEZ - Rize İmam Hatip Ortaokulu',
  'RİZE - MERKEZ - Kendirli Şehit Soner Fazlıoğlu Anadolu İmam Hatip Lisesi',
  'RİZE - MERKEZ - Ortapazar Ortaokulu',
  'RİZE - MERKEZ - Hüseyin Yardımcı Ortaokulu',
  'RİZE - MERKEZ - Rize Borsa İstanbul Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - MERKEZ - Dörtyol Şehit Halil Sadıkoğlu Ortaokulu',
  'RİZE - MERKEZ - Pazarköy Hafız Ali Usta Ortaokulu',
  'RİZE - MERKEZ - Mahmut Celalettin ÖKTEN İmam Hatip Ortaokulu',
  'RİZE - MERKEZ - Hasan Sağır İmam Hatip Ortaokulu',
  'RİZE - MERKEZ - Şehit Onur Kılıç Kız Anadolu İmam Hatip Lisesi',
  'RİZE - MERKEZ - Şehit Erhan Dural Kız Anadolu İmam Hatip Lisesi',
  'RİZE - MERKEZ - FATİH ORTAOKULU',
  'RİZE - MERKEZ - BOĞAZ ORTAOKULU',
  'RİZE - MERKEZ - Küçükçayır Ortaokulu',
  'RİZE - MERKEZ - Gündoğdu 29 Ekim Ortaokulu',
  'RİZE - MERKEZ - Ömer Halaç Özel Eğitim Meslek Lisesi',
  'RİZE - MERKEZ - Nuri Pakdil İmam Hatip Ortaokulu',
  'RİZE - MERKEZ - AMBARLIK İLKOKULU',
  'RİZE - MERKEZ - ZİYA GÖKALP İLKOKULU',
  'RİZE - MERKEZ - METİN BOSTANCIOGLU İLKOKULU',
  'RİZE - MERKEZ - PETROL OFİSİ İLKOKULU',
  'RİZE - MERKEZ - MEHMETÇİK İLKOKULU',
  'RİZE - MERKEZ - VAKIFBANK İLKOKULU',
  'RİZE - MERKEZ - Kurtuluş İlkokulu',
  'RİZE - MERKEZ - Türkiye Odalar ve Borsalar Birliği İlkokulu',
  'RİZE - MERKEZ - ÖZEL RİZE ANADOLU İLKOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE ANADOLU ORTAOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE BAHÇEŞEHİR KOLEJİ ANADOLU LİSESİ',
  'RİZE - MERKEZ - ÖZEL RİZE BAHÇEŞEHİR KOLEJİ FEN LİSESİ',
  'RİZE - MERKEZ - ÖZEL RİZE BAHÇEŞEHİR KOLEJİ İLKOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE BAHÇEŞEHİR KOLEJİ ORTAOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE ÇÖZÜM ANADOLU LİSESİ',
  'RİZE - MERKEZ - ÖZEL RİZE ÇÖZÜM İLKOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE ÇÖZÜM ORTAOKULU',
  'RİZE - MERKEZ - ÖZEL RİZE POYRAZ ANADOLU LİSESİ',
  'RİZE - MERKEZ - ÖZEL RİZE POYRAZ FEN LİSESİ',
  'RİZE - MERKEZ - ÖZEL RİZE POYRAZ ORTAOKULU',
  // PAZAR
  'RİZE - PAZAR - FUAT ERGENÇ ORTAOKULU',
  'RİZE - PAZAR - Pazar Anadolu İmam Hatip Lisesi',
  'RİZE - PAZAR - Pazar Kız Kulesi Kız Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - PAZAR - Necat Sağbaş Anadolu Lisesi',
  'RİZE - PAZAR - Pazar Fen Lisesi',
  'RİZE - PAZAR - Pazar 10 Mart Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - PAZAR - Pazar Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - PAZAR - Ahmet Tahtakılıç Ortaokulu',
  'RİZE - PAZAR - HAMİDİYE ORTAOKULU',
  'RİZE - PAZAR - VALİ ERDAL ATA ORTAOKULU',
  'RİZE - PAZAR - TOPLU KONUT İDARESİ BAŞKANLIĞI ORTAOKULU',
  'RİZE - PAZAR - Haberal Vakfı Yaşar ve MedineHaberal Ortaokulu',
  'RİZE - PAZAR - AKTEPE ORTAOKULU',
  'RİZE - PAZAR - ATATÜRK ANADOLU LİSESİ',
  'RİZE - PAZAR - Pazar Şehit Murat Naiboğlu Sivil Havacılık Mesleki ve Teknik Anadolu Lisesi',
  'RİZE - PAZAR - Ahmet Mesut Yılmaz İlkokulu',
  'RİZE - PAZAR - AKTEPE İLKOKULU',
  'RİZE - PAZAR - ÖZEL RİZE PAZAR MEKTEBİM İLKOKULU',
  'RİZE - PAZAR - ÖZEL ÇÖZÜM FEN LİSESİ',
  'RİZE - PAZAR - ÖZEL ÇÖZÜM İLKOKULU',
  'RİZE - PAZAR - ÖZEL ÇÖZÜM ORTAOKULU',
  'RİZE - PAZAR - ÖZEL PAZAR AÇI ANADOLU LİSESİ',
]

const siniflar = [
  '4. Sınıf',
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  '9. Sınıf',
  '10. Sınıf',
  '11. Sınıf',
]

const subeler = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index))

const meslekler = [
  'Acil Tıp Teknisyeni',
  'Anaokulu Öğretmeni',
  'Anestezi Teknikeri',
  'Araştırmacı',
  'Asker',
  'Aşçı',
  'Avukat',
  'Bankacı',
  'Beden Eğitimi Öğretmeni',
  'Bilgisayar Mühendisi',
  'Biyomedikal Mühendisi',
  'Bütçe Uzmanı',
  'Çevre Mühendisliği',
  'Çiftçi',
  'Diş Hekimi',
  'Diş Teknisyeni',
  'Diyetisyen',
  'Doktor',
  'Ebe',
  'Eczacı',
  'Eğitmen',
  'Ekspresyonist',
  'Elektrik Elektronik Mühendisi',
  'Elektrik Teknisyeni',
  'Emlakçı',
  'Endüstri Mühendisi',
  'Endüstriyel Tasarımcı',
  'Ev Hanımı',
  'Felsefe Öğretmeni',
  'Finans Danışmanı',
  'Fizyoterapist',
  'Fotoğrafçı',
  'Garson',
  'Gazeteci',
  'Gıda Mühendisi',
  'Grafik Tasarımcı',
  'Gümrük Müşaviri',
  'Güvenlik Danışmanı',
  'Güvenlik Görevlisi',
  'Hakim',
  'Harita Mühendisi',
  'Havacılık ve Uzay Mühendisliği',
  'Hemşire',
  'Hostes',
  'Hukukçu (Genel)',
  'İç Mimar',
  'İhracat Uzmanı',
  'İletişim Tasarımcısı',
  'İnsan Kaynakları Uzmanı',
  'İnşaat Mühendisi',
  'İnşaat Teknikeri',
  'İşçi',
  'Jeoloji Mühendisi',
  'Kaptan',
  'Kimya Mühendisi',
  'Kuaför/Berber',
  'Lojistik Uzmanı',
  'Maden Mühendisi',
  'Makine Mühendisi',
  'Makine Teknikeri',
  'Mali Müşavir',
  'Matematik Öğretmeni',
  'Metalurji ve Malzeme Mühendisi',
  'Mimar',
  'Mobilya Ustası',
  'Muhasebeci',
  'Muhasebe Uzmanı',
  'Müfettiş',
  'Müteahhit',
  'Müzisyen',
  'Noter',
  'Öğretmen',
  'Pazarlama Uzmanı',
  'Pilot',
  'Polis',
  'Psikiyatrist',
  'Psikolog',
  'Radyoloji Teknikeri',
  'Reklamcı',
  'Sanat Tarihçisi',
  'Sanat Yönetmeni',
  'Sanatçı',
  'Sekreter/Yönetici Asistanı',
  'Serbest Meslek',
  'Serbest Meslek Altın ve Kuyumculuk',
  'Serbest Meslek Çay İmalatı',
  'Serbest Meslek Elektrikli Ev Aletleri',
  'Serbest Meslek İnşaat',
  'Serbest Meslek Konfeksiyon ve Giyim',
  'Serbest Meslek Mobilya İmalatı ve Satış',
  'Serbest Meslek Otomotiv',
  'Serbest Meslek Sigorta Hizmetleri',
  'Serbest Meslek Tesisatçı',
  'Sistem Analisti',
  'Sınıf Öğretmeni',
  'Sosyal Medya Uzmanı',
  'Sosyolog',
  'Spor Antrenörü',
  'Sporcu',
  'Şef (Restoran)',
  'Şoför',
  'Tarih Öğretmeni',
  'Teknisyen',
  'Tercüman',
  'Terzi',
  'Tiyatro Oyuncusu',
  'Turizm Rehberi',
  'Türk Dili ve Edebiyatı Öğretmeni',
  'Uçak Mühendisi',
  'Veri Bilimcisi',
  'Veteriner',
  'Veteriner Hekimi',
  'Web Geliştiricisi',
  'Yazılımcı',
  'Yazılım Mühendisi',
  'Yönetici',
  'Ziraat Mühendisi',
]

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<{ message: string; details?: Array<{ path: string[]; message: string }> } | null>(null)
  const [okulSearch, setOkulSearch] = useState('')
  const [babaMeslekSearch, setBabaMeslekSearch] = useState('')
  const [anneMeslekSearch, setAnneMeslekSearch] = useState('')
  const [kvkkOnay, setKvkkOnay] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<BasvuruFormData>({
    resolver: zodResolver(basvuruSchema),
  })

  const selectedOkul = watch('okul')
  const selectedBabaMeslek = watch('babaMeslek')
  const selectedAnneMeslek = watch('anneMeslek')
  const selectedSinavGunu = watch('sinavGunu')

  // Filtrelenmiş okul listesi
  const filteredOkullar = useMemo(() => {
    if (!okulSearch) return okullar
    return okullar.filter(okul =>
      okul.toLowerCase().includes(okulSearch.toLowerCase())
    )
  }, [okulSearch])

  // Filtrelenmiş baba meslek listesi
  const filteredBabaMeslekler = useMemo(() => {
    if (!babaMeslekSearch) return meslekler
    return meslekler.filter(meslek =>
      meslek.toLowerCase().includes(babaMeslekSearch.toLowerCase())
    )
  }, [babaMeslekSearch])

  // Filtrelenmiş anne meslek listesi
  const filteredAnneMeslekler = useMemo(() => {
    if (!anneMeslekSearch) return meslekler
    return meslekler.filter(meslek =>
      meslek.toLowerCase().includes(anneMeslekSearch.toLowerCase())
    )
  }, [anneMeslekSearch])

  const onSubmit = async (data: BasvuruFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/basvuru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        // API'den gelen hata mesajı ve detayları
        throw {
          message: result.error || 'Başvuru gönderilemedi',
          details: result.details || null
        }
      }

      setSubmitSuccess(true)
      reset()
      setOkulSearch('')
      setBabaMeslekSearch('')
      setAnneMeslekSearch('')

      // 5 saniye sonra success mesajını kaldır
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      // Hata objesi veya Error instance'ı kontrolü
      if (error && typeof error === 'object' && 'message' in error) {
        setSubmitError({
          message: error.message as string,
          details: 'details' in error ? (error.details as Array<{ path: string[]; message: string }>) : undefined
        })
      } else {
        setSubmitError({
          message: error instanceof Error ? error.message : 'Bir hata oluştu'
        })
      }
      
      // 5 saniye sonra hata mesajını kaldır
      setTimeout(() => {
        setSubmitError(null)
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Levent Koleji Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700">
                  Levent Koleji
                </h2>
              </div>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block h-16 w-px bg-gray-300"></div>
            
            {/* Başvuru Başlığı */}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Bursluluk Sınavı Başvuru Sistemi
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                2026 - 2027 Yılı Bursluluk Sınavı İçin Başvuru Formu
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Success Modal */}
        {submitSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center"
            >
              <div className="mb-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                  <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Başvurunuz Başarıyla Alındı!</h3>
              <p className="text-gray-600 mb-6">
                Başvurunuz sisteme kaydedilmiştir. Teşekkür ederiz.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition duration-200"
              >
                Tamam
              </button>
            </motion.div>
        </div>
        )}

        {/* Error Modal */}
        {submitError && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            >
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Başvuru Başarısız!</h3>
                <p className="text-red-600 font-semibold mb-4">
                  {submitError.message}
                </p>
              </div>
              
              {/* Hata Detayları */}
              {submitError.details && submitError.details.length > 0 && (
                <div className="mb-6 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Hata Detayları:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <ul className="space-y-2">
                      {submitError.details.map((detail, index) => {
                        const fieldName = detail.path.join('.')
                        // Türkçe alan isimleri
                        const fieldNames: { [key: string]: string } = {
                          'ogrenciAdSoyad': 'Öğrenci Ad Soyad',
                          'ogrenciTc': 'TC Kimlik No',
                          'okul': 'Okul',
                          'ogrenciSinifi': 'Sınıf',
                          'ogrenciSube': 'Sınıf Şubesi',
                          'sinavGunu': 'Sınav Günü',
                          'babaAdSoyad': 'Baba Ad Soyad',
                          'babaMeslek': 'Baba Meslek',
                          'babaIsAdresi': 'Baba İş Adresi',
                          'babaCepTel': 'Baba Cep Telefonu',
                          'anneAdSoyad': 'Anne Ad Soyad',
                          'anneMeslek': 'Anne Meslek',
                          'anneIsAdresi': 'Anne İş Adresi',
                          'anneCepTel': 'Anne Cep Telefonu',
                          'email': 'E-posta',
                        }
                        const displayName = fieldNames[fieldName] || fieldName
                        return (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-sm text-gray-700">
                              <span className="font-semibold">{displayName}:</span> {detail.message}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setSubmitError(null)}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition duration-200"
              >
                Tamam
              </button>
            </motion.div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-8">
            {/* Sınav Günü Seçimi */}
            <section className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-100">
              <h2 className="text-2xl font-bold text-indigo-900 mb-4 pb-2 border-b-2 border-indigo-200">
                Sınav Günü Tercihi
              </h2>
              <div>
                <label className="block text-lg font-medium text-indigo-900 mb-3">
                  Sınava hangi gün katılmak istersiniz? <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('sinavGunu')}
                  value={selectedSinavGunu || ''}
                  className="w-full px-4 py-4 text-lg border-2 border-indigo-200 rounded-lg focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 bg-white text-indigo-900 font-medium"
                >
                  <option value="">Lütfen bir gün seçiniz...</option>
                  <option value="10 Ocak - Cumartesi">10 Ocak - Cumartesi</option>
                  <option value="11 Ocak - Pazar">11 Ocak - Pazar</option>
                </select>
                {errors.sinavGunu && (
                  <p className="mt-2 text-base text-red-600 font-medium bg-red-50 p-2 rounded-lg border border-red-100">
                    ⚠️ {errors.sinavGunu.message}
                  </p>
                )}
              </div>
            </section>

            {/* Öğrenci Bilgileri */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                Öğrenci Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğrenci Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('ogrenciAdSoyad')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setValue('ogrenciAdSoyad', value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Örn: Ahmet Yılmaz"
                  />
                  {errors.ogrenciAdSoyad && (
                    <p className="mt-1 text-sm text-red-600">{errors.ogrenciAdSoyad.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TC Kimlik No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('ogrenciTc')}
                    maxLength={11}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="12345678901"
                  />
                  {errors.ogrenciTc && (
                    <p className="mt-1 text-sm text-red-600">{errors.ogrenciTc.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sınıf <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('ogrenciSinifi')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Seçiniz</option>
                    {siniflar.map((sinif) => (
                      <option key={sinif} value={sinif}>
                        {sinif}
                      </option>
                    ))}
                  </select>
                  {errors.ogrenciSinifi && (
                    <p className="mt-1 text-sm text-red-600">{errors.ogrenciSinifi.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sınıf Şubesi <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('ogrenciSube')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  >
                    <option value="">Seçiniz</option>
                    {subeler.map((sube) => (
                      <option key={sube} value={sube}>
                        {sube} Şubesi
                      </option>
                    ))}
                  </select>
                  {errors.ogrenciSube && (
                    <p className="mt-1 text-sm text-red-600">{errors.ogrenciSube.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okul <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Okul adı yazarak arayın..."
                      value={okulSearch}
                      onChange={(e) => setOkulSearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 mb-2"
                    />
                    <select
                      {...register('okul')}
                      value={selectedOkul || ''}
                      onChange={(e) => {
                        setValue('okul', e.target.value)
                        setOkulSearch('')
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      size={okulSearch ? Math.min(filteredOkullar.length + 1, 8) : 1}
                    >
                      <option value="">Seçiniz</option>
                      {filteredOkullar.map((okul) => (
                        <option key={okul} value={okul}>
                          {okul}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedOkul && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Seçilen: {selectedOkul}
                    </p>
                  )}
                  {errors.okul && (
                    <p className="mt-1 text-sm text-red-600">{errors.okul.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Baba Bilgileri */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                Baba Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baba Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('babaAdSoyad')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setValue('babaAdSoyad', value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Örn: Mehmet Yılmaz"
                  />
                  {errors.babaAdSoyad && (
                    <p className="mt-1 text-sm text-red-600">{errors.babaAdSoyad.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meslek <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Meslek adı yazarak arayın..."
                      value={babaMeslekSearch}
                      onChange={(e) => setBabaMeslekSearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 mb-2"
                    />
                    <select
                      {...register('babaMeslek')}
                      value={selectedBabaMeslek || ''}
                      onChange={(e) => {
                        setValue('babaMeslek', e.target.value)
                        setBabaMeslekSearch('')
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      size={babaMeslekSearch ? Math.min(filteredBabaMeslekler.length + 1, 8) : 1}
                    >
                      <option value="">Seçiniz</option>
                      {filteredBabaMeslekler.map((meslek) => (
                        <option key={`baba-${meslek}`} value={meslek}>
                          {meslek}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedBabaMeslek && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Seçilen: {selectedBabaMeslek}
                    </p>
                  )}
                  {errors.babaMeslek && (
                    <p className="mt-1 text-sm text-red-600">{errors.babaMeslek.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cep Telefonu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('babaCepTel')}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setValue('babaCepTel', value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="5XXXXXXXXX (10 hane)"
                  />
                  {errors.babaCepTel && (
                    <p className="mt-1 text-sm text-red-600">{errors.babaCepTel.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İş Adresi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('babaIsAdresi')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="İş adresi bilgisi"
                  />
                  {errors.babaIsAdresi && (
                    <p className="mt-1 text-sm text-red-600">{errors.babaIsAdresi.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* Anne Bilgileri */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                Anne Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anne Ad Soyad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('anneAdSoyad')}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase()
                      setValue('anneAdSoyad', value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="Örn: Ayşe Yılmaz"
                  />
                  {errors.anneAdSoyad && (
                    <p className="mt-1 text-sm text-red-600">{errors.anneAdSoyad.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meslek <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Meslek adı yazarak arayın..."
                      value={anneMeslekSearch}
                      onChange={(e) => setAnneMeslekSearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 mb-2"
                    />
                    <select
                      {...register('anneMeslek')}
                      value={selectedAnneMeslek || ''}
                      onChange={(e) => {
                        setValue('anneMeslek', e.target.value)
                        setAnneMeslekSearch('')
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                      size={anneMeslekSearch ? Math.min(filteredAnneMeslekler.length + 1, 8) : 1}
                    >
                      <option value="">Seçiniz</option>
                      {filteredAnneMeslekler.map((meslek) => (
                        <option key={`anne-${meslek}`} value={meslek}>
                          {meslek}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedAnneMeslek && (
                    <p className="mt-2 text-sm text-green-600 font-medium">
                      ✓ Seçilen: {selectedAnneMeslek}
                    </p>
                  )}
                  {errors.anneMeslek && (
                    <p className="mt-1 text-sm text-red-600">{errors.anneMeslek.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cep Telefonu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('anneCepTel')}
                    maxLength={10}
                    minLength={10}
                    onChange={(e) => {
                      // Sadece rakamları al
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                      setValue('anneCepTel', value)
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="5XXXXXXXXX (10 hane)"
                  />
                  {errors.anneCepTel && (
                    <p className="mt-1 text-sm text-red-600">{errors.anneCepTel.message}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İş Adresi <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('anneIsAdresi')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="İş adresi bilgisi"
                  />
                  {errors.anneIsAdresi && (
                    <p className="mt-1 text-sm text-red-600">{errors.anneIsAdresi.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* İletişim Bilgileri */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                İletişim Bilgileri
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    placeholder="ornek@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </section>

            {/* KVKK Onay */}
            <div className="pt-6 pb-4">
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <input
                  type="checkbox"
                  id="kvkkOnay"
                  checked={kvkkOnay}
                  onChange={(e) => setKvkkOnay(e.target.checked)}
                  className="mt-1 h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer"
                />
                <label htmlFor="kvkkOnay" className="flex-1 text-sm text-gray-700 cursor-pointer">
                  <span className="text-red-500 font-semibold">*</span>{' '}
                  <Link 
                    href="/kvkk" 
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                  >
                    Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
                  </Link>
                  {' '}ni okudum, anladım ve kişisel verilerimin işlenmesine onay veriyorum.
                </label>
              </div>
              {!kvkkOnay && (
                <p className="mt-2 text-sm text-red-600">
                  Başvuruyu göndermek için KVKK aydınlatma metnini okumanız ve onaylamanız gerekmektedir.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || !kvkkOnay}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Başvurunuz Gönderiliyor...
                  </span>
                ) : (
                  'Başvuruyu Gönder'
                )}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              <span className="text-red-500">*</span> ile işaretli alanlar zorunludur.
            </p>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2025 Levent Koleji Başvuru Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </main>
    </div>
  )
}
