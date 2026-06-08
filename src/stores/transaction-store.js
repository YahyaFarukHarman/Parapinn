import { create } from 'zustand'
import db from '@/lib/db'
import { useAccountsStore } from '@/stores/accounts-store'

function getInstanceDate(tmpl, year, month) {
  if (tmpl.recurringInterval === 'monthly') {
    const day = tmpl.recurringDay || 1
    const lastDay = new Date(year, month + 1, 0).getDate()
    const clampedDay = Math.min(day, lastDay)
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}`
  }
  if (tmpl.recurringInterval === 'yearly') {
    const originalDate = new Date(tmpl.date)
    const d = Math.min(originalDate.getDate(), new Date(year, month + 1, 0).getDate())
    return `${year}-${String(originalDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  if (tmpl.recurringInterval === 'weekly') {
    const dayOfWeek = tmpl.recurringDay || 0
    const firstDay = new Date(year, month, 1)
    const diff = (dayOfWeek - firstDay.getDay() + 7) % 7
    const day = 1 + diff
    if (day <= new Date(year, month + 1, 0).getDate()) {
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  return null
}

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  monthlyBudget: null,

  loadTransactions: async () => {
    const transactions = await db.transactions.orderBy('date').reverse().toArray()
    set({ transactions })
  },

  addTransaction: async (transaction) => {
    const id = crypto.randomUUID()
    const record = { ...transaction, id, createdAt: new Date().toISOString() }
    await db.transactions.add(record)
    set((state) => ({ transactions: [record, ...state.transactions] }))
    if (record.accountId && record.type !== 'transfer') {
      const change = record.type === 'gelir' ? record.amount : -record.amount
      useAccountsStore.getState().adjustBalance(record.accountId, change)
    }
    return record
  },

  updateTransaction: async (id, updates) => {
    const old = get().transactions.find((t) => t.id === id)
    await db.transactions.update(id, updates)
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }))
    const { adjustBalance } = useAccountsStore.getState()
    const oldAccountId = old?.accountId
    const newAccountId = updates.accountId ?? old?.accountId
    const oldAmount = old?.amount ?? 0
    const newAmount = updates.amount ?? oldAmount
    const oldType = old?.type
    const newType = updates.type ?? oldType
    if (newType === 'transfer' || oldType === 'transfer') return
    const oldChange = oldType === 'gelir' ? oldAmount : -oldAmount
    const newChange = newType === 'gelir' ? newAmount : -newAmount
    if (oldAccountId) adjustBalance(oldAccountId, -oldChange)
    if (newAccountId) adjustBalance(newAccountId, newChange)
  },

  deleteTransaction: async (id) => {
    const tx = get().transactions.find((t) => t.id === id)
    await db.transactions.delete(id)
    set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
    if (tx?.accountId && tx.type !== 'transfer') {
      const change = tx.type === 'gelir' ? -tx.amount : tx.amount
      useAccountsStore.getState().adjustBalance(tx.accountId, change)
    }
  },

  getActiveRecurringTemplates: () => {
    return get().transactions.filter((t) => t.recurring === true && t.active !== false)
  },

  setRecurringTemplate: async (id, interval, day) => {
    const updates = { recurring: true, recurringInterval: interval, recurringDay: day, active: true }
    await db.transactions.update(id, updates)
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }))
  },

  toggleRecurringActive: async (id) => {
    const tx = get().transactions.find((t) => t.id === id)
    if (!tx) return
    const updates = { active: !tx.active }
    await db.transactions.update(id, updates)
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t))
    }))
  },

  deleteRecurringWithInstances: async (id) => {
    const idsToDelete = [id]
    get().transactions.forEach((t) => {
      if (t.recurringTemplateId === id) idsToDelete.push(t.id)
    })
    await db.transactions.bulkDelete(idsToDelete)
    set((state) => ({
      transactions: state.transactions.filter((t) => !idsToDelete.includes(t.id))
    }))
  },

  generateRecurringInstances: async (monthKey) => {
    const { transactions } = get()
    const templates = transactions.filter(
      (t) => t.recurring === true && t.active !== false
    )
    const [yearStr, monthStr] = monthKey.split('-')
    const year = parseInt(yearStr)
    const month = parseInt(monthStr) - 1

    const created = []

    for (const tmpl of templates) {
      const instanceDate = getInstanceDate(tmpl, year, month)
      if (!instanceDate) continue

      const exists = transactions.some(
        (t) => t.recurringTemplateId === tmpl.id && t.date === instanceDate
      )
      if (exists) continue

      const id = crypto.randomUUID()
      const record = {
        id,
        type: tmpl.type,
        amount: tmpl.amount,
        category: tmpl.category,
        title: tmpl.title,
        date: instanceDate,
        description: tmpl.description || `Tekrarlayan: ${tmpl.title}`,
        isRecurringInstance: true,
        recurringTemplateId: tmpl.id,
        createdAt: new Date().toISOString()
      }
      await db.transactions.add(record)
      created.push(record)
    }

    if (created.length > 0) {
      set((state) => ({
        transactions: [...created, ...state.transactions]
      }))
    }

    return created
  },

  transferBetweenAccounts: async (fromId, toId, amount, title) => {
    const id = crypto.randomUUID()
    const record = {
      id,
      type: 'transfer',
      amount,
      category: 'Transfer',
      title: title || 'Hesap transferi',
      description: `${fromId} → ${toId}`,
      accountId: fromId,
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString()
    }
    await db.transactions.add(record)
    set((state) => ({ transactions: [record, ...state.transactions] }))
    const { adjustBalance } = useAccountsStore.getState()
    adjustBalance(fromId, -amount)
    adjustBalance(toId, amount)
    return record
  },

  getMonthlySummary: () => {
    const { transactions } = get()
    const now = new Date()
    const month = now.getMonth()
    const year = now.getFullYear()

    return transactions
      .filter((t) => {
        const d = new Date(t.date)
        return d.getMonth() === month && d.getFullYear() === year
      })
      .reduce(
        (acc, t) => {
          if (t.type === 'gelir') acc.income += t.amount
          else acc.expense += t.amount
          return acc
        },
        { income: 0, expense: 0 }
      )
  }
}))
