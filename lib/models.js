// This file contains the MongoDB collection schemas and helper functions

export const Collections = {
  USERS: 'users',
  ROOMS: 'rooms',
  GUESTS: 'guests',
  CHECKINS: 'checkins',
  BOOKINGS: 'bookings',
  BILLS: 'bills',
};

// User schema
// {
//   id: string (uuid),
//   email: string,
//   password: string (hashed),
//   name: string,
//   role: 'reception',
//   createdAt: Date
// }

// Room schema
// {
//   id: string (uuid),
//   roomNumber: string,
//   roomType: string (Single/Double/Suite/Deluxe),
//   pricePerNight: number,
//   status: string (Available/Occupied),
//   createdAt: Date
// }

// Guest schema
// {
//   id: string (uuid),
//   name: string,
//   phone: string,
//   idProof: string,
//   createdAt: Date
// }

// CheckIn schema
// {
//   id: string (uuid),
//   guestId: string,
//   guestName: string,
//   guestPhone: string,
//   guestIdProof: string,
//   roomId: string,
//   roomNumber: string,
//   roomType: string,
//   pricePerNight: number,
//   checkInDate: Date,
//   checkOutDate: Date (expected),
//   actualCheckOutDate: Date (null until checkout),
//   nightsStayed: number,
//   estimatedBill: number,
//   status: string (Active/Completed),
//   createdAt: Date
// }

// Booking schema
// {
//   id: string (uuid),
//   guestName: string,
//   guestPhone: string,
//   roomType: string,
//   checkInDate: Date,
//   checkOutDate: Date,
//   status: string (Pending/Confirmed/Completed/Cancelled),
//   notes: string,
//   createdAt: Date
// }

// Bill schema
// {
//   id: string (uuid),
//   checkInId: string,
//   guestName: string,
//   guestPhone: string,
//   roomNumber: string,
//   roomType: string,
//   pricePerNight: number,
//   checkInDate: Date,
//   checkOutDate: Date,
//   nightsStayed: number,
//   totalAmount: number,
//   createdAt: Date
// }