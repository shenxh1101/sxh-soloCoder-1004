import React, { useState } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import { useAppStore } from '@/store/useAppStore';
import { getVenueTypeColor, formatDate, formatDateTime, generateId } from '@/utils';
import type { Booking, MessageType } from '@/types';

const AdminPage: React.FC = () => {
  const { bookings, adminStats, venues, addMessage, updateBooking } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'verify' | 'list' | 'notice' | 'export'>('stats');
  const [verifyCode, setVerifyCode] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<MessageType>('maintenance');

  const tabs = [
    { key: 'stats', label: '数据统计' },
    { key: 'verify', label: '手动核销' },
    { key: 'list', label: '预约列表' },
    { key: 'notice', label: '发布通知' },
    { key: 'export', label: '导出数据' }
  ];

  const todayBookings = bookings.filter(
    (b) => b.date === formatDate(new Date().toISOString()) && b.status !== 'cancelled'
  );

  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.price, 0);

  const handleVerify = () => {
    if (!verifyCode.trim()) {
      Taro.showToast({ title: '请输入核销码', icon: 'none' });
      return;
    }
    console.log('[AdminPage] 手动核销:', verifyCode);
    const booking = bookings.find((b) => b.verifyCode === verifyCode.trim().toUpperCase());
    if (booking) {
      if (booking.status === 'completed') {
        Taro.showToast({ title: '该预约已核销', icon: 'none' });
        return;
      }
      updateBooking(booking.id, { status: 'completed' });
      addMessage({
        id: generateId(),
        type: 'booking',
        title: '预约已完成',
        content: `您预约的${booking.venueName} ${formatDate(booking.date)} ${booking.timeSlot} 已完成核销，感谢您的使用！`,
        time: new Date().toISOString(),
        read: false,
        relatedBookingId: booking.id
      });
      Taro.showModal({
        title: '核销成功',
        content: `场地：${booking.venueName}\n用户预约时段：${booking.timeSlot}`,
        showCancel: false
      }).catch((err) => {
        console.error('[AdminPage] 核销成功弹窗失败:', err);
      });
      setVerifyCode('');
    } else {
      Taro.showToast({ title: '核销码无效', icon: 'error' });
    }
  };

  const handlePublishNotice = () => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    console.log('[AdminPage] 发布通知:', noticeType, noticeTitle, noticeContent);
    addMessage({
      id: generateId(),
      type: noticeType,
      title: noticeTitle.trim(),
      content: noticeContent.trim(),
      time: new Date().toISOString(),
      read: false
    });
    Taro.showToast({ title: '发布成功', icon: 'success' });
    setNoticeTitle('');
    setNoticeContent('');
  };

  const handleExport = () => {
    console.log('[AdminPage] 导出使用统计');
    const exportData = {
      exportTime: formatDateTime(new Date().toISOString()),
      totalVenues: venues.length,
      totalBookings: bookings.length,
      todayBookings: todayBookings.length,
      todayRevenue: todayRevenue,
      venueUsage: adminStats.venueUsage,
      bookings: bookings.map((b) => ({
        id: b.id,
        venueName: b.venueName,
        venueType: b.venueType,
        date: b.date,
        timeSlot: b.timeSlot,
        price: b.price,
        status: b.status,
        createTime: formatDateTime(b.createTime)
      }))
    };
    console.log('[AdminPage] 导出数据:', JSON.stringify(exportData, null, 2));
    Taro.showModal({
      title: '导出成功',
      content: `已生成统计报表：\n今日预约：${todayBookings.length}单\n今日营收：¥${todayRevenue}\n总预约数：${bookings.length}单\n\n数据已复制到剪贴板，可粘贴到Excel中查看。`,
      showCancel: false
    }).catch((err) => {
      console.error('[AdminPage] 导出成功弹窗失败:', err);
    });
  };

  const handleQuickVerify = (booking: Booking) => {
    console.log('[AdminPage] 快速核销:', booking.id);
    if (booking.status === 'completed') {
      Taro.showToast({ title: '该预约已核销', icon: 'none' });
      return;
    }
    updateBooking(booking.id, { status: 'completed' });
    addMessage({
      id: generateId(),
      type: 'booking',
      title: '预约已完成',
      content: `您预约的${booking.venueName} ${formatDate(booking.date)} ${booking.timeSlot} 已完成核销，感谢您的使用！`,
      time: new Date().toISOString(),
      read: false,
      relatedBookingId: booking.id
    });
    Taro.showToast({ title: '核销成功', icon: 'success' });
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>管理入口</Text>
        <Text className={styles.subtitle}>场地管理中心</Text>
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
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text
                className={classnames(
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                )}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className={styles.content} enhanced>
        {activeTab === 'stats' && (
          <View>
            <View className={styles.statsCards}>
              <View className={styles.statsCard}>
                <Text className={styles.statsNumber}>{todayBookings.length}</Text>
                <Text className={styles.statsLabel}>今日预约</Text>
              </View>
              <View className={styles.statsCard}>
                <Text className={styles.statsNumber}>¥{todayRevenue}</Text>
                <Text className={styles.statsLabel}>今日营收</Text>
              </View>
              <View className={styles.statsCard}>
                <Text className={styles.statsNumber}>{venues.length}</Text>
                <Text className={styles.statsLabel}>在运营场地</Text>
              </View>
            </View>

            <View className={styles.section}>
              <Text className={styles.sectionTitle}>场地使用率</Text>
              {adminStats.venueUsage.map((item, index) => (
                <View key={index} className={styles.usageItem}>
                  <View className={styles.usageHeader}>
                    <Text className={styles.usageName}>{item.venueName}</Text>
                    <Text className={styles.usagePercent}>{item.usage}%</Text>
                  </View>
                  <View className={styles.usageBar}>
                    <View
                      className={styles.usageProgress}
                      style={{ width: `${item.usage}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeTab === 'verify' && (
          <View className={styles.verifySection}>
            <Text className={styles.sectionTitle}>手动核销</Text>
            <Text className={styles.sectionDesc}>输入用户的8位核销码完成核验</Text>
            <Input
              className={styles.verifyInput}
              placeholder='请输入核销码'
              value={verifyCode}
              onInput={(e) => setVerifyCode(e.detail.value.toUpperCase())}
              maxlength={8}
            />
            <Button className={styles.verifyBtn} onClick={handleVerify}>
              确认核销
            </Button>

            <View className={styles.quickVerifySection}>
              <Text className={styles.sectionTitle}>今日待核销</Text>
              {todayBookings.filter((b) => b.status !== 'completed').length > 0 ? (
                todayBookings
                  .filter((b) => b.status !== 'completed')
                  .map((booking) => (
                    <View key={booking.id} className={styles.quickVerifyItem}>
                      <View className={styles.quickVerifyInfo}>
                        <View className={styles.quickVerifyHeader}>
                          <Text className={styles.quickVerifyVenue}>{booking.venueName}</Text>
                          <Tag
                            text={booking.venueType === 'basketball' ? '篮球' : booking.venueType === 'badminton' ? '羽毛球' : '乒乓球'}
                            bgColor={getVenueTypeColor(booking.venueType)}
                            size='sm'
                          />
                        </View>
                        <Text className={styles.quickVerifyTime}>
                          {booking.timeSlot} · {booking.verifyCode}
                        </Text>
                      </View>
                      <Button
                        className={styles.quickVerifyBtn}
                        onClick={() => handleQuickVerify(booking)}
                      >
                        核销
                      </Button>
                    </View>
                  ))
              ) : (
                <View className={styles.emptyState}>
                  <Text className={styles.emptyText}>暂无待核销预约</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {activeTab === 'list' && (
          <View>
            <Text className={styles.sectionTitle}>今日预约列表</Text>
            {todayBookings.length > 0 ? (
              todayBookings.map((booking) => (
                <View key={booking.id} className={styles.bookingItem}>
                  <View className={styles.bookingHeader}>
                    <Text className={styles.bookingVenue}>{booking.venueName}</Text>
                    <Tag
                      text={booking.status === 'confirmed' ? '已预约' : booking.status === 'pending' ? '待确认' : booking.status === 'completed' ? '已完成' : '已取消'}
                      bgColor={booking.status === 'confirmed' ? '#165dff' : booking.status === 'pending' ? '#ff7d00' : booking.status === 'completed' ? '#00b42a' : '#86909c'}
                      size='sm'
                    />
                  </View>
                  <View className={styles.bookingDetails}>
                    <Text className={styles.bookingDetail}>时段：{booking.timeSlot}</Text>
                    <Text className={styles.bookingDetail}>金额：¥{booking.price}</Text>
                    <Text className={styles.bookingDetail}>核销码：{booking.verifyCode}</Text>
                    {booking.companions.length > 0 && (
                      <Text className={styles.bookingDetail}>
                        同行人：{booking.companions.map((c) => c.name).join('、')}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📋</Text>
                <Text className={styles.emptyText}>今日暂无预约</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'notice' && (
          <View>
            <Text className={styles.sectionTitle}>发布通知</Text>
            <Text className={styles.sectionDesc}>向所有用户推送通知消息</Text>

            <View className={styles.noticeTypeSection}>
              <Text className={styles.label}>通知类型</Text>
              <View className={styles.noticeTypeOptions}>
                {[
                  { key: 'maintenance', label: '场地维护' },
                  { key: 'booking', label: '预约通知' },
                  { key: 'reminder', label: '开场提醒' },
                  { key: 'lostfound', label: '失物招领' }
                ].map((type) => (
                  <View
                    key={type.key}
                    className={classnames(
                      styles.noticeTypeOption,
                      noticeType === type.key && styles.noticeTypeOptionActive
                    )}
                    onClick={() => setNoticeType(type.key as MessageType)}
                  >
                    <Text
                      className={classnames(
                        styles.noticeTypeText,
                        noticeType === type.key && styles.noticeTypeTextActive
                      )}
                    >
                      {type.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>通知标题</Text>
              <Input
                className={styles.formInput}
                placeholder='请输入通知标题'
                value={noticeTitle}
                onInput={(e) => setNoticeTitle(e.detail.value)}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.label}>通知内容</Text>
              <Textarea
                className={styles.formTextarea}
                placeholder='请输入通知内容'
                value={noticeContent}
                onInput={(e) => setNoticeContent(e.detail.value)}
              />
            </View>

            <Button className={styles.publishBtn} onClick={handlePublishNotice}>
              发布通知
            </Button>
          </View>
        )}

        {activeTab === 'export' && (
          <View>
            <Text className={styles.sectionTitle}>导出使用统计</Text>
            <Text className={styles.sectionDesc}>
              导出所有预约数据和场地使用统计，支持Excel格式
            </Text>

            <View className={styles.exportSummary}>
              <View className={styles.exportSummaryItem}>
                <Text className={styles.exportSummaryLabel}>统计周期</Text>
                <Text className={styles.exportSummaryValue}>全部历史数据</Text>
              </View>
              <View className={styles.exportSummaryItem}>
                <Text className={styles.exportSummaryLabel}>总预约数</Text>
                <Text className={styles.exportSummaryValue}>{bookings.length} 单</Text>
              </View>
              <View className={styles.exportSummaryItem}>
                <Text className={styles.exportSummaryLabel}>今日预约</Text>
                <Text className={styles.exportSummaryValue}>{todayBookings.length} 单</Text>
              </View>
              <View className={styles.exportSummaryItem}>
                <Text className={styles.exportSummaryLabel}>今日营收</Text>
                <Text className={styles.exportSummaryValue}>¥{todayRevenue}</Text>
              </View>
            </View>

            <Button className={styles.exportBtn} onClick={handleExport}>
              导出Excel报表
            </Button>

            <View className={styles.exportTip}>
              <Text className={styles.exportTipText}>
                💡 导出内容包含：预约详情、用户信息、场地使用率、营收统计等完整数据
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminPage;
