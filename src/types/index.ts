export type VenueType = 'basketball' | 'badminton' | 'tabletennis';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';

export type MessageType = 'booking' | 'reminder' | 'maintenance' | 'lostfound';

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

export interface Venue {
  id: string;
  name: string;
  type: VenueType;
  location: string;
  image: string;
  openTime: string;
  closeTime: string;
  description: string;
  priceInfo: string;
  facilities: string[];
  rating: number;
  reviewCount: number;
  timeSlots: TimeSlot[];
}

export interface Companion {
  id: string;
  name: string;
  phone: string;
}

export interface Booking {
  id: string;
  venueId: string;
  venueName: string;
  venueType: VenueType;
  date: string;
  timeSlot: string;
  startTime: string;
  endTime: string;
  price: number;
  status: BookingStatus;
  companions: Companion[];
  equipmentNote: string;
  verifyCode: string;
  createTime: string;
  paymentRecord?: PaymentRecord;
  review?: Review;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  payMethod: string;
  payTime: string;
  transactionId: string;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  createTime: string;
}

export interface Message {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  time: string;
  read: boolean;
  relatedBookingId?: string;
}

export interface AdminStats {
  todayBookings: number;
  todayRevenue: number;
  venueUsage: { venueName: string; usage: number }[];
}
