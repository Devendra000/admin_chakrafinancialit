import { toast } from '@/hooks/use-toast'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  data?: any
  source?: 'contact-message' | 'service-request' | 'blog' | 'client' | 'system'
}

class NotificationService {
  private eventSource: EventSource | null = null
  private notifications: Notification[] = []
  private subscribers: Array<(notifications: Notification[]) => void> = []

  constructor() {
    this.initializeEventSource()
    this.loadStoredNotifications()
  }

  // Initialize Server-Sent Events connection
  private initializeEventSource() {
    if (typeof window === 'undefined') return

    try {
      this.eventSource = new EventSource('/api/notifications/stream')
      
      this.eventSource.onopen = () => {
        console.log('✅ Notification stream connected')
      }

      this.eventSource.onmessage = (event) => {
        try {
          console.log('📨 Received notification event:', event.data)
          const notification = JSON.parse(event.data)
          console.log('📊 Parsed notification:', notification)
          this.addNotification(notification)
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('❌ Notification stream error:', error)
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          this.reconnect()
        }, 5000)
      }
    } catch (error) {
      console.error('Failed to initialize EventSource:', error)
    }
  }

  // Reconnect to event source
  private reconnect() {
    if (this.eventSource) {
      this.eventSource.close()
    }
    this.initializeEventSource()
  }

  // Add new notification
  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    console.log('➕ Adding notification:', notification)
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    }

    console.log('📝 Created notification:', newNotification)
    this.notifications.unshift(newNotification)
    
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }

    console.log('💾 Total notifications:', this.notifications.length)
    this.saveNotifications()
    this.notifySubscribers()
    this.showToast(newNotification)
  }

  // Show toast notification
  private showToast(notification: Notification) {
    const variant = notification.type === 'error' ? 'destructive' : 'default'
    
    toast({
      title: notification.title,
      description: notification.message,
      variant,
      duration: notification.type === 'error' ? 8000 : 5000,
    })
  }

  // Generate unique ID
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Subscribe to notifications
  public subscribe(callback: (notifications: Notification[]) => void) {
    this.subscribers.push(callback)
    
    // Send current notifications immediately
    callback(this.notifications)
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.notifications))
  }

  // Mark notification as read
  public markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.saveNotifications()
      this.notifySubscribers()
    }
  }

  // Mark all notifications as read
  public markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    this.saveNotifications()
    this.notifySubscribers()
  }

  // Clear all notifications
  public clearAll() {
    this.notifications = []
    this.saveNotifications()
    this.notifySubscribers()
  }

  // Get unread count
  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Get all notifications
  public getNotifications(): Notification[] {
    return this.notifications
  }

  // Load notifications from localStorage
  private loadStoredNotifications() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('admin_notifications')
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading stored notifications:', error)
    }
  }

  // Save notifications to localStorage
  private saveNotifications() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('admin_notifications', JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Error saving notifications:', error)
    }
  }

  // Cleanup
  public destroy() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.subscribers = []
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
export default notificationService