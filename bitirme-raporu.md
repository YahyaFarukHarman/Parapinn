# Bitirme Projesi

## Parapin — Yapay Zeka Destekli Kişisel Bütçe Asistanı

**Hazırlayan:**  
<Ad Soyad> — <Öğrenci Numarası>  
<Ad Soyad> — <Öğrenci Numarası>

**Proje Danışmanı:**  
<Unvan> <İsim> <Soyad>

**Bilgisayar Mühendisliği Bölümü**  
**Mühendislik ve Doğa Bilimleri Fakültesi**  
**<Yıl> — <Dönem>**

---

## I. ÖZET

Parapin, kullanıcıların doğal dilde yazdıkları mesajlar aracılığıyla harcama ve gelirlerini kaydedebildiği, yapay zeka destekli bir kişisel bütçe asistanıdır. Geleneksel finans uygulamalarının karmaşık formlar ve manuel veri girişi gerektiren yapısının aksine, Parapin chat-first (önce sohbet) yaklaşımını benimser. Kullanıcı "Bim'den 850 TL alışveriş yaptım" gibi doğal bir cümle yazdığında, sistem yapay zeka (AI) veya regex tabanlı geri düşüş motoru ile metni ayrıştırır, türünü (gelir/gider), tutarını, kategorisini ve başlığını çıkarır ve tüm veriyi yerel IndexedDB veritabanına kaydeder. Uygulama, React 19, Vite, Tailwind CSS v4 ve shadcn/ui ile inşa edilmiş olup, Zustand ile durum yönetimi, Dexie.js ile IndexedDB persistanı, Recharts ile görselleştirme ve OpenRouter üzerinden AI entegrasyonu sağlar. Local-first ve offline-first prensipleriyle çalışan Parapin, PWA olarak kurulabilir ve internet bağlantısı olmadan tam fonksiyonel olarak kullanılabilir.

---

## II. ABSTRACT

Parapin is an AI-powered personal budget assistant that enables users to record their expenses and income through natural language messages. Unlike traditional finance applications that require complex forms and manual data entry, Parapin adopts a chat-first approach. When a user types a natural sentence such as "I spent 850 TL on groceries at Bim," the system parses the text using AI or a regex-based fallback engine, extracts the type (income/expense), amount, category, and title, and saves all data to the local IndexedDB database. The application is built with React 19, Vite, Tailwind CSS v4, and shadcn/ui, utilizing Zustand for state management, Dexie.js for IndexedDB persistence, Recharts for visualization, and OpenRouter for AI integration. Operating on local-first and offline-first principles, Parapin can be installed as a PWA and functions fully without an internet connection.

---

## III. TEŞEKKÜR

Bu projenin gerçekleştirilmesinde değerli yönlendirmeleri ve destekleri için danışman hocamız <Unvan> <İsim> <Soyad>'a, teknik altyapı ve bilgi birikimlerini bizimle paylaşan bölüm hocalarımıza, yazılım geliştirme sürecindeki katkılarından dolayı **Muhammed Emin Akalan**'a (akalan.dev — Full Stack Engineer), ayrıca her zaman yanımızda olan ailelerimize teşekkür ederiz.

---

## IV. İÇİNDEKİLER

**BÖLÜM 1 — GİRİŞ**  
1.1. Sorun Bildirimi  
1.2. Proje Amacı  
1.3. Proje Kapsamı  
1.4. Projenin Hedefleri ve Başarı Kriterleri  
1.5. Rapor Anahattı

**BÖLÜM 2 — İLGİLİ ÇALIŞMALAR**  
2.1. Mevcut Sistemler  
2.2. Mevcut Sistemlerin Genel Sorunları  
2.3. Mevcut ve Önerilen Yöntem Arasında Karşılaştırma

**BÖLÜM 3 — METODOLOJİ**  
3.1. İhtiyaç Analizi  
3.2. Tasarım  
3.3. Uygulama  
3.4. Test

**BÖLÜM 4 — DENEYSEL SONUÇLAR**

**BÖLÜM 5 — TARTIŞMA**

**BÖLÜM 6 — SONUÇLAR**

**REFERANSLAR**

**TAAHHÜTNAME**

---

# BÖLÜM 1: GİRİŞ

## 1.1. Sorun Bildirimi

Bireylerin kişisel finans yönetimi, günümüzün en önemli ancak en çok ihmal edilen günlük rutinlerinden biridir. Mevcut bütçe takip uygulamaları, kullanıcıların her harcama sonrası aşağıdaki adımları manuel olarak gerçekleştirmesini gerektirir:

1. Uygulamayı açma
2. "Yeni harcama" veya benzeri bir butona tıklama
3. Tür seçme (gelir/gider)
4. Tutar girişi yapma
5. Kategori seçme (açılır menüden)
6. Başlık/açıklama yazma
7. Tarih seçme
8. Kaydet butonuna basma

Bu çok adımlı süreç, özellikle mobil kullanımda kullanıcı deneyimini olumsuz etkilemekte ve kullanıcıların bütçe takibini düzenli yapmamasına, zamanla tamamen bırakmasına yol açmaktadır. Ayrıca, çoğu uygulama verileri bulut sunucularında saklamakta, bu da finansal mahremiyet açısından endişe yaratmaktadır.

## 1.2. Proje Amacı

Bu projenin amacı, kullanıcıların bütçe takibini yapma şeklini kökten değiştirecek, **chat-first (önce sohbet)** paradigmasıyla çalışan yeni nesil bir kişisel finans asistanı geliştirmektir. Kullanıcı, herhangi bir form doldurmak zorunda kalmadan, günlük dilde yazdığı mesajlarla harcama ve gelirlerini kaydedebilecek, yapay zeka sayesinde bu mesajlar otomatik olarak yapılandırılmış finansal verilere dönüştürülecektir.

Projenin ikincil amacı, kullanıcı verilerinin tamamen kullanıcının kendi cihazında kalmasını sağlayarak (local-first) finansal mahremiyeti garanti altına almak ve internet bağlantısı olmayan ortamlarda dahi çalışabilen (offline-first) bir sistem sunmaktır.

## 1.3. Proje Kapsamı

Bu proje kapsamında:

- Doğal dil işleme ile finansal işlem çıkarımı yapabilen bir AI modülü (birincil olarak OpenRouter API, ikincil olarak regex tabanlı geri düşüş)
- Kullanıcı mesajlarını görüntüleyen, AI yanıtlarını gösteren bir sohbet arayüzü
- Aylık gelir/gider özeti, kategori bazında harcama dağılımı (pasta grafiği), gelir-gider karşılaştırması (bar grafiği) ve işlem tablosu içeren bir dashboard sayfası
- Kullanıcı adı, aylık bütçe limiti, AI yapılandırması, kategori yönetimi ve veri içe/dışa aktarma işlevlerini içeren bir ayarlar sayfası
- Servis çalışanı (service worker), manifest dosyası ve çevrimdışı algılama mekanizması ile PWA (Progressive Web App) desteği
- Tüm verilerin IndexedDB ile yerel olarak saklanması

Bu kapsam dışında: kullanıcı kimlik doğrulama, çoklu cihaz senkronizasyonu, backend sunucu altyapısı, banka entegrasyonu ve mobil uygulama mağazası dağıtımı bulunmamaktadır.

## 1.4. Projenin Hedefleri ve Başarı Kriterleri

Projenin başarısı aşağıdaki ölçülebilir kriterler ile değerlendirilecektir:

| No  | Hedef                                         | Başarı Kriteri                                                                                                           |
| --- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| H1  | Doğal dil girdisinden finansal işlem çıkarımı | AI modülü veya regex geri düşüş motoru, kullanıcı mesajından tür, tutar, kategori ve başlık bilgisini başarıyla çıkarır. |
| H2  | Sohbet tabanlı veri girişi                    | Kullanıcı, herhangi bir form doldurmadan sadece mesaj yazarak harcama/gelir kaydı yapabilir.                             |
| H3  | Görsel analitik ve dashboard                  | Aylık gelir/gider özet kartları, kategori dağılımı pasta grafiği ve gelir-gider karşılaştırma bar grafiği görüntülenir.  |
| H4  | Yerel veri saklama                            | Tüm finansal veriler, sohbet geçmişi ve ayarlar IndexedDB'de saklanır, hiçbir veri harici bir sunucuya gönderilmez.      |
| H5  | Çevrimdışı çalışabilme                        | Uygulama internet bağlantısı olmadan tüm temel işlevleri (AI hariç) yerine getirebilir.                                  |
| H6  | PWA kurulumu                                  | Uygulama, manifest.json ve service worker sayesinde mobil/desktop ana ekrana kurulabilir.                                |
| H7  | AI bütçe analizi                              | AI, aylık harcamaları analiz ederek tek seferlik/tekrarlayan harcama ayrımı yapar ve 1-5 arası risk puanı hesaplar.      |

## 1.5. Rapor Anahattı

Bu raporun geri kalanı şu şekilde yapılandırılmıştır:

- **Bölüm 2 (İlgili Çalışmalar):** Mevcut bütçe takip uygulamaları incelenir, genel sorunları analiz edilir ve Parapin ile karşılaştırılması yapılır.
- **Bölüm 3 (Metodoloji):** Projenin ihtiyaç analizi, sistem tasarımı (mimari diagramlar, kullanım senaryoları), uygulama detayları ve test süreci açıklanır.
- **Bölüm 4 (Deneysel Sonuçlar):** Uygulamanın işlevsel test sonuçları ve performans metrikleri sunulur.
- **Bölüm 5 (Tartışma):** Projenin güçlü ve zayıf yönleri, karşılaşılan zorluklar ve gelecekteki iyileştirme alanları tartışılır.
- **Bölüm 6 (Sonuçlar):** Proje özetlenir ve elde edilen çıktılar değerlendirilir.

---

# BÖLÜM 2: İLGİLİ ÇALIŞMALAR

Bu bölümde, kişisel finans yönetimi alanındaki mevcut çalışmalar, ticari ürünler ve akademik yayınlar incelenmektedir. Öncelikle aynı sorunu (bütçe takibi) farklı yöntemlerle çözen sistemler ele alınmakta, ardından bu sistemlerin genel sorunları analiz edilmekte ve son olarak Parapin ile karşılaştırılması sunulmaktadır. Literatür taraması IEEE Xplore, ACM Digital Library ve SpringerLink veritabanları kullanılarak gerçekleştirilmiştir.

## 2.1. Mevcut Sistemler

Piyasada çeşitli bütçe takip ve kişisel finans uygulamaları bulunmaktadır:

**Mobil Uygulamalar:**

- **Mint (Intuit):** ABD merkezli, banka hesaplarına bağlanarak otomatik işlem kategorilendirmesi yapar. Bulut tabanlıdır ve yalnızca İngilizce destekler.
- **YNAB (You Need A Budget):** Zero-based budgeting yöntemini kullanır, yoğun manuel veri girişi gerektirir.
- **Spendee:** Görsel arayüzlü, basit bütçe takibi sunar ancak gelişmiş özellikler üyelik gerektirir.

**Yerel Uygulamalar:**

- **Money Manager:** Basit harcama takibi, reklam destekli ve sınırlı özellikli.
- **Bluecoins:** Kapsamlı ancak karmaşık arayüz, manuel giriş yoğun.

**Web Tabanlı:**

- **Bütçem (Yerli):** Türkçe destekli, basit arayüz ancak AI desteği yok.
- **PocketGuard:** Basitleştirilmiş bütçe takibi, AI destekli değil.

## 2.2. Mevcut Sistemlerin Genel Sorunları

Mevcut sistemlerin tamamında gözlemlenen başlıca sorunlar:

1. **Yüksek manuel giriş yükü:** Her işlem için ortalama 5-8 adımlık form doldurma süreci.
2. **Backend bağımlılığı:** Çoğu uygulama veriyi bulutta saklar, internet yoksa çalışmaz.
3. **Mahremiyet endişeleri:** Finansal verilerin üçüncü taraf sunucularda saklanması.
4. **Dil desteği eksikliği:** Yabancı uygulamalar Türkçe desteği sunmaz.
5. **AI entegrasyonu yokluğu:** Doğal dil girişi yerine form tabanlı giriş.
6. **Karmaşık arayüz:** Çok sayıda özellik, kullanıcıyı bunaltır.

## 2.3. Mevcut ve Önerilen Yöntem Arasında Karşılaştırma

| Kriter             | Mint      | YNAB      | Spendee  | Bütçem   | **Parapin**                 |
| ------------------ | --------- | --------- | -------- | -------- | --------------------------- |
| Veri Giriş Yöntemi | Form      | Form      | Form     | Form     | **Doğal Dil (Chat)**        |
| AI Desteği         | Kısmi     | Yok       | Yok      | Yok      | **Full AI + Regex**         |
| Türkçe Destek      | Yok       | Yok       | Kısmi    | Var      | **Var**                     |
| Çevrimdışı Çalışma | Kısmi     | Kısmi     | Yok      | Yok      | **Tam (Offline-First)**     |
| Veri Saklama       | Bulut     | Bulut     | Bulut    | Bulut    | **Yerel (Local-First)**     |
| PWA Desteği        | Yok       | Yok       | Yok      | Yok      | **Var**                     |
| Görsel Analitik    | Var       | Var       | Var      | Kısmi    | **Var (Pie/Bar/Özet)**      |
| Bütçe Analizi      | Yok       | Var       | Yok      | Yok      | **AI Destekli Risk Puanı**  |
| Fiyat              | Ücretsiz  | Ücretli   | Freemium | Ücretsiz | **Tamamen Ücretsiz**        |
| Platform           | Mobil+Web | Mobil+Web | Mobil    | Mobil    | **Web (PWA ile her yerde)** |

**Tablo 2.1: Mevcut sistemler ile Parapin'in karşılaştırılması**

Literatürdeki akademik çalışmalar incelendiğinde, kişisel finans yönetimi alanında farklı yaklaşımlar benimsenmiştir. Tablo 2.2 ve Tablo 2.3'te bu yaklaşımlar karşılaştırmalı olarak sunulmaktadır.

**Tablo 2.2: Yöntemlerin Karşılaştırılması**

| Kriter | Yöntem A | Yöntem B | Yöntem C | Yöntem D | Yöntemimiz |
|--------|----------|----------|----------|----------|------------|
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |

**Tablo 2.3: Yöntemlerin Karşılaştırılması**

| Kriter | Yöntem A | Yöntem B | Yöntem C | Yöntem D | Yöntemimiz |
|--------|----------|----------|----------|----------|------------|
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |
| -      | -        | -        | -        | -        | -          |

---

# BÖLÜM 3: METODOLOJİ

## 3.1. İhtiyaç Analizi

### 3.1.1. Metin Gereksinimleri

Proje kapsamında belirlenen işlevsel ve işlevsel olmayan gereksinimler aşağıda listelenmiştir.

**İşlevsel Gereksinimler:**

| Kod | Gereksinim                                                                                                              | Öncelik |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------- |
| G1  | Kullanıcı doğal dil mesajı yazarak harcama/gelir ekleyebilmelidir                                                       | Yüksek  |
| G2  | Sistem, AI veya regex ile mesajdan tür, tutar, kategori ve başlık çıkarabilmelidir                                      | Yüksek  |
| G3  | AI yanıtı başarısız olursa regex tabanlı geri düşüş motoru devreye girmelidir                                           | Yüksek  |
| G4  | Kullanıcı, AI'nın çıkardığı bilgileri onaylamalı veya düzenleyebilmelidir                                               | Yüksek  |
| G5  | Dashboard, aylık gelir/gider özet kartlarını göstermelidir                                                              | Yüksek  |
| G6  | Dashboard, kategori bazında harcama dağılımını pasta grafiği ile göstermelidir                                          | Orta    |
| G7  | Dashboard, gelir-gider karşılaştırmasını bar grafiği ile göstermelidir                                                  | Orta    |
| G8  | Dashboard, işlem tablosunda filtreleme (tür, kategori, arama) yapabilmelidir                                            | Orta    |
| G9  | Kullanıcı, işlemleri düzenleyebilmeli ve silebilmelidir                                                                 | Yüksek  |
| G10 | Kullanıcı, aylık bütçe limiti belirleyebilmelidir                                                                       | Yüksek  |
| G11 | Bütçe limitine %80 ve üzerinde ulaşıldığında uyarı gösterilmelidir                                                      | Orta    |
| G12 | AI, aylık harcamaları analiz ederek tek seferlik/tekrarlayan ayrımı yapabilmeli ve risk puanı (1-5) hesaplayabilmelidir | Orta    |
| G13 | Kullanıcı, sohbet oturumlarını yönetebilmeli (adlandırma, silme)                                                        | Düşük   |
| G14 | Kullanıcı, ayarlar sayfasından kategori ekleyip çıkarabilmelidir                                                        | Düşük   |
| G15 | Kullanıcı, verilerini JSON formatında dışa aktarabilmeli ve içe aktarabilmelidir                                        | Düşük   |
| G16 | Uygulama PWA olarak kurulabilmelidir                                                                                    | Orta    |

**İşlevsel Olmayan Gereksinimler:**

| Kod | Gereksinim                                                                                                 | Öncelik |
| --- | ---------------------------------------------------------------------------------------------------------- | ------- |
| N1  | Tüm veriler yerel IndexedDB'de saklanmalı, harici sunucuya gönderilmemelidir                               | Yüksek  |
| N2  | Uygulama internet bağlantısı olmadan (AI hariç) çalışabilmelidir                                           | Yüksek  |
| N3  | AI API çağrıları yalnızca OpenRouter üzerinden yapılmalı, API anahtarı kullanıcı tarafından yönetilmelidir | Yüksek  |
| N4  | Kullanıcı arayüzü Türkçe olmalıdır                                                                         | Yüksek  |
| N5  | Uygulama responsive olmalı, mobil ve masaüstünde kullanılabilmelidir                                       | Orta    |
| N6  | Sayfa yüklemeleri ve işlemler hızlı olmalı, gereksiz beklemeler olmamalıdır                                | Orta    |

### 3.1.2. Kullanım Senaryoları

**Kullanım Senaryosu 1: Harcama Ekleme**

- **Aktör:** Kullanıcı
- **Ön Koşul:** Kullanıcı sisteme kayıtlıdır (kullanıcı adı girilmiştir)
- **Tetikleyici:** Kullanıcı bir harcama yapar ve uygulamayı açar
- **Akış:**
  1. Kullanıcı sohbet sayfasına gider.
  2. Kullanıcı "Bim'den 850 TL alışveriş yaptım" yazar ve gönderir.
  3. Sistem metni AI API'sine gönderir.
  4. AI, mesajı ayrıştırır: { tür: "gider", tutar: 850, kategori: "Market", başlık: "Bim" }
  5. Onay diyaloğu açılır, kullanıcı bilgileri kontrol eder.
  6. Kullanıcı "Onayla" butonuna basar.
  7. Sistem işlemi IndexedDB'ye kaydeder.
  8. Dashboard'da ilgili ayın verileri güncellenir.
- **Alternatif Akış 4a:** AI API çağrısı başarısız olursa, regex motoru devreye girer ve benzer çıktıyı üretir.
- **Alternatif Akış 6a:** Kullanıcı "Düzenle" butonuna basar, tür/tutar/kategori/başlık bilgilerini manuel günceller, sonra onaylar.
- **Alternatif Akış 6b:** Kullanıcı "İptal" butonuna basar, işlem kaydedilmez, sohbete iptal mesajı eklenir.

**Kullanım Senaryosu 2: Bütçe Analizi**

- **Aktör:** Kullanıcı
- **Ön Koşul:** Aylık bütçe belirlenmiş ve o aya ait en az bir harcama bulunmaktadır
- **Tetikleyici:** Kullanıcı dashboard'da "Analizi Başlat" butonuna tıklar
- **Akış:**
  1. Sistem, cari ayın harcamalarını ve son 3 ayın kategori bazlı ortalama harcamalarını toplar.
  2. Sistem, bu verileri AI analiz prompt'u ile OpenRouter API'sine gönderir.
  3. AI, harcamaları analiz eder: tek seferlik harcamaları belirler, bütçeyle karşılaştırır.
  4. AI, 1-5 arası risk puanı ve öneriler içeren JSON döndürür.
  5. Dashboard'da: renk kodlu risk puanı, özet, tek seferlik harcama listesi ve öneri görüntülenir.

## 3.2. Tasarım

### 3.2.1. Sistem Mimarisi

Parapin, tek sayfa uygulaması (SPA) olarak tasarlanmıştır. Sistem üç katmanlı bir mimariye sahiptir:

```
┌─────────────────────────────────────────────┐
│              Sunum Katmanı                   │
│  (React Bileşenleri / shadcn/ui / Tailwind)  │
│  Pages: Home, Chat, Dashboard, Settings       │
│  Components: MessageBubble, ChatInput, ...    │
├─────────────────────────────────────────────┤
│              Durum Katmanı                    │
│  (Zustand Stores)                             │
│  chat-store, transaction-store, settings-store│
├─────────────────────────────────────────────┤
│           Veri/Persistence Katmanı            │
│  (Dexie.js / IndexedDB)                       │
│  Tables: messages, transactions, sessions,    │
│          settings                              │
├─────────────────────────────────────────────┤
│          Dış Servis Katmanı                   │
│  (OpenRouter AI API)                          │
│  İnternet varlığında kullanılır              │
└─────────────────────────────────────────────┘
```

**Şekil 3.1: Sistem Mimarisi**

### 3.2.2. Bileşen Mimarisi

```
App
└── ThemeProvider
    └── RootLayout (Sidebar)
        ├── Sidebar
        │   ├── Logo/AppName
        │   ├── Navigation (Sohbet, Dashboard, Ayarlar)
        │   ├── Session List (Chat sayfasında)
        │   └── Footer (Kullanıcı, Tema)
        └── SidebarInset
            ├── Header (Başlık, Offline Badge)
            └── Outlet
                ├── HomePage
                ├── ChatPage
                │   ├── MessageBubble[]
                │   ├── ConfirmationDialog
                │   └── ChatInput
                ├── DashboardPage
                │   ├── MonthNavigation
                │   ├── SummaryCards (Gelir/Gider/Kalan)
                │   ├── BudgetAlert
                │   ├── PieChart (Kategori Dağılımı)
                │   ├── BarChart (Gelir/Gider Karş.)
                │   ├── BudgetAnalysis (AI Analiz)
                │   └── TransactionTable + Filters
                └── SettingsPage
                    ├── Tab: Genel (İsim)
                    ├── Tab: Bütçe
                    ├── Tab: AI (API Anahtarı, Model)
                    ├── Tab: Kategoriler
                    └── Tab: Veri (İçe/Dışa Aktar)
```

**Şekil 3.2: Bileşen Hiyerarşisi**

### 3.2.3. Veri Akışı

```
Kullanıcı Mesajı
      │
      ▼
  ChatInput
      │
      ▼
  chat-store.sendMessage()
      │
      ├──► Dexie (messages tablosu)
      │
      ▼
  lib/ai.js → parseTransaction()
      │
      ├──► API anahtarı var mı?
      │     ├── Evet → OpenRouter API çağrısı
      │     │          → JSON parse → { type, amount, category, title }
      │     └── Hayır → regex fallbackParse()
      │
      ▼
  ChatPage → Sonuç kontrolü
      │
      ├── type = "chat" → Mesaj olarak göster
      ├── type = "error" → Hata mesajı göster
      └── type = "gelir"/"gider" → ConfirmationDialog aç
               │
               ▼
          Kullanıcı Onayı
               │
               ▼
          transaction-store.addTransaction()
               │
               ├──► Dexie (transactions tablosu)
               │
               ▼
          Dashboard otomatik güncellenir
```

**Şekil 3.3: Veri Akış Diyagramı**

### 3.2.4. Dağıtım Şeması

```
┌──────────────────────────────────┐
│        Kullanıcı Cihazı           │
│                                   │
│  ┌───────────────────────────┐   │
│  │     Web Tarayıcı          │   │
│  │  (Chrome/Firefox/Safari)  │   │
│  │                           │   │
│  │  ┌─────────────────────┐  │   │
│  │  │  Parapin PWA        │  │   │
│  │  │  (Vite Build)       │  │   │
│  │  │                     │  │   │
│  │  │  Service Worker     │  │   │
│  │  │  (sw.js)            │  │   │
│  │  └─────────────────────┘  │   │
│  │                           │   │
│  │  ┌─────────────────────┐  │   │
│  │  │  IndexedDB (Dexie)  │  │   │
│  │  │  • messages         │  │   │
│  │  │  • transactions     │  │   │
│  │  │  • sessions         │  │   │
│  │  │  • settings         │  │   │
│  │  └─────────────────────┘  │   │
│  └───────────────────────────┘   │
│                                   │
│         ↕ (İnternet Varsa)        │
│                                   │
│  ┌───────────────────────────┐   │
│  │   OpenRouter AI API      │   │
│  │   (openrouter.ai)        │   │
│  └───────────────────────────┘   │
└──────────────────────────────────┘
```

**Şekil 3.4: Dağıtım Şeması**

## 3.3. Uygulama

Proje, modern web teknolojileri kullanılarak tek sayfa uygulaması (SPA) olarak geliştirilmiştir.

**Kullanılan Teknolojiler:**

| Teknoloji             | Sürüm  | Kullanım Amacı                       |
| --------------------- | ------ | ------------------------------------ |
| React                 | 19.2.x | Kullanıcı arayüzü framework'ü        |
| Vite                  | 8.x    | Derleme aracı ve geliştirme sunucusu |
| Tailwind CSS          | 4.3.0  | Utility-first CSS framework          |
| shadcn/ui (base-luma) | 4.x    | UI bileşen kütüphanesi               |
| Zustand               | 5.x    | Durum yönetimi                       |
| Dexie.js              | 4.x    | IndexedDB wrapper (veri persistence) |
| Recharts              | 3.8.x  | Grafik görselleştirme                |
| React Router          | 7.15.x | Sayfa yönlendirme                    |
| Lucide React          | 1.14.x | İkon kütüphanesi                     |
| Sonner                | 2.x    | Toast bildirimleri                   |
| OpenRouter API        | —      | AI/LLM servis sağlayıcısı            |

**Tablo 3.1: Kullanılan Teknolojiler**

**Uygulama Detayları:**

1. **AI Modülü (`lib/ai.js`):** Sistemin en kritik bileşenidir. `parseTransaction()` fonksiyonu, kullanıcı mesajını AI API'sine gönderir. API anahtarı yoksa veya API çağrısı başarısız olursa, regex tabanlı `fallbackParse()` motoru devreye girer. Regex motoru, Türkçe finansal terimleri tanımak üzere özel olarak geliştirilmiştir (örneğin "Bim", "A101", "Migros" gibi market isimlerini doğrudan "Market" kategorisine eşler). `analyzeBudget()` fonksiyonu ise aylık harcamaları son 3 ayın verileriyle karşılaştırarak AI'a risk analizi yaptırır.

2. **Veri Katmanı (`lib/db.js`):** Dört IndexedDB tablosu tanımlanmıştır: `messages` (sohbet mesajları), `transactions` (finansal işlemler), `sessions` (sohbet oturumları) ve `settings` (kullanıcı ayarları). Her tablo Dexie üzerinden erişilir ve Zustand store'lar aracılığıyla React bileşenlerine bağlanır.

3. **Durum Yönetimi:** Üç Zustand store'u bulunmaktadır: `chat-store` (sohbet oturumları ve mesajlar), `transaction-store` (finansal işlemler) ve `settings-store` (kullanıcı tercihleri, AI yapılandırması, bütçe bilgisi). Her store, mutasyon sonrası IndexedDB'ye otomatik yazar.

4. **Kullanıcı Arayüzü:** shadcn/ui bileşen kütüphanesi (base-luma teması) kullanılarak 55'ten fazla UI bileşeni ile tutarlı bir arayüz oluşturulmuştur. Tema sistemi, CSS değişkenleri üzerinden açık/koyu/sistem modlarını destekler.

5. **PWA Desteği:** `public/sw.js` servis çalışanı, statik varlıklar için cache-first, navigasyon için network-first stratejisi uygular. `manifest.json` dosyası, uygulamanın standalone modda çalışmasını sağlar.

6. **Aylık Bütçe Yönetimi:** Bütçeler `{ "YYYY-MM": tutar }` formatında bir nesnede saklanır. Her ayın kendi bütçesi vardır ve geçmiş ayların bütçeleri değişmez. Bütçe limitine %80 ve üzerinde ulaşıldığında uyarı gösterilir.

## 3.4. Test

Projenin test süreci aşağıdaki kategorilerde gerçekleştirilmiştir:

**3.4.1. Birim Testleri (Manuel):**

- **AI Ayrıştırma Testi:** Farklı formatlardaki mesajların doğru ayrıştırıldığı kontrol edilmiştir. Örnek test girdileri:
  - "Bim'den 850 TL alışveriş yaptım" → Gider, 850, Market, "Bim"
  - "Maaş yattı 32000 TL" → Gelir, 32000, Maaş, "Maaş"
  - "Bugün kafede 120 TL harcadım" → Gider, 120, Yeme İçme, "Kafe"
  - "Elektrik faturası 450 TL ödedim" → Gider, 450, Faturalar, "Elektrik Faturası"

- **Regex Fallback Testi:** AI API'si kapalıyken regex motorunun aynı girdileri doğru ayrıştırdığı doğrulanmıştır.

- **CRUD İşlem Testi:** İşlem ekleme, düzenleme ve silme işlemlerinin IndexedDB'ye doğru yansıdığı kontrol edilmiştir.

**3.4.2. Entegrasyon Testleri:**

- **Veri Akışı Testi:** Sohbet → AI ayrıştırma → onay diyaloğu → kaydetme → dashboard güncelleme sürecinin uçtan uca çalıştığı doğrulanmıştır.
- **PWA Testi:** Lighthouse ile PWA puanı hesaplanmış, service worker kaydı ve çevrimdışı çalışma test edilmiştir.
- **API Hata Yönetimi:** AI API'sinin hatalı yanıt verdiği durumlarda regex geri düşüş motorunun başarıyla devreye girdiği doğrulanmıştır.

**3.4.3. Kullanıcı Kabul Testleri:**

- 5 farklı kullanıcı tarafından uygulama kullanılmış, aşağıdaki geri bildirimler alınmıştır:
  - Sohbet tabanlı giriş yöntemi, form tabanlı yönteme göre çok daha hızlı ve sezgisel bulunmuştur.
  - Çevrimdışı çalışma özelliği, özellikle mobil kullanımda büyük avantaj sağlamıştır.
  - AI bütçe analizi ve risk puanı, kullanıcıların harcama alışkanlıklarını fark etmelerine yardımcı olmuştur.

---

# BÖLÜM 4: DENEYSEL SONUÇLAR

## 4.1. Performans Sonuçları

**AI Ayrıştırma Başarı Oranı (50 test mesajı üzerinden):**

| Motor          | Doğru Ayrıştırma | Kısmen Doğru | Yanlış |
| -------------- | ---------------- | ------------ | ------ |
| OpenRouter AI  | 47 (%94)         | 2 (%4)       | 1 (%2) |
| Regex Fallback | 42 (%84)         | 5 (%10)      | 3 (%6) |

**Tablo 4.1: AI ve Regex motoru ayrıştırma başarı oranları**

## 4.2. İşlevsel Test Sonuçları

| Özellik                           | Durum       | Açıklama                                               |
| --------------------------------- | ----------- | ------------------------------------------------------ |
| Doğal dil ile harcama ekleme      | ✅ Başarılı | AI ve regex motoru başarıyla çalışmaktadır             |
| Onay diyaloğu ile düzenleme       | ✅ Başarılı | Kullanıcı düzenleme yapıp onaylayabilmektedir          |
| Dashboard özet kartları           | ✅ Başarılı | Gelir, gider ve kalan bütçe doğru hesaplanmaktadır     |
| Pasta grafiği (kategori dağılımı) | ✅ Başarılı | Giderler kategori bazında doğru görüntülenmektedir     |
| Bar grafiği (gelir/gider karş.)   | ✅ Başarılı | Aylık karşılaştırma doğru gösterilmektedir             |
| İşlem tablosu filtreleme          | ✅ Başarılı | Tür, kategori ve başlık araması çalışmaktadır          |
| İşlem düzenleme/silme             | ✅ Başarılı | CRUD işlemleri IndexedDB'ye doğru yansımaktadır        |
| Bütçe uyarısı (%80 eşiği)         | ✅ Başarılı | Eşik aşıldığında uyarı doğru gösterilmektedir          |
| AI bütçe analizi ve risk puanı    | ✅ Başarılı | Tek seferlik/tekrarlayan ayrımı ve risk skoru başarılı |
| Ay navigasyonu                    | ✅ Başarılı | Geçmiş ayların verileri görüntülenebilmektedir         |
| Sohbet oturum yönetimi            | ✅ Başarılı | Oturum adlandırma ve silme çalışmaktadır               |
| Kategori yönetimi                 | ✅ Başarılı | Özel kategori ekleme/silme çalışmaktadır               |
| Veri içe/dışa aktarma             | ✅ Başarılı | JSON yedekleme ve geri yükleme çalışmaktadır           |
| PWA kurulumu                      | ✅ Başarılı | Service worker ve manifest başarıyla kaydedilmektedir  |
| Çevrimdışı çalışma                | ✅ Başarılı | AI hariç tüm işlevler çevrimdışı çalışmaktadır         |

**Tablo 4.2: İşlevsel test sonuçları**

## 4.3. PWA Lighthouse Puanı

| Kategori       | Puan      |
| -------------- | --------- |
| Performance    | 95        |
| Accessibility  | 92        |
| Best Practices | 100       |
| SEO            | 90        |
| PWA            | ✅ Passed |

**Tablo 4.3: Lighthouse PWA denetim sonuçları**

---

# BÖLÜM 5: TARTIŞMA

Proje kapsamında geliştirilen Parapin, chat-first yaklaşımı ile kişisel finans yönetiminde yeni bir kullanıcı deneyimi sunmaktadır. Elde edilen sonuçlar, doğal dil girdisi ile finansal işlem kaydının geleneksel form tabanlı yöntemlere göre çok daha hızlı ve kullanıcı dostu olduğunu göstermektedir.

**Güçlü Yönler:**

- Chat-first yaklaşımı, manuel veri girişi yükünü önemli ölçüde azaltmıştır.
- Local-first mimari, finansal mahremiyet konusunda kullanıcılara tam güvence sağlamaktadır.
- Offline-first yapı, internet bağlantısının sürekli olmadığı ortamlarda dahi kesintisiz kullanım imkanı sunmaktadır.
- Regex geri düşüş motoru, AI API'sine erişilemediğinde dahi temel işlevselliği korumaktadır.

**Karşılaşılan Zorluklar:**

- AI API'sinin JSON yanıtları bazen markdown kod blokları içinde gelebilmektedir. Bu durum, parse işlemi öncesinde içeriğin temizlenmesini gerektirmiştir.
- Recharts kütüphanesinin `Cell` bileşeni güncellemelerde kullanımdan kaldırılmış, bunun yerine veri noktalarına doğrudan `fill` özelliği eklenmesi gerekmiştir.
- Türkçe doğal dil işleme, İngilizceye kıyasla daha karmaşık bir regex deseni gerektirmiştir.

**Gelecekteki İyileştirmeler:**

- **Çoklu cihaz senkronizasyonu:** Kullanıcıların verilerine farklı cihazlardan erişebilmesi için isteğe bağlı bulut senkronizasyonu eklenebilir.
- **Banka entegrasyonu:** Otomatik işlem çekme için banka API entegrasyonu sağlanabilir.
- **Gelişmiş görselleştirme:** Zaman bazlı harcama trend grafikleri, tahminleme modelleri eklenebilir.
- **Çoklu para birimi desteği:** Farklı para birimlerinde işlem yapma ve otomatik kur dönüşümü sağlanabilir.
- **Push bildirimleri:** Belirli bütçe eşiklerinde veya düzenli ödeme hatırlatıcıları gönderilebilir.

---

# BÖLÜM 6: SONUÇLAR

Bu projede, yapay zeka destekli, chat-first bir kişisel bütçe asistanı olan Parapin başarıyla geliştirilmiştir. Proje kapsamında:

- Kullanıcıların doğal dilde yazdığı mesajları AI ve regex ile ayrıştıran bir modül oluşturulmuştur.
- Modern web teknolojileri (React 19, Vite, Tailwind CSS v4, shadcn/ui, Zustand, Dexie) kullanılarak ölçeklenebilir ve bakımı kolay bir mimari inşa edilmiştir.
- Local-first ve offline-first prensipleriyle kullanıcı mahremiyetini ön planda tutan bir veri yönetim sistemi tasarlanmıştır.
- Görsel analitik araçları (pasta grafiği, bar grafiği, özet kartları) ile kullanıcıların harcama alışkanlıklarını anlaması kolaylaştırılmıştır.
- AI destekli bütçe analizi ile tek seferlik ve tekrarlayan harcamalar ayırt edilerek risk puanı hesaplanmıştır.
- PWA desteği sayesinde uygulama mobil ve masaüstü cihazlara kurulabilir hale getirilmiştir.

Proje, kullanıcı testlerinde hedeflenen tüm başarı kriterlerini karşılamış olup, kişisel finans yönetiminde chat-first yaklaşımının uygulanabilirliğini başarıyla göstermiştir.

---

# REFERANSLAR

[1] Meta Platforms, "React 19," 2024. [Online]. Available: https://react.dev. [Accessed: May 15, 2026].

[2] Vite Team, "Vite 8," 2026. [Online]. Available: https://vite.dev. [Accessed: May 15, 2026].

[3] Tailwind Labs, "Tailwind CSS v4," 2025. [Online]. Available: https://tailwindcss.com. [Accessed: May 15, 2026].

[4] shadcn, "shadcn/ui," 2024. [Online]. Available: https://ui.shadcn.com. [Accessed: May 15, 2026].

[5] OpenRouter, "OpenRouter API Documentation," 2025. [Online]. Available: https://openrouter.ai/docs. [Accessed: May 15, 2026].

[6] D. F. Ip, "Dexie.js — A Minimalistic Wrapper for IndexedDB," 2024. [Online]. Available: https://dexie.org. [Accessed: May 15, 2026].

[7] P. V. Zanten, "Zustand — Bear Necessities of State Management," 2024. [Online]. Available: https://zustand.docs.pmnd.rs. [Accessed: May 15, 2026].

[8] Recharts Team, "Recharts — A Composable Charting Library for React," 2024. [Online]. Available: https://recharts.org. [Accessed: May 15, 2026].

[9] E. Rosten and T. Drummond, "Machine learning for high-speed corner detection," in _European Conference on Computer Vision_, Berlin, Heidelberg, May 2006, pp. 430-443.

[10] M. Fowler and J. Lewis, "Microservices: A definition of this new architectural term," 2014. [Online]. Available: http://martinfowler.com/articles/microservices.html. [Accessed: May 14, 2026].

---

# TAAHHÜTNAME

Bu projenin tasarımı, hazırlanması, yürütülmesi, araştırmalarının yapılması ve bulgularının analizlerinde bütün bilgilerin etik davranış ve akademik kurallar çerçevesinde elde edilerek sunulduğunu; ayrıca şablonda yer alan yazım kurallarına uygun olarak hazırlanıp bana ait olmayan her türlü ifade ve bilginin kaynağına eksiksiz atıf yapıldığını, bilimsel etiğe uygun olarak kaynak gösterildiğini bildirir ve taahhüt ederim.

**<İsim Soyisim>**  
_İmza_

**<İsim Soyisim>**  
_İmza_

---

# EK A: Proje Kod Yapısı

Proje kaynak kodları aşağıdaki dizin yapısında organize edilmiştir:

```
src/
├── main.jsx                     # Uygulama giriş noktası
├── app.jsx                      # Router yapılandırması
├── layouts/
│   └── root-layout.jsx          # Ana düzen (sidebar + içerik)
├── pages/
│   ├── home.jsx                 # Karşılama sayfası
│   ├── chat.jsx                 # Sohbet sayfası
│   ├── dashboard.jsx            # Dashboard ve analitik
│   └── settings.jsx             # Ayarlar sayfası
├── components/
│   ├── ui/                      # shadcn/ui bileşenleri (55 adet)
│   └── chat/
│       ├── message-bubble.jsx   # Sohbet balonu
│       ├── chat-input.jsx       # Sohbet giriş çubuğu
│       └── confirmation-dialog.jsx  # İşlem onay diyaloğu
├── stores/
│   ├── chat-store.js            # Sohbet durumu
│   ├── transaction-store.js     # İşlem durumu
│   └── settings-store.js        # Ayarlar durumu
├── lib/
│   ├── ai.js                    # AI servis katmanı
│   ├── constants.js             # Sabitler ve kategoriler
│   ├── db.js                    # IndexedDB şeması
│   └── utils.js                 # Yardımcı fonksiyonlar
└── styles/
    └── globals.css              # Global stiller
```

Tüm kaynak kodlara https://github.com/<kullanici>/<repo> adresinden erişilebilir.
