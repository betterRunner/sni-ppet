import * as vscode from "vscode";
import { getLineAndCharacterNumFromOffset } from "./utils";

export function getCurrentFileText() {
  return vscode.window.activeTextEditor?.document.getText() ?? "";
}

export function getCurrentProjectPath() {
  return vscode.workspace.workspaceFolders?.[0].uri.path ?? "";
}

export function getCurOffsetByPosition(pos: vscode.Position) {
  const text = getCurrentFileText();
  const lines = text.split("\n");
  const { line = 0, character = 0 } = pos;
  return lines.slice(0, line).join("\n").length + character + 1;
}

export async function insertSnippet(
  start: vscode.Position,
  end: vscode.Position,
  text: string
) {
  return await vscode.window.activeTextEditor?.insertSnippet(
    new vscode.SnippetString(text ?? ""),
    new vscode.Range(start, end)
  );
}

export async function insertSnippetByOffset(
  code: string,
  text: string,
  offsetStart: number,
  offsetEnd?: number
) {
  offsetEnd = offsetEnd || offsetStart;
  const [lineStart, characterStart] = getLineAndCharacterNumFromOffset(
    code,
    offsetStart
  );
  const [lineEnd, characterEnd] = getLineAndCharacterNumFromOffset(
    code,
    offsetEnd
  );
  if (
    lineStart !== -1 &&
    characterStart !== -1 &&
    lineEnd !== -1 &&
    characterEnd !== -1
  ) {
    const start = new vscode.Position(lineStart, characterStart);
    const end = new vscode.Position(lineEnd, characterEnd);
    return await insertSnippet(start, end, text);
  }
  return false;
}

export function getActivePosition() {
  return vscode.window.activeTextEditor?.selection.active;
}

export function getPositionByOffset(lineOffset: number, charOffset: number) {
  const curPosition = vscode.window.activeTextEditor?.selection.active;
  if (curPosition) {
    return new vscode.Position(
      curPosition?.line - lineOffset,
      curPosition?.character - charOffset
    );
  }
}

const channel = vscode.window.createOutputChannel('sni-ppet');
export const outputChannel = {
  info: (message: string) => {
    console.log(message);
    channel.appendLine(`[INFO] ${message}`);
  },
  error: (message: string) => {
    console.error(message);
    channel.appendLine(`[ERROR]: ${message}`);
  },
};
