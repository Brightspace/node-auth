#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMMON_META = [
	'author',
	'bugs',
	'homepage',
	'license',
	'repository',
	'engines'
];

const topPkgDir = path.resolve(__dirname, '..');
const topPkg = JSON.parse(fs.readFileSync(path.join(topPkgDir, 'package.json'), 'utf8'));

const pkgsDir = path.join(topPkgDir, 'packages/node_modules');
const pkgNames = fs.readdirSync(pkgsDir);

for (const pkgName of pkgNames) {
	const pkgDir = path.join(pkgsDir, pkgName);
	const pkgPath = path.join(pkgDir, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

	for (const field of COMMON_META) {
		pkg[field] = JSON.parse(JSON.stringify(topPkg[field]));
	}

	// https://github.com/npm/rfcs/pull/19
	pkg.repository.directory = path.relative(topPkgDir, pkgDir);

	fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, '  ') + '\n', 'utf8');
}
