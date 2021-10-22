import { QuickPickItem } from "vscode";
import { MetaItem } from "../metas/template/metas/types/meta";

export interface Snippet extends Omit<MetaItem, "name" | "optionSlots"> {
  tpl: string;
}

export interface SnippetOption extends QuickPickItem {
  value: any;
}