/**
 * Extract raw comments from code
 * @param {Object} ast - The AST from which to extract comments
 * @returns {Array} Array of comment objects
 */
function extractRawComments(ast) {
    if (!ast || !ast.comments) {
      return [];
    }
    
    return ast.comments.map(comment => ({
      type: comment.type,          // 'Line' or 'Block'
      value: comment.value,        // The comment text without the comment delimiters
      loc: comment.loc,            // Location information
      isJSDoc: comment.value.trim().startsWith('*') // Whether this is a JSDoc-style comment
    }));
  }
  
  /**
   * Group comments by their proximity to code elements
   * @param {Array} comments - Array of comment objects
   * @param {Array} codeElements - Array of code elements
   * @returns {Object} Object with comments grouped by their relation to code
   */
  function groupCommentsByProximity(comments, codeElements) {
    const result = {
      attached: [],     // Comments attached to code elements
      standalone: [],   // Comments that appear to be standalone
      inline: []        // Comments that appear inside function bodies
    };
    
    // First, identify attached comments
    codeElements.forEach(element => {
      if (element.comments && element.comments.length > 0) {
        result.attached.push(...element.comments);
      }
      
      if (element.inlineComments && element.inlineComments.length > 0) {
        result.inline.push(...element.inlineComments);
      }
      
      // For elements with methods (like classes)
      if (element.methods) {
        element.methods.forEach(method => {
          if (method.comments && method.comments.length > 0) {
            result.attached.push(...method.comments);
          }
          
          if (method.inlineComments && method.inlineComments.length > 0) {
            result.inline.push(...method.inlineComments);
          }
        });
      }
    });
    
    // Find comment IDs that are already attached
    const attachedIds = new Set(result.attached.map(c => c.loc ? `${c.loc.start.line}:${c.loc.start.column}` : ''));
    const inlineIds = new Set(result.inline.map(c => c.loc ? `${c.loc.start.line}:${c.loc.start.column}` : ''));
    
    // Comments that are not attached to any code element are standalone
    result.standalone = comments.filter(comment => {
      if (!comment.loc) return false;
      
      const commentId = `${comment.loc.start.line}:${comment.loc.start.column}`;
      return !attachedIds.has(commentId) && !inlineIds.has(commentId);
    });
    
    return result;
  }
  
  module.exports = {
    extractRawComments,
    groupCommentsByProximity
  };