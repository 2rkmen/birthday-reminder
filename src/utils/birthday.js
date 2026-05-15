export function calculateAge(birthday) {
  if (!birthday) return null
  const parts = birthday.split('-')
  if (parts.length !== 3) return null
  const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export function daysUntilBirthday(birthday) {
  if (!birthday) return null
  const parts = birthday.split('-')
  const today = new Date()
  const currentYear = today.getFullYear()
  let nextBirthday = new Date(currentYear, parseInt(parts[1]) - 1, parseInt(parts[2]))
  if (nextBirthday < today) {
    nextBirthday = new Date(currentYear + 1, parseInt(parts[1]) - 1, parseInt(parts[2]))
  }
  const diffTime = nextBirthday - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isBirthdayToday(birthday) {
  if (!birthday) return false
  return daysUntilBirthday(birthday) === 0
}

export function formatDate(birthday) {
  if (!birthday) return ''
  const parts = birthday.split('-')
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]))
  return `${date.getDate()} ${months[date.getMonth()]}`
}

export function sortByNearestBirthday(contacts) {
  return [...contacts].sort((a, b) => {
    const daysA = a.birthday ? daysUntilBirthday(a.birthday) : 999
    const daysB = b.birthday ? daysUntilBirthday(b.birthday) : 999
    return daysA - daysB
  })
}

export function getNextBirthdayDate(birthday) {
  if (!birthday) return null
  const parts = birthday.split('-')
  const today = new Date()
  const currentYear = today.getFullYear()
  let next = new Date(currentYear, parseInt(parts[1]) - 1, parseInt(parts[2]))
  if (next < today) {
    next = new Date(currentYear + 1, parseInt(parts[1]) - 1, parseInt(parts[2]))
  }
  return next
}
