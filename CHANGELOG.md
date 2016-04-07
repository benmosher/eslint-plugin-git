# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).
This change log adheres to standards from [Keep a CHANGELOG](http://keepachangelog.com).

## [0.1.1]
### Added
- this changelog
- support for module selection params (i.e. `{ commonjs: true }`) via rule options
- lint CommonJS requires by default (only AMD must be enabled explicitly)

### Fixed
- stack overflow from failing to exit when looking for git repo

## [0.1.0] - 2016-04-05
Born.

### Added
- `no-untracked`: report imports/requires of modules that are inside a Git tree,
  but not yet added explicitly (i.e. staged).


[`import/cache` setting]: ./README.md#importcache

[Unreleased]: https://github.com/benmosher/eslint-plugin-import/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/benmosher/eslint-plugin-import/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/benmosher/eslint-plugin-import/compare/...v0.1.0
