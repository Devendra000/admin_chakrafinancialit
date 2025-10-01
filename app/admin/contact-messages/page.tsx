"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { fetchContactMessages } from '@/lib/api/contactMessages'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Clock, Mail, Phone, User, Building, MessageSquare, AlertTriangle, Tag } from 'lucide-react'
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

export default function ContactMessagesPage() {
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
      const data = await fetchContactMessages({ 
        page: String(currentPage), 
        limit: String(itemsPerPage), 
        search: searchTerm 
      })
      setItems(data.items || [])
      setTotalPages(data.pagination?.totalPages || 1)
      setTotalItems(data.pagination?.total || 0)
    } catch (err: any) {
      console.error('Error loading contact messages:', err)
      setError(err.message || 'Failed to load contact messages')
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
      case 'new': return 'destructive'
      case 'read': return 'secondary'
      case 'replied': return 'default'
      case 'resolved': return 'default'
      case 'archived': return 'outline'
      default: return 'outline'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'secondary'
      case 'low': return 'outline'
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

  const formatService = (service: string) => {
    switch (service?.toLowerCase()) {
      case 'financial': return 'Financial Services'
      case 'it-solutions': return 'IT Solutions'
      case 'both': return 'Financial & IT'
      case 'consultation': return 'Consultation'
      default: return service || 'General Inquiry'
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Contact Messages" description="Incoming messages from the contact form" />
      <main className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-2xl font-bold">Contact Messages</CardTitle>
              <p className="text-muted-foreground mt-1">
                {loading ? 'Loading...' : `${totalItems} total messages`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Search messages..." 
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
                <h3 className="text-lg font-semibold mb-2">Failed to load messages</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadData} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No contact messages found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Contact messages will appear here when submitted'}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Contact</TableHead>
                      <TableHead className="w-[150px]">Service Interest</TableHead>
                      <TableHead className="w-[300px]">Message Preview</TableHead>
                      <TableHead className="w-[100px]">Priority</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[120px]">Tags</TableHead>
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
                            {row.company && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building className="h-3 w-3" />
                                <span className="truncate">{row.company}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {formatService(row.service)}
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
                          <Badge variant={getPriorityBadgeVariant(row.priority)} className="text-xs">
                            {row.priority || 'medium'}
                          </Badge>
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
                          <div className="flex flex-wrap gap-1">
                            {row.tags?.slice(0, 2).map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {row.tags?.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{row.tags.length - 2}
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
                  <DialogTitle>Contact Message Details</DialogTitle>
                  <DialogDescription>Full details for the selected contact message</DialogDescription>
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
                        <h4 className="text-sm font-medium text-muted-foreground">Company</h4>
                        <div>{selected.company}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Service</h4>
                        <div>{selected.service}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Priority</h4>
                        <div>{selected.priority}</div>
                      </div>
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                        <div className="whitespace-pre-wrap">{selected.message}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Received</h4>
                        <div>{new Date(selected.createdAt).toLocaleString()}</div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">IP</h4>
                        <div>{selected.ipAddress}</div>
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
