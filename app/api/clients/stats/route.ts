import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/lib/models/Client';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const includeTestData = searchParams.get('includeTestData') !== 'false'; // Default to true for backward compatibility
    
    // Build base query filter
    const baseFilter = includeTestData ? {} : { 
      $or: [
        { isTestData: false },
        { isTestData: { $exists: false } }
      ]
    };
    
    // Get basic counts
    const totalClients = await Client.countDocuments(baseFilter);
    const activeClients = await Client.countDocuments({ ...baseFilter, status: 'active' });
    const leadClients = await Client.countDocuments({ ...baseFilter, status: 'lead' });
    const convertedClients = await Client.countDocuments({ ...baseFilter, status: 'converted' });
    const inactiveClients = await Client.countDocuments({ ...baseFilter, status: 'inactive' });
    
    // Also get test data counts for reference
    const testDataCount = await Client.countDocuments({ isTestData: true });
    const realDataCount = await Client.countDocuments({ 
      $or: [
        { isTestData: false },
        { isTestData: { $exists: false } }
      ]
    });

    // Calculate monthly trends
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const clientsThisMonth = await Client.countDocuments({ 
      ...baseFilter,
      contactDate: { $gte: thisMonth } 
    });
    
    const clientsLastMonth = await Client.countDocuments({ 
      ...baseFilter,
      contactDate: { $gte: lastMonth, $lt: thisMonth } 
    });

    // Calculate conversion rate
    const conversionRate = totalClients > 0 
      ? Math.round((convertedClients / totalClients) * 100 * 100) / 100 
      : 0;

    // Get source distribution
    const sourceAggregation = await Client.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const sourceData = sourceAggregation.map((item, index) => ({
      name: item._id || 'Unknown',
      value: item.count,
      percentage: Math.round((item.count / totalClients) * 100),
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }));

    // Get status distribution
    const statusData = [
      { name: 'Leads', value: leadClients, color: '#f59e0b' },
      { name: 'Active', value: activeClients, color: '#10b981' },
      { name: 'Converted', value: convertedClients, color: '#3b82f6' },
      { name: 'Inactive', value: inactiveClients, color: '#6b7280' }
    ].filter(item => item.value > 0);

    // Get monthly client acquisition for last 6 months
    const clientGrowthData = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const count = await Client.countDocuments({
        ...baseFilter,
        contactDate: { $gte: monthStart, $lt: monthEnd }
      });
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      clientGrowthData.push({
        month: monthNames[monthStart.getMonth()],
        clients: count
      });
    }

    // Get clients needing follow-up
    const followUpClients = await Client.countDocuments({
      ...baseFilter,
      nextFollowUp: { $lte: new Date() },
      status: { $in: ['lead', 'active'] }
    });

    // Get average client value
    const valueAggregation = await Client.aggregate([
      { $match: baseFilter },
      { $group: { _id: null, avgValue: { $avg: '$value' }, totalValue: { $sum: '$value' } } }
    ]);

    const avgClientValue = valueAggregation[0]?.avgValue || 0;
    const totalClientValue = valueAggregation[0]?.totalValue || 0;

    // Get top services
    const servicesAggregation = await Client.aggregate([
      { $match: baseFilter },
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topServices = servicesAggregation.map(item => ({
      service: item._id,
      count: item.count
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          total: totalClients,
          active: activeClients,
          leads: leadClients,
          converted: convertedClients,
          inactive: inactiveClients,
          newThisMonth: clientsThisMonth,
          newLastMonth: clientsLastMonth,
          conversionRate,
          followUpNeeded: followUpClients,
          avgClientValue: Math.round(avgClientValue * 100) / 100,
          totalClientValue: Math.round(totalClientValue * 100) / 100,
          testDataCount,
          realDataCount,
          includeTestData
        },
        sourceData,
        statusData,
        clientGrowthData,
        topServices,
        insights: {
          totalValue: totalClientValue,
          avgValue: avgClientValue,
          conversionRate,
          followUpRate: totalClients > 0 ? Math.round((followUpClients / totalClients) * 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('Error fetching client stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client stats' },
      { status: 500 }
    );
  }
}