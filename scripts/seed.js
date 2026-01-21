// Seed script to initialize the database with default data
import { MongoClient } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hotel_management';

// Simple password hashing
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

async function seed() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection('users').deleteMany({});
    await db.collection('rooms').deleteMany({});
    await db.collection('guests').deleteMany({});
    await db.collection('checkins').deleteMany({});
    await db.collection('bookings').deleteMany({});
    await db.collection('bills').deleteMany({});
    
    // Create default user
    console.log('Creating default user...');
    const user = {
      id: uuidv4(),
      email: 'admin@hotel.com',
      password: hashPassword('password123'),
      name: 'Reception Admin',
      role: 'reception',
      createdAt: new Date(),
    };
    await db.collection('users').insertOne(user);
    console.log('User created: admin@hotel.com / password123');
    
    // Create rooms
    console.log('Creating rooms...');
    const roomTypes = [
      { type: 'Single', price: 100, count: 5 },
      { type: 'Double', price: 150, count: 5 },
      { type: 'Suite', price: 250, count: 3 },
      { type: 'Deluxe', price: 350, count: 2 },
    ];
    
    let roomNumber = 101;
    const rooms = [];
    
    for (const roomType of roomTypes) {
      for (let i = 0; i < roomType.count; i++) {
        rooms.push({
          id: uuidv4(),
          roomNumber: roomNumber.toString(),
          roomType: roomType.type,
          pricePerNight: roomType.price,
          status: 'Available',
          createdAt: new Date(),
        });
        roomNumber++;
      }
    }
    
    await db.collection('rooms').insertMany(rooms);
    console.log(`Created ${rooms.length} rooms`);
    
    console.log('\nSeed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@hotel.com');
    console.log('Password: password123');
    console.log('\nTotal rooms:', rooms.length);
    console.log('Room types:', roomTypes.map(rt => `${rt.type} (${rt.count})`).join(', '));
    
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\nDatabase connection closed');
  }
}

seed();