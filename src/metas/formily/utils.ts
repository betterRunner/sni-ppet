import {
  randomStr,
  isFunction,
  valToCodeStr,
  upperFirstLetter,
  getItemInsertOffsetInScope,
} from "../../utils/utils";
import { Patch, PatchType } from "../../types/common";
import { TAGS_FIELD_ITEM, TAG_FORMITEM } from "./constant";
import { DYNAMIC_TAGS } from "../constant";

const PATH_FORMILY_ANTD = "@formily/antd";
const PATH_FORMILY_CORE = "@formily/core";
const PATH_FORMILY_REACT = "@formily/react";
const IMPORTS_FORMILY_CORE = ["createForm"];
const IMPORTS_FORMILY_REACT = ["FormProvider", "createSchemaField"];
const RE_CREATE_SCHEMAFIELD = `const SchemaField = createSchemaField\\(\\{\\s+components:\\s+(\\{(?:.|\\s)*?\\}),?\\s+\\}\\);?`;
const TPL_CREATE_SCHEMAFIELD = `\nconst SchemaField = createSchemaField({
  components: { $0 }
});`;

export function genFormilyGeneralEffects(): Patch[] {
  return [
    ...IMPORTS_FORMILY_CORE.map((i) => ({
      type: PatchType.import,
      source: PATH_FORMILY_CORE,
      content: i,
      isDefault: false,
      isLocal: false,
    })),
    ...IMPORTS_FORMILY_REACT.map((i) => ({
      type: PatchType.import,
      source: PATH_FORMILY_REACT,
      content: i,
      isDefault: false,
      isLocal: false,
    })),
  ];
}

export function genFormilyComponentEffects(components: string[]): Patch[] {
  // get root prefix of each component, such as `Input.TextArea` is `Input`.
  const componentPrefixes = [
    ...components
      .map((component) => component.split(".")[0])
      .filter((component) => component !== DYNAMIC_TAGS.unset),
    TAG_FORMITEM,
  ];
  return [
    ...(componentPrefixes.map((component) => ({
      type: PatchType.import,
      source: PATH_FORMILY_ANTD,
      content: component,
      isDefault: false,
      isLocal: false,
    })) as Patch[]),
    ...(componentPrefixes.map((component) => {
      return {
        type: PatchType.slot,
        regex: new RegExp(RE_CREATE_SCHEMAFIELD),
        replacement: (slots: string[] = []) => {
          const [s0 = "", s1 = ""] = slots;
          const s1Index = s0.indexOf(s1);
          let res = s0;
          const [offset, isLastComma] = getItemInsertOffsetInScope(
            s1,
            component
          );
          if (offset !== -1) {
            const replace = `${s1.slice(0, offset)}${
              isLastComma ? component : `,${component}`
            }${s1.slice(offset)}`;
            res = `${s0.slice(0, s1Index)}${replace}${s0.slice(
              s1Index + s1.length
            )}`;
          }
          return res;
        },
        initStr: TPL_CREATE_SCHEMAFIELD.replace("$0", component),
      };
    }) as Patch[]),
  ];
}

function fillTemplateWithVariables(
  tpl: string,
  variables: { [key: string]: any } = {}
) {
  let res = tpl.slice();

  // replace slot with corresponding variable
  const SLOT_TAG = `$(_)`;
  const keys = Object.keys(variables);
  keys.forEach((key) => {
    const slot = SLOT_TAG.replace("_", key);
    const val = variables[key];
    let valCode = "";
    // trans slot with corresponding val by formily markup schema grammar
    if (key === "type") {
      res = res.replaceAll(slot, upperFirstLetter(val.toString()));
    } else if (isFunction(val)) {
      valCode = `'${val.toString()}'`;
    } else if (Array.isArray(val) || (typeof val === "object" && val)) {
      try {
        valCode = `{${valToCodeStr(val)}}`;
      } catch (e) {
        console.error("val object parse error");
      }
    } else if (typeof val === "string") {
      if (val === DYNAMIC_TAGS.unset) {
        const re = new RegExp(`\\s*\\$\\(${key}\\)\\s*`);
        res = res.replace(re, "");
      } else if (val === DYNAMIC_TAGS.random) {
        valCode = `'r${randomStr()}'`;
      } else {
        valCode = `'${val}'`;
      }
    }
    if (valCode) {
      res = res.replace(slot, `${key}=${valCode}`);
    } else if (typeof val === "boolean") {
      // keep the slot when val is true otherwise remove it
      res = res.replace(slot, val ? key : "");
    }
  });

  // remove all slot that variables don't have
  const removeSlots = TAGS_FIELD_ITEM.filter((t) => !keys.includes(t)).map(
    (t) => SLOT_TAG.replace("_", t)
  );
  removeSlots.forEach((slot) => {
    res = res.replace(slot, "");
  });
  // remove duplicated \n
  res = res.replace(/\n+/g, "\n");

  return res;
}

export function genSnippetCode(
  tpl: string,
  variables: { [key: string]: any } = {}
) {
  return fillTemplateWithVariables(tpl, variables);
}
