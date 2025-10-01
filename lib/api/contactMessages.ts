export async function fetchContactMessages(params?: Record<string, any>) {
  try {
    const queryParams = new URLSearchParams()
    
    // Default parameters
    queryParams.set('page', params?.page || '1')
    queryParams.set('limit', params?.limit || '10')
    queryParams.set('sortBy', params?.sortBy || 'createdAt')
    queryParams.set('sortOrder', params?.sortOrder || 'desc')
    
    // Optional parameters
    if (params?.search) queryParams.set('search', params.search)
    if (params?.status && params.status !== 'all') queryParams.set('status', params.status)
    if (params?.priority && params.priority !== 'all') queryParams.set('priority', params.priority)
    if (params?.service && params.service !== 'all') queryParams.set('service', params.service)
    
    const res = await fetch(`/api/contact-messages?${queryParams.toString()}`)
    const json = await res.json()
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch contact messages')
    }
    
    return json.data
  } catch (err: any) {
    console.error('fetchContactMessages error:', err)
    throw new Error(err.message || 'Failed to fetch contact messages')
  }
}

export async function fetchContactMessagesStats() {
  try {
    const res = await fetch('/api/contact-messages/stats')
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats')
    return json.data
  } catch (err: any) {
    console.error('fetchContactMessagesStats error:', err)
    throw new Error(err.message || 'Failed to fetch contact message stats')
  }
}

export async function updateContactMessageStatus(id: string, status: string) {
  try {
    const res = await fetch(`/api/contact-messages/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    const json = await res.json()
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to update status')
    }
    
    return json.data
  } catch (err: any) {
    console.error('updateContactMessageStatus error:', err)
    throw new Error(err.message || 'Failed to update contact message status')
  }
}
