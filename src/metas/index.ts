import * as vscode from "vscode";
import { resolve } from "path";
import { ScriptTarget, ModuleKind } from "typescript";

import { IntellisenseMeta } from "../types/meta";
import { compile } from "../utils/ts";

export async function readMetasFromConfig(): Promise<IntellisenseMeta[]> {
  const res: IntellisenseMeta[] = [];

  const curProjectPath = vscode.workspace.workspaceFolders?.[0].uri.path;
  if (curProjectPath) {
    const METAS_FOLDER_PATH = [".sni-ppet", "metas"];
    const metasPath = resolve(curProjectPath, ...METAS_FOLDER_PATH);
    console.log(metasPath);
    const metaUris = vscode.Uri.file(metasPath);
    const metas = (await vscode.workspace.fs.readDirectory(metaUris))
      .filter((f) => f?.[1] === vscode.FileType.Directory)
      .map((f) => f?.[0]);
    for (const meta of metas) {
      const indexPath = resolve(metasPath, meta, "index.ts");
      const compileSucc = compile([indexPath], {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ScriptTarget.ESNext,
        module: ModuleKind.CommonJS,
      });
      if (compileSucc) {
        const metaPath = resolve(indexPath, "..", "index.js");
        const meta = (await import(metaPath))?.default;
        res.push(meta);
      }
    }
  }
  return res;
}
