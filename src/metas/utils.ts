import { DYNAMIC_TAGS } from "./constant";

export function fillMetaVariables(
  variables: Record<string, any>,
  fill: Record<string, any>
) {
  const res: Record<string, any> = {};
  for (const key of Object.keys({ ...variables, ...fill })) {
    res[key] =
      Object.keys(DYNAMIC_TAGS).includes(variables[key]) ||
      fill[key] === undefined
        ? variables[key]
        : fill[key];
  }
  return res;
}
