const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Interactive Documentation Generator is now active!');

  let panel;
  let statusBarButton;

  // Function to update the visibility of the status bar button
  function updateStatusBarVisibility() {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const language = editor.document.languageId;
      if (language === 'javascript') {
        statusBarButton.show();
      } else {
        statusBarButton.hide();
      }
    } else {
      statusBarButton.hide();
    }
  }

  // Register the "Extract Comments" command
  const extractCommentsCommand = vscode.commands.registerCommand(
    'interactive-doc-generator.extractComments',
    () => {
      const editor = vscode.window.activeTextEditor;

      if (!editor) {
        vscode.window.showErrorMessage('No active editor found!');
        return;
      }

      const language = editor.document.languageId;
      if (language !== 'javascript') {
        vscode.window.showErrorMessage(`File type '${language}' is not supported. Only JavaScript is supported.`);
        return;
      }

      const document = editor.document;
      const comments = extractCommentsFromDocument(document);

      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          'documentationPreview',
          'Documentation Preview',
          vscode.ViewColumn.Beside,
          {}
        );

        // Dispose the panel when closed
        panel.onDidDispose(() => {
          panel = null;
        });
      }

      panel.webview.html = generateWebviewContent(comments);

      // Watch for changes in the active document
      const watcher = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === document) {
          const updatedComments = extractCommentsFromDocument(document);
          panel.webview.html = generateWebviewContent(updatedComments);
        }
      });

      context.subscriptions.push(watcher);
    }
  );

  context.subscriptions.push(extractCommentsCommand);

  // Add a button to the status bar
  statusBarButton = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarButton.text = '$(book) Extract Comments';
  statusBarButton.tooltip = 'Extract comments and preview documentation';
  statusBarButton.command = 'interactive-doc-generator.extractComments';
  context.subscriptions.push(statusBarButton);

  // Update the status bar visibility when the active editor changes
  vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility, null, context.subscriptions);

  // Update the status bar visibility on activation
  updateStatusBarVisibility();
}

/**
 * Extract comments from the given document.
 * @param {vscode.TextDocument} document
 * @returns {string[]} Array of extracted comments
 */
function extractCommentsFromDocument(document) {
  const comments = [];
  const commentRegex = /\/\*\*[\s\S]*?\*\/|\/\/.*$/gm; // Match JSDoc and single-line comments

  const text = document.getText();
  const matches = text.match(commentRegex);

  if (matches) {
    comments.push(...matches);
  }

  return comments;
}

/**
 * Generate HTML content for the WebView panel.
 * @param {string[]} comments
 * @returns {string} HTML content
 */
function generateWebviewContent(comments) {
  const formattedComments = comments
    .map((comment) => `<pre>${comment}</pre>`)
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
          color: black; /* Updated text color for better visibility */
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

function deactivate() {}

module.exports = {
  activate,
  deactivate
};