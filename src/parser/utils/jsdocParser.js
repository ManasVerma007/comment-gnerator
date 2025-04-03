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
  
  module.exports = { extractJSDocInfo };