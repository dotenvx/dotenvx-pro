#!/bin/sh

set -e
VERSION=""
DIRECTORY="/usr/local/bin"
REGISTRY_URL="https://registry.npmjs.org"
INSTALL_SCRIPT_URL="https://dotenvx.sh/pro"

#  ./install.sh
#  ___________________________________________________________________________________________________
#  |                                                                                                 |
#  |  $ dotenvx pro                                                                                  |
#  |                                                                                                 |
#  |  ## Install                                                                                     |
#  |                                                                                                 |
#  |  ```sh                                                                                          |
#  |  curl -sfS https://dotenvx.sh/pro | sh                                                          |
#  |  ```                                                                                            |
#  |                                                                                                 |
#  |  or self-execute this file:                                                                     |
#  |                                                                                                 |
#  |  ```sh                                                                                          |
#  |  curl -sfS https://dotenvx.sh/pro > install.sh                                                  |
#  |  chmod +x install.sh                                                                            |
#  |  ./install.sh                                                                                   |
#  |  ```                                                                                            |
#  |                                                                                                 |
#  |  more install examples:                                                                         |
#  |                                                                                                 |
#  |  ```sh                                                                                          |
#  |  # curl examples                                                                                |
#  |  curl -sfS "https://dotenvx.sh/pro" | sudo sh                                                   |
#  |  curl -sfS "https://dotenvx.sh/pro?version=0.44.5" | sh                                         |
#  |  curl -sfS "https://dotenvx.sh/pro?directory=." | sh                                            |
#  |  curl -sfS "https://dotenvx.sh/pro?directory=/custom/path&version=0.44.5" | sh                  |
#  |                                                                                                 |
#  |  # self-executing examples                                                                      |
#  |  ./install.sh --version=0.44.5                                                                  |
#  |  ./install.sh --directory=.                                                                     |
#  |  ./install.sh --directory=/custom/path --version=0.44.5                                         |
#  |  ./install.sh --help                                                                            |
#  |  ```                                                                                            |
#  |                                                                                                 |
#  |  see [`dotenvx-pro`](https://github.com/dotenvx/dotenvx-pro) for usage.                         |
#  |                                                                                                 |
#  |_________________________________________________________________________________________________|

# usage ---------------------------------
usage() {
  echo "Usage: $0 [options] [command]"
  echo ""
  echo "install dotenvx-pro"
  echo ""
  echo "Options:"
  echo "  --directory       directory to install dotenvx-pro to (default: \"/usr/local/bin\")"
  echo "  --version         version of dotenvx-pro to install (default: \"$VERSION\")"
  echo ""
  echo "Commands:"
  echo "  install           install dotenvx-pro"
  echo "  help              display help"
}

# machine checks ------------------------
is_version_valid() {
  if [ -z "$VERSION" ]; then
    echo "[INSTALLATION_FAILED] VERSION ($VERSION) is blank in install.sh script"
    echo "? set VERSION to valid semantic semver version and try again"

    return 1
  fi

  local semver_regex="^([0-9]+)\.([0-9]+)\.([0-9]+)$"
  if echo "$VERSION" | grep -Eq "$semver_regex"; then
    return 0
  else
    echo "[INSTALLATION_FAILED] VERSION ($VERSION) is not a valid semantic version in install.sh script"
    echo "? set VERSION to valid semantic semver version and try again"

    return 1
  fi
}

is_directory_writable() {
  # check installation directory is writable
  if [ ! -w "$(directory)" ]; then
    echo "[INSTALLATION_FAILED] the installation directory [$(directory)] is not writable by the current user"
    echo "? run as root [$(help_sudo_install_command "$0")] or choose a writable directory like your current directory [$(help_customize_directory_command "$0")]"

    return 1
  fi

  return 0
}

is_curl_installed() {
  local curl_path="$(which_curl)"

  if [ -z "$curl_path" ]; then
    echo "[INSTALLATION_FAILED] curl is required and is not installed"
    echo "? install curl [$(help_install_curl_command)] and try again"

    return 1
  fi

  return 0
}

is_os_supported() {
  local os="$(os)"

  case "$os" in
  linux) os="linux" ;;
  darwin) os="darwin" ;;
  *)
    echo "[INSTALLATION_FAILED] your operating system ${os} is currently unsupported"
    echo "? request support by opening an issue at [https://github.com/dotenvx/dotenvx-pro/issues]"

    return 1
    ;;
  esac

  return 0
}

is_arch_supported() {
  local arch="$(arch)"

  case "$arch" in
  x86_64) arch="x86_64" ;;
  amd64) arch="amd64" ;;
  arm64) arch="arm64" ;;
  aarch64) arch="aarch64" ;;
  *)
    echo "[INSTALLATION_FAILED] your architecture ${arch} is currently unsupported - must be x86_64, amd64, arm64, or aarch64"
    echo "? request support by opening an issue at [https://github.com/dotenvx/dotenvx-pro/issues]"

    return 1
    ;;
  esac

  return 0
}

# is_* checks ---------------------------
is_piped() {
  [ "$0" = "sh" ] || [ "$0" = "bash" ]
}

is_ci() {
  [ -n "$CI" ] && [ $CI != 0 ]
}

is_test_mode() {
  [ -n "$TEST_MODE" ] && [ $TEST_MODE != 0 ]
}

is_windows() {
  [ "$(os)" = "windows" ]
}

is_installed() {
  local flagged_version="$1"
  local current_version=$("$(directory)/$(binary_name)" --version 2>/dev/null || echo "0")

  # if --version flag passed
  if [ -n "$flagged_version" ]; then
    if [ "$current_version" = "$flagged_version" ]; then
      # return true since version already installed
      return 0
    else
      # return false since version not installed
      return 1
    fi
  fi

  # if no version flag passed
  if [ "$current_version" != "$VERSION" ]; then
    # return false since latest is not installed
    return 1
  fi

  echo "[dotenvx-pro@$current_version] already installed ($(directory)/$(binary_name))"

  # return true since version already installed
  return 0
}

# helpers -------------------------------
directory() {
  local dir=$DIRECTORY

  case "$dir" in
  ~*/*)
    dir="$HOME/${dir#\~/}"
    ;;
  ~*)
    dir="$HOME/${dir#\~}"
    ;;
  esac

  echo "${dir}"
  return 0
}

os() {
  echo "$(uname -s | tr '[:upper:]' '[:lower:]')"

  return 0
}

arch() {
  echo "$(uname -m | tr '[:upper:]' '[:lower:]')"

  return 0
}

os_arch() {
  echo "$(os)-$(arch)"

  return 0
}

filename() {
  echo "dotenvx-pro-$VERSION-$(os_arch).tar.gz"

  return 0
}

download_url() {
  echo "$REGISTRY_URL/@dotenvx/dotenvx-pro-$(os_arch)/-/dotenvx-pro-$(os_arch)-$VERSION.tgz"

  return 0
}

progress_bar() {
  if $(is_ci); then
    echo "--no-progress-meter"
  else
    echo "--progress-bar"
  fi

  return 0
}

binary_name() {
  if $(is_windows); then
    echo "dotenvx-pro.exe"
  else
    echo "dotenvx-pro"
  fi

  return 0
}

# which_* -------------------------------
which_curl() {
  local result
  result=$(command -v curl 2>/dev/null) # capture the output without displaying it on the screen

  echo "$result"

  return 0
}

which_path() {
  local result
  result=$(command -v dotenvx-pro 2>/dev/null) # capture the output without displaying it on the screen

  echo "$result"

  return 0
}

# warnings* -----------------------------
warn_of_any_conflict() {
  local dotenvx_path="$(which_path)"

  if [ "$dotenvx_path" != "" ] && [ "$dotenvx_path" != "$(directory)/$(binary_name)" ]; then
    echo "[DOTENVX_CONFLICT] conflicting dotenvx-pro found at $dotenvx_path" >&2
    echo "? we recommend updating your path to include $(directory)" >&2
  fi

  return 0
}

# help text -----------------------------
help_sudo_install_command() {
  if is_piped; then
    echo "curl -sfS $INSTALL_SCRIPT_URL | sudo $0"
  else
    echo "sudo $0"
  fi

  return 0
}

help_customize_directory_command() {
  if is_piped; then
    echo "curl -sfS \"$INSTALL_SCRIPT_URL?directory=.\" | $0"
  else
    echo "$0 --directory=."
  fi

  return 0
}

help_install_curl_command() {
  if command -v apt-get >/dev/null 2>&1; then
    echo "sudo apt-get update && sudo apt-get install -y curl"
  elif command -v yum >/dev/null 2>&1; then
    echo "sudo yum install -y curl"
  elif command -v brew >/dev/null 2>&1; then
    echo "brew install curl"
  elif command -v pkg >/dev/null 2>&1; then
    echo "sudo pkg install curl"
  else
    echo "install curl manually"
  fi

  return 0
}

# install/run ---------------------------
install() {
  # 0. override version
  VERSION="${1:-$VERSION}"

  # 1. setup tmpdir
  local tmpdir=$(command mktemp -d)
  local pipe="$tmpdir/pipe"
  mkfifo "$pipe"

  install_failed_cleanup() {
    echo "[INSTALLATION_FAILED] failed to download from registry [$(download_url)]"
    echo "? verify the download url and try downloading manually"
    rm -r "$tmpdir"
  }

  # Start curl in the background and redirect output to the pipe
  curl $(progress_bar) --fail -L --proto '=https' "$(download_url)" > "$pipe" &
  curl_pid=$!

  # Start tar in the background to read from the pipe
  sh -c "tar xz --directory $(directory) --strip-components=1 -f '$pipe' 'package/$(binary_name)'" &
  tar_pid=$!

  if ! wait $curl_pid || ! wait $tar_pid; then
    install_failed_cleanup
    return 1
  fi

  # 3. clean up
  rm -r "$tmpdir"

  # warn of any conflict
  warn_of_any_conflict

  # let user know
  echo "[dotenvx-pro@$VERSION] installed successfully ($(directory)/$(binary_name))"
  echo "now type: dotenvx-pro help"

  return 0
}

run() {
  # parse arguments
  for arg in "$@"; do
    case $arg in
    version=* | --version=*)
      VERSION="${arg#*=}"
      ;;
    directory=* | --directory=*)
      DIRECTORY="${arg#*=}"
      ;;
    help | --help)
      usage
      return 0
      ;;
    *)
      # Unknown option
      echo "Unknown option: $arg"
      usage
      return 1
      ;;
    esac
  done

  # machine checks
  is_version_valid
  is_directory_writable
  is_curl_installed
  is_os_supported
  is_arch_supported

  # install logic
  if [ -n "$VERSION" ]; then
    # Check if the specified version is already installed
    if is_installed "$VERSION"; then
      echo "[dotenvx-pro@$VERSION] already installed ($(directory)/$(binary_name))"

      return 0
    else
      install "$VERSION"
    fi
  else
    if is_installed; then
      echo "[dotenvx-pro@$VERSION] already installed ($(directory)/$(binary_name))"

      return 0
    else
      install
    fi
  fi
}

if ! is_test_mode; then
  run "$@"
  exit $?
fi

# "thanks for using dotenvx pro!" - mot
