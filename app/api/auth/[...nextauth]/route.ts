import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers

// Enable debug logging in development
if (process.env.NODE_ENV === 'development') {
  console.log('NextAuth handlers initialized')
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing')
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
}

