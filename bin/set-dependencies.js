#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');
const { isBuiltin } = require('node:module');

const topPkgDir = path.resolve(__dirname, '..');
const topPkg = JSON.parse(fs.readFileSync(path.join(topPkgDir, 'package.json'), 'utf8'));
const definedDependencies = Object.keys(topPkg.dependencies);

const pkgsDir = path.join(topPkgDir, 'packages/node_modules');
const pkgNames = fs.readdirSync(pkgsDir);

const IMPORT_REGEX = / from '([^']+)';/g;

for (const pkgName of pkgNames) {
	const pkgDir = path.join(pkgsDir, pkgName);
	const pkgPath = path.join(pkgDir, 'package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

	const files = pkg.files;
	if (!files) {
		throw new Error(`Missing "files" array in "${pkg.name}" package.json`);
	}

	const packageRequires = new Set();
	function processSourceFile(path) {
		const content = fs.readFileSync(path, 'utf8');

		for (let [, module] of content.matchAll(IMPORT_REGEX)) {
			if (module[0] === '.') {
				continue;
			}

			let slash = module.indexOf('/');
			if (slash !== -1) {
				// scoped packages
				if (module[0] === '@') {
					slash = module.indexOf('/', slash + 1);
				}
			}

			if (slash !== -1) {
				module = module.slice(0, slash);
			}

			if (isBuiltin(module)) {
				continue;
			}

			packageRequires.add(module);
		}
	}

	for (const fileEntry of files) {
		const resolved = path.join(pkgDir, fileEntry);

		if (path.extname(resolved) === '.js') {
			processSourceFile(resolved);
			continue;
		}

		if (fs.statSync(resolved).isDirectory()) {
			const listing = fs.readdirSync(resolved, { recursive: true });
			for (const item of listing) {
				if (path.extname(item) === '.js') {
					processSourceFile(path.join(resolved, item));
				}
			}
		}
	}

	const externalDependencies = intersect(packageRequires, definedDependencies).sort();
	const internalDependencies = intersect(packageRequires, pkgNames).sort();

	if (packageRequires.size !== externalDependencies.length + internalDependencies.length) {
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
