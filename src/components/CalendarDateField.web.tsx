import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme';
import './CalendarDateField.web.css';

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
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Velg eksakt dato</Text>
      <input
        aria-label="Velg eksakt dato"
        type="date"
        value={value}
        min={minimumDate}
        max={maximumDate}
        onChange={(event) => onChange(event.currentTarget.value)}
        className="babyklar-date-input"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', gap: spacing(2) },
  label: { ...type.small, color: colors.inkSoft },
});