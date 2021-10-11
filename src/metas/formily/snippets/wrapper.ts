import { SnippetMeta } from "../../../types/meta";
import { DYNAMIC_TAGS } from "../../constant";
import { TAG_SCHEMAFIELD, TAGS_FIELD_ITEM, TAG_FORMITEM } from "../constant";

export default {
  matchTag: TAG_SCHEMAFIELD,
  tpl: `<${TAG_SCHEMAFIELD}.$(type)
${TAGS_FIELD_ITEM.map((t) => `$(${t})`).join("\n")}
>
</${TAG_SCHEMAFIELD}.$(type)>`,
  commonValues: {
    "x-decorator": TAG_FORMITEM,
    type: "void",
    title: DYNAMIC_TAGS.unset,
    name: DYNAMIC_TAGS.unset,
  },
  itemsMap: {
    FormLayout: {
      detail:
        "https://antd.formilyjs.org/components/form-layout#markup-schema-example",
      documentation: "",
      variables: {
        type: "void",
        "x-component-props": {
          labelCol: 5,
          wrapperCol: 27,
        },
      },
    },
    FormGrid: {
      detail:
        "https://antd.formilyjs.org/components/form-grid#markup-schema-example",
      documentation: "",
      variables: {
        type: "void",
      },
    },
    FormTitle: {
      detail: "Single Title Line",
      documentation: "",
      variables: {
        type: "void",
        "x-decorator-props": {
          colon: false,
          labelWidth: 80,
          wrapperWidth: 1,
        },
        "x-component": DYNAMIC_TAGS.unset,
      },
    },
  },
  effects: [],
} as SnippetMeta;
