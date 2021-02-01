# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - Unreleased

### Breaking

- Remove `options.operatorNames`, all names inside `\operatorname` are valid, you have to do extra validations if you want.
- Remove `options.singleCharName`, latex conventionally uses single-char name for constants and variables.
- Rename `builtIn`, the `I` into `i` in all places. For example `options.buitInFunctions` into `options.builtinFunctions`.
- `builtInControlSeq` rename to `builtinLetters`

### Added

- `Node.prototype.hasChild`
- `Node.prototype.hasChildR`
- New AST Node `"member expression"`.
- New AST Node `"set"`.
- New AST Node `"tuple"`.
- `"..."`, at the beginning of options array that has default value of type `Checker`. This ellipsis will put the default ones. 
- `options.extra`
  - `memberExpressions`
  - `sets`
  - `tuples`
  - `intervals`
  - `matrices`
  - `ellipsis`
    - `sets`
    - `tuples`
    - `intervals`
    - `funcArgs`
    - `infixOperators`

## [1.2.1] - 2020-10-25

### Fix

- Fix the issue (#1).

## [1.2.0] - 2020-10-22

### Fix

- Catch error more precisely when unexpected block closing char found

## [1.1.1] - 2020-9-3

### Added

- Add files property in package.json to reduce the package size, and delete the development files.

## [1.1.0] - 2020-9-3

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

