import { create } from 'zustand';
import type { Venue, Booking, Message, Companion, AdminStats, Maintenance } from '@/types';
import { venues } from '@/data/venues';
import { bookings } from '@/data/bookings';
import { messages } from '@/data/messages';

interface AppState {
  venues: Venue[];
  bookings: Booking[];
  messages: Message[];
  maintenances: Maintenance[];
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
  getUnavailableSlotIds: (venueId: string, date: string, excludeBookingId?: string) => string[];
  getBookedSlotIds: (venueId: string, date: string, excludeBookingId?: string) => string[];
  getMaintenanceSlotIds: (venueId: string, date: string) => string[];
  addMaintenance: (maintenance: Maintenance) => void;
  removeMaintenance: (id: string) => void;
  rescheduleBooking: (
    bookingId: string,
    newDate: string,
    newSlotTimeRange: string,
    newSlotTimeId: string,
    newPrice: number
  ) => boolean;
}

export const useAppStore = create<AppState>((set, get) => ({
  venues,
  bookings,
  messages,
  maintenances: [],
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

  getUnreadMessageCount: () => get().messages.filter((m) => !m.read).length,

  getBookedSlotIds: (venueId, date, excludeBookingId) => {
    const state = get();
    const venue = state.venues.find((v) => v.id === venueId);
    if (!venue) return [];

    const relatedBookings = state.bookings.filter(
      (b) =>
        b.venueId === venueId &&
        b.date === date &&
        b.status !== 'cancelled' &&
        b.id !== excludeBookingId
    );

    const bookedSlotIds: string[] = [];
    relatedBookings.forEach((b) => {
      const slot = venue.timeSlots.find(
        (s) => s.startTime === b.startTime && s.endTime === b.endTime
      );
      if (slot) {
        bookedSlotIds.push(slot.id);
      }
    });

    return bookedSlotIds;
  },

  getMaintenanceSlotIds: (venueId, date) => {
    const state = get();
    return state.maintenances
      .filter((m) => m.venueId === venueId && m.date === date)
      .map((m) => m.slotId);
  },

  getUnavailableSlotIds: (venueId, date, excludeBookingId) => {
    const booked = get().getBookedSlotIds(venueId, date, excludeBookingId);
    const maintenance = get().getMaintenanceSlotIds(venueId, date);
    return [...new Set([...booked, ...maintenance])];
  },

  addMaintenance: (maintenance) =>
    set((state) => ({
      maintenances: [maintenance, ...state.maintenances]
    })),

  removeMaintenance: (id) =>
    set((state) => ({
      maintenances: state.maintenances.filter((m) => m.id !== id)
    })),

  rescheduleBooking: (bookingId, newDate, newSlotTimeRange, newSlotTimeId, newPrice) => {
    console.log('[Store] 改期:', { bookingId, newDate, newSlotTimeRange, newSlotTimeId, newPrice });
    const state = get();
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const [newStartTime, newEndTime] = newSlotTimeRange.split('-');

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              date: newDate,
              timeSlot: newSlotTimeRange,
              startTime: newStartTime,
              endTime: newEndTime,
              price: newPrice
            }
          : b
      )
    }));

    return true;
  }
}));
