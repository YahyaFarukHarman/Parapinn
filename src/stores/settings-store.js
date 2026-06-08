import { create } from 'zustand'
import { decrypt, encrypt } from '@/lib/crypto'
import { OPENROUTER_DEFAULT } from '@/lib/ai'
import db from '@/lib/db'

let _masterPassword = ''

function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const DEFAULTS = {
  username: '',
  monthlyBudget: 0,
  currency: 'TL',
  categories: null,
  budgets: {},
  categoryBudgets: {},
  apiKey: '',
  encryptedApiKey: '',
  appPasswordSet: false,
  aiBaseUrl: OPENROUTER_DEFAULT,
  aiModel: 'google/gemini-2.5-flash-lite'
}

function serialize(state) {
  const result = {
    username: state.username,
    monthlyBudget: state.monthlyBudget,
    currency: state.currency,
    categories: state.categories,
    budgets: state.budgets,
    categoryBudgets: state.categoryBudgets,
    aiBaseUrl: state.aiBaseUrl,
    aiModel: state.aiModel,
    appPasswordSet: state.appPasswordSet
  }
  if (state.appPasswordSet) {
    result.encryptedApiKey = state.encryptedApiKey
    result.apiKey = ''
  } else {
    result.apiKey = state.apiKey
    result.encryptedApiKey = ''
  }
  return result
}

export const useSettingsStore = create((set, get) => ({
  username: DEFAULTS.username,
  monthlyBudget: DEFAULTS.monthlyBudget,
  currency: DEFAULTS.currency,
  categories: null,
  budgets: {},
  categoryBudgets: {},
  apiKey: DEFAULTS.apiKey,
  encryptedApiKey: DEFAULTS.encryptedApiKey,
  appPasswordSet: DEFAULTS.appPasswordSet,
  isLocked: false,
  aiBaseUrl: DEFAULTS.aiBaseUrl,
  aiModel: DEFAULTS.aiModel,
  loaded: false,

  loadSettings: async () => {
    const settings = await db.settings.get('preferences')
    if (settings) {
      const budgets = settings.budgets || {}
      const key = currentMonthKey()
      if (!budgets[key] && settings.monthlyBudget) {
        budgets[key] = settings.monthlyBudget
      }
      const appPasswordSet = settings.appPasswordSet ?? false
      const encryptedApiKey = settings.encryptedApiKey ?? ''
      set({
        username: settings.username ?? DEFAULTS.username,
        monthlyBudget: budgets[key] ?? settings.monthlyBudget ?? DEFAULTS.monthlyBudget,
        currency: settings.currency ?? DEFAULTS.currency,
        categories: settings.categories ?? null,
        budgets,
        categoryBudgets: settings.categoryBudgets ?? {},
        apiKey: appPasswordSet ? '' : (settings.apiKey ?? DEFAULTS.apiKey),
        encryptedApiKey,
        appPasswordSet,
        isLocked: appPasswordSet && !!encryptedApiKey,
        aiBaseUrl: settings.aiBaseUrl ?? DEFAULTS.aiBaseUrl,
        aiModel: settings.aiModel ?? DEFAULTS.aiModel,
        loaded: true
      })
    } else {
      set({ loaded: true })
    }
  },

  updateSettings: async (updates) => {
    const current = get()
    const data = { ...serialize(current), ...updates }
    await db.settings.put({ key: 'preferences', ...data })
    set(updates)
  },

  setUsername: async (name) => {
    await get().updateSettings({ username: name })
  },

  setMonthlyBudget: async (amount) => {
    const key = currentMonthKey()
    const budgets = { ...get().budgets, [key]: amount }
    await get().updateSettings({ budgets, monthlyBudget: amount })
  },

  setApiKey: async (key) => {
    const state = get()
    if (state.appPasswordSet && _masterPassword) {
      const encrypted = await encrypt(key, _masterPassword)
      set({ apiKey: key, encryptedApiKey: encrypted })
      await get().updateSettings({ encryptedApiKey: encrypted, apiKey: '' })
      set({ apiKey: key })
    } else {
      await get().updateSettings({ apiKey: key })
    }
  },

  setAiBaseUrl: async (url) => {
    await get().updateSettings({ aiBaseUrl: url })
  },

  setAiModel: async (model) => {
    await get().updateSettings({ aiModel: model })
  },

  setCategoryBudget: async (category, amount) => {
    const categoryBudgets = { ...get().categoryBudgets, [category]: amount }
    await get().updateSettings({ categoryBudgets })
  },

  removeCategoryBudget: async (category) => {
    const categoryBudgets = { ...get().categoryBudgets }
    delete categoryBudgets[category]
    await get().updateSettings({ categoryBudgets })
  },

  setAppPassword: async (password) => {
    const state = get()
    _masterPassword = password
    if (state.apiKey) {
      const encrypted = await encrypt(state.apiKey, password)
      set({ encryptedApiKey: encrypted, appPasswordSet: true, apiKey: state.apiKey })
      await get().updateSettings({ encryptedApiKey: encrypted, appPasswordSet: true, apiKey: '' })
      set({ apiKey: state.apiKey })
    } else {
      set({ appPasswordSet: true })
      await get().updateSettings({ appPasswordSet: true })
    }
  },

  changeAppPassword: async (oldPassword, newPassword) => {
    const state = get()
    if (!state.encryptedApiKey) return
    const decrypted = await decrypt(state.encryptedApiKey, oldPassword)
    _masterPassword = newPassword
    const encrypted = await encrypt(decrypted, newPassword)
    set({ encryptedApiKey: encrypted, apiKey: decrypted })
    await get().updateSettings({ encryptedApiKey: encrypted, apiKey: '' })
    set({ apiKey: decrypted })
  },

  removeAppPassword: async (password) => {
    const state = get()
    if (!state.encryptedApiKey) {
      set({ appPasswordSet: false })
      await get().updateSettings({ appPasswordSet: false })
      return
    }
    const decrypted = await decrypt(state.encryptedApiKey, password)
    _masterPassword = ''
    set({ appPasswordSet: false, encryptedApiKey: '', apiKey: decrypted })
    await get().updateSettings({ appPasswordSet: false, encryptedApiKey: '', apiKey: decrypted })
  },

  unlock: async (password) => {
    const state = get()
    if (!state.encryptedApiKey) throw new Error('Sifre gerekmiyor')
    const decrypted = await decrypt(state.encryptedApiKey, password)
    _masterPassword = password
    set({ apiKey: decrypted, isLocked: false })
  },

  lock: () => {
    _masterPassword = ''
    set({ apiKey: '', isLocked: true })
  }
}))
