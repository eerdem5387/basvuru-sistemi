// Webhook yapılandırmasını kontrol et
console.log('🔍 Webhook Yapılandırması Kontrolü\n')

const webhookUrl = process.env.WEBHOOK_URL
const webhookSecret = process.env.WEBHOOK_SECRET

console.log('📍 WEBHOOK_URL:', webhookUrl || '❌ TANIMLI DEĞİL')
console.log('🔑 WEBHOOK_SECRET:', webhookSecret ? '✅ TANIMLI (' + webhookSecret.length + ' karakter)' : '❌ TANIMLI DEĞİL')

if (!webhookUrl) {
  console.log('\n⚠️  UYARI: WEBHOOK_URL tanımlı değil!')
  console.log('   Başvurular kaydedilir ama webhook gönderilmez.')
  console.log('   Vercel Dashboard → Settings → Environment Variables → WEBHOOK_URL ekleyin')
}

if (!webhookSecret) {
  console.log('\n⚠️  UYARI: WEBHOOK_SECRET tanımlı değil!')
  console.log('   Webhook güvenliği için secret gerekli!')
  console.log('   Vercel Dashboard → Settings → Environment Variables → WEBHOOK_SECRET ekleyin')
}

if (webhookUrl && webhookSecret) {
  console.log('\n✅ Webhook yapılandırması tamam!')
  console.log('   URL:', webhookUrl)
  console.log('   Secret uzunluğu:', webhookSecret.length, 'karakter')
}

