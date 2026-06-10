#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = process.argv[process.argv.length - 1];

const topPkgDir = path.resolve(__dirname, '..');
const pkgsDir = path.join(topPkgDir, 'packages/node_modules');

const pkgPaths = fs
.readdirSync(pkgsDir)
.map(name => path.join(pkgsDir, name))
.concat(topPkgDir)
.map(pkgDir => path.join(pkgDir, 'package.json'));

for (const pkgPath of pkgPaths) {
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n', 'utf-8');
}
