const { parseCodeToAST } = require('./astParser');

/**
 * Extract comments from the AST.
 * @param {string} code - The JavaScript code.
 * @returns {Array} Extracted comments.
 */
function extractCommentsFromAST(code) {
  const ast = parseCodeToAST(code);
  return ast.comments || [];
}

module.exports = { extractCommentsFromAST };