import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Briefcase, TrendingUp, DollarSign } from "lucide-react"

const stats = [
  {
    title: "Total Services",
    value: "12",
    description: "Active financial services",
    icon: Briefcase,
    trend: "+2 this month",
  },
  {
    title: "Blog Posts",
    value: "48",
    description: "Published articles",
    icon: FileText,
    trend: "+5 this week",
  },
  {
    title: "Subscribers",
    value: "2,847",
    description: "Newsletter subscribers",
    icon: Users,
    trend: "+127 this month",
  },
  {
    title: "Revenue",
    value: "$45,231",
    description: "Monthly revenue",
    icon: DollarSign,
    trend: "+12% from last month",
  },
]

export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-full">
      <AdminHeader title="Dashboard" description="Welcome to Chakra Financial Admin Panel" />

      <main className="flex-1 p-6 overflow-auto">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 text-primary mr-1" />
                  <span className="text-xs text-primary">{stat.trend}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Blog Posts</CardTitle>
              <CardDescription>Latest published articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["Understanding Investment Strategies", "Tax Planning for 2024", "Retirement Planning Basics"].map(
                  (post, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm">{post}</span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                  <div className="font-medium">Add New Service</div>
                  <div className="text-sm text-muted-foreground">Create a new financial service</div>
                </button>
                <button className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                  <div className="font-medium">Write Blog Post</div>
                  <div className="text-sm text-muted-foreground">Publish new content</div>
                </button>
                <button className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">Check performance metrics</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
