/**
 * Event Bus — lightweight pub/sub event system for cross-agent communication.
 * v0.1.0-alpha
 */
'use strict';

function createEventBus() {
  const listeners = new Map();
  const eventLog = [];
  const MAX_LOG = 1000;

  /**
   * Subscribe to an event pattern.
   * Pattern supports '*' wildcard: 'agent.*' matches 'agent.start', 'agent.stop', etc.
   */
  function on(pattern, handler) {
    if (!listeners.has(pattern)) {
      listeners.set(pattern, []);
    }
    listeners.get(pattern).push(handler);
    return () => off(pattern, handler); // Return unsubscribe function
  }

  /**
   * Remove a listener.
   */
  function off(pattern, handler) {
    const handlers = listeners.get(pattern);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    }
  }

  /**
   * Emit an event.
   */
  function emit(event, data = {}) {
    const entry = { event, data, timestamp: Date.now() };
    eventLog.push(entry);
    if (eventLog.length > MAX_LOG) eventLog.shift();

    // Match exact listeners
    const exact = listeners.get(event) || [];
    for (const handler of exact) {
      try { handler(data, event); } catch (e) { /* log but don't crash */ }
    }

    // Match wildcard listeners (e.g., 'runtime.*')
    for (const [pattern, handlers] of listeners) {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        if (regex.test(event) && pattern !== event) {
          for (const handler of handlers) {
            try { handler(data, event); } catch (e) { /* log but don't crash */ }
          }
        }
      }
    }

    return entry;
  }

  /**
   * Get recent event log for debugging.
   */
  function history(limit = 50) {
    return eventLog.slice(-limit);
  }

  /**
   * Get listener count for diagnostics.
   */
  function listenerCount() {
    let count = 0;
    for (const handlers of listeners.values()) count += handlers.length;
    return count;
  }

  function status() {
    return {
      listeners: listenerCount(),
      eventsLogged: eventLog.length,
    };
  }

  return { on, off, emit, history, listenerCount, status };
}

module.exports = { createEventBus };
