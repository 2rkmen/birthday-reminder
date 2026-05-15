import { defineStore } from 'pinia'
import { ref } from 'vue'
import db from '../db'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref('light')
  const notifyEnabled = ref(true)
  const notifyDaysBefore = ref(7)
  const contactsImported = ref(false)
  const loaded = ref(false)

  async function loadSettings() {
    const all = await db.settings.toArray()
    const settings = {}
    all.forEach(s => { settings[s.key] = s.value })

    theme.value = settings.theme || 'light'
    notifyEnabled.value = settings.notifyEnabled !== false
    notifyDaysBefore.value = settings.notifyDaysBefore || 7
    contactsImported.value = settings.contactsImported === true
    loaded.value = true

    applyTheme(theme.value)
  }

  async function setTheme(value) {
    theme.value = value
    await db.settings.put({ key: 'theme', value })
    applyTheme(value)
  }

  function applyTheme(value) {
    document.documentElement.setAttribute('data-theme', value)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', value === 'dark' ? '#1d232a' : '#4f46e5')
  }

  async function setNotifyEnabled(value) {
    notifyEnabled.value = value
    await db.settings.put({ key: 'notifyEnabled', value })
  }

  async function setNotifyDaysBefore(value) {
    notifyDaysBefore.value = value
    await db.settings.put({ key: 'notifyDaysBefore', value })
  }

  async function setContactsImported(value) {
    contactsImported.value = value
    await db.settings.put({ key: 'contactsImported', value })
  }

  function toggleTheme() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  return {
    theme,
    notifyEnabled,
    notifyDaysBefore,
    contactsImported,
    loaded,
    loadSettings,
    setTheme,
    setNotifyEnabled,
    setNotifyDaysBefore,
    setContactsImported,
    toggleTheme
  }
})
