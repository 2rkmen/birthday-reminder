import Dexie from 'dexie'

const db = new Dexie('BirthdayReminder')

db.version(1).stores({
  contacts: '++id, name, birthday, imported, createdAt',
  settings: 'key'
})

export default db
