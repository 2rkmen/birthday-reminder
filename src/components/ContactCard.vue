<script setup>
import { computed } from 'vue'
import { calculateAge, daysUntilBirthday, isBirthdayToday, formatDate } from '../utils/birthday'

const props = defineProps({
  contact: { type: Object, required: true }
})

const emit = defineEmits(['edit', 'delete'])

const age = computed(() => calculateAge(props.contact.birthday))
const daysUntil = computed(() => props.contact.birthday ? daysUntilBirthday(props.contact.birthday) : null)
const isToday = computed(() => props.contact.birthday ? isBirthdayToday(props.contact.birthday) : false)
const formattedDate = computed(() => props.contact.birthday ? formatDate(props.contact.birthday) : '')
const hasBirthday = computed(() => !!props.contact.birthday)

const daysLabel = computed(() => {
  if (daysUntil.value === null) return ''
  if (daysUntil.value === 0) return '🎉 Сегодня!'
  if (daysUntil.value === 1) return 'Остался 1 день'
  if (daysUntil.value <= 7) return `Осталось ${daysUntil.value} дней`
  return `Через ${daysUntil.value} дней`
})

const isUpcoming = computed(() => {
  return daysUntil.value !== null && daysUntil.value <= 7
})

const ageLabel = computed(() => {
  if (age.value === null) return ''
  const word = getAgeWord(age.value)
  return `${age.value} ${word}`
})

function getAgeWord(years) {
  if (years % 10 === 1 && years % 100 !== 11) return 'год'
  if (years % 10 >= 2 && years % 10 <= 4 && (years % 100 < 10 || years % 100 >= 20)) return 'года'
  return 'лет'
}
</script>

<template>
  <div class="card bg-base-100 shadow-sm border border-base-200"
    :class="{
      'border-primary/30 bg-primary/5': isToday,
      'border-warning/30 bg-warning/5': isUpcoming && !isToday
    }">
    <div class="card-body p-4">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 min-w-0">
          <div class="avatar placeholder">
            <div class="w-10 h-10 rounded-full bg-primary text-primary-content text-lg font-bold"
              :class="{ 'bg-accent': isToday, 'bg-warning text-warning-content': isUpcoming && !isToday }">
              <span>{{ contact.name.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="min-w-0">
            <h3 class="font-semibold truncate">{{ contact.name }}</h3>
            <p v-if="hasBirthday" class="text-sm text-base-content/70">
              {{ formattedDate }}
              <span v-if="age !== null" class="ml-1">— {{ ageLabel }}</span>
            </p>
            <p v-else class="text-sm text-base-content/40">Дата не указана</p>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <div v-if="hasBirthday && daysUntil !== null" class="text-right">
            <span v-if="isToday" class="badge badge-accent badge-sm">Сегодня 🎉</span>
            <span v-else-if="isUpcoming" class="badge badge-warning badge-sm">{{ daysLabel }}</span>
            <span v-else class="text-xs text-base-content/50">{{ daysLabel }}</span>
          </div>
          <div class="join join-vertical">
            <button class="btn btn-ghost btn-xs join-item" @click="emit('edit', contact)" title="Редактировать">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button class="btn btn-ghost btn-xs join-item text-error" @click="emit('delete', contact)" title="Удалить">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
