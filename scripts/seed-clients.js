import mongoose from 'mongoose';
import Client from '../lib/models/Client.js';

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://devendrasingh000456:12345devendra@cluster0.sxaygap.mongodb.net/chakra_financial?retryWrites=true&w=majority&appName=Cluster0';

async function connectDB() {
  try {
    if (mongoose.connections[0].readyState) {
      console.log('Already connected to MongoDB');
      return;
    }
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

async function seedClients() {
  try {
    await connectDB();
    
    // Check if clients already exist
    const existingClients = await Client.countDocuments();
    if (existingClients > 0) {
      console.log(`Found ${existingClients} existing clients. Skipping seed.`);
      return;
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
        notes: 'High-value client interested in long-term investment strategies.',
        contactDate: new Date('2024-08-15'),
        lastContact: new Date('2024-09-20'),
        nextFollowUp: new Date('2024-10-15'),
        value: 50000,
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
        notes: 'Small business owner looking for tax optimization strategies.',
        contactDate: new Date('2024-09-01'),
        lastContact: new Date('2024-09-01'),
        nextFollowUp: new Date('2024-09-30'),
        value: 25000,
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
        notes: 'Successfully converted from lead. Using comprehensive planning services.',
        contactDate: new Date('2024-07-10'),
        lastContact: new Date('2024-09-25'),
        nextFollowUp: new Date('2024-12-25'),
        value: 75000,
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
        notes: 'Startup founder interested in financial planning. High potential.',
        contactDate: new Date('2024-09-20'),
        lastContact: new Date('2024-09-20'),
        nextFollowUp: new Date('2024-09-27'),
        value: 40000,
        address: {
          street: '321 Innovation Blvd',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        }
      }
    ];

    const createdClients = await Client.insertMany(testClients);
    console.log(`✅ Successfully created ${createdClients.length} test clients`);
    
    // Display created clients
    createdClients.forEach((client, index) => {
      console.log(`${index + 1}. ${client.name} (${client.email}) - Status: ${client.status}`);
    });

    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating test clients:', error);
    process.exit(1);
  }
}

seedClients();