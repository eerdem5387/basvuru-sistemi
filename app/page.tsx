'use client'

import YazOkuluBasvuruForm from './components/YazOkuluBasvuruForm'
import BurslulukBasvuruForm from './components/BurslulukBasvuruForm'

const applicationMode = process.env.NEXT_PUBLIC_APPLICATION_MODE || 'yaz_okulu'

export default function HomePage() {
  if (applicationMode === 'bursluluk') {
    return <BurslulukBasvuruForm />
  }

  return <YazOkuluBasvuruForm />
}
