# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [Unreleased]


## [1.1.0] - 2020-3-9
### Added
- Tests for the basic arithmetics and autoMult option
- Tests for options.functions
- Preparing input before parsing, enabling parsing when the passed expression has some unimportant groups such as `as{da } ^{13}{/6}` -> `as da   ^{13} /6 `
- Types "prod", "sqrt" to Node types.


### Changed
- the error message when parsing `\dfhgw`, which is not defined, the parser throw "undefined control sequence dfhgw";
- Sqrt now is parsed with type = "sqrt" not "function" as before.

### Fix

- `\lef( [expression] \right)`: an error was thrown when we try to parse such an expression, it considered right as control sequence name
- Make the argument for BlockParentheses instance of Array
