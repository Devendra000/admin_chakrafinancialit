import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Client from '@/lib/models/Client';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check if clients already exist to avoid duplicates
    const existingClients = await Client.countDocuments();
    if (existingClients > 0) {
      return NextResponse.json({
        success: false,
        error: 'Clients already exist in database. Delete existing clients first.'
      }, { status: 400 });
    }

    const testClients = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        company: 'Tech Solutions Inc.',
        services: ['Investment Planning', 'Retirement Planning'],
        status: 'active',
        source: 'Website',
        assignedTo: 'Sarah Johnson',
        notes: 'High-value client interested in long-term investment strategies. Prefers conservative approach.',
        contactDate: new Date('2024-08-15'),
        lastContact: new Date('2024-09-20'),
        nextFollowUp: new Date('2024-10-15'),
        value: 50000,
        isTestData: true,
        address: {
          street: '123 Business Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        }
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        phone: '+1-555-0102',
        company: 'Davis Marketing Group',
        services: ['Tax Planning', 'Business Financial Planning'],
        status: 'lead',
        source: 'Referral',
        assignedTo: 'Michael Chen',
        notes: 'Small business owner looking for tax optimization strategies. Follow up needed.',
        contactDate: new Date('2024-09-01'),
        lastContact: new Date('2024-09-01'),
        nextFollowUp: new Date('2024-09-30'),
        value: 25000,
        isTestData: true,
        address: {
          street: '456 Market St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@gmail.com',
        phone: '+1-555-0103',
        services: ['Personal Financial Planning', 'Insurance Planning'],
        status: 'converted',
        source: 'Social Media',
        assignedTo: 'Lisa Wong',
        notes: 'Successfully converted from lead. Now using comprehensive financial planning services.',
        contactDate: new Date('2024-07-10'),
        lastContact: new Date('2024-09-25'),
        nextFollowUp: new Date('2024-12-25'),
        value: 75000,
        isTestData: true,
        address: {
          street: '789 Oak Lane',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'USA'
        }
      },
      {
        name: 'Maria Rodriguez',
        email: 'maria.rodriguez@startup.io',
        phone: '+1-555-0104',
        company: 'Innovation Startup',
        services: ['Investment Planning', 'Business Financial Planning'],
        status: 'lead',
        source: 'LinkedIn',
        assignedTo: 'David Kim',
        notes: 'Startup founder interested in personal and business financial planning. High potential.',
        contactDate: new Date('2024-09-20'),
        lastContact: new Date('2024-09-20'),
        nextFollowUp: new Date('2024-09-27'),
        value: 40000,
        isTestData: true,
        address: {
          street: '321 Innovation Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        }
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@corp.com',
        phone: '+1-555-0105',
        company: 'Wilson Corporation',
        services: ['Estate Planning', 'Investment Planning'],
        status: 'active',
        source: 'Website',
        assignedTo: 'Sarah Johnson',
        notes: 'Executive level client with complex estate planning needs. Regular quarterly reviews.',
        contactDate: new Date('2024-06-01'),
        lastContact: new Date('2024-09-15'),
        nextFollowUp: new Date('2024-12-15'),
        value: 150000,
        isTestData: true,
        address: {
          street: '654 Executive Dr',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        }
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer.lee@freelance.com',
        services: ['Tax Planning', 'Personal Financial Planning'],
        status: 'inactive',
        source: 'Referral',
        assignedTo: 'Michael Chen',
        notes: 'Freelancer who was interested but became unresponsive. May need re-engagement strategy.',
        contactDate: new Date('2024-05-15'),
        lastContact: new Date('2024-06-10'),
        value: 15000,
        isTestData: true,
        address: {
          street: '987 Creative St',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'USA'
        }
      }
    ];

    const createdClients = await Client.insertMany(testClients);

    return NextResponse.json({
      success: true,
      message: `Successfully created ${createdClients.length} test clients`,
      data: {
        count: createdClients.length,
        clients: createdClients
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating test clients:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Some clients already exist in database' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create test clients' },
      { status: 500 }
    );
  }
}

// Helper endpoint to clear all clients (for testing)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const result = await Client.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.deletedCount} clients`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error deleting clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete clients' },
      { status: 500 }
    );
  }
}