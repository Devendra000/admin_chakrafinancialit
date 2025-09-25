"use client";

import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Briefcase, TrendingUp, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"

interface DashboardStats {
  totalServices: number;
  totalBlogs: number;
  publishedBlogs: number;
  servicesThisMonth: number;
  servicesLastMonth: number;
  blogsThisMonth: number;
  blogsLastMonth: number;
  hasHistoricalData: boolean;
}

interface RecentBlog {
  _id: string;
  title: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentBlogs: RecentBlog[];
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Ensure recentBlogs is an array and remove any duplicates client-side
        const uniqueBlogs = result.data.recentBlogs 
          ? result.data.recentBlogs.filter((blog: RecentBlog, index: number, array: RecentBlog[]) => 
              array.findIndex(b => b._id === blog._id) === index
            )
          : [];
        
        setDashboardData({
          ...result.data,
          recentBlogs: uniqueBlogs
        });
      } else {
        console.error('Invalid response format:', result);
        setDashboardData({
          stats: {
            totalServices: 0,
            totalBlogs: 0,
            publishedBlogs: 0,
            servicesThisMonth: 0,
            servicesLastMonth: 0,
            blogsThisMonth: 0,
            blogsLastMonth: 0,
            hasHistoricalData: false
          },
          recentBlogs: []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set fallback data on error
      setDashboardData({
        stats: {
          totalServices: 0,
          totalBlogs: 0,
          publishedBlogs: 0,
          servicesThisMonth: 0,
          servicesLastMonth: 0,
          blogsThisMonth: 0,
          blogsLastMonth: 0,
          hasHistoricalData: false
        },
        recentBlogs: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getServicesTrend = () => {
    if (loading) return "Loading...";
    if (!dashboardData?.stats) return "N/A";
    
    const { totalServices, servicesThisMonth, servicesLastMonth, hasHistoricalData } = dashboardData.stats;
    if (totalServices === 0) return "No services yet";
    if (servicesThisMonth === 0) return "No new services this month";
    if (!hasHistoricalData) return `${servicesThisMonth} total services`;
    
    const change = servicesThisMonth - servicesLastMonth;
    if (change > 0) return `+${change} vs last month`;
    if (change < 0) return `${change} vs last month`;
    return "Same as last month";
  };

  const getBlogsTrend = () => {
    if (loading) return "Loading...";
    if (!dashboardData?.stats) return "N/A";
    
    const { publishedBlogs, blogsThisMonth, blogsLastMonth, hasHistoricalData } = dashboardData.stats;
    if (publishedBlogs === 0) return "No published blogs yet";
    if (blogsThisMonth === 0) return "No new blogs this month";
    if (!hasHistoricalData) return `${publishedBlogs} published blogs`;
    
    const change = blogsThisMonth - blogsLastMonth;
    if (change > 0) return `+${change} vs last month`;
    if (change < 0) return `${change} vs last month`;
    return "Same as last month";
  };

  const stats = [
    {
      title: "Total Services",
      value: loading ? "Loading..." : (dashboardData?.stats.totalServices?.toString() || "0"),
      description: "Active financial services",
      icon: Briefcase,
      trend: getServicesTrend(),
    },
    {
      title: "Published Blogs",
      value: loading ? "Loading..." : (dashboardData?.stats.publishedBlogs?.toString() || "0"),
      description: "Live blog articles",
      icon: FileText,
      trend: getBlogsTrend(),
    },
    {
      title: "Total Blogs",
      value: loading ? "Loading..." : (dashboardData?.stats.totalBlogs?.toString() || "0"),
      description: "All blog posts (draft + published)",
      icon: Users,
      trend: loading ? "Loading..." : "Draft + Published",
    },
    {
      title: "Revenue",
      value: "N/A",
      description: "Monthly revenue (not tracked)",
      icon: DollarSign,
      trend: "Feature not implemented",
    },
  ];
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
                  {stat.trend.includes('+') ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      <span className="text-xs text-green-500">{stat.trend}</span>
                    </>
                  ) : stat.trend === "N/A" || stat.trend === "Loading..." ? (
                    <span className="text-xs text-muted-foreground">{stat.trend}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{stat.trend}</span>
                  )}
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
                {loading ? (
                  <div className="text-sm text-muted-foreground">Loading recent posts...</div>
                ) : dashboardData?.recentBlogs && Array.isArray(dashboardData.recentBlogs) && dashboardData.recentBlogs.length > 0 ? (
                  dashboardData.recentBlogs.map((post, index) => {
                    // Additional safety check for valid post data
                    if (!post || !post._id || !post.title || post.title.trim() === '') {
                      return null;
                    }
                    
                    return (
                      <div key={`${post._id}-${index}`} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm" title={post.title}>
                          {post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title}
                        </span>
                      </div>
                    );
                  }).filter(Boolean)
                ) : (
                  <div className="text-sm text-muted-foreground">N/A - No published blog posts found</div>
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
                <button 
                  onClick={() => window.location.href = '/admin/services'}
                  className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium">Add New Service</div>
                  <div className="text-sm text-muted-foreground">Create a new financial service</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/blog'}
                  className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className="font-medium">Write Blog Post</div>
                  <div className="text-sm text-muted-foreground">Publish new content</div>
                </button>
                <button className="w-full text-left p-3 rounded-md bg-muted hover:bg-muted/80 transition-colors">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-sm text-muted-foreground">N/A - Analytics not implemented</div>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
