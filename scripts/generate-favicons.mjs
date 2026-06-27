#!/usr/bin/env node
import { generateFavicons } from "./lib/generate-favicons-lib.mjs";

generateFavicons()
  .then(() => console.log("✅ Favicons generados en public/"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
