import {
  Command,
  CompletionItemKind,
  CompletionItem,
  Position,
} from "vscode";
import { IntellisenseCommandArguments } from "../types/intellisense";
import { Meta, Patch, Slot, OptionalSlot } from "../types/meta";
import { Snippet, SnippetOption } from "../types/snippet";

function genCommandOptions(
  options: OptionalSlot[]
): SnippetOption[] {
  return options.map((option) => ({
    label: option.name,
    picked: option.picked,
    value: option,
  }));
}

export function genCompletionItem(
  label: string,
  startPosition: Position | undefined,
  snippet?: Snippet,
  options?: OptionalSlot[],
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
    command,
    preselect: true,
    kind: CompletionItemKind.Value,
  };
}

export function genCompletionItemsByMeta(
  meta: Meta,
  startPosition: Position | undefined,
  generalEffects: Patch[]
): CompletionItem[] {
  const { tpl, commonSlots, items = [], effects: metaEffects = [] } = meta;
  return items.map((item) => {
    const {
      name = '',
      slots = [],
      optionalSlots = [],
      effects = [],
    } = item;
    // snippet
    const snippet: Snippet = {
      tpl: tpl,
      slots: [...commonSlots, ...slots],
      effects: [...generalEffects, ...metaEffects, ...effects],
    };

    return genCompletionItem(
      name,
      startPosition,
      snippet,
      optionalSlots,
    );
  });
}
