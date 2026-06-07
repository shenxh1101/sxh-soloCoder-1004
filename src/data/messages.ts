import type { Message } from '@/types';

export const messages: Message[] = [
  {
    id: 'm1',
    type: 'booking',
    title: '预约成功',
    content: '您已成功预约篮球场A区 6月8日 18:00-19:00，请准时到场。核销码：ABC12345',
    time: '2026-06-07T10:30:00Z',
    read: false,
    relatedBookingId: 'b1'
  },
  {
    id: 'm2',
    type: 'reminder',
    title: '开场提醒',
    content: '您预约的羽毛球馆1号场将于1小时后开始，请提前15分钟到场核验。',
    time: '2026-06-09T18:00:00Z',
    read: false,
    relatedBookingId: 'b2'
  },
  {
    id: 'm3',
    type: 'maintenance',
    title: '场地维护通知',
    content: '篮球场B区将于6月15日进行地板维护，开放时间调整为12:00-22:00。已预约的用户将收到退款。',
    time: '2026-06-08T08:00:00Z',
    read: false
  },
  {
    id: 'm4',
    type: 'lostfound',
    title: '失物招领',
    content: '工作人员在羽毛球馆1号场捡到一副红色羽毛球拍，请失主携带有效证件到服务台领取。',
    time: '2026-06-07T16:30:00Z',
    read: true
  },
  {
    id: 'm5',
    type: 'booking',
    title: '预约已取消',
    content: '您预约的篮球场B区 6月5日 20:00-21:00 已取消，退款将在1-3个工作日内到账。',
    time: '2026-06-04T18:00:00Z',
    read: true,
    relatedBookingId: 'b4'
  },
  {
    id: 'm6',
    type: 'reminder',
    title: '评价邀请',
    content: '您已完成乒乓球室A的使用，欢迎评价您的运动体验，帮助其他用户选择合适的场地。',
    time: '2026-06-06T18:00:00Z',
    read: true,
    relatedBookingId: 'b3'
  },
  {
    id: 'm7',
    type: 'maintenance',
    title: '场馆关闭通知',
    content: '端午节期间（6月10日）所有场馆开放时间调整为10:00-18:00，请合理安排预约时间。',
    time: '2026-06-06T09:00:00Z',
    read: true
  },
  {
    id: 'm8',
    type: 'lostfound',
    title: '失物招领',
    content: '在乒乓球室B捡到一个蓝色运动水杯，杯身有Nike标志，请失主联系物业认领。',
    time: '2026-06-05T14:00:00Z',
    read: true
  }
];
