import { IntellisenseMeta, SnippetMeta } from "../../types/meta";
import { fillMetaVariables } from "../utils";

import {
  genSnippetCode,
  genFormilyGeneralEffects,
  genFormilyComponentEffects,
} from "./utils";
import snippetMetas from "./snippets";

// post handler
function postHandler(metas: SnippetMeta[]): SnippetMeta[] {
  return metas.map((meta) => {
    const itemsMap: Record<string, any> = {};
    for (const entry of Object.entries(meta.itemsMap)) {
      const [key, val] = entry;
      itemsMap[key] = {
        ...val,
        variables: fillMetaVariables(val.variables, {
          "x-component": key,
          title: key,
        }),
        effects: genFormilyComponentEffects([key]),
      };
    }
    return {
      ...meta,
      itemsMap,
    };
  });
}

export default {
  snippetMetas: postHandler(snippetMetas),
  genSnippetFn: genSnippetCode,
  effects: [...genFormilyGeneralEffects()],
} as IntellisenseMeta;
