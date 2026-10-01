import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate } from '@/lib/insights';
import { colors, radius, spacing, type } from '@/theme';

const fromIso = (iso: string) => new Date(`${iso}T12:00:00`);
const toIso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function CalendarDateField({
  value,
  onChange,
  minimumDate,
  maximumDate,
}: {
  value: string;
  onChange: (value: string) => void;
  minimumDate: string;
  maximumDate: string;
}) {
  const [open, setOpen] = useState(false);

  const change = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (event.type === 'set' && selected) onChange(toIso(selected));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Velg eksakt dato</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={`Velg dato, ${formatDate(value)}`}
      >
        <MaterialCommunityIcons name="calendar-month-outline" size={20} color={colors.primary} />
        <Text style={styles.buttonText}>{formatDate(value)}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={colors.muted} />
      </Pressable>

      {open ? (
        <View style={styles.picker}>
          <DateTimePicker
            value={fromIso(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={fromIso(minimumDate)}
            maximumDate={fromIso(maximumDate)}
            onChange={change}
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setOpen(false)} style={styles.done}>
              <Text style={styles.doneText}>Ferdig</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing(2) },
  label: { ...type.small, color: colors.inkSoft },
  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
  },
  buttonText: { ...type.bodyStrong, flex: 1 },
  picker: { width: '100%', alignItems: 'center' },
  done: { alignSelf: 'flex-end', paddingHorizontal: spacing(3), paddingVertical: spacing(2) },
  doneText: { ...type.bodyStrong, color: colors.primary },
});