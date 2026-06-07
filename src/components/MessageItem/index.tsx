import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import Tag from '@/components/Tag';
import { getMessageTypeLabel, getMessageTypeColor, formatDateTime } from '@/utils';
import { useAppStore } from '@/store/useAppStore';
import type { Message } from '@/types';

interface MessageItemProps {
  message: Message;
  onClick?: (message: Message) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => {
  const { markMessageRead } = useAppStore();

  const handleClick = () => {
    console.log('[MessageItem] 点击消息:', message.id);
    if (!message.read) {
      markMessageRead(message.id);
    }
    if (onClick) {
      onClick(message);
    }
  };

  const typeColor = getMessageTypeColor(message.type);

  return (
    <View
      className={classnames(styles.item, !message.read && styles.unread)}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <Tag
          text={getMessageTypeLabel(message.type)}
          bgColor={typeColor}
          size='sm'
        />
        {!message.read && <View className={styles.unreadDot} />}
        <Text className={styles.time}>{formatDateTime(message.time)}</Text>
      </View>
      <Text className={styles.title}>{message.title}</Text>
      <Text className={styles.content}>{message.content}</Text>
    </View>
  );
};

export default MessageItem;
