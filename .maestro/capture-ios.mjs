import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { selectCaptureDevices } from './devices.mjs';

assert.equal(process.platform, 'darwin', 'Native capture must run on an EAS macOS build worker.');

const output = path.resolve('.maestro', 'artifacts');
const names = ['01-hjem', '02-ting', '03-plan', '04-garderobe', '05-pakking', '06-valgfritt'];
fs.mkdirSync(output, { recursive: true });

function run(command, args, options = {}) {
  console.log(`Running ${command} ${args.join(' ')}`);
  return execFileSync(command, args, { stdio: 'inherit', timeout: 180_000, ...options });
}

function read(command, args) {
  return run(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

const products = path.resolve('ios', 'build', 'Build', 'Products');
const apps = fs.readdirSync(products)
  .filter(name => name.endsWith('simulator'))
  .flatMap(name => fs.readdirSync(path.join(products, name))
    .filter(app => app.endsWith('.app'))
    .map(app => path.join(products, name, app)));
assert.equal(apps.length, 1, `Expected one simulator app, found ${apps.length}.`);
const app = apps[0];
const info = path.join(app, 'Info.plist');
const appVersion = read('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleShortVersionString', info]);
const buildNumber = read('/usr/libexec/PlistBuddy', ['-c', 'Print :CFBundleVersion', info]);
const xcode = read('/usr/libexec/PlistBuddy', ['-c', 'Print :DTXcode', info]);
const sdk = read('/usr/libexec/PlistBuddy', ['-c', 'Print :DTSDKName', info]);
assert.equal(appVersion, '1.0.0');
assert.equal(buildNumber, '5', 'Do not silently capture a different build number.');
// Build 5 was compiled with Xcode 26.6; the iOS 27 SDK refuses to launch apps without UIScene lifecycle.
assert.match(xcode, /^26\d\d$/, `Expected Xcode 26.x like build 5, got DTXcode ${xcode} (${sdk}).`);

const { devicetypes } = JSON.parse(read('xcrun', ['simctl', 'list', 'devicetypes', '--json']));
const { runtimes } = JSON.parse(read('xcrun', ['simctl', 'list', 'runtimes', '--json']));
fs.writeFileSync(path.join(output, 'simulator-availability.json'), JSON.stringify({ devicetypes, runtimes }, null, 2));
const { runtime, phone, tablet } = selectCaptureDevices(devicetypes, runtimes);

const evidence = {
  appVersion,
  buildNumber,
  xcode,
  sdk,
  sourceCommit: '3643dc597fcfd075e7dda17b632165e43cb032ab',
  captureBuildId: process.env.EAS_BUILD_ID,
  gitCommit: process.env.EAS_BUILD_GIT_COMMIT_HASH,
  runtime: runtime.version,
  generatedAt: new Date().toISOString(),
  devices: [],
};
const saveEvidence = () => fs.writeFileSync(path.join(output, 'capture-evidence.json'), JSON.stringify(evidence, null, 2));
saveEvidence();

for (const [kind, device, dimensions] of [
  ['iphone', phone, [[1179, 2556], [1206, 2622]]],
  ['ipad', tablet, [[2048, 2732], [2064, 2752]]],
]) {
  const directory = path.join(output, kind);
  fs.mkdirSync(directory, { recursive: true });
  const errors = [];
  let simulator;
  let booted = false;
  try {
    simulator = read('xcrun', ['simctl', 'create', `BabyKlar Store ${kind}`, device.identifier, runtime.identifier]);
    assert.match(simulator, /^[a-f0-9-]{36}$/i, 'Invalid simulator identifier.');
    run('xcrun', ['simctl', 'boot', simulator]);
    booted = true;
    run('xcrun', ['simctl', 'bootstatus', simulator, '-b']);
    run('xcrun', ['simctl', 'status_bar', simulator, 'override', '--time', '9:41', '--batteryState', 'charged', '--batteryLevel', '100']);
    run('xcrun', ['simctl', 'install', simulator, app]);
    run('maestro', [
      '--device', simulator, 'test',
      '--test-output-dir', path.join(directory, 'logs'),
      '--format', 'junit',
      '--output', path.join(directory, 'report.xml'),
      '.maestro/flows',
    ], { timeout: 600_000 });
  } catch (error) {
    errors.push(error);
  }

  for (const cleanup of [
    () => { if (booted) run('xcrun', ['simctl', 'shutdown', simulator]); },
    () => { if (simulator && /^[a-f0-9-]{36}$/i.test(simulator)) run('xcrun', ['simctl', 'delete', simulator]); },
  ]) {
    try {
      cleanup();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length) throw new AggregateError(errors, `${kind} capture failed; inspect the uploaded test evidence.`);

  const report = fs.readFileSync(path.join(directory, 'report.xml'), 'utf8');
  assert.equal((report.match(/<testcase\b/g) ?? []).length, 3, 'Expected all three native flows to run.');
  assert.ok(!/<(?:failure|error|skipped)\b/.test(report), 'Native flows must pass without skips.');
  const captures = filesIn(directory);
  const screenshots = names.map(name => {
    const matches = captures.filter(filename => path.basename(filename) === `${name}.png`);
    assert.equal(matches.length, 1, `Expected one ${kind}/${name}.png, found ${matches.length}.`);
    const png = fs.readFileSync(matches[0]);
    assert.ok(png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), 'Invalid PNG signature.');
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    assert.ok(dimensions.some(([w, h]) => w === width && h === height), `Unexpected ${kind} dimensions: ${width}x${height}.`);
    fs.copyFileSync(matches[0], path.join(directory, `${name}.png`));
    return { name, width, height, sha256: createHash('sha256').update(png).digest('hex') };
  });
  evidence.devices.push({ kind, model: device.name, testExitCode: 0, passed: 3, failed: 0, skipped: 0, screenshots });
  saveEvidence();
}

console.log('Verified six native screenshots each for iPhone and iPad; both Maestro suites exited successfully.');
