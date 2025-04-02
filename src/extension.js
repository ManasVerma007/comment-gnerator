const vscode = require('vscode');
const { registerCommands } = require('./commands/registerCommands');
const { createStatusBarButton } = require('./ui/statusBar');

function activate(context) {
  console.log('Interactive Documentation Generator is now active!');

  // Register commands
  registerCommands(context);

  // Create and manage the status bar button
  const statusBarButton = createStatusBarButton(context);

  // Update the status bar visibility
  function updateStatusBarVisibility() {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'javascript') {
      statusBarButton.show();
    } else {
      statusBarButton.hide();
    }
  }

  vscode.window.onDidChangeActiveTextEditor(updateStatusBarVisibility, null, context.subscriptions);
  updateStatusBarVisibility();
}

function deactivate() {}

module.exports = { activate, deactivate };