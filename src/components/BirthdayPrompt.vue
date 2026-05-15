<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  contacts: { type: Array, required: true }
})

const router = useRouter()

const noBirthdayContacts = computed(() =>
  props.contacts.filter(c => !c.birthday)
)

function goToAdd(name) {
  router.push({ name: 'add', query: { name } })
}
</script>

<template>
  <div v-if="noBirthdayContacts.length > 0" class="card bg-base-100 shadow-sm border border-base-200">
    <div class="card-body p-4">
      <h2 class="card-title text-base">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-warning" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        У {{ noBirthdayContacts.length }} {{ noBirthdayContacts.length === 1 ? 'контакта' : 'контактов' }} не указана дата рождения
      </h2>
      <div class="flex flex-wrap gap-2 mt-1">
        <button
          v-for="c in noBirthdayContacts.slice(0, 10)"
          :key="c.id"
          class="btn btn-outline btn-xs gap-1"
          @click="goToAdd(c.name)">
          {{ c.name }}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
        <span v-if="noBirthdayContacts.length > 10" class="text-xs text-base-content/50 self-center">
          и ещё {{ noBirthdayContacts.length - 10 }}
        </span>
      </div>
    </div>
  </div>
</template>
