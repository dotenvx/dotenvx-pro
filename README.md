[![dotenvx pro](https://dotenvx.com/pro-banner.png)](https://dotenvx.com/pricing)

*dotenvx pro 🏆*–For teams and organizations that need secure, scalable secrets management.

* **Extended 75-day free trial**
* **Fully managed private keys** securely synced with zero-knowledge encryption
* **Team permissions** to control access
* [and more](https://dotenvx.com/pricing)

[Read the security paper (coming soon)]()

&nbsp;

## Quickstart [![npm version](https://img.shields.io/npm/v/@dotenvx/dotenvx-pro.svg)](https://www.npmjs.com/package/@dotenvx/dotenvx-pro)

Extend `dotenvx` with pro.

```sh
npm install @dotenvx/dotenvx-pro --save
```
&nbsp;

or install globally

<details><summary>with curl 🌐 </summary><br>

```sh
curl -sfS https://dotenvx.sh/pro | sh
dotenvx pro help
```

&nbsp;

</details>

<details><summary>with brew 🍺</summary><br>

```sh
brew install dotenvx/brew/dotenvx-pro
dotenvx pro help
```

&nbsp;

</details>

<details><summary>or with github releases 🐙</summary><br>

```sh
curl -L -o dotenvx-pro.tar.gz "https://github.com/dotenvx/dotenvx-pro/releases/latest/download/dotenvx-pro-$(uname -s)-$(uname -m).tar.gz"
tar -xzf dotenvx-pro.tar.gz
./dotenvx-pro help
```

</details>


&nbsp;

## Usage

```sh
$ dotenvx pro
Usage: @dotenvx/dotenvx-pro [options] [command]

dotenvx pro 🏆

Options:
  -l, --log-level <level>     set log level (default: "info")
  -q, --quiet                 sets log level to error
  -v, --verbose               sets log level to verbose
  -d, --debug                 sets log level to debug
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  sync [options]              sync
  push [options] [directory]  push
  login [options]             log in
  logout [options]            log out
  keypair [options] [key]     print public/private keys for .env file(s)
  ls [options] [directory]    print all .env files in a tree structure
  settings                    ⚙️  settings
```
