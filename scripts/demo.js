#!/usr/bin/env node
const { writeFile } = require("node:fs/promises");
const path = require("node:path");
const { argv } = require("node:process");
const { run } = require("../update_ssl");

const host = "https://npm-demo.invalid";
const fixtures = new Map([
  [`${host}/api/tokens`, { token: "synthetic-demo-token" }],
  [
    `${host}/api/nginx/proxy-hosts`,
    [
      {
        id: 1,
        domain_names: ["app.example.test"],
        forward_scheme: "http",
        forward_host: "app",
        forward_port: 3000,
        ssl_forced: false,
        http2_support: false,
        hsts_enabled: false,
        hsts_subdomains: false,
        block_exploits: false,
        caching_enabled: false,
        allow_websocket_upgrade: false,
      },
    ],
  ],
]);

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  })[character]);
}

function renderSvg(output) {
  const lines = output.split("\n");
  const lineHeight = 24;
  const width = Math.max(760, ...lines.map((line) => line.length * 9 + 64));
  const height = 86 + lines.length * lineHeight + 48;
  const renderedLines = lines.map((line, index) =>
    `<text x="28" y="${80 + index * lineHeight}" fill="${line.startsWith("   Dry-run") ? "#fbbf24" : "#e5e7eb"}">${escapeXml(line || " ")}</text>`,
  ).join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">npm-ssl-updater dry-run output</title>
  <desc id="desc">Actual CLI output captured with synthetic local Nginx Proxy Manager API fixtures. No network requests are made and no changes are applied.</desc>
  <rect width="100%" height="100%" rx="12" fill="#111827"/>
  <rect width="100%" height="42" rx="12" fill="#1f2937"/>
  <circle cx="22" cy="21" r="6" fill="#f87171"/><circle cx="44" cy="21" r="6" fill="#fbbf24"/><circle cx="66" cy="21" r="6" fill="#34d399"/>
  <text x="${width / 2}" y="26" fill="#d1d5db" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" text-anchor="middle">npm-ssl-updater --block-exploits --enable-websockets --dry-run</text>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="14" xml:space="preserve">
    ${renderedLines}
  </g>
  <text x="28" y="${height - 20}" fill="#9ca3af" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12">Synthetic fixture data · captured from actual CLI · no network access</text>
</svg>
`;
}

async function main() {
  const captured = [];
  const originalFetch = global.fetch;
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalArgvLength = argv.length;

  global.fetch = async (url, init = {}) => {
    const fixture = fixtures.get(String(url));
    if (!fixture) {
      throw new Error(`Unexpected request in offline demo: ${url}`);
    }

    if (String(url).endsWith("/api/tokens") && init.method !== "POST") {
      throw new Error("Unexpected method for token fixture.");
    }
    if (String(url).endsWith("/api/nginx/proxy-hosts") && init.method !== "GET") {
      throw new Error("Unexpected method for proxy-host fixture.");
    }

    return {
      ok: true,
      status: 200,
      statusText: "OK",
      async text() {
        return JSON.stringify(fixture);
      },
    };
  };
  console.log = (...values) => captured.push(values.join(" "));
  console.warn = (...values) => captured.push(values.join(" "));
  argv.push("--dry-run");

  try {
    await run(
      {
        host,
        email: "demo@example.test",
        password: "synthetic-only",
        blockExploits: true,
        enableWebsockets: true,
        dryRun: true,
      },
      {
        NPM_HOST: host,
        NPM_EMAIL: "demo@example.test",
        NPM_PASSWORD: "synthetic-only",
      },
    );
    const output = captured.join("\n");
    if (!output.includes("Dry-run mode: no changes applied.")) {
      throw new Error(`The actual CLI did not produce the expected dry-run output. Captured: ${output || "<empty>"}`);
    }

    const destination = path.join(__dirname, "..", "assets", "dry-run-example.svg");
    await writeFile(destination, renderSvg(output));
    process.stdout.write(`Generated ${path.relative(process.cwd(), destination)} from actual CLI output.\n`);
  } finally {
    global.fetch = originalFetch;
    console.log = originalLog;
    console.warn = originalWarn;
    argv.length = originalArgvLength;
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
