'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import Combobox, { type ComboOption } from './form/Combobox'
import { Field, Section, ValidIcon } from './form/fields'
import { BURSLULUK_DONEM, MESLEKLER, OKULLAR, OTURUMLAR, SINIFLAR, oturumBul, oturumEtiketi } from '@/lib/basvuru-sabitleri'
import { ADRES_IL, RIZE_ILCELER, RIZE_MAHALLELER } from '@/lib/rize-adres'
import { ALAN_ETIKETLERI, basvuruSchema, formatIsim, formatTc, formatTelefon } from '@/lib/validations'

const DONEM = BURSLULUK_DONEM.replace('-', ' - ')

// ---------------------------------------------------------------------------
// Form modeli
// ---------------------------------------------------------------------------
type Values = {
  ogrenciAd: string
  ogrenciSoyad: string
  ogrenciTc: string
  okul: string
  ogrenciSinifi: string
  oturum: string
  anneAd: string
  anneSoyad: string
  anneMeslek: string
  anneCepTel: string
  babaAd: string
  babaSoyad: string
  babaMeslek: string
  babaCepTel: string
  adresIlce: string
  adresMahalle: string
  adresDetay: string
  kvkkOnay: boolean
}
type Name = keyof Values

const EMPTY: Values = {
  ogrenciAd: '',
  ogrenciSoyad: '',
  ogrenciTc: '',
  okul: '',
  ogrenciSinifi: '',
  oturum: '',
  anneAd: '',
  anneSoyad: '',
  anneMeslek: '',
  anneCepTel: '',
  babaAd: '',
  babaSoyad: '',
  babaMeslek: '',
  babaCepTel: '',
  adresIlce: '',
  adresMahalle: '',
  adresDetay: '',
  kvkkOnay: false,
}

const SECTIONS = [
  { id: 'ogrenci', title: 'Öğrenci Bilgileri', fields: ['ogrenciAd', 'ogrenciSoyad', 'ogrenciTc', 'okul', 'ogrenciSinifi', 'oturum'] },
  {
    id: 'veli',
    title: 'Veli Bilgileri',
    fields: ['anneAd', 'anneSoyad', 'anneMeslek', 'anneCepTel', 'babaAd', 'babaSoyad', 'babaMeslek', 'babaCepTel'],
  },
  { id: 'adres', title: 'Adres Bilgileri', fields: ['adresIlce', 'adresMahalle', 'adresDetay'] },
  { id: 'onay', title: 'Onay', fields: ['kvkkOnay'] },
] as const satisfies ReadonlyArray<{ id: string; title: string; fields: readonly Name[] }>

const ALL_FIELDS = SECTIONS.flatMap((s) => s.fields) as Name[]

const OKUL_OPTIONS: ComboOption[] = OKULLAR.map((o) => {
  const [, ilce, ...ad] = o.split(' - ')
  return { value: o, label: ad.join(' - '), meta: ilce }
})
const MESLEK_OPTIONS: ComboOption[] = MESLEKLER.map((m) => ({ value: m, label: m }))
/** Oturumlar güne göre gruplanır: { "9 Ocak Cumartesi": [...] } */
const OTURUM_GRUPLARI = OTURUMLAR.reduce<Record<string, (typeof OTURUMLAR)[number][]>>((acc, o) => {
  const gun = o.gun.replace(' - ', ' ')
  ;(acc[gun] ??= []).push(o)
  return acc
}, {})

/** Okul türü ile sınıf düzeyinin uyumunu kontrol eder (engellemez, yalnızca uyarır).
 *  Birden fazla kademesi olan okullarda (örn. "… Lisesi, İlkokulu ve Ortaokulu") tüm kademeler dikkate alınır. */
function okulSinifUyarisi(okul: string, sinif: string): string | undefined {
  if (!okul || !sinif) return
  const n = parseInt(sinif, 10)
  const ad = okul.toLocaleLowerCase('tr-TR')
  const kademeler = [
    { var: ad.includes('ilkokul'), min: 1, max: 4 },
    { var: ad.includes('ortaokul'), min: 5, max: 8 },
    { var: ad.includes('lise'), min: 9, max: 12 },
  ].filter((k) => k.var)
  if (kademeler.length === 0) return
  if (kademeler.some((k) => n >= k.min && n <= k.max)) return
  return 'Seçtiğiniz okulda bu sınıf düzeyi bulunmuyor görünüyor; okul ve sınıfı kontrol ediniz.'
}

// ---------------------------------------------------------------------------
// Bileşen
// ---------------------------------------------------------------------------
export default function BurslulukBasvuruForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [touched, setTouched] = useState<Partial<Record<Name, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [serverErrors, setServerErrors] = useState<Partial<Record<Name, string>>>({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ id: string; ogrenci: string } | null>(null)
  // Kabul edilmeyen bir karakter yazıldığında anlık bilgilendirme
  const [notices, setNotices] = useState<Partial<Record<Name, string>>>({})

  // Şema doğrulaması — her alan için ilk hata
  const errors = useMemo(() => {
    const out: Partial<Record<Name, string>> = {}
    const r = basvuruSchema.safeParse(values)
    if (!r.success) {
      for (const issue of r.error.issues) {
        const key = issue.path[0] as Name
        if (key && !out[key]) out[key] = issue.message
      }
    }
    for (const [k, msg] of Object.entries(serverErrors)) {
      if (msg && !out[k as Name]) out[k as Name] = msg
    }
    return out
  }, [values, serverErrors])

  const shownError = (name: Name) => (touched[name] || submitAttempted ? errors[name] : undefined)
  const isValid = (name: Name) => !errors[name] && values[name] !== '' && values[name] !== false

  const sectionDone = (fields: readonly Name[]) => fields.every((f) => isValid(f))
  const completedCount = ALL_FIELDS.filter((f) => isValid(f)).length
  const progress = Math.round((completedCount / ALL_FIELDS.length) * 100)
  const dirty = ALL_FIELDS.some((f) => values[f] !== EMPTY[f])

  const set = useCallback(<K extends Name>(name: K, value: Values[K]) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'adresIlce' && prev.adresIlce !== value) next.adresMahalle = ''
      return next
    })
    setServerErrors((prev) => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }, [])

  const touch = useCallback((name: Name) => setTouched((t) => (t[name] ? t : { ...t, [name]: true })), [])

  // Sayfadan yanlışlıkla ayrılmayı önle
  useEffect(() => {
    if (!dirty || success) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty, success])

  const focusField = (name: Name) => {
    const el = document.getElementById(name)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => el.focus({ preventScroll: true }), 350)
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setSubmitError(null)
    const firstInvalid = ALL_FIELDS.find((f) => errors[f])
    if (firstInvalid) {
      focusField(firstInvalid)
      return
    }
    setReviewOpen(true)
  }

  const confirmSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/basvuru', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          ...Object.fromEntries(
            (['ogrenciAd', 'ogrenciSoyad', 'anneAd', 'anneSoyad', 'babaAd', 'babaSoyad', 'adresDetay'] as const).map(
              (k) => [k, values[k].trim()]
            )
          ),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const details: Array<{ path: string[]; message: string }> = Array.isArray(data.details) ? data.details : []
        if (details.length) {
          const mapped: Partial<Record<Name, string>> = {}
          for (const d of details) {
            const k = d.path?.[0] as Name
            if (k && k in EMPTY && !mapped[k]) mapped[k] = d.message
          }
          setServerErrors(mapped)
          const first = ALL_FIELDS.find((f) => mapped[f])
          if (first) {
            setReviewOpen(false)
            setSubmitAttempted(true)
            focusField(first)
            return
          }
        }
        setSubmitError(data.error || 'Başvuru gönderilemedi. Lütfen tekrar deneyiniz.')
        return
      }
      setReviewOpen(false)
      setSuccess({ id: String(data.id ?? ''), ogrenci: `${values.ogrenciAd.trim()} ${values.ogrenciSoyad.trim()}` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setSubmitError('Bağlantı hatası oluştu. İnternet bağlantınızı kontrol edip tekrar deneyiniz.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setValues(EMPTY)
    setTouched({})
    setSubmitAttempted(false)
    setServerErrors({})
    setSuccess(null)
    window.scrollTo({ top: 0 })
  }

  // --- Alan yardımcıları ------------------------------------------------------
  const textInput = (
    name: Name,
    opts: {
      label: string
      placeholder?: string
      format: (v: string) => string
      inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
      autoComplete?: string
      hint?: React.ReactNode
      warning?: string
      prefix?: string
      className?: string
      type?: string
      /** Yazılan değer biçimlendirici tarafından reddedildiyse gösterilecek uyarı */
      reject?: (raw: string, formatted: string) => string | undefined
    }
  ) => {
    const err = shownError(name)
    const ok = isValid(name)
    return (
      <Field
        id={name}
        label={opts.label}
        error={err}
        hint={opts.hint}
        warning={notices[name] ?? opts.warning}
        className={opts.className}
      >
        <div className="relative">
          {opts.prefix && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-slate-200 pl-4 pr-3 text-[15px] font-medium text-slate-500">
              {opts.prefix}
            </span>
          )}
          <input
            id={name}
            name={name}
            type={opts.type ?? 'text'}
            inputMode={opts.inputMode}
            autoComplete={opts.autoComplete ?? 'off'}
            autoCapitalize={opts.inputMode ? 'off' : 'words'}
            autoCorrect="off"
            spellCheck={false}
            placeholder={opts.placeholder}
            value={values[name] as string}
            onChange={(e) => {
              const raw = e.target.value
              const formatted = opts.format(raw)
              const notice = opts.reject?.(raw, formatted)
              setNotices((n) => (n[name] === notice ? n : { ...n, [name]: notice }))
              set(name, formatted as never)
            }}
            onBlur={(e) => {
              const trimmed = e.target.value.trim()
              if (trimmed !== e.target.value) set(name, trimmed as never)
              touch(name)
            }}
            aria-invalid={!!err || undefined}
            aria-describedby={`${name}-msg`}
            aria-required
            className={`field-control ${opts.prefix ? 'pl-[4.25rem]' : ''} pr-11 ${err ? 'field-invalid' : ''}`}
          />
          {ok && <ValidIcon />}
        </div>
      </Field>
    )
  }

  const nameInput = (name: Name, label: string, placeholder: string) =>
    textInput(name, {
      label,
      placeholder,
      format: formatIsim,
      reject: (raw) =>
        /[^A-Za-zÇĞİÖŞÜçğıöşüÂÎÛâîû\s]/.test(raw) ? 'Bu alana yalnızca harf girilebilir.' : undefined,
    })

  const phoneInput = (name: 'anneCepTel' | 'babaCepTel', label: string) => {
    const v = values[name]
    const other = name === 'anneCepTel' ? values.babaCepTel : values.anneCepTel
    return textInput(name, {
      label,
      type: 'tel',
      inputMode: 'numeric',
      autoComplete: 'tel-national',
      placeholder: '5XXXXXXXXX',
      prefix: '+90',
      format: formatTelefon,
      reject: (raw, formatted) => {
        const digits = raw.replace(/\D/g, '').replace(/^(90)?0*/, '')
        if (digits && !formatted) return 'Telefon numarası 5 ile başlamalıdır (başında 0 olmadan).'
        if (/[^\d\s()+-]/.test(raw)) return 'Bu alana yalnızca rakam girilebilir.'
      },
      hint: v ? `${v.length}/10 hane` : 'Başında 0 olmadan, 5 ile başlayan 10 hane (örn. 5331231212)',
      warning: v.length === 10 && v === other ? 'Anne ve baba telefon numarası aynı girildi.' : undefined,
    })
  }

  const meslekInput = (name: 'anneMeslek' | 'babaMeslek', label: string) => {
    const err = shownError(name)
    return (
      <Field id={name} label={label} error={err}>
        <Combobox
          id={name}
          options={MESLEK_OPTIONS}
          value={values[name]}
          onChange={(v) => set(name, v)}
          onBlur={() => touch(name)}
          placeholder="Meslek seçiniz"
          searchPlaceholder="Meslek ara…"
          invalid={!!err}
          describedBy={`${name}-msg`}
        />
      </Field>
    )
  }

  const mahalleOptions = useMemo<ComboOption[]>(
    () => (RIZE_MAHALLELER[values.adresIlce] ?? []).map((m) => ({ value: m, label: m })),
    [values.adresIlce]
  )

  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      {/* Üst bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Levent Koleji" className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[15px] font-bold text-slate-900 sm:text-base">Levent Koleji</p>
              <p className="truncate text-xs text-slate-500 sm:text-[13px]">Bursluluk Sınavı Başvurusu</p>
            </div>
          </div>
          {!success && (
            <div className="hidden items-center gap-3 sm:flex lg:hidden" aria-hidden>
              <span className="text-xs font-semibold text-slate-600">%{progress}</span>
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
        {!success && (
          <div className="h-1 w-full bg-slate-100 sm:hidden" aria-hidden>
            <div className="h-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden bg-brand-950">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(1200px 400px at 10% -20%, rgba(59,101,245,.55), transparent 60%), radial-gradient(800px 300px at 100% 0%, rgba(96,139,250,.35), transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-7 sm:px-6 sm:pb-28 sm:pt-14">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100 ring-1 ring-white/15">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {DONEM} Eğitim Öğretim Yılı
          </p>
          <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-white sm:mt-4 sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
            {success ? 'Başvurunuz alındı' : 'Bursluluk Sınavı Başvuru Formu'}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-brand-100/90 sm:text-base">
            {success
              ? 'Başvurunuz sistemimize kaydedildi. Sınavla ilgili bilgilendirme veli telefon numaralarına yapılacaktır.'
              : 'Öğrenci, veli ve adres bilgilerini eksiksiz doldurarak başvurunuzu birkaç dakika içinde tamamlayabilirsiniz.'}
          </p>
          {!success && (
            <ul className="mt-5 flex flex-wrap gap-1.5 text-xs text-brand-50 sm:mt-6 sm:gap-2 sm:text-[13px]">
              {['Yaklaşık 3 dakika', 'Tüm alanlar zorunludur', 'Bilgileriniz KVKK kapsamında korunur'].map((t) => (
                <li key={t} className="flex items-center gap-1.5 rounded-lg bg-white/[0.07] px-2.5 py-1 ring-1 ring-white/10 sm:px-3 sm:py-1.5">
                  <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <main className="relative mx-auto -mt-16 max-w-6xl px-4 pb-16 sm:-mt-20 sm:px-6">
        {success ? (
          <SuccessCard ogrenci={success.ogrenci} values={values} onReset={resetForm} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
            {/* Yan panel */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <p className="text-sm font-semibold text-slate-900">Başvuru ilerlemesi</p>
                    <p className="text-sm font-bold text-brand-700">%{progress}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                  <nav className="mt-5 space-y-1" aria-label="Form bölümleri">
                    {SECTIONS.map((s, i) => {
                      const done = sectionDone(s.fields)
                      const count = s.fields.filter((f) => isValid(f)).length
                      return (
                        <a
                          key={s.id}
                          href={`#${s.id}`}
                          className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition hover:bg-slate-50"
                        >
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {done ? '✓' : i + 1}
                          </span>
                          <span className={`flex-1 font-medium ${done ? 'text-slate-900' : 'text-slate-600'}`}>{s.title}</span>
                          <span className="text-xs tabular-nums text-slate-400">
                            {count}/{s.fields.length}
                          </span>
                        </a>
                      )
                    })}
                  </nav>
                </div>
                <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
                  <p className="text-sm font-semibold text-brand-900">Dikkat edilecekler</p>
                  <ul className="mt-3 list-disc space-y-2.5 pl-4 text-[13px] leading-snug text-brand-900/80">
                    <li>Ad ve soyadları nüfus kaydındaki gibi yazınız; büyük/küçük harfler otomatik düzenlenir.</li>
                    <li>Telefonlar başında 0 olmadan, 5 ile başlayan 10 hane olmalıdır.</li>
                    <li>Her öğrenci bu döneme yalnızca bir kez başvurabilir.</li>
                  </ul>
                </div>
              </div>
            </aside>

            {/* Form */}
            <form onSubmit={onSubmit} noValidate className="min-w-0 space-y-6">
              <Section
                id="ogrenci"
                step={1}
                title="Öğrenci Bilgileri"
                description="Sınava girecek öğrencinin kimlik ve okul bilgileri"
                done={sectionDone(SECTIONS[0].fields)}
              >
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  {nameInput('ogrenciAd', 'Öğrenci Adı', 'Örn. Ayşe Nur')}
                  {nameInput('ogrenciSoyad', 'Öğrenci Soyadı', 'Örn. Yılmaz')}
                  {textInput('ogrenciTc', {
                    label: 'Öğrenci TC Kimlik No',
                    placeholder: '11 haneli TC Kimlik No',
                    inputMode: 'numeric',
                    format: formatTc,
                    reject: (raw) => (/\D/.test(raw) ? 'TC Kimlik No yalnızca rakamlardan oluşur.' : undefined),
                    hint: values.ogrenciTc ? `${values.ogrenciTc.length}/11 hane` : 'Yalnızca rakam, 11 hane',
                    className: 'sm:col-span-2',
                  })}
                  <Field
                    id="okul"
                    label="Okuduğu Okul"
                    error={shownError('okul')}
                    className="sm:col-span-2"
                    hint="Okul adı veya ilçe yazarak arayabilirsiniz"
                  >
                    <Combobox
                      id="okul"
                      options={OKUL_OPTIONS}
                      value={values.okul}
                      onChange={(v) => set('okul', v)}
                      onBlur={() => touch('okul')}
                      placeholder="Okul seçiniz"
                      searchPlaceholder="Okul veya ilçe ara…"
                      invalid={!!shownError('okul')}
                      describedBy="okul-msg"
                    />
                  </Field>
                  <Field
                    id="ogrenciSinifi"
                    label="Sınıfı"
                    error={shownError('ogrenciSinifi')}
                    warning={okulSinifUyarisi(values.okul, values.ogrenciSinifi)}
                    className="sm:col-span-2"
                  >
                    <div role="radiogroup" aria-label="Sınıf" className="grid grid-cols-3 gap-2 sm:grid-cols-9">
                      {SINIFLAR.map((s, i) => {
                        const checked = values.ogrenciSinifi === s
                        return (
                          <button
                            key={s}
                            id={i === 0 ? 'ogrenciSinifi' : undefined}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            aria-label={s}
                            onClick={() => {
                              set('ogrenciSinifi', s)
                              touch('ogrenciSinifi')
                            }}
                            className={`h-12 rounded-xl border text-[15px] font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${
                              checked
                                ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25'
                                : shownError('ogrenciSinifi')
                                  ? 'border-rose-300 bg-rose-50/40 text-slate-700 hover:border-rose-400'
                                  : 'border-slate-300 bg-white text-slate-700 hover:border-brand-400 hover:text-brand-700'
                            }`}
                          >
                            {parseInt(s, 10)}.<span className="sm:hidden"> Sınıf</span>
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                  <div className="sm:col-span-2 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:p-5">
                    <Field
                      id="oturum"
                      label="Katılmak İstediği Sınav Oturumu"
                      error={shownError('oturum')}
                      hint="Öğrenci yalnızca seçtiği oturumda sınava girebilir."
                    >
                      <select
                        id="oturum"
                        value={values.oturum}
                        onChange={(e) => {
                          set('oturum', e.target.value)
                          touch('oturum')
                        }}
                        onBlur={() => touch('oturum')}
                        aria-invalid={!!shownError('oturum') || undefined}
                        aria-describedby="oturum-msg"
                        className={`field-control ${values.oturum ? '' : 'text-slate-400'} ${
                          shownError('oturum') ? 'field-invalid' : ''
                        }`}
                      >
                        <option value="" disabled>
                          Oturum seçiniz
                        </option>
                        {Object.entries(OTURUM_GRUPLARI).map(([gun, list]) => (
                          <optgroup key={gun} label={gun} className="text-slate-900">
                            {list.map((o) => (
                              <option key={o.value} value={o.value} className="text-slate-900">
                                {gun} · {o.oturum}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>
              </Section>

              <Section
                id="veli"
                step={2}
                title="Veli Bilgileri"
                description="Anne ve babaya ait meslek ve iletişim bilgileri"
                done={sectionDone(SECTIONS[1].fields)}
              >
                <div className="grid gap-5 xl:grid-cols-2">
                  {(
                    [
                      ['anne', 'Anne'],
                      ['baba', 'Baba'],
                    ] as const
                  ).map(([key, title]) => (
                    <fieldset key={key} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-4 sm:p-5">
                      <legend className="sr-only">{title} bilgileri</legend>
                      <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[11px] text-brand-700 ring-1 ring-slate-200">
                          {title[0]}
                        </span>
                        {title}
                      </p>
                      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-1">
                        {nameInput(`${key}Ad`, `${title} Adı`, key === 'anne' ? 'Örn. Fatma' : 'Örn. Mehmet')}
                        {nameInput(`${key}Soyad`, `${title} Soyadı`, 'Örn. Yılmaz')}
                        <div className="sm:col-span-2 xl:col-span-1">{meslekInput(`${key}Meslek`, `${title} Mesleği`)}</div>
                        <div className="sm:col-span-2 xl:col-span-1">{phoneInput(`${key}CepTel`, `${title} Telefon Numarası`)}</div>
                      </div>
                    </fieldset>
                  ))}
                </div>
              </Section>

              <Section
                id="adres"
                step={3}
                title="Adres Bilgileri"
                description="Ailenin ikamet ettiği adres"
                done={sectionDone(SECTIONS[2].fields)}
              >
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="adresIl" className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
                      Şehir
                    </label>
                    <div className="relative">
                      <input id="adresIl" value={ADRES_IL} disabled readOnly className="field-control pr-11" />
                      <svg
                        className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <Field id="adresIlce" label="İlçe" error={shownError('adresIlce')}>
                    <select
                      id="adresIlce"
                      value={values.adresIlce}
                      onChange={(e) => {
                        set('adresIlce', e.target.value)
                        touch('adresIlce')
                      }}
                      onBlur={() => touch('adresIlce')}
                      aria-invalid={!!shownError('adresIlce') || undefined}
                      aria-describedby="adresIlce-msg"
                      className={`field-control ${values.adresIlce ? '' : 'text-slate-400'} ${
                        shownError('adresIlce') ? 'field-invalid' : ''
                      }`}
                    >
                      <option value="" disabled>
                        İlçe seçiniz
                      </option>
                      {RIZE_ILCELER.map((i) => (
                        <option key={i} value={i} className="text-slate-900">
                          {i}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    id="adresMahalle"
                    label="Mahalle / Köy"
                    error={shownError('adresMahalle')}
                    hint={values.adresIlce ? `${mahalleOptions.length} kayıt · yazarak arayabilirsiniz` : 'Önce ilçe seçiniz'}
                    className="sm:col-span-2"
                  >
                    <Combobox
                      id="adresMahalle"
                      options={mahalleOptions}
                      value={values.adresMahalle}
                      onChange={(v) => set('adresMahalle', v)}
                      onBlur={() => touch('adresMahalle')}
                      placeholder={values.adresIlce ? 'Mahalle / köy seçiniz' : 'Önce ilçe seçiniz'}
                      searchPlaceholder="Mahalle veya köy ara…"
                      disabled={!values.adresIlce}
                      invalid={!!shownError('adresMahalle')}
                      describedBy="adresMahalle-msg"
                    />
                  </Field>
                  <Field
                    id="adresDetay"
                    label="Adres Detayı"
                    error={shownError('adresDetay')}
                    hint={`Cadde/sokak, bina no, daire no · ${values.adresDetay.length}/250`}
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="adresDetay"
                      rows={3}
                      maxLength={250}
                      autoComplete="street-address"
                      placeholder="Örn. Atatürk Cad. Güneş Sok. No: 12 Daire: 4"
                      value={values.adresDetay}
                      onChange={(e) => set('adresDetay', e.target.value.replace(/\s{2,}/g, ' ').replace(/^\s+/, ''))}
                      onBlur={(e) => {
                        set('adresDetay', e.target.value.trim())
                        touch('adresDetay')
                      }}
                      aria-invalid={!!shownError('adresDetay') || undefined}
                      aria-describedby="adresDetay-msg"
                      className={`field-control resize-none ${shownError('adresDetay') ? 'field-invalid' : ''}`}
                    />
                  </Field>
                </div>
              </Section>

              {/* Onay ve gönder */}
              <section id="onay" className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
                <label
                  htmlFor="kvkkOnay"
                  className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition ${
                    values.kvkkOnay
                      ? 'border-brand-200 bg-brand-50/60'
                      : shownError('kvkkOnay')
                        ? 'border-rose-300 bg-rose-50/50'
                        : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
                  }`}
                >
                  <input
                    id="kvkkOnay"
                    type="checkbox"
                    checked={values.kvkkOnay}
                    onChange={(e) => {
                      set('kvkkOnay', e.target.checked)
                      touch('kvkkOnay')
                    }}
                    aria-describedby="kvkkOnay-msg"
                    className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-300 accent-brand-600"
                  />
                  <span className="text-sm leading-relaxed text-slate-700">
                    <Link
                      href="/kvkk"
                      target="_blank"
                      className="font-semibold text-brand-700 underline underline-offset-2 hover:text-brand-800"
                    >
                      KVKK Aydınlatma Metni
                    </Link>
                    &apos;ni okudum, anladım. Kişisel verilerimin başvuru süreci kapsamında işlenmesine onay veriyorum.
                    <span className="text-rose-500"> *</span>
                  </span>
                </label>
                <div id="kvkkOnay-msg" aria-live="polite">
                  {shownError('kvkkOnay') && (
                    <p className="mt-2 text-[13px] font-medium text-rose-600">{shownError('kvkkOnay')}</p>
                  )}
                </div>

                {submitAttempted && ALL_FIELDS.some((f) => errors[f]) && (
                  <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
                    <p className="font-semibold">Lütfen eksik veya hatalı alanları düzeltiniz:</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {ALL_FIELDS.filter((f) => errors[f]).map((f) => (
                        <li key={f}>
                          <button
                            type="button"
                            onClick={() => focusField(f)}
                            className="rounded-md bg-white px-2 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
                          >
                            {ALAN_ETIKETLERI[f]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="submit"
                  className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-base font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-[0.99]"
                >
                  Bilgileri Kontrol Et ve Devam Et
                  <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 01.75-.75h10.64l-4.22-4.22a.75.75 0 111.06-1.06l5.5 5.5a.75.75 0 010 1.06l-5.5 5.5a.75.75 0 11-1.06-1.06l4.22-4.22H3.75A.75.75 0 013 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <p className="mt-3 text-center text-xs text-slate-500">Göndermeden önce girdiğiniz bilgilerin özetini göreceksiniz.</p>
              </section>
            </form>
          </div>
        )}

        <footer className="mt-10 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Levent Koleji · Tüm hakları saklıdır ·{' '}
          <Link href="/kvkk" className="underline underline-offset-2 hover:text-slate-700">
            KVKK
          </Link>
        </footer>
      </main>

      <AnimatePresence>
        {reviewOpen && (
          <ReviewDialog
            values={values}
            submitting={submitting}
            error={submitError}
            onClose={() => !submitting && setReviewOpen(false)}
            onConfirm={confirmSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Özet, onay penceresi ve başarı kartı
// ---------------------------------------------------------------------------
function summaryGroups(v: Values) {
  return [
    {
      title: 'Öğrenci',
      rows: [
        ['Ad Soyad', `${v.ogrenciAd} ${v.ogrenciSoyad}`],
        ['TC Kimlik No', v.ogrenciTc],
        ['Okul', v.okul.split(' - ').slice(2).join(' - ')],
        ['Okul İlçesi', v.okul.split(' - ')[1] ?? ''],
        ['Sınıf', v.ogrenciSinifi],
        ['Sınav Oturumu', (() => {
          const o = oturumBul(v.oturum)
          return o ? oturumEtiketi(o) : ''
        })()],
      ],
    },
    {
      title: 'Anne',
      rows: [
        ['Ad Soyad', `${v.anneAd} ${v.anneSoyad}`],
        ['Meslek', v.anneMeslek],
        ['Telefon', v.anneCepTel],
      ],
    },
    {
      title: 'Baba',
      rows: [
        ['Ad Soyad', `${v.babaAd} ${v.babaSoyad}`],
        ['Meslek', v.babaMeslek],
        ['Telefon', v.babaCepTel],
      ],
    },
    {
      title: 'Adres',
      rows: [
        ['İl / İlçe', `${ADRES_IL} / ${v.adresIlce}`],
        ['Mahalle / Köy', v.adresMahalle],
        ['Detay', v.adresDetay],
      ],
    },
  ]
}

function Summary({ values }: { values: Values }) {
  return (
    <div className="space-y-4">
      {summaryGroups(values).map((g) => (
        <div key={g.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <p className="bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">{g.title}</p>
          <dl className="divide-y divide-slate-100">
            {g.rows.map(([k, val]) => (
              <div key={k} className="grid grid-cols-[110px_1fr] gap-3 px-4 py-2.5 text-sm sm:grid-cols-[140px_1fr]">
                <dt className="text-slate-500">{k}</dt>
                <dd className="break-words font-medium text-slate-900">{val}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

function ReviewDialog({
  values,
  submitting,
  error,
  onClose,
  onConfirm,
}: {
  values: Values
  submitting: boolean
  error: string | null
  onClose: () => void
  onConfirm: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden />
          <h2 id="review-title" className="text-lg font-bold text-slate-900 sm:text-xl">
            Bilgilerinizi kontrol edin
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Başvuru gönderildikten sonra bilgiler değiştirilemez. Lütfen her alanı dikkatle kontrol ediniz.
          </p>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50/40 px-5 py-5 sm:px-7">
          <Summary values={values} />
        </div>
        <div className="border-t border-slate-100 bg-white px-5 py-4 sm:px-7">
          {error && (
            <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700 ring-1 ring-rose-200" role="alert">
              {error}
            </p>
          )}
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-12 rounded-xl border border-slate-300 px-5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Düzenle
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 text-[15px] font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
            >
              {submitting && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {submitting ? 'Gönderiliyor…' : 'Onayla ve Başvuruyu Gönder'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SuccessCard({ ogrenci, values, onReset }: { ogrenci: string; values: Values; onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50">
          <svg className="h-9 w-9 text-emerald-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.86-9.81a.75.75 0 00-1.22-.88l-3.24 4.5-1.6-1.6a.75.75 0 10-1.06 1.06l2.22 2.22a.75.75 0 001.14-.09l3.76-5.21z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-900">Teşekkür ederiz</h2>
        <p className="mt-2 text-slate-600">
          <span className="font-semibold text-slate-900">{ogrenci}</span> için bursluluk sınavı başvurusu başarıyla alındı.
        </p>
      </div>
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-6 sm:px-10">
        <Summary values={values} />
        <button
          type="button"
          onClick={onReset}
          className="mt-6 h-12 w-full rounded-xl border border-slate-300 bg-white text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Başka bir öğrenci için başvuru yap
        </button>
      </div>
    </motion.div>
  )
}
