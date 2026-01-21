import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Collections } from '@/lib/models';
import { setSession, deleteSession, getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

// Helper function to hash password (simple - in production use bcrypt)
function hashPassword(password) {
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
  return hashPassword(password) === hash;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// POST handler
export async function POST(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const body = await request.json();

    // Login endpoint
    if (path === 'auth/login') {
      const schema = z.object({
        email: z.string().email(),
        password: z.string().min(1),
      });
      
      const { email, password } = schema.parse(body);
      
      const usersCollection = await getCollection(Collections.USERS);
      const user = await usersCollection.findOne({ email });
      
      if (!user || !verifyPassword(password, user.password)) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401, headers: corsHeaders }
        );
      }
      
      await setSession({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      
      return NextResponse.json(
        { user: { id: user.id, email: user.email, name: user.name, role: user.role } },
        { headers: corsHeaders }
      );
    }

    // Logout endpoint
    if (path === 'auth/logout') {
      await deleteSession();
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    // Check session for protected routes
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Check-in endpoint
    if (path === 'checkins') {
      const schema = z.object({
        guestName: z.string().min(1),
        guestPhone: z.string().min(1),
        guestIdProof: z.string().min(1),
        roomId: z.string().min(1),
        stayDuration: z.number().min(1),
      });
      
      const data = schema.parse(body);
      
      // Get room details
      const roomsCollection = await getCollection(Collections.ROOMS);
      const room = await roomsCollection.findOne({ id: data.roomId });
      
      if (!room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (room.status === 'Occupied') {
        return NextResponse.json(
          { error: 'Room is already occupied' },
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Create guest
      const guestsCollection = await getCollection(Collections.GUESTS);
      const guest = {
        id: uuidv4(),
        name: data.guestName,
        phone: data.guestPhone,
        idProof: data.guestIdProof,
        createdAt: new Date(),
      };
      await guestsCollection.insertOne(guest);
      
      // Create check-in
      const checkInDate = new Date();
      const checkOutDate = new Date();
      checkOutDate.setDate(checkOutDate.getDate() + data.stayDuration);
      
      const checkIn = {
        id: uuidv4(),
        guestId: guest.id,
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        guestIdProof: data.guestIdProof,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        checkInDate,
        checkOutDate,
        actualCheckOutDate: null,
        nightsStayed: data.stayDuration,
        estimatedBill: room.pricePerNight * data.stayDuration,
        status: 'Active',
        createdAt: new Date(),
      };
      
      const checkInsCollection = await getCollection(Collections.CHECKINS);
      await checkInsCollection.insertOne(checkIn);
      
      // Update room status
      await roomsCollection.updateOne(
        { id: room.id },
        { $set: { status: 'Occupied' } }
      );
      
      return NextResponse.json({ checkIn }, { headers: corsHeaders });
    }

    // Create booking endpoint
    if (path === 'bookings') {
      const schema = z.object({
        guestName: z.string().min(1),
        guestPhone: z.string().min(1),
        roomType: z.string().min(1),
        checkInDate: z.string(),
        checkOutDate: z.string(),
        notes: z.string().optional(),
      });
      
      const data = schema.parse(body);
      
      const booking = {
        id: uuidv4(),
        guestName: data.guestName,
        guestPhone: data.guestPhone,
        roomType: data.roomType,
        checkInDate: new Date(data.checkInDate),
        checkOutDate: new Date(data.checkOutDate),
        status: 'Confirmed',
        notes: data.notes || '',
        createdAt: new Date(),
      };
      
      const bookingsCollection = await getCollection(Collections.BOOKINGS);
      await bookingsCollection.insertOne(booking);
      
      return NextResponse.json({ booking }, { headers: corsHeaders });
    }

    // Check-out endpoint
    if (path === 'checkout') {
      const schema = z.object({
        checkInId: z.string().min(1),
      });
      
      const { checkInId } = schema.parse(body);
      
      const checkInsCollection = await getCollection(Collections.CHECKINS);
      const checkIn = await checkInsCollection.findOne({ id: checkInId });
      
      if (!checkIn) {
        return NextResponse.json(
          { error: 'Check-in not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      if (checkIn.status === 'Completed') {
        return NextResponse.json(
          { error: 'Guest already checked out' },
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Calculate actual bill
      const actualCheckOutDate = new Date();
      const nightsStayed = Math.ceil(
        (actualCheckOutDate - checkIn.checkInDate) / (1000 * 60 * 60 * 24)
      );
      const totalAmount = checkIn.pricePerNight * nightsStayed;
      
      // Create bill
      const bill = {
        id: uuidv4(),
        checkInId: checkIn.id,
        guestName: checkIn.guestName,
        guestPhone: checkIn.guestPhone,
        roomNumber: checkIn.roomNumber,
        roomType: checkIn.roomType,
        pricePerNight: checkIn.pricePerNight,
        checkInDate: checkIn.checkInDate,
        checkOutDate: actualCheckOutDate,
        nightsStayed,
        totalAmount,
        createdAt: new Date(),
      };
      
      const billsCollection = await getCollection(Collections.BILLS);
      await billsCollection.insertOne(bill);
      
      // Update check-in
      await checkInsCollection.updateOne(
        { id: checkIn.id },
        {
          $set: {
            actualCheckOutDate,
            nightsStayed,
            status: 'Completed',
          },
        }
      );
      
      // Update room status
      const roomsCollection = await getCollection(Collections.ROOMS);
      await roomsCollection.updateOne(
        { id: checkIn.roomId },
        { $set: { status: 'Available' } }
      );
      
      return NextResponse.json({ bill }, { headers: corsHeaders });
    }

    // Convert booking to check-in
    if (path === 'bookings/convert') {
      const schema = z.object({
        bookingId: z.string().min(1),
        roomId: z.string().min(1),
        guestIdProof: z.string().min(1),
      });
      
      const data = schema.parse(body);
      
      const bookingsCollection = await getCollection(Collections.BOOKINGS);
      const booking = await bookingsCollection.findOne({ id: data.bookingId });
      
      if (!booking) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      // Get room details
      const roomsCollection = await getCollection(Collections.ROOMS);
      const room = await roomsCollection.findOne({ id: data.roomId });
      
      if (!room || room.status === 'Occupied') {
        return NextResponse.json(
          { error: 'Room not available' },
          { status: 400, headers: corsHeaders }
        );
      }
      
      // Create guest
      const guestsCollection = await getCollection(Collections.GUESTS);
      const guest = {
        id: uuidv4(),
        name: booking.guestName,
        phone: booking.guestPhone,
        idProof: data.guestIdProof,
        createdAt: new Date(),
      };
      await guestsCollection.insertOne(guest);
      
      // Calculate nights
      const nights = Math.ceil(
        (booking.checkOutDate - booking.checkInDate) / (1000 * 60 * 60 * 24)
      );
      
      // Create check-in
      const checkIn = {
        id: uuidv4(),
        guestId: guest.id,
        guestName: booking.guestName,
        guestPhone: booking.guestPhone,
        guestIdProof: data.guestIdProof,
        roomId: room.id,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
        pricePerNight: room.pricePerNight,
        checkInDate: new Date(),
        checkOutDate: booking.checkOutDate,
        actualCheckOutDate: null,
        nightsStayed: nights,
        estimatedBill: room.pricePerNight * nights,
        status: 'Active',
        createdAt: new Date(),
      };
      
      const checkInsCollection = await getCollection(Collections.CHECKINS);
      await checkInsCollection.insertOne(checkIn);
      
      // Update room status
      await roomsCollection.updateOne(
        { id: room.id },
        { $set: { status: 'Occupied' } }
      );
      
      // Update booking status
      await bookingsCollection.updateOne(
        { id: booking.id },
        { $set: { status: 'Completed' } }
      );
      
      return NextResponse.json({ checkIn }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// GET handler
export async function GET(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';

    // Get current session
    if (path === 'auth/me') {
      const session = await getSession();
      if (!session) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401, headers: corsHeaders }
        );
      }
      return NextResponse.json({ user: session.user }, { headers: corsHeaders });
    }

    // Check session for protected routes
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Get dashboard stats
    if (path === 'dashboard/stats') {
      const roomsCollection = await getCollection(Collections.ROOMS);
      const checkInsCollection = await getCollection(Collections.CHECKINS);
      
      const totalRooms = await roomsCollection.countDocuments();
      const occupiedRooms = await roomsCollection.countDocuments({ status: 'Occupied' });
      const availableRooms = totalRooms - occupiedRooms;
      
      // Today's check-ins and check-outs
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayCheckIns = await checkInsCollection.countDocuments({
        checkInDate: { $gte: today, $lt: tomorrow },
      });
      
      const todayCheckOuts = await checkInsCollection.countDocuments({
        checkOutDate: { $gte: today, $lt: tomorrow },
        status: 'Active',
      });
      
      return NextResponse.json(
        {
          totalRooms,
          availableRooms,
          occupiedRooms,
          todayCheckIns,
          todayCheckOuts,
        },
        { headers: corsHeaders }
      );
    }

    // Get all rooms
    if (path === 'rooms') {
      const roomsCollection = await getCollection(Collections.ROOMS);
      const rooms = await roomsCollection.find({}).sort({ roomNumber: 1 }).toArray();
      return NextResponse.json({ rooms }, { headers: corsHeaders });
    }

    // Get active check-ins
    if (path === 'checkins/active') {
      const checkInsCollection = await getCollection(Collections.CHECKINS);
      const checkIns = await checkInsCollection
        .find({ status: 'Active' })
        .sort({ checkInDate: -1 })
        .toArray();
      return NextResponse.json({ checkIns }, { headers: corsHeaders });
    }

    // Get all bookings
    if (path === 'bookings') {
      const bookingsCollection = await getCollection(Collections.BOOKINGS);
      const bookings = await bookingsCollection
        .find({ status: { $ne: 'Completed' } })
        .sort({ checkInDate: 1 })
        .toArray();
      return NextResponse.json({ bookings }, { headers: corsHeaders });
    }

    // Get bill by check-in ID
    if (path.startsWith('bills/')) {
      const checkInId = path.split('/')[1];
      const billsCollection = await getCollection(Collections.BILLS);
      const bill = await billsCollection.findOne({ checkInId });
      
      if (!bill) {
        return NextResponse.json(
          { error: 'Bill not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      return NextResponse.json({ bill }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT handler
export async function PUT(request, { params }) {
  try {
    const path = params?.path?.join('/') || '';
    const body = await request.json();

    // Check session
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401, headers: corsHeaders }
      );
    }

    // Update room status (manual)
    if (path.startsWith('rooms/')) {
      const roomId = path.split('/')[1];
      const schema = z.object({
        status: z.enum(['Available', 'Occupied']),
      });
      
      const { status } = schema.parse(body);
      
      const roomsCollection = await getCollection(Collections.ROOMS);
      const result = await roomsCollection.updateOne(
        { id: roomId },
        { $set: { status } }
      );
      
      if (result.matchedCount === 0) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404, headers: corsHeaders }
        );
      }
      
      return NextResponse.json({ success: true }, { headers: corsHeaders });
    }

    return NextResponse.json(
      { error: 'Not found' },
      { status: 404, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}