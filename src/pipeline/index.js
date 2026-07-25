/**
 * Pipeline — data pipeline and cross-framework bridge.
 * v0.1.0-alpha
 */
'use strict';

function createPipeline() {
  const stages = [];

  /**
   * Register a pipeline stage.
   * @param {string} name
   * @param {Function} transform - (data) => transformedData
   */
  function stage(name, transform) {
    stages.push({ name, transform });
    return stages.length - 1;
  }

  /**
   * Execute all stages in order on the input data.
   */
  async function execute(input, context = {}) {
    let data = input;
    const trace = [];

    for (const st of stages) {
      const start = Date.now();
      try {
        data = await st.transform(data, context);
        trace.push({ stage: st.name, duration: Date.now() - start, status: 'ok' });
      } catch (e) {
        trace.push({ stage: st.name, duration: Date.now() - start, status: 'error', error: e.message });
        break;
      }
    }

    return { data, trace };
  }

  /**
   * Get the list of configured stages.
   */
  function list() {
    return stages.map(s => s.name);
  }

  function status() {
    return {
      stages: stages.length,
      pipeline: stages.map(s => s.name),
    };
  }

  return { stage, execute, list, status };
}

module.exports = { createPipeline };
