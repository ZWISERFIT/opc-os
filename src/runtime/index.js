/**
 * Agent Runtime — manages agent lifecycle, health checks, and status.
 * v0.1.0-alpha
 */
'use strict';

function createRuntime(deps = {}) {
  const { bus, memory, governance, pipeline } = deps;
  const startTime = Date.now();
  const components = new Map();

  /**
   * Register a component for health tracking.
   */
  function register(name, instance) {
    components.set(name, { instance, status: 'healthy', lastCheck: Date.now() });
  }

  /**
   * Start the runtime.
   */
  function start() {
    // Register core components
    if (bus) register('event-bus', bus);
    if (memory) register('memory-layer', memory);
    if (governance) register('governance-engine', governance);
    if (pipeline) register('pipeline', pipeline);
    register('agent-runtime', { name: 'runtime' });

    // Emit startup event
    if (bus) {
      bus.emit('runtime.started', { version: require('../../package.json').version, timestamp: Date.now() });
    }

    return { started: true, startTime };
  }

  /**
   * Stop the runtime gracefully.
   */
  function stop() {
    if (bus) bus.emit('runtime.stopping', { timestamp: Date.now() });
    for (const [name, comp] of components) {
      if (comp.instance && typeof comp.instance.stop === 'function') {
        comp.instance.stop();
      }
      comp.status = 'stopped';
    }
    if (bus) bus.emit('runtime.stopped', { uptime: uptime(), timestamp: Date.now() });
  }

  /**
   * Get runtime status.
   */
  function status() {
    const compStatus = {};
    for (const [name, comp] of components) {
      compStatus[name] = comp.status;
    }
    return {
      version: require('../../package.json').version,
      uptime: uptime(),
      components: compStatus,
      healthy: Array.from(components.values()).every(c => c.status === 'healthy'),
    };
  }

  function uptime() {
    return Math.floor((Date.now() - startTime) / 1000);
  }

  return { start, stop, status, register };
}

module.exports = { createRuntime };
