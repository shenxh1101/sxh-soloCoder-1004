import type { Booking } from '@/types';

export const bookings: Booking[] = [
  {
    id: 'b1',
    venueId: 'v1',
    venueName: '篮球场A区',
    venueType: 'basketball',
    date: '2026-06-08',
    timeSlot: '18:00-19:00',
    startTime: '18:00',
    endTime: '19:00',
    price: 50,
    status: 'confirmed',
    companions: [
      { id: 'c1', name: '张三', phone: '138****1234' },
      { id: 'c2', name: '李四', phone: '139****5678' }
    ],
    equipmentNote: '需要3个篮球',
    verifyCode: 'ABC12345',
    createTime: '2026-06-07T10:30:00Z',
    paymentRecord: {
      id: 'p1',
      amount: 50,
      payMethod: '微信支付',
      payTime: '2026-06-07T10:30:05Z',
      transactionId: '2026060712345678'
    }
  },
  {
    id: 'b2',
    venueId: 'v3',
    venueName: '羽毛球馆1号场',
    venueType: 'badminton',
    date: '2026-06-09',
    timeSlot: '19:00-20:00',
    startTime: '19:00',
    endTime: '20:00',
    price: 60,
    status: 'pending',
    companions: [{ id: 'c3', name: '王五', phone: '137****9012' }],
    equipmentNote: '租借羽毛球拍2副',
    verifyCode: 'DEF67890',
    createTime: '2026-06-08T09:15:00Z',
    paymentRecord: {
      id: 'p2',
      amount: 60,
      payMethod: '支付宝',
      payTime: '2026-06-08T09:15:10Z',
      transactionId: '2026060887654321'
    }
  },
  {
    id: 'b3',
    venueId: 'v5',
    venueName: '乒乓球室A',
    venueType: 'tabletennis',
    date: '2026-06-06',
    timeSlot: '15:00-16:00',
    startTime: '15:00',
    endTime: '16:00',
    price: 30,
    status: 'completed',
    companions: [],
    equipmentNote: '',
    verifyCode: 'GHI11111',
    createTime: '2026-06-05T14:00:00Z',
    paymentRecord: {
      id: 'p3',
      amount: 30,
      payMethod: '微信支付',
      payTime: '2026-06-05T14:00:05Z',
      transactionId: '2026060511112222'
    },
    review: {
      id: 'r1',
      rating: 5,
      content: '场地很干净，设施齐全，工作人员服务态度很好！',
      createTime: '2026-06-06T17:30:00Z'
    }
  },
  {
    id: 'b4',
    venueId: 'v2',
    venueName: '篮球场B区',
    venueType: 'basketball',
    date: '2026-06-05',
    timeSlot: '20:00-21:00',
    startTime: '20:00',
    endTime: '21:00',
    price: 40,
    status: 'cancelled',
    companions: [{ id: 'c4', name: '赵六', phone: '136****3456' }],
    equipmentNote: '',
    verifyCode: 'JKL22222',
    createTime: '2026-06-04T16:20:00Z'
  },
  {
    id: 'b5',
    venueId: 'v4',
    venueName: '羽毛球馆2号场',
    venueType: 'badminton',
    date: '2026-06-10',
    timeSlot: '10:00-11:00',
    startTime: '10:00',
    endTime: '11:00',
    price: 30,
    status: 'confirmed',
    companions: [
      { id: 'c5', name: '钱七', phone: '135****7890' },
      { id: 'c6', name: '孙八', phone: '134****1234' }
    ],
    equipmentNote: '需要羽毛球1桶',
    verifyCode: 'MNO33333',
    createTime: '2026-06-08T11:45:00Z',
    paymentRecord: {
      id: 'p4',
      amount: 30,
      payMethod: '微信支付',
      payTime: '2026-06-08T11:45:15Z',
      transactionId: '2026060833334444'
    }
  },
  {
    id: 'b6',
    venueId: 'v6',
    venueName: '乒乓球室B',
    venueType: 'tabletennis',
    date: '2026-06-03',
    timeSlot: '14:00-15:00',
    startTime: '14:00',
    endTime: '15:00',
    price: 25,
    status: 'completed',
    companions: [{ id: 'c7', name: '周九', phone: '133****5678' }],
    equipmentNote: '',
    verifyCode: 'PQR44444',
    createTime: '2026-06-02T09:00:00Z',
    paymentRecord: {
      id: 'p5',
      amount: 25,
      payMethod: '支付宝',
      payTime: '2026-06-02T09:00:08Z',
      transactionId: '2026060255556666'
    },
    review: {
      id: 'r2',
      rating: 4,
      content: '环境安静，适合休闲运动，唯一缺点是空调不太够。',
      createTime: '2026-06-03T16:00:00Z'
    }
  }
];
