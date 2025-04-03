const { extractParamName, findAssociatedComments, extractInlineComments } = require('../utils/nodeUtils');
const { extractJSDocInfo } = require('../utils/jsdocParser');

/**
 * Process a variable declaration and extract relevant information
 * @param {Object} node - Variable declaration node
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function processVariableDeclaration(node, comments, codeElements) {
  node.declarations.forEach(declaration => {
    const variableElement = {
      type: 'variable',
      kind: node.kind, // 'var', 'let', or 'const'
      name: declaration.id.name,
      location: declaration.loc || node.loc,
      comments: findAssociatedComments(node, comments)
    };

    // Check if it's a function expression
    if (declaration.init && (declaration.init.type === 'FunctionExpression' || declaration.init.type === 'ArrowFunctionExpression')) {
      variableElement.isFunction = true;
      variableElement.params = declaration.init.params.map(param => extractParamName(param));
      
      // Extract inline comments if it's a function expression with block body
      if (declaration.init.body && declaration.init.body.type === 'BlockStatement') {
        const inlineComments = extractInlineComments(declaration.init, comments);
        if (inlineComments.length > 0) {
          variableElement.inlineComments = inlineComments;
        }
      }
    }
    
    // Extract JSDoc info if available
    const jsdoc = extractJSDocInfo(variableElement.comments);
    if (jsdoc) {
      variableElement.jsdoc = jsdoc;
    }
    
    codeElements.push(variableElement);
  });
}

module.exports = { processVariableDeclaration };