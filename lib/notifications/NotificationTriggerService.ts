import { broadcastNotification } from '@/app/api/notifications/stream/route'

interface NotificationTrigger {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  source: 'contact-message' | 'service-request' | 'blog' | 'client' | 'system'
  data?: any
}

class NotificationTriggerService {
  
  // Trigger notification for new contact message
  static async triggerContactMessage(contactData: any) {
    const notification: NotificationTrigger = {
      title: '📧 New Contact Message',
      message: `${contactData.name} sent a new message about ${contactData.service || 'general inquiry'}`,
      type: 'info',
      source: 'contact-message',
      data: {
        id: contactData._id,
        name: contactData.name,
        email: contactData.email,
        service: contactData.service,
        priority: contactData.priority,
        createdAt: contactData.createdAt
      }
    }
    
    console.log('🔄 Broadcasting contact notification:', notification)
    broadcastNotification(notification)
  }

  // Trigger notification for new service request
  static async triggerServiceRequest(requestData: any) {
    const notification: NotificationTrigger = {
      title: '🎯 New Service Request',
      message: `${requestData.name} requested ${requestData.serviceName} (${requestData.packageType} package)`,
      type: 'info',
      source: 'service-request',
      data: {
        id: requestData._id,
        name: requestData.name,
        email: requestData.email,
        serviceName: requestData.serviceName,
        packageType: requestData.packageType,
        createdAt: requestData.createdAt
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger notification for urgent contact
  static async triggerUrgentContact(contactData: any) {
    const notification: NotificationTrigger = {
      title: '🚨 Urgent Contact Message',
      message: `${contactData.name} sent an urgent message requiring immediate attention`,
      type: 'warning',
      source: 'contact-message',
      data: {
        id: contactData._id,
        name: contactData.name,
        email: contactData.email,
        priority: contactData.priority,
        createdAt: contactData.createdAt
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger notification for new blog post
  static async triggerBlogPost(blogData: any) {
    const notification: NotificationTrigger = {
      title: '📝 Blog Post Published',
      message: `New blog post "${blogData.title}" has been published`,
      type: 'success',
      source: 'blog',
      data: {
        id: blogData._id,
        title: blogData.title,
        author: blogData.author,
        category: blogData.category,
        publishedAt: blogData.publishedAt
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger notification for new client
  static async triggerNewClient(clientData: any) {
    const notification: NotificationTrigger = {
      title: '👤 New Client Registered',
      message: `${clientData.name} has been added as a new client`,
      type: 'success',
      source: 'client',
      data: {
        id: clientData._id,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
        value: clientData.value,
        createdAt: clientData.createdAt
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger notification for high-value client
  static async triggerHighValueClient(clientData: any) {
    const notification: NotificationTrigger = {
      title: '💎 High-Value Client Alert',
      message: `New high-value client ${clientData.name} (${clientData.value ? `$${clientData.value.toLocaleString()}` : 'No value specified'})`,
      type: 'success',
      source: 'client',
      data: {
        id: clientData._id,
        name: clientData.name,
        email: clientData.email,
        value: clientData.value,
        createdAt: clientData.createdAt
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger notification for status updates
  static async triggerStatusUpdate(type: string, itemData: any, oldStatus: string, newStatus: string) {
    const notification: NotificationTrigger = {
      title: `📋 ${type} Status Updated`,
      message: `${itemData.name || itemData.title} status changed from "${oldStatus}" to "${newStatus}"`,
      type: 'info',
      source: type as any,
      data: {
        id: itemData._id,
        oldStatus,
        newStatus,
        updatedAt: new Date()
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger system notifications
  static async triggerSystemNotification(title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const notification: NotificationTrigger = {
      title,
      message,
      type,
      source: 'system',
      data: {
        timestamp: new Date()
      }
    }
    
    broadcastNotification(notification)
  }

  // Trigger error notifications
  static async triggerError(error: string, details?: any) {
    const notification: NotificationTrigger = {
      title: '❌ System Error',
      message: error,
      type: 'error',
      source: 'system',
      data: {
        error,
        details,
        timestamp: new Date()
      }
    }
    
    broadcastNotification(notification)
  }
}

export default NotificationTriggerService