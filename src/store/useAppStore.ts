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
  markTimeSlotBooked: (venueId: string, date: string, slotId: string) => void;
  markTimeSlotAvailable: (venueId: string, date: string, slotId: string) => void;
  isTimeSlotBooked: (venueId: string, date: string, slotId: string) => boolean;
  getBookedSlotIds: (venueId: string, date: string, excludeBookingId?: string) => string[];
  rescheduleBooking: (bookingId: string, newDate: string, newSlotId: string, newSlotTimeId: string, newPrice: number) => boolean;
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

  cancelBooking: (id) => {
    const state = get();
    const booking = state.bookings.find((b) => b.id === id);
    if (!booking) {
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      }));
      return;
    }

    const venue = state.venues.find((v) => v.id === booking.venueId);
    const slot = venue?.timeSlots.find(
      (s) => s.startTime === booking.startTime && s.endTime === booking.endTime
    );

    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      ),
      venues: slot
        ? state.venues.map((v) => {
            if (v.id !== booking.venueId) return v;
            return {
              ...v,
              timeSlots: v.timeSlots.map((s) =>
                s.id === slot.id ? { ...s, available: true } : s
              )
            };
          })
        : state.venues
    }));
  },

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

  markTimeSlotBooked: (venueId, date, slotId) => {
    console.log('[Store] 标记时段已预约:', { venueId, date, slotId });
    set((state) => ({
      venues: state.venues.map((v) =>
        v.id === venueId
          ? {
              ...v,
              timeSlots: v.timeSlots.map((s) =>
                s.id === slotId ? { ...s, available: false } : s
              )
            }
          : v
      )
    }));
  },

  markTimeSlotAvailable: (venueId, date, slotId) => {
    console.log('[Store] 标记时段可用:', { venueId, date, slotId });
    set((state) => ({
      venues: state.venues.map((v) =>
        v.id === venueId
          ? {
              ...v,
              timeSlots: v.timeSlots.map((s) =>
                s.id === slotId ? { ...s, available: true } : s
              )
            }
          : v
      )
    }));
  },

  isTimeSlotBooked: (venueId, date, slotId) => {
    const state = get();
    const venue = state.venues.find((v) => v.id === venueId);
    if (!venue) return false;

    const slot = venue.timeSlots.find((s) => s.id === slotId);
    if (!slot) return false;

    const exists = state.bookings.some(
      (b) =>
        b.venueId === venueId &&
        b.date === date &&
        b.startTime === slot.startTime &&
        b.endTime === slot.endTime &&
        b.status !== 'cancelled'
    );
    return exists;
  },

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

    console.log('[Store] getBookedSlotIds:', { venueId, date, excludeBookingId, bookedSlotIds });
    return bookedSlotIds;
  },

  rescheduleBooking: (bookingId, newDate, newSlotTimeRange, newSlotTimeId, newPrice) => {
    console.log('[Store] 改期:', { bookingId, newDate, newSlotTimeRange, newSlotTimeId, newPrice });
    const state = get();
    const booking = state.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;

    const venueId = booking.venueId;
    const venue = state.venues.find((v) => v.id === venueId);
    if (!venue) return false;

    const oldSlot = venue.timeSlots.find(
      (s) => s.startTime === booking.startTime && s.endTime === booking.endTime
    );
    const newSlot = venue.timeSlots.find((s) => s.id === newSlotTimeId);
    if (!newSlot) return false;

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
      ),
      venues: state.venues.map((v) => {
        if (v.id !== venueId) return v;
        return {
          ...v,
          timeSlots: v.timeSlots.map((s) => {
            if (oldSlot && s.id === oldSlot.id) {
              return { ...s, available: true };
            }
            if (s.id === newSlotTimeId) {
              return { ...s, available: false };
            }
            return s;
          })
        };
      })
    }));

    return true;
  }
}));
