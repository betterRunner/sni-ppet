import { Patch, PatchImport, PatchSlot, PatchType, CodeRange } from "../../types/common";
import { insertImportEffectPatches } from "./imports";
import { insertSlotEffectPatches } from "./slots";

export async function insertEffectPatches(code: string, patches: Patch[], codeRangeAdder: (cr: CodeRange) => void) {
  let res = code.slice();
  const importPatches = patches.filter(
    (p) => p.type === PatchType.import
  ) as PatchImport[];
  const slotPatches = patches.filter(
    (p) => p.type === PatchType.slot
  ) as PatchSlot[];
  res = await insertImportEffectPatches(res, importPatches, codeRangeAdder);
  res = await insertSlotEffectPatches(res, slotPatches, codeRangeAdder);
  return res;
}
