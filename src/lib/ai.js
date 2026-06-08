const SYSTEM_PROMPT = `Sen bir kişisel finans asistanısın. Kullanıcının doğal dildeki mesajından harcama veya gelir bilgisini çıkar.

Aşağıdaki JSON formatında yanıt ver, başka hiçbir metin ekleme:

{
  "type": "gider" | "gelir",
  "amount": sayı (TL cinsinden, sadece rakam),
  "category": "uygun kategori adı",
  "title": "kısa başlık",
  "description": "açıklama (opsiyonel)",
  "recurring": true/false (opsiyonel, sadece tekrarlayan işlemse),
  "recurringInterval": "monthly" | "weekly" | "yearly" (opsiyonel),
  "recurringDay": gün_numarası (opsiyonel, monthly için 1-31, weekly için 0-6),
  "accountType": "nakit" | "kredi" | "banka" (opsiyonel, hangi hesaptan yapıldığını belirt)
}

Kategoriler:
- Gider: Market, Yeme İçme, Ulaşım, Faturalar, Sağlık, Eğlence, Alışveriş, Eğitim, Kira, Diğer
- Gelir: Maaş, Freelance, Yatırım, Hediye, Diğer

Hesap algılama: Kullanıcı "kredi kartımdan", "kredi kartıma", "bankadan", "hesabıma", "nakit", "cüzdan" gibi ifadeler kullanıyorsa accountType alanını doldur.
Örnek: "Kredi kartımdan 500 TL harcadım" -> accountType: "kredi"
Örnek: "Bankadan 3000 TL maaş aldım" -> accountType: "banka"
Örnek: "Nakit 150 TL verdim" -> accountType: "nakit"

Tekrarlayan işlem algılama: Kullanıcı "her ay", "ayda bir", "aylık", "her hafta", "haftada bir", "haftalık", "her yıl", "yılda bir" gibi ifadeler kullanıyorsa recurring: true olarak işaretle.
Örnek: "Her ay 15'inde 3000 TL kira ödüyorum" -> recurring:true, recurringInterval:"monthly", recurringDay:15
Örnek: "Her pazartesi 200 TL kurs ücreti" -> recurring:true, recurringInterval:"weekly", recurringDay:1
Eğer mesaj bir finansal işlem değilse, sadece sohbet ise:
{"type": "chat", "content": "Yanıtın"}

Eğer mesajı anlamadıysan:
{"type": "error", "content": "Açıklama"}`

function extractAmount(text) {
  const match = text.match(/(\d+[.,]?\d*)\s*(tl|lira|₺)/i)
  if (match) return parseFloat(match[1].replace(',', '.'))
  const numMatch = text.match(/(\d+[.,]?\d*)/)
  return numMatch ? parseFloat(numMatch[1].replace(',', '.')) : null
}

function guessType(text) {
  const incomeWords = /yattı|geldi|maaş|ödendi|kira\s+ödendi|iade|bonus|prim/i
  if (incomeWords.test(text)) return 'gelir'
  return 'gider'
}

function guessRecurring(text) {
  const lower = text.toLowerCase()
  const monthlyPattern = /her\s*ay|ayda\s*bir|aylık/i
  const weeklyPattern = /her\s*hafta|haftada\s*bir|haftalık/i
  const yearlyPattern = /her\s*yıl|yılda\s*bir|yıllık/i
  const dayMatch = text.match(/(\d+)[\s.]*('sinde|'ında|'ünde|'inde|günü|'sına|'ına)/)

  if (monthlyPattern.test(lower)) {
    return { recurring: true, recurringInterval: 'monthly', recurringDay: dayMatch ? parseInt(dayMatch[1]) : null }
  }
  if (weeklyPattern.test(lower)) {
    const dayNames = { pazar: 0, pazartesi: 1, salı: 2, çarşamba: 3, perşembe: 4, cuma: 5, cumartesi: 6 }
    for (const [name, num] of Object.entries(dayNames)) {
      if (lower.includes(name)) return { recurring: true, recurringInterval: 'weekly', recurringDay: num }
    }
    return { recurring: true, recurringInterval: 'weekly', recurringDay: dayMatch ? parseInt(dayMatch[1]) : null }
  }
  if (yearlyPattern.test(lower)) {
    return { recurring: true, recurringInterval: 'yearly', recurringDay: dayMatch ? parseInt(dayMatch[1]) : 1 }
  }
  return {}
}

function guessCategory(text, type) {
  const lower = text.toLowerCase()
  if (type === 'gelir') {
    if (lower.includes('maaş') || lower.includes('maas')) return 'Maaş'
    if (lower.includes('freelance') || lower.includes('iş')) return 'Freelance'
    if (
      lower.includes('yatırım') ||
      lower.includes('faiz') ||
      lower.includes('temettü')
    )
      return 'Yatırım'
    if (lower.includes('hediye')) return 'Hediye'
    return 'Diğer'
  }

  if (
    lower.includes('market') ||
    lower.includes('bim') ||
    lower.includes('a101') ||
    lower.includes('şok') ||
    lower.includes('migros') ||
    lower.includes('carrefour')
  )
    return 'Market'
  if (
    lower.includes('yemek') ||
    lower.includes('restoran') ||
    lower.includes('kafe') ||
    lower.includes('cafe') ||
    lower.includes('lokanta') ||
    lower.includes('kahve')
  )
    return 'Yeme İçme'
  if (
    lower.includes('ulaşım') ||
    lower.includes('taksi') ||
    lower.includes('otobüs') ||
    lower.includes('metro') ||
    lower.includes('benzin') ||
    lower.includes('akaryakıt') ||
    lower.includes('yakıt')
  )
    return 'Ulaşım'
  if (
    lower.includes('fatura') ||
    lower.includes('elektrik') ||
    lower.includes('su') ||
    lower.includes('doğalgaz') ||
    lower.includes('telefon') ||
    lower.includes('internet')
  )
    return 'Faturalar'
  if (
    lower.includes('sağlık') ||
    lower.includes('hastane') ||
    lower.includes('ilaç') ||
    lower.includes('eczane') ||
    lower.includes('doktor')
  )
    return 'Sağlık'
  if (
    lower.includes('eğlence') ||
    lower.includes('sinema') ||
    lower.includes('tiyatro') ||
    lower.includes('konser') ||
    lower.includes('oyun')
  )
    return 'Eğlence'
  if (
    lower.includes('alışveriş') ||
    lower.includes('giyim') ||
    lower.includes('ayakkabı') ||
    lower.includes('kıyafet')
  )
    return 'Alışveriş'
  if (
    lower.includes('eğitim') ||
    lower.includes('kurs') ||
    lower.includes('kitap') ||
    lower.includes('okul') ||
    lower.includes('ders')
  )
    return 'Eğitim'
  if (lower.includes('kira') || lower.includes('kirası')) return 'Kira'
  return 'Diğer'
}

function guessAccountType(text) {
  const lower = text.toLowerCase()
  if (lower.includes('kredi kartı') || lower.includes('kredi karti')) return 'kredi'
  if (lower.includes('banka') || lower.includes('banka hesabı') || lower.includes('hesabım')) return 'banka'
  if (lower.includes('nakit') || lower.includes('cüzdan')) return 'nakit'
  return null
}

function extractTitle(text, type) {
  const clean = text
    .replace(/(\d+[.,]?\d*)\s*(tl|lira|₺)/gi, '')
    .replace(/yaptım|ettim|harcadım|verdim|ödedim|gönderdim|yatırdım/gi, '')
    .replace(/yaz|yazdım|şu kadar/gi, '')
    .trim()

  if (clean.length < 3) {
    return type === 'gelir' ? 'Gelir' : 'Harcama'
  }
  return clean.charAt(0).toUpperCase() + clean.slice(1, 50)
}

function fallbackParse(text) {
  const amount = extractAmount(text)
  if (!amount)
    return {
      type: 'chat',
      content:
        'Ne kadar harcadığını veya kazandığını belirtmedin. Örnek: "Bim\'den 850 TL alışveriş yaptım"'
    }

  const type = guessType(text)
  const category = guessCategory(text, type)

  const recurring = guessRecurring(text)
  const accountType = guessAccountType(text)

  return {
    type,
    amount,
    category,
    title: extractTitle(text, type),
    description: text.slice(0, 200),
    ...(accountType ? { accountType } : {}),
    ...recurring
  }
}

export const OPENROUTER_DEFAULT = 'https://openrouter.ai/api/v1'

const BUDGET_ANALYSIS_PROMPT = `Sen bir kişisel finans analistisin. Kullanıcının aylık harcamalarını bütçesine göre değerlendiriyorsun.

Görevin:
1. Toplam harcamayı bütçeyle karşılaştır
2. Her kategori için bu ayki harcamayı önceki ayların ortalamasıyla karşılaştır
3. Tek seferlik (bir kereye mahsus) harcamaları tespit et (başlık ve tutardan anla)
4. Eğer tek seferlik harcamalar çıkarıldığında bütçe aşılmıyorsa bu düşük risk demektir
5. Eğer tekrarlayan harcamalar (yemek, market, faturalar, ulaşım) normalden fazlaysa bu yüksek risk demektir

Risk puanı (1-5):
1 = Çok düşük — sadece tek seferlik harcamalar yüzünden ufak aşım
2 = Düşük — tek seferlik harcamalar var, recurring kısmen etkilemiş
3 = Orta — hem tek seferlik hem recurring katkıda bulunmuş
4 = Yüksek — recurring harcamalar belirgin şekilde artmış
5 = Kritik — recurring harcamalar çok yüksek, yapısal bütçe sorunu var

Sadece JSON formatında yanıt ver, başka hiçbir metin ekleme:
{
  "riskScore": 1-5,
  "summary": "Bir cümlelik özet",
  "details": "Detaylı analiz (2-3 cümle)",
  "oneTimeExpenses": ["başlık1", "başlık2"],
  "oneTimeTotal": tek_seferlik_toplam_tutar,
  "hasStructuralIssue": true/false,
  "recommendation": "Bütçe önerisi"
}`

async function callLLM(
  text,
  apiKey,
  model,
  baseUrl,
  systemPrompt = SYSTEM_PROMPT
) {
  const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`
  }

  if (baseUrl.includes('openrouter.ai')) {
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Parapin'
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: model || 'google/gemini-2.5-flash-lite',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.1,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`AI API hatası (${response.status}): ${err}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content?.trim()

  if (!content) throw new Error('AI yanıt vermedi')

  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  const jsonStr =
    start !== -1 && end !== -1 ? content.slice(start, end + 1) : content

  try {
    return JSON.parse(jsonStr)
  } catch {
    throw new Error('AI yanıtı ayrıştırılamadı')
  }
}

export async function analyzeBudget(
  transactions,
  budgets,
  monthKey,
  {
    apiKey = '',
    model = 'google/gemini-2.5-flash-lite',
    baseUrl = OPENROUTER_DEFAULT
  } = {}
) {
  if (!apiKey) {
    return {
      riskScore: 0,
      summary: 'AI API anahtarı ayarlanmamış.',
      details: 'Ayarlar sayfasından API anahtarını girin.',
      oneTimeExpenses: [],
      oneTimeTotal: 0,
      hasStructuralIssue: false,
      recommendation: 'Ayarlar > AI Ayarları bölümünden API anahtarını ekleyin.'
    }
  }

  const [yearStr, monthStr] = monthKey.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1

  const currentExpenses = transactions.filter((t) => {
    const d = new Date(t.date)
    return (
      d.getMonth() === month && d.getFullYear() === year && t.type === 'gider'
    )
  })

  const prevData = {}
  const prevCount = {}
  transactions.forEach((t) => {
    if (t.type !== 'gider') return
    const d = new Date(t.date)
    const txYear = d.getFullYear()
    const txMonth = d.getMonth()
    if (txYear < year || (txYear === year && txMonth < month)) {
      const diff = (year - txYear) * 12 + (month - txMonth)
      if (diff >= 1 && diff <= 3) {
        prevData[t.category] = (prevData[t.category] || 0) + t.amount
        prevCount[t.category] = (prevCount[t.category] || 0) + 1
      }
    }
  })

  const prevAverages = {}
  Object.entries(prevData).forEach(([cat, total]) => {
    prevAverages[cat] = Math.round(total / prevCount[cat])
  })

  const currentLines = currentExpenses
    .map((t) => `- ${t.category}: ${t.amount} TL (${t.title})`)
    .join('\n')

  const totalExpense = currentExpenses.reduce((s, t) => s + t.amount, 0)
  const monthBudget = budgets?.[monthKey] ?? 0

  const histLines = Object.entries(prevAverages)
    .map(([cat, avg]) => `- ${cat}: ~${avg} TL/ay`)
    .join('\n')

  const prompt = [
    `Ay: ${monthKey}`,
    `Bütçe: ${monthBudget} TL`,
    `Toplam Harcama: ${totalExpense} TL`,
    '',
    'Bu ayki harcamalar:',
    currentLines || '(harcama yok)',
    '',
    'Önceki ayların kategori ortalamaları (son 3 ay):',
    histLines || '(geçmiş veri yok)',
    '',
    'Analizi yap ve sadece JSON döndür.'
  ].join('\n')

  try {
    return await callLLM(prompt, apiKey, model, baseUrl, BUDGET_ANALYSIS_PROMPT)
  } catch (err) {
    console.warn('Bütçe analizi AI hatası:', err.message)
    return {
      riskScore: 0,
      summary: 'Analiz sırasında hata oluştu.',
      details: err.message,
      oneTimeExpenses: [],
      oneTimeTotal: 0,
      hasStructuralIssue: false,
      recommendation: 'Lütfen daha sonra tekrar dene.'
    }
  }
}

const FORECAST_PROMPT = `Sen bir finansal tahmin uzmanısın. Kullanıcının geçmiş aylardaki harcama verilerine bakarak bir sonraki ay için tahmin yapıyorsun.

Görevin:
1. Her kategorinin son aylardaki harcama trendini analiz et
2. Tek seferlik anormal harcamaları tespit edip normalize et
3. Tekrarlayan harcamaları (kira, market, faturalar, ulaşım) temel al
4. Bir sonraki ay için gerçekçi bir toplam harcama tahmini yap

Sadece JSON formatında yanıt ver, başka hiçbir metin ekleme:
{
  "predictedTotal": sayı (gelecek ay tahmini toplam harcama),
  "budgetStatus": "altinda" | "esit" | "ustunde",
  "budgetDifference": sayı (pozitif = bütçe aşımı, negatif = bütçe altı),
  "categoryBreakdown": [
    {
      "category": "kategori adı",
      "predicted": tahmini tutar,
      "average": son aylar ortalaması,
      "trend": "artiyor" | "azaliyor" | "stabil"
    }
  ],
  "confidence": "dusuk" | "orta" | "yuksek",
  "insight": "Kısa trend analizi (1-2 cümle)",
  "recommendation": "Bütçe önerisi"
}`

export async function forecastNextMonth(
  transactions,
  budgets,
  currentMonthKey,
  {
    apiKey = '',
    model = 'google/gemini-2.5-flash-lite',
    baseUrl = OPENROUTER_DEFAULT
  } = {}
) {
  if (!apiKey) {
    return {
      predictedTotal: 0,
      budgetStatus: 'altinda',
      budgetDifference: 0,
      categoryBreakdown: [],
      confidence: 'dusuk',
      insight: 'AI API anahtarı ayarlanmamış. Tahmin için ayarlar sayfasından API anahtarını girin.',
      recommendation: 'Ayarlar > AI Ayarları bölümünden API anahtarını ekleyin.'
    }
  }

  const [yearStr, monthStr] = currentMonthKey.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ]

  const last3Months = []
  for (let i = 1; i <= 3; i++) {
    const m = month - i
    const y = year + (m < 0 ? -1 : 0)
    const adjustedMonth = ((m % 12) + 12) % 12
    last3Months.push({ year: y, month: adjustedMonth, label: monthNames[adjustedMonth] })
  }

  const monthlyData = last3Months.map(({ year: y, month: m, label }) => {
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.date)
      return d.getMonth() === m && d.getFullYear() === y && t.type === 'gider'
    })
    const categories = {}
    monthTxs.forEach((t) => {
      categories[t.category] = (categories[t.category] || 0) + t.amount
    })
    return {
      label,
      total: monthTxs.reduce((s, t) => s + t.amount, 0),
      categories
    }
  })

  const allCategories = [
    ...new Set(monthlyData.flatMap((m) => Object.keys(m.categories)))
  ].sort()

  const histLines = monthlyData
    .map((m) => {
      const catLines = allCategories
        .map((c) => `    ${c}: ${m.categories[c] || 0} TL`)
        .join('\n')
      return `${m.label} (toplam: ${m.total} TL):\n${catLines}`
    })
    .join('\n\n')

  const nextDate = new Date(year, month + 1, 1)
  const nextMonthKey = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`
  const nextMonthBudget = budgets?.[nextMonthKey] ?? budgets?.[currentMonthKey] ?? 0

  const prompt = [
    `Geçmiş 3 ayın harcama verileri:`,
    '',
    histLines,
    '',
    `Gelecek ay: ${monthNames[(month + 1) % 12]} ${month === 11 ? year + 1 : year}`,
    `Gelecek ay bütçesi: ${nextMonthBudget} TL`,
    '',
    'Bu verilere göre gelecek ayın harcama tahminini yap ve JSON döndür.'
  ].join('\n')

  try {
    return await callLLM(prompt, apiKey, model, baseUrl, FORECAST_PROMPT)
  } catch (err) {
    console.warn('Tahmin AI hatası:', err.message)
    return {
      predictedTotal: 0,
      budgetStatus: 'altinda',
      budgetDifference: 0,
      categoryBreakdown: [],
      confidence: 'dusuk',
      insight: 'Tahmin sırasında hata oluştu.',
      recommendation: 'Lütfen daha sonra tekrar dene.'
    }
  }
}

export async function parseTransaction(
  text,
  {
    apiKey = '',
    model = 'google/gemini-2.5-flash-lite',
    baseUrl = OPENROUTER_DEFAULT
  } = {}
) {
  if (apiKey) {
    try {
      return await callLLM(text, apiKey, model, baseUrl)
    } catch (err) {
      console.warn('AI API hatası, regex fallback kullanılıyor:', err.message)
      return fallbackParse(text)
    }
  }

  return fallbackParse(text)
}
