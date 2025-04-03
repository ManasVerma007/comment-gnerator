const { parseCodeToAST } = require('./astParser');
const { processFunctionDeclaration } = require('./extractors/functionExtractor');
const { processVariableDeclaration } = require('./extractors/variableExtractor');
const { processClassDeclaration } = require('./extractors/classExtractor');
const { processAssignmentExpression } = require('./extractors/exportExtractor');
const { extractRawComments } = require('./extractors/commentExtractor');
const { createScope, createChildScope } = require('./utils/scopeUtils');
const fs = require('fs');
const path = require('path');

/**
 * Safely extract comments from AST
 * @param {string} code - The JavaScript code
 * @returns {Array} Extracted code elements with associated comments
 */
function extractCommentsFromAST(code) {
  try {
    const ast = parseCodeToAST(code);
    
    // Store all comments for later association
    const comments = ast.comments || [];
    const codeElements = [];
    
    // Log AST comments and body to files in dev-test-folder
    const devTestFolder = path.resolve(__dirname, '../../dev-test-folder');
    
    if (!fs.existsSync(devTestFolder)) {
      fs.mkdirSync(devTestFolder, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(devTestFolder, 'ast.comments.log'),
      JSON.stringify(comments, null, 2)
    );
    
    fs.writeFileSync(
      path.join(devTestFolder, 'ast.body.log'),
      JSON.stringify(ast.body, null, 2)
    );
    
    // Process the AST body with proper scope tracking
    traverseAST(ast.body, comments, codeElements, createScope());
    
    // Safety check - ensure all elements in codeElements have a type property
    const validElements = codeElements.filter(element => element && element.type);
    
    return validElements.length > 0 ? validElements : extractRawComments(ast);
  } catch (error) {
    console.error("Error parsing code:", error);
    // Return empty array on error to avoid crashing
    return [];
  }
}

/**
 * Traverse the AST and extract code elements with their associated comments
 * @param {Array} nodes - AST nodes to traverse
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 * @param {Object} scope - Current scope information
 */
function traverseAST(nodes, comments, codeElements, scope) {
  if (!nodes || !Array.isArray(nodes)) return;
  
  nodes.forEach(node => {
    if (!node) return;
    
    switch (node.type) {
      case 'FunctionDeclaration':
        processFunctionDeclaration(node, comments, codeElements);
        
        // For function body, create a new function scope
        if (node.body && node.body.body) {
          traverseAST(
            node.body.body, 
            comments, 
            codeElements, 
            createChildScope(scope, { inFunctionScope: true, parentNode: node })
          );
        }
        return; // Skip further processing of this node
        
      case 'VariableDeclaration':
        // Only process variable declarations at the root scope, not inside functions
        if (!scope.inFunctionScope) {
          processVariableDeclaration(node, comments, codeElements);
        }
        break;
      
      case 'ClassDeclaration':
        processClassDeclaration(node, comments, codeElements);
        break;
      
      case 'ExpressionStatement':
        if (node.expression.type === 'AssignmentExpression') {
          processAssignmentExpression(node.expression, comments, codeElements);
        }
        break;      
      
      case 'ExportNamedDeclaration':
      case 'ExportDefaultDeclaration':
        if (node.declaration) {
          traverseAST([node.declaration], comments, codeElements, scope);
        }
        break;
    }
    
    // Check for nested blocks that might contain more declarations
    if (node.body && Array.isArray(node.body)) {
      // Pass the current scope information to nested traversals
      traverseAST(node.body, comments, codeElements, scope);
    } else if (node.body && node.body.body) {
      // For bodies within bodies (like in if statements, loops, etc.)
      // Create appropriate scope based on node type
      let newScope = scope;
      
      if (node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        newScope = createChildScope(scope, { inFunctionScope: true, parentNode: node });
      } else if (node.type === 'ClassBody') {
        newScope = createChildScope(scope, { inClassScope: true, parentNode: node });
      } else if (node.type === 'ForStatement' || node.type === 'WhileStatement' || node.type === 'DoWhileStatement') {
        newScope = createChildScope(scope, { inLoopScope: true, parentNode: node });
      }
      
      traverseAST(node.body.body, comments, codeElements, newScope);
    }
  });
}

module.exports = { extractCommentsFromAST };