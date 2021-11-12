import * as vscode from "vscode";
import { resolve } from "path";
import { ScriptTarget, ModuleKind } from "typescript";

import { compile } from "../utils/ts";
import { getCurrentProjectPath, outputChannel } from "../utils/vscode";
import { Meta } from "../types/meta";

const CONFIG_FOLDER_NAME = ".sni-ppet";
const META_TEMPLATE_REPO_URL =
  "https://github.com/betterRunner/sni-ppet-meta-template.git";
const META_FOLDER_METAS = "metas";
const META_FOLDER_TYPES = "types";
const META_FOLDER_CONSTANTS = "constants.ts";
const META_FOLDER_CONFIG = "config.env";

function cloneMetaTemplatesFromRepo(overwrite: boolean = false): Promise<void> {
  return new Promise(async (succ, reject) => {
    const curProjectPath = getCurrentProjectPath();
    if (curProjectPath) {
      const configPath = resolve(curProjectPath, CONFIG_FOLDER_NAME);
      const tempPath = resolve(configPath, ".temp");
      const configMetaUri = vscode.Uri.file(
        resolve(configPath, META_FOLDER_METAS)
      );

      // 1. overwrite needs deleting `configMetaUri` first
      if (overwrite) {
        await vscode.workspace.fs.delete(configMetaUri);
      }
      // 2. if `metas` folder exists, just skip this function
      try {
        const stat = await vscode.workspace.fs.stat(configMetaUri);
        if (stat?.type === vscode.FileType.Directory) {
          succ();
          return;
        }
      } catch (e) {
        // do nothing
      }

      // 3. clone the project from remote repo by `git clone` to `tempPath`
      const cp = require("child_process");
      cp.exec(
        `git clone ${META_TEMPLATE_REPO_URL} ${tempPath}`,
        async (err: string) => {
          if (err) {
            reject(err);
            return;
          }
          // 4. copy the files from `tempPath` to `configMetaPath`:
          // (1) only copy `demo` folder of `metas`
          // (2) copy `types` fodler
          // (3) copy `constants.ts`
          // (4) copy `config.env`
          const DEMO_FOLDER_NAME = 'demo';
          const tempMetaDemoUri = vscode.Uri.file(
            resolve(tempPath, META_FOLDER_METAS, DEMO_FOLDER_NAME)
          );
          const configMetaDemoUri = vscode.Uri.file(
            resolve(configPath, META_FOLDER_METAS, DEMO_FOLDER_NAME)
          );
          await vscode.workspace.fs.createDirectory(configMetaUri);
          await vscode.workspace.fs.createDirectory(configMetaDemoUri);
          await vscode.workspace.fs.copy(tempMetaDemoUri, configMetaDemoUri, {
            overwrite: true,
          });
          for (const name of [
            META_FOLDER_TYPES,
            META_FOLDER_CONSTANTS,
            META_FOLDER_CONFIG,
          ]) {
            await vscode.workspace.fs.copy(
              vscode.Uri.file(resolve(tempPath, name)),
              vscode.Uri.file(resolve(configPath, name))
            );
          }
          // 5. delete the `tempPath`
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

  // if meta folder doesn't exist, clone the template code from github repo
  await cloneMetaTemplatesFromRepo();

  const curProjectPath = getCurrentProjectPath();
  if (curProjectPath) {
    const rootPath = resolve(curProjectPath, CONFIG_FOLDER_NAME);
    const metasPath = resolve(rootPath, "metas");
    const metasUri = vscode.Uri.file(metasPath);
    const metas = (await vscode.workspace.fs.readDirectory(metasUri))
      .filter(
        (f) => f?.[1] === vscode.FileType.Directory && !f?.[0].startsWith(".")
      )
      .map((f) => f?.[0]);
    for (const meta of metas) {
      // compile the metas ts code to CommonJS js code then we can use `import()` to dynamically import them
      const indexPath = resolve(metasPath, meta, "index.ts");
      const compileSucc = compile([indexPath], {
        target: ScriptTarget.ESNext,
        module: ModuleKind.CommonJS,
      });
      if (compileSucc) {
        try {
          const metaPath = resolve(indexPath, "..", "index.js");
          const metaData = (await import(metaPath))?.default; // dynamically import
          res.push(...metaData);
        } catch(err) {
          outputChannel.error((err as string) ?? '');
        }
      } else {
        outputChannel.error(`compile ts file error: ${indexPath}`);
      }
    }
    // delete the compiled CommonJS js code
    removeCompiledJsFiles(rootPath);
  }
  return res;
}
