import assert from 'node:assert/strict';

export function selectCaptureDevices(devicetypes, runtimes) {
  const available = runtimes
    .filter(runtime => runtime.isAvailable && runtime.identifier.includes('.iOS-'))
    .sort((a, b) => b.version.localeCompare(a.version, 'en', { numeric: true }));

  for (const runtime of available) {
    assert.ok(
      Array.isArray(runtime.supportedDeviceTypes),
      `Missing supportedDeviceTypes for ${runtime.identifier}; cannot verify device compatibility.`,
    );
    const supported = new Set(runtime.supportedDeviceTypes.map(device => device.identifier));
    const compatible = devicetypes.filter(device => supported.has(device.identifier));
    const phone = ['iPhone 16 Pro', 'iPhone 15 Pro', 'iPhone 17 Pro']
      .map(name => compatible.find(device => device.name === name)).find(Boolean);
    const tablet = compatible.find(device => device.name.startsWith('iPad Pro 13-inch'));
    if (phone && tablet) return { runtime, phone, tablet };
  }

  assert.fail('No available iOS runtime supports both a medium iPhone and a 13-inch iPad Pro.');
}
