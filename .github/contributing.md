# Sni-ppet Contributing Guide

Hi! Thank you for joining me to build sni-ppet together.

## Pull Request Guidelines

- Checkout a topic branch from the relevant branch, e.g. `master`, and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - Provide a detailed description of the bug in the PR. Live demo preferred.

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

- Commit messages must follow the [commit message convention](./commit-convention.md) so that changelogs can be automatically generated.

## Development Setup

You will need [Yarn](https://classic.yarnpkg.com/en/docs/cli/install/)/

After cloning the repo, run:

```bash
# install dependencies
yarn
```

Then click `Run and Debug` -> `Debugging` in [Visual Stuio Code](https://code.visualstudio.com/) to debug the extension, more details please check out [the official extension development document](https://code.visualstudio.com/api/get-started/your-first-extension)