#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { isBuiltin } from 'node:module';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const topPkgDir = path.resolve(__dirname, '..');
const topPkg = JSON.parse(fs.readFileSync(path.join(topPkgDir, 'package.json'), 'utf8'));
const definedDependencies = Object.keys(topPkg.dependencies);

const pkgsDir = path.join(topPkgDir, 'packages/node_modules');
const pkgNames = fs.readdirSync(pkgsDir);

/**
 * Recursively find all .js files in a directory
 */
function findJsFiles(dir) {
const results = [];
for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
const fullPath = path.join(dir, entry.name);
if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'test' && entry.name !== 'spec') {
results.push(...findJsFiles(fullPath));
} else if (entry.isFile() && entry.name.endsWith('.js')) {
results.push(fullPath);
}
}
return results;
}

/**
 * Extract import specifiers from ESM source code using regex.
 * Handles: import X from 'pkg', import { X } from 'pkg', import 'pkg'
 */
function findImports(source) {
const imports = [];
// Match static import statements
const importRegex = /import\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g;
let match;
while ((match = importRegex.exec(source)) !== null) {
imports.push(match[1]);
}
// Match dynamic imports
const dynamicRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
while ((match = dynamicRegex.exec(source)) !== null) {
imports.push(match[1]);
}
return imports;
}

for (const pkgName of pkgNames) {
const pkgDir = path.join(pkgsDir, pkgName);
const pkgPath = path.join(pkgDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

/**
 * Dependency Detection
 *
 * Scans all source .js files for import statements and extracts
 * package names from the import specifiers.
 */
const jsFiles = findJsFiles(pkgDir);
const allImports = [];
for (const file of jsFiles) {
const source = fs.readFileSync(file, 'utf8');
allImports.push(...findImports(source));
}

const packageRequires = Array.from(new Set(
allImports
.filter(id => id[0] !== '.' && id[0] !== '/')
.filter(id => !id.startsWith('node:'))
.map(id => {
let slash = id.indexOf('/');
if (slash === -1) {
return id;
}

// scoped packages
if (id[0] === '@') {
slash = id.indexOf('/', slash + 1);

if (slash === -1) {
return id;
}
}

return id.slice(0, slash);
})
.filter(id => !isBuiltin(id))
));

const externalDependencies = intersect(packageRequires, definedDependencies).sort();
const internalDependencies = intersect(packageRequires, pkgNames).sort();

if (packageRequires.length !== externalDependencies.length + internalDependencies.length) {
const missing = complement(packageRequires, externalDependencies.concat(internalDependencies));
throw new Error(`Missing dependency definition(s) for "${pkg.name}"!\n    MISSING DEFINTION(S): ${missing}`);
}

pkg.dependencies = {};

for (const dep of externalDependencies) {
pkg.dependencies[dep] = topPkg.dependencies[dep];
}

for (const dep of pkgNames) {
if (pkg.peerDependencies && pkg.peerDependencies[dep] !== undefined) {
pkg.peerDependencies[dep] = topPkg.version;
} else if (internalDependencies.indexOf(dep) !== -1) {
pkg.dependencies[dep] = topPkg.version;
}
}

if (process.argv.indexOf('--dry-run') === -1) {
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n', 'utf8');
}
}

function complement(u, a) {
u = new Set(u);
a = new Set(a);
return Array.from(u).filter(x => !a.has(x));
}

function intersect(a, b) {
a = new Set(a);
b = new Set(b);
return Array.from(a).filter(x => b.has(x));
}
