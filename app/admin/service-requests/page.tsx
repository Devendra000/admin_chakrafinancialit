"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { fetchServiceRequests } from '@/lib/api/serviceRequests'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Eye, Clock, Mail, Phone, User, Package, AlertTriangle } from 'lucide-react'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export default function ServiceRequestsPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selected, setSelected] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchServiceRequests({ 
        page: String(currentPage), 
        limit: String(itemsPerPage), 
        search: searchTerm 
      })
      setItems(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.total || 0)
    } catch (err: any) {
      console.error('Error loading service requests:', err)
      setError(err.message || 'Failed to load service requests')
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'secondary'
      case 'contacted': return 'default'
      case 'completed': return 'default'
      case 'cancelled': return 'destructive'
      default: return 'outline'
    }
  }

  const getPackageTypeBadgeVariant = (packageType: string) => {
    switch (packageType?.toLowerCase()) {
      case 'basic': return 'outline'
      case 'standard': return 'secondary'
      case 'premium': return 'default'
      default: return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Service Requests" description="Incoming service requests" />
      <main className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">Service Requests</CardTitle>
              <p className="text-muted-foreground mt-1">
                {loading ? 'Loading...' : `${totalItems} total requests`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search requests..." 
                  value={searchTerm} 
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="pl-10 w-[300px]"
                />
              </div>
              {searchTerm && (
                <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setCurrentPage(1) }}>
                  Clear
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-[200px]" />
                    <Skeleton className="h-10 w-[150px]" />
                    <Skeleton className="h-10 w-[100px]" />
                    <Skeleton className="h-10 w-[120px]" />
                    <Skeleton className="h-10 flex-1" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Failed to load requests</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No service requests found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Service requests will appear here when submitted'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Contact</TableHead>
                      <TableHead className="w-[180px]">Service & Package</TableHead>
                      <TableHead className="w-[300px]">Message Preview</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[80px]">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((row) => (
                      <TableRow
                        key={row._id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelected(row)
                          setIsDialogOpen(true)
                        }}
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium truncate">{row.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{row.email}</span>
                            </div>
                            {row.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{row.phone}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="font-medium text-sm truncate" title={row.serviceName}>
                              {row.serviceName}
                            </div>
                            <Badge variant={getPackageTypeBadgeVariant(row.packageType)} className="text-xs">
                              {row.packageName}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[280px]">
                            <p className="text-sm line-clamp-2 text-muted-foreground">
                              {row.message || 'No message provided'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(row.status)}>
                            {row.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(row.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            {row.isEmailSent ? (
                              <Badge variant="default" className="text-xs">
                                Sent
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage > 1) setCurrentPage(currentPage - 1)
                        }}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === page}
                          onClick={(e) => {
                            e.preventDefault()
                            setCurrentPage(page)
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                        }}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            {/* Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Service Request Details</DialogTitle>
                  <DialogDescription>Full details for the selected service inquiry</DialogDescription>
                </DialogHeader>
                {selected ? (
                  <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                        <div className="font-medium">{selected.name}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                        <div className="font-medium">{selected.email}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                        <div>{selected.phone}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                        <div>{selected.serviceName} ({selected.serviceId})</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Package</h4>
                        <div>{selected.packageName} ({selected.packageType})</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                        <div>{selected.status}</div>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                        <div className="whitespace-pre-wrap">{selected.message}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Email Sent</h4>
                        <div>{selected.isEmailSent ? `Yes (${selected.emailSentAt ? new Date(selected.emailSentAt).toLocaleString() : ''})` : 'No'}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Received</h4>
                        <div>{new Date(selected.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>No item selected</p>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
