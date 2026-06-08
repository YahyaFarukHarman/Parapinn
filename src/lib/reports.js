const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
]

function formatAmount(v) {
  return v.toLocaleString('tr-TR') + ' TL'
}

export function exportCSV(transactions, monthKey) {
  const [year, month] = monthKey.split('-').map(Number)
  const filtered = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === month - 1 && d.getFullYear() === year
  })

  const header = 'Tarih,Tür,Kategori,Başlık,Tutar (TL)\n'
  const rows = filtered
    .map(
      (t) =>
        `${t.date},${t.type === 'gelir' ? 'Gelir' : 'Gider'},${t.category},"${t.title}",${t.amount}`
    )
    .join('\n')

  const csv = '\uFEFF' + header + rows
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `parapin-${monthKey}-rapor.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function printReport(transactions, monthKey, budget) {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = parseInt(yearStr)
  const month = parseInt(monthStr) - 1

  const monthTxs = transactions.filter((t) => {
    const d = new Date(t.date)
    return d.getMonth() === month && d.getFullYear() === year
  })

  const income = monthTxs.filter((t) => t.type === 'gelir')
  const expense = monthTxs.filter((t) => t.type === 'gider')
  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0)
  const remaining = budget - totalExpense
  const budgetPercent = budget > 0 ? (totalExpense / budget) * 100 : 0

  const categoryGroups = {}
  expense.forEach((t) => {
    categoryGroups[t.category] = (categoryGroups[t.category] || 0) + t.amount
  })

  const catRows = Object.entries(categoryGroups)
    .sort((a, b) => b[1] - a[1])
    .map(
      ([cat, amount], i) =>
        `<tr>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:center;">${i + 1}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;">${cat}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${formatAmount(amount)}</td>
          <td style="padding:6px 10px;border:1px solid #ddd;text-align:right;">${budget > 0 ? ((amount / totalExpense) * 100).toFixed(1) + '%' : '-'}</td>
        </tr>`
    )
    .join('')

  const txRows = monthTxs
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .map(
      (t) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #eee;">${t.date}</td>
          <td style="padding:4px 8px;border:1px solid #eee;">
            <span style="color:${t.type === 'gelir' ? '#16a34a' : '#dc2626'}">
              ${t.type === 'gelir' ? 'Gelir' : 'Gider'}
            </span>
          </td>
          <td style="padding:4px 8px;border:1px solid #eee;">${t.category}</td>
          <td style="padding:4px 8px;border:1px solid #eee;">${t.title}</td>
          <td style="padding:4px 8px;border:1px solid #eee;text-align:right;font-weight:${t.type === 'gelir' ? 'normal' : 'bold'};color:${t.type === 'gelir' ? '#16a34a' : '#dc2626'}">
            ${t.type === 'gelir' ? '+' : '-'}${formatAmount(t.amount)}
          </td>
        </tr>`
    )
    .join('')

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>Parapin — ${MONTHS[month]} ${year} Raporu</title>
  <style>
    @media print {
      .no-print { display: none; }
      body { font-size: 11pt; }
    }
    body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #1a1a2e; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 13px; margin-bottom: 24px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .summary-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
    .summary-card .label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .summary-card .value { font-size: 20px; font-weight: 700; margin-top: 4px; }
    .summary-card .value.green { color: #16a34a; }
    .summary-card .value.red { color: #dc2626; }
    .summary-card .value.blue { color: #2563eb; }
    section { margin-bottom: 28px; }
    h2 { font-size: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { background: #f8fafc; padding: 8px 10px; border: 1px solid #ddd; text-align: left; font-weight: 600; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #999; text-align: center; }
    .no-print { margin-bottom: 16px; }
    .no-print button { background: #2563eb; color: white; border: none; padding: 8px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; }
    .no-print button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="no-print">
    <button onclick="window.print()">🖨 PDF Olarak Kaydet / Yazdır</button>
    <p style="margin-top:6px;font-size:12px;color:#999;">PDF kaydetmek için yazdırma iletişim kutusunda "PDF olarak kaydet"i seç.</p>
  </div>

  <h1>Parapin — Aylık Finans Raporu</h1>
  <p class="subtitle">${MONTHS[month]} ${year} &middot; Parapin AI Destekli Bütçe Asistanı</p>

  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Toplam Gelir</div>
      <div class="value green">${formatAmount(totalIncome)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Toplam Gider</div>
      <div class="value red">${formatAmount(totalExpense)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Bütçe</div>
      <div class="value blue">${formatAmount(budget)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Kalan Bütçe</div>
      <div class="value ${remaining < 0 ? 'red' : 'blue'}">${formatAmount(remaining)}</div>
    </div>
  </div>

  ${budget > 0 ? `<p style="font-size:13px;margin-bottom:20px;padding:8px 12px;background:${budgetPercent > 100 ? '#fef2f2' : budgetPercent > 80 ? '#fffbeb' : '#f0fdf4'};border-radius:6px;border:1px solid ${budgetPercent > 100 ? '#fecaca' : budgetPercent > 80 ? '#fde68a' : '#bbf7d0'};">
    Bütçe kullanımı: %${budgetPercent.toFixed(0)}
    ${budgetPercent > 100 ? '⚠ Bütçe limiti aşıldı!' : budgetPercent > 80 ? '⚠ Bütçe limitine yaklaşılıyor.' : '✅ Bütçe içinde.'}
  </p>` : ''}

  <section>
    <h2>Kategori Bazında Harcama Dağılımı</h2>
    <table>
      <thead>
        <tr><th>#</th><th>Kategori</th><th style="text-align:right">Tutar</th><th style="text-align:right">Oran</th></tr>
      </thead>
      <tbody>
        ${catRows || '<tr><td colspan="4" style="padding:12px;text-align:center;color:#999;">Bu aya ait gider bulunmuyor.</td></tr>'}
      </tbody>
    </table>
  </section>

  <section>
    <h2>Tüm İşlemler (${monthTxs.length} kayıt)</h2>
    <table>
      <thead>
        <tr><th>Tarih</th><th>Tür</th><th>Kategori</th><th>Başlık</th><th style="text-align:right">Tutar</th></tr>
      </thead>
      <tbody>
        ${txRows || '<tr><td colspan="5" style="padding:12px;text-align:center;color:#999;">Bu aya ait işlem bulunmuyor.</td></tr>'}
      </tbody>
    </table>
  </section>

  <div class="footer">
    Parapin &middot; ${new Date().toLocaleDateString('tr-TR')} tarihinde oluşturuldu.
  </div>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
