import assert from 'node:assert/strict';
import test from 'node:test';
import { selectCaptureDevices } from './devices.mjs';

const phone16 = { name: 'iPhone 16 Pro', identifier: 'phone16' };
const phone17 = { name: 'iPhone 17 Pro', identifier: 'phone17' };
const tablet = { name: 'iPad Pro 13-inch (M4)', identifier: 'tablet' };
const devicetypes = [phone16, phone17, tablet];
const runtime = (version, supportedDeviceTypes, isAvailable = true) => ({
  version,
  identifier: `com.apple.CoreSimulator.SimRuntime.iOS-${version}`,
  supportedDeviceTypes,
  isAvailable,
});

test('does not pair the preferred iPhone with an incompatible runtime', () => {
  const latest = runtime('27.1', [phone17, tablet]);
  const selected = selectCaptureDevices(devicetypes, [latest]);
  assert.equal(selected.runtime, latest);
  assert.equal(selected.phone, phone17);
  assert.equal(selected.tablet, tablet);
});

test('selects the latest runtime supporting both required device families', () => {
  const older = runtime('26.10', [phone16, tablet]);
  const selected = selectCaptureDevices(devicetypes, [
    runtime('26.9', [phone16, tablet]),
    runtime('27.1', [phone17]),
    older,
  ]);
  assert.equal(selected.runtime, older);
  assert.equal(selected.phone, phone16);
});

test('ignores unavailable and non-iOS runtimes', () => {
  const supported = runtime('26.2', [phone16, tablet]);
  const selected = selectCaptureDevices(devicetypes, [
    runtime('27.1', [phone16, tablet], false),
    { ...runtime('28.0', [phone16, tablet]), identifier: 'com.apple.CoreSimulator.SimRuntime.tvOS-28-0' },
    supported,
  ]);
  assert.equal(selected.runtime, supported);
});

test('fails explicitly when no common compatible runtime exists', () => {
  assert.throws(
    () => selectCaptureDevices(devicetypes, [runtime('27.1', [phone17])]),
    /No available iOS runtime supports both/,
  );
});

test('fails explicitly when compatibility metadata is missing', () => {
  assert.throws(
    () => selectCaptureDevices(devicetypes, [runtime('27.1', undefined)]),
    /Missing supportedDeviceTypes/,
  );
});
