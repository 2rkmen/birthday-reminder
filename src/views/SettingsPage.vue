<script setup>
import { ref, onMounted } from 'vue'
import { useContactsStore } from '../stores/contacts'
import { useSettingsStore } from '../stores/settings'
import { canImportContacts, importContactsFromDevice } from '../utils/contacts'
import { requestNotificationPermission } from '../utils/notifications'

const contactsStore = useContactsStore()
const settingsStore = useSettingsStore()

const importing = ref(false)
const importResult = ref(null)
const importError = ref(null)
const contactsSupported = ref(null)

const exporting = ref(false)
const exportResult = ref('')

const importingJSON = ref(false)
const importJSONResult = ref(null)

const notifyStatus = ref(false)

onMounted(async () => {
  if (!settingsStore.loaded) {
    await settingsStore.loadSettings()
  }
  contactsSupported.value = await canImportContacts()
  notifyStatus.value = 'Notification' in window && Notification.permission
})

async function doImport() {
  importing.value = true
  importError.value = null
  importResult.value = null
  try {
    const contacts = await importContactsFromDevice()
    const count = await contactsStore.importContacts(contacts)
    await settingsStore.setContactsImported(true)
    importResult.value = { total: contacts.length, imported: count }
  } catch (e) {
    if (e.name === 'NotSupportedError') {
      importError.value = 'API контактов не поддерживается на этом устройстве'
    } else if (e.name === 'NotAllowedError') {
      importError.value = 'Доступ к контактам запрещён'
    } else {
      importError.value = e.message || 'Ошибка при импорте'
    }
  } finally {
    importing.value = false
  }
}

async function doExport() {
  exporting.value = true
  try {
    const json = await contactsStore.exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `birthdays-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    exportResult.value = `Экспортировано контактов: ${contactsStore.contacts.length}`
  } catch (e) {
    exportResult.value = 'Ошибка при экспорте'
  } finally {
    exporting.value = false
  }
}

function handleImportJSON(e) {
  const file = e.target.files[0]
  if (!file) return

  importingJSON.value = true
  importJSONResult.value = null

  const reader = new FileReader()
  reader.onload = async () => {
    try {
      const result = await contactsStore.importFromJSON(reader.result)
      importJSONResult.value = `Добавлено: ${result.added}, обновлено: ${result.updated}`
    } catch (err) {
      importJSONResult.value = `Ошибка: ${err.message}`
    } finally {
      importingJSON.value = false
    }
  }
  reader.onerror = () => {
    importJSONResult.value = 'Ошибка при чтении файла'
    importingJSON.value = false
  }
  reader.readAsText(file)
  e.target.value = ''
}

async function requestNotify() {
  const ok = await requestNotificationPermission()
  notifyStatus.value = 'Notification' in window && Notification.permission
  if (ok) {
    notifyStatus.value = 'granted'
  }
}

async function clearAllData() {
  if (!confirm('Вы уверены? Все контакты будут удалены. Это действие нельзя отменить.')) return
  if (!confirm('Точно удалить все данные?')) return

  const { default: db } = await import('../db')
  await db.contacts.clear()
  await settingsStore.setContactsImported(false)
  await contactsStore.loadContacts()
  importResult.value = null
  exportResult.value = ''
  importJSONResult.value = ''
}

async function deleteAllContacts() {
  if (!confirm('Удалить все контакты? Это действие нельзя отменить.')) return
  const { default: db } = await import('../db')
  await db.contacts.clear()
  await settingsStore.setContactsImported(false)
  await contactsStore.loadContacts()
}
</script>

<template>
  <div class="p-4 space-y-4 max-w-2xl mx-auto">
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-5">
        <h2 class="card-title text-lg">🔔 Уведомления</h2>
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              class="toggle toggle-primary"
              :checked="settingsStore.notifyEnabled"
              @change="settingsStore.setNotifyEnabled($event.target.checked)" />
            <span class="label-text">Включить уведомления</span>
          </label>
        </div>
        <div class="form-control" v-if="settingsStore.notifyEnabled">
          <label class="label cursor-pointer justify-start gap-3">
            <span class="label-text">Напоминать за</span>
            <select
              class="select select-bordered select-sm"
              :value="settingsStore.notifyDaysBefore"
              @change="settingsStore.setNotifyDaysBefore(Number($event.target.value))">
              <option :value="1">1 день</option>
              <option :value="3">3 дня</option>
              <option :value="7">7 дней</option>
              <option :value="14">14 дней</option>
            </select>
          </label>
        </div>
        <div v-if="notifyStatus === 'default'" class="mt-1">
          <button class="btn btn-outline btn-sm" @click="requestNotify">
            Разрешить уведомления
          </button>
        </div>
        <div v-else-if="notifyStatus === 'granted'" class="text-xs text-success mt-1">
          ✅ Уведомления разрешены
        </div>
        <div v-else-if="notifyStatus === 'denied'" class="text-xs text-error mt-1">
          ⛔ Уведомления заблокированы. Разрешите в настройках браузера.
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-5">
        <h2 class="card-title text-lg">📱 Импорт контактов</h2>
        <p class="text-sm text-base-content/70 mb-2">
          Импортировать контакты из телефонной книги (только имена, номера не сохраняются).
        </p>

        <div v-if="contactsSupported === false" class="alert alert-warning py-2 text-sm mb-2">
          ⚠️ Доступно только на Android через Chrome
        </div>

        <div v-if="importResult" class="alert alert-success py-2 text-sm mb-2">
          ✅ Импортировано {{ importResult.imported }} из {{ importResult.total }}
        </div>
        <div v-if="importError" class="alert alert-error py-2 text-sm mb-2">
          ❌ {{ importError }}
        </div>

        <button
          class="btn btn-primary"
          :class="{ 'loading': importing }"
          :disabled="importing || contactsSupported === false"
          @click="doImport">
          {{ importing ? 'Импорт...' : 'Импортировать контакты' }}
        </button>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-5">
        <h2 class="card-title text-lg">💾 Экспорт / Импорт JSON</h2>
        <p class="text-sm text-base-content/70 mb-2">
          Экспортировать все контакты в JSON-файл или импортировать ранее сохранённый файл.
        </p>

        <div v-if="exportResult" class="alert alert-success py-2 text-sm mb-2">
          ✅ {{ exportResult }}
        </div>
        <div v-if="importJSONResult" class="alert alert-info py-2 text-sm mb-2">
          📥 {{ importJSONResult }}
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-outline"
            :class="{ 'loading': exporting }"
            :disabled="exporting || contactsStore.contacts.length === 0"
            @click="doExport">
            {{ exporting ? 'Экспорт...' : 'Экспорт JSON' }}
          </button>

          <label class="btn btn-outline" :class="{ 'loading': importingJSON }">
            {{ importingJSON ? 'Импорт...' : 'Импорт JSON' }}
            <input type="file" accept=".json" class="hidden" @change="handleImportJSON" />
          </label>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-5">
        <h2 class="card-title text-lg">🎨 Тема</h2>
        <div class="flex gap-2">
          <button
            class="btn btn-outline"
            :class="{ 'btn-primary': settingsStore.theme === 'light' }"
            @click="settingsStore.setTheme('light')">
            ☀️ Светлая
          </button>
          <button
            class="btn btn-outline"
            :class="{ 'btn-primary': settingsStore.theme === 'dark' }"
            @click="settingsStore.setTheme('dark')">
            🌙 Тёмная
          </button>
        </div>
      </div>
    </div>

    <div class="card bg-base-100 shadow-sm border border-error/30">
      <div class="card-body p-5">
        <h2 class="card-title text-lg text-error">⚠️ Опасная зона</h2>
        <p class="text-sm text-base-content/70 mb-2">
          Удалить все контакты из приложения. Данные нельзя будет восстановить.
        </p>
        <button class="btn btn-error btn-outline btn-sm" @click="deleteAllContacts">
          Удалить все контакты
        </button>
      </div>
    </div>

    <div class="h-4"></div>
  </div>
</template>
