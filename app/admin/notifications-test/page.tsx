"use client"

import React, { useState } from 'react'
import { AdminHeader } from '@/components/admin-header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/hooks/use-toast'
import { 
  Bell, 
  Send, 
  TestTube, 
  Webhook, 
  Users, 
  MessageSquare, 
  Package,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function NotificationTestPage() {
  const [loading, setLoading] = useState(false)
  const [webhookData, setWebhookData] = useState({
    event: 'contact.created',
    name: 'John Doe',
    email: 'john@example.com',
    service: 'financial',
    priority: 'medium'
  })

  const sendTestNotification = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/notifications/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data: generateTestData(type) })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "✅ Test Notification Sent",
          description: `${type} notification triggered successfully`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || 'Failed to send notification',
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateTestData = (type: string) => {
    const timestamp = new Date()
    const id = `test_${Date.now()}`

    switch (type) {
      case 'contact-message':
        return {
          _id: id,
          name: 'Alice Johnson',
          email: 'alice@example.com',
          service: 'it-solutions',
          priority: 'medium',
          createdAt: timestamp
        }
      case 'service-request':
        return {
          _id: id,
          name: 'Bob Wilson',
          email: 'bob@example.com',
          serviceName: 'Financial Planning',
          packageType: 'standard',
          createdAt: timestamp
        }
      case 'urgent-contact':
        return {
          _id: id,
          name: 'Emergency Contact',
          email: 'urgent@example.com',
          priority: 'urgent',
          createdAt: timestamp
        }
      default:
        return { _id: id, createdAt: timestamp }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <AdminHeader 
        title="🔔 Notification System Test" 
        description="Test real-time notifications" 
      />
      
      <main className="flex-1 p-6 space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Notification System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Server-Sent Events: Connected</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Notification Service: Active</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Webhook Endpoint: Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button
                onClick={() => sendTestNotification('contact-message')}
                disabled={loading}
                className="h-auto p-4 flex-col gap-2"
                variant="outline"
              >
                <div className="bg-blue-500 p-2 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">Contact Message</span>
              </Button>
              
              <Button
                onClick={() => sendTestNotification('service-request')}
                disabled={loading}
                className="h-auto p-4 flex-col gap-2"
                variant="outline"
              >
                <div className="bg-green-500 p-2 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">Service Request</span>
              </Button>
              
              <Button
                onClick={() => sendTestNotification('urgent-contact')}
                disabled={loading}
                className="h-auto p-4 flex-col gap-2"
                variant="outline"
              >
                <div className="bg-red-500 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium">Urgent Contact</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Integration Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Integration Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Webhook Endpoint:</h4>
              <code className="text-sm bg-background p-2 rounded border block">
                POST {window.location.origin}/api/webhooks/notifications
              </code>
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Authentication:</h4>
              <code className="text-sm bg-background p-2 rounded border block">
                Authorization: Bearer your-secret-api-key
              </code>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Example Payload:</h4>
              <pre className="text-sm bg-background p-2 rounded border overflow-x-auto">
{`{
  "event": "contact.created",
  "data": {
    "id": "contact_123",
    "name": "John Doe",
    "email": "john@example.com",
    "service": "financial",
    "priority": "medium",
    "created_at": "2023-10-01T12:00:00Z"
  }
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}