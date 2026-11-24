'use client'

import type { ReactNode } from 'react'

export function RequiredMark() {
  return (
    <span className="ml-0.5 text-rose-500" aria-hidden>
      *
    </span>
  )
}

type FieldProps = {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  warning?: string
  className?: string
  children: ReactNode
}

export function Field({ id, label, error, hint, warning, className = '', children }: FieldProps) {
  return (
    <div className={className} data-field={id}>
      <label htmlFor={id} className="mb-1.5 flex items-center text-sm font-semibold text-slate-700">
        {label}
        <RequiredMark />
      </label>
      {children}
      <div id={`${id}-msg`} aria-live="polite" className="min-h-0">
        {error ? (
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-rose-600">
            <svg className="mt-px h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        ) : warning ? (
          <p className="mt-1.5 flex items-start gap-1.5 text-[13px] font-medium leading-snug text-amber-700">
            <svg className="mt-px h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path
                fillRule="evenodd"
                d="M8.49 2.85c.66-1.14 2.36-1.14 3.02 0l6.28 10.88c.66 1.14-.16 2.57-1.5 2.57H3.71c-1.34 0-2.16-1.43-1.5-2.57L8.49 2.85zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {warning}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-[13px] leading-snug text-slate-500">{hint}</p>
        ) : null}
      </div>
    </div>
  )
}

export function ValidIcon() {
  return (
    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden>
      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.86-9.81a.75.75 0 00-1.22-.88l-3.24 4.5-1.6-1.6a.75.75 0 10-1.06 1.06l2.22 2.22a.75.75 0 001.14-.09l3.76-5.21z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

type SectionProps = {
  id: string
  step: number
  title: string
  description: string
  done: boolean
  children: ReactNode
}

export function Section({ id, step, title, description, done, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-900/[0.04]"
    >
      <header className="flex items-start gap-4 border-b border-slate-100 px-5 py-5 sm:px-8">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-colors ${
            done ? 'bg-emerald-500 text-white' : 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
          }`}
          aria-hidden
        >
          {done ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.58l7.3-7.3a1 1 0 011.4 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            step
          )}
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        </div>
      </header>
      <div className="px-5 py-6 sm:px-8 sm:py-7">{children}</div>
    </section>
  )
}
