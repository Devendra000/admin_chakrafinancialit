// API functions for client operations

export async function fetchClients() {
  try {
    const response = await fetch('/api/clients');
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch clients');
    }
    
    return result.data.clients || result.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
}

export async function createClient(clientData: any) {
  try {
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create client');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
}

export async function updateClient(clientId: string, clientData: any) {
  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientData),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update client');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

export async function deleteClient(clientId: string) {
  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete client');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}