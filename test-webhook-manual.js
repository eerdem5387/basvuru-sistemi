// Manuel webhook test scripti
// Kullanım: node test-webhook-manual.js

const webhookUrl = 'https://okul-yonetim-sistemi.vercel.app/api/webhook/basvuru'
const webhookSecret = '5MMK5mhIv6O/rAyWiw2ioWNGmN+CtorZM2ij4SjWm2Y='

const testPayload = {
  id: 'test-' + Date.now(),
  ogrenciAdSoyad: 'TEST ÖĞRENCİ',
  ogrenciTc: '46879131346',
  okul: 'Test Okulu',
  ogrenciSinifi: '5. Sınıf',
  babaAdSoyad: 'TEST BABA',
  babaMeslek: 'Test Meslek',
  babaIsAdresi: null,
  babaCepTel: '5551234567',
  anneAdSoyad: 'TEST ANNE',
  anneMeslek: 'Test Meslek',
  anneIsAdresi: null,
  anneCepTel: '5557654321',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

async function testWebhook() {
  try {
    console.log('🚀 Webhook test başlatılıyor...')
    console.log('📍 URL:', webhookUrl)
    console.log('🔑 Secret:', webhookSecret.substring(0, 10) + '...')
    console.log('📦 Payload ID:', testPayload.id)
    console.log('')
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': webhookSecret,
        'X-Webhook-Source': 'basvuru-sistemi',
      },
      body: JSON.stringify(testPayload),
    })

    const data = await response.json()
    
    console.log('📊 Status:', response.status)
    console.log('📦 Response:', JSON.stringify(data, null, 2))
    console.log('')
    
    if (response.ok) {
      console.log('✅ Webhook başarılı!')
      console.log('')
      console.log('Şimdi debug endpoint\'ini kontrol edin:')
      console.log('https://okul-yonetim-sistemi.vercel.app/api/debug/basvurular')
    } else {
      console.log('❌ Webhook başarısız!')
      if (response.status === 401) {
        console.log('')
        console.log('⚠️  401 Unauthorized - Secret yanlış olabilir')
        console.log('   Her iki projede de WEBHOOK_SECRET aynı olmalı')
      } else if (response.status === 500) {
        console.log('')
        console.log('⚠️  500 Internal Server Error - Okul yönetim sisteminde hata var')
        console.log('   Vercel logs\'larını kontrol edin')
      }
    }
  } catch (error) {
    console.error('❌ Hata:', error.message)
    if (error.message.includes('fetch failed')) {
      console.log('')
      console.log('⚠️  Network hatası - Okul yönetim sistemi çalışmıyor olabilir')
      console.log('   URL\'i kontrol edin:', webhookUrl)
    }
  }
}

testWebhook()

