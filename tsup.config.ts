import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.*ts"],
  format: ["cjs", "esm"], // support formats
  dts: true, // generate type declaration files
  splitting: true, // enable code splitting (esm)
  clean: true, // clean build directory before building
});
