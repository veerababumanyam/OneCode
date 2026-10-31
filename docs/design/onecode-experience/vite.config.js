import path from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

const root = process.cwd();
const oneQuillTokens = path.resolve(
  root,
  "../../../../OneQuill/docs/design/onequill-design-system",
);

export default defineConfig({
  preview: {
    port: 4173,
    strictPort: true,
  },
  server: {
    // One live instance per project: fail instead of drifting to another port.
    port: 5173,
    strictPort: true,
    fs: {
      allow: [searchForWorkspaceRoot(root), oneQuillTokens],
    },
  },
});
