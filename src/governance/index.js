/**
 * Governance Engine — constraint validation and policy enforcement.
 * v0.1.0-alpha
 */
'use strict';

function createGovernanceEngine() {
  const constraints = new Map();
  const violations = [];

  /**
   * Register a constraint rule.
   * @param {string} name - Constraint name
   * @param {Function} check - Validation function, returns { pass: boolean, reason?: string }
   */
  function register(name, check) {
    constraints.set(name, { check, registered: Date.now() });
    return name;
  }

  /**
   * Validate all constraints. Returns pass/fail report.
   */
  function validate(context = {}) {
    const results = [];
    for (const [name, { check }] of constraints) {
      try {
        const result = check(context);
        if (!result.pass) {
          violations.push({ constraint: name, reason: result.reason, timestamp: Date.now() });
        }
        results.push({ constraint: name, pass: result.pass, reason: result.reason || null });
      } catch (e) {
        violations.push({ constraint: name, reason: e.message, timestamp: Date.now() });
        results.push({ constraint: name, pass: false, reason: e.message });
      }
    }
    return results;
  }

  /**
   * Get recent violations.
   */
  function getViolations(limit = 50) {
    return violations.slice(-limit);
  }

  function status() {
    return {
      constraints: constraints.size,
      violations: violations.length,
    };
  }

  return { register, validate, getViolations, status };
}

module.exports = { createGovernanceEngine };
