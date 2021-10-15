export function randomStr(len = 10) {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, len);
}

export function upperFirstLetter(str: string) {
  return `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;
}

export function isObject(val: any) {
  return typeof val === "object" && val;
}

export function isFunction(fn: any) {
  return fn && {}.toString.call(fn) === "[object Function]";
}

export function valToCodeStr(val: any) {
  let valStr = "";
  if (isFunction(val)) {
    valStr = val.toString();
  } else if (Array.isArray(val) || isObject(val)) {
    const isArray = Array.isArray(val);
    const slot = isArray ? "[\n$0\n]" : "{\n$0\n}";
    const iters = isArray ? val : Object.keys(val);
    valStr = slot.replace(
      "$0",
      iters
        .map((iter) => {
          return isArray
            ? `\t${valToCodeStr(iter)}`
            : `\t${iter}: ${valToCodeStr(val[iter])}`;
        })
        .join(",\n")
    );
  } else if (typeof val === "string") {
    valStr = `'${val}'`;
  } else {
    valStr = val.toString();
  }
  return valStr;
}

export function reverseStr(str: string) {
  return str.split("").reverse().join("");
}

export function getLineAndCharacterNumFromOffset(str: string, offset: number) {
  const lines = str.split("\n");
  for (let m = 0; m < lines.length; m++) {
    const line = lines[m];
    if (offset >= line.length + 1) {
      offset -= line.length + 1;
    } else {
      return [m, offset];
    }
  }
  return [-1, -1];
}

export function getItemInsertOffsetInScope(
  scope: string,
  item: string
): [number, boolean] {
  const re = new RegExp(`,?\\s*${item}(?:,|\\s*\})`);
  const existed = re.test(scope);
  if (!existed) {
    const endIndex = scope.lastIndexOf("}");
    const lastCommaIndex = scope.lastIndexOf(",");
    const isLastComma = lastCommaIndex !== -1 && lastCommaIndex >= endIndex - 2;
    const offset = isLastComma ? lastCommaIndex + 1 : endIndex;
    return [offset, isLastComma];
  }
  return [-1, false];
}
