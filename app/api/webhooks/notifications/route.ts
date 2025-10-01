import { NextRequest, NextResponse } from 'next/server'
import NotificationTriggerService from '@/lib/notifications/NotificationTriggerService'

// Webhook endpoint for external projects to send notifications
export async function POST(request: NextRequest) {
  try {
    // Multiple authentication options
    const authHeader = request.headers.get('authorization')
    const apiKeyHeader = request.headers.get('x-api-key')
    const apiKey = process.env.WEBHOOK_API_KEY || 'ChakraFinancial_SecureKey_2024_$p3c14l!'
    
    // Check Bearer token OR API key header
    const isValidBearer = authHeader === `Bearer ${apiKey}`
    const isValidApiKey = apiKeyHeader === apiKey
    
    if (!isValidBearer && !isValidApiKey) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid API key' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { event, data } = body

    console.log('📥 Webhook received:', { event, data })

    switch (event) {
      case 'contact.created':
      case 'contact_message.created':
        await NotificationTriggerService.triggerContactMessage({
          _id: data.id,
          name: data.name,
          email: data.email,
          service: data.service,
          priority: data.priority || 'medium',
          createdAt: data.created_at || new Date()
        })
        break

      case 'contact.urgent':
        await NotificationTriggerService.triggerUrgentContact({
          _id: data.id,
          name: data.name,
          email: data.email,
          priority: 'urgent',
          createdAt: data.created_at || new Date()
        })
        break

      case 'service_request.created':
        await NotificationTriggerService.triggerServiceRequest({
          _id: data.id,
          name: data.name,
          email: data.email,
          serviceName: data.service_name,
          packageType: data.package_type,
          createdAt: data.created_at || new Date()
        })
        break

      case 'client.created':
        const clientData = {
          _id: data.id,
          name: data.name,
          email: data.email,
          company: data.company,
          value: data.value,
          createdAt: data.created_at || new Date()
        }
        
        if (data.value && data.value >= 50000) {
          await NotificationTriggerService.triggerHighValueClient(clientData)
        } else {
          await NotificationTriggerService.triggerNewClient(clientData)
        }
        break

      case 'blog.published':
        await NotificationTriggerService.triggerBlogPost({
          _id: data.id,
          title: data.title,
          author: data.author,
          category: data.category,
          publishedAt: data.published_at || new Date()
        })
        break

      case 'status.updated':
        await NotificationTriggerService.triggerStatusUpdate(
          data.type,
          { _id: data.id, name: data.name || data.title },
          data.old_status,
          data.new_status
        )
        break

      case 'system.notification':
        await NotificationTriggerService.triggerSystemNotification(
          data.title,
          data.message,
          data.type || 'info'
        )
        break

      case 'system.error':
        await NotificationTriggerService.triggerError(
          data.error,
          data.details
        )
        break

      default:
        console.warn('⚠️ Unknown webhook event:', event)
        return NextResponse.json(
          { success: false, error: `Unknown event: ${event}` },
          { status: 400 }
        )
    }

    console.log('✅ Webhook processed successfully')
    return NextResponse.json({ 
      success: true, 
      message: 'Notification triggered successfully',
      event 
    })

  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for webhook verification (optional)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const challenge = searchParams.get('challenge')
  
  if (challenge) {
    return new Response(challenge, { status: 200 })
  }
  
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is active',
    supported_events: [
      'contact.created',
      'contact_message.created',
      'contact.urgent',
      'service_request.created',
      'client.created',
      'blog.published',
      'status.updated',
      'system.notification',
      'system.error'
    ]
  })
}