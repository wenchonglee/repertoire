# Repertoire reporter

This package is used in conjunction with [Repertoire](https://github.com/wenchonglee/repertoire)

## Getting started

```sh
npm install repertoire-reporter
# or
yarn add repertoire-reporter
# or
pnpm add repertoire-reporter
```

In your `playwright.config.ts`, add the following line:

```js
export default defineConfig({
  // assuming you hosted repertoire locally
  reporter: [["repertoire-reporter", { url: "http://localhost:3000" }]],
});
```

Any tests that run with this config will send the test report to Repertoire
