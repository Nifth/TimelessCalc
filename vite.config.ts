import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
  ],
  base: process.env.VITE_BASE_URL || '/',
  resolve: {
    alias: {
      $lib: "/src",
    },
  },
  assetsInclude: ['**/*.gz'], // Dis à Vite de ne pas toucher à la structure de ces fichiers
});
