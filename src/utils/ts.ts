import * as ts from "typescript";

export function compile(fileNames: string[], options: ts.CompilerOptions): boolean {
  const program = ts.createProgram(fileNames, options);
  const emitResult = program.emit();
  console.log(emitResult);
  return emitResult.emitSkipped ? false : true;
}
