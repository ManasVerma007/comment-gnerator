const { generateStructuredContent } = require('./generators/structuredContent');
const { generateRawCommentsContent } = require('./generators/rawContentGenerator');
const { generateEmptyContent } = require('./templates/baseTemplate');

/**
 * Generate HTML content for the WebView panel.
 * @param {Array} codeElements - Extracted code elements or comments
 * @returns {string} HTML content
 */
function generateWebviewContent(codeElements) {
  if (!codeElements || codeElements.length === 0) {
    return generateEmptyContent();
  }

  // Check if we have structured elements or just raw comments
  // Make this check more robust - ensure the array has elements and first element has a type
  const hasStructuredElements = codeElements.length > 0 && 
                               codeElements.some(element => element && element.type);
  
  console.log("hasStructuredElements", hasStructuredElements);
  
  return generateBaseHTML(hasStructuredElements ? 
    generateStructuredContent(codeElements) : 
    generateRawCommentsContent(codeElements)
  );
}

/**
 * Generate the base HTML structure
 * @param {string} content - The content to place inside the body
 * @returns {string} Complete HTML document
 */
function generateBaseHTML(content) {
  const { getStyles } = require('./utils/styleUtils');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Documentation</title>
      <style>
        ${getStyles()}
      </style>
    </head>
    <body>
      <div class="documentation">
        <h1>Code Documentation</h1>
        ${content}
      </div>
    </body>
    </html>
  `;
}

module.exports = { generateWebviewContent };