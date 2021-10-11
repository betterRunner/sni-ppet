import { RE_IMPORT_REVERSED } from "./constant";
import { reverseStr } from "./utils";

export function searchLastImportOffsetOfCode(code: string) {
  const rRe = new RegExp(RE_IMPORT_REVERSED.replace("$0", "[^\"']+"));
  const rRes = reverseStr(code).replace(/\n/g, ' ');
  const match = rRes.match(rRe);
  if (match) {
    const offset = code.length - (match.index ?? 0);
    return offset;
  }
  return -1;
}
