import { Position } from "vscode";
import { CodeRange } from "../../types/common";
import { PatchImport } from "../../types/meta";
import { RE_IMPORT } from "../constant";
import {
  getLineAndCharacterNumFromOffset,
  getItemInsertOffsetInScope,
} from "../utils";
import {
  insertSnippet,
  getCurrentFileText,
  insertSnippetByOffset,
} from "../vscode";
import { searchLastImportOffsetOfCode } from "../code";

async function insertExistedImport(
  content: string,
  item: string,
  raw: string,
  basic: number,
  codeRangeAdder: (cr: CodeRange) => void
) {
  const [offset, isLastComma] = getItemInsertOffsetInScope(content, item);
  if (offset > -1) {
    const text = isLastComma ? item : `,${item}`;
    const [line, character] = getLineAndCharacterNumFromOffset(
      raw,
      basic + offset
    );
    if (line !== -1 && character !== -1) {
      const start = new Position(line, character);
      const end = start;
      await insertSnippet(start, end, text);
      codeRangeAdder({ offset: basic + offset, len: text.length });
    }
  }
  return getCurrentFileText();
}

/**
 * Insert the `import` type effect code patches.
 * @param code 
 * @param importPatches 
 * @param codeRangeAdder a callback to record the `CodeRange` of each patch for further usage
 * @returns the inserted code 
 */
export async function insertImportEffectPatches(
  code: string,
  importPatches: PatchImport[],
  codeRangeAdder: (cr: CodeRange) => void
) {
  let res = code.slice();
  for (const patch of importPatches) {
    const { content, source, isDefault } = patch;
    // judge if the `import source` is already existed
    const re = new RegExp(RE_IMPORT.replace("$0", source));
    const match = res.replace(/\n/g, " ").match(re);
    if (!isDefault && match) {
      // add the content to the tail of the content block of this `import source`
      const index = match[0].indexOf(match[1]);
      res = await insertExistedImport(
        match[1] || "",
        content,
        res,
        (match.index ?? 0) + index,
        codeRangeAdder
      );
    } else {
      // add a new import line to the tail of all import lines
      const offset = searchLastImportOffsetOfCode(res);
      if (offset !== -1) {
        const newContent = `\nimport ${
          isDefault ? content : `{${content}}`
        } from '${source}';`;
        await insertSnippetByOffset(res, newContent, offset);
        codeRangeAdder({ offset: offset, len: newContent.length });
        res = getCurrentFileText();
      }
    }
  }
  return res;
}
