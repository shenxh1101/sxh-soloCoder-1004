import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import {
  getVenueTypeLabel,
  getVenueTypeColor,
  getBookingStatusLabel,
  getBookingStatusColor,
  formatDate,
  generateId
} from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { Booking } from '@/types';

interface BookingCardProps {
  booking: Booking;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const { cancelBooking, addReview, addMessage } = useAppStore();
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [showVerifyCode, setShowVerifyCode] = useState(false);

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
    Taro.showToast({ title: '改期功能开发中', icon: 'none' });
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
    if (!booking.paymentRecord) return;
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
    </View>
  );
};

export default BookingCard;
