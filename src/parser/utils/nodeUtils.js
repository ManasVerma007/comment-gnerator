/**
 * Extract parameter name, handling different parameter types
 * @param {Object} param - Parameter node from AST
 * @returns {string} Parameter name
 */
function extractParamName(param) {
    if (!param) return 'unnamed';
    
    switch (param.type) {
      case 'Identifier':
        return param.name;
      case 'AssignmentPattern': // Default parameters
        return param.left.name;
      case 'RestElement': // Rest parameters
        return `...${param.argument.name}`;
      case 'ObjectPattern': // Destructured object
        return '{' + param.properties.map(p => p.key.name).join(', ') + '}';
      case 'ArrayPattern': // Destructured array
        return '[' + param.elements.map(e => e ? e.name : '').join(', ') + ']';
      default:
        return 'unnamed';
    }
  }
  
  /**
   * Find comments associated with a given node
   * @param {Object} node - AST node
   * @param {Array} comments - All comments from the AST
   * @returns {Array} Associated comments
   */
  function findAssociatedComments(node, comments) {
    if (!node.loc || !comments.length) return [];
    
    // Find all comments that end before the node starts
    // and are not too far away (within 2 lines)
    return comments.filter(comment => {
      return comment.loc.end.line <= node.loc.start.line &&
             node.loc.start.line - comment.loc.end.line <= 2;
    });
  }
  
  /**
   * Extract inline comments from a function body
   * @param {Object} node - AST node with a body property
   * @param {Array} allComments - All comments from the AST
   * @returns {Array} Comments found within the function body
   */
  function extractInlineComments(node, allComments) {
    if (!node.body || !node.body.loc) {
      return [];
    }
    
    // Get the range of the function body
    const bodyStartLine = node.body.loc.start.line;
    const bodyEndLine = node.body.loc.end.line;
    
    // Find all comments that are within the function body
    return allComments.filter(comment => {
      return comment.loc.start.line > bodyStartLine && 
             comment.loc.end.line < bodyEndLine;
    });
  }
  
  /**
   * Extract local variables from function body nodes
   * @param {Array} bodyNodes - Function body nodes
   * @returns {Array} Array of local variable objects
   */
  function extractLocalVariables(bodyNodes) {
    const variables = [];
    
    bodyNodes.forEach(node => {
      if (node.type === 'VariableDeclaration') {
        node.declarations.forEach(declaration => {
          variables.push({
            name: declaration.id.name,
            kind: node.kind, // 'var', 'let', or 'const'
            location: declaration.loc || node.loc
          });
        });
      }
    });
    
    return variables;
  }
  
  module.exports = {
    extractParamName,
    findAssociatedComments,
    extractInlineComments,
    extractLocalVariables
  };