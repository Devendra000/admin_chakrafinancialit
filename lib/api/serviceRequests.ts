export async function fetchServiceRequests(params?: Record<string, any>) {
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
    if (params?.packageType && params.packageType !== 'all') queryParams.set('packageType', params.packageType)
    
    const res = await fetch(`/api/service-requests?${queryParams.toString()}`)
    const json = await res.json()
    
    if (!json.success) {
      throw new Error(json.error || 'Failed to fetch service requests')
    }
    
    return json.data
  } catch (err: any) {
    console.error('fetchServiceRequests error:', err)
    throw new Error(err.message || 'Failed to fetch service requests')
  }
}

export async function fetchServiceRequestStats() {
  try {
    const res = await fetch('/api/service-requests/stats')
    const json = await res.json()
    if (!json.success) throw new Error(json.error || 'Failed to fetch stats')
    return json.data
  } catch (err: any) {
    console.error('fetchServiceRequestStats error:', err)
    throw new Error(err.message || 'Failed to fetch service request stats')
  }
}

export async function updateServiceRequestStatus(id: string, status: string) {
  try {
    const res = await fetch(`/api/service-requests/${id}`, {
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
    console.error('updateServiceRequestStatus error:', err)
    throw new Error(err.message || 'Failed to update service request status')
  }
}
