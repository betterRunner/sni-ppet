<h1> Basic tutorial</h1>

This basic tutorial will teach you how to write and run your own snippet with sni-ppet.

## Install `sni-ppet` extension in Vscode

1. Install the [extension](https://marketplace.visualstudio.com/items?itemName=goodbetterbest.sni-ppet) from Vscode Extension Marketplace.

2. After the installation, open any project in your Vscode, then open the command panel (`ctrl/command + shift + p`) and select the `Sni-ppet Initialization` item.

![](https://user-images.githubusercontent.com/7123136/151900349-5a7b2790-cd29-4f8f-9b99-108f4519421d.png)

Then a `.sni-ppet` folder should be generated at the root path of your project now.

![](https://user-images.githubusercontent.com/7123136/138422094-edaea93e-cfdc-407b-bc3f-86f6003efa24.png)

:::tip
Note that `.sni-ppet` will be appended automatically to the tail of `.gitignore` to keep git clean.
:::

## Create a new demo snippet

1. Create a new folder in `.sni-ppet/metas` with any name (`your-snippet` for example).

![](https://user-images.githubusercontent.com/7123136/138422484-06810e70-ffec-4702-8546-19442c3a8333.png)

2. Create a `index.ts` file in the folder you just created, then fill it with the code below:

```typescript
import { Meta } from "../../types/meta";

export default [
  {
    /** The keyword to raise the intellisense while typing */
    matchTag: "demo",
    /** 
     * The template string of the snippet: symbol `$()` is the slot to generate the
     * dynamic code, which is used together with attribute `items`.
     */
    tpl: "const demo = { slot1: $(slot1), $(slot2), $(slot3) }",
    /** The common slots that all `items` own, for reducing redundancy usage. */
    commonSlots: [],
    /** The intellisense options, whose content of attribute `slots` would be 
     * filled to the `$(slot)` part of `tpl` to form the final code. 
     */
    items: [
      {
        name: "demo1",
        slots: [
          // (1) with only `replacement`
          {
            name: "slot1",
            replacement: "slot1",
          },
          // (2) with only `replacementFn`
          {
            name: "slot2",
            replacementFn: ({ slotName }) => `${slotName}: () => {}`,
          },
          // (3) with both `replacement` and `replacementFn`
          {
            name: "slot3",
            replacement: {
              key: "val",
            },
            replacementFn: ({ slotName, replacementStr }) =>
              `${slotName}: ${replacementStr}`,
          },
        ],
      },
    ],
  },
] as Meta[];
```

## Run the snippet just created

1. Reopen the current Vscode window.

2. Open any js/ts file in editor, type `demo` then the intellisense will show like this:

![](https://user-images.githubusercontent.com/7123136/151902691-22d89b59-946f-42d4-8bc2-ccd2850ba25c.png)

3. Select the `demo1` and press enter, then the snippet is generated like this:

![](https://user-images.githubusercontent.com/7123136/151903143-842e0edb-8ea0-4f94-98f6-f33325b269ea.png)

which is exactly the one you just created!

## Create your own snippet

Now you are managed to create a new demo snippet, please feel free to modify it or create a new one by yourself!

For more details of the structure of the snippet meta, please checkout the `.sni-ppet/meta/demo` folder or [the templates repo](https://github.com/betterRunner/sni-ppet-meta-template/tree/master/metas/demo), which is an advanced demo for [formily](https://formilyjs.org/). It is also a good example application scenarios for this extension by the way.