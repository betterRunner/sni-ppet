<h1> Basic tutorial</h1>

This basic tutorial will teach you how to write and run your own snippet with sni-ppet.

## Install `sni-ppet` extension in Vscode

1. Install the [extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) from Vscode Extension Marketplace.

2. After the installation, open any project in your Vscode, then open the command panel (`ctrl/command + shift + p`) and select the `Sni-ppet Initialization` item.

![](https://user-images.githubusercontent.com/7123136/138422094-edaea93e-cfdc-407b-bc3f-86f6003efa24.png)

Then a `.sni-ppet` folder should be in your project now.

## Create a new meta folder

1. Create a new folder in `.sni-ppet/metas` with any name (`your-snippet` for example).

![](https://user-images.githubusercontent.com/7123136/138422484-06810e70-ffec-4702-8546-19442c3a8333.png)

2. Create a `index.ts` file in the folder you just created, then fill it with the code below:

```typescript
import { Meta } from "../types/meta";

export default [
  {
    matchTag: "demo",
    tpl: "const demo = { slot1: $(slot1), $(slot2), $(slot3) }",
    commonSlots: [],
    items: [
      {
        name: "demo1",
        slots: [
          // with only `replacement`
          {
            name: "slot1",
            replacement: "slot1",
          },
          // with only `replacementFn`
          {
            name: "slot2",
            replacementFn: ({ slotName }) => `${slotName}: () => {}`,
          },
          // with both `replacement` and `replacementFn`
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
