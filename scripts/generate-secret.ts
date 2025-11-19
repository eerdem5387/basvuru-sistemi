import { randomBytes } from 'crypto'

const secret = randomBytes(32).toString('base64')

console.log('\n🔑 NEXTAUTH_SECRET oluşturuldu:\n')
console.log(secret)
console.log('\nBu değeri .env.local dosyanızdaki NEXTAUTH_SECRET değişkenine ekleyin.\n')

