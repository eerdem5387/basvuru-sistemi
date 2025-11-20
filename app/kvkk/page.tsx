'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Levent Koleji Logo" 
                className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
              />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-indigo-700">
                  Levent Koleji
                </h1>
              </div>
            </div>
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium transition duration-200"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Kişisel Verilerin Korunması Kanunu (KVKK) Aydınlatma Metni
          </h1>
          <p className="text-gray-600 mb-8">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-indigo max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Veri Sorumlusu</h2>
              <p>
                <strong>Levent Koleji</strong> olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, 
                kişisel verilerinizin işlenmesi konusunda veri sorumlusu sıfatına sahibiz. Bu aydınlatma metni, 
                kişisel verilerinizin işlenmesi hakkında sizleri bilgilendirmek amacıyla hazırlanmıştır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. İşlenen Kişisel Veriler</h2>
              <p>Başvuru formu aracılığıyla aşağıdaki kişisel verileriniz işlenmektedir:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Öğrenci Bilgileri:</strong> Ad, soyad, TC Kimlik Numarası, okul bilgisi, sınıf bilgisi</li>
                <li><strong>Veli Bilgileri:</strong> Anne ve baba adı soyadı, meslek, iş adresi, cep telefonu</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numaraları</li>
                <li><strong>Başvuru Bilgileri:</strong> Başvuru tarihi, başvuru durumu</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Bursluluk sınavı başvurularının alınması ve değerlendirilmesi</li>
                <li>Başvuru süreçlerinin yönetilmesi</li>
                <li>Başvuru sahipleri ile iletişim kurulması</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>İstatistiksel analizler ve raporlama</li>
                <li>Başvuru süreçlerinin iyileştirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kişisel Verilerin İşlenme Hukuki Sebepleri</h2>
              <p>Kişisel verileriniz aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>KVKK Madde 5/2-c: "Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması"</li>
                <li>KVKK Madde 5/2-e: "Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması"</li>
                <li>KVKK Madde 5/2-f: "İlgili kişinin kendisi tarafından alenileştirilmiş olması"</li>
                <li>KVKK Madde 5/2-ç: "İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlemenin zorunlu olması"</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Kişisel Verilerin Toplanma Yöntemi</h2>
              <p>
                Kişisel verileriniz, başvuru formu aracılığıyla elektronik ortamda, doğrudan sizden toplanmaktadır.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Kişisel Verilerin Saklanma Süresi</h2>
              <p>
                Kişisel verileriniz, KVKK ve ilgili mevzuat hükümlerine uygun olarak, işlenme amaçlarının gerektirdiği 
                süre boyunca saklanacaktır. Bu süre, yasal saklama sürelerinin sona ermesi veya işleme amacının 
                ortadan kalkması durumunda sona erer.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. KVKK Kapsamındaki Haklarınız</h2>
              <p>KVKK Madde 11 uyarınca, kişisel verileriniz hakkında aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>İşlenmişse buna ilişkin bilgi talep etme</li>
                <li>İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
                <li>Eksik veya yanlış işlenmişse düzeltilmesini isteme</li>
                <li>KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme</li>
                <li>Düzeltme, silme, yok edilme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme</li>
                <li>Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Haklarınızı Kullanma Yöntemi</h2>
              <p>
                KVKK kapsamındaki haklarınızı kullanmak için, kimliğinizi tespit edici belgelerle birlikte, 
                yazılı olarak veya kayıtlı elektronik posta (KEP) adresi, güvenli elektronik imza, mobil imza 
                veya daha önce bildirdiğiniz ve sistemimizde kayıtlı bulunan elektronik posta adresiniz kullanılarak 
                <strong> info@leventokullari.com</strong> adresine başvurabilirsiniz.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. İletişim Bilgileri</h2>
              <p>
                Kişisel verilerinizin korunması ile ilgili sorularınız, talepleriniz ve şikayetleriniz için 
                aşağıdaki iletişim bilgilerini kullanabilirsiniz:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>Veri Sorumlusu:</strong> Levent Koleji</p>
                <p><strong>E-posta:</strong> info@leventokullari.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Değişiklikler</h2>
              <p>
                Bu aydınlatma metni, KVKK ve ilgili mevzuatta yapılabilecek değişiklikler veya işleme amaçlarımızda 
                meydana gelebilecek değişiklikler nedeniyle güncellenebilir. Güncel versiyon her zaman bu sayfada 
                yayınlanacaktır.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium transition duration-200"
            >
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  )
}

