import { create } from 'zustand'
import db from '@/lib/db'

export const useDebtsStore = create((set, get) => ({
  debts: [],

  loadDebts: async () => {
    const debts = await db.debts.toArray()
    set({ debts })
  },

  addDebt: async (debt) => {
    const id = crypto.randomUUID()
    const record = {
      ...debt,
      id,
      remaining: debt.amount,
      createdAt: new Date().toISOString()
    }
    await db.debts.add(record)
    set((state) => ({ debts: [...state.debts, record] }))
    return record
  },

  recordPayment: async (id, paymentAmount) => {
    const debt = get().debts.find((d) => d.id === id)
    if (!debt) return
    const newRemaining = Math.max(0, debt.remaining - paymentAmount)
    const updates = { remaining: newRemaining }
    if (newRemaining === 0) updates.status = 'odendi'
    await db.debts.update(id, updates)
    set((state) => ({
      debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d))
    }))
  },

  updateDebt: async (id, updates) => {
    await db.debts.update(id, updates)
    set((state) => ({
      debts: state.debts.map((d) => (d.id === id ? { ...d, ...updates } : d))
    }))
  },

  deleteDebt: async (id) => {
    await db.debts.delete(id)
    set((state) => ({
      debts: state.debts.filter((d) => d.id !== id)
    }))
  }
}))
