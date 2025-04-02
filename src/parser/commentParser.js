const { parseCodeToAST } = require('./astParser');

/**
 * Extract code structure and comments from the AST.
 * @param {string} code - The JavaScript code.
 * @returns {Array} Extracted code elements with associated comments.
 */
function extractCommentsFromAST(code) {
  const ast = parseCodeToAST(code);
  
  // Store all comments for later association
  const comments = ast.comments || [];
  console.log('All comments:', comments); 
  console.log('AST Body:', ast.body);
  const codeElements = [];
  
  // Process the AST body
  traverseAST(ast.body, comments, codeElements);
  // console.log('Extracted code elements:', codeElements);
  
  return codeElements.length > 0 ? codeElements : comments;
}

/**
 * Traverse the AST and extract code elements with their associated comments
 * @param {Array} nodes - AST nodes to traverse
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function traverseAST(nodes, comments, codeElements) {
  if (!nodes || !Array.isArray(nodes)) return;
  
  nodes.forEach(node => {
    if (!node) return;
    
    switch (node.type) {
      case 'FunctionDeclaration':
        processFunctionDeclaration(node, comments, codeElements);
        break;
      
      case 'VariableDeclaration':
        processVariableDeclaration(node, comments, codeElements);
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
          traverseAST([node.declaration], comments, codeElements);
        }
        break;
    }
    
    // Check for nested blocks that might contain more declarations
    if (node.body && Array.isArray(node.body)) {
      traverseAST(node.body, comments, codeElements);
    } else if (node.body && node.body.body) {
      traverseAST(node.body.body, comments, codeElements);
    }
  });
}

/**
 * Process a function declaration and extract relevant information
 * @param {Object} node - Function declaration node
 * @param {Array} comments - All comments from the AST
 * @param {Array} codeElements - Array to store extracted code elements
 */
function processFunctionDeclaration(node, comments, codeElements) {
  // Print all available comments passed to this function
  console.log('--------------- FUNCTION DECLARATION ---------------');
  console.log(`Function: ${node.id ? node.id.name : 'anonymous'}`);
  console.log('All available comments:', comments.map(c => ({
    value: c.value,
    start: c.loc.start.line,
    end: c.loc.end.line
  })));
  
  const associatedComments = findAssociatedComments(node, comments);
  
  // Print comments that were associated with this function
  console.log('Associated comments:', associatedComments.map(c => ({
    value: c.value,
    start: c.loc.start.line,
    end: c.loc.end.line
  })));

  const functionElement = {
    type: 'function',
    name: node.id ? node.id.name : 'anonymous',
    params: node.params.map(param => param.name || 'unnamed'),
    location: node.loc,
    comments: associatedComments
  };
  
  // Extract JSDoc info if available
  const jsdoc = extractJSDocInfo(functionElement.comments);
  if (jsdoc) {
    functionElement.jsdoc = jsdoc;
    console.log('Extracted JSDoc:', jsdoc);
  } else {
    console.log('No JSDoc found for this function');
  }
  
  console.log('Function element:', {
    type: functionElement.type,
    name: functionElement.name,
    params: functionElement.params,
    commentCount: functionElement.comments.length
  });
  console.log('--------------------------------------------------');

  codeElements.push(functionElement);
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
      location: declaration.loc,
      comments: findAssociatedComments(node, comments)
    };

    // Check if it's a function expression
    if (declaration.init && (declaration.init.type === 'FunctionExpression' || declaration.init.type === 'ArrowFunctionExpression')) {
      variableElement.isFunction = true;
      variableElement.params = declaration.init.params.map(param => param.name || 'unnamed');
    }
    
    // Extract JSDoc info if available
    const jsdoc = extractJSDocInfo(variableElement.comments);
    if (jsdoc) {
      variableElement.jsdoc = jsdoc;
    }

    // console.log("variableElemets", variableElement)
    
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
          name: methodNode.key.name,
          kind: methodNode.kind, // 'constructor', 'method', 'get', or 'set'
          static: methodNode.static,
          params: methodNode.value.params.map(param => param.name || 'unnamed'),
          comments: findAssociatedComments(methodNode, comments)
        };
        
        classElement.methods.push(method);
      }
    });
  }
  
  // Extract JSDoc info if available
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
        name: node.left.property ? node.left.property.name : 'default',
        location: node.loc,
        comments: findAssociatedComments(node, comments)
      };
      
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
function findAssociatedComments(node, comments){

  if (!node.loc || !comments.length) return [];
  
  // Find all comments that end before the node starts
  // and are not too far away (within 2 lines)
  console.log(node.loc.start.line, node.loc.end.line)
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
  const paramMatches = jsdocComment.matchAll(/@param\s+(?:{([^}]*)})?\s*(?:\[([^\]]*)\]|(\S+))\s*-?\s*([\s\S]*?)(?=@|\*\/|$)/g);
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
  const exampleMatches = jsdocComment.matchAll(/@example\s*([\s\S]*?)(?=@|\*\/|$)/g);
  for (const match of exampleMatches) {
    jsdoc.examples.push(match[1].trim());
  }
  
  return jsdoc;
}

module.exports = { extractCommentsFromAST };