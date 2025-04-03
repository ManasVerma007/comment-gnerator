const { extractParamName, findAssociatedComments, extractInlineComments, extractLocalVariables } = require('../utils/nodeUtils');
const { extractJSDocInfo } = require('../utils/jsdocParser');

/**
 * Process a function declaration and extract relevant information
 * @param {Object} node - Function declaration node
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function processFunctionDeclaration(node, comments, codeElements) {
  const associatedComments = findAssociatedComments(node, comments);

  const functionElement = {
    type: 'function',
    name: node.id ? node.id.name : 'anonymous',
    params: node.params.map(param => extractParamName(param)),
    location: node.loc,
    comments: associatedComments
  };
  
  // Extract JSDoc info if available
  const jsdoc = extractJSDocInfo(functionElement.comments);
  if (jsdoc) {
    functionElement.jsdoc = jsdoc;
  }
  
  // Extract inline comments from function body
  const inlineComments = extractInlineComments(node, comments);
  if (inlineComments.length > 0) {
    functionElement.inlineComments = inlineComments;
  }
  
  // Extract local variables declared in the function body
  if (node.body && node.body.body) {
    const localVariables = extractLocalVariables(node.body.body);
    if (localVariables.length > 0) {
      functionElement.localVariables = localVariables;
    }
  }

  codeElements.push(functionElement);
}

module.exports = { processFunctionDeclaration };