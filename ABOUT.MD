# 📍 Parapin — Yapay Zeka Destekli Kişisel Bütçe Asistanı

Parapin; karmaşık formlar, kafa karıştırıcı grafikler ve bitmek bilmeyen manuel veri girişleri yerine, bütçe yönetimini tamamen **doğal bir sohbet deneyimine** dönüştüren yeni nesil bir kişisel finans uygulamasıdır.

---

## 🎯 Projenin Hedefi ve Amacı

Geleneksel finans uygulamaları, kullanıcıyı harcama yaptıktan sonra tek tek miktar, kategori, başlık ve tarih seçmeye zorlar. Bu hantal süreç, kullanıcıların bütçe takibini yarıda bırakmasına neden olur.

**Parapin'in Amacı:**
Kullanıcının sadece konuşarak veya yazarak harcamalarını bildirmesini sağlamak, arka plandaki tüm kategorilendirme ve kayıt işlemlerini yapay zekaya devrederek **bütçe takibindeki insan eforunu sıfıra indirmektir.**

---

## 🧭 Temel İlkelerimiz

- **Chat-First (Önce Sohbet):** Uygulamanın ana kumanda merkezi bir mesajlaşma ekranıdır. Finansal veri girişi mesaj atarak yapılır.
- **Local-First (Önce Yerel Gizlilik):** Girilen tüm finansal veriler, sohbet geçmişi ve hassas bilgiler sadece kullanıcının kendi cihazında saklanır; uzak bir sunucuya (backend) gönderilmez.
- **Offline-First (İnternetsiz Çalışma):** Uygulama, internet bağlantısı olmasa dahi yerel veritabanı sayesinde tamamen kesintisiz ve hızlı bir şekilde çalışabilir.

---

## ⚡ Çalışma Mantığı (Nasıl Çalışır?)

Sistemin işleyişi son derece basit ve 3 adımdan oluşur:

```text
 💬 [Kullanıcı Yazar]      🤖 [Yapay Zeka Anlar]       💾 [Sistem Kaydeder]
"Bim'tan 850 TL             • Tür: Gider                Veri anında cihazın
 alışveriş yaptım"   ───►   • Tutar: 850 TL      ───►   içindeki yerel güvenli
                            • Kategori: Market          veritabanına yazılır
                            • Başlık: Bim               ve bütçeden düşer.
```
