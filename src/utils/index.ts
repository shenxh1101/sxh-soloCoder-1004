import type { VenueType, BookingStatus, MessageType } from '@/types';

export const getVenueTypeLabel = (type: VenueType): string => {
  const map: Record<VenueType, string> = {
    basketball: '篮球',
    badminton: '羽毛球',
    tabletennis: '乒乓球'
  };
  return map[type] || type;
};

export const getVenueTypeColor = (type: VenueType): string => {
  const map: Record<VenueType, string> = {
    basketball: '#ff6b35',
    badminton: '#36bffa',
    tabletennis: '#722ed1'
  };
  return map[type] || '#165dff';
};

export const getBookingStatusLabel = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: '待确认',
    confirmed: '已预约',
    completed: '已完成',
    cancelled: '已取消',
    expired: '已过期'
  };
  return map[status] || status;
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  const map: Record<BookingStatus, string> = {
    pending: '#ff7d00',
    confirmed: '#165dff',
    completed: '#00b42a',
    cancelled: '#86909c',
    expired: '#f53f3f'
  };
  return map[status] || '#1d2129';
};

export const getMessageTypeLabel = (type: MessageType): string => {
  const map: Record<MessageType, string> = {
    booking: '预约通知',
    reminder: '开场提醒',
    maintenance: '场地维护',
    lostfound: '失物招领'
  };
  return map[type] || type;
};

export const getMessageTypeColor = (type: MessageType): string => {
  const map: Record<MessageType, string> = {
    booking: '#165dff',
    reminder: '#ff7d00',
    maintenance: '#722ed1',
    lostfound: '#00b42a'
  };
  return map[type] || '#1d2129';
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (dateStr: string): string => {
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
};

export const generateVerifyCode = (): string => {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
