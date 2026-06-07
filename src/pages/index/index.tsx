import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import VenueCard from '@/components/VenueCard';
import Tag from '@/components/Tag';
import { useAppStore } from '@/store/useAppStore';
import { getVenueTypeColor } from '@/utils';
import type { VenueType } from '@/types';

const IndexPage: React.FC = () => {
  const { venues, currentVenueFilter, setVenueFilter } = useAppStore();
  const [searchText, setSearchText] = useState('');

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'basketball', label: '篮球' },
    { key: 'badminton', label: '羽毛球' },
    { key: 'tabletennis', label: '乒乓球' }
  ];

  const filteredVenues = useMemo(() => {
    let result = venues;
    
    if (currentVenueFilter !== 'all') {
      result = result.filter((v) => v.type === currentVenueFilter);
    }
    
    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(
        (v) =>
          v.name.toLowerCase().includes(keyword) ||
          v.location.toLowerCase().includes(keyword)
      );
    }
    
    return result;
  }, [venues, currentVenueFilter, searchText]);

  const handleFilterClick = (key: string) => {
    console.log('[IndexPage] 切换筛选:', key);
    setVenueFilter(key);
  };

  const handleSearch = (e: any) => {
    setSearchText(e.detail.value);
  };

  const handleVenueClick = (venue: any) => {
    console.log('[IndexPage] 点击场地:', venue.id);
    Taro.navigateTo({
      url: `/pages/venue-detail/index?id=${venue.id}`
    }).catch((err) => {
      console.error('[IndexPage] 跳转失败:', err);
    });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>社区运动场</Text>
        <Text className={styles.subtitle}>方便快捷，在线预约</Text>
      </View>

      <View className={styles.searchBox}>
        <Input
          className={styles.searchInput}
          placeholder='搜索场地名称或位置...'
          value={searchText}
          onInput={handleSearch}
        />
      </View>

      <ScrollView
        className={styles.filterScroll}
        scrollX
        enhanced
        showScrollbar={false}
      >
        <View className={styles.filterContainer}>
          {filters.map((filter) => (
            <View
              key={filter.key}
              className={classnames(
                styles.filterItem,
                currentVenueFilter === filter.key && styles.filterItemActive
              )}
              style={{
                backgroundColor:
                  currentVenueFilter === filter.key && filter.key !== 'all'
                    ? getVenueTypeColor(filter.key as VenueType)
                    : undefined
              }}
              onClick={() => handleFilterClick(filter.key)}
            >
              <Text
                className={classnames(
                  styles.filterText,
                  currentVenueFilter === filter.key && styles.filterTextActive
                )}
              >
                {filter.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{venues.length}</Text>
          <Text className={styles.statLabel}>个场地</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{filteredVenues.length}</Text>
          <Text className={styles.statLabel}>个可选</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>
            {filteredVenues.reduce(
              (sum, v) => sum + v.timeSlots.filter((s) => s.available).length,
              0
            )}
          </Text>
          <Text className={styles.statLabel}>个时段</Text>
        </View>
      </View>

      <ScrollView className={styles.venueList} enhanced>
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} onClick={handleVenueClick} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔍</Text>
            <Text className={styles.emptyText}>暂无符合条件的场地</Text>
            <Text className={styles.emptyTip}>试试其他筛选条件吧</Text>
          </View>
        )}
        <View className={styles.listFooter}>
          <Text className={styles.footerText}>—— 已加载全部场地 ——</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default IndexPage;
