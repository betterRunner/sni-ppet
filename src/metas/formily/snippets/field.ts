import { SnippetMeta } from "../../../types/meta";
import { DYNAMIC_TAGS } from "../../constant";
import { TAG_SCHEMAFIELD, TAGS_FIELD_ITEM, TAG_FORMITEM } from "../constant";

export default {
  matchTag: TAG_SCHEMAFIELD,
  tpl: `<${TAG_SCHEMAFIELD}.$(type)
${TAGS_FIELD_ITEM.map((t) => `$(${t})`).join('\n')}
/>`,
  commonValues: {
    "x-decorator": TAG_FORMITEM,
    name: DYNAMIC_TAGS.random,
  },
  itemsMap: {
    Input: {
      detail:
        "https://antd.formilyjs.org/components/input#markup-schema-example",
      documentation: "",
      variables: {
        type: "string",
        "x-component-props": {
          placeholder: "",
          maxLength: 20,
        },
      },
      options: {
        "x-validator.whitespace": {
          picked: true,
          value: true,
        },
      },
    },
    'Input.TextArea': {
      detail:
        "https://antd.formilyjs.org/components/input#markup-schema-example",
      documentation: "",
      variables: {
        type: "string",
        "x-decorator-props": {
          labelWidth: '1',
          fullness: true,
        },
        "x-component-props": {
          placeholder: "",
          maxLength: 200,
        },
      },
    },
    Select: {
      detail:
        "https://antd.formilyjs.org/components/select#markup-schema-synchronization-data-source-case",
      documentation: "",
      variables: {
        type: "string",
        "x-component-props": {
          placeholder: "please select",
        },
        enum: [],
      },
      options: {
        enum: {
          picked: true,
          value: [], // TODO: idl enum maps.
        },
      },
    },
    'Radio.Group': {
      detail:
        "https://antd.formilyjs.org/components/radio#markup-schema-example",
      documentation: "",
      variables: {
        type: "string",
        "x-component-props": {
          placeholder: "please select",
        },
        enum: [],
      },
      options: {
        enum: {
          picked: true,
          value: [], // TODO: idl enum maps.
        },
      },
    },
    DatePicker: {
      detail:
        "https://antd.formilyjs.org/components/date-picker#markup-schema-example",
      documentation: "",
      variables: {
        type: "string",
      },
      options: {
        "x-component-props.showTime": {
          picked: true,
          value: true,
        },
        "x-component-props.disabledDate": {
          picked: true,
          value: () => false,
        },
      },
    },
    DateRange: {
      detail:
        "https://antd.formilyjs.org/components/date-picker#markup-schema-example",
      documentation: "",
      variables: {
        type: "string",
      },
      options: {
        "x-component-props.showTime": {
          picked: true,
          value: true,
        },
        "x-component-props.disabledDate": {
          picked: true,
          value: () => {},
        },
      },
    },
  },
  effects: []
} as SnippetMeta;
