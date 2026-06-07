import type { Venue } from '@/types';

const generateTimeSlots = (): Venue['timeSlots'] => {
  const slots: Venue['timeSlots'] = [];
  const startHour = 8;
  const endHour = 22;
  
  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(hour + 1).padStart(2, '0')}:00`;
    const available = Math.random() > 0.3;
    const price = 30 + Math.floor(Math.random() * 30);
    
    slots.push({
      id: `slot-${hour}`,
      startTime,
      endTime,
      available,
      price
    });
  }
  
  return slots;
};

export const venues: Venue[] = [
  {
    id: 'v1',
    name: '篮球场A区',
    type: 'basketball',
    location: '社区体育馆1层东侧',
    image: 'https://picsum.photos/id/1058/750/400',
    openTime: '08:00',
    closeTime: '22:00',
    description: '标准室内篮球场，配备专业木质地板和篮球架，可容纳20人同时运动。',
    priceInfo: '50元/小时，会员享8折优惠',
    facilities: ['木质地板', '专业篮架', '休息座椅', '饮水设备', '空调'],
    rating: 4.8,
    reviewCount: 128,
    timeSlots: generateTimeSlots()
  },
  {
    id: 'v2',
    name: '篮球场B区',
    type: 'basketball',
    location: '社区体育馆1层西侧',
    image: 'https://picsum.photos/id/1060/750/400',
    openTime: '08:00',
    closeTime: '22:00',
    description: '室外篮球场，配备LED灯光，夜间也可使用。',
    priceInfo: '40元/小时，灯光费另收10元/小时',
    facilities: ['塑胶地面', '专业篮架', 'LED灯光', '休息区'],
    rating: 4.5,
    reviewCount: 86,
    timeSlots: generateTimeSlots()
  },
  {
    id: 'v3',
    name: '羽毛球馆1号场',
    type: 'badminton',
    location: '社区体育馆2层',
    image: 'https://picsum.photos/id/1067/750/400',
    openTime: '08:00',
    closeTime: '22:00',
    description: '专业羽毛球场，PVC运动地板，防滑耐磨。',
    priceInfo: '60元/小时，上午场(8-12点)享半价',
    facilities: ['PVC地板', '专业球网', '休息座椅', '空调', '储物柜'],
    rating: 4.9,
    reviewCount: 256,
    timeSlots: generateTimeSlots()
  },
  {
    id: 'v4',
    name: '羽毛球馆2号场',
    type: 'badminton',
    location: '社区体育馆2层',
    image: 'https://picsum.photos/id/1078/750/400',
    openTime: '08:00',
    closeTime: '22:00',
    description: '专业羽毛球场，适合双打比赛。',
    priceInfo: '60元/小时，会员享8折优惠',
    facilities: ['PVC地板', '专业球网', '休息座椅', '空调'],
    rating: 4.7,
    reviewCount: 178,
    timeSlots: generateTimeSlots()
  },
  {
    id: 'v5',
    name: '乒乓球室A',
    type: 'tabletennis',
    location: '社区体育馆3层',
    image: 'https://picsum.photos/id/1079/750/400',
    openTime: '08:00',
    closeTime: '21:00',
    description: '配备6张专业乒乓球台，适合单打和双打。',
    priceInfo: '30元/小时/台，租拍5元/次',
    facilities: ['红双喜球台', '防滑地板', '休息区', '空调'],
    rating: 4.6,
    reviewCount: 95,
    timeSlots: generateTimeSlots()
  },
  {
    id: 'v6',
    name: '乒乓球室B',
    type: 'tabletennis',
    location: '社区活动中心',
    image: 'https://picsum.photos/id/1080/750/400',
    openTime: '09:00',
    closeTime: '20:00',
    description: '小型乒乓球室，配备4张球台，环境安静。',
    priceInfo: '25元/小时/台',
    facilities: ['专业球台', '防滑地板', '休息区'],
    rating: 4.4,
    reviewCount: 52,
    timeSlots: generateTimeSlots()
  }
];
