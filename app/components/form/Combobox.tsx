'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type ComboOption = {
  value: string
  label: string
  /** Sağda gösterilen ikincil bilgi (örn. ilçe) */
  meta?: string
}

const normalize = (s: string) =>
  s
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

type Props = {
  id: string
  options: readonly ComboOption[]
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  emptyText?: string
}

export default function Combobox({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder = 'Seçiniz',
  searchPlaceholder = 'Aramak için yazın…',
  disabled,
  invalid,
  describedBy,
  emptyText = 'Sonuç bulunamadı',
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listId = useId()

  const selected = options.find((o) => o.value === value)

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return options
    const terms = q.split(/\s+/)
    // Sıralama: tam eşleşme > baştan eşleşme > kelime başında eşleşme > içinde geçen
    const rank = (label: string) => {
      const l = normalize(label)
      if (l === q) return 0
      if (l.startsWith(q)) return 1
      if (l.split(/\s+/).some((w) => w.startsWith(terms[0]))) return 2
      return 3
    }
    return options
      .filter((o) => {
        const hay = normalize(`${o.label} ${o.meta ?? ''}`)
        return terms.every((t) => hay.includes(t))
      })
      .map((o, i) => ({ o, i, r: rank(o.label) }))
      .sort((a, b) => a.r - b.r || a.i - b.i)
      .map((x) => x.o)
  }, [options, query])

  // Dışarı tıklanınca kapat
  useEffect(() => {
    if (!open) return
    const handler = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [open, onBlur])

  // Açılınca seçili öğeye konumlan
  useEffect(() => {
    if (!open) return
    setQuery('')
    const idx = Math.max(0, options.findIndex((o) => o.value === value))
    setActive(idx)
    requestAnimationFrame(() => {
      searchRef.current?.focus({ preventScroll: true })
      // Ekranın altında açılırsa panelin tamamını görünür alana getir
      const panel = rootRef.current?.querySelector<HTMLElement>('[data-combo-panel]')
      const rect = panel?.getBoundingClientRect()
      scrollListTo(idx)
      if (rect && rect.bottom > window.innerHeight) {
        window.scrollBy({ top: rect.bottom - window.innerHeight + 16, behavior: 'smooth' })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Yalnızca listeyi kaydırır (scrollIntoView sayfayı da kaydırdığı için kullanılmaz)
  const scrollListTo = (idx: number) => {
    const list = listRef.current
    const item = list?.querySelector<HTMLElement>(`[data-index="${idx}"]`)
    if (!list || !item) return
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop - 4
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight)
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight + 4
  }

  useEffect(() => {
    scrollListTo(active)
  }, [active])

  const choose = (opt: ComboOption) => {
    onChange(opt.value)
    setOpen(false)
    onBlur?.()
    triggerRef.current?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[active]
      if (opt) choose(opt)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'Tab') {
      setOpen(false)
      onBlur?.()
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className={`field-control flex items-center justify-between gap-3 text-left ${
          invalid ? 'field-invalid' : ''
        } ${selected ? 'text-slate-900' : 'text-slate-400'}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected ? (
            <>
              {selected.label}
              {selected.meta && <span className="ml-2 text-xs font-medium text-slate-500">{selected.meta}</span>}
            </>
          ) : (
            placeholder
          )}
        </span>
        <svg
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div data-combo-panel className="absolute left-0 right-0 z-40 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 ring-1 ring-slate-900/5">
          <div className="border-b border-slate-100 p-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.45 4.39l3.08 3.08a.75.75 0 11-1.06 1.06l-3.08-3.08A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setActive(0)
                }}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                aria-controls={listId}
                aria-activedescendant={filtered[active] ? `${listId}-${active}` : undefined}
                autoComplete="off"
                className="w-full rounded-lg bg-slate-50 py-2.5 pl-9 pr-3 text-base text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500 sm:text-sm"
              />
            </div>
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="relative max-h-72 overflow-y-auto overscroll-contain py-1">
            {filtered.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">{emptyText}</li>}
            {filtered.map((opt, i) => {
              const isSel = opt.value === value
              const isAct = i === active
              return (
                <li
                  key={opt.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(opt)}
                  className={`mx-1 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    isAct ? 'bg-brand-50 text-brand-900' : 'text-slate-700'
                  }`}
                >
                  <span className={`min-w-0 flex-1 ${isSel ? 'font-semibold' : ''}`}>{opt.label}</span>
                  {opt.meta && (
                    <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {opt.meta}
                    </span>
                  )}
                  {isSel && (
                    <svg className="h-4 w-4 shrink-0 text-brand-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
