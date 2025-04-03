const { parseCodeToAST } = require('./astParser');

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
    console.log('comments are here ', comments);
    
    // Process the AST body
    traverseAST(ast.body, comments, codeElements);
    console.log("code - elements", codeElements);
    
    // Safety check - ensure all elements in codeElements have a type property
    const validElements = codeElements.filter(element => element && element.type);
    
    return validElements.length > 0 ? validElements : comments;
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
 * @param {Object} options - Options for traversal (e.g., current scope)
 */
function traverseAST(nodes, comments, codeElements, options = { inFunctionScope: false }) {
  if (!nodes || !Array.isArray(nodes)) return;
  
  nodes.forEach(node => {
    if (!node) return;
    
    switch (node.type) {
      case 'FunctionDeclaration':
        processFunctionDeclaration(node, comments, codeElements);
        
        // For function body, set the inFunctionScope flag to true
        if (node.body && node.body.body) {
          traverseAST(node.body.body, comments, codeElements, { inFunctionScope: true });
        }
        return; // Skip further processing of this node
        
      case 'VariableDeclaration':
        // Only process variable declarations at the root scope, not inside functions
        if (!options.inFunctionScope) {
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
          traverseAST([node.declaration], comments, codeElements, options);
        }
        break;
    }
    
    // Check for nested blocks that might contain more declarations
    if (node.body && Array.isArray(node.body)) {
      // Pass the current scope information to nested traversals
      traverseAST(node.body, comments, codeElements, options);
    } else if (node.body && node.body.body) {
      // For bodies within bodies (like in if statements, loops, etc.)
      traverseAST(node.body.body, comments, codeElements, options);
    }
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
 * Extract structured information from JSDoc comments
 * @param {Array} comments - Comments to analyze
 * @returns {Object|null} Structured JSDoc information or null
 */
function extractJSDocInfo(comments) {
  if (!comments || !comments.length) return null;
  
  // Look for JSDoc style comments (starting with /**)
  const jsdocComments = comments.filter(comment => 
    comment.value && comment.value.trim().startsWith('*')
  );
  
  if (!jsdocComments.length) return null;
  
  const jsdocComment = jsdocComments[0].value;
  const jsdoc = {
    description: '',
    params: [],
    returns: null,
    examples: []
  };
  
  // Extract description (first part before any tag)
  const descMatch = jsdocComment.match(/^\s*\*\s*([\s\S]*?)(?:@|\*\/)/);
  if (descMatch) {
    jsdoc.description = descMatch[1].trim();
  }
  
  // Extract @param tags
  const paramMatches = Array.from(jsdocComment.matchAll(/@param\s+(?:{([^}]*)})?\s*(?:\[([^\]]*)\]|(\S+))\s*-?\s*([\s\S]*?)(?=@|\*\/|$)/g));
  for (const match of paramMatches) {
    jsdoc.params.push({
      type: match[1] || '',
      name: match[2] || match[3] || '',
      description: (match[4] || '').trim()
    });
  }
  
  // Extract @returns tag
  const returnMatch = jsdocComment.match(/@returns?\s+(?:{([^}]*)})?\s*-?\s*([\s\S]*?)(?=@|\*\/|$)/);
  if (returnMatch) {
    jsdoc.returns = {
      type: returnMatch[1] || '',
      description: (returnMatch[2] || '').trim()
    };
  }
  
  // Extract @example tags
  const exampleMatches = Array.from(jsdocComment.matchAll(/@example\s*([\s\S]*?)(?=@|\*\/|$)/g));
  for (const match of exampleMatches) {
    jsdoc.examples.push(match[1].trim());
  }
  
  // Extract @throws tags
  const throwsMatches = Array.from(jsdocComment.matchAll(/@throws?\s+(?:{([^}]*)})?\s*-?\s*([\s\S]*?)(?=@|\*\/|$)/g));
  if (throwsMatches.length > 0) {
    jsdoc.throws = throwsMatches.map(match => ({
      type: match[1] || '',
      description: (match[2] || '').trim()
    }));
  }
  
  // Extract @deprecated tag
  const deprecatedMatch = jsdocComment.match(/@deprecated\s*([\s\S]*?)(?=@|\*\/|$)/);
  if (deprecatedMatch) {
    jsdoc.deprecated = deprecatedMatch[1].trim();
  }
  
  // Extract @since tag
  const sinceMatch = jsdocComment.match(/@since\s*([\s\S]*?)(?=@|\*\/|$)/);
  if (sinceMatch) {
    jsdoc.since = sinceMatch[1].trim();
  }
  
  return jsdoc;
}

module.exports = { extractCommentsFromAST };