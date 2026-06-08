import { create } from 'zustand'
import db from '@/lib/db'

export const useInvestmentsStore = create((set, get) => ({
  investments: [],

  loadInvestments: async () => {
    const investments = await db.investments.toArray()
    set({ investments })
  },

  addInvestment: async (inv) => {
    const id = crypto.randomUUID()
    const record = { ...inv, id, createdAt: new Date().toISOString() }
    await db.investments.add(record)
    set((state) => ({ investments: [...state.investments, record] }))
    return record
  },

  updateInvestment: async (id, updates) => {
    await db.investments.update(id, updates)
    set((state) => ({
      investments: state.investments.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      )
    }))
  },

  deleteInvestment: async (id) => {
    await db.investments.delete(id)
    set((state) => ({
      investments: state.investments.filter((i) => i.id !== id)
    }))
  },

  getPortfolioSummary: () => {
    const investments = get().investments
    return investments.reduce(
      (acc, inv) => {
        const cost = (inv.purchasePrice || 0) * (inv.quantity || 0)
        const current = (inv.currentPrice || inv.purchasePrice || 0) * (inv.quantity || 0)
        acc.totalCost += cost
        acc.totalValue += current
        acc.profitLoss += current - cost
        return acc
      },
      { totalCost: 0, totalValue: 0, profitLoss: 0 }
    )
  }
}))
