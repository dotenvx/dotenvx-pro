# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [Unreleased](https://github.com/dotenvx/dotenvx-pro/compare/v0.18.0...main)

## 0.18.0

### Added

* Add `cloak` command

## 0.17.5

### Changed

* Attempt with `v` version to please homebrew

## 0.17.4

### Changed

* Extract `version` for use with homebrew formulua

## 0.17.3

### Added

* add `version` to homebrew formulua ([#32](https://github.com/dotenvx/dotenvx-pro/pull/32))

## 0.17.2

### Changed

* use full paths for `settings storetree` ([#31](https://github.com/dotenvx/dotenvx-pro/pull/31))

## [Unreleased](https://github.com/dotenvx/dotenvx-pro/compare/v0.17.1...main)

## 0.17.1

### Changed

* 🐞 fix `--unmask` regression ([#30](https://github.com/dotenvx/dotenvx-pro/pull/30))

## 0.17.0

### Added

* add `pro settings storetree` to display encrypted store file structure ([#29](https://github.com/dotenvx/dotenvx-pro/pull/29))

## 0.16.0

### Changed

* switch to using `depends_on` for homebrew ([#28](https://github.com/dotenvx/dotenvx-pro/pull/28))

## 0.15.1

### Changed

* fix the install script

## 0.15.0

### Added

* install `dotenvx` if not already installed ([#27](https://github.com/dotenvx/dotenvx-pro/pull/27))

## 0.14.1

### Changed

* bump `undici`

## 0.14.0

### Added

* installing `dotenvx pro` should also install `dotenvx`

## 0.13.0

### Added

* add `open` command ([#25](https://github.com/dotenvx/dotenvx-pro/pull/25))

## 0.12.2

### Changed

* respect `process.env` ahead of synced db data ([#23](https://github.com/dotenvx/dotenvx-pro/pull/23))

## 0.12.1

### Added

* add `lib/main.js` so require loads without error ([#21](https://github.com/dotenvx/dotenvx-pro/pull/21))

## 0.12.0

### Added

* add `dotenvx pro keypair --format shell` option ([#20](https://github.com/dotenvx/dotenvx-pro/pull/20))

## 0.11.0

### Added

* add `dotenvx pro keypair` command ([#19](https://github.com/dotenvx/dotenvx-pro/pull/19))

### Removed

* remove `dotenvx pro privatekey` command. (keypair services this need more flexibly) ([#19](https://github.com/dotenvx/dotenvx-pro/pull/19))

## 0.10.2

### Changed

* patch `db/organization.js` ([#18](https://github.com/dotenvx/dotenvx-pro/pull/18))

## 0.10.1

### Added

* add `settings hostname` command

## 0.10.0

### Added

* add `sync`, `push`, `privatekey` commands ([#17](https://github.com/dotenvx/dotenvx-pro/pull/17))

## 0.9.0

### Added

* add `ls` command with checkmarks ([#15](https://github.com/dotenvx/dotenvx-pro/pull/15))

## 0.8.0

### Added

* introduce `dotenvx organizations` for managing organizations ([#14](https://github.com/dotenvx/dotenvx-pro/pull/14))

## 0.7.3

### Removed

* removed `dotenvx settings systeminformation` ([#13](https://github.com/dotenvx/dotenvx-pro/pull/13))

## 0.7.2

### Changed

* switch to `pdf-lib` under the hood for the emergency kit ([#12](https://github.com/dotenvx/dotenvx-pro/pull/12))

## 0.7.1

### Changed

* patch `emergencykit.js` to `emergencyKit.js` ([#11](https://github.com/dotenvx/dotenvx-pro/pull/11))

## 0.7.0

### Added

* add `settings privatekey` to print privateKey
* add `settings emergencykit` to print emergency kit ([#10](https://github.com/dotenvx/dotenvx-pro/pull/10))

## 0.6.0

* move fingerprinting to the service for better security/obfuscation

## 0.5.0

### Added

* send machine fingerprint with device code request ([#9](https://github.com/dotenvx/dotenvx-pro/pull/9))

## 0.4.1

### Changed

* patch `store`

## 0.4.0

### Added

* add `settings recover` (recovers your account) ([#5](https://github.com/dotenvx/dotenvx-pro/pull/5))

## 0.3.0

### Added

* produce machine fingerprint ([#3](https://github.com/dotenvx/dotenvx-pro/pull/3))

## 0.2.0

### Added

* add login support with public/private key generation ([#2](https://github.com/dotenvx/dotenvx-pro/pull/2))
* add `settings recoveryphrase` ([#2](https://github.com/dotenvx/dotenvx-pro/pull/2))
* add `settings publickey` ([#2](https://github.com/dotenvx/dotenvx-pro/pull/2))

## 0.1.3 and prior

Please see commit history.
