import { Redirect } from 'expo-router';

/** The tab is only a button — it opens the scan modal in the root stack. */
export default function ScanTabPlaceholder() {
  return <Redirect href="/" />;
}
