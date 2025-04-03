const { extractParamName, findAssociatedComments, extractInlineComments } = require('../utils/nodeUtils');
const { extractJSDocInfo } = require('../utils/jsdocParser');

/**
 * Process a class declaration and extract relevant information
 * @param {Object} node - Class declaration node
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function processClassDeclaration(node, comments, codeElements) {
  const classElement = {
    type: 'class',
    name: node.id ? node.id.name : 'anonymous',
    location: node.loc,
    methods: [],
    comments: findAssociatedComments(node, comments)
  };
  
  // Process class methods
  if (node.body && node.body.body) {
    node.body.body.forEach(methodNode => {
      if (methodNode.type === 'MethodDefinition') {
        const method = {
          name: methodNode.key.name || (methodNode.key.type === 'Literal' ? methodNode.key.value : 'unnamed'),
          kind: methodNode.kind, // 'constructor', 'method', 'get', or 'set'
          static: methodNode.static,
          params: methodNode.value.params.map(param => extractParamName(param)),
          comments: findAssociatedComments(methodNode, comments),
          location: methodNode.loc
        };
        
        // Extract inline comments from method body
        const inlineComments = extractInlineComments(methodNode.value, comments);
        if (inlineComments.length > 0) {
          method.inlineComments = inlineComments;
        }
        
        // Extract JSDoc info for the method if available
        const jsdoc = extractJSDocInfo(method.comments);
        if (jsdoc) {
          method.jsdoc = jsdoc;
        }
        
        classElement.methods.push(method);
      }
    });
  }
  
  // Extract JSDoc info for the class if available
  const jsdoc = extractJSDocInfo(classElement.comments);
  if (jsdoc) {
    classElement.jsdoc = jsdoc;
  }
  
  codeElements.push(classElement);
}

module.exports = { processClassDeclaration };