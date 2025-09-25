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
  // Subscriber stats
  totalSubscribers?: number;
  newSubscribersThisMonth?: number;
  subscriberGrowthRate?: number;
  monthOverMonthGrowth?: number;
  yearOverYearGrowth?: number;
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
      const [dashboardResponse, subscriberStatsResponse] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/subscribers/stats')
      ]);
      
      if (!dashboardResponse.ok) {
        throw new Error(`Dashboard API error! status: ${dashboardResponse.status}`);
      }
      
      const dashboardResult = await dashboardResponse.json();
      let subscriberStats = null;
      
      if (subscriberStatsResponse.ok) {
        const subscriberResult = await subscriberStatsResponse.json();
        if (subscriberResult.success && subscriberResult.data) {
          subscriberStats = subscriberResult.data.stats;
        }
      }
      
      if (dashboardResult.success && dashboardResult.data) {
        // Ensure recentBlogs is an array and remove any duplicates client-side
        const uniqueBlogs = dashboardResult.data.recentBlogs 
          ? dashboardResult.data.recentBlogs.filter((blog: RecentBlog, index: number, array: RecentBlog[]) => 
              array.findIndex(b => b._id === blog._id) === index
            )
          : [];
        
        setDashboardData({
          stats: {
            ...dashboardResult.data.stats,
            totalSubscribers: subscriberStats?.total || 0,
            newSubscribersThisMonth: subscriberStats?.newThisMonth || 0,
            subscriberGrowthRate: subscriberStats?.growthRate || 0,
            monthOverMonthGrowth: subscriberStats?.monthOverMonthGrowth || 0,
            yearOverYearGrowth: subscriberStats?.yearOverYearGrowth || 0
          },
          recentBlogs: uniqueBlogs
        });
      } else {
        console.error('Invalid response format:', dashboardResult);
        setDashboardData({
          stats: {
            totalServices: 0,
            totalBlogs: 0,
            publishedBlogs: 0,
            servicesThisMonth: 0,
            servicesLastMonth: 0,
            blogsThisMonth: 0,
            blogsLastMonth: 0,
            hasHistoricalData: false,
            totalSubscribers: 0,
            newSubscribersThisMonth: 0,
            subscriberGrowthRate: 0,
            monthOverMonthGrowth: 0,
            yearOverYearGrowth: 0
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
          hasHistoricalData: false,
          totalSubscribers: 0,
          newSubscribersThisMonth: 0,
          subscriberGrowthRate: 0,
          monthOverMonthGrowth: 0,
          yearOverYearGrowth: 0
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

  const getSubscribersTrend = () => {
    if (loading) return "Loading...";
    if (!dashboardData?.stats) return "N/A";
    
    const { totalSubscribers = 0, newSubscribersThisMonth = 0, monthOverMonthGrowth = 0, yearOverYearGrowth = 0 } = dashboardData.stats;
    
    if (totalSubscribers === 0) return "No subscribers yet";
    if (newSubscribersThisMonth === 0) return "No new subscribers this month";
    
    // Use month-over-month growth if available and meaningful
    if (monthOverMonthGrowth > 0) {
      return `${newSubscribersThisMonth}, +${monthOverMonthGrowth.toFixed(1)}% growth`;
    } 
    
    // Fallback to year-over-year growth
    if (yearOverYearGrowth > 0) {
      return `${newSubscribersThisMonth}, +${yearOverYearGrowth.toFixed(1)}% YoY`;
    } else if (yearOverYearGrowth < 0) {
      return `${newSubscribersThisMonth}, ${yearOverYearGrowth.toFixed(1)}% YoY`;
    }
    
    // Default to just showing the new count
    return `${newSubscribersThisMonth} new this month`;
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
      title: "Subscribers",
      value: loading ? "Loading..." : (dashboardData?.stats.totalSubscribers?.toString() || "0"),
      description: "Email subscribers",
      icon: Users,
      trend: getSubscribersTrend(),
    },
    {
      title: "Published Blogs",
      value: loading ? "Loading..." : (dashboardData?.stats.publishedBlogs?.toString() || "0"),
      description: "Live blog articles",
      icon: FileText,
      trend: getBlogsTrend(),
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
