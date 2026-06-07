import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import { useAppStore } from '@/store/useAppStore';
import { getVenueTypeLabel, getVenueTypeColor, formatDate, generateVerifyCode, generateId } from '@/utils';
import type { TimeSlot, Companion } from '@/types';

const VenueDetailPage: React.FC = () => {
  const router = useRouter();
  const { getVenueById, addBooking, addMessage, addCompanion, bookings, markTimeSlotBooked } = useAppStore();
  const [venue, setVenue] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date().toISOString()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [equipmentNote, setEquipmentNote] = useState('');
  const [newCompanionName, setNewCompanionName] = useState('');
  const [newCompanionPhone, setNewCompanionPhone] = useState('');
  const [showAddCompanion, setShowAddCompanion] = useState(false);

  useEffect(() => {
    const id = router.params.id as string;
    console.log('[VenueDetailPage] 场地ID:', id);
    if (id) {
      const v = getVenueById(id);
      if (v) {
        setVenue(v);
        console.log('[VenueDetailPage] 加载场地信息:', v.name);
      } else {
        console.error('[VenueDetailPage] 场地不存在:', id);
        Taro.showToast({ title: '场地不存在', icon: 'error' });
      }
    }
  }, [router.params.id, getVenueById]);

  const bookedSlotIds = useMemo(() => {
    if (!venue) return [];
    const booked = bookings
      .filter(
        (b) =>
          b.venueId === venue.id &&
          b.date === selectedDate &&
          b.status !== 'cancelled'
      )
      .map((b) => b.startTime + '-' + b.endTime);
    console.log('[VenueDetailPage] 已预约时段:', booked);
    return booked;
  }, [venue, selectedDate, bookings]);

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = formatDate(date.toISOString());
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      result.push({
        date: dateStr,
        day: weekDays[date.getDay()],
        dayNum: date.getDate()
      });
    }
    return result;
  }, []);

  const handleSlotSelect = (slot: TimeSlot) => {
    console.log('[VenueDetailPage] 选择时段:', slot.startTime, slot.endTime);
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const handleAddCompanion = () => {
    if (!newCompanionName.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    const nameToAdd = newCompanionName.trim();
    const exists = companions.some((c) => c.name === nameToAdd);
    if (exists) {
      Taro.showToast({ title: '该同行人已添加', icon: 'none' });
      return;
    }
    const newCompanion: Companion = {
      id: generateId(),
      name: nameToAdd,
      phone: newCompanionPhone.trim() || '未填写'
    };
    console.log('[VenueDetailPage] 添加同行人:', newCompanion);
    setCompanions([...companions, newCompanion]);
    setNewCompanionName('');
    setNewCompanionPhone('');
    setShowAddCompanion(false);
  };

  const handleRemoveCompanion = (id: string) => {
    console.log('[VenueDetailPage] 移除同行人:', id);
    setCompanions(companions.filter((c) => c.id !== id));
  };

  const handleSubmitBooking = () => {
    if (!venue || !selectedSlot) return;

    console.log('[VenueDetailPage] 提交预约:', {
      venue: venue.name,
      date: selectedDate,
      slot: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
      companions: companions.length,
      equipmentNote
    });

    const verifyCode = generateVerifyCode();
    const bookingId = generateId();

    const newBooking = {
      id: bookingId,
      venueId: venue.id,
      venueName: venue.name,
      venueType: venue.type,
      date: selectedDate,
      timeSlot: `${selectedSlot.startTime}-${selectedSlot.endTime}`,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      price: selectedSlot.price,
      status: 'confirmed' as const,
      companions,
      equipmentNote,
      verifyCode,
      createTime: new Date().toISOString(),
      paymentRecord: {
        id: generateId(),
        amount: selectedSlot.price,
        payMethod: '微信支付',
        payTime: new Date().toISOString(),
        transactionId: `TXN${Date.now()}`
      }
    };

    addBooking(newBooking);
    markTimeSlotBooked(venue.id, selectedDate, `${selectedSlot.startTime}-${selectedSlot.endTime}`);

    companions.forEach((c) => {
      addCompanion(bookingId, c);
    });

    addMessage({
      id: generateId(),
      type: 'booking',
      title: '预约成功',
      content: `您已成功预约${venue.name} ${selectedDate} ${selectedSlot.startTime}-${selectedSlot.endTime}，请准时到场。核销码：${verifyCode}`,
      time: new Date().toISOString(),
      read: false,
      relatedBookingId: bookingId
    });

    Taro.showModal({
      title: '预约成功',
      content: `核销码：${verifyCode}\n\n预约信息已发送到消息中心，请准时到场。`,
      showCancel: false,
      success: () => {
        setShowBookingModal(false);
        setSelectedSlot(null);
        setCompanions([]);
        setEquipmentNote('');
      }
    }).catch((err) => {
      console.error('[VenueDetailPage] 预约成功弹窗失败:', err);
    });
  };

  if (!venue) {
    return (
      <View className={styles.loading}>
        <Text className={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  const typeColor = getVenueTypeColor(venue.type);

  return (
    <View className={styles.container}>
      <Image
        className={styles.banner}
        src={venue.image}
        mode='aspectFill'
        onError={(e) => console.error('[VenueDetailPage] 图片加载失败:', e.detail)}
      />

      <ScrollView className={styles.content} enhanced>
        <View className={styles.headerSection}>
          <View className={styles.titleRow}>
            <Text className={styles.venueName}>{venue.name}</Text>
            <Tag
              text={getVenueTypeLabel(venue.type)}
              bgColor={typeColor}
            />
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.rating}>⭐ {venue.rating}</Text>
            <Text className={styles.reviewCount}>({venue.reviewCount}条评价)</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoText}>📍 {venue.location}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoText}>⏰ {venue.openTime}-{venue.closeTime}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>收费说明</Text>
          <View className={styles.priceCard}>
            <Text className={styles.priceText}>{venue.priceInfo}</Text>
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>场地设施</Text>
          <View className={styles.facilities}>
            {venue.facilities.map((facility: string, index: number) => (
              <View key={index} className={styles.facilityTag}>
                <Text className={styles.facilityText}>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>场地介绍</Text>
          <Text className={styles.description}>{venue.description}</Text>
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>选择日期</Text>
          <ScrollView
            className={styles.dateScroll}
            scrollX
            enhanced
            showScrollbar={false}
          >
            <View className={styles.dateContainer}>
              {dates.map((d) => (
                <View
                  key={d.date}
                  className={classnames(
                    styles.dateItem,
                    selectedDate === d.date && styles.dateItemActive
                  )}
                  onClick={() => setSelectedDate(d.date)}
                >
                  <Text
                    className={classnames(
                      styles.dateDay,
                      selectedDate === d.date && styles.dateDayActive
                    )}
                  >
                    {d.day}
                  </Text>
                  <Text
                    className={classnames(
                      styles.dateNum,
                      selectedDate === d.date && styles.dateNumActive
                    )}
                  >
                    {d.dayNum}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <TimeSlotPicker
          slots={venue.timeSlots}
          selectedSlotId={selectedSlot?.id}
          onSelect={handleSlotSelect}
          bookedSlotIds={bookedSlotIds}
        />

        <View className={styles.bottomPadding} />
      </ScrollView>

      {showBookingModal && selectedSlot && (
        <View className={styles.modal}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>确认预约</Text>
              <Text className={styles.modalClose} onClick={() => setShowBookingModal(false)}>
                ✕
              </Text>
            </View>

            <View className={styles.bookingSummary}>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>场地</Text>
                <Text className={styles.summaryValue}>{venue.name}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>日期</Text>
                <Text className={styles.summaryValue}>{selectedDate}</Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>时段</Text>
                <Text className={styles.summaryValue}>
                  {selectedSlot.startTime}-{selectedSlot.endTime}
                </Text>
              </View>
              <View className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>费用</Text>
                <Text className={classnames(styles.summaryValue, styles.price)}>
                  ¥{selectedSlot.price}
                </Text>
              </View>
            </View>

            <View className={styles.companionSection}>
              <View className={styles.sectionHeader}>
                <Text className={styles.sectionLabel}>同行人</Text>
                <Button
                  className={styles.addCompanionBtn}
                  onClick={() => setShowAddCompanion(true)}
                >
                  + 添加
                </Button>
              </View>
              {companions.length > 0 ? (
                <View className={styles.companionList}>
                  {companions.map((c) => (
                    <View key={c.id} className={styles.companionItem}>
                      <Text className={styles.companionName}>{c.name}</Text>
                      <Text className={styles.companionPhone}>{c.phone}</Text>
                      <Text
                        className={styles.removeCompanion}
                        onClick={() => handleRemoveCompanion(c.id)}
                      >
                        删除
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text className={styles.emptyCompanion}>暂无同行人，可点击添加</Text>
              )}
            </View>

            {showAddCompanion && (
              <View className={styles.addCompanionForm}>
                <Input
                  className={styles.formInput}
                  placeholder='姓名'
                  value={newCompanionName}
                  onInput={(e) => setNewCompanionName(e.detail.value)}
                />
                <Input
                  className={styles.formInput}
                  placeholder='手机号（选填）'
                  value={newCompanionPhone}
                  onInput={(e) => setNewCompanionPhone(e.detail.value)}
                />
                <View className={styles.formActions}>
                  <Button
                    className={classnames(styles.formBtn, styles.formBtnCancel)}
                    onClick={() => setShowAddCompanion(false)}
                  >
                    取消
                  </Button>
                  <Button
                    className={classnames(styles.formBtn, styles.formBtnConfirm)}
                    onClick={handleAddCompanion}
                  >
                    确定
                  </Button>
                </View>
              </View>
            )}

            <View className={styles.equipmentSection}>
              <Text className={styles.sectionLabel}>器材需求（选填）</Text>
              <Textarea
                className={styles.equipmentInput}
                placeholder='如需租借器材请在此备注，如：需要篮球2个、羽毛球拍1副等'
                value={equipmentNote}
                onInput={(e) => setEquipmentNote(e.detail.value)}
              />
            </View>

            <View className={styles.paymentInfo}>
              <Text className={styles.paymentLabel}>支付方式</Text>
              <Text className={styles.paymentValue}>微信支付</Text>
            </View>

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowBookingModal(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleSubmitBooking}
              >
                确认支付 ¥{selectedSlot.price}
              </Button>
            </View>

            <Text className={styles.tipText}>
              💡 提前2小时取消可全额退款，逾期取消收取30%手续费
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default VenueDetailPage;
