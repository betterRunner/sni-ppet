module.exports = {
  lang: "en",
  title: "Sni-ppet",
  description:
    "A snippet vscode extension: design your own snippets and access them progressively.",
  themeConfig: {
    docsDir: "docs",

    nav: [
      {
        text: "Introduction",
        link: "/",
      },
      {
        text: "Tutorial",
        items: [
          {
            text: "Basic",
            link: "/tutorials/basic",
          },
        ],
      },
    ],

    sidebar: {
      "/": getGuideSidebar(),
      '/tutorials/basic': []
    },
  },
};

function getGuideSidebar() {
  return [
    {
      text: "Getting Started",
      link: "/",
    },
  ];
}
