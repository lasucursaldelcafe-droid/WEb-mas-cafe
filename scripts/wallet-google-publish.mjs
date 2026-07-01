#!/usr/bin/env node
/**
 * @deprecated Usa npm run wallet:google-ingest
 */
import { execSync } from "child_process";

const file = process.argv[2];
const cmd = file
  ? `node scripts/wallet-google-ingest.mjs "${file}"`
  : "node scripts/wallet-google-ingest.mjs";
execSync(cmd, { stdio: "inherit" });
