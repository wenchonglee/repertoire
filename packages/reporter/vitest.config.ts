import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  test: {
    include: ["src/?(*.){test,spec}.?(c|m)[jt]s?(x)"],
  },
});
