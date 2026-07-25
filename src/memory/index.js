/**
 * Memory Layer — in-memory key-value store with TTL support.
 * v0.1.0-alpha — designed as pluggable interface for SQLite/ChromaDB backends.
 */
'use strict';

function createMemoryLayer() {
  const store = new Map();
  const metadata = new Map(); // TTL, created, etc.

  /**
   * Set a value with optional TTL (ms).
   */
  function set(key, value, ttlMs = null) {
    const entry = { value, created: Date.now(), ttl: ttlMs };
    store.set(key, value);
    metadata.set(key, entry);

    if (ttlMs) {
      setTimeout(() => {
        if (metadata.get(key)?.created === entry.created) {
          store.delete(key);
          metadata.delete(key);
        }
      }, ttlMs);
    }
  }

  /**
   * Get a value. Returns null if expired or missing.
   */
  function get(key) {
    const meta = metadata.get(key);
    if (!meta) return null;
    if (meta.ttl && Date.now() - meta.created > meta.ttl) {
      store.delete(key);
      metadata.delete(key);
      return null;
    }
    return store.get(key);
  }

  /**
   * Delete a key.
   */
  function del(key) {
    store.delete(key);
    metadata.delete(key);
  }

  /**
   * Check if key exists and is not expired.
   */
  function has(key) {
    return get(key) !== null;
  }

  /**
   * Get all keys.
   */
  function keys() {
    const result = [];
    for (const key of store.keys()) {
      if (get(key) !== null) result.push(key);
    }
    return result;
  }

  function status() {
    return {
      entries: store.size,
      backend: 'in-memory',
    };
  }

  return { set, get, del, has, keys, status };
}

module.exports = { createMemoryLayer };
