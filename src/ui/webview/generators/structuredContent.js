const { generateFunctionHTML } = require('./functionGenerator');
const { generateVariableHTML } = require('./variableGenerator');
const { generateClassHTML } = require('./classGenerator');
const { generateExportHTML } = require('./exportGenerator');
const { generateRawCommentsContent } = require('./rawContentGenerator');

/**
 * Generate content for structured code elements
 * @param {Array} codeElements - Structured code elements
 * @returns {string} HTML content
 */
function generateStructuredContent(codeElements) {
  console.log("Generating structured content for code elements:", codeElements);
  
  // Filter out undefined elements and ensure all have a type property
  const validElements = codeElements.filter(element => element && element.type);
  
  // If no valid elements remain, try to display them as raw comments
  if (validElements.length === 0) {
    return generateRawCommentsContent(codeElements);
  }
  
  return validElements.map(element => {
    console.log("Processing element:", element);
    switch(element.type) {
      case 'function':
        return generateFunctionHTML(element);
      case 'variable':
        return generateVariableHTML(element);
      case 'class':
        return generateClassHTML(element);
      case 'export':
        return generateExportHTML(element);
      default:
        return ''; // Skip elements with unknown types
    }
  }).join('');
}

module.exports = { generateStructuredContent };