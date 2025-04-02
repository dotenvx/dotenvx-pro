[![dotenvx pro](https://dotenvx.com/pro-banner.png)](https://dotenvx.com/pricing)

*Secrets Management, Reimagined. 🏆*

* Cloaked keys
* Zero-knowledge
* Secrets as Code

[Learn more](https://dotenvx.com/docs/pro)

&nbsp;

## Quickstart [![npm version](https://img.shields.io/npm/v/@dotenvx/dotenvx-pro.svg)](https://www.npmjs.com/package/@dotenvx/dotenvx-pro)

*Install dotenvx pro.*

<details><summary>with npm 📦</summary><br>

```sh
npm install @dotenvx/dotenvx-pro --save
npx dotenvx pro help
```

</details>
<details><summary>with curl 🌐 </summary><br>

```sh
curl -sfS https://dotenvx.sh/pro | sh
dotenvx pro help
```

</details>
<details><summary>with brew 🍺</summary><br>

```sh
brew install dotenvx/brew/dotenvx-pro
dotenvx pro help
```

</details>
<details><summary>or with github releases 🐙</summary><br>

```sh
curl -L -o dotenvx-pro.tar.gz "https://github.com/dotenvx/dotenvx-pro/releases/latest/download/dotenvx-pro-$(uname -s)-$(uname -m).tar.gz"
tar -xzf dotenvx-pro.tar.gz
./dotenvx-pro help
```

</details>

&nbsp;

*Then log in.*

```sh
$ dotenvx pro login
✔ logged in [username] to this device and activated token [dxo_6kjPifI…]
⮕ next run [dotenvx pro sync]
```

*That's it, enjoy Pro! 🏆*

## Usage

```sh
$ dotenvx pro
Usage: @dotenvx/dotenvx-pro [options] [command]

dotenvx pro 🏆

Options:
  -l, --log-level <level>   set log level (default: "info")
  -q, --quiet               sets log level to error
  -v, --verbose             sets log level to verbose
  -d, --debug               sets log level to debug
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  sync [options]            sync
  push [options]            push
  pull [options]            pull
  open [options]            view repository on dotenvx pro
  login [options]           log in
  logout [options]          log out
  keypair [options] [key]   print public/private keys for .env file(s)
  ls [options] [directory]  print all .env files in a tree structure
  settings                  ⚙️  settings
```

## Advanced

> Become a `dotenvx pro` power user.
>

### CLI 📟

Advanced CLI commands.

* <details><summary>`pro keypair`</summary><br>

  Print fully managed public/private keys for `.env` file.

  ```sh
  $ echo "HELLO=World" > .env
  $ dotenvx encrypt

  $ dotenvx pro push

  $ dotenvx pro keypair
  {"DOTENV_PUBLIC_KEY":"<publicKey>","DOTENV_PRIVATE_KEY":"<privateKey>"}
  ```

  </details>
* <details><summary>`pro keypair -f`</summary><br>

  Print fully managed public/private keys for `.env.production` file.

  ```sh
  $ echo "HELLO=Production" > .env.production
  $ dotenvx encrypt -f .env.production

  $ dotenvx pro push

  $ dotenvx pro keypair -f .env.production
  {"DOTENV_PUBLIC_KEY_PRODUCTION":"<publicKey>","DOTENV_PRIVATE_KEY_PRODUCTION":"<privateKey>"}
  ```

  </details>
* <details><summary>`pro keypair DOTENV_PRIVATE_KEY`</summary><br>

  Print specific fully managed keypair for `.env` file.

  ```sh
  $ echo "HELLO=World" > .env
  $ dotenvx encrypt

  $ dotenvx pro push

  $ dotenvx pro keypair DOTENV_PRIVATE_KEY
  <privateKey>
  ```

  </details>
* <details><summary>`pro settings org`</summary><br>

  Print organization.

  ```sh
  $ dotenvx pro settings org
  motdotla
  ```

  </details>
* <details><summary>`pro settings orgpublickey`</summary><br>

  Print organization public key–used for encrypting project private keys.

  ```sh
  $ dotenvx pro settings orgpublickey
  02761eccd2a442ebbfa14ac2e72762d885a1e96b8949428deea62db305947d6408
  ```

  </details>
* <details><summary>`pro settings orgprivatekey`</summary><br>

  Print masked organization private key–used for decrypting project private keys.

  ```sh
  $ dotenvx pro settings orgprivatekey
  322c004*********************************************************
  ```

  </details>
* <details><summary>`pro settings orgprivatekey --unmask`</summary><br>

  Print unmasked organization private key–used for decrypting project private keys.

  ```sh
  $ dotenvx pro settings orgprivatekey --unmask
  322c004271ac6ad1b548df3f316ff4e8f08e17e0b15f459db64f3f3b48b0efb7
  ```

  </details>
* <details><summary>`pro settings orgteam`</summary><br>

  Print team status in tabular format.

  ```sh
  $ dotenvx pro settings orgteam
  ╔═══════════╤════════╗
  ║ username  │ synced ║
  ╟───────────┼────────╢
  ║ motdotla  │ ✔      ║
  ╟───────────┼────────╢
  ║ motdotenv │ ✔      ║
  ╚═══════════╧════════╝
  ```

  </details>
* <details><summary>`pro settings storetree`</summary><br>

  Print encrypted store tree–backing your dotenvx pro installation.

  ```sh
  $ dotenvx pro settings storetree
  ├─ .env
  └─ pro.dotenvx.com
     ├─ user-1-organization-1.json
     ├─ user-1-private-key.json
     └─ user-1.json
  ```

  </details>
