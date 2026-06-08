# 📍 Parapin — Yol Haritası ve İlerleme Durumu

> **Teknoloji:** Vite + React 19 | Tailwind v4 | shadcn/ui (base-luma) | Base UI | Lucide | Zustand | TanStack Query | React Router v7

---

## 🟢 Faz 1 — Proje Temeli & Altyapı

- [x] Vite + React kurulumu
- [x] Tailwind CSS v4 yapılandırması
- [x] shadcn/ui kurulumu ve tüm bileşenlerin eklenmesi (55 bileşen)
- [x] `@/` alias yapılandırması (vite + jsconfig)
- [x] Global CSS değişkenleri tema sistemi
- [x] React Router kurulumu ve sayfa yapısı (`app.jsx` + nested routes)
- [x] Layout bileşeni (`RootLayout` — Sidebar + `SidebarInset` + `<Outlet />`)
- [x] Dark/Light tema sağlayıcı (`ThemeProvider` — Context API)
- [x] Zustand store altyapısı (chat, transaction, settings)
- [x] IndexedDB veritabanı kurulumu (Dexie.js — offline-first)
- [x] `lib/constants.js` — kategori sabitleri, route yolları
- [x] `lib/db.js` — Dexie şeması (messages, transactions, sessions, settings)
- [x] Sayfalar: Home, Chat, Dashboard, Settings, 404
- [x] TanStack Query entegrasyonu (`QueryClientProvider`)
- [x] Dexie.js paket kurulumu (`bun add dexie`)

---

## 🔵 Faz 2 — Kimlik & Kullanıcı Deneyimi

- [x] Açılış / Hoş Geldiniz ekranı (`HomePage` — özellik kartları, başla butonu)
- [x] Kullanıcı adı belirleme (local-first, şifresiz, IndexedDB'de saklanır)
- [x] Onboarding akışı (`OnboardingDialog` — ilk açılışta 2 adımlı karşılama)
- [x] Uygulama içi ayarlar sayfası (profil, bütçe, kategoriler, veri sekmeleri)
- [x] Sidebar'da kullanıcı avatarı + isim gösterimi
- [x] Veri yedekleme / geri yükleme (JSON export/import)

---

## 🟡 Faz 3 — Sohbet Arayüzü (Çekirdek Özellik)

- [x] **ChatPage** — ana sohbet ekranı (yeniden yazıldı)
- [x] `MessageBubble` — kullanıcı/asistan ayrımı, avatar (baş harf), timestamp
- [x] `ChatInput` — InputGroup + Send button, Enter ile gönderme, auto-focus, isProcessing disabled
- [x] Mesaj geçmişi listesi (`ScrollArea` + `requestAnimationFrame` ile otomatik kaydırma)
- [x] Mesajları yerel veritabanına kaydetme (chat-store → Dexie)
- [x] Sohbet oturumları — sidebar'da session listesi, yeni sohbet, silme, switch
- [x] **Empty state** — hiç oturum yokken karşılama (`Empty` bileşeni)
- [x] Karşılama mesajı — yeni oturumda asistanın rehber mesajı
- [x] Yükleniyor durumu — `Spinner` ile işlem göstergesi

---

## 🟠 Faz 4 — Yapay Zeka Entegrasyonu

- [x] AI servis katmanı (`lib/ai.js`) — OpenAI API + regex fallback
- [x] Prompt mühendisliği — sistem prompt'u ile yapılandırılmış JSON çıktısı
- [x] Regex fallback — API anahtarı yoksa kelime eşleştirme ile ayrıştırma (`extractAmount`, `guessType`, `guessCategory`, `extractTitle`)
- [x] AI yanıtlarını işleme ve transaction nesnesine dönüştürme
- [x] Kullanıcı onay akışı (`ConfirmationDialog` — tür, tutar, kategori, başlık düzenleme)
- [x] Hata yakalama — AI yanıt vermezse fallback, JSON bozuksa hata mesajı
- [x] Chat entegrasyonu — mesaj → AI → onay → transaction kaydı → asistan yanıtı
- [x] API key + model seçimi + base URL settings'te (OpenRouter varsayılan)
- [x] OpenRouter desteği (`HTTP-Referer` + `X-Title` header'ları, OpenAI-compatible API)

**AI'nın çıkarması gereken alanlar:**

```json
{
  "type": "gider" | "gelir",
  "amount": 850.50,
  "category": "Market",
  "title": "Bim",
  "date": "2026-05-16",
  "description": "Haftalık alışveriş"
}
```

---

## 🟣 Faz 5 — Bütçe & İşlem Yönetimi

- [x] **Transaction store** (Zustand + IndexedDB)
- [x] İşlem ekleme / düzenleme / silme
- [x] Kategori yönetimi (ön tanımlı + özel kategoriler)
- [x] `Combobox` ile kategori seçme (confirmation dialog)
- [x] Aylık bütçe limiti belirleme
- [x] Bütçe limitine yaklaşınca uyarı (`Alert` bileşeni — %80 eşik)
- [x] **DashboardPage** — gerçek veri bağlantısı, özet kartları, işlem tablosu
- [x] **SettingsPage** — kategoriler ekleme/kaldırma, limitler (`Tabs` + `Card` + `FieldGroup`/`Field`)

---

## 🟤 Faz 6 — Dashboard & Analitik

- [x] **DashboardPage** — genel bakış
- [x] Aylık harcama özeti (`Card` + `Badge`)
- [x] Kategori bazında harcama dağılımı (`PieChart` — Recharts)
- [x] Gelir/Gider karşılaştırması (`BarChart` — Recharts)
- [x] Son işlemler tablosu (`Table`)
- [x] Tarih aralığı filtreleme (aylık navigasyon — önceki/sonraki ay)
- [x] Boş dashboard görünümü (`Empty` bileşeni)

---

## 🔴 Faz 7 — Çevrimdışı & PWA

- [x] Service Worker kaydı (`sw.js` — cache-first assets, network-first navigation)
- [x] `manifest.json` — PWA kurulum desteği (SVG ikonlar, tema rengi, standalone)
- [x] Çevrimdışı çalışma garantisi (tüm veri IndexedDB'de yerel + SW cache)
- [x] Çevrimdışı bildirimi (`Alert` banner + `Badge` header'da)
- [x] `sonner` toast ile bağlantı durumu bildirimleri (online/offline)

---

## 🧱 Mimari Kararlar

### Dizin Yapısı

```
src/
├── app.jsx                    # Ana uygulama girişi
├── main.jsx                   # Vite entry point
├── routes.jsx                 # React Router yapılandırması
├── layouts/
│   └── root-layout.jsx        # Ana layout (sidebar + içerik)
├── pages/
│   ├── home.jsx               # Hoş geldin / onboarding
│   ├── chat.jsx               # Ana sohbet sayfası
│   ├── dashboard.jsx          # Dashboard / analitik
│   ├── reports.jsx            # Raporlar (Bütçe Analizi, Tahmin)
│   └── settings.jsx           # Ayarlar
├── components/
│   ├── ui/                    # shadcn/ui bileşenleri (55 adet)
│   ├── chat/
│   │   ├── message-bubble.jsx
│   │   ├── chat-input.jsx
│   │   ├── message-list.jsx
│   │   └── confirmation-dialog.jsx
│   ├── budget/
│   │   ├── transaction-list.jsx
│   │   ├── category-manager.jsx
│   │   └── budget-progress.jsx
│   └── shared/
│       ├── empty-state.jsx
│       └── loading-state.jsx
├── stores/
│   ├── chat-store.js          # Zustand — sohbet durumu
│   ├── transaction-store.js   # Zustand — işlem durumu
│   └── settings-store.js      # Zustand — ayarlar
├── lib/
│   ├── utils.js               # cn() utility
│   ├── db.js                  # IndexedDB bağlantısı (Dexie)
│   ├── ai.js                  # AI servis katmanı
│   └── constants.js           # Sabitler (kategoriler, vs.)
├── hooks/
│   ├── use-chat.js
│   ├── use-transactions.js
│   └── use-media-query.js
└── styles/
    └── globals.css            # Global CSS + tema değişkenleri
```

---

## 📐 shadcn/ui Kullanım Standartları

Bu projede **shadcn/ui base-luma** stili kullanılmaktadır. Tüm geliştirme boyunca aşağıdaki kurallar geçerlidir:

### Stil Kuralları

- `className` yalnızca layout için kullanılır (`max-w-md`, `mx-auto`); renk/ tipografi override edilmez.
- `space-y-*` / `space-x-*` kullanılmaz; `flex flex-col gap-*` / `flex gap-*` kullanılır.
- Eşit genişlik/yükseklik için `size-*` kullanılır (`size-10`, `w-10 h-10` değil).
- `truncate` shorthad'ı kullanılır.
- `dark:` override'ları kullanılmaz; semantik token'lar kullanılır (`bg-background`).
- Koşullu class'lar için `cn()` kullanılır.
- Overlay bileşenlerine manuel `z-index` eklenmez.

### Form Kuralları

- Formlar `FieldGroup` + `Field` ile yapılır (raw `div` + `space-y-*` değil).
- `InputGroup` içinde `InputGroupInput`/`InputGroupTextarea` kullanılır (raw `Input` değil).
- Input içi butonlar `InputGroup` + `InputGroupAddon` ile yapılır.
- 2-7 seçenekli setler `ToggleGroup` ile yapılır (elle `Button` döngüsü değil).
- İlgili checkbox/radio grupları `FieldSet` + `FieldLegend` ile yapılır.
- Validasyon: `data-invalid` + `aria-invalid` birlikte kullanılır.

### Bileşen Kuralları

- Item'lar her zaman Group içinde: `SelectItem` → `SelectGroup`, `DropdownMenuItem` → `DropdownMenuGroup`.
- Base UI için `asChild` yerine `render` prop'u kullanılır (proje `base` olduğu için).
- Non-button elemente `render` yapılıyorsa `nativeButton={false}` eklenir.
- `Select` Base'de `items` prop'u gerektirir, `placeholder` için `{ value: null }` item'i kullanılır.
- `ToggleGroup` Base'de `type` prop'u yoktur, `multiple` boolean kullanılır. `defaultValue` dizidir.
- `Slider` Base'de tekil değer alır (dizi değil).
- `Accordion` Base'de `type` prop'u yoktur, `multiple` boolean kullanılır. `defaultValue` dizidir.
- Dialog/Sheet/Drawer her zaman `Title` içerir (görünmezse `sr-only`).
- `Card` tam kompozisyon kullanır: `CardHeader`/`CardTitle`/`CardDescription`/`CardContent`/`CardFooter`.
- Button'da `isPending`/`isLoading` yoktur; `Spinner` + `disabled` + `data-icon` kullanılır.
- `TabsTrigger` her zaman `TabsList` içindedir.
- `Avatar` her zaman `AvatarFallback` içerir.
- Callout'lar `Alert` ile yapılır. Empty state'ler `Empty` ile yapılır.
- Toast bildirimleri `sonner` ile yapılır.
- `<hr>` yerine `Separator`, `animate-pulse` yerine `Skeleton`, custom span yerine `Badge` kullanılır.
- İkonlar `data-icon="inline-start"` / `data-icon="inline-end"` ile kullanılır, boyut class'ı eklenmez.

---

---

## 🟢 Faz 8 — Tekrarlayan İşlemler & Abonelik Takibi

- [x] Transaction modeline `recurring`, `recurringInterval`, `recurringDay` alanları eklenmesi
- [x] AI prompt'unda tekrarlayan işlem tespiti (`"her ay 15'inde kira ödüyorum"`)
- [x] Regex fallback'te `guessRecurring()` fonksiyonu
- [x] ConfirmationDialog'da tekrarlayan toggle + interval/gün seçici
- [x] Ay başında/geçişinde bekleyen tekrarlayan işlemlerin otomatik oluşturulması
- [x] Dashboard'da "Aktif Abonelikler" kartı — aylık toplam abonelik gideri
- [x] Tekrarlayan işlemleri duraklatma/devam ettirme UI'ı
- [x] Tekrarlayan işlem + tüm instance'ları toplu silme

---

## 🟢 Faz 9 — AI ile Harcama Tahmini & Raporlar Sayfası

- [x] `lib/ai.js`'de `forecastNextMonth()` fonksiyonu (geçmiş 3-6 ay verisi + AI)
- [x] `src/pages/reports.jsx` — ayrı Raporlar sayfası oluşturuldu
- [x] Dashboard'daki "Bütçe Analizi" ve "Gelecek Ay Tahmini" Raporlar sayfasına taşındı
- [x] Dashboard'da özet kartlar + "Raporu Gör" linki
- [x] Sidebar'a "Raporlar" navigasyonu eklendi
- [x] Tahmin vs Bütçe karşılaştırması ve uyarı sistemi
- [x] Kategori bazında tahmin dağılımı (trend okları ile)
- [x] Mevcut `analyzeBudget()` altyapısına benzer mimari

---

## 🟢 Faz 10 — PDF/CSV Rapor Dışa Aktarma

- [x] CSV çıktı: işlem listesini CSV olarak indirme
- [x] PDF rapor: aylık özet, kategori dağılımı, işlem listesi, bütçe karşılaştırması
- [x] Ayarlar > Veri sekmesine yeni rapor seçenekleri

---

## 🟢 Faz 11 — Hedef Bazlı Tasarruf (Birikim Hedefleri)

- [x] Yeni store: `goals-store.js` + Dexie `goals` tablosu
- [x] Hedef modeli: `{ id, title, targetAmount, currentAmount, deadline, category }`
- [x] Dashboard'da hedef takip kartları (progress bar)
- [x] Ayarlar > Hedefler sekmesinde oluşturma, ilerleme ekleme, silme
- [x] Sohbet entegrasyonu: "Tatil için 5000 TL biriktirmek istiyorum" → regex algılama

---

## 🔵 Faz 12 — Etiket (Tag) Sistemi

- [ ] Transaction modeline `tags: string[]` alanı
- [ ] İşlem ekleme/düzenlemede tag girişi
- [ ] Dashboard'da tag bazında filtreleme
- [ ] Tag bazında raporlama

---

## 🟢 Faz 13 — Coklu Hesap / Cuzdan Yonetimi

- [x] Hesap modeli: `{ id, name, type (nakit/kredi/banka), balance }`
- [x] Transaction'lara `accountId` alani eklenmesi
- [x] Dashboard'da hesap bakiyeleri karti
- [x] Hesaplar arasi transfer islemi
- [x] Ayarlar > Hesaplar sekmesi (ekleme/duzenleme/silme)
- [x] AI ile hesap algilama: "Kredi kartindan 500 TL harcadim"
- [x] Transaction ekleme/guncelleme/silmede bakiye otomatik guncelleme
---

## 🔵 Faz 14 — Borç / Alacak Takibi

## 🟢 Faz 14 — Borc / Alacak Takibi

- [x] Borc modeli: `{ id, person, type (borc/alacak), amount, remaining, dueDate, description }`
- [x] Dashboard'da borc ozet karti (toplam borc/alacak bakiyesi)
- [x] Ayarlar > Borclar sekmesi (ekleme, odeme kaydetme, silme)
- [x] Vadesi yaklasan borclar icin uyari
- [x] AI ile borc algilama: "Ahmet'e 200 TL borc verdim"

## 🟢 Faz 15 — Kategori Bazli Butce Limitleri

- [x] Her kategoriye ayri butce limiti belirleme UI'i
- [x] Kategori limit asimi uyarilari (dashboard Alert)
- [x] Kategori butce gerceklestirme progress barlari
- [x] Ayarlar > Butce sekmesinde kategori limit yonetimi

---

## 🟢 Faz 16 — Yatirim Takibi (Portfoy)

- [x] Varlik modeli: `{ id, name, type (emtia/hisse/doviz/kripto), quantity, purchasePrice, currentPrice }`
- [x] Dashboard'da portfoy ozet karti (toplam maliyet, guncel deger, kar/zarar)
- [x] Ayarlar > Yatirimlar sekmesi (ekleme, fiyat guncelleme, silme)
- [x] AI ile yatirim algilama: "Gram altin aldim 2500 TL"
- [x] Varlik bazinda kar/zarar yuzdesi gosterimi

---

## 🔵 Faz 17 — Veri İçe Aktarma (Banka CSV/Excel)

- [ ] CSV dosya yükleme ve parse etme
- [ ] Banka sütun eşleme arayüzü (kullanıcı hangi sütunun hangi alana geldiğini seçer)
- [ ] Excel (.xlsx) dosya desteği
- [ ] Tekrarlanan işlemleri algılama ve atlama (dedup)
- [ ] İçe aktarma önizleme ve onay akışı

---

## 🔵 Faz 18 — Yıllık Karşılaştırma & Net Worth Takibi

- [ ] Yıllık gelir/gider karşılaştırma grafiği (ay bazında çizgi grafik)
- [ ] Net worth hesaplama (toplam gelir - toplam gider + hesap bakiyeleri)
- [ ] Aylık net worth değişim grafiği
- [ ] Yıl sonu özet raporu
- [ ] Geçmiş yıl verilerine göz atma

---

## 🔵 Faz 19 — Dashboard Widget Özelleştirme

- [ ] Widget kütüphanesi (özet kart, grafik, abonelikler, hedefler, tahmin, son işlemler)
- [ ] Widget ekleme/kaldırma UI'ı
- [ ] Widget sıralama (sürükle-bırak)
- [ ] Widget boyutlandırma (1x1, 2x1, 1x2, 2x2)
- [ ] Kullanıcı tercihlerinin kaydedilmesi

---

## 🔵 Faz 20 — Anlık Bildirimler & Fatura Hatırlatıcı

- [ ] Push bildirim desteği (Service Worker push)
- [ ] Bütçe limiti aşımı bildirimi
- [ ] Tekrarlayan işlem hatırlatıcı (vadesi yaklaşan abonelik)
- [ ] Borç vade hatırlatıcı
- [ ] Haftalık/aylık harcama özeti bildirimi
- [ ] Bildirim tercihleri yönetimi

---

## 🔵 Faz 21 — Çoklu Dil Desteği

- [ ] Dil altyapısı (i18n / react-intl / kendi çözümü)
- [ ] Türkçe ve İngilizce dil dosyaları
- [ ] Dil seçici (Ayarlar > Genel)
- [ ] Tarih, para birimi ve sayı formatlarının dile göre ayarlanması
- [ ] AI prompt'larının dile göre değişmesi

---

## 📌 Mevcut Durum

```
Faz 1:   ██████████  %100
Faz 2:   ██████████  %100
Faz 3:   ██████████  %100
Faz 4:   ██████████  %100
Faz 5:   ██████████  %100
Faz 6:   ██████████  %100
Faz 7:   ██████████  %100
Faz 8:   ██████████  %100  (Tekrarlayan İşlemler)
Faz 9:   ██████████  %100  (Raporlar Sayfasi)
Faz 10:  ██████████  %100  (PDF/CSV Rapor)
Faz 11:  ██████████  %100  (Birikim Hedefleri)
Faz 12:  ░░░░░░░░░░  %0    (Etiket Sistemi)
Faz 13:  ██████████  %100  (Coklu Hesap)
Faz 14:  ██████████  %100  (Borc Takibi)
Faz 15:  ██████████  %100  (Kategori Limit)
Faz 16:  ██████████  %100  (Yatirim Takibi)
Faz 17:  ░░░░░░░░░░  %0    (Veri Ice Aktarma)
Faz 18:  ░░░░░░░░░░  %0    (Yillik Kars. & Net Worth)
Faz 19:  ░░░░░░░░░░  %0    (Widget Ozellestirme)
Faz 20:  ░░░░░░░░░░  %0    (Bildirimler)
Faz 21:  ░░░░░░░░░░  %0    (Coklu Dil)
```
