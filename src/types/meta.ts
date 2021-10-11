import { GenSnippetFn, Patch } from './common';

export interface MetaOption {
  picked: boolean;
  value: any;
}

interface Meta {
  detail: string;
  documentation: string;
  variables: {
    [key: string]: any;
  };
  options?: Record<string, MetaOption>;
  effects?: Patch[];
}

export interface SnippetMeta {
  matchTag: string;
  tpl: string;
  commonValues: { [key: string]: any };
  itemsMap: Record<string, Meta>;
  effects?: Patch[];
}

export interface IntellisenseMeta {
  snippetMetas: SnippetMeta[];
  genSnippetFn: GenSnippetFn; // genSnippetFn(tpl, variables) -> snippet
  effects?: Patch[];
}
