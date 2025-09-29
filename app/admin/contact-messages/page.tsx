"use client"

import React, { useEffect, useState } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { fetchContactMessages } from '@/lib/api/contactMessages'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1)
  const [selected, setSelected] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const data = await fetchContactMessages({ page: String(currentPage), limit: String(itemsPerPage), search: searchTerm })
        if (!mounted) return
        setItems(data.items || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [currentPage, searchTerm])

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Contact Messages" description="Incoming messages from the contact form" />
      <main className="p-6">
        <Card>
          <CardHeader className="flex items-center justify-between gap-4">
            <CardTitle>Contact Messages</CardTitle>
            <div className="flex items-center gap-2">
              <Input placeholder="Search by name, email or message" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} />
              <Button variant="secondary" onClick={() => { setSearchTerm(''); setCurrentPage(1) }}>
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading…</p>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((row) => (
                      <TableRow key={row._id} className="cursor-pointer hover:bg-muted" onClick={() => { setSelected(row); setIsDialogOpen(true) }}>
                        <TableCell>{row.name}</TableCell>
                        <TableCell>{row.email}</TableCell>
                        <TableCell>{row.phone}</TableCell>
                        <TableCell>{row.company}</TableCell>
                        <TableCell>{row.service}</TableCell>
                        <TableCell>{row.priority}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{new Date(row.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{row.status}</TableCell>
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
