import { CodeRange } from "../../types/common";
import { PatchSlot } from "../../types/meta";
import { getCurrentFileText, insertSnippetByOffset } from "../vscode";
import { searchLastImportOffsetOfCode } from "../code";

/**
 * Insert the `slot` type effect code patches.
 * @param code 
 * @param slotPatches 
 * @param codeRangeAdder a callback to record the `CodeRange` of each patch for further usage
 * @returns the inserted code
 */
export async function insertSlotEffectPatches(
  code: string,
  slotPatches: PatchSlot[],
  codeRangeAdder: (cr: CodeRange) => void
) {
  let res = code.slice();
  for (const patch of slotPatches) {
    // judge if the slot exists by regex
    const { regex, replacement, initStr } = patch;
    const match = res.match(regex);
    if (match) {
      // replace the slot by replace function or the direct replace string
      const startOffset = match.index ?? 0;
      const endOffset = startOffset + (match[0].length ?? 0);
      const newContent =
        typeof replacement === "function" ? replacement(match) : replacement;
      await insertSnippetByOffset(res, newContent, startOffset, endOffset);
      codeRangeAdder({
        offset: startOffset,
        len: newContent.length - (endOffset - startOffset),
      });
      res = getCurrentFileText();
    } else if (initStr) {
      // if need to insert a initializing code
      const offset = searchLastImportOffsetOfCode(res);
      if (offset !== -1) {
        await insertSnippetByOffset(res, initStr, offset);
        codeRangeAdder({ offset: offset, len: initStr.length });
        res = getCurrentFileText();
      }
    }
  }
  return res;
}
