import * as vscode from "vscode";
import { IntellisenseMeta } from "../types/meta";
import { getPositionByOffset } from "../utils/vscode";
import { Snippet } from "../types/snippet";
import { genCompletionItem, genCompletionItemsByMeta } from "./utils";

export async function getCompletionItemsByContextText(
  contextText: string,
  metas: IntellisenseMeta[],
): Promise<vscode.CompletionItem[]> {
  const _genCompletionItems = (
    meta: IntellisenseMeta
  ): vscode.CompletionItem[] => {
    const { snippetMetas = [], genSnippetFn, effects = [] } = meta;

    // only meta with non-empty `itemsMap` need progressive command
    const progressiveMatchTags = Array.from(
      new Set(
        snippetMetas.reduce(
          (prev, cur) =>
            Object.keys(cur.itemsMap).length ? [...prev, cur.matchTag] : prev,
          [] as string[]
        )
      )
    );
    const reEnter = new RegExp(
      `(?:^|\\s+)(${progressiveMatchTags.join("|")}).$`
    );
    const match = contextText.match(reEnter);
    if (match) {
      // matching case `.` is the time to record the position
      const startPosition = getPositionByOffset(0, match[1].length + 1);

      // generate completion items from snippetMeta
      return snippetMetas.reduce(
        (prev, snippetMeta) => [
          ...prev,
          ...genCompletionItemsByMeta(
            snippetMeta,
            startPosition,
            genSnippetFn,
            effects
          ),
        ],
        [] as vscode.CompletionItem[]
      );
    }

    // default completion item
    const matchTags = Array.from(
      new Set(
        snippetMetas.reduce(
          (prev, cur) => [...prev, cur.matchTag],
          [] as string[]
        )
      )
    );
    return matchTags.map((t) => {
      const isProgressive = progressiveMatchTags.includes(t);
      let snippet;
      if (!isProgressive) {
        // non-progressive meta needs to give the snippet parameter to `genCompletionItem` thus generating the snippet directly
        const snippetMeta = snippetMetas.find((meta) => meta.matchTag === t);
        snippet = {
          tpl: snippetMeta?.tpl || "",
          variables: {},
          genSnippetFn: (_) => _,
          effectPatches: meta.effects,
        } as Snippet;
      }
      const startPosition = getPositionByOffset(0, 1);
      const item = genCompletionItem(t, startPosition, snippet);
      return item;
    });
  };
  return metas.reduce(
    (prev, meta) => [...prev, ..._genCompletionItems(meta)],
    [] as vscode.CompletionItem[]
  );
}
