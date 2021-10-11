import * as vscode from "vscode";

import { registerSnippetProviderAndCommands } from "./snippet";

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  registerSnippetProviderAndCommands(context);
}

// this method is called when your extension is deactivated
export function deactivate() {}
