import * as vscode from "vscode";
import { Snippet } from "../types/snippet";
import { Meta } from "../types/meta";
import { getPositionByOffset } from "../utils/vscode";
import { genCompletionItem, genCompletionItemsByMeta } from "./utils";

export async function getCompletionItemsByContextText(
  contextText: string,
  metas: Meta[]
): Promise<vscode.CompletionItem[]> {
  const _genCompletionItems = (meta: Meta): vscode.CompletionItem[] => {
    const { items = [], effects = [], matchTag = "", tpl = "" } = meta;

    const reEnter = new RegExp(`(?:^|\\s+)(${matchTag}).$`);
    const match = contextText.match(reEnter);
    if (match) {
      // the non-first completion item

      // matching case `.` is the time to record the position
      const startPosition = getPositionByOffset(0, match[1].length + 1);

      // generate completion items from snippetMeta
      return genCompletionItemsByMeta(meta, startPosition, effects);
    } else {
      // the first completion item

      // the meta whose `items` is empty is non-progressive one
      const isProgressive = !!items.length;
      // non-progressive meta needs to give the snippet parameter to `genCompletionItem` thus generating the snippet directly
      const snippet = !isProgressive
        ? ({
            tpl: tpl || "",
            slots: [],
            effects,
          } as Snippet)
        : undefined;
      // no-progressive snippet start position offset is 0
      const startPosition = getPositionByOffset(0, 1);
      return [genCompletionItem(matchTag, startPosition, snippet)];
    }
  };
  return metas.reduce(
    (prev, meta) => [...prev, ..._genCompletionItems(meta)],
    [] as vscode.CompletionItem[]
  );
}
