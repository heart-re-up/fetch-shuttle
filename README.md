# template-ts-single-module

A Template for a Pure TypeScript Single Module Project

# package.json

## `type`

`type` specifies the module system.

- `module`: ECMAScript modules
- `commonjs`: CommonJS modules

However, `tsup` is used for building, so `type` is set to `module` by default.
`tsup` will generate `.js` files for `esm` and `.cjs` files for `commonjs`.

> When setting `type` to `commonjs`, `tsup` will generate `.js` files for `commonjs` and `.mjs` files for `esm`.

| type       | `.js`file | `.cjs`file | `.mjs`file |
| :--------- | :-------- | :--------- | :--------- |
| `module`   | `esm`     | `cjs`      | -          |
| `commonjs` | `cjs`     | -          | `esm`      |

# tsconfig.json

> This section only explains options that affect the build output.

## `compilerOptions.target`

> `es2017` is set as the default value.

The `target` option is used to specify which JavaScript version your code will be compiled to for the execution environment.

The following is `TypeScript` source code.

```typescript
// src/index.mts
const main = async (...args: (string | object)[]) => {
  console.log(args);
};
```

The `target` to equal or greater than `es2017(es8)`:

```javascript
// dist/index.js
var main = async (...args) => {
  console.log(args);
};
```

When you set the `target` to a version lower than `es2017(es8)`, such as `es2016(es7)` or `es2015(es6)`:

```javascript
// dist/index.js
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) =>
      x.done
        ? resolve(x.value)
        : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.mts
var main = (...args) =>
  __async(void 0, null, function* () {
    console.log(args);
  });
```

If you'd like to use `es5` target, `@swc/core` is required.

> The build output will be 143 lines of code to support es5.

```bash
pnpm add -D @swc/core
pnpm build
```

## `compilerOptions.module`

> `esnext` is set as the default value.

The `module` option affects both development code and build output.

### Module: `commonjs

Development code:

```typescript
const { useState } = require("react");
module.exports.MyComponent = () => {
  // ...
};
```

Build output:

```javascript
const react_1 = require("react");
exports.MyComponent = () => {
  // ...
};
```

### Module: `esnext`

Development code:

```typescript
import { useState } from "react";
export const MyComponent = () => {
  // ...
};
```

Build output:

```javascript
import { useState } from "react";
export const MyComponent = () => {
  // ...
};
```

## `compilerOptions.moduleResolution`

> `node` is set as the default value.

The `moduleResolution` option determines how TypeScript resolves files when it encounters import statements.

### Why "bundler" is better than "node"

- Stricter module resolution rules prevent ambiguous imports
- Better performance in file resolution
- Full support for package.json `exports` field
- Better subpath imports handling
- Clearer error messages for module resolution issues
- More efficient type definition resolution

```typescript
// bundler does not allow ambiguous imports like the below.
import { something } from "my-package/dist/utils"; // ❌
import { something } from "my-package/utils"; // ✅
```

> Note: Use "node" resolution when you need to support legacy packages that don't have package.json `exports` field.

# eslint for browser

First, install the `globals` package.

```bash
pnpm add -D globals
```

Then, add globals to eslint config.

```typescript
// .eslint.config.ts
import globals from "globals";

export default tseslint.config(
  // ... exists config
  {
    globals: globals.browser,
  },
);
```

# Testing in Browser Environment

First, install the `jsdom` package:

```bash
pnpm add -D jsdom
```

Then, update the environment setting in your vitest config:

```typescript:vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom", // Changed from 'node' to 'jsdom'
    testTimeout: 10000,
  },
});
```

This configuration allows you to run tests that require browser APIs.

# devDependencies

- [@types/node](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/node)
- [@typescript-eslint/eslint-plugin](https://github.com/typescript-eslint/typescript-eslint)
- [@typescript-eslint/parser](https://github.com/typescript-eslint/typescript-eslint)
- [@vitest/coverage-v8](https://github.com/vitest-dev/coverage-v8)
- [eslint](https://eslint.org/)
- [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) - Configuration to prevent conflicts between ESLint and Prettier
- [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier) - Runs Prettier as an ESLint rule
- [jiti](https://github.com/unjs/jiti) - Runtime TypeScript executor with TypeScript and ESM support
- [prettier](https://prettier.io/)
- [rimraf](https://github.com/jprichardson/node-rimraf)
- [ts-node](https://github.com/TypeStrong/ts-node)
- [tsup](https://tsup.egoist.dev/)
- [typescript](https://www.typescriptlang.org/)
- [typescript-eslint](https://typescript-eslint.io/) - Collection of ESLint plugins and parsers for TypeScript
- [vitest](https://vitest.dev/)
