import { z } from "zod"
import { MESLEKLER, OKULLAR, SINIFLAR } from "./basvuru-sabitleri"
import { RIZE_MAHALLELER } from "./rize-adres"

// ---------------------------------------------------------------------------
// TC Kimlik No algoritma kontrolü
// ---------------------------------------------------------------------------
export const tcKimlikValidator = (tc: string): boolean => {
  if (!/^\d{11}$/.test(tc)) return false

  const digits = tc.split("").map(Number)
  if (digits[0] === 0) return false

  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
  const digit10 = (((sum1 - sum2) % 10) + 10) % 10
  if (digits[9] !== digit10) return false

  const digit11 = digits.slice(0, 10).reduce((a, b) => a + b, 0) % 10
  return digits[10] === digit11
}

// ---------------------------------------------------------------------------
// Giriş biçimlendiricileri (istemci tarafında yazarken uygulanır)
// ---------------------------------------------------------------------------

/**
 * Ad / soyad alanı: yalnızca harf ve tek boşluk; her kelimenin ilk harfi büyük,
 * kalan harfleri küçük (Türkçe kurallarına göre: i → İ, I → ı).
 * Yazım sırasında sondaki tek boşluk korunur ki ikinci ad yazılabilsin.
 */
export function formatIsim(raw: string): string {
  const cleaned = raw
    .replace(/[^A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s/, "")

  return cleaned
    .split(" ")
    .map((word) =>
      word
        ? word.charAt(0).toLocaleUpperCase("tr-TR") + word.slice(1).toLocaleLowerCase("tr-TR")
        : word
    )
    .join(" ")
    .slice(0, 50)
}

/** Telefon: yalnızca rakam, ilk rakam 5, en fazla 10 hane. Başa yazılan 0 / +90 atılır. */
export function formatTelefon(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("90") && digits.length > 10) digits = digits.slice(2)
  digits = digits.replace(/^0+/, "")
  if (digits && digits[0] !== "5") return ""
  return digits.slice(0, 10)
}

/** TC: yalnızca rakam, ilk rakam 0 olamaz, en fazla 11 hane. */
export function formatTc(raw: string): string {
  return raw.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11)
}

// ---------------------------------------------------------------------------
// Şema (istemci ve sunucu aynı şemayı kullanır)
// ---------------------------------------------------------------------------
const ISIM_REGEX = /^[A-ZÇĞİÖŞÜÂÎÛ][a-zçğıöşüâîû]+(?: [A-ZÇĞİÖŞÜÂÎÛ][a-zçğıöşüâîû]+)*$/

const isim = (etiket: string) =>
  z
    .string({ error: `${etiket} zorunludur` })
    .trim()
    .min(1, `${etiket} zorunludur`)
    .min(2, `${etiket} en az 2 harf olmalıdır`)
    .max(50, `${etiket} en fazla 50 karakter olabilir`)
    .regex(ISIM_REGEX, `${etiket} yalnızca harf içermeli; ilk harf büyük, diğerleri küçük olmalıdır`)

const telefon = (etiket: string) =>
  z
    .string({ error: `${etiket} zorunludur` })
    .min(1, `${etiket} zorunludur`)
    .regex(/^5\d{9}$/, `${etiket} 5 ile başlayan 10 haneli olmalıdır (örn. 5331231212)`)

const listeden = (liste: readonly string[], mesaj: string) =>
  z
    .string({ error: mesaj })
    .min(1, mesaj)
    .refine((v) => liste.includes(v), mesaj)

export const basvuruSchema = z
  .object({
    ogrenciAd: isim("Öğrenci adı"),
    ogrenciSoyad: isim("Öğrenci soyadı"),
    ogrenciTc: z
      .string({ error: "TC Kimlik No zorunludur" })
      .min(1, "TC Kimlik No zorunludur")
      .regex(/^\d{11}$/, "TC Kimlik No 11 haneli olmalıdır")
      .refine(tcKimlikValidator, "Geçersiz TC Kimlik No, lütfen kontrol ediniz"),
    okul: listeden(OKULLAR, "Lütfen listeden okul seçiniz"),
    ogrenciSinifi: listeden(SINIFLAR, "Lütfen sınıf seçiniz"),

    anneAd: isim("Anne adı"),
    anneSoyad: isim("Anne soyadı"),
    anneMeslek: listeden(MESLEKLER, "Lütfen anne mesleğini listeden seçiniz"),
    anneCepTel: telefon("Anne telefon numarası"),

    babaAd: isim("Baba adı"),
    babaSoyad: isim("Baba soyadı"),
    babaMeslek: listeden(MESLEKLER, "Lütfen baba mesleğini listeden seçiniz"),
    babaCepTel: telefon("Baba telefon numarası"),

    adresIlce: listeden(Object.keys(RIZE_MAHALLELER), "Lütfen ilçe seçiniz"),
    adresMahalle: z.string({ error: "Lütfen mahalle seçiniz" }).min(1, "Lütfen mahalle seçiniz"),
    adresDetay: z
      .string({ error: "Adres detayı zorunludur" })
      .trim()
      .min(1, "Adres detayı zorunludur")
      .min(10, "Lütfen sokak, bina ve daire bilgisini de yazınız (en az 10 karakter)")
      .max(250, "Adres detayı en fazla 250 karakter olabilir"),

    kvkkOnay: z.literal(true, { error: "KVKK aydınlatma metnini onaylamanız gerekmektedir" }),
  })
  .superRefine((data, ctx) => {
    const mahalleler = RIZE_MAHALLELER[data.adresIlce]
    if (mahalleler && data.adresMahalle && !mahalleler.includes(data.adresMahalle)) {
      ctx.addIssue({
        code: "custom",
        path: ["adresMahalle"],
        message: "Seçilen mahalle bu ilçeye ait değil, lütfen yeniden seçiniz",
      })
    }
  })

export type BasvuruFormData = z.infer<typeof basvuruSchema>

export const ALAN_ETIKETLERI: Record<string, string> = {
  ogrenciAd: "Öğrenci Adı",
  ogrenciSoyad: "Öğrenci Soyadı",
  ogrenciTc: "Öğrenci TC Kimlik No",
  okul: "Okuduğu Okul",
  ogrenciSinifi: "Sınıfı",
  anneAd: "Anne Adı",
  anneSoyad: "Anne Soyadı",
  anneMeslek: "Anne Mesleği",
  anneCepTel: "Anne Telefon",
  babaAd: "Baba Adı",
  babaSoyad: "Baba Soyadı",
  babaMeslek: "Baba Mesleği",
  babaCepTel: "Baba Telefon",
  adresIlce: "İlçe",
  adresMahalle: "Mahalle",
  adresDetay: "Adres Detayı",
  kvkkOnay: "KVKK Onayı",
}
