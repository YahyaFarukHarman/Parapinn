const TYPE_KEYWORDS = {
  emtia: ['altin', 'gumus', 'gram', 'ceyrek', 'yarim', 'tam', 'republic', 'kulce', 'ons'],
  hisse: ['hisse', 'hissesi', 'senedi', 'thy', 'sise', 'eregl', 'akbnk', 'garanti', 'isctr',
          'kchol', 'tuprs', 'bim', 'asels', 'petkm', 'sahol', 'ttkom', 'vakbn', 'ykbnk'],
  doviz: ['usd', 'eur', 'gbp', 'jpy', 'dolar', 'euro', 'sterlin', 'parite', 'forex'],
  kripto: ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'xrp', 'bnb', 'ada', 'doge',
           'kripto', 'coin']
}

const TYPE_SUB_KEYWORDS = {
  emtia: /(?:altın|altin|gumus|gümüş|gram|ceyrek|çeyrek|kulce|külçe)/i,
  hisse: /(?:hisse|senedi|hissesi|borsa)/i,
  doviz: /(?:dolar|euro|usd|eur|sterlin|parite)/i,
  kripto: /(?:bitcoin|btc|ethereum|kripto|coin)/i
}

export function detectInvestmentIntent(text) {
  const lower = text.toLowerCase()

  const hasInvest = /(?:aldım|aldim|sattım|sattim|ekledim|yatirim|biriktir|portfoy|hisse|altin|gumus|dolar|euro|bitcoin|borsa)/i.test(lower)
  if (!hasInvest) return null

  let type = 'emtia'
  for (const [t, pattern] of Object.entries(TYPE_SUB_KEYWORDS)) {
    if (pattern.test(lower)) {
      type = t
      break
    }
  }

  let name = null
  const typeWords = TYPE_KEYWORDS[type] || []
  for (const word of typeWords) {
    if (lower.includes(word)) {
      name = word.toUpperCase()
      break
    }
  }

  if (!name) name = type === 'emtia' ? 'Gram Altin' : type === 'hisse' ? 'Hisse Senedi' : type === 'doviz' ? 'Dolar' : 'Bitcoin'

  const amountMatch = text.match(/(\d+[.,]?\d*)\s*(tl|lira|₺)/i)
  if (!amountMatch) return null
  const totalAmount = parseFloat(amountMatch[1].replace(',', '.'))

  const qtyMatch = text.match(/(?:(\d+[.,]?\d*)\s*(?:gram|adet|tane|lot))|(?:(\d+)\s*(?:g|gr)\b)/i)
  let quantity = 1
  let purchasePrice = totalAmount
  if (qtyMatch) {
    quantity = parseFloat((qtyMatch[1] || qtyMatch[2]).replace(',', '.'))
    purchasePrice = totalAmount / quantity
  }

  const isSell = /sattım|sattim|satt/i.test(lower)

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1).toLowerCase(),
    type,
    quantity,
    purchasePrice: Math.round(purchasePrice),
    currentPrice: Math.round(purchasePrice),
    notes: isSell ? `${name} satisi: ${totalAmount} TL` : `${name} alimi: ${totalAmount} TL`
  }
}
