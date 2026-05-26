/**
 * CLI config for `npx sanity` commands (deploy studio, deploy GraphQL,
 * dataset operations, etc.). Reads from the same env vars as the studio.
 */
import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "owl-sing-together",
  autoUpdates: true,
});
