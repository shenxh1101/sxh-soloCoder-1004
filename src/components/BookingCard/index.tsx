import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import {
  getVenueTypeLabel,
  getVenueTypeColor,
  getBookingStatusLabel,
  getBookingStatusColor,
  formatDate,
  generateId
} from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { Booking, TimeSlot } from '@/types';

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const { cancelBooking, addReview, addMessage, rescheduleBooking, getVenueById, bookings } = useAppStore();
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showVerifyCode, setShowVerifyCode] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState(formatDate(new Date().toISOString()));
  const [rescheduleSlot, setRescheduleSlot] = useState<TimeSlot | null>(null);

  const venue = useMemo(() => getVenueById(booking.venueId), [booking.venueId, getVenueById]);

  const rescheduleDates = useMemo(() => {
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

  const rescheduleBookedSlotIds = useMemo(() => {
    if (!venue) return [];
    const booked = bookings
      .filter(
        (b) =>
          b.id !== booking.id &&
          b.venueId === venue.id &&
          b.date === rescheduleDate &&
          b.status !== 'cancelled'
      )
      .map((b) => b.startTime + '-' + b.endTime);
    return booked;
  }, [venue, rescheduleDate, bookings, booking.id]);

  const statusColor = getBookingStatusColor(booking.status);
  const typeColor = getVenueTypeColor(booking.venueType);

  const handleCancel = () => {
    console.log('[BookingCard] 取消预约:', booking.id);
    Taro.showModal({
      title: '取消预约',
      content: '确定要取消该预约吗？提前2小时取消可全额退款，逾期取消将收取30%手续费。',
      success: (res) => {
        if (res.confirm) {
          cancelBooking(booking.id);
          addMessage({
            id: generateId(),
            type: 'booking',
            title: '预约已取消',
            content: `您预约的${booking.venueName} ${formatDate(booking.date)} ${booking.timeSlot} 已取消，退款将在1-3个工作日内到账。`,
            time: new Date().toISOString(),
            read: false,
            relatedBookingId: booking.id
          });
          Taro.showToast({ title: '取消成功', icon: 'success' });
        }
      }
    }).catch((err) => {
      console.error('[BookingCard] 取消预约弹窗失败:', err);
    });
  };

  const handleReschedule = () => {
    console.log('[BookingCard] 改期:', booking.id);
    setShowReschedule(true);
    setRescheduleDate(formatDate(new Date().toISOString()));
    setRescheduleSlot(null);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleSlot) {
      Taro.showToast({ title: '请选择新的时段', icon: 'none' });
      return;
    }
    console.log('[BookingCard] 确认改期:', booking.id, rescheduleDate, rescheduleSlot);

    Taro.showModal({
      title: '确认改期',
      content: `确定要将预约改期到 ${rescheduleDate} ${rescheduleSlot.startTime}-${rescheduleSlot.endTime} 吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = rescheduleBooking(
            booking.id,
            rescheduleDate,
            `${rescheduleSlot.startTime}-${rescheduleSlot.endTime}`,
            rescheduleSlot.price
          );
          if (success) {
            addMessage({
              id: generateId(),
              type: 'booking',
              title: '改期成功',
              content: `您预约的${booking.venueName}已改期到 ${rescheduleDate} ${rescheduleSlot.startTime}-${rescheduleSlot.endTime}。`,
              time: new Date().toISOString(),
              read: false,
              relatedBookingId: booking.id
            });
            Taro.showToast({ title: '改期成功', icon: 'success' });
            setShowReschedule(false);
          } else {
            Taro.showToast({ title: '改期失败，请重试', icon: 'error' });
          }
        }
      }
    }).catch((err) => {
      console.error('[BookingCard] 改期确认弹窗失败:', err);
    });
  };

  const handleShowVerify = () => {
    console.log('[BookingCard] 显示核销码:', booking.id);
    setShowVerifyCode(true);
  };

  const handleSubmitReview = () => {
    if (!reviewContent.trim()) {
      Taro.showToast({ title: '请填写评价内容', icon: 'none' });
      return;
    }
    console.log('[BookingCard] 提交评价:', booking.id, rating, reviewContent);
    addReview(booking.id, rating, reviewContent);
    setShowReview(false);
    setReviewContent('');
    Taro.showToast({ title: '评价成功', icon: 'success' });
  };

  const handleViewPayment = () => {
    if (!booking.paymentRecord) {
      Taro.showModal({
        title: '付款记录',
        content: '该订单暂无付款记录，可能是预约尚未完成支付或支付信息未同步。',
        showCancel: false
      }).catch((err) => {
        console.error('[BookingCard] 显示无付款记录弹窗失败:', err);
      });
      return;
    }
    console.log('[BookingCard] 查看付款记录:', booking.paymentRecord);
    Taro.showModal({
      title: '付款记录',
      content: `金额：¥${booking.paymentRecord.amount}\n支付方式：${booking.paymentRecord.payMethod}\n支付时间：${formatDate(booking.paymentRecord.payTime)}\n交易单号：${booking.paymentRecord.transactionId}`,
      showCancel: false
    }).catch((err) => {
      console.error('[BookingCard] 显示付款记录失败:', err);
    });
  };

  const handleViewVenue = () => {
    console.log('[BookingCard] 查看场地详情:', booking.venueId);
    Taro.navigateTo({
      url: `/pages/venue-detail/index?id=${booking.venueId}`
    }).catch((err) => {
      console.error('[BookingCard] 跳转场地详情失败:', err);
    });
  };

  const showPaymentButton = ['pending', 'confirmed', 'completed'].includes(booking.status);

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <View className={styles.venueInfo} onClick={handleViewVenue}>
          <Text className={styles.venueName}>{booking.venueName}</Text>
          <Tag
            text={getVenueTypeLabel(booking.venueType)}
            bgColor={typeColor}
            size='sm'
          />
        </View>
        <Tag
          text={getBookingStatusLabel(booking.status)}
          bgColor={statusColor}
          size='sm'
        />
      </View>

      <View className={styles.details}>
        <View className={styles.detailRow}>
          <Text className={styles.label}>日期</Text>
          <Text className={styles.value}>{formatDate(booking.date)}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.label}>时段</Text>
          <Text className={styles.value}>{booking.timeSlot}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.label}>费用</Text>
          <Text className={classnames(styles.value, styles.price)}>¥{booking.price}</Text>
        </View>
        {booking.companions.length > 0 && (
          <View className={styles.detailRow}>
            <Text className={styles.label}>同行人</Text>
            <Text className={styles.value}>
              {booking.companions.map((c) => c.name).join('、')}
            </Text>
          </View>
        )}
        {booking.equipmentNote && (
          <View className={styles.detailRow}>
            <Text className={styles.label}>器材需求</Text>
            <Text className={styles.value}>{booking.equipmentNote}</Text>
          </View>
        )}
      </View>

      {booking.review && (
        <View className={styles.reviewSection}>
          <View className={styles.reviewHeader}>
            <Text className={styles.reviewLabel}>我的评价</Text>
            <Text className={styles.reviewRating}>⭐ {booking.review.rating}分</Text>
          </View>
          <Text className={styles.reviewContent}>{booking.review.content}</Text>
        </View>
      )}

      {showVerifyCode && booking.status === 'confirmed' && (
        <View className={styles.verifyCodeSection}>
          <Text className={styles.verifyCodeTitle}>核销码</Text>
          <View className={styles.verifyCode}>
            <Text className={styles.verifyCodeText}>{booking.verifyCode}</Text>
          </View>
          <Text className={styles.verifyTip}>请在入场时出示此码给工作人员核验</Text>
        </View>
      )}

      <View className={styles.actions}>
        {booking.status === 'confirmed' && (
          <>
            <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={handleShowVerify}>
              核销码
            </Button>
            <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleReschedule}>
              改期
            </Button>
            <Button className={classnames(styles.btn, styles.btnDanger)} onClick={handleCancel}>
              取消
            </Button>
          </>
        )}
        {booking.status === 'pending' && (
          <>
            <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleCancel}>
              取消
            </Button>
          </>
        )}
        {booking.status === 'completed' && !booking.review && (
          <>
            <Button
              className={classnames(styles.btn, styles.btnPrimary)}
              onClick={() => setShowReview(true)}
            >
              评价
            </Button>
            <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleViewPayment}>
              付款记录
            </Button>
          </>
        )}
        {booking.status === 'completed' && booking.review && (
          <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleViewPayment}>
            付款记录
          </Button>
        )}
        {showPaymentButton && booking.status !== 'completed' && (
          <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleViewPayment}>
            付款记录
          </Button>
        )}
        {booking.status === 'cancelled' && booking.paymentRecord && (
          <Button className={classnames(styles.btn, styles.btnOutline)} onClick={handleViewPayment}>
            退款记录
          </Button>
        )}
      </View>

      {showReview && (
        <View className={styles.reviewModal}>
          <View className={styles.reviewModalContent}>
            <Text className={styles.modalTitle}>评价场地</Text>
            <View className={styles.ratingSection}>
              <Text className={styles.ratingLabel}>评分</Text>
              <View className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    className={classnames(styles.star, star <= rating && styles.starActive)}
                    onClick={() => setRating(star)}
                  >
                    ⭐
                  </Text>
                ))}
              </View>
            </View>
            <Input
              className={styles.reviewInput}
              placeholder='请输入您的评价...'
              value={reviewContent}
              onInput={(e) => setReviewContent(e.detail.value)}
            />
            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowReview(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleSubmitReview}
              >
                提交
              </Button>
            </View>
          </View>
        </View>
      )}

      {showReschedule && venue && (
        <View className={styles.reviewModal}>
          <View className={styles.rescheduleModalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>选择新的预约时间</Text>
              <Text
                className={styles.modalClose}
                onClick={() => setShowReschedule(false)}
              >
                ✕
              </Text>
            </View>

            <View className={styles.rescheduleSection}>
              <Text className={styles.sectionLabel}>选择日期</Text>
              <ScrollView
                className={styles.dateScroll}
                scrollX
                enhanced
                showScrollbar={false}
              >
                <View className={styles.dateContainer}>
                  {rescheduleDates.map((d) => (
                    <View
                      key={d.date}
                      className={classnames(
                        styles.dateItem,
                        rescheduleDate === d.date && styles.dateItemActive
                      )}
                      onClick={() => {
                        setRescheduleDate(d.date);
                        setRescheduleSlot(null);
                      }}
                    >
                      <Text
                        className={classnames(
                          styles.dateDay,
                          rescheduleDate === d.date && styles.dateDayActive
                        )}
                      >
                        {d.day}
                      </Text>
                      <Text
                        className={classnames(
                          styles.dateNum,
                          rescheduleDate === d.date && styles.dateNumActive
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
              selectedSlotId={rescheduleSlot?.id}
              onSelect={(slot) => setRescheduleSlot(slot)}
              bookedSlotIds={rescheduleBookedSlotIds}
            />

            {rescheduleSlot && (
              <View className={styles.priceInfo}>
                <Text className={styles.priceLabel}>新价格</Text>
                <Text className={styles.priceValue}>¥{rescheduleSlot.price}</Text>
                {rescheduleSlot.price !== booking.price && (
                  <Text className={styles.priceNote}>
                    {rescheduleSlot.price > booking.price
                      ? `需补差价 ¥${rescheduleSlot.price - booking.price}`
                      : `将退还差价 ¥${booking.price - rescheduleSlot.price}`}
                  </Text>
                )}
              </View>
            )}

            <View className={styles.modalActions}>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowReschedule(false)}
              >
                取消
              </Button>
              <Button
                className={classnames(styles.modalBtn, styles.modalBtnConfirm)}
                onClick={handleConfirmReschedule}
                disabled={!rescheduleSlot}
              >
                确认改期
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default BookingCard;
