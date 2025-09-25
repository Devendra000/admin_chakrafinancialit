"use client"

import React, { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ServiceForm from "@/components/ServiceForm"
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react"

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingService, setEditingService] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/services')
        const result = await res.json()
        if (result.success) {
          setServices(result.data?.services || [])
        } else {
          setError(result.error || 'Failed to fetch services')
        }
      } catch (err) {
        setError('Failed to fetch services')
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  const filteredServices = (services || []).filter(
    (service) =>
      service?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // CRUD actions using API
  const handleCreateService = async (serviceData: any) => {
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      })
      const result = await res.json()
      if (result.success) {
        setServices([...services, result.data])
        setShowServiceForm(false)
        setEditingService(null)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Failed to create service' }
      }
    } catch {
      return { success: false, error: 'Failed to create service' }
    }
  }

  const handleEditService = async (serviceData: any) => {
    try {
      const res = await fetch(`/api/services/${serviceData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceData)
      })
      const result = await res.json()
      if (result.success) {
        setServices(
          services.map((service) =>
            service._id === serviceData._id ? result.data : service
          )
        )
        setShowServiceForm(false)
        setEditingService(null)
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Failed to update service' }
      }
    } catch {
      return { success: false, error: 'Failed to update service' }
    }
  }

  const handleDeleteService = async (_id: string) => {
    try {
      const res = await fetch(`/api/services/${_id}`, { method: 'DELETE' })
      const result = await res.json()
      if (result.success) {
        setServices(services.filter((service) => service._id !== _id))
      }
    } catch {}
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Services Management" description="Manage your financial services and offerings" />
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Services</h2>
          <Button onClick={() => { setShowServiceForm(true); setEditingService(null); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Service
          </Button>
        </div>
        {showServiceForm && (
          <div className="mb-6">
            <ServiceForm
              service={editingService}
              onSubmit={editingService ? handleEditService : handleCreateService}
              onCancel={() => { setShowServiceForm(false); setEditingService(null); }}
              isLoading={loading}
            />
          </div>
        )}
        <div className="mb-4 max-w-sm">
          <Input
            placeholder="Search services by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading services...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtext</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>{service.title}</TableCell>
                    <TableCell>{service.subtext}</TableCell>
                    <TableCell>{service.icon}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => { setEditingService(service); setShowServiceForm(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDeleteService(service._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  )
}
