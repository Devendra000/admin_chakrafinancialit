"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { fetchClients, createClient, updateClient, deleteClient } from "@/lib/api/clients"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Mail, Phone, DollarSign, MoreHorizontal, Edit, Trash2, Eye, Calendar } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

type Client = {
  _id: string
  name: string
  email: string
  phone?: string
  company?: string
  services: string[]
  status: 'lead' | 'active' | 'inactive' | 'converted'
  source: string
  assignedTo?: string
  notes?: string
  contactDate: string
  lastContact?: string
  nextFollowUp?: string
  value?: number
  createdAt: string
  updatedAt: string
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientList, setClientList] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null)
  const { toast } = useToast()

  // Fetch clients on component mount
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setLoading(true)
      setError(null)
      const clients = await fetchClients()
      setClientList(clients)
    } catch (err: any) {
      setError(err.message || 'Failed to load clients')
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clientList.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || client.status.toLowerCase() === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "lead":
        return "bg-blue-100 text-blue-800"
      case "converted":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (value?: number) => {
    if (!value) return '$0'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Calculate real statistics from client data
  const calculateStats = () => {
    const totalClients = clientList.length
    const activeClients = clientList.filter(client => client.status === 'active').length
    const leadClients = clientList.filter(client => client.status === 'lead').length
    const totalValue = clientList.reduce((sum, client) => sum + (client.value || 0), 0)
    
    // Calculate new leads this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const newLeadsThisMonth = clientList.filter(client => {
      const clientDate = new Date(client.contactDate)
      return clientDate.getMonth() === currentMonth && 
             clientDate.getFullYear() === currentYear &&
             client.status === 'lead'
    }).length

    return {
      totalClients,
      activeClients,
      leadClients,
      newLeadsThisMonth,
      totalValue,
      activePercentage: totalClients > 0 ? ((activeClients / totalClients) * 100).toFixed(1) : '0'
    }
  }

  const stats = calculateStats()

  const handleViewClient = (client: Client) => {
    setSelectedClient(client)
    setIsViewDialogOpen(true)
  }

  const handleEditClient = (client: Client) => {
    setSelectedClient(client)
    setIsEditDialogOpen(true)
  }

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return
    
    try {
      await deleteClient(clientToDelete._id)
      setClientList(prevClients => prevClients.filter(client => client._id !== clientToDelete._id))
      toast({
        title: "Success",
        description: "Client deleted successfully!",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete client: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setClientToDelete(null)
    }
  }

  const handleAddClient = async (formData: FormData) => {
    try {
      const clientData = {
        name: `${formData.get('firstName')} ${formData.get('lastName')}`.trim(),
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        company: formData.get('company') as string,
        status: formData.get('status') as string,
        source: formData.get('source') || 'Manual Entry',
        notes: formData.get('notes') as string,
        value: formData.get('value') ? parseFloat(formData.get('value') as string) : 0,
        services: [], // You can enhance this to handle services
      }
      
      const newClient = await createClient(clientData)
      setClientList(prevClients => [newClient, ...prevClients])
      setIsAddDialogOpen(false)
      toast({
        title: "Success",
        description: "Client added successfully!",
        variant: "default",
      })
    } catch (error: any) {
      let description = "Failed to add client: " + error.message
      if (error?.response?.data?.details) {
        description += "\n" + error.response.data.details.join("\n")
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      })
    }
  }

  const handleUpdateClient = async (formData: FormData) => {
    if (!selectedClient) return
    
    try {
      const clientData = {
        name: `${formData.get('editFirstName')} ${formData.get('editLastName')}`.trim(),
        email: formData.get('editEmail') as string,
        phone: formData.get('editPhone') as string,
        status: formData.get('editStatus') as string,
        notes: formData.get('editNotes') as string,
        value: formData.get('editValue') ? parseFloat(formData.get('editValue') as string) : 0,
      }
      
      const updatedClient = await updateClient(selectedClient._id, clientData)
      setClientList(prevClients => 
        prevClients.map(client => 
          client._id === selectedClient._id ? updatedClient : client
        )
      )
      setIsEditDialogOpen(false)
      setSelectedClient(null)
      toast({
        title: "Success",
        description: "Client updated successfully!",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update client: " + error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Client Management" description="Manage your client relationships and conversion opportunities" />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">Clients</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client profile with their contact information and service preferences.
              </DialogDescription>
            </DialogHeader>
            <form className="grid gap-4 py-4" onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              await handleAddClient(formData);
            }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" placeholder="Enter first name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" placeholder="Enter last name" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="Enter email address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" placeholder="Enter phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <Input id="source" name="source" placeholder="How did the client find us? (e.g. Website, Referral)" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="lead">
                    <SelectTrigger>
                      <SelectValue placeholder="Select client status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="converted">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="value">Potential Value ($)</Label>
                  <Input id="value" name="value" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" placeholder="Add any additional notes about the client" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Client
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Client Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Client Details</DialogTitle>
              <DialogDescription>
                View detailed information about this client.
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/admin-avatar.png" />
                    <AvatarFallback className="text-lg">
                      {selectedClient.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedClient.name}</h3>
                    <Badge className={getStatusColor(selectedClient.status)}>
                      {selectedClient.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm">{selectedClient.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                    <p className="text-sm">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Date</Label>
                    <p className="text-sm">{formatDate(selectedClient.contactDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Potential Value</Label>
                    <p className="text-sm">{formatCurrency(selectedClient.value)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Last Contact</Label>
                    <p className="text-sm">{selectedClient.lastContact}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Services</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedClient.services.length > 0 ? (
                      selectedClient.services.map((service: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {service}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No services assigned</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                selectedClient && handleEditClient(selectedClient)
              }}>
                Edit Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
              <DialogDescription>
                Update client information and service preferences.
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <form className="grid gap-4 py-4" onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const formData = new FormData(form);
                await handleUpdateClient(formData);
              }}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editFirstName">First Name</Label>
                    <Input 
                      id="editFirstName" 
                      name="editFirstName"
                      defaultValue={selectedClient.name.split(' ')[0]} 
                      placeholder="Enter first name" 
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editLastName">Last Name</Label>
                    <Input 
                      id="editLastName" 
                      name="editLastName"
                      defaultValue={selectedClient.name.split(' ').slice(1).join(' ')} 
                      placeholder="Enter last name" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editEmail">Email</Label>
                  <Input 
                    id="editEmail" 
                    name="editEmail"
                    type="email" 
                    defaultValue={selectedClient.email}
                    placeholder="Enter email address" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input 
                    id="editPhone" 
                    name="editPhone"
                    defaultValue={selectedClient.phone}
                    placeholder="Enter phone number" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editStatus">Status</Label>
                    <Select name="editStatus" defaultValue={selectedClient.status.toLowerCase()}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editValue">Potential Value ($)</Label>
                    <Input 
                      id="editValue" 
                      name="editValue"
                      type="number" 
                      step="0.01" 
                      min="0" 
                      defaultValue={selectedClient.value || 0}
                      placeholder="0.00" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editNotes">Notes</Label>
                  <Textarea 
                    id="editNotes" 
                    name="editNotes" 
                    defaultValue={selectedClient.notes}
                    placeholder="Add any additional notes about the client" 
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {clientToDelete?.name}? This action cannot be undone.
                All client data, including contact history and notes, will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false)
                setClientToDelete(null)
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteClient}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Delete Client
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Badge variant="secondary">{stats.totalClients}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-gray-600">All registered clients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {stats.activeClients}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeClients}</div>
            <p className="text-xs text-gray-600">{stats.activePercentage}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {stats.newLeadsThisMonth}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newLeadsThisMonth}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-gray-600">Portfolio value</p>
          </CardContent>
        </Card>
      </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="lead">Lead</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="converted">Converted</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">Loading clients...</div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error: {error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadClients}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Client Table */}
        {!loading && !error && (
          <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/admin-avatar.png" />
                        <AvatarFallback className="text-xs">
                          {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{client.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-3 w-3 mr-1" />
                        {client.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.services.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {client.services.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{client.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                      {formatCurrency(client.value)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(client.contactDate)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewClient(client)}
                        title="View Client"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditClient(client)}
                        title="Edit Client"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteClient(client)}
                        title="Delete Client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
