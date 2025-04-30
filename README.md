# brightspace-auth (monorepo)

This repository is a collection of packages relating to Brightspace's OAuth2 framework.

## Packages

* [brightspace-auth-assertions](packages/node_modules/brightspace-auth-assertions)
* [brightspace-auth-keys](packages/node_modules/brightspace-auth-keys)
* [brightspace-auth-provisioning](packages/node_modules/brightspace-auth-provisioning)
* [brightspace-auth-token](packages/node_modules/brightspace-auth-token)
* [brightspace-auth-validation](packages/node_modules/brightspace-auth-validation)

### `AbstractPublicKeyStore` Implementations

* [redis](packages/node_modules/brightspace-auth-keys-redis-store)
* [dynamodb](packages/node_modules/brightspace-auth-keys-dynamodb-store)

## Testing

```bash
npm test
```

Running `npm test` will lint all packages using the same set of rules. It will
then run the tests of each package one-by-one.

## Contributing

1. **Fork** the repository. Committing directly against this repository is
   highly discouraged.

2. Make your modifications in a branch, updating and writing new unit tests
   as necessary.

3. Ensure that all tests pass with `npm test`

4. `rebase` your changes against master. *Do not merge*.

5. Submit a pull request to this repository. Wait for tests to run and someone
   to chime in.

### Dependencies

When installing new dependencies, do so at the top-level. Static analysis of
each package will copy the dependencies to the packages at time of release.

### Code Style

This repository is configured with [EditorConfig][EditorConfig] and
[ESLint][ESLint] rules.

## Release

When it comes time do a release, update the versions of each package and commit
and tag the changes. A script is available to do this for you:

```sh
./bin/set-version-and-commit.sh 4.1.7
```

Push the version update and tag to GitHub and travis-ci will take care of
publishing the release:

```sh
git push upstream master v4.1.7
```

[EditorConfig]: http://editorconfig.org/
[ESLint]: http://eslint.org
