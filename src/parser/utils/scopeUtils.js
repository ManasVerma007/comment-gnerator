/**
 * Create a scope tracking object
 * @returns {Object} Scope tracking object
 */
function createScope() {
    return {
      inFunctionScope: false,
      inClassScope: false,
      inLoopScope: false,
      parentNode: null
    };
  }
  
  /**
   * Create a new child scope from a parent scope
   * @param {Object} parentScope - The parent scope
   * @param {Object} options - Options to override in the new scope
   * @returns {Object} New child scope
   */
  function createChildScope(parentScope, options = {}) {
    return {
      ...parentScope,
      ...options
    };
  }
  
  module.exports = {
    createScope,
    createChildScope
  };