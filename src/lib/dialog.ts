import { Alert, Platform } from 'react-native';

// react-native-web ignores the buttons in Alert.alert, so web must use the browser's own dialogs.
export const confirm = (title: string, message: string, button: string): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Avbryt', onPress: () => resolve(false), style: 'cancel' },
      { text: button, onPress: () => resolve(true) },
    ]);
  });
};

export const notify = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
};
