'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Hotel, LogOut, UserPlus, Calendar, DoorOpen, FileText, Bed, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function App() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  
  // Dashboard state
  const [stats, setStats] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [activeCheckIns, setActiveCheckIns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [bill, setBill] = useState(null);
  
  // Check-in dialog state
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInData, setCheckInData] = useState({
    guestName: '',
    guestPhone: '',
    guestIdProof: '',
    roomId: '',
    stayDuration: 1,
  });
  
  // Booking dialog state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestPhone: '',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    notes: '',
  });
  
  // Checkout dialog state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Bill dialog state
  const [billOpen, setBillOpen] = useState(false);
  
  // Convert booking dialog state
  const [convertBookingOpen, setConvertBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [convertData, setConvertData] = useState({
    roomId: '',
    guestIdProof: '',
  });
  
  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);
  
  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn) {
      loadDashboardData();
    }
  }, [isLoggedIn]);
  
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadDashboardData = async () => {
    try {
      // Load stats
      const statsRes = await fetch('/api/dashboard/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      // Load rooms
      const roomsRes = await fetch('/api/rooms');
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.rooms);
      }
      
      // Load active check-ins
      const checkInsRes = await fetch('/api/checkins/active');
      if (checkInsRes.ok) {
        const checkInsData = await checkInsRes.json();
        setActiveCheckIns(checkInsData.checkIns);
      }
      
      // Load bookings
      const bookingsRes = await fetch('/api/bookings');
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData.bookings);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load data');
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setIsLoggedIn(true);
        toast.success('Welcome back!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleCheckIn = async () => {
    try {
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkInData),
      });
      
      if (response.ok) {
        toast.success('Guest checked in successfully!');
        setCheckInOpen(false);
        setCheckInData({
          guestName: '',
          guestPhone: '',
          guestIdProof: '',
          roomId: '',
          stayDuration: 1,
        });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('Check-in failed');
    }
  };
  
  const handleCreateBooking = async () => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      
      if (response.ok) {
        toast.success('Booking created successfully!');
        setBookingOpen(false);
        setBookingData({
          guestName: '',
          guestPhone: '',
          roomType: '',
          checkInDate: '',
          checkOutDate: '',
          notes: '',
        });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Booking failed');
    }
  };
  
  const handleCheckout = async () => {
    if (!selectedCheckIn) return;
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInId: selectedCheckIn.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setBill(data.bill);
        setCheckoutOpen(false);
        setBillOpen(true);
        toast.success('Guest checked out successfully!');
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Checkout failed');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Checkout failed');
    }
  };
  
  const handleConvertBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      const response = await fetch('/api/bookings/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking.id,
          roomId: convertData.roomId,
          guestIdProof: convertData.guestIdProof,
        }),
      });
      
      if (response.ok) {
        toast.success('Booking converted to check-in!');
        setConvertBookingOpen(false);
        setConvertData({ roomId: '', guestIdProof: '' });
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Conversion failed');
      }
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error('Conversion failed');
    }
  };
  
  const printBill = () => {
    window.print();
  };
  
  const availableRooms = rooms.filter(r => r.status === 'Available');
  const estimatedBill = checkInData.roomId
    ? rooms.find(r => r.id === checkInData.roomId)?.pricePerNight * checkInData.stayDuration
    : 0;
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Hotel className="w-16 h-16 mx-auto mb-4 text-blue-600 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Login page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-600 p-3 sm:p-4 rounded-full">
                <Hotel className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Hotel Management</CardTitle>
            <CardDescription>Reception System Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@hotel.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 text-center">
                <strong>Demo Credentials:</strong><br />
                Email: admin@hotel.com<br />
                Password: password123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Main dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hotel className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hotel Management</h1>
                <p className="text-sm text-gray-500">Reception System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Rooms</CardDescription>
              <CardTitle className="text-3xl font-bold">{stats?.totalRooms || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <Bed className="w-4 h-4 mr-1" />
                All rooms
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Available</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">{stats?.availableRooms || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <DoorOpen className="w-4 h-4 mr-1" />
                Ready to use
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Occupied</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">{stats?.occupiedRooms || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="w-4 h-4 mr-1" />
                Currently in use
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Check-ins</CardDescription>
              <CardTitle className="text-3xl font-bold text-purple-600">{stats?.todayCheckIns || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <UserPlus className="w-4 h-4 mr-1" />
                Arrivals
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Today's Check-outs</CardDescription>
              <CardTitle className="text-3xl font-bold text-orange-600">{stats?.todayCheckOuts || 0}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500">
                <LogOut className="w-4 h-4 mr-1" />
                Departures
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your daily reception tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-auto py-6 flex flex-col items-center space-y-2">
                    <UserPlus className="w-8 h-8" />
                    <span className="text-lg">New Check-In</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Guest Check-In</DialogTitle>
                    <DialogDescription>Register a new guest and assign a room</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="guestName">Guest Name</Label>
                      <Input
                        id="guestName"
                        value={checkInData.guestName}
                        onChange={(e) => setCheckInData({...checkInData, guestName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestPhone">Phone Number</Label>
                      <Input
                        id="guestPhone"
                        value={checkInData.guestPhone}
                        onChange={(e) => setCheckInData({...checkInData, guestPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="guestIdProof">ID Proof</Label>
                      <Input
                        id="guestIdProof"
                        placeholder="Passport/License Number"
                        value={checkInData.guestIdProof}
                        onChange={(e) => setCheckInData({...checkInData, guestIdProof: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="room">Select Room</Label>
                      <Select value={checkInData.roomId} onValueChange={(value) => setCheckInData({...checkInData, roomId: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose available room" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              Room {room.roomNumber} - {room.roomType} (${room.pricePerNight}/night)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Stay Duration (nights)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={checkInData.stayDuration}
                        onChange={(e) => setCheckInData({...checkInData, stayDuration: parseInt(e.target.value)})}
                      />
                    </div>
                    {estimatedBill > 0 && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Estimated Bill</p>
                        <p className="text-2xl font-bold text-blue-600">${estimatedBill}</p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCheckInOpen(false)}>Cancel</Button>
                    <Button onClick={handleCheckIn}>Check In</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center space-y-2">
                    <Calendar className="w-8 h-8" />
                    <span className="text-lg">New Booking</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Booking</DialogTitle>
                    <DialogDescription>Book a room for future arrival</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bookingGuestName">Guest Name</Label>
                      <Input
                        id="bookingGuestName"
                        value={bookingData.guestName}
                        onChange={(e) => setBookingData({...bookingData, guestName: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bookingPhone">Phone Number</Label>
                      <Input
                        id="bookingPhone"
                        value={bookingData.guestPhone}
                        onChange={(e) => setBookingData({...bookingData, guestPhone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="roomType">Room Type</Label>
                      <Select value={bookingData.roomType} onValueChange={(value) => setBookingData({...bookingData, roomType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose room type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Single">Single</SelectItem>
                          <SelectItem value="Double">Double</SelectItem>
                          <SelectItem value="Suite">Suite</SelectItem>
                          <SelectItem value="Deluxe">Deluxe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="checkInDate">Check-In Date</Label>
                      <Input
                        id="checkInDate"
                        type="date"
                        value={bookingData.checkInDate}
                        onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOutDate">Check-Out Date</Label>
                      <Input
                        id="checkOutDate"
                        type="date"
                        value={bookingData.checkOutDate}
                        onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        value={bookingData.notes}
                        onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreateBooking}>Create Booking</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col items-center space-y-2">
                    <DoorOpen className="w-8 h-8" />
                    <span className="text-lg">Checkout Guest</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Guest Check-Out</DialogTitle>
                    <DialogDescription>Select guest to checkout and generate bill</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Active Guest</Label>
                      <Select onValueChange={(value) => setSelectedCheckIn(activeCheckIns.find(c => c.id === value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose guest" />
                        </SelectTrigger>
                        <SelectContent>
                          {activeCheckIns.map(checkIn => (
                            <SelectItem key={checkIn.id} value={checkIn.id}>
                              {checkIn.guestName} - Room {checkIn.roomNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedCheckIn && (
                      <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Guest</p>
                          <p className="font-medium">{selectedCheckIn.guestName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Room</p>
                          <p className="font-medium">Room {selectedCheckIn.roomNumber} ({selectedCheckIn.roomType})</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Check-In Date</p>
                          <p className="font-medium">{format(new Date(selectedCheckIn.checkInDate), 'PPP')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Bill</p>
                          <p className="text-xl font-bold text-blue-600">${selectedCheckIn.estimatedBill}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Cancel</Button>
                    <Button onClick={handleCheckout} disabled={!selectedCheckIn}>Complete Checkout</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        
        {/* Rooms Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Room Status</CardTitle>
            <CardDescription>Overview of all rooms</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Price/Night</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rooms.map((room) => (
                    <TableRow key={room.id}>
                      <TableCell className="font-medium">{room.roomNumber}</TableCell>
                      <TableCell>{room.roomType}</TableCell>
                      <TableCell>${room.pricePerNight}</TableCell>
                      <TableCell>
                        <Badge variant={room.status === 'Available' ? 'default' : 'secondary'}>
                          {room.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Check-Ins and Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Check-Ins */}
          <Card>
            <CardHeader>
              <CardTitle>Active Check-Ins</CardTitle>
              <CardDescription>Guests currently staying</CardDescription>
            </CardHeader>
            <CardContent>
              {activeCheckIns.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No active check-ins</p>
              ) : (
                <div className="space-y-4">
                  {activeCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{checkIn.guestName}</p>
                          <p className="text-sm text-gray-500">{checkIn.guestPhone}</p>
                        </div>
                        <Badge>Room {checkIn.roomNumber}</Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium">Check-in:</span> {format(new Date(checkIn.checkInDate), 'PP')}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Expected checkout:</span> {format(new Date(checkIn.checkOutDate), 'PP')}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Estimated bill:</span> ${checkIn.estimatedBill}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Upcoming Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
              <CardDescription>Future reservations</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No upcoming bookings</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{booking.guestName}</p>
                          <p className="text-sm text-gray-500">{booking.guestPhone}</p>
                        </div>
                        <Badge variant="outline">{booking.roomType}</Badge>
                      </div>
                      <div className="text-sm space-y-1 mb-3">
                        <p className="text-gray-600">
                          <span className="font-medium">Check-in:</span> {format(new Date(booking.checkInDate), 'PP')}
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium">Check-out:</span> {format(new Date(booking.checkOutDate), 'PP')}
                        </p>
                        {booking.notes && (
                          <p className="text-gray-600">
                            <span className="font-medium">Notes:</span> {booking.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setConvertBookingOpen(true);
                        }}
                      >
                        Convert to Check-In
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Convert Booking Dialog */}
      <Dialog open={convertBookingOpen} onOpenChange={setConvertBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Booking to Check-In</DialogTitle>
            <DialogDescription>Assign a room and complete guest check-in</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><span className="font-medium">Guest:</span> {selectedBooking.guestName}</p>
                <p><span className="font-medium">Phone:</span> {selectedBooking.guestPhone}</p>
                <p><span className="font-medium">Room Type:</span> {selectedBooking.roomType}</p>
              </div>
              <div>
                <Label htmlFor="convertRoom">Select Room</Label>
                <Select value={convertData.roomId} onValueChange={(value) => setConvertData({...convertData, roomId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose available room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms
                      .filter(room => room.roomType === selectedBooking.roomType)
                      .map(room => (
                        <SelectItem key={room.id} value={room.id}>
                          Room {room.roomNumber} - {room.roomType} (${room.pricePerNight}/night)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="convertIdProof">Guest ID Proof</Label>
                <Input
                  id="convertIdProof"
                  placeholder="Passport/License Number"
                  value={convertData.guestIdProof}
                  onChange={(e) => setConvertData({...convertData, guestIdProof: e.target.value})}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConvertBookingOpen(false)}>Cancel</Button>
            <Button onClick={handleConvertBooking}>Complete Check-In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bill Dialog */}
      <Dialog open={billOpen} onOpenChange={setBillOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Guest Bill</DialogTitle>
            <DialogDescription>Final bill for checkout</DialogDescription>
          </DialogHeader>
          {bill && (
            <div className="space-y-6">
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold">Hotel Management</h2>
                <p className="text-gray-500">Reception System</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Guest Name</p>
                  <p className="font-medium">{bill.guestName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{bill.guestPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Number</p>
                  <p className="font-medium">{bill.roomNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Room Type</p>
                  <p className="font-medium">{bill.roomType}</p>
                </div>
              </div>
              
              <div className="border-t border-b py-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-In Date</span>
                  <span className="font-medium">{format(new Date(bill.checkInDate), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-Out Date</span>
                  <span className="font-medium">{format(new Date(bill.checkOutDate), 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights Stayed</span>
                  <span className="font-medium">{bill.nightsStayed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price per Night</span>
                  <span className="font-medium">${bill.pricePerNight}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-3xl font-bold text-blue-600">${bill.totalAmount}</span>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                <p>Thank you for staying with us!</p>
                <p>Bill generated on {format(new Date(bill.createdAt), 'PPP p')}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBillOpen(false)}>Close</Button>
            <Button onClick={printBill}>
              <FileText className="w-4 h-4 mr-2" />
              Print Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}