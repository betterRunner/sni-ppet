import * as vscode from "vscode";

import {
  insertSnippet,
  getActivePosition,
  getCurrentFileText,
  getCurOffsetByPosition,
  outputChannel,
} from "./utils/vscode";
import { getCompletionItemsByContextText } from "./intellisense";
import { cloneMetaTemplatesFromRepo, readMetasFromConfig } from "./metas";
import { IntellisenseCommandArguments } from "./types/intellisense";
import { Meta, Slot } from "./types/meta";
import { Snippet } from "./types/snippet";
import { CodeRange } from "./types/common";
import { insertEffectPatches } from "./utils/effects";
import {
  getLineAndCharacterNumFromOffset,
  isObject,
  valToCodeStr,
} from "./utils/utils";

/**
 * Here is how fly-snippet runs:
 * 1. The snippet codes are eventually generated by a series of intellisense operations.
 *
 * 2. There are two types of intellisense: search-intellisense & options-intellisense.
 *    The former is for searching the snippet like: 'a.b.c.xxx' you need and the later is for selecting or unselecting the options which would add more details to the final snippet.
 *
 * 3. So the complete intellisense process is:
 *    search-intellisense1 -> search-intellisense2 -> ... -> search-intellisenseN -> options-intellisense(if has) -> snippet codes
 */

function correctOffsetByCodeRanges(offset: number, codeRanges: CodeRange[]) {
  let newOffset = offset;
  for (const cr of codeRanges) {
    const { offset: codeOffset = 0, len = 0 } = cr;
    if (codeOffset + len < offset) {
      newOffset += len;
    }
  }
  return newOffset;
}

function genSnippetCode(snippet: Snippet) {
  const { tpl = "", slots = [] } = snippet;
  let res = tpl.slice();

  // merge slots that replace the same object
  const objectSlots = slots.filter((slot) => isObject(slot.replacement));
  const mergedObjectSlotsMap: Record<string, Slot> = {};
  for (const os of objectSlots) {
    const { name, replacement } = os;
    if (mergedObjectSlotsMap[name]) {
      const original = mergedObjectSlotsMap[name];
      try {
        mergedObjectSlotsMap[name] = {
          ...original,
          replacement: Array.isArray(original.replacement)
            ? [...original.replacement, ...replacement]
            : { ...original.replacement, ...replacement },
        };
      } catch {
        vscode.window.showWarningMessage(
          `Generating snippet: the type of slot (${name}) is wrong!`
        );
      }
    }
    mergedObjectSlotsMap[name] = mergedObjectSlotsMap[name] || os;
  }
  const mergedSlots: Slot[] = [
    ...slots.filter((slot) => !objectSlots.includes(slot)),
    ...Object.values(mergedObjectSlotsMap),
  ];

  // replace the slots of tpl to the `replacement` or the result of `replacementFn`
  for (const slot of mergedSlots) {
    const { name, replacement, replacementFn } = slot;
    const searchTag = `$(${name})`;
    const replacementStr = valToCodeStr(replacement);
    const valStr = replacementFn
      ? replacementFn({ slotName: name, replacementStr })
      : replacementStr;
    res = res.replace(searchTag, valStr);
  }
  return res;
}

async function insertSnippetCode(
  snippet: Snippet,
  start: vscode.Position | undefined,
  end: vscode.Position | undefined
) {
  if (!start || !end) {
    return;
  }

  // 1. insert snippet
  const target = genSnippetCode(snippet);
  await insertSnippet(start, end, target);

  // 2. record the target inserted position
  const targetPos = getActivePosition();
  const targetOffset = getCurOffsetByPosition(targetPos as vscode.Position); // trans the position to offset

  // 3. inert effects snippets
  // store all `CodeRange` after effects insertion, use them to correct `targetOffset`
  const effectCodeRanges: CodeRange[] = [];
  const codeRangeAdder = (cr: CodeRange) => effectCodeRanges.push(cr);
  let codeStr = getCurrentFileText();
  await insertEffectPatches(codeStr, snippet.effects || [], codeRangeAdder);

  // 4. correct the target inserted position by `effectCodeRanges`
  const newTargetOffset = correctOffsetByCodeRanges(
    targetOffset,
    effectCodeRanges
  );

  // 5. change current cursor to new inserted position and focus on it
  codeStr = getCurrentFileText();
  const [line, character] = getLineAndCharacterNumFromOffset(
    codeStr,
    newTargetOffset
  );
  const cur = new vscode.Position(line, character);
  const editor = vscode.window.activeTextEditor || {};
  (editor as any).selection = new vscode.Selection(cur, cur); // change the cursor
  (editor as any).revealRange(new vscode.Range(cur, cur)); // make editor scroll to the cursor if outside the screen

  return [target];
}

async function registerCompletionItemProviderByMetas() {
  const metas: Meta[] = await readMetasFromConfig();
  if (metas.length) {
    return vscode.languages.registerCompletionItemProvider(
      ["javascript", "typescript", "javascriptreact", "typescriptreact"],
      {
        provideCompletionItems(document) {
          // get the text from beginning to current cursor
          const start = new vscode.Position(0, 0);
          const end = vscode.window.activeTextEditor?.selection.active;
          const range = new vscode.Range(start, end ?? start);
          const text = document.getText(range);

          return getCompletionItemsByContextText(text, metas);
        },
      },
      "."
    );
  }
  return null;
}

async function run(context: vscode.ExtensionContext) {
  const commands = [
    // this command will execute insertSnippet operation
    vscode.commands.registerCommand(
      "insertSnippet",
      ({ snippet, startPosition }: IntellisenseCommandArguments) => {
        const endPosition = getActivePosition();
        insertSnippetCode(snippet, startPosition, endPosition);
      }
    ),

    // this command will create a options-intellisense
    vscode.commands.registerCommand(
      "showQuickPick",
      async ({
        options = [],
        snippet,
        startPosition,
      }: IntellisenseCommandArguments) => {
        const optionsRes =
          (await vscode.window.showQuickPick(
            options as vscode.QuickPickItem[],
            {
              canPickMany: true,
            }
          )) || [];
        // update variables by options picked items
        const selectedLabels = optionsRes.map((ele) => ele.label);
        const selectedSlots = options
          .filter((ele) => selectedLabels.includes(ele.label))
          .map((ele) => ele.value);
        const newSnippet: Snippet = {
          ...snippet,
          slots: [...snippet.slots, ...selectedSlots],
        };
        const endPosition = getActivePosition();
        insertSnippetCode(newSnippet, startPosition, endPosition);
      }
    ),
  ];

  // this provider will create a search-intellisense
  const disposable = registerCompletionItemProviderByMetas();
  disposable ?? commands.push(disposable);

  commands.forEach((disposable) => {
    context.subscriptions.push(disposable);
  });
}

export async function registerSnippetProviderAndCommands(
  context: vscode.ExtensionContext
) {
  const disposable = vscode.commands.registerCommand(
    "Sni-ppet.initialize",
    async () => {
      try {
        const cloneSucc = await cloneMetaTemplatesFromRepo();
        if (cloneSucc) {
          const disposable = registerCompletionItemProviderByMetas();
          disposable ?? context.subscriptions.push(disposable); 
        }
      } catch (err) {
        outputChannel.error(
          `error occurs while cloning metas template: ${err}`
        );
      }
    }
  );
  context.subscriptions.push(disposable);

  run(context);
}
