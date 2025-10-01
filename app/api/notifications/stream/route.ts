import { NextRequest } from 'next/server'

// Keep track of connected clients
const clients = new Set<ReadableStreamDefaultController>()

export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller)
      
      // Send initial connection message
      const initialMessage = {
        id: `init_${Date.now()}`,
        title: 'Connected',
        message: 'Real-time notifications active',
        type: 'info',
        source: 'system'
      }
      
      const data = `data: ${JSON.stringify(initialMessage)}\n\n`
      controller.enqueue(new TextEncoder().encode(data))
      
      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clients.delete(controller)
        try {
          controller.close()
        } catch (error) {
          // Controller might already be closed
        }
      })
    },
    
    cancel() {
      clients.delete(this as any)
    }
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

// Broadcast notification to all connected clients
export function broadcastNotification(notification: any) {
  const data = `data: ${JSON.stringify(notification)}\n\n`
  const encodedData = new TextEncoder().encode(data)
  
  clients.forEach(controller => {
    try {
      controller.enqueue(encodedData)
    } catch (error) {
      // Remove failed controller
      clients.delete(controller)
    }
  })
}

// Get connected clients count
export function getConnectedClientsCount(): number {
  return clients.size
}