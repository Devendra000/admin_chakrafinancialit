"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Search, Filter, Trash2, CheckCheck, Eye, Clock, CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import { useNotifications } from "@/components/NotificationProvider"
import type { Notification } from "@/lib/notifications/NotificationService"

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications()
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [loading, setLoading] = useState(false)

  // Filter notifications based on search and filters
  useEffect(() => {
    let filtered = notifications

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (notification.source && notification.source.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(notification => notification.type === filterType)
    }

    // Status filter
    if (filterStatus === "read") {
      filtered = filtered.filter(notification => notification.read)
    } else if (filterStatus === "unread") {
      filtered = filtered.filter(notification => !notification.read)
    }

    setFilteredNotifications(filtered)
  }, [notifications, searchQuery, filterType, filterStatus])

  const handleMarkAllAsRead = () => {
    markAllAsRead()
    toast({
      title: "All notifications marked as read",
      description: `Marked ${unreadCount} notifications as read.`
    })
  }

  const handleDeleteNotification = (id: string) => {
    // For now, we'll mark as read instead of delete since the service doesn't have delete
    markAsRead(id)
    setSelectedNotification(null)
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read."
    })
  }

  const handleClearAllNotifications = () => {
    clearAll()
    setSelectedNotification(null)
    toast({
      title: "All notifications cleared",
      description: "All notifications have been removed."
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getTypeBadgeVariant = (type: string): "default" | "destructive" | "outline" => {
    switch (type) {
      case 'error': return 'destructive'
      case 'warning': return 'outline'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="w-8 h-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground">
            Manage all your admin notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          <Button variant="destructive" onClick={handleClearAllNotifications}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
                <p className="text-muted-foreground text-center">
                  {notifications.length === 0 
                    ? "You don't have any notifications yet."
                    : "No notifications match your current filters."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.read ? 'border-primary bg-primary/5' : ''
                } ${
                  selectedNotification?.id === notification.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedNotification(notification)
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={getTypeBadgeVariant(notification.type)} className="text-xs">
                        {notification.source || 'system'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNotification(notification.id)
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(notification.timestamp, 'MMM dd, yyyy at h:mm a')}
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Notification Detail Panel */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Notification Details
                {selectedNotification && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedNotification(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNotification ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(selectedNotification.type)}
                    <Badge variant={getTypeBadgeVariant(selectedNotification.type)}>
                      {selectedNotification.source || 'system'}
                    </Badge>
                    {!selectedNotification.read && (
                      <Badge variant="outline">Unread</Badge>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">{selectedNotification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {selectedNotification.message}
                    </p>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3" />
                      {format(selectedNotification.timestamp, 'MMMM dd, yyyy at h:mm:ss a')}
                    </div>
                  </div>

                  {selectedNotification.data && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Additional Data:</h4>
                      <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteNotification(selectedNotification.id)}
                      className="flex-1"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a notification to view details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unread</span>
                <Badge variant="destructive">{unreadCount}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Success</span>
                <Badge variant="default">
                  {notifications.filter(n => n.type === 'success').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Errors</span>
                <Badge variant="destructive">
                  {notifications.filter(n => n.type === 'error').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}