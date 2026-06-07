import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import { getVenueTypeLabel, getVenueTypeColor } from '@/utils';
import type { Venue } from '@/types';

interface VenueCardProps {
  venue: Venue;
  onClick?: (venue: Venue) => void;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, onClick }) => {
  const handleClick = () => {
    console.log('[VenueCard] 点击场地:', venue.name, venue.id);
    if (onClick) {
      onClick(venue);
    } else {
      Taro.navigateTo({
        url: `/pages/venue-detail/index?id=${venue.id}`
      }).catch((err) => {
        console.error('[VenueCard] 跳转失败:', err);
      });
    }
  };

  const availableSlots = venue.timeSlots.filter((s) => s.available).length;
  const typeColor = getVenueTypeColor(venue.type);

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image
        className={styles.image}
        src={venue.image}
        mode='aspectFill'
        onError={(e) => console.error('[VenueCard] 图片加载失败:', e.detail)}
      />
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{venue.name}</Text>
          <Tag
            text={getVenueTypeLabel(venue.type)}
            bgColor={typeColor}
            size='sm'
          />
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoText}>📍 {venue.location}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoText}>⏰ {venue.openTime}-{venue.closeTime}</Text>
          <Text className={styles.slotText}>{availableSlots}个时段可约</Text>
        </View>
        <View className={styles.footer}>
          <View className={styles.rating}>
            <Text className={styles.ratingText}>⭐ {venue.rating}</Text>
            <Text className={styles.reviewCount}>({venue.reviewCount}条评价)</Text>
          </View>
          <Text className={styles.price}>¥{venue.priceInfo.split('元')[0]}元/小时</Text>
        </View>
      </View>
    </View>
  );
};

export default VenueCard;
