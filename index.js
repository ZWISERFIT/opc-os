/**
 * OPC-OS — OpenClaw Protocol Core Operating System
 * v0.1.0-alpha
 *
 * Entry point: initializes the protocol core and starts the runtime.
 */
'use strict';

const { createRuntime } = require('./src/runtime');
const { createEventBus } = require('./src/event');
const { createMemoryLayer } = require('./src/memory');
const { createGovernanceEngine } = require('./src/governance');
const { createPipeline } = require('./src/pipeline');

const VERSION = require('./package.json').version;

async function main() {
  console.log(`\n⚡ OPC-OS v${VERSION} — OpenClaw Protocol Core Operating System`);
  console.log('─'.repeat(56));

  // 1. Initialize Event Bus
  console.log('\n📡 [1/5] Initializing Event Bus...');
  const bus = createEventBus();
  console.log('   ✅ Event Bus ready');

  // 2. Initialize Memory Layer
  console.log('\n🧠 [2/5] Initializing Memory Layer...');
  const memory = createMemoryLayer();
  console.log('   ✅ Memory Layer ready');

  // 3. Initialize Governance Engine
  console.log('\n⚖️  [3/5] Initializing Governance Engine...');
  const governance = createGovernanceEngine();
  console.log('   ✅ Governance Engine ready');

  // 4. Initialize Pipeline
  console.log('\n🔗 [4/5] Initializing Pipeline...');
  const pipeline = createPipeline();
  console.log('   ✅ Pipeline ready');

  // 5. Initialize Runtime
  console.log('\n🚀 [5/5] Initializing Agent Runtime...');
  const runtime = createRuntime({ bus, memory, governance, pipeline });
  runtime.start();
  console.log('   ✅ Agent Runtime started');

  // Health report
  console.log('\n' + '═'.repeat(56));
  console.log('📊 HEALTH REPORT');
  console.log('─'.repeat(56));
  const status = runtime.status();
  for (const [component, state] of Object.entries(status.components)) {
    const icon = state === 'healthy' ? '✅' : state === 'degraded' ? '🟡' : '🔴';
    console.log(`   ${icon} ${component}: ${state}`);
  }
  console.log(`   📦 Version: ${status.version}`);
  console.log(`   ⏱️  Uptime: ${status.uptime}s`);
  console.log('═'.repeat(56));
  console.log('\n✅ OPC-OS is running.\n');

  return runtime;
}

// Run if called directly
if (require.main === module) {
  main().catch((err) => {
    console.error('❌ Fatal:', err.message);
    process.exit(1);
  });
}

module.exports = { main };
