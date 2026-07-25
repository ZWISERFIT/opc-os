# OPC-OS

**OpenClaw Protocol Core Operating System**

Agent 协议栈核心 —— 多智能体自治协同基础设施。

## Quick Start

```bash
git clone https://github.com/ZWISERFIT/opc-os.git
cd opc-os
npm start        # Boot the protocol core
npm test         # Run 38 verification tests
```

### What you'll see

```
⚡ OPC-OS v0.1.0-alpha — OpenClaw Protocol Core Operating System

📡 [1/5] Initializing Event Bus...
   ✅ Event Bus ready
🧠 [2/5] Initializing Memory Layer...
   ✅ Memory Layer ready
⚖️  [3/5] Initializing Governance Engine...
   ✅ Governance Engine ready
🔗 [4/5] Initializing Pipeline...
   ✅ Pipeline ready
🚀 [5/5] Initializing Agent Runtime...
   ✅ Agent Runtime started

📊 HEALTH REPORT
   ✅ event-bus: healthy
   ✅ memory-layer: healthy
   ✅ governance-engine: healthy
   ✅ pipeline: healthy
   ✅ agent-runtime: healthy
```

## Architecture

OPC-OS 是 ZWISERFIT 多 Agent 协同系统的协议核心层，提供：

| Module | Description |
|--------|-------------|
| **Agent Runtime** | 多智能体生命周期管理与自治运行 |
| **Event Bus** | 跨 Agent 事件驱动通信（支持通配符匹配） |
| **Memory Layer** | 多维度持久记忆（支持 TTL 过期） |
| **Governance Engine** | 可审计的策略约束与违规记录 |
| **Pipeline** | 标准化数据管道与跨框架桥接 |

## Verification

```bash
npm test
# 38 tests covering all 6 core modules
```

## ZWISERFIT

OPC-OS is a core component of [ZWISERFIT](https://github.com/ZWISERFIT) — AI × Human Synergistic Protocol for physical business infrastructure.

## License

Apache License 2.0 — see [LICENSE](./LICENSE)

## Status

🚧 Alpha — active development, internal deployment at ZWISERFIT.
