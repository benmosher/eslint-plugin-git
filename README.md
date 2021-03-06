# eslint-plugin-git

[![build status](https://travis-ci.org/benmosher/eslint-plugin-git.svg?branch=master)](https://travis-ci.org/benmosher/eslint-plugin-git)
[![Coverage Status](https://coveralls.io/repos/benmosher/eslint-plugin-git/badge.svg?branch=master&service=github)](https://coveralls.io/github/benmosher/eslint-plugin-git?branch=master)
[![npm](https://img.shields.io/npm/v/eslint-plugin-git.svg)](https://www.npmjs.com/package/eslint-plugin-git)

Rules to encourage hygenic Git usage. Ideal for a pre-commit hook, for example.

## Rules

- `no-untracked`: Report imports of modules that are not yet under source control.
- `no-unstaged`: Report imports of modules that have unstaged modifications.

All rules respect `.gitignore` and report on ES and CommonJS module references by default,
but may be tuned:

```yaml
rules:
  git/no-untracked: [2, { commonjs: false, amd: true, esmodule: true }]
```

### License

MIT
