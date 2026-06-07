import { create } from 'zustand';
import type { Venue, Booking, Message, Companion, AdminStats } from '@/types';
import { venues } from '@/data/venues';
import { bookings } from '@/data/bookings';
import { messages } from '@/data/messages';

interface AppState {
  venues: Venue[];
  bookings: Booking[];
  messages: Message[];
  currentVenueFilter: string;
  adminStats: AdminStats;
  setVenueFilter: (filter: string) => void;
  getVenueById: (id: string) => Venue | undefined;
  getBookingById: (id: string) => Booking | undefined;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, updates: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  addReview: (bookingId: string, rating: number, content: string) => void;
  markMessageRead: (id: string) => void;
  addMessage: (message: Message) => void;
  addCompanion: (bookingId: string, companion: Companion) => void;
  removeCompanion: (bookingId: string, companionId: string) => void;
  getUnreadMessageCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  venues,
  bookings,
  messages,
  currentVenueFilter: 'all',
  adminStats: {
    todayBookings: 12,
    todayRevenue: 580,
    venueUsage: [
      { venueName: '篮球场A', usage: 75 },
      { venueName: '羽毛球馆1号', usage: 60 },
      { venueName: '乒乓球室', usage: 45 },
      { venueName: '篮球场B', usage: 80 }
    ]
  },

  setVenueFilter: (filter) => set({ currentVenueFilter: filter }),

  getVenueById: (id) => get().venues.find((v) => v.id === id),

  getBookingById: (id) => get().bookings.find((b) => b.id === id),

  addBooking: (booking) =>
    set((state) => ({
      bookings: [booking, ...state.bookings]
    })),

  updateBooking: (id, updates) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, ...updates } : b
      )
    })),

  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      )
    })),

  addReview: (bookingId, rating, content) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              review: {
                id: Date.now().toString(),
                rating,
                content,
                createTime: new Date().toISOString()
              }
            }
          : b
      )
    })),

  markMessageRead: (id) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, read: true } : m
      )
    })),

  addMessage: (message) =>
    set((state) => ({
      messages: [message, ...state.messages]
    })),

  addCompanion: (bookingId, companion) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, companions: [...b.companions, companion] }
          : b
      )
    })),

  removeCompanion: (bookingId, companionId) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, companions: b.companions.filter((c) => c.id !== companionId) }
          : b
      )
    })),

  getUnreadMessageCount: () => get().messages.filter((m) => !m.read).length
}));
