export async function fetchServiceRequests(params?: Record<string, any>) {
  try {
    const q = params ? `?${new URLSearchParams(params).toString()}` : ''
    const res = await fetch(`/api/service-requests${q}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch service requests')
    return json.data
  } catch (err) {
    console.error('fetchServiceRequests error', err)
    throw err
  }
}

export async function fetchServiceRequestStats() {
  try {
    const res = await fetch('/api/service-requests/stats')
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats')
    return json.data
  } catch (err) {
    console.error('fetchServiceRequestStats error', err)
    throw err
  }
}
