<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContactsStore } from '../stores/contacts'

const route = useRoute()
const router = useRouter()
const contactsStore = useContactsStore()

const isEdit = computed(() => !!route.params.id)

const form = ref({
  name: '',
  birthday: ''
})

const saving = ref(false)
const error = ref('')

onMounted(() => {
  if (route.query.name) {
    form.value.name = route.query.name
  }
  if (isEdit.value) {
    const contact = contactsStore.getContactById(route.params.id)
    if (contact) {
      form.value.name = contact.name
      form.value.birthday = contact.birthday || ''
    } else {
      router.push('/')
    }
  }
})

function validate() {
  if (!form.value.name.trim()) {
    error.value = 'Введите имя'
    return false
  }
  if (!form.value.birthday) {
    error.value = 'Выберите дату рождения'
    return false
  }
  return true
}

async function save() {
  error.value = ''
  if (!validate()) return

  saving.value = true
  try {
    if (isEdit.value) {
      await contactsStore.updateContact(Number(route.params.id), {
        name: form.value.name.trim(),
        birthday: form.value.birthday
      })
    } else {
      await contactsStore.addContact({
        name: form.value.name.trim(),
        birthday: form.value.birthday,
        hasPhone: false,
        imported: false
      })
    }
    router.push('/')
  } catch (e) {
    error.value = 'Ошибка при сохранении'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-4 max-w-lg mx-auto pb-24 md:pb-8">
    <div class="card bg-base-100 shadow-sm border border-base-200">
      <div class="card-body p-5">
        <h1 class="card-title text-xl mb-2">
          {{ isEdit ? '✏️ Редактировать контакт' : '➕ Добавить контакт' }}
        </h1>

        <form @submit.prevent="save" class="space-y-4">
          <fieldset class="fieldset">
            <legend class="fieldset-legend text-sm">Имя</legend>
            <input
              v-model="form.name"
              type="text"
              class="input input-bordered w-full"
              placeholder="Иван Иванов"
              required />
          </fieldset>

          <fieldset class="fieldset">
            <legend class="fieldset-legend text-sm">Дата рождения</legend>
            <input
              v-model="form.birthday"
              type="date"
              class="input input-bordered w-full"
              required />
          </fieldset>

          <div v-if="error" class="alert alert-error py-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <span>{{ error }}</span>
          </div>

          <div class="card-actions justify-end">
            <button type="button" class="btn btn-ghost" @click="router.push('/')">Отмена</button>
            <button type="submit" class="btn btn-primary" :class="{ 'loading': saving }" :disabled="saving">
              {{ saving ? 'Сохранение...' : (isEdit ? 'Сохранить' : 'Добавить') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
