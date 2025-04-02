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
  const hasStructuredElements = codeElements.length > 0 && codeElements[0].type;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Documentation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #ffffff;
          line-height: 1.5;
          color: #333;
        }
        .documentation {
          max-width: 900px;
          margin: 0 auto;
        }
        .element {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 6px;
          background-color: #f8f8f8;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .element-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .element-name {
          font-weight: bold;
          font-size: 1.2em;
          color: #0066cc;
        }
        .element-type {
          color: #666;
          font-style: italic;
        }
        .params {
          margin-top: 15px;
        }
        .param {
          margin-bottom: 8px;
          padding-left: 15px;
        }
        .param-name {
          font-family: monospace;
          font-weight: bold;
        }
        .param-type {
          color: #666;
          font-style: italic;
        }
        .returns {
          margin-top: 15px;
        }
        .description {
          margin-top: 10px;
        }
        .methods {
          margin-top: 20px;
        }
        .method {
          margin: 10px 0;
          padding: 10px;
          border-left: 3px solid #0066cc;
          background-color: #f0f0f0;
        }
        .examples {
          margin-top: 15px;
          font-family: monospace;
          white-space: pre-wrap;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 4px;
        }
        .raw-comments {
          white-space: pre-wrap;
          font-family: monospace;
          background-color: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          color: #333;
        }
        .location {
          font-size: 0.8em;
          color: #666;
        }
        .no-docs {
          color: #999;
          font-style: italic;
        }
      </style>
    </head>
    <body>
      <div class="documentation">
        <h1>Code Documentation</h1>
        ${hasStructuredElements ? generateStructuredContent(codeElements) : generateRawCommentsContent(codeElements)}
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate content for structured code elements
 * @param {Array} codeElements - Structured code elements
 * @returns {string} HTML content
 */
function generateStructuredContent(codeElements) {
  return codeElements.map(element => {
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
        return '';
    }
  }).join('');
}

/**
 * Generate HTML for a function element
 * @param {Object} func - Function element
 * @returns {string} HTML content
 */
function generateFunctionHTML(func) {
  const jsdoc = func.jsdoc || {};
  
  return `
    <div class="element">
      <div class="element-header">
        <span class="element-name">${func.name}(${func.params.join(', ')})</span>
        <span class="element-type">Function</span>
      </div>
      
      <div class="location">Line: ${func.location.start.line}</div>
      
      ${jsdoc.description ? `<div class="description">${jsdoc.description}</div>` : '<div class="no-docs">No description available</div>'}
      
      ${func.params.length > 0 ? `
        <div class="params">
          <strong>Parameters:</strong>
          ${generateParamsHTML(jsdoc.params, func.params)}
        </div>
      ` : ''}
      
      ${jsdoc.returns ? `
        <div class="returns">
          <strong>Returns:</strong> 
          <span class="param-type">${jsdoc.returns.type}</span> 
          ${jsdoc.returns.description}
        </div>
      ` : ''}
      
      ${jsdoc.examples && jsdoc.examples.length > 0 ? `
        <div class="examples">
          <strong>Examples:</strong>
          <pre>${jsdoc.examples.join('\n\n')}</pre>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Generate HTML for a variable element
 * @param {Object} variable - Variable element
 * @returns {string} HTML content
 */
function generateVariableHTML(variable) {
  const jsdoc = variable.jsdoc || {};
  
  return `
    <div class="element">
      <div class="element-header">
        <span class="element-name">${variable.name}${variable.isFunction ? '()' : ''}</span>
        <span class="element-type">${variable.kind} ${variable.isFunction ? 'Function' : 'Variable'}</span>
      </div>
      
      <div class="location">Line: ${variable.location.start.line}</div>
      
      ${jsdoc.description ? `<div class="description">${jsdoc.description}</div>` : '<div class="no-docs">No description available</div>'}
      
      ${variable.isFunction && variable.params && variable.params.length > 0 ? `
        <div class="params">
          <strong>Parameters:</strong>
          ${generateParamsHTML(jsdoc.params, variable.params)}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Generate HTML for a class element
 * @param {Object} classElement - Class element
 * @returns {string} HTML content
 */
function generateClassHTML(classElement) {
  const jsdoc = classElement.jsdoc || {};
  
  return `
    <div class="element">
      <div class="element-header">
        <span class="element-name">${classElement.name}</span>
        <span class="element-type">Class</span>
      </div>
      
      <div class="location">Line: ${classElement.location.start.line}</div>
      
      ${jsdoc.description ? `<div class="description">${jsdoc.description}</div>` : '<div class="no-docs">No description available</div>'}
      
      ${classElement.methods.length > 0 ? `
        <div class="methods">
          <strong>Methods:</strong>
          ${classElement.methods.map(method => `
            <div class="method">
              <div class="element-name">${method.kind === 'constructor' ? 'constructor' : method.name}(${method.params.join(', ')})</div>
              ${method.comments.length > 0 ? `<div class="description">${method.comments[0].value}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

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
      
      ${exportElement.comments.length > 0 ? 
        `<div class="description">${exportElement.comments[0].value}</div>` : 
        '<div class="no-docs">No description available</div>'}
    </div>
  `;
}

/**
 * Generate HTML for parameters
 * @param {Array} jsdocParams - Parameters from JSDoc
 * @param {Array} codeParams - Parameters from code
 * @returns {string} HTML content
 */
function generateParamsHTML(jsdocParams, codeParams) {
  if (!jsdocParams || jsdocParams.length === 0) {
    return codeParams.map(param => `
      <div class="param">
        <span class="param-name">${param}</span>
        <span class="no-docs">No documentation</span>
      </div>
    `).join('');
  }
  
  return codeParams.map(param => {
    const docParam = jsdocParams.find(p => p.name === param);
    if (docParam) {
      return `
        <div class="param">
          <span class="param-name">${param}</span>
          ${docParam.type ? `<span class="param-type">{${docParam.type}}</span>` : ''}
          ${docParam.description ? docParam.description : ''}
        </div>
      `;
    } else {
      return `
        <div class="param">
          <span class="param-name">${param}</span>
          <span class="no-docs">No documentation</span>
        </div>
      `;
    }
  }).join('');
}

/**
 * Generate content for raw comments
 * @param {Array} comments - Raw comments
 * @returns {string} HTML content
 */
function generateRawCommentsContent(comments) {
  if (!comments || comments.length === 0) {
    return '<p>No comments found.</p>';
  }
  
  return comments.map(comment => `
    <div class="element">
      <pre class="raw-comments">${comment.value || comment}</pre>
    </div>
  `).join('');
}

/**
 * Generate empty content
 * @returns {string} HTML content
 */
function generateEmptyContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Code Documentation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background-color: #ffffff;
        }
      </style>
    </head>
    <body>
      <h1>Code Documentation</h1>
      <p>No code elements or comments found.</p>
    </body>
    </html>
  `;
}

module.exports = { generateWebviewContent };