/**
 * Shared utilities for OPC-OS.
 * v0.1.0-alpha
 */
'use strict';

/**
 * Generate a unique ID.
 */
function uid(prefix = 'evt') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Simple logger with levels.
 */
function createLogger(name) {
  const levels = { debug: 0, info: 1, warn: 2, error: 3 };
  let level = 'info';

  function log(lvl, ...args) {
    if (levels[lvl] >= levels[level]) {
      const ts = new Date().toISOString();
      const prefix = `[${ts}] [${lvl.toUpperCase()}] [${name}]`;
      if (lvl === 'error') console.error(prefix, ...args);
      else if (lvl === 'warn') console.warn(prefix, ...args);
      else console.log(prefix, ...args);
    }
  }

  return {
    debug: (...a) => log('debug', ...a),
    info: (...a) => log('info', ...a),
    warn: (...a) => log('warn', ...a),
    error: (...a) => log('error', ...a),
    setLevel: (l) => { level = l; },
  };
}

/**
 * Sleep helper.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { uid, createLogger, sleep };
