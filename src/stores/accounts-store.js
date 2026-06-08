import { create } from 'zustand'
import db from '@/lib/db'

export const useAccountsStore = create((set, get) => ({
  accounts: [],

  loadAccounts: async () => {
    const accounts = await db.accounts.toArray()
    set({ accounts })
  },

  addAccount: async (account) => {
    const id = crypto.randomUUID()
    const record = {
      ...account,
      id,
      balance: account.balance || 0,
      createdAt: new Date().toISOString()
    }
    await db.accounts.add(record)
    set((state) => ({ accounts: [...state.accounts, record] }))
    return record
  },

  updateAccount: async (id, updates) => {
    await db.accounts.update(id, updates)
    set((state) => ({
      accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...updates } : a))
    }))
  },

  deleteAccount: async (id) => {
    await db.accounts.delete(id)
    set((state) => ({
      accounts: state.accounts.filter((a) => a.id !== id)
    }))
  },

  adjustBalance: async (id, amount) => {
    const account = get().accounts.find((a) => a.id === id)
    if (!account) return
    const newBalance = (account.balance || 0) + amount
    await db.accounts.update(id, { balance: newBalance })
    set((state) => ({
      accounts: state.accounts.map((a) =>
        a.id === id ? { ...a, balance: newBalance } : a
      )
    }))
  }
}))
