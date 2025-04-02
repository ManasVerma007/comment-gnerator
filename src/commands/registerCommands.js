const { extractCommentsCommand } = require('./extractComments');

function registerCommands(context) {
  context.subscriptions.push(extractCommentsCommand(context));
}

module.exports = { registerCommands };