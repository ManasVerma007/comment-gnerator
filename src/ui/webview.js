function generateWebviewContent(comments) {
  const formattedComments = comments
    .map((comment) => `<pre>${comment.value || comment}</pre>`)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Documentation Preview</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 10px;
          background-color: #ffffff;
        }
        pre {
          background: #f4f4f4;
          padding: 10px;
          border-radius: 4px;
          color: black;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <h1>Extracted Comments</h1>
      ${formattedComments || '<p>No comments found.</p>'}
    </body>
    </html>
  `;
}

module.exports = { generateWebviewContent };