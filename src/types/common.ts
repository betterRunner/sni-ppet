export type GenSnippetFn = (tpl: string, variables: any) => string;

export interface CodeRange {
  offset: number;
  len: number;
}
