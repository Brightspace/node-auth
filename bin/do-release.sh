#!/usr/bin/env bash

set -e

source "$(dirname ${BASH_SOURCE[0]})/helpers.sh"

if [ "${GITHUB_REPOSITORY}" != "Brightspace/node-auth" ]; then
	echo "Not building on Brightspace/node-auth. Skipping..."
	exit 0
fi

if [[ "${GITHUB_REF}" != refs/tags/* ]]; then
	echo "Not a tag build. Skipping..."
	exit 0
fi

./bin/set-meta.js
./bin/set-dependencies.js

for package in $(get_packages); do
	if [ "true" = $(node --eval "console.log(require('${package}/package.json').private)") ]; then
		continue
	fi

	cd "${package}"

	if [ ! -z "${DRY_RUN}" ]; then
		echo "Dry run. Skipping..."
	else
		npm publish --provenance --access public
	fi
done
