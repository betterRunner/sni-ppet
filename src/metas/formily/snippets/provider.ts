import { SnippetMeta } from "../../../types/meta";
import { TAG_FORMPROVIDER, TAG_SCHEMAFIELD } from "../constant";

export default {
  matchTag: TAG_FORMPROVIDER,
  tpl: `<${TAG_FORMPROVIDER} form={form}>
  <${TAG_SCHEMAFIELD}>
    
  </${TAG_SCHEMAFIELD}>
</${TAG_FORMPROVIDER}>`,
  commonValues: {},
  itemsMap: {},
  effects: []
} as SnippetMeta;
