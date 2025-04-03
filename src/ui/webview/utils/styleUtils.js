/**
 * Returns all CSS styles used by the webview
 * @returns {string} CSS styles
 */
function getStyles() {
    return `
      body {
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        padding: 20px;
        background-color: #fafafa;
        line-height: 1.6;
        color: #333;
        max-width: 1200px;
        margin: 0 auto;
      }
      .documentation {
        margin: 0 auto;
      }
      .element {
        margin-bottom: 36px;
        padding: 24px;
        border-radius: 8px;
        background-color: #fff;
        box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06);
        border-left: 4px solid #0066cc;
      }
      .element-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 20px;
        border-bottom: 1px solid #eee;
        padding-bottom: 12px;
      }
      .element-name {
        font-weight: 600;
        font-size: 1.5em;
        color: #0066cc;
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
      }
      .element-type {
        color: #717171;
        font-style: italic;
        font-size: 0.9em;
      }
      .element-content {
        margin-top: 16px;
      }
      .description {
        margin-bottom: 24px;
        color: #3c3c3c;
        padding: 0 8px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        font-size: 0.95em;
      }
      thead {
        background-color: #f1f5f9;
      }
      th, td {
        padding: 12px 15px;
        text-align: left;
        border: 1px solid #e2e8f0;
      }
      th {
        font-weight: 600;
        color: #334155;
      }
      .code-block {
        margin: 16px 0;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 4px;
        border-left: 3px solid #0066cc;
        overflow-x: auto;
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        white-space: pre-wrap;
      }
      .section {
        margin: 20px 0;
      }
      .section-header {
        font-weight: 600;
        color: #444;
        margin-bottom: 12px;
        font-size: 1.1em;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }
      .location {
        color: #717171;
        font-size: 0.85em;
        margin-top: 4px;
      }
      .inline-comments {
        margin: 16px 0;
        padding: 0 12px;
      }
      .inline-comment {
        padding: 8px 12px;
        margin: 8px 0;
        background-color: #f8fafc;
        border-left: 2px solid #64748b;
        border-radius: 2px;
        color: #475569;
      }
      .no-docs {
        color: #94a3b8;
        font-style: italic;
        padding: 8px 4px;
      }
      .param-name {
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
        font-weight: 600;
        color: #0369a1;
      }
      .param-type {
        color: #475569;
        font-style: italic;
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
        font-size: 0.9em;
      }
      .return-type {
        color: #475569;
        font-style: italic;
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
        font-size: 0.9em;
      }
      .tab-content {
        margin-top: 20px;
      }
      .method {
        margin: 16px 0;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #0066cc;
      }
      .method-name {
        font-weight: 600;
        color: #0066cc;
        font-family: 'SF Mono', Menlo, Monaco, 'Courier New', monospace;
      }
    `;
  }
  
  module.exports = { getStyles };