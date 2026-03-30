/// <reference types="vitest/config" />
import { defineConfig, type UserConfig } from "vite";
import macros from "unplugin-macros/vite";

const config: UserConfig = defineConfig({
  test: {
    includeSource: ["src/**/*.?(c|m)[jt]s?(x)"],
    execArgv: ["--allow-natives-syntax", "--expose-gc"],
  },
  define: {
    "import.meta.vitest": "undefined",
  },
  plugins: [macros()],
});
export { config as default };
