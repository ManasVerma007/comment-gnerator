/**
 * Generate HTML for a class element
 * @param {Object} classElement - Class element
 * @returns {string} HTML content
 */
function generateClassHTML(classElement) {
    const jsdoc = classElement.jsdoc || {};
    const hasMethods = classElement.methods && classElement.methods.length > 0;
    const hasExamples = jsdoc.examples && jsdoc.examples.length > 0;
    
    return `
      <div class="element">
        <div class="element-header">
          <span class="element-name">${classElement.name}</span>
          <span class="element-type">Class</span>
        </div>
        
        <div class="location">Line: ${classElement.location.start.line}</div>
        
        <div class="element-content">
          ${jsdoc.description ? 
            `<div class="description">${jsdoc.description}</div>` : 
            '<div class="no-docs">No description available</div>'
          }
          
          ${hasExamples ? `
            <div class="section">
              <div class="section-header">Examples</div>
              ${jsdoc.examples.map(example => `
                <pre class="code-block">${example}</pre>
              `).join('')}
            </div>
          ` : ''}
          
          ${hasMethods ? `
            <div class="section">
              <div class="section-header">Methods</div>
              ${classElement.methods.map(method => `
                <div class="method">
                  <div class="method-name">${method.kind === 'constructor' ? 'constructor' : method.name}(${method.params.join(', ')})</div>
                  <div class="location">Line: ${method.location ? method.location.start.line : 'unknown'}</div>
                  ${method.comments && method.comments.length > 0 ? 
                    `<div class="description">${method.comments[0].value}</div>` : 
                    '<div class="no-docs">No description available</div>'
                  }
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  module.exports = { generateClassHTML };