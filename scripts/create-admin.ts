import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@bursluluk.com'
  const password = process.env.ADMIN_PASSWORD || 'Admin123!@#'
  const name = 'Admin'

  // Check if admin already exists
  const existingAdmin = await prisma.admin.findUnique({
    where: { email }
  })

  if (existingAdmin) {
    console.log('❌ Admin kullanıcısı zaten mevcut:', email)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12)

  // Create admin
  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name,
    }
  })

  console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!')
  console.log('📧 Email:', email)
  console.log('🔑 Şifre:', password)
  console.log('\n⚠️  Lütfen production ortamında bu şifreyi değiştirin!')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

