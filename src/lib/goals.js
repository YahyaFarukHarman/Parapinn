export function detectGoalIntent(text) {
  const lower = text.toLowerCase()

  const patterns = [
    /(?:biriktirmek|tasarruf|birikim|hedef)\s*(?:istemek|yapmak|koymak|belirlemek)/i,
    /(?:için|amacıyla|hedefiyle)\s*(?:biriktir|para\s*biriktir)/i,
    /(?:hedef|amaç)\s*(?:koy|belirle|oluştur)/i
  ]

  const isGoalIntent = patterns.some((p) => p.test(lower))
  if (!isGoalIntent) return null

  const amountMatch = text.match(/(\d+[.,]?\d*)\s*(tl|lira|₺)/i)
  const targetAmount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null

  const title = extractGoalTitle(text)
  if (!title || !targetAmount) return null

  const deadlineMatch = text.match(
    /(?:ayına|ayında|tarihine|kadar)\s*(?:ay|yıl)?\s*(\w+\s*\d{4}|\d{4})/i
  )
  let deadline = null
  if (deadlineMatch) {
    const raw = deadlineMatch[1]
    if (/^\d{4}$/.test(raw)) {
      deadline = `${raw}-12-31`
    }
  }

  return {
    title,
    targetAmount,
    deadline
  }
}

function extractGoalTitle(text) {
  const clean = text
    .replace(
      /(?:için|amacıyla)\s*(?:\d+[.,]?\d*\s*(?:tl|lira|₺)\s*)?(?:biriktirmek|tasarruf|para\s*biriktir)/i,
      ''
    )
    .replace(
      /(?:hedefim|birikim hedefim)\s*(?:şu|bu)?\s*(?:şekilde|olarak)?/i,
      ''
    )
    .replace(
      /(?:biriktirmek|tasarruf etmek|toplamak)\s*(?:istiyorum|hedefliyorum)/i,
      ''
    )
    .replace(/\d+[.,]?\d*\s*(?:tl|lira|₺)/gi, '')
    .replace(
      /(?:ayına|ayında|tarihine|kadar)\s*(?:\w+\s*\d{4}|\d{4})/gi,
      ''
    )
    .trim()

  if (clean.length < 2) return 'Birikim Hedefi'
  return clean.charAt(0).toUpperCase() + clean.slice(1, 60)
}
