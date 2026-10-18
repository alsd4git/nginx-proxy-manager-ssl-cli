# Nginx Proxy Manager SSL CLI

[English](README.md) | Italiano

[![CI](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/actions/workflows/tests.yml/badge.svg)](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/actions/workflows/tests.yml)
[![Latest release](https://img.shields.io/github/v/release/alsd4git/nginx-proxy-manager-ssl-cli)](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

Controlla e aggiorna le impostazioni di sicurezza dei proxy host di
[Nginx Proxy Manager](https://github.com/NginxProxyManager/nginx-proxy-manager).
Il pacchetto e il comando mantengono il nome storico `npm-ssl-updater`.

## Requisiti

- Node.js 20 o successivo
- un'istanza Nginx Proxy Manager raggiungibile
- credenziali da amministratore di Nginx Proxy Manager

## Installazione

Esegui direttamente una versione taggata da GitHub, senza clonare la repository:

```bash
npx -y github:alsd4git/nginx-proxy-manager-ssl-cli#v1.0.0 --help
```

Oppure installa globalmente la stessa versione:

```bash
npm install -g github:alsd4git/nginx-proxy-manager-ssl-cli#v1.0.0
npm-ssl-updater --help
```

Le GitHub Release contengono anche il tarball esatto prodotto da `npm pack`,
utile se vuoi installare direttamente l'artefatto pubblicato:

```bash
npm install -g https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/releases/download/v1.0.0/npm-ssl-updater-1.0.0.tgz
```

Gli esempi sono intenzionalmente bloccati a un tag. Sostituisci `v1.0.0` con la
versione desiderata invece di affidarti al branch di default corrente.

Per lo sviluppo da checkout:

```bash
git clone https://github.com/alsd4git/nginx-proxy-manager-ssl-cli.git
cd nginx-proxy-manager-ssl-cli
npm ci
npm start -- --help
```

## Credenziali

Crea `.env` nella directory da cui esegui il comando:

```dotenv
NPM_HOST=http://localhost:81
NPM_EMAIL=admin@example.com
NPM_PASSWORD=change-me
```

I flag hanno la precedenza sulle variabili d'ambiente. Preferisci `.env` o
`--password-stdin` a `--password`, perché gli argomenti possono comparire nella
cronologia della shell e nella lista dei processi.

```bash
printf '%s\n' "$NPM_PASSWORD" | npm-ssl-updater \
  --host http://localhost:81 \
  --email admin@example.com \
  --password-stdin \
  --dry-run
```

`--password-stdin` legge una sola password terminata da newline. Non apre un
prompt interattivo per la password.

Non committare `.env` e non copiare credenziali in log, issue o screenshot.

## Operazioni comuni

Elenca i proxy host senza modificarli:

```bash
npm-ssl-updater
```

Mostra le modifiche proposte:

```bash
npm-ssl-updater --block-exploits --enable-websockets --dry-run
```

Applica tutte le modifiche senza prompt interattivi:

```bash
npm-ssl-updater --block-exploits --enable-websockets --yes
```

Per controllare ogni modifica in modo interattivo, salva le credenziali in
`.env` ed esegui:

```bash
npm-ssl-updater \
  --hsts-subdomains \
  --cache-assets \
  --block-exploits \
  --enable-websockets \
  --request-timeout 15000
```

La conferma interattiva richiede un terminale. Un comando che usa
`--password-stdin` deve includere anche `--yes` oppure `--dry-run`, perché lo
stdin collegato a una pipe non è un TTY:

```bash
printf '%s\n' "$NPM_PASSWORD" | npm-ssl-updater \
  --host http://localhost:81 \
  --email admin@example.com \
  --password-stdin \
  --block-exploits \
  --enable-websockets \
  --yes
```

Le opzioni coprono Force SSL, HTTP/2, HSTS, sottodomini HSTS, cache degli asset,
blocco degli exploit comuni e WebSocket. Esegui `npm-ssl-updater --help` per
l'elenco completo dei flag e degli alias.

`npm-ssl-updater --print-advanced` stampa soltanto l'`advanced_config` corrente
di ogni host. Nella stessa esecuzione non controlla e non aggiorna i campi di
sicurezza.

## Certificati e access list

```bash
npm-ssl-updater --list-certificates
npm-ssl-updater --list-access-lists
```

Questi comandi non modificano Nginx Proxy Manager. Servono a recuperare ID e
nomi da usare nelle automazioni.

## Creare o aggiornare un proxy host

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

L'helper cerca un certificato esatto o wildcard, a meno che
`--proxy-certificate-id` non ne forzi uno. Rimuovi `--proxy-dry-run` solo dopo
aver controllato l'operazione proposta.

## Aggiornare una configurazione avanzata

```bash
npm-ssl-updater \
  --advanced-config-host-id 36 \
  --advanced-config-file ./media/NPM-extraconf.conf \
  --advanced-config-dry-run
```

Questo percorso invia un payload minimo per un solo host e non ritrasmette i
campi del proxy che non devono cambiare.

## Eccezione block-exploits

Il tool lascia `block_exploits` disattivato per gli host Tinyauth, perché questa
opzione può rompere forwarded host e query parameter usati da Tinyauth. Gli
altri host seguono l'impostazione richiesta.

## Esempio di output

```text
Proxy: example.duckdns.org
 - ssl_forced               no -> yes
 - http2_support            no -> yes
 - allow_websocket_upgrade  no -> yes
Apply changes? ([y]es / [n]o / [a]ll): y
   Change applied.

Completed. Updated 1 host(s).
```

Questo è il formato stampato dallo script, che non traduce i messaggi. Vengono
elencati solo i campi il cui valore cambierebbe; quelli già conformi sono
omessi. Un host completamente conforme viene indicato con
`Already compliant: example.duckdns.org`. Con `--dry-run`, il prompt e il
messaggio di aggiornamento vengono sostituiti da
`Dry-run mode: no changes applied.`

## Sviluppo

```bash
npm ci
npm test
npm pack --dry-run
```

La CI esegue i test sulle linee Node.js supportate. Le release allegano il
tarball npm a GitHub e non lo pubblicano nel registry npm.

Vedi [CHANGELOG.md](CHANGELOG.md) e le
[release GitHub](https://github.com/alsd4git/nginx-proxy-manager-ssl-cli/releases).

## Licenza

MIT. Vedi [LICENSE](LICENSE).
