import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface TagProps {
  text: string;
  color?: string;
  bgColor?: string;
  size?: 'sm' | 'md';
}

const Tag: React.FC<TagProps> = ({ text, color = '#ffffff', bgColor = '#165dff', size = 'md' }) => {
  return (
    <View
      className={classnames(styles.tag, size === 'sm' && styles.tagSm)}
      style={{ backgroundColor: bgColor, color }}
    >
      <Text>{text}</Text>
    </View>
  );
};

export default Tag;
