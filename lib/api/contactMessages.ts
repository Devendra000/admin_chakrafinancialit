export async function fetchContactMessages(params?: Record<string, any>) {
  try {
    const q = params ? `?${new URLSearchParams(params).toString()}` : ''
    const res = await fetch(`/api/contact-messages${q}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch contact messages')
    return json.data
  } catch (err) {
    console.error('fetchContactMessages error', err)
    throw err
  }
}

export async function fetchContactMessagesStats() {
  try {
    const res = await fetch('/api/contact-messages/stats')
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats')
    return json.data
  } catch (err) {
    console.error('fetchContactMessagesStats error', err)
    throw err
  }
}
