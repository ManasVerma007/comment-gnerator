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
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            padding: 20px;
            background-color: #fafafa;
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
  
  module.exports = { generateEmptyContent };