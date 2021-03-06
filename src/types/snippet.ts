import { QuickPickItem } from "vscode";
import { MetaItem } from "../metas/template/types/meta";

export interface Snippet extends Omit<MetaItem, "optionSlots"> {
  tpl: string;
}

export interface SnippetOption extends QuickPickItem {
  value: any;
}