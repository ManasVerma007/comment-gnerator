/**
 * Generate HTML for an export element
 * @param {Object} exportElement - Export element
 * @returns {string} HTML content
 */
function generateExportHTML(exportElement) {
    return `
      <div class="element">
        <div class="element-header">
          <span class="element-name">module.exports.${exportElement.name}</span>
          <span class="element-type">Export</span>
        </div>
        
        <div class="location">Line: ${exportElement.location.start.line}</div>
        
        <div class="element-content">
          ${exportElement.comments && exportElement.comments.length > 0 ? 
            `<div class="description">${exportElement.comments[0].value}</div>` : 
            '<div class="no-docs">No description available</div>'
          }
        </div>
      </div>
    `;
  }
  
  module.exports = { generateExportHTML };