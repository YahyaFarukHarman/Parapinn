const DEBT_PATTERNS = [
  {
    regex: /(?:borç\s*ver|borc\s*ver|ödünç\s*ver|verdim\s*borç)/i,
    type: 'alacak'
  },
  {
    regex: /(?:borç\s*al|borc\s*al|ödünç\s*al|aldım\s*borç)/i,
    type: 'borc'
  },
  {
    regex: /(?:borçlu\s*old|borcum\s*var|borcum\s*ol)/i,
    type: 'borc'
  },
  {
    regex: /(?:alacağım\s*var|vereceği\s*var|vermesi\s*lazım|bana\s*borç)/i,
    type: 'alacak'
  }
]

const PERSON_PATTERN = /([A-ZİÖÜÇĞŞ][a-zıöüçğş]+)[':\s]*(?:e|a|den|dan|in|ın|un|ün|le|la)?/i

export function detectDebtIntent(text) {
  const lower = text.toLowerCase()

  const hasBorc = /borç|borc|alacak|vereceğim|ödeyeceğim|ödünç/i.test(lower)
  if (!hasBorc) return null

  let type = null
  for (const p of DEBT_PATTERNS) {
    if (p.regex.test(lower)) {
      type = p.type
      break
    }
  }
  if (!type) {
    if (/verdim|verdiğim|verilen|borç\s*verd/.test(lower)) type = 'alacak'
    else if (/aldım|aldığım|alınan|borç\s*ald/.test(lower)) type = 'borc'
    else return null
  }

  const personMatch = text.match(PERSON_PATTERN)
  const person = personMatch ? personMatch[1] : null

  const amountMatch = text.match(/(\d+[.,]?\d*)\s*(tl|lira|₺)/i)
  if (!amountMatch) return null
  const amount = parseFloat(amountMatch[1].replace(',', '.'))

  const dueMatch = text.match(/(?:ayın\s*(\d+)|(\d+)\s*gün\s*içinde|(\d{4}-\d{2}-\d{2}))/i)

  return {
    person: person || (type === 'alacak' ? 'Alacaklı' : 'Borçlu'),
    type,
    amount,
    description: text.slice(0, 200)
  }
}
