import { fileURLToPath } from "node:url";

const config = {
  plugins: {
    // Resolve the Tailwind config relative to this file so builds work from any cwd.
    tailwindcss: { config: fileURLToPath(new URL("./tailwind.config.ts", import.meta.url)) },
    autoprefixer: {},
  },
};

export default config;
