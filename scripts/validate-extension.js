const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

if (manifest.manifest_version !== 3) {
  throw new Error("Expected manifest_version 3.");
}

const referencedFiles = new Set();
const addReference = (file) => {
  if (typeof file !== "string" || file.length === 0) {
    throw new Error("Manifest contains an empty or invalid file reference.");
  }
  referencedFiles.add(file);
};

for (const file of Object.values(manifest.icons || {})) addReference(file);
for (const file of Object.values(manifest.action?.default_icon || {})) addReference(file);
if (manifest.background?.service_worker) addReference(manifest.background.service_worker);
if (manifest.options_ui?.page) addReference(manifest.options_ui.page);
for (const script of manifest.content_scripts || []) {
  for (const file of script.js || []) addReference(file);
  for (const file of script.css || []) addReference(file);
}

for (const file of referencedFiles) {
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(`${root}${path.sep}`) || !fs.existsSync(resolved)) {
    throw new Error(`Manifest references a missing or out-of-project file: ${file}`);
  }
}

console.log(`Extension validation passed (${referencedFiles.size} manifest file references).`);
