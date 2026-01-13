import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'gzip-headers',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.endsWith('.gz')) {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/json');
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: {
      // THIS MAGIC LINE
      $lib: "/src",
    },
  },
});
