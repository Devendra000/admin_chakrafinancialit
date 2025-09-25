import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber from '@/lib/models/Subscriber';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get basic counts
    const totalSubscribers = await Subscriber.countDocuments();
    const activeSubscribers = await Subscriber.countDocuments({ status: 'active' });
    const inactiveSubscribers = await Subscriber.countDocuments({ status: 'inactive' });
    const unsubscribedSubscribers = await Subscriber.countDocuments({ status: 'unsubscribed' });

    // Calculate monthly trends
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
    
    const subscribersThisMonth = await Subscriber.countDocuments({ 
      subscribedAt: { $gte: thisMonth } 
    });
    
    const subscribersLastMonth = await Subscriber.countDocuments({ 
      subscribedAt: { $gte: lastMonth, $lt: thisMonth } 
    });

    // Get total subscribers at the end of last month for percentage calculation
    const totalSubscribersEndOfLastMonth = await Subscriber.countDocuments({ 
      subscribedAt: { $lt: thisMonth } 
    });

    // Get subscribers this year vs last year
    const subscribersThisYear = await Subscriber.countDocuments({ 
      subscribedAt: { $gte: thisYearStart } 
    });
    
    const subscribersLastYear = await Subscriber.countDocuments({ 
      subscribedAt: { $gte: lastYearStart, $lte: lastYearEnd } 
    });

    // Calculate growth rates
    let monthOverMonthGrowth = 0;
    let yearOverYearGrowth = 0;

    if (totalSubscribersEndOfLastMonth > 0) {
      monthOverMonthGrowth = (subscribersThisMonth / totalSubscribersEndOfLastMonth) * 100;
    }

    if (subscribersLastYear > 0) {
      yearOverYearGrowth = ((subscribersThisYear - subscribersLastYear) / subscribersLastYear) * 100;
    }

    // Use month-over-month growth as primary, fallback to year-over-year
    const growthRate = monthOverMonthGrowth > 0 ? monthOverMonthGrowth : yearOverYearGrowth;

    // Get subscriber growth data for last 6 months
    const growthData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await Subscriber.countDocuments({
        subscribedAt: { $lt: monthEnd }
      });
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      growthData.push({
        month: monthNames[monthStart.getMonth()],
        subscribers: count
      });
    }

    // Get source distribution
    const sourceAggregation = await Subscriber.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sourceData = sourceAggregation.map((item, index) => ({
      name: item._id || 'Unknown',
      value: Math.round((item.count / totalSubscribers) * 100),
      color: ['#d97706', '#f59e0b', '#dc2626', '#4b5563', '#059669'][index % 5]
    }));

    // Get engagement distribution
    const engagementData = await Subscriber.aggregate([
      {
        $bucket: {
          groupBy: '$engagementScore',
          boundaries: [0, 50, 60, 70, 80, 90, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    const formattedEngagementData = engagementData.map(item => ({
      range: item._id === 'Other' ? '0-49' : 
             item._id === 0 ? '0-49' :
             item._id === 50 ? '50-59' :
             item._id === 60 ? '60-69' :
             item._id === 70 ? '70-79' :
             item._id === 80 ? '80-89' : '90-100',
      count: item.count
    }));

    // Get popular interests
    const interestsAggregation = await Subscriber.aggregate([
      { $unwind: '$interests' },
      { $group: { _id: '$interests', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    const popularInterests = interestsAggregation.map(item => ({
      interest: item._id,
      count: item.count
    }));

    // Calculate average engagement metrics
    const avgEngagementScore = await Subscriber.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$engagementScore' } } }
    ]);

    const avgOpenRate = await Subscriber.aggregate([
      { 
        $group: { 
          _id: null, 
          avgOpenRate: { 
            $avg: { 
              $cond: [
                { $gt: ['$emailsSent', 0] },
                { $multiply: [{ $divide: ['$emailOpens', '$emailsSent'] }, 100] },
                0
              ]
            }
          } 
        } 
      }
    ]);

    const avgClickRate = await Subscriber.aggregate([
      { 
        $group: { 
          _id: null, 
          avgClickRate: { 
            $avg: { 
              $cond: [
                { $gt: ['$emailOpens', 0] },
                { $multiply: [{ $divide: ['$emailClicks', '$emailOpens'] }, 100] },
                0
              ]
            }
          } 
        } 
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: totalSubscribers,
          active: activeSubscribers,
          inactive: inactiveSubscribers,
          unsubscribed: unsubscribedSubscribers,
          newThisMonth: subscribersThisMonth,
          growthRate: Math.round(growthRate * 100) / 100,
          monthOverMonthGrowth: Math.round(monthOverMonthGrowth * 100) / 100,
          yearOverYearGrowth: Math.round(yearOverYearGrowth * 100) / 100,
          subscribersLastMonth: subscribersLastMonth,
          subscribersThisYear: subscribersThisYear,
          subscribersLastYear: subscribersLastYear
        },
        growthData,
        sourceData,
        engagementData: formattedEngagementData,
        popularInterests,
        insights: {
          avgEngagementScore: Math.round((avgEngagementScore[0]?.avgScore || 0) * 100) / 100,
          avgOpenRate: Math.round((avgOpenRate[0]?.avgOpenRate || 0) * 100) / 100,
          avgClickRate: Math.round((avgClickRate[0]?.avgClickRate || 0) * 100) / 100,
          retentionRate: totalSubscribers > 0 
            ? Math.round(((totalSubscribers - unsubscribedSubscribers) / totalSubscribers * 100) * 100) / 100 
            : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching subscriber stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriber stats' },
      { status: 500 }
    );
  }
}