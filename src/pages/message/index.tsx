import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import MessageItem from '@/components/MessageItem';
import { useAppStore } from '@/store/useAppStore';
import { getMessageTypeColor } from '@/utils';
import type { MessageType } from '@/types';

const MessagePage: React.FC = () => {
  const { messages, markMessageRead } = useAppStore();
  const [activeTab, setActiveTab] = useState<MessageType | 'all'>('all');

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'booking', label: '预约通知' },
    { key: 'reminder', label: '开场提醒' },
    { key: 'maintenance', label: '场地维护' },
    { key: 'lostfound', label: '失物招领' }
  ];

  const filteredMessages = useMemo(() => {
    if (activeTab === 'all') {
      return messages;
    }
    return messages.filter((m) => m.type === activeTab);
  }, [messages, activeTab]);

  const unreadCount = useMemo(() => {
    return messages.filter((m) => !m.read).length;
  }, [messages]);

  const handleTabClick = (key: MessageType | 'all') => {
    console.log('[MessagePage] 切换标签:', key);
    setActiveTab(key);
  };

  const handleMarkAllRead = () => {
    console.log('[MessagePage] 全部标为已读');
    messages.forEach((m) => {
      if (!m.read) {
        markMessageRead(m.id);
      }
    });
    Taro.showToast({ title: '已全部标为已读', icon: 'success' });
  };

  const handleMessageClick = (message: any) => {
    console.log('[MessagePage] 查看消息详情:', message.id);
    if (message.relatedBookingId) {
      Taro.showModal({
        title: message.title,
        content: message.content,
        showCancel: false
      }).catch((err) => {
        console.error('[MessagePage] 显示消息详情失败:', err);
      });
    } else {
      Taro.showModal({
        title: message.title,
        content: message.content,
        showCancel: false
      }).catch((err) => {
        console.error('[MessagePage] 显示消息详情失败:', err);
      });
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View>
            <Text className={styles.title}>消息中心</Text>
            <Text className={styles.subtitle}>
              {unreadCount > 0 ? `${unreadCount} 条未读消息` : '暂无未读消息'}
            </Text>
          </View>
          {unreadCount > 0 && (
            <Button className={styles.markAllBtn} onClick={handleMarkAllRead}>
              全部已读
            </Button>
          )}
        </View>
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
              style={{
                backgroundColor:
                  activeTab === tab.key && tab.key !== 'all'
                    ? getMessageTypeColor(tab.key as MessageType)
                    : undefined
              }}
              onClick={() => handleTabClick(tab.key as MessageType | 'all')}
            >
              <Text
                className={classnames(
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive
                )}
              >
                {tab.label}
              </Text>
              {tab.key === 'all' && unreadCount > 0 && (
                <View className={styles.unreadBadge}>
                  <Text className={styles.unreadBadgeText}>{unreadCount}</Text>
                </View>
              )}
              {tab.key !== 'all' && (
                <View
                  className={classnames(
                    styles.tabBadge,
                    activeTab === tab.key && styles.tabBadgeActive
                  )}
                >
                  <Text className={styles.tabBadgeText}>
                    {messages.filter((m) => m.type === tab.key).length}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      <ScrollView className={styles.messageList} enhanced>
        {filteredMessages.length > 0 ? (
          filteredMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              onClick={handleMessageClick}
            />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💬</Text>
            <Text className={styles.emptyText}>暂无消息</Text>
            <Text className={styles.emptyTip}>有新消息会第一时间通知您</Text>
          </View>
        )}
        {filteredMessages.length > 0 && (
          <View className={styles.listFooter}>
            <Text className={styles.footerText}>—— 没有更多消息了 ——</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default MessagePage;
