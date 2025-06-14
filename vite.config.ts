import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import checker from "vite-plugin-checker";
import { fileURLToPath } from "node:url";
// https://vite.dev/config/

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    checker({
      // e.g. use TypeScript check
      typescript: true,
    }),
  ],

  root: "src/",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        groups: resolve(__dirname, "src/groups.html"),
        designers: resolve(__dirname, "src/designers.html"),
        plans: resolve(__dirname, "src/plans.html"),
        print_and_play: resolve(__dirname, "src/print_and_play.html"),
        useful_links: resolve(__dirname, "src/useful_links.html"),
        create_groups: resolve(__dirname, "src/createGroup.html"),
      },
    },
  },
});
