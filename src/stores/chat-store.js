import { create } from 'zustand'
import db from '@/lib/db'

export const useChatStore = create((set, get) => ({
  sessions: [],
  activeSessionId: null,
  messages: [],
  isProcessing: false,

  loadSessions: async () => {
    const sessions = await db.sessions.orderBy('updatedAt').reverse().toArray()
    set({ sessions })
  },

  createSession: async (title = 'Yeni Sohbet') => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const session = { id, title, createdAt: now, updatedAt: now }
    await db.sessions.add(session)
    set((state) => ({ sessions: [session, ...state.sessions], activeSessionId: id, messages: [] }))
    return id
  },

  setActiveSession: async (id) => {
    const messages = id ? await db.messages.where({ sessionId: id }).sortBy('timestamp') : []
    set({ activeSessionId: id, messages })
  },

  sendMessage: async (content) => {
    const { activeSessionId, sessions } = get()
    if (!activeSessionId) return

    const userMsg = {
      id: crypto.randomUUID(),
      sessionId: activeSessionId,
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    await db.messages.add(userMsg)

    const session = sessions.find((s) => s.id === activeSessionId)
    if (session && session.title === 'Yeni Sohbet') {
      const title = content.length > 35 ? content.slice(0, 35).trimEnd() + '…' : content
      await db.sessions.update(activeSessionId, { title, updatedAt: new Date().toISOString() })
      set((state) => ({
        messages: [...state.messages, userMsg],
        sessions: state.sessions.map((s) => s.id === activeSessionId ? { ...s, title } : s),
        isProcessing: true
      }))
    } else {
      await db.sessions.update(activeSessionId, { updatedAt: new Date().toISOString() })
      set((state) => ({ messages: [...state.messages, userMsg], isProcessing: true }))
    }

    return userMsg
  },

  addAssistantMessage: async (content) => {
    const { activeSessionId } = get()
    if (!activeSessionId) return

    const assistantMsg = {
      id: crypto.randomUUID(),
      sessionId: activeSessionId,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString()
    }

    await db.messages.add(assistantMsg)
    set((state) => ({ messages: [...state.messages, assistantMsg], isProcessing: false }))
  },

  renameSession: async (id, title) => {
    await db.sessions.update(id, { title, updatedAt: new Date().toISOString() })
    set((state) => ({
      sessions: state.sessions.map((s) => s.id === id ? { ...s, title } : s)
    }))
  },

  deleteSession: async (id) => {
    await db.sessions.delete(id)
    await db.messages.where({ sessionId: id }).delete()
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
      messages: state.activeSessionId === id ? [] : state.messages
    }))
  }
}))
