import type { Position } from "vscode";
import type { Snippet, SnippetOption } from "./snippet";

export interface IntellisenseCommandArguments {
  snippet: Snippet;
  startPosition: Position;
  options?: SnippetOption[]; // the options that provides more details of finally snippet code
}
