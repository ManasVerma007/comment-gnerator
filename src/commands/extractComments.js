const vscode = require('vscode');
const { extractCommentsFromAST } = require('../parser/commentParser');
const { generateWebviewContent } = require('../ui/webview');
const { setupFileWatcher } = require('../utils/fileWatcher');

let panel = null;
let activeWatcher = null;

function extractCommentsCommand(context) {
  return vscode.commands.registerCommand(
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
      const comments = extractCommentsFromAST(document.getText());
      console.log("hi there I got it to here boo")

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
          
          // Clean up the watcher when panel is closed
          if (activeWatcher) {
            activeWatcher.dispose();
            activeWatcher = null;
          }
        });
      }

      panel.webview.html = generateWebviewContent(comments);
      console.log("YEP boo i was here as well")

      // Clean up any existing watcher before creating a new one
      if (activeWatcher) {
        activeWatcher.dispose();
      }

      // Set up a file watcher for live updates
      activeWatcher = setupFileWatcher(document, (event) => {
        const updatedComments = extractCommentsFromAST(event.document.getText());
        if (panel) {
          panel.webview.html = generateWebviewContent(updatedComments);
        }
      });
      
      // Make sure the watcher gets disposed when the extension is deactivated
      context.subscriptions.push(activeWatcher);
    }
  );
}

module.exports = { extractCommentsCommand };