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
  maintenanceSlotIds?: string[];
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlotId,
  onSelect,
  bookedSlotIds = [],
  maintenanceSlotIds = []
}) => {
  const isSlotBooked = (slotId: string) => bookedSlotIds.includes(slotId);
  const isSlotMaintenance = (slotId: string) => maintenanceSlotIds.includes(slotId);
  const isSlotDisabled = (slotId: string) => isSlotBooked(slotId) || isSlotMaintenance(slotId);

  const handleSelect = (slot: TimeSlot) => {
    if (isSlotDisabled(slot.id)) return;
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
          const maintenance = isSlotMaintenance(slot.id);
          const disabled = isSlotDisabled(slot.id);
          return (
            <View
              key={slot.id}
              className={classnames(
                styles.slot,
                disabled && styles.disabled,
                maintenance && styles.maintenance,
                selectedSlotId === slot.id && styles.selected
              )}
              onClick={() => handleSelect(slot)}
            >
              <Text className={styles.timeText}>
                {slot.startTime}-{slot.endTime}
              </Text>
              <Text className={styles.priceText}>¥{slot.price}</Text>
              {maintenance && <Text className={styles.maintenanceTag}>维护中</Text>}
              {booked && !maintenance && <Text className={styles.soldOut}>已占用</Text>}
              {!slot.available && !booked && !maintenance && <Text className={styles.soldOut}>已约满</Text>}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TimeSlotPicker;
