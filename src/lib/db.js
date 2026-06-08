import Dexie from 'dexie'

const db = new Dexie('parapin')

db.version(1).stores({
  messages: '++id, sessionId, role, timestamp',
  transactions: '++id, type, amount, category, date',
  sessions: '++id, title, createdAt, updatedAt',
  settings: 'key'
})

db.version(2).stores({
  goals: '++id, title, targetAmount, createdAt'
})

db.version(3).stores({
  accounts: '++id, name, type'
})

db.version(4).stores({
  debts: '++id, person, type, dueDate'
})

db.version(5).stores({
  investments: '++id, name, type'
})

export default db
