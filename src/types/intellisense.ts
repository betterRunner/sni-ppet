import type { Position, QuickPickItem } from "vscode";
import type { Snippet } from "./snippet";

export interface IntellisenseCommandArguments {
  snippet: Snippet;
  startPosition: Position;
  options?: QuickPickItem[]; // the options that provides more details of finally snippet code
}
