const CONTACTS_API_SUPPORTED = 'contacts' in navigator && 'ContactsManager' in window

export async function canImportContacts() {
  return CONTACTS_API_SUPPORTED
}

export async function requestContactsPermission() {
  if (!CONTACTS_API_SUPPORTED) return false
  try {
    const props = await navigator.contacts.getProperties()
    return props.includes('name')
  } catch {
    return false
  }
}

export async function importContactsFromDevice() {
  if (!CONTACTS_API_SUPPORTED) {
    throw new Error('API контактов не поддерживается')
  }
  const contacts = await navigator.contacts.select(['name'], { multiple: true })
  return contacts
    .filter(c => c.name && c.name.length > 0 && c.name[0].trim())
    .map(c => ({
      name: c.name[0].trim(),
      hasPhone: false,
      imported: true,
      createdAt: Date.now()
    }))
}
