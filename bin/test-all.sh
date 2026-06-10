#!/usr/bin/env bash

set -eu

source "$(dirname ${BASH_SOURCE[0]})/helpers.sh"

TOP_DIR=$(pwd)

rm -rf coverage 2>/dev/null || :
mkdir -p coverage/tmp

EXIT_CODE=0

for package in $(get_packages); do
cd "${package}"

set +e
npm test
EXIT_CODE+=$?
set -e

cd "${TOP_DIR}"
if [ -d "${package}/coverage/tmp" ]; then
cp "${package}"/coverage/tmp/*.json coverage/tmp/ 2>/dev/null || :
fi
done

./node_modules/.bin/c8 report \
--all \
--reporter text \
--reporter lcov

exit $EXIT_CODE
