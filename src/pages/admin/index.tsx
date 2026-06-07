import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import TimeSlotPicker from '@/components/TimeSlotPicker';
import { useAppStore } from '@/store/useAppStore';
import { getVenueTypeColor, formatDate, formatDateTime, generateId } from '@/utils';
import type { Booking, MessageType, Maintenance, TimeSlot } from '@/types';

const AdminPage: React.FC = () => {
  const { bookings, adminStats, venues, addMessage, updateBooking, addMaintenance, maintenances, getBookedSlotIds } = useAppStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'verify' | 'list' | 'notice' | 'export' | 'maintenance'>('stats');
  const [verifyCode, setVerifyCode] = useState('');
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeType, setNoticeType] = useState<MessageType>('maintenance');
  const [maintenanceVenueId, setMaintenanceVenueId] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState(formatDate(new Date().toISOString()));
  const [maintenanceSlot, setMaintenanceSlot] = useState<TimeSlot | null>(null);
  const [maintenanceReason, setMaintenanceReason] = useState('');

  const tabs = [
    { key: 'stats', label: '数据统计' },
    { key: 'verify', label: '手动核销' },
    { key: 'list', label: '预约列表' },
    { key: 'maintenance', label: '场地维护' },
    { key: 'notice', label: '发布通知' },
    { key: 'export', label: '导出数据' }
  ];

  const todayBookings = bookings.filter(
    (b) => b.date === formatDate(new Date().toISOString()) && b.status !== 'cancelled'
  );

  const todayRevenue = todayBookings.reduce((sum, b) => sum + b.price, 0);

  const maintenanceDates = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
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

  const selectedVenueForMaintenance = useMemo(() => {
    if (!maintenanceVenueId) return null;
    return venues.find((v) => v.id === maintenanceVenueId);
  }, [maintenanceVenueId, venues]);

  const maintenanceBookedSlotIds = useMemo(() => {
    if (!maintenanceVenueId) return [];
    return getBookedSlotIds(maintenanceVenueId, maintenanceDate);
  }, [maintenanceVenueId, maintenanceDate, getBookedSlotIds]);

  const activeMaintenances = useMemo(() => {
    const today = formatDate(new Date().toISOString());
    return maintenances.filter((m) => m.date >= today);
  }, [maintenances]);

  const handleAddMaintenance = () => {
    if (!maintenanceVenueId) {
      Taro.showToast({ title: '请选择场地', icon: 'none' });
      return;
    }
    if (!maintenanceSlot) {
      Taro.showToast({ title: '请选择时段', icon: 'none' });
      return;
    }
    if (!maintenanceReason.trim()) {
      Taro.showToast({ title: '请填写维护原因', icon: 'none' });
      return;
    }

    console.log('[AdminPage] 发布场地维护:', {
      venueId: maintenanceVenueId,
      date: maintenanceDate,
      slot: maintenanceSlot,
      reason: maintenanceReason
    });

    const newMaintenance: Maintenance = {
      id: generateId(),
      venueId: maintenanceVenueId,
      venueName: selectedVenueForMaintenance!.name,
      date: maintenanceDate,
      slotId: maintenanceSlot.id,
      startTime: maintenanceSlot.startTime,
      endTime: maintenanceSlot.endTime,
      reason: maintenanceReason.trim(),
      createTime: new Date().toISOString()
    };

    addMaintenance(newMaintenance);

    addMessage({
      id: generateId(),
      type: 'maintenance',
      title: '场地维护通知',
      content: `${selectedVenueForMaintenance!.name} 将在 ${maintenanceDate} ${maintenanceSlot.startTime}-${maintenanceSlot.endTime} 进行${maintenanceReason.trim()}，请合理安排您的预约时间。`,
      time: new Date().toISOString(),
      read: false
    });

    Taro.showToast({ title: '发布成功', icon: 'success' });
    setMaintenanceVenueId('');
    setMaintenanceSlot(null);
    setMaintenanceReason('');
  };

  const handleRemoveMaintenance = (id: string) => {
    Taro.showModal({
      title: '取消维护',
      content: '确定要取消该维护安排吗？',
      success: (res) => {
        if (res.confirm) {
          useAppStore.getState().removeMaintenance(id);
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    }).catch((err) => {
      console.error('[AdminPage] 取消维护弹窗失败:', err);
    });
  };

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

  const handleExport = async () => {
    console.log('[AdminPage] 导出使用统计');
    const exportTime = formatDateTime(new Date().toISOString());

    let tsvContent = '场地使用统计报表\n';
    tsvContent += `导出时间: ${exportTime}\n\n`;
    tsvContent += '=== 统计摘要 ===\n';
    tsvContent += `场地总数\t${venues.length}\n`;
    tsvContent += `总预约数\t${bookings.length}\n`;
    tsvContent += `今日预约\t${todayBookings.length}\n`;
    tsvContent += `今日营收\t¥${todayRevenue}\n\n`;
    tsvContent += '=== 场地使用率 ===\n';
    tsvContent += '场地名称\t使用率(%)\n';
    adminStats.venueUsage.forEach((item) => {
      tsvContent += `${item.venueName}\t${item.usage}\n`;
    });
    tsvContent += '\n=== 预约明细 ===\n';
    tsvContent += '预约ID\t场地名称\t场地类型\t日期\t时段\t金额\t状态\t创建时间\n';
    bookings.forEach((b) => {
      const typeLabel = b.venueType === 'basketball' ? '篮球' : b.venueType === 'badminton' ? '羽毛球' : '乒乓球';
      const statusLabel = b.status === 'confirmed' ? '已预约' : b.status === 'pending' ? '待确认' : b.status === 'completed' ? '已完成' : b.status === 'cancelled' ? '已取消' : '已过期';
      tsvContent += `${b.id}\t${b.venueName}\t${typeLabel}\t${b.date}\t${b.timeSlot}\t¥${b.price}\t${statusLabel}\t${formatDateTime(b.createTime)}\n`;
    });

    console.log('[AdminPage] 导出数据TSV长度:', tsvContent.length);

    try {
      await Taro.setClipboardData({
        data: tsvContent
      });

      console.log('[AdminPage] 剪贴板复制成功');
      Taro.showModal({
        title: '导出成功',
        content: `已生成统计报表：\n今日预约：${todayBookings.length}单\n今日营收：¥${todayRevenue}\n总预约数：${bookings.length}单\n\n✅ 数据已成功复制到剪贴板！\n您可以直接粘贴到 Excel 中查看（Tab分隔格式）。`,
        showCancel: false
      }).catch((err) => {
        console.error('[AdminPage] 导出成功弹窗失败:', err);
      });
    } catch (err) {
      console.error('[AdminPage] 复制到剪贴板失败:', err);
      let errorMsg = '未知错误';
      if (err && typeof err === 'object') {
        errorMsg = (err as any).errMsg || JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMsg = err;
      }
      Taro.showModal({
        title: '导出失败',
        content: `数据复制到剪贴板失败：\n${errorMsg}\n\n请检查浏览器权限设置，或稍后重试。`,
        showCancel: false
      }).catch((modalErr) => {
        console.error('[AdminPage] 导出失败弹窗失败:', modalErr);
      });
    }
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

        {activeTab === 'maintenance' && (
          <View>
            <Text className={styles.sectionTitle}>场地维护管理</Text>
            <Text className={styles.sectionDesc}>设置场地停用时段，发布后用户无法预约对应时段</Text>

            {activeMaintenances.length > 0 && (
              <View className={styles.maintenanceList}>
                <Text className={styles.sectionSubTitle}>进行中的维护</Text>
                {activeMaintenances.map((m) => (
                  <View key={m.id} className={styles.maintenanceItem}>
                    <View className={styles.maintenanceInfo}>
                      <Text className={styles.maintenanceVenue}>{m.venueName}</Text>
                      <Text className={styles.maintenanceTime}>
                        {m.date} {m.startTime}-{m.endTime}
                      </Text>
                      <Text className={styles.maintenanceReason}>{m.reason}</Text>
                    </View>
                    <Button
                      className={classnames(styles.btn, styles.btnDanger)}
                      onClick={() => handleRemoveMaintenance(m.id)}
                    >
                      取消
                    </Button>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.formItem}>
              <Text className={styles.label}>选择场地</Text>
              <ScrollView className={styles.venueScroll} scrollX enhanced showScrollbar={false}>
                <View className={styles.venueOptions}>
                  {venues.map((v) => (
                    <View
                      key={v.id}
                      className={classnames(
                        styles.venueOption,
                        maintenanceVenueId === v.id && styles.venueOptionActive
                      )}
                      onClick={() => {
                        setMaintenanceVenueId(v.id);
                        setMaintenanceSlot(null);
                      }}
                    >
                      <Text
                        className={classnames(
                          styles.venueOptionText,
                          maintenanceVenueId === v.id && styles.venueOptionTextActive
                        )}
                      >
                        {v.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            {maintenanceVenueId && (
              <>
                <View className={styles.formItem}>
                  <Text className={styles.label}>选择日期</Text>
                  <ScrollView
                    className={styles.dateScroll}
                    scrollX
                    enhanced
                    showScrollbar={false}
                  >
                    <View className={styles.dateContainer}>
                      {maintenanceDates.map((d) => (
                        <View
                          key={d.date}
                          className={classnames(
                            styles.dateItem,
                            maintenanceDate === d.date && styles.dateItemActive
                          )}
                          onClick={() => {
                            setMaintenanceDate(d.date);
                            setMaintenanceSlot(null);
                          }}
                        >
                          <Text
                            className={classnames(
                              styles.dateDay,
                              maintenanceDate === d.date && styles.dateDayActive
                            )}
                          >
                            {d.day}
                          </Text>
                          <Text
                            className={classnames(
                              styles.dateNum,
                              maintenanceDate === d.date && styles.dateNumActive
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
                  slots={selectedVenueForMaintenance!.timeSlots}
                  selectedSlotId={maintenanceSlot?.id}
                  onSelect={(slot) => setMaintenanceSlot(slot)}
                  bookedSlotIds={maintenanceBookedSlotIds}
                />

                <View className={styles.formItem}>
                  <Text className={styles.label}>维护原因</Text>
                  <Textarea
                    className={styles.formTextarea}
                    placeholder='请输入维护原因（如：场地清洁、设备检修等）'
                    value={maintenanceReason}
                    onInput={(e) => setMaintenanceReason(e.detail.value)}
                  />
                </View>

                <Button className={styles.publishBtn} onClick={handleAddMaintenance}>
                  发布维护通知
                </Button>
              </>
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
