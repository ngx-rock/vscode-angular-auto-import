#!/usr/bin/env node

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const excludedDirs = new Set(["e2e", "test"]);
const files = [];

function collectTypeScriptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludedDirs.has(entry.name)) {
        collectTypeScriptFiles(entryPath);
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")) {
      files.push(entryPath);
    }
  }
}

collectTypeScriptFiles("src");

const fileListPath = path.join(os.tmpdir(), `pmd-cpd-${process.pid}.txt`);
fs.writeFileSync(fileListPath, `${files.join("\n")}\n`);
process.stdout.write(fileListPath);
