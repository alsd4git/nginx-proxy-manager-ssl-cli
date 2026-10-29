# README demo

The terminal preview in the README is captured from the real CLI, not manually
transcribed. The generator replaces `global.fetch` with two local API fixtures
for token creation and proxy-host listing. Any other URL fails immediately, so
the demo cannot contact an Nginx Proxy Manager instance. Credentials and host
data are synthetic, and the CLI runs with `dryRun: true`.

From the repository root, run:

```sh
npm ci
node scripts/demo.js
```

This rewrites `assets/dry-run-example.svg`. Review the generated file along with
the script whenever CLI output changes. The script is included in the package
file list for reproducibility; it does not run during install or release.
