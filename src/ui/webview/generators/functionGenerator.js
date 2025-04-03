const { generateParamsTableRows } = require("../utils/parameterUtils");

/**
 * Generate HTML for a function element
 * @param {Object} func - Function element
 * @returns {string} HTML content
 */
function generateFunctionHTML(func) {
  const jsdoc = func.jsdoc || {};
  const hasParams = func.params && func.params.length > 0;
  // Fix for hasReturns - ensure jsdoc.returns exists
  const hasReturns = jsdoc.returns != null;
  // Fix for hasExamples - ensure jsdoc.examples exists and is an array
  const hasExamples =
    Array.isArray(jsdoc.examples) && jsdoc.examples.length > 0;
  const inlineComments = func.inlineComments || [];
  const localVars = func.localVariables || [];
  const hasLocalVars = localVars.length > 0;

  return `
    <div class="element">
      <div class="element-header">
        <span class="element-name">${func.name}(${func.params.join(
    ", "
  )})</span>
        <span class="element-type">Function</span>
      </div>
      
      <div class="location">Line: ${func.location.start.line}</div>
      
      <div class="element-content">
        ${
          jsdoc.description
            ? `<div class="description">${jsdoc.description}</div>`
            : '<div class="no-docs">No description available</div>'
        }
        
        ${
          hasParams || hasReturns
            ? `
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
                ${
                  hasParams
                    ? generateParamsTableRows(jsdoc.params, func.params)
                    : ""
                }
                ${
                  hasReturns
                    ? `
                  <tr>
                    <td><strong>Returns</strong></td>
                    <td><span class="return-type">${
                      (jsdoc.returns && jsdoc.returns.type) || "any"
                    }</span></td>
                    <td>${
                      (jsdoc.returns && jsdoc.returns.description) || ""
                    }</td>
                  </tr>
                `
                    : ""
                }
              </tbody>
            </table>
          </div>
        `
            : ""
        }
        
        ${
          hasExamples
            ? `
          <div class="section">
            <div class="section-header">Examples</div>
            ${jsdoc.examples
              .map(
                (example) => `
              <pre class="code-block">${example}</pre>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }
        
        ${
          inlineComments.length > 0
            ? `
          <div class="section">
            <div class="section-header">Implementation Notes</div>
            <div class="inline-comments">
              ${inlineComments
                .map(
                  (comment) => `
                <div class="inline-comment">
                  <div>${comment.value}</div>
                  <div class="location">Line: ${comment.loc.start.line}</div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          hasLocalVars
            ? `
          <div class="section">
            <div class="section-header">Local Variables</div>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Kind</th>
                  <th>Line</th>
                </tr>
              </thead>
              <tbody>
                ${localVars
                  .map(
                    (variable) => `
                  <tr>
                    <td><span class="param-name">${variable.name}</span></td>
                    <td>${variable.kind}</td>
                    <td>${variable.location.start.line}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

module.exports = { generateFunctionHTML };