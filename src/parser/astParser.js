const esprima = require('esprima');

/**
 * Parse JavaScript code into an AST.
 * @param {string} code - The JavaScript code to parse.
 * @returns {object} The AST.
 */
function parseCodeToAST(code) {
  return esprima.parseScript(code, { comment: true, loc: true });
}

module.exports = { parseCodeToAST };