import { daysUntilBirthday } from './birthday'

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function showBirthdayNotification(contact) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const days = contact.birthday ? daysUntilBirthday(contact.birthday) : null
  let body = ''

  if (days === 0) {
    const age = calculateAgeForNotif(contact.birthday)
    body = age !== null ? `🎉 Сегодня ${contact.name} исполняется ${age} лет!` : `🎉 Сегодня день рождения у ${contact.name}!`
  } else if (days !== null && days <= 7) {
    body = `Через ${days} ${days === 1 ? 'день' : 'дней'} день рождения у ${contact.name}`
  } else {
    return
  }

  const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.ready : null
  if (registration) {
    registration.showNotification('🎂 День рождения', {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: `birthday-${contact.id}`,
      data: { contactId: contact.id, url: '/' }
    })
  }
}

function calculateAgeForNotif(birthday) {
  if (!birthday) return null
  const parts = birthday.split('-')
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export async function checkBirthdaysAndNotify(contacts) {
  const hasPermission = await requestNotificationPermission()
  if (!hasPermission) return

  const promises = contacts
    .filter(c => c.birthday)
    .map(c => showBirthdayNotification(c))
  await Promise.all(promises)
}
