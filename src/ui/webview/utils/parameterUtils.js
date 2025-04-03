/**
 * Generate HTML table rows for parameters
 * @param {Array} jsdocParams - Parameters from JSDoc
 * @param {Array} codeParams - Parameters from code
 * @returns {string} HTML content
 */
function generateParamsTableRows(jsdocParams, codeParams) {
    if (!jsdocParams || jsdocParams.length === 0) {
      return codeParams.map(param => `
        <tr>
          <td><span class="param-name">${param}</span></td>
          <td><span class="param-type">any</span></td>
          <td><span class="no-docs">No documentation</span></td>
        </tr>
      `).join('');
    }
    
    return codeParams.map(param => {
      const docParam = jsdocParams.find(p => p.name === param);
      if (docParam) {
        return `
          <tr>
            <td><span class="param-name">${param}</span></td>
            <td><span class="param-type">${docParam.type || 'any'}</span></td>
            <td>${docParam.description || ''}</td>
          </tr>
        `;
      } else {
        return `
          <tr>
            <td><span class="param-name">${param}</span></td>
            <td><span class="param-type">any</span></td>
            <td><span class="no-docs">No documentation</span></td>
          </tr>
        `;
      }
    }).join('');
  }
  
  module.exports = { generateParamsTableRows };