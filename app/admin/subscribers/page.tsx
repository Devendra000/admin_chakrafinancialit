"use client"

import { useState, useEffect } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import {
  Search,
  Download,
  Mail,
  MoreHorizontal,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Eye,
  Trash2,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface Subscriber {
  _id: string
  email: string
  firstName: string
  lastName: string
  status: "active" | "inactive" | "unsubscribed"
  source: string
  subscribedAt: string
  lastEngagement: string
  engagementScore: number
  location: string
  interests: string[]
  emailOpens: number
  emailClicks: number
  emailsSent: number
}

interface SubscriberStats {
  total: number
  active: number
  inactive: number
  unsubscribed: number
  newThisMonth: number
  growthRate: number
}

interface SubscriberData {
  stats: SubscriberStats
  growthData: { month: string; subscribers: number }[]
  sourceData: { name: string; value: number; color: string }[]
  engagementData: { range: string; count: number }[]
  popularInterests: { interest: string; count: number }[]
  insights: {
    avgEngagementScore: number
    avgOpenRate: number
    avgClickRate: number
    retentionRate: number
  }
}

interface SubscribersListData {
  subscribers: Subscriber[]
  sources: string[]
}

// API data will be fetched dynamically

export default function SubscribersPage() {
  const [subscriberData, setSubscriberData] = useState<SubscriberData | null>(null)
  const [subscribersListData, setSubscribersListData] = useState<SubscribersListData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSubscriberStats()
    fetchSubscribers()
  }, [])

  useEffect(() => {
    fetchSubscribers()
  }, [searchTerm, statusFilter, sourceFilter])

  const fetchSubscriberStats = async () => {
    try {
      const response = await fetch('/api/subscribers/stats')
      const result = await response.json()
      if (result.success) {
        setSubscriberData(result.data)
      }
    } catch (error) {
      console.error('Error fetching subscriber stats:', error)
    }
  }

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (sourceFilter !== 'all') params.append('source', sourceFilter)
      params.append('limit', '50')

      const response = await fetch(`/api/subscribers?${params}`)
      const result = await response.json()
      if (result.success) {
        setSubscribersListData(result.data)
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtering is now done server-side via API
  const filteredSubscribers = subscribersListData?.subscribers || []

  // Pagination logic
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "unsubscribed":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Subscriber Dashboard" description="Manage and analyze your newsletter subscribers" />

      <main className="flex-1 p-6 overflow-auto">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "Loading..." : (subscriberData?.stats.total.toLocaleString() || "0")}
                  </div>
                  <p className="text-xs text-muted-foreground">All time subscribers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "Loading..." : (subscriberData?.stats.active.toLocaleString() || "0")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : 
                     subscriberData?.stats.total ? 
                     `${((subscriberData.stats.active / subscriberData.stats.total) * 100).toFixed(1)}% of total` : 
                     "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "Loading..." : (subscriberData?.stats.newThisMonth || "0")}
                  </div>
                  <p className="text-xs text-primary">
                    {loading ? "Loading..." : 
                     subscriberData?.stats.growthRate ? 
                     `${subscriberData.stats.growthRate > 0 ? '+' : ''}${subscriberData.stats.growthRate}% from last month` : 
                     "N/A"}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "Loading..." : (subscriberData?.stats.unsubscribed || "0")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? "Loading..." : 
                     subscriberData?.stats.total ? 
                     `${((subscriberData.stats.unsubscribed / subscriberData.stats.total) * 100).toFixed(1)}% churn rate` : 
                     "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Growth</CardTitle>
                  <CardDescription>Monthly subscriber growth over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={subscriberData?.growthData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="subscribers" stroke="#d97706" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Sources</CardTitle>
                  <CardDescription>Where your subscribers come from</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={subscriberData?.sourceData || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          percent !== undefined
                            ? `${name} ${(percent * 100).toFixed(0)}%`
                            : `${name}`
                        }
                      >
                        {(subscriberData?.sourceData || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subscriber List</CardTitle>
                    <CardDescription>Manage your newsletter subscribers</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Send Campaign
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search subscribers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {(subscribersListData?.sources || []).map((source) => (
                        <SelectItem key={source} value={source}>{source}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subscribers Table */}
                <div className="table-modern">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscriber</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Engagement</TableHead>
                        <TableHead>Subscribed</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            Loading subscribers...
                          </TableCell>
                        </TableRow>
                      ) : paginatedSubscribers.length > 0 ? (
                        paginatedSubscribers.map((subscriber) => (
                        <TableRow key={subscriber._id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {subscriber.firstName} {subscriber.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                              <div className="text-xs text-muted-foreground">{subscriber.location}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusColor(subscriber.status)}>{subscriber.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{subscriber.source}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-16">
                                <Progress value={subscriber.engagementScore} className="h-2" />
                              </div>
                              <span className={`text-sm font-medium ${getEngagementColor(subscriber.engagementScore)}`}>
                                {subscriber.engagementScore}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(subscriber.subscribedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(subscriber.lastEngagement).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                            No subscribers found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) handlePageChange(currentPage - 1)
                            }}
                            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === page}
                              onClick={(e) => {
                                e.preventDefault()
                                handlePageChange(page)
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
                              if (currentPage < totalPages) handlePageChange(currentPage + 1)
                            }}
                            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Distribution</CardTitle>
                  <CardDescription>Subscriber engagement score ranges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subscriberData?.engagementData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#d97706" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscriber Insights</CardTitle>
                  <CardDescription>Key metrics and trends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Engagement Score</span>
                      <span className="text-sm font-bold">
                        {loading ? "Loading..." : `${subscriberData?.insights.avgEngagementScore || 0}%`}
                      </span>
                    </div>
                    <Progress value={subscriberData?.insights.avgEngagementScore || 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Open Rate</span>
                      <span className="text-sm font-bold">
                        {loading ? "Loading..." : `${subscriberData?.insights.avgOpenRate || 0}%`}
                      </span>
                    </div>
                    <Progress value={subscriberData?.insights.avgOpenRate || 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Click-through Rate</span>
                      <span className="text-sm font-bold">
                        {loading ? "Loading..." : `${subscriberData?.insights.avgClickRate || 0}%`}
                      </span>
                    </div>
                    <Progress value={subscriberData?.insights.avgClickRate || 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retention Rate</span>
                      <span className="text-sm font-bold">
                        {loading ? "Loading..." : `${subscriberData?.insights.retentionRate || 0}%`}
                      </span>
                    </div>
                    <Progress value={subscriberData?.insights.retentionRate || 0} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Popular Interests</CardTitle>
                <CardDescription>Most common subscriber interests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {loading ? (
                    <div className="col-span-3 text-center py-4 text-muted-foreground">
                      Loading popular interests...
                    </div>
                  ) : (subscriberData?.popularInterests || []).length > 0 ? (
                    (subscriberData?.popularInterests || []).map((item) => (
                      <div key={item.interest} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">{item.interest}</span>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-4 text-muted-foreground">
                      No interest data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
