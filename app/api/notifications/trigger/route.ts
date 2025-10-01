import { NextRequest, NextResponse } from 'next/server'
import NotificationTriggerService from '@/lib/notifications/NotificationTriggerService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case 'contact-message':
        await NotificationTriggerService.triggerContactMessage(data)
        break
      case 'service-request':
        await NotificationTriggerService.triggerServiceRequest(data)
        break
      case 'urgent-contact':
        await NotificationTriggerService.triggerUrgentContact(data)
        break
      case 'new-client':
        await NotificationTriggerService.triggerNewClient(data)
        break
      case 'high-value-client':
        await NotificationTriggerService.triggerHighValueClient(data)
        break
      case 'blog-post':
        await NotificationTriggerService.triggerBlogPost(data)
        break
      case 'system':
        await NotificationTriggerService.triggerSystemNotification(
          data.title,
          data.message,
          data.type || 'info'
        )
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true, message: 'Notification sent' })
  } catch (error) {
    console.error('Error triggering notification:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

// GET endpoint for testing - you can remove this in production
export async function GET() {
  const testNotifications = [
    {
      type: 'contact-message',
      data: {
        _id: 'test_' + Date.now(),
        name: 'John Doe',
        email: 'john@example.com',
        service: 'financial',
        priority: 'medium',
        createdAt: new Date()
      }
    },
    {
      type: 'service-request',
      data: {
        _id: 'test_' + Date.now(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        serviceName: 'Investment Planning',
        packageType: 'premium',
        createdAt: new Date()
      }
    },
    {
      type: 'system',
      data: {
        title: 'System Update',
        message: 'Database backup completed successfully',
        type: 'success'
      }
    }
  ]

  // Send test notifications
  for (const notification of testNotifications) {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Delay between notifications
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/notifications/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Test notifications sent',
    count: testNotifications.length
  })
}