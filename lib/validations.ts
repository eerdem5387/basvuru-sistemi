import { z } from "zod"

// TC Kimlik No validasyonu
export const tcKimlikValidator = (tc: string): boolean => {
  if (!/^\d{11}$/.test(tc)) return false
  
  const digits = tc.split('').map(Number)
  
  // İlk rakam 0 olamaz
  if (digits[0] === 0) return false
  
  // 10. rakam kontrolü
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7]
  const digit10 = (sum1 - sum2) % 10
  if (digits[9] !== digit10) return false
  
  // 11. rakam kontrolü
  const sum3 = digits.slice(0, 10).reduce((a, b) => a + b, 0)
  const digit11 = sum3 % 10
  if (digits[10] !== digit11) return false
  
  return true
}

export const basvuruSchema = z.object({
  ogrenciAdSoyad: z.string()
    .min(3, "Öğrenci adı soyadı en az 3 karakter olmalıdır")
    .max(100, "Öğrenci adı soyadı en fazla 100 karakter olabilir")
    .regex(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/, "Sadece harf ve boşluk kullanılabilir"),
  
  ogrenciTc: z.string()
    .length(11, "TC Kimlik No 11 haneli olmalıdır")
    .regex(/^\d+$/, "TC Kimlik No sadece rakamlardan oluşmalıdır")
    .refine(tcKimlikValidator, "Geçersiz TC Kimlik No"),
  
  okul: z.string()
    .min(1, "Okul seçimi zorunludur"),
  
  ogrenciSinifi: z.string()
    .min(1, "Sınıf seçimi zorunludur"),
  
  babaAdSoyad: z.string()
    .min(3, "Baba adı soyadı en az 3 karakter olmalıdır")
    .max(100, "Baba adı soyadı en fazla 100 karakter olabilir")
    .regex(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/, "Sadece harf ve boşluk kullanılabilir"),
  
  babaMeslek: z.string()
    .min(1, "Baba meslek seçimi zorunludur"),
  
  babaIsAdresi: z.string()
    .max(500, "Baba iş adresi en fazla 500 karakter olabilir")
    .optional(),
  
  babaCepTel: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu numarası giriniz (5XXXXXXXXX)"),
  
  anneAdSoyad: z.string()
    .min(3, "Anne adı soyadı en az 3 karakter olmalıdır")
    .max(100, "Anne adı soyadı en fazla 100 karakter olabilir")
    .regex(/^[a-zA-ZğüşöçİĞÜŞÖÇ\s]+$/, "Sadece harf ve boşluk kullanılabilir"),
  
  anneMeslek: z.string()
    .min(1, "Anne meslek seçimi zorunludur"),
  
  anneIsAdresi: z.string()
    .max(500, "Anne iş adresi en fazla 500 karakter olabilir")
    .optional(),
  
  anneCepTel: z.string()
    .regex(/^(\+90|0)?5\d{9}$/, "Geçerli bir cep telefonu numarası giriniz (5XXXXXXXXX)"),
  
  email: z.string()
    .email("Geçerli bir e-posta adresi giriniz")
    .toLowerCase(),
})

export type BasvuruFormData = z.infer<typeof basvuruSchema>

