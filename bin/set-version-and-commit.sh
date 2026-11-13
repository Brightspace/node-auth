#!/usr/bin/env bash

set -e

echo "Bumping version of all packages..."

CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")

echo "Current version: ${CURRENT_VERSION}"

NEW_VERSION="${1}"; shift

echo "New version: ${NEW_VERSION}"

./bin/set-version.js "${NEW_VERSION}"

git commit package.json packages/node_modules/*/package.json -m "package: bump v${NEW_VERSION}"
