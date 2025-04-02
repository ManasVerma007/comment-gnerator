const vscode = require('vscode');

function createStatusBarButton(context) {
  const statusBarButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarButton.text = '$(book) Extract Comments';
  statusBarButton.tooltip = 'Extract comments and preview documentation';
  statusBarButton.command = 'interactive-doc-generator.extractComments';
  context.subscriptions.push(statusBarButton);

  return statusBarButton;
}

module.exports = { createStatusBarButton };