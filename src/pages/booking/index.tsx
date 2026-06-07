import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import BookingCard from '@/components/BookingCard';
import { useAppStore } from '@/store/useAppStore';
import type { BookingStatus } from '@/types';

const BookingPage: React.FC = () => {
  const { bookings } = useAppStore();
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认' },
    { key: 'confirmed', label: '已预约' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' }
  ];

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') {
      return bookings;
    }
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

  const handleTabClick = (key: BookingStatus | 'all') => {
    console.log('[BookingPage] 切换标签:', key);
    setActiveTab(key);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>我的预约</Text>
        <Text className={styles.subtitle}>共 {bookings.length} 条预约记录</Text>
      </View>

      <ScrollView
        className={styles.tabScroll}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.tabContainer}>
          {tabs.map((tab) => (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                activeTab === tab.key && styles.tabItemActive
              )}
              onClick={() => handleTabClick(tab.key as BookingStatus | 'all')}
            >
              <Text
                className={classnames(
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                )}
              >
                {tab.label}
              </Text>
              <View
                className={classnames(
                  styles.tabBadge,
                  activeTab === tab.key && styles.tabBadgeActive
                )}
              >
                <Text className={styles.tabBadgeText}>
                  {tab.key === 'all'
                    ? bookings.length
                    : bookings.filter((b) => b.status === tab.key).length}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className={styles.bookingList} enhanced>
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📅</Text>
            <Text className={styles.emptyText}>暂无预约记录</Text>
            <Text className={styles.emptyTip}>去首页看看有哪些场地吧</Text>
          </View>
        )}
        {filteredBookings.length > 0 && (
          <View className={styles.listFooter}>
            <Text className={styles.footerText}>—— 已加载全部记录 ——</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default BookingPage;
