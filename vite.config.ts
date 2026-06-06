// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// The custom src/server.ts wrapper exports a Cloudflare Worker–shaped
// `{ fetch }` handler. On Vercel we let Nitro use its default Node/Vercel
// server entry instead (set NITRO_PRESET=vercel in the Vercel build command).
const isVercel = process.env.NITRO_PRESET === "vercel" || !!process.env.VERCEL;

export default defineConfig({
  tanstackStart: isVercel
    ? undefined
    : {
        // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
        // nitro/vite builds from this
        server: { entry: "server" },
      },
});
