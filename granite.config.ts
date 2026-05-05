import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "nyangbi-hajimalgae",
  brand: {
    displayName: "냥비하지말개",
    primaryColor: "#E8728C",
    icon: "https://static.toss.im/icons/png/4x/icon-toss-logo.png",
  },
  web: {
    host: "0.0.0.0",
    port: 5174,
    commands: {
      dev: "vite dev --host 0.0.0.0 --port 5174",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
