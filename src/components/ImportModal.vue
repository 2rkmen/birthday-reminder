<script setup>
import { ref } from 'vue'
import { useContactsStore } from '../stores/contacts'
import { useSettingsStore } from '../stores/settings'
import { canImportContacts, importContactsFromDevice } from '../utils/contacts'

const emit = defineEmits(['close', 'done'])
const contactsStore = useContactsStore()
const settingsStore = useSettingsStore()

const loading = ref(false)
const result = ref(null)
const error = ref(null)
const supported = ref(null)

async function checkSupport() {
  supported.value = await canImportContacts()
  return supported.value
}

async function startImport() {
  loading.value = true
  error.value = null
  result.value = null
  try {
    const contacts = await importContactsFromDevice()
    const count = await contactsStore.importContacts(contacts)
    await settingsStore.setContactsImported(true)
    result.value = { total: contacts.length, imported: count }
    emit('done')
  } catch (e) {
    if (e.name === 'NotSupportedError') {
      error.value = 'API контактов не поддерживается на этом устройстве'
    } else if (e.name === 'NotAllowedError') {
      error.value = 'Доступ к контактам запрещён'
    } else {
      error.value = e.message || 'Ошибка при импорте'
    }
  } finally {
    loading.value = false
  }
}

checkSupport()
</script>

<template>
  <div class="card bg-base-100 shadow-xl border border-base-200">
    <div class="card-body p-5">
      <h2 class="card-title text-lg">📱 Импорт контактов</h2>

      <p class="text-sm text-base-content/70">
        Приложение может импортировать контакты из телефонной книги.
        Будут импортированы только контакты с именем (номера без имени пропускаются).
      </p>

      <div v-if="supported === false" class="alert alert-warning">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <span>Импорт контактов доступен только на Android через Chrome. Откройте это приложение на Android-устройстве.</span>
      </div>

      <div v-if="result" class="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <span>Импортировано {{ result.imported }} из {{ result.total }} контактов (остальные уже были в списке)</span>
      </div>

      <div v-if="error" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <span>{{ error }}</span>
      </div>

      <div class="card-actions justify-end mt-2">
        <button class="btn btn-ghost" @click="emit('close')">Закрыть</button>
        <button
          v-if="!result"
          class="btn btn-primary"
          :class="{ 'loading': loading }"
          :disabled="loading || supported === false"
          @click="startImport">
          {{ loading ? 'Импорт...' : 'Импортировать контакты' }}
        </button>
      </div>
    </div>
  </div>
</template>
