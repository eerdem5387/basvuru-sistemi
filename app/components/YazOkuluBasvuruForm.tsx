'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const siniflar = [
  '5. Sınıf',
  '6. Sınıf',
  '7. Sınıf',
  '8. Sınıf',
  '9. Sınıf',
  '10. Sınıf',
  '11. Sınıf',
  '12. Sınıf',
]

type FormState = {
  ogrenciAd: string
  ogrenciSoyad: string
  okul: string
  ogrenciSinifi: string
  veliAd: string
  veliSoyad: string
  veliTelefon: string
}

const emptyForm: FormState = {
  ogrenciAd: '',
  ogrenciSoyad: '',
  okul: '',
  ogrenciSinifi: '',
  veliAd: '',
  veliSoyad: '',
  veliTelefon: '',
}

export default function YazOkuluBasvuruForm() {
  const [form, setForm] = useState<FormState>(emptyForm)
  const [kvkkOnay, setKvkkOnay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!kvkkOnay) {
      setSubmitError('Başvuru için KVKK onayını vermeniz gerekmektedir.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/yaz-okulu-basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, kvkkOnay: true }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Başvuru gönderilemedi')
      }

      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200'

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                  <img src="/logo.png" alt="Levent Koleji Logo" className="h-full w-full object-contain" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700">Levent Koleji</h2>
              </div>
              <div className="hidden sm:block h-16 w-px bg-gray-300" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                2026-2027 Yaz Okulu Başvuru Formu
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-8 sm:p-12 text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                <svg className="h-12 w-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Başvurunuz Alındı</h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Yaz okulu başvurunuz başarıyla kaydedilmiştir. Teşekkür ederiz.
              </p>
              <p className="text-xl font-semibold text-indigo-700 mt-8">Levent Okulları</p>
            </div>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
                <img src="/logo.png" alt="Levent Koleji Logo" className="h-full w-full object-contain" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-indigo-700">Levent Koleji</h2>
            </div>
            <div className="hidden sm:block h-16 w-px bg-gray-300" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                2026-2027 Yaz Okulu Başvuru Formu
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Öğrenci ve veli bilgilerini doldurarak başvurunuzu tamamlayabilirsiniz
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {submitError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {submitError}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                Öğrenci Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğrenci Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.ogrenciAd}
                    onChange={(e) => updateField('ogrenciAd', e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={inputClass}
                    placeholder="Öğrenci adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğrenci Soyadı <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.ogrenciSoyad}
                    onChange={(e) => updateField('ogrenciSoyad', e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={inputClass}
                    placeholder="Öğrenci soyadı"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Okul <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.okul}
                    onChange={(e) => updateField('okul', e.target.value)}
                    className={inputClass}
                    placeholder="Okul adı"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sınıf <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.ogrenciSinifi}
                    onChange={(e) => updateField('ogrenciSinifi', e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Seçiniz</option>
                    {siniflar.map((sinif) => (
                      <option key={sinif} value={sinif}>
                        {sinif}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-indigo-500">
                Veli Bilgileri
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veli Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.veliAd}
                    onChange={(e) => updateField('veliAd', e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={inputClass}
                    placeholder="Veli adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veli Soyadı <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.veliSoyad}
                    onChange={(e) => updateField('veliSoyad', e.target.value.toLocaleUpperCase('tr-TR'))}
                    className={inputClass}
                    placeholder="Veli soyadı"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veli Telefon Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.veliTelefon}
                    onChange={(e) =>
                      updateField('veliTelefon', e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className={inputClass}
                    placeholder="5XXXXXXXXX (10 hane)"
                  />
                </div>
              </div>
            </section>

            <div className="pt-2">
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
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !kvkkOnay}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Başvurunuz Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center">
              <span className="text-red-500">*</span> ile işaretli alanlar zorunludur.
            </p>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2026 Levent Koleji Başvuru Sistemi. Tüm hakları saklıdır.</p>
        </div>
      </main>
    </div>
  )
}
