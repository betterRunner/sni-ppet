import { GenSnippetFn, Patch } from "./common";

export interface Snippet {
  tpl: string;
  variables: { [key: string]: any };
  genSnippetFn: GenSnippetFn;  // genSnippetFn(tpl, variables) -> snippet
  effectPatches?: Patch[];
}
