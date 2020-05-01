#!/usr/bin/env bash

set -eu

source "$(dirname ${BASH_SOURCE[0]})/helpers.sh"

TOP_DIR=$(pwd)

rm -r .nyc_output 2>/dev/null || :

for package in $(get_packages); do
	cd "${package}"
	npm test

	cd "${TOP_DIR}"
	if [ -d "${package}/.nyc_output" ]; then
		./node_modules/.bin/nyc \
			merge \
			"${package}/.nyc_output" \
			".nyc_output/$(basename "${package}").json"
	fi
done

./node_modules/.bin/nyc report \
	--exclude-node-modules false \
	--reporter text \
	--reporter lcov
