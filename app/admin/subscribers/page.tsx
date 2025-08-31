"use client"

import { useState } from "react"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  id: string
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
}

interface SubscriberStats {
  total: number
  active: number
  inactive: number
  unsubscribed: number
  newThisMonth: number
  growthRate: number
}

const mockSubscribers: Subscriber[] = [
  {
    id: "1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    status: "active",
    source: "Website",
    subscribedAt: "2024-01-15",
    lastEngagement: "2024-01-20",
    engagementScore: 85,
    location: "New York, NY",
    interests: ["Investment", "Retirement"],
  },
  {
    id: "2",
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
    status: "active",
    source: "Social Media",
    subscribedAt: "2024-01-10",
    lastEngagement: "2024-01-19",
    engagementScore: 92,
    location: "Los Angeles, CA",
    interests: ["Tax", "Business"],
  },
  {
    id: "3",
    email: "mike.johnson@example.com",
    firstName: "Mike",
    lastName: "Johnson",
    status: "inactive",
    source: "Referral",
    subscribedAt: "2023-12-20",
    lastEngagement: "2024-01-05",
    engagementScore: 45,
    location: "Chicago, IL",
    interests: ["Investment"],
  },
  {
    id: "4",
    email: "sarah.wilson@example.com",
    firstName: "Sarah",
    lastName: "Wilson",
    status: "unsubscribed",
    source: "Website",
    subscribedAt: "2023-11-15",
    lastEngagement: "2023-12-10",
    engagementScore: 20,
    location: "Houston, TX",
    interests: ["Retirement", "Insurance"],
  },
]

const mockStats: SubscriberStats = {
  total: 2847,
  active: 2456,
  inactive: 312,
  unsubscribed: 79,
  newThisMonth: 127,
  growthRate: 12.5,
}

const growthData = [
  { month: "Jul", subscribers: 2234 },
  { month: "Aug", subscribers: 2456 },
  { month: "Sep", subscribers: 2678 },
  { month: "Oct", subscribers: 2543 },
  { month: "Nov", subscribers: 2720 },
  { month: "Dec", subscribers: 2847 },
]

const sourceData = [
  { name: "Website", value: 45, color: "#d97706" },
  { name: "Social Media", value: 30, color: "#f59e0b" },
  { name: "Referral", value: 15, color: "#dc2626" },
  { name: "Email Campaign", value: 10, color: "#4b5563" },
]

const engagementData = [
  { range: "90-100", count: 456 },
  { range: "80-89", count: 789 },
  { range: "70-79", count: 623 },
  { range: "60-69", count: 445 },
  { range: "50-59", count: 312 },
  { range: "0-49", count: 222 },
]

export default function SubscribersPage() {
  const [subscribers] = useState<Subscriber[]>(mockSubscribers)
  const [stats] = useState<SubscriberStats>(mockStats)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sourceFilter, setSourceFilter] = useState<string>("all")

  const filteredSubscribers = subscribers.filter((subscriber) => {
    const matchesSearch =
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${subscriber.firstName} ${subscriber.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || subscriber.status === statusFilter
    const matchesSource = sourceFilter === "all" || subscriber.source === sourceFilter
    return matchesSearch && matchesStatus && matchesSource
  })

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
                  <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">All time subscribers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.active.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.active / stats.total) * 100).toFixed(1)}% of total
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">New This Month</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.newThisMonth}</div>
                  <p className="text-xs text-primary">+{stats.growthRate}% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                  <UserMinus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.unsubscribed}</div>
                  <p className="text-xs text-muted-foreground">
                    {((stats.unsubscribed / stats.total) * 100).toFixed(1)}% churn rate
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
                    <LineChart data={growthData}>
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
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {sourceData.map((entry, index) => (
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
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Subscribers Table */}
                <div className="rounded-md border">
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
                      {filteredSubscribers.map((subscriber) => (
                        <TableRow key={subscriber.id}>
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
                          <TableCell>{subscriber.subscribedAt}</TableCell>
                          <TableCell>{subscriber.lastEngagement}</TableCell>
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                    <BarChart data={engagementData}>
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
                      <span className="text-sm font-bold">73%</span>
                    </div>
                    <Progress value={73} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Open Rate</span>
                      <span className="text-sm font-bold">68%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Click-through Rate</span>
                      <span className="text-sm font-bold">24%</span>
                    </div>
                    <Progress value={24} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Retention Rate</span>
                      <span className="text-sm font-bold">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
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
                  {["Investment", "Retirement", "Tax", "Business", "Insurance", "Estate Planning"].map(
                    (interest, index) => (
                      <div key={interest} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium">{interest}</span>
                        <Badge variant="secondary">{Math.floor(Math.random() * 500) + 200}</Badge>
                      </div>
                    ),
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
