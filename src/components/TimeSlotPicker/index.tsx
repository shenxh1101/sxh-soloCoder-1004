import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  onSelect?: (slot: TimeSlot) => void;
  bookedSlotIds?: string[];
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ slots, selectedSlotId, onSelect, bookedSlotIds = [] }) => {
  const isSlotBooked = (slotId: string) => bookedSlotIds.includes(slotId);

  const handleSelect = (slot: TimeSlot) => {
    if (!slot.available || isSlotBooked(slot.id)) return;
    console.log('[TimeSlotPicker] 选择时段:', slot.id, slot.startTime, slot.endTime);
    if (onSelect) {
      onSelect(slot);
    }
  };

  return (
    <View className={styles.container}>
      <Text className={styles.title}>选择时段</Text>
      <View className={styles.slotsGrid}>
        {slots.map((slot) => {
          const booked = isSlotBooked(slot.id);
          return (
            <View
              key={slot.id}
              className={classnames(
                styles.slot,
                (!slot.available || booked) && styles.disabled,
                selectedSlotId === slot.id && styles.selected
              )}
              onClick={() => handleSelect(slot)}
            >
              <Text className={styles.timeText}>
                {slot.startTime}-{slot.endTime}
              </Text>
              <Text className={styles.priceText}>¥{slot.price}</Text>
              {booked && <Text className={styles.soldOut}>已占用</Text>}
              {!slot.available && !booked && <Text className={styles.soldOut}>已约满</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TimeSlotPicker;
