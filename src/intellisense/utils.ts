import {
  Command,
  QuickPickItem,
  CompletionItemKind,
  CompletionItem,
  Position,
} from "vscode";
import { SnippetMeta, MetaOption } from "../types/meta";
import { IntellisenseCommandArguments } from "../types/intellisense";
import { Snippet } from "../types/snippet";
import { GenSnippetFn, Patch } from "../types/common";
import { fillMetaVariables } from "../utils/meta";

function genCommandOptions(
  options: Record<string, MetaOption>
): QuickPickItem[] {
  const keys = Object.keys(options);
  return keys.map((key) => ({
    label: key,
    picked: options[key]?.picked,
    value: options[key]?.value,
  }));
}

export function genCompletionItem(
  label: string,
  startPosition: Position | undefined,
  snippet?: Snippet,
  options?: Record<string, MetaOption> | undefined,
  detail: string = "",
  documentation: string = ""
): CompletionItem {
  // (1) if `snippet` is null, does not create `command`
  // (2) if `snippet` is not null and `options` is null, create `insertSnippet` command
  // (3) if `snippet` and `options` are not null, create `showQuickPick` command (which will later call `insertSnippet` command)
  const command: Command | undefined = snippet
    ? {
        title: "options",
        command: options ? "showQuickPick" : "insertSnippet",
        arguments: [
          {
            options: options && genCommandOptions(options),
            snippet,
            startPosition
          } as IntellisenseCommandArguments,
        ],
      }
    : undefined;

  return {
    label,
    detail,
    documentation,
    command,
    preselect: true,
    kind: CompletionItemKind.Value,
  };
}

export function genCompletionItemsByMeta(
  meta: SnippetMeta,
  startPosition: Position | undefined,
  genSnippetFn: GenSnippetFn,
  generalEffects: Patch[]
): CompletionItem[] {
  const { tpl, commonValues, itemsMap = {}, effects: metaEffects = [] } = meta;
  const keys = Object.keys(itemsMap);
  return keys.map((key) => {
    const {
      detail,
      documentation,
      variables,
      options,
      effects = [],
    } = itemsMap[key];
    // snippet
    const snippet: Snippet = {
      tpl: tpl,
      variables: fillMetaVariables(commonValues, variables),
      genSnippetFn,
      effectPatches: [...generalEffects, ...metaEffects, ...effects],
    };

    return genCompletionItem(
      key,
      startPosition,
      snippet,
      options,
      detail,
      documentation
    );
  });
}
