const { extractCommentsFromAST } = require('./commentParser');
const { parseCodeToAST } = require('./astParser');

module.exports = {
  extractCommentsFromAST,
  parseCodeToAST
};