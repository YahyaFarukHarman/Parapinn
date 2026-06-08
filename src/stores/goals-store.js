import { create } from 'zustand'
import db from '@/lib/db'

export const useGoalsStore = create((set, get) => ({
  goals: [],

  loadGoals: async () => {
    const goals = await db.goals.orderBy('createdAt').reverse().toArray()
    set({ goals })
  },

  addGoal: async (goal) => {
    const id = crypto.randomUUID()
    const record = {
      id,
      title: goal.title,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount || 0,
      deadline: goal.deadline || null,
      category: goal.category || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    await db.goals.add(record)
    set((state) => ({ goals: [record, ...state.goals] }))
    return record
  },

  updateGoal: async (id, updates) => {
    const data = { ...updates, updatedAt: new Date().toISOString() }
    await db.goals.update(id, data)
    set((state) => ({
      goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g))
    }))
  },

  addToGoal: async (id, amount) => {
    const goal = get().goals.find((g) => g.id === id)
    if (!goal) return
    const newAmount = (goal.currentAmount || 0) + amount
    await get().updateGoal(id, { currentAmount: newAmount })
  },

  deleteGoal: async (id) => {
    await db.goals.delete(id)
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }))
  }
}))
