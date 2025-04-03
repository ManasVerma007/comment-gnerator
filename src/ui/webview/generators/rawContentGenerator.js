/**
 * Generate content for raw comments
 * @param {Array} comments - Raw comments
 * @returns {string} HTML content
 */
function generateRawCommentsContent(comments) {
  if (!comments || comments.length === 0) {
    return '<p>No comments found.</p>';
  }
  
  return comments.map(comment => {
    // Handle case where comment is undefined or not an object
    if (!comment) {
      return '';
    }
    
    // Handle both string comments and comment objects
    const commentValue = typeof comment === 'string' ? comment : (comment.value || JSON.stringify(comment));
    const location = comment.loc ? `<div class="location">Line: ${comment.loc.start.line}</div>` : '';
    
    return `
      <div class="element">
        <pre class="code-block">${commentValue}</pre>
        ${location}
      </div>
    `;
  }).filter(Boolean).join(''); // Filter out empty strings
}

module.exports = { generateRawCommentsContent };