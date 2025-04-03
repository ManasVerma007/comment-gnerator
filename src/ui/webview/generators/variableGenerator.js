const { generateParamsTableRows } = require('../utils/parameterUtils');

/**
 * Generate HTML for a variable element
 * @param {Object} variable - Variable element
 * @returns {string} HTML content
 */
function generateVariableHTML(variable) {
  const jsdoc = variable.jsdoc || {};
  const hasParams = variable.isFunction && variable.params && variable.params.length > 0;
  // Fix the hasReturns check - it should check if returns exists AND has a value
  const hasReturns = jsdoc.returns != null && typeof jsdoc.returns === 'object';
  // Fix the hasExamples check - ensure examples exists and is an array
  const hasExamples = Array.isArray(jsdoc.examples) && jsdoc.examples.length > 0;
  
  console.log("Generating HTML for variable:", variable);
  console.log("JSDoc for variable:", jsdoc);
  console.log("Has params:", hasParams);
  console.log("Has returns:", hasReturns);
  console.log("Has examples:", hasExamples);
    
  return `
    <div class="element">
      <div class="element-header">
        <span class="element-name">${variable.name}${variable.isFunction ? '()' : ''}</span>
        <span class="element-type">${variable.kind} ${variable.isFunction ? 'Function' : 'Variable'}</span>
      </div>
      
      <div class="location">Line: ${variable.location.start.line}</div>
      
      <div class="element-content">
        ${jsdoc.description ? 
          `<div class="description">${jsdoc.description}</div>` : 
          '<div class="no-docs">No description available</div>'
        }
        
        ${hasParams || hasReturns ? `
          <div class="section">
            <div class="section-header">Signature</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${hasParams ? generateParamsTableRows(jsdoc.params, variable.params) : ''}
                ${hasReturns ? `
                  <tr>
                    <td><strong>Returns</strong></td>
                    <td><span class="return-type">${jsdoc.returns && jsdoc.returns.type || 'any'}</span></td>
                    <td>${jsdoc.returns && jsdoc.returns.description || ''}</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        ` : ''}
        
        ${hasExamples ? `
          <div class="section">
            <div class="section-header">Examples</div>
            ${jsdoc.examples.map(example => `
              <pre class="code-block">${example}</pre>
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

module.exports = { generateVariableHTML };