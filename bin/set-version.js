#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

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
