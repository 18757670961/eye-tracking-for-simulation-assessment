import { openDB } from 'idb'

const db = openDB('records-db', 1, {
  upgrade(db) {
    const store = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true })
    store.createIndex('simulation_idx', 'simulation')
    store.createIndex('uid_idx', 'uid')
  },
})

export async function getRecords() {
  return (await db).getAll('records')
}

export async function getUnsyncedRecords() {
  return (await db).getAllFromIndex('records', 'uid_idx', '')
}

export async function getSyncedRecords() {
  return (await db).getAllFromIndex('records', 'uid_idx', IDBKeyRange.lowerBound('', true))
}

export async function getRecordsBySimulation(name) {
  return (await db).getAllFromIndex('records', 'simulation_idx', name)
}

export async function insertRecord(record) {
  (await db).put('records', record)
}

export async function deleteRecord(id) {
  (await db).delete('records', id)
}

export async function syncRecord(key, uid) {
  const transaction = (await db).transaction('records', 'readwrite')
  const store = transaction.objectStore('records')
  const record = await store.get(key)
  record.uid = uid
  await store.put(record)
  await transaction.done
}