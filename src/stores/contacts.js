import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from '../db'
import { sortByNearestBirthday } from '../utils/birthday'

export const useContactsStore = defineStore('contacts', () => {
  const contacts = ref([])
  const loading = ref(false)

  async function loadContacts() {
    loading.value = true
    try {
      const all = await db.contacts.toArray()
      contacts.value = sortByNearestBirthday(all)
    } finally {
      loading.value = false
    }
  }

  async function addContact(contact) {
    const id = await db.contacts.add({
      name: contact.name,
      birthday: contact.birthday || null,
      hasPhone: contact.hasPhone || false,
      imported: contact.imported || false,
      createdAt: Date.now()
    })
    await loadContacts()
    return id
  }

  async function updateContact(id, data) {
    await db.contacts.update(id, data)
    await loadContacts()
  }

  async function deleteContact(id) {
    await db.contacts.delete(id)
    await loadContacts()
  }

  async function importContacts(newContacts) {
    const existing = await db.contacts.toArray()
    const existingNames = new Set(existing.map(c => c.name.toLowerCase().trim()))

    const toAdd = newContacts.filter(c => !existingNames.has(c.name.toLowerCase().trim()))

    if (toAdd.length > 0) {
      await db.contacts.bulkAdd(toAdd)
      await loadContacts()
    }
    return toAdd.length
  }

  async function exportToJSON() {
    const all = await db.contacts.toArray()
    const exportData = all.map(c => ({
      name: c.name,
      birthday: c.birthday,
      hasPhone: c.hasPhone,
      imported: c.imported
    }))
    return JSON.stringify(exportData, null, 2)
  }

  async function importFromJSON(jsonString) {
    let data
    try {
      data = JSON.parse(jsonString)
    } catch {
      throw new Error('Неверный формат JSON')
    }
    if (!Array.isArray(data)) {
      throw new Error('Ожидается массив контактов')
    }

    const existing = await db.contacts.toArray()
    const existingByName = new Map()
    existing.forEach(c => existingByName.set(c.name.toLowerCase().trim(), c))

    let added = 0
    let updated = 0

    for (const c of data) {
      if (!c.name || !c.name.trim()) continue
      const key = c.name.toLowerCase().trim()
      if (existingByName.has(key)) {
        const existingContact = existingByName.get(key)
        if (c.birthday) {
          await db.contacts.update(existingContact.id, {
            birthday: c.birthday,
            hasPhone: c.hasPhone || existingContact.hasPhone,
            imported: existingContact.imported
          })
          updated++
        }
      } else {
        await db.contacts.add({
          name: c.name.trim(),
          birthday: c.birthday || null,
          hasPhone: c.hasPhone || false,
          imported: c.imported || false,
          createdAt: Date.now()
        })
        added++
      }
    }
    await loadContacts()
    return { added, updated }
  }

  function getContactById(id) {
    return contacts.value.find(c => c.id === Number(id)) || null
  }

  return {
    contacts,
    loading,
    loadContacts,
    addContact,
    updateContact,
    deleteContact,
    importContacts,
    exportToJSON,
    importFromJSON,
    getContactById
  }
})
