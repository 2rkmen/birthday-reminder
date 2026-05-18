<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useContactsStore } from '../stores/contacts'
import { useSettingsStore } from '../stores/settings'
import { daysUntilBirthday } from '../utils/birthday'
import ContactCard from '../components/ContactCard.vue'
import BirthdayPrompt from '../components/BirthdayPrompt.vue'
import ImportModal from '../components/ImportModal.vue'

const router = useRouter()
const contactsStore = useContactsStore()
const settingsStore = useSettingsStore()

const showImport = ref(false)
const searchQuery = ref('')

onMounted(async () => {
  if (!settingsStore.loaded) {
    await settingsStore.loadSettings()
  }
  await contactsStore.loadContacts()
})

const todayBirthdays = computed(() =>
  contactsStore.contacts.filter(c => c.birthday && daysUntilBirthday(c.birthday) === 0)
)

const upcomingBirthdays = computed(() =>
  contactsStore.contacts.filter(c => {
    if (!c.birthday) return false
    const days = daysUntilBirthday(c.birthday)
    return days > 0 && days <= 7
  })
)

const upcomingSoon = computed(() =>
  contactsStore.contacts.filter(c => {
    if (!c.birthday) return false
    const days = daysUntilBirthday(c.birthday)
    return days > 7 && days <= 30
  })
)

const otherContacts = computed(() =>
  contactsStore.contacts.filter(c => {
    if (!c.birthday) return false
    const days = daysUntilBirthday(c.birthday)
    return days === null || days > 30
  })
)

const filteredOther = computed(() => {
  if (!searchQuery.value) return otherContacts.value
  const q = searchQuery.value.toLowerCase()
  return otherContacts.value.filter(c => c.name.toLowerCase().includes(q))
})

const noBirthdayContacts = computed(() =>
  contactsStore.contacts.filter(c => !c.birthday)
)

function handleEdit(contact) {
  router.push({ name: 'edit', params: { id: contact.id } })
}

async function handleDelete(contact) {
  if (confirm(`Удалить контакт "${contact.name}"?`)) {
    await contactsStore.deleteContact(contact.id)
  }
}
</script>

<template>
  <div class="p-4 space-y-4 max-w-2xl mx-auto pb-24 md:pb-8">
    <div v-if="!settingsStore.contactsImported && !showImport" class="card bg-primary text-primary-content shadow-lg">
      <div class="card-body p-5">
        <h2 class="card-title">👋 Добро пожаловать!</h2>
        <p class="text-sm opacity-90">Импортируйте контакты из телефонной книги, чтобы начать отслеживать дни рождения.</p>
        <div class="card-actions mt-2">
          <button class="btn btn-accent" @click="showImport = true">Импортировать контакты</button>
          <button class="btn btn-ghost btn-outline btn-sm" @click="router.push('/add')">Добавить вручную</button>
        </div>
      </div>
    </div>

    <ImportModal
      v-if="showImport"
      @close="showImport = false"
      @done="showImport = false" />

    <BirthdayPrompt :contacts="contactsStore.contacts" />

    <div v-if="contactsStore.loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg text-primary"></span>
    </div>

    <template v-if="!contactsStore.loading && contactsStore.contacts.length > 0">
      <div v-if="todayBirthdays.length > 0">
        <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
          <span>🎉 Сегодня</span>
          <span class="badge badge-accent badge-sm">{{ todayBirthdays.length }}</span>
        </h2>
        <div class="space-y-2">
          <ContactCard
            v-for="c in todayBirthdays"
            :key="c.id"
            :contact="c"
            @edit="handleEdit"
            @delete="handleDelete" />
        </div>
      </div>

      <div v-if="upcomingBirthdays.length > 0">
        <h2 class="text-lg font-bold mb-2 flex items-center gap-2">
          <span>📅 На этой неделе</span>
          <span class="badge badge-warning badge-sm">{{ upcomingBirthdays.length }}</span>
        </h2>
        <div class="space-y-2">
          <ContactCard
            v-for="c in upcomingBirthdays"
            :key="c.id"
            :contact="c"
            @edit="handleEdit"
            @delete="handleDelete" />
        </div>
      </div>

      <div v-if="upcomingSoon.length > 0">
        <h2 class="text-lg font-bold mb-2">🗓 В ближайший месяц</h2>
        <div class="space-y-2">
          <ContactCard
            v-for="c in upcomingSoon"
            :key="c.id"
            :contact="c"
            @edit="handleEdit"
            @delete="handleDelete" />
        </div>
      </div>

      <div v-if="filteredOther.length > 0 || noBirthdayContacts.length > 0">
        <h2 class="text-lg font-bold mb-2">Все контакты</h2>

        <label v-if="otherContacts.length > 10" class="input input-bordered input-sm flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
          </svg>
          <input v-model="searchQuery" type="text" class="grow" placeholder="Поиск..." />
        </label>

        <div class="space-y-2">
          <ContactCard
            v-for="c in filteredOther"
            :key="c.id"
            :contact="c"
            @edit="handleEdit"
            @delete="handleDelete" />
        </div>
      </div>
    </template>

    <div v-if="!contactsStore.loading && contactsStore.contacts.length === 0 && settingsStore.contactsImported" class="text-center py-12">
      <div class="text-5xl mb-4">📭</div>
      <h3 class="text-lg font-semibold mb-1">Нет контактов</h3>
      <p class="text-sm text-base-content/60 mb-4">Добавьте первый контакт вручную или импортируйте из телефонной книги</p>
      <div class="flex gap-2 justify-center">
        <button class="btn btn-primary" @click="router.push('/add')">Добавить контакт</button>
        <button class="btn btn-outline" @click="showImport = true">Импортировать</button>
      </div>
    </div>
  </div>
</template>
