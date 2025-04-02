const vscode = require('vscode');

/**
 * Sets up a file watcher for the given document that triggers the callback when changes occur
 * @param {vscode.TextDocument} document - The document to watch for changes
 * @param {Function} callback - Function to call when document changes
 * @returns {vscode.Disposable} - Disposable for the event listener
 */
function setupFileWatcher(document, callback) {
  return vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document === document) {
      callback(event);
    }
  });
}

module.exports = { setupFileWatcher };