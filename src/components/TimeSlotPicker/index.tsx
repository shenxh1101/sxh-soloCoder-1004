import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { TimeSlot } from '@/types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlotId?: string;
  selectedSlotIds?: string[];
  onSelect?: (slot: TimeSlot) => void;
  onMultiSelect?: (slot: TimeSlot, isSelected: boolean) => void;
  bookedSlotIds?: string[];
  maintenanceSlotIds?: string[];
  title?: string;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedSlotId,
  selectedSlotIds = [],
  onSelect,
  onMultiSelect,
  bookedSlotIds = [],
  maintenanceSlotIds = [],
  title = '选择时段'
}) => {
  const isMultiSelect = !!onMultiSelect;
  const isSlotBooked = (slotId: string) => bookedSlotIds.includes(slotId);
  const isSlotMaintenance = (slotId: string) => maintenanceSlotIds.includes(slotId);
  const isSlotDisabled = (slot: TimeSlot) => !slot.available || isSlotBooked(slot.id) || isSlotMaintenance(slot.id);
  const isSlotSelected = (slotId: string) => isMultiSelect ? selectedSlotIds.includes(slotId) : selectedSlotId === slotId;

  const handleSelect = (slot: TimeSlot) => {
    if (isSlotDisabled(slot)) return;
    console.log('[TimeSlotPicker] 选择时段:', slot.id, slot.startTime, slot.endTime);
    if (isMultiSelect && onMultiSelect) {
      onMultiSelect(slot, isSlotSelected(slot.id));
    } else if (onSelect) {
      onSelect(slot);
    }
  };

  return (
    <View className={styles.container}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.slotsGrid}>
        {slots.map((slot) => {
          const booked = isSlotBooked(slot.id);
          const maintenance = isSlotMaintenance(slot.id);
          const disabled = isSlotDisabled(slot);
          const selected = isSlotSelected(slot.id);
          return (
            <View
              key={slot.id}
              className={classnames(
                styles.slot,
                disabled && styles.disabled,
                maintenance && styles.maintenance,
                selected && styles.selected
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
