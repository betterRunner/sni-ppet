export type GenSnippetFn = (tpl: string, variables: any) => string;

export enum PatchType {
  import = "import",
  slot = "slot",
}

export interface PatchImport {
  type: PatchType;
  content: string;
  source: string;
  isLocal: boolean; // local import or remote import
  isDefault: boolean;
}

type ReplacementItem = string; // replace value of `String.prototype.replace`
type ReplacementFn = (slots: string[]) => string; // replace function of `String.prototype.replace`
type Replacement = ReplacementItem | ReplacementFn;

export interface PatchSlot {
  type: PatchType;
  regex: RegExp; // the regex to find the slot
  replacement: Replacement;
  initStr?: string; // if slot doesn't exist, need to initialize a string or not.
}

export type Patch = PatchImport | PatchSlot;

export interface CodeRange {
  offset: number;
  len: number;
}
