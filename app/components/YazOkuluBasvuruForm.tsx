'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Ogrenci {
  id: string
  firstName: string
  lastName: string
  grade: string | null
}

export default function YazOkuluBasvuruForm() {
  const [ogrenciler, setOgrenciler] = useState<Ogrenci[]>([])
  const [loadingOgrenciler, setLoadingOgrenciler] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Ogrenci | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [kvkkOnay, setKvkkOnay] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchOgrenciler = async () => {
      setLoadingOgrenciler(true)
      setLoadError(null)
      try {
        const response = await fetch('/api/yaz-okulu/ogrenciler')
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'Öğrenci listesi yüklenemedi')
        }
        setOgrenciler(data.ogrenciler || [])
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Öğrenci listesi yüklenemedi')
      } finally {
        setLoadingOgrenciler(false)
      }
    }

    fetchOgrenciler()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredOgrenciler = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('tr-TR')
    if (!query) return ogrenciler

    return ogrenciler.filter((ogrenci) => {
      const fullName = `${ogrenci.firstName} ${ogrenci.lastName}`.toLocaleLowerCase('tr-TR')
      return fullName.includes(query)
    })
  }, [ogrenciler, search])

  const handleSelect = (ogrenci: Ogrenci) => {
    setSelectedStudent(ogrenci)
    setSearch(`${ogrenci.firstName} ${ogrenci.lastName}`)
    setIsDropdownOpen(false)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setSelectedStudent(null)
    setIsDropdownOpen(true)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!selectedStudent) {
      setSubmitError('Lütfen bir öğrenci seçiniz.')
      return
    }

    if (!kvkkOnay) {
      setSubmitError('Başvuru için KVKK onayını vermeniz gerekmektedir.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/yaz-okulu-basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          kvkkOnay: true,
        }),
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

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
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
              <div className="hidden sm:block h-16 w-px bg-gray-300" />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  2026-2027 Yaz Okulu Başvuru Formu
                </h1>
              </div>
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
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Başvurunuz Alındı
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                Yaz okulu başvurunuz başarıyla kaydedilmiştir. Teşekkür ederiz.
              </p>
              <p className="text-xl font-semibold text-indigo-700 mt-8">
                Levent Okulları
              </p>
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
            <div className="hidden sm:block h-16 w-px bg-gray-300" />
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                2026-2027 Yaz Okulu Başvuru Formu
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Öğrencinizi seçerek yaz okulu başvurusunu tamamlayabilirsiniz
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
                Öğrenci Seçimi
              </h2>

              <div ref={dropdownRef} className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Öğrenci <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => setIsDropdownOpen(true)}
                  disabled={loadingOgrenciler || !!loadError}
                  placeholder={
                    loadingOgrenciler
                      ? 'Öğrenciler yükleniyor...'
                      : 'Ad soyad yazarak arayın...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 disabled:bg-gray-100"
                  autoComplete="off"
                />

                {isDropdownOpen && !loadingOgrenciler && !loadError && (
                  <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredOgrenciler.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Eşleşen öğrenci bulunamadı
                      </div>
                    ) : (
                      filteredOgrenciler.map((ogrenci) => {
                        const fullName = `${ogrenci.firstName} ${ogrenci.lastName}`
                        return (
                          <button
                            key={ogrenci.id}
                            type="button"
                            onClick={() => handleSelect(ogrenci)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition ${
                              selectedStudent?.id === ogrenci.id
                                ? 'bg-indigo-50 text-indigo-800 font-medium'
                                : 'text-gray-800'
                            }`}
                          >
                            {fullName}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}

                {selectedStudent && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    Seçilen: {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                )}

                {loadError && (
                  <p className="mt-2 text-sm text-red-600">{loadError}</p>
                )}
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
                disabled={isSubmitting || !kvkkOnay || !selectedStudent || loadingOgrenciler}
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
