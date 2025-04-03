const { extractParamName, findAssociatedComments, extractInlineComments } = require('../utils/nodeUtils');
const { extractJSDocInfo } = require('../utils/jsdocParser');

/**
 * Process an assignment expression (like module.exports = {})
 * @param {Object} node - Assignment expression node
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function processAssignmentExpression(node, comments, codeElements) {
  // Handle module.exports or exports.X assignment
  if (node.left.type === 'MemberExpression') {
    const object = node.left.object.name;
    if (object === 'module' || object === 'exports') {
      const exportElement = {
        type: 'export',
        name: node.left.property ? 
              (node.left.property.type === 'Identifier' ? node.left.property.name : 'default') : 
              'default',
        location: node.loc,
        comments: findAssociatedComments(node, comments)
      };
      
      // Check if the right side is a function expression
      if (node.right.type === 'FunctionExpression' || node.right.type === 'ArrowFunctionExpression') {
        exportElement.isFunction = true;
        exportElement.params = node.right.params.map(param => extractParamName(param));
        
        // Extract inline comments from function body
        const inlineComments = extractInlineComments(node.right, comments);
        if (inlineComments.length > 0) {
          exportElement.inlineComments = inlineComments;
        }
      }
      
      // Extract JSDoc info if available
      const jsdoc = extractJSDocInfo(exportElement.comments);
      if (jsdoc) {
        exportElement.jsdoc = jsdoc;
      }
      
      codeElements.push(exportElement);
    }
  }
}

module.exports = { processAssignmentExpression };