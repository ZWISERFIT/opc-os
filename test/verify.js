#!/usr/bin/env node
/**
 * OPC-OS Installation Verification Script
 * v0.1.0-alpha
 *
 * Usage: node test/verify.js
 *        npm test
 *        npm run verify
 *
 * Verifies all core modules initialize correctly and are healthy.
 */
'use strict';

let passed = 0;
let failed = 0;
let warnings = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`   ✅ ${label}`);
    passed++;
  } else {
    console.log(`   ❌ ${label}`);
    failed++;
  }
}

function warn(label) {
  console.log(`   🟡 ${label}`);
  warnings++;
}

async function run() {
  const { version, name, description } = require('../package.json');

  console.log(`\n🔍 OPC-OS Verification — ${name} v${version}`);
  console.log('═'.repeat(56));
  console.log(`   ${description}\n`);

  // ── Test 1: Module loading ──
  console.log('📦 [1/6] Module Loading');
  let mods = {};
  try {
    mods.runtime = require('../src/runtime');
    assert(true, 'src/runtime loaded');
  } catch (e) { assert(false, `src/runtime: ${e.message}`); }

  try {
    mods.event = require('../src/event');
    assert(true, 'src/event loaded');
  } catch (e) { assert(false, `src/event: ${e.message}`); }

  try {
    mods.memory = require('../src/memory');
    assert(true, 'src/memory loaded');
  } catch (e) { assert(false, `src/memory: ${e.message}`); }

  try {
    mods.governance = require('../src/governance');
    assert(true, 'src/governance loaded');
  } catch (e) { assert(false, `src/governance: ${e.message}`); }

  try {
    mods.pipeline = require('../src/pipeline');
    assert(true, 'src/pipeline loaded');
  } catch (e) { assert(false, `src/pipeline: ${e.message}`); }

  try {
    mods.utils = require('../src/utils');
    assert(true, 'src/utils loaded');
  } catch (e) { assert(false, `src/utils: ${e.message}`); }

  // ── Test 2: Event Bus ──
  console.log('\n📡 [2/6] Event Bus');
  const bus = mods.event.createEventBus();
  assert(bus && typeof bus.emit === 'function', 'EventBus created');

  let received = null;
  bus.on('test.event', (data) => { received = data; });
  bus.emit('test.event', { hello: 'world' });
  assert(received && received.hello === 'world', 'Event publish/subscribe works');

  // Wildcard test
  let wildcardReceived = false;
  bus.on('test.*', () => { wildcardReceived = true; });
  bus.emit('test.wildcard', {});
  assert(wildcardReceived, 'Wildcard pattern matching works');

  const busStatus = bus.status();
  assert(busStatus.listeners > 0, `EventBus has ${busStatus.listeners} listeners`);

  // ── Test 3: Memory Layer ──
  console.log('\n🧠 [3/6] Memory Layer');
  const memory = mods.memory.createMemoryLayer();
  assert(memory && typeof memory.set === 'function', 'MemoryLayer created');

  memory.set('greeting', 'hello opc-os');
  assert(memory.get('greeting') === 'hello opc-os', 'Basic get/set works');

  memory.set('ephemeral', 'gone', 10);
  assert(memory.get('ephemeral') === 'gone', 'TTL set works (before expiry)');

  await new Promise(r => setTimeout(r, 20));
  assert(memory.get('ephemeral') === null, 'TTL expiry works');

  assert(memory.has('greeting') === true, 'has() returns true for existing key');
  assert(memory.has('nonexistent') === false, 'has() returns false for missing key');

  const memKeys = memory.keys();
  assert(memKeys.includes('greeting'), 'keys() returns stored keys');

  const memStatus = memory.status();
  assert(memStatus.backend === 'in-memory', `Memory backend: ${memStatus.backend}`);

  // ── Test 4: Governance Engine ──
  console.log('\n⚖️  [4/6] Governance Engine');
  const governance = mods.governance.createGovernanceEngine();
  assert(governance && typeof governance.register === 'function', 'GovernanceEngine created');

  governance.register('no-empty-messages', (ctx) => ({
    pass: ctx.message && ctx.message.length > 0,
    reason: 'Message cannot be empty',
  }));

  governance.register('always-pass', () => ({ pass: true }));

  const goodResult = governance.validate({ message: 'hello' });
  const allPass = goodResult.every(r => r.pass);
  assert(allPass, 'Valid context passes all constraints');

  const badResult = governance.validate({ message: '' });
  const hasFailure = badResult.some(r => !r.pass);
  assert(hasFailure, 'Invalid context triggers constraint violation');

  const viols = governance.getViolations();
  assert(viols.length === 1, 'Violations are recorded');
  assert(viols[0].constraint === 'no-empty-messages', 'Violation names correct constraint');

  const govStatus = governance.status();
  assert(govStatus.constraints === 2, `Governance has ${govStatus.constraints} constraints`);

  // ── Test 5: Pipeline ──
  console.log('\n🔗 [5/6] Pipeline');
  const pipeline = mods.pipeline.createPipeline();
  assert(pipeline && typeof pipeline.stage === 'function', 'Pipeline created');

  pipeline.stage('uppercase', (data) => data.toUpperCase());
  pipeline.stage('reverse', (data) => data.split('').reverse().join(''));
  pipeline.stage('append', (data) => data + '!');

  const pipeResult = await pipeline.execute('hello');
  assert(pipeResult.data === 'OLLEH!', `Pipeline transforms: hello → ${pipeResult.data}`);
  assert(pipeResult.trace.length === 3, 'All 3 stages traced');
  assert(pipeResult.trace.every(t => t.status === 'ok'), 'All stages succeeded');

  const pipeList = pipeline.list();
  assert(pipeList.length === 3, `Pipeline has ${pipeList.length} stages`);

  // ── Test 6: Agent Runtime ──
  console.log('\n🚀 [6/6] Agent Runtime');
  const runtime = mods.runtime.createRuntime({ bus, memory, governance, pipeline });
  assert(runtime && typeof runtime.start === 'function', 'Runtime created');

  const startResult = runtime.start();
  assert(startResult.started, 'Runtime started');

  const status = runtime.status();
  assert(status.healthy, 'All components healthy');
  assert(status.version === version, `Version matches: ${status.version}`);
  assert(status.uptime >= 0, 'Uptime is non-negative');

  const compNames = Object.keys(status.components);
  assert(compNames.length >= 5, `Runtime has ${compNames.length} components registered`);
  console.log(`   ℹ️  Components: ${compNames.join(', ')}`);

  runtime.stop();
  const postStop = runtime.status();
  const allStopped = Object.values(postStop.components).every(s => s === 'stopped');
  assert(allStopped, 'All components stopped gracefully');

  // ── Test 7: Utils ──
  console.log('\n🛠  [Bonus] Utilities');
  const utils = require('../src/utils');
  const id = utils.uid('test');
  assert(id.startsWith('test_'), `UID prefix: ${id}`);

  const logger = utils.createLogger('verify');
  assert(logger && typeof logger.info === 'function', 'Logger created');

  // ── Summary ──
  console.log('\n' + '═'.repeat(56));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('─'.repeat(56));
  const total = passed + failed;
  const pct = ((passed / total) * 100).toFixed(1);
  console.log(`   ✅ Passed:  ${passed}/${total} (${pct}%)`);
  if (failed > 0) {
    console.log(`   ❌ Failed:  ${failed}/${total}`);
  }
  if (warnings > 0) {
    console.log(`   🟡 Warnings: ${warnings}`);
  }
  console.log(`   📦 Version: ${version}`);
  console.log(`   📦 Node:    ${process.version}`);
  console.log('═'.repeat(56));

  if (failed === 0) {
    console.log('\n🎉 OPC-OS is ready! All core modules verified.\n');
    process.exit(0);
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Check the output above.\n`);
    process.exit(1);
  }
}

run();
