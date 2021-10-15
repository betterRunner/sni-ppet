import * as vscode from "vscode";
import { resolve } from "path";
import { ScriptTarget, ModuleKind } from "typescript";

import { compile } from "../utils/ts";
import { getCurrentProjectPath } from "../utils/vscode";
import { Meta } from "../types/meta";

const CONFIG_FOLDER_NAME = ".sni-ppet";
const META_TEMPLATE_REPO_URL =
  "https://github.com/betterRunner/sni-ppet-meta-template.git";

function cloneMetaTemplatesFromRepo(): Promise<void> {
  return new Promise(async (succ, reject) => {
    const curProjectPath = getCurrentProjectPath();
    if (curProjectPath) {
      const configPath = resolve(curProjectPath, CONFIG_FOLDER_NAME);
      const configMetaPath = resolve(configPath, "metas");
      const tempPath = resolve(configPath, "temp");
      const tempMetaPath = resolve(tempPath, "metas");
      const configMetaUri = vscode.Uri.file(configMetaPath);

      // 0. if `metas` folder exists, just skip this function
      try {
        const stat = await vscode.workspace.fs.stat(configMetaUri);
        if (stat?.type === vscode.FileType.Directory) {
          succ();
          return;
        }
      } catch(e) {
        // do nothing
      }

      // 1. clone the project from remote repo by `git clone` to `tempPath`
      const cp = require("child_process");
      cp.exec(
        `git clone ${META_TEMPLATE_REPO_URL} ${tempPath}`,
        async (err: string) => {
          if (err) {
            reject(err);
            return;
          }
          // 2. copy the `metas` folder from `tempPath` to `configMetaPath`
          const tempMetaUri = vscode.Uri.file(tempMetaPath);
          await vscode.workspace.fs.createDirectory(configMetaUri);
          await vscode.workspace.fs.copy(tempMetaUri, configMetaUri, {
            overwrite: true,
          });
          // 3. delete the `tempPath`
          vscode.workspace.fs.delete(vscode.Uri.file(tempPath), {
            recursive: true,
            useTrash: false,
          });
          succ();
        }
      );
    } else {
      reject();
    }
  });
}

async function removeCompiledJsFiles(rootPath: string) {
  const _iter = async (path: string) => {
    const uri = vscode.Uri.file(path);
    const items = await vscode.workspace.fs.readDirectory(uri);
    for (const item of items) {
      const itemPath = resolve(path, item?.[0]);
      if (item?.[1] === vscode.FileType.Directory) {
        _iter(itemPath);
      } else if (item?.[0].endsWith(".js")) {
        const itemUri = vscode.Uri.file(itemPath);
        vscode.workspace.fs.delete(itemUri); // no need to await
      }
    }
  };
  _iter(rootPath);
}

export async function readMetasFromConfig(): Promise<Meta[]> {
  const res: Meta[] = [];

  await cloneMetaTemplatesFromRepo();

  const curProjectPath = getCurrentProjectPath();
  if (curProjectPath) {
    const rootPath = resolve(curProjectPath, CONFIG_FOLDER_NAME);
    const metaPath = resolve(rootPath, "metas");
    const metasUri = vscode.Uri.file(metaPath);
    const metas = (await vscode.workspace.fs.readDirectory(metasUri))
      .filter(
        (f) => f?.[1] === vscode.FileType.Directory && !f?.[0].startsWith(".")
      )
      .map((f) => f?.[0]);
    for (const meta of metas) {
      // compile the metas ts code to CommonJS js code then we can use `import()` to dynamically import them
      const indexPath = resolve(metaPath, meta, "index.ts");
      const compileSucc = compile([indexPath], {
        noEmitOnError: true,
        noImplicitAny: true,
        target: ScriptTarget.ESNext,
        module: ModuleKind.CommonJS,
      });
      if (compileSucc) {
        const metaPath = resolve(indexPath, "..", "index.js");
        const meta = (await import(metaPath))?.default; // dynamically import
        res.push(meta);
      }
    }
    // delete the compiled CommonJS js code
    removeCompiledJsFiles(rootPath);
  }
  console.log(res);
  return res;
}
