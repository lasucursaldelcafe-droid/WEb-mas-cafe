#!/usr/bin/env node
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../..");
const src = path.join(root, "content/wallet-program.json");
const dest = path.join(root, "functions/program-defaults.json");

const program = JSON.parse(readFileSync(src, "utf8"));
writeFileSync(dest, `${JSON.stringify(program, null, 2)}\n`, "utf8");
console.log("  • functions/program-defaults.json (desde content/wallet-program.json)");
