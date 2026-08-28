# Nginx Proxy Manager SSL CLI

English | [Italiano](README.it.md)

[![CI](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/actions/workflows/tests.yml/badge.svg)](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/actions/workflows/tests.yml)
[![Latest release](https://img.shields.io/github/v/release/alsd4git/nginx-proxy-manager-ssl-cli)](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

Inspect and update security settings for proxy hosts in
[Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager).
The package and executable retain the historical name `npm-ssl-updater`.

## Requirements

- Node.js 20 or newer
- a reachable Nginx Proxy Manager instance
- Nginx Proxy Manager administrator credentials

## Installation

```bash
git clone https://github.com/alsd4git/nginx-proxy-manager-ssl-cli.git
cd nginx-proxy-manager-ssl-cli
npm ci
```

Run from the checkout with `npm start --`, or install the command globally:

```bash
npm install -g .
npm-ssl-updater --help
```

## Credentials

Create `.env` in the directory where you run the command:

```dotenv
NPM_HOST=http://localhost:81
NPM_EMAIL=admin@example.com
NPM_PASSWORD=change-me
```

Command-line flags override environment variables. Prefer `.env` or
`--password-stdin` over `--password`, because process arguments may appear in
shell history and process listings.

```bash
printf '%s\n' "$NPM_PASSWORD" | npm-ssl-updater \
  --host http://localhost:81 \
  --email admin@example.com \
  --password-stdin \
  --dry-run
```

`--password-stdin` reads exactly one newline-terminated password. It does not
open an interactive password prompt.

Never commit `.env` or paste credentials into logs, issues, or screenshots.

## Common operations

List proxy hosts without changing them:

```bash
npm-ssl-updater
```

Preview proposed changes:

```bash
npm-ssl-updater --block-exploits --enable-websockets --dry-run
```

Apply every proposed change without interactive prompts:

```bash
npm-ssl-updater --block-exploits --enable-websockets --yes
```

For an interactive review, store the credentials in `.env` and run:

```bash
npm-ssl-updater \
  --hsts-subdomains \
  --cache-assets \
  --block-exploits \
  --enable-websockets \
  --request-timeout 15000
```

Interactive confirmation requires a terminal. A command using
`--password-stdin` must also use `--yes` or `--dry-run`, because piped stdin is
not a TTY:

```bash
printf '%s\n' "$NPM_PASSWORD" | npm-ssl-updater \
  --host http://localhost:81 \
  --email admin@example.com \
  --password-stdin \
  --block-exploits \
  --enable-websockets \
  --yes
```

The security switches include Force SSL, HTTP/2, HSTS, HSTS subdomains, asset
caching, common-exploit blocking, and WebSocket support. Run
`npm-ssl-updater --help` for the complete option list and aliases.

`npm-ssl-updater --print-advanced` only prints each host's current
`advanced_config`. It does not assess or update the security fields in that
run.

## Certificates and access lists

```bash
npm-ssl-updater --list-certificates
npm-ssl-updater --list-access-lists
```

These commands are read-only and help locate IDs or named access lists for
automation.

## Create or update a proxy host

```bash
npm-ssl-updater \
  --upsert-proxy-host \
  --proxy-domain app.example.com \
  --proxy-forward-host app \
  --proxy-forward-port 3000 \
  --proxy-access-list-name local-only \
  --proxy-advanced-config-file ./media/NPM-extraconf.conf \
  --proxy-dry-run
```

The helper looks up a matching exact or wildcard certificate unless
`--proxy-certificate-id` overrides it. Remove `--proxy-dry-run` only after
reviewing the generated operation.

## Update one advanced configuration

```bash
npm-ssl-updater \
  --advanced-config-host-id 36 \
  --advanced-config-file ./media/NPM-extraconf.conf \
  --advanced-config-dry-run
```

This path sends a minimal payload for one host. It avoids resending unrelated
proxy fields when only `advanced_config` must change.

## Block-exploits exception

The tool leaves `block_exploits` disabled for Tinyauth hosts because that option
can break the forwarded host and query parameters used by Tinyauth. Other hosts
follow the requested setting.

## Example output

```text
Proxy: example.duckdns.org
 - ssl_forced               no -> yes
 - http2_support            no -> yes
 - allow_websocket_upgrade  no -> yes
Apply changes? ([y]es / [n]o / [a]ll): y
   Change applied.

Completed. Updated 1 host(s).
```

This is the format printed by the script. It lists only fields whose values
would change. Fields that already match the requested state are omitted. A
fully compliant host is reported as `Already compliant: example.duckdns.org`.
With `--dry-run`, the prompt and update message are replaced by
`Dry-run mode: no changes applied.`

## Development

```bash
npm ci
npm test
npm pack --dry-run
```

CI runs the test suite on current supported Node.js release lines. Releases
attach the packed npm tarball to GitHub and do not publish it to the npm
registry.

See [CHANGELOG.md](CHANGELOG.md) and
[GitHub releases](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/releases).

## License

MIT. See [LICENSE](LICENSE).
