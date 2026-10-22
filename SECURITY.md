# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Report them privately through GitHub:
[Report a vulnerability](https://github.com/PsyGioX/webphoto-wizardry/security/advisories/new).

Include what you found, steps to reproduce it and the affected version or commit. You can expect a first reply within a few days.

## Supported versions

Only the latest commit on `main` (the deployed version) receives security fixes.

## Security design

- **No backend, no uploads.** Images are decoded and edited in the browser with the Canvas API and never leave the device.
- **Strict Content-Security-Policy** (see `vercel.json`): scripts and fonts are same-origin only, no inline scripts, no third-party requests, framing is blocked.
- **Self-hosted fonts and assets**, so no third party can observe visitors.
- **Input limits**: files above 80 MB or about 190 megapixels are rejected, working images are capped at 16 megapixels, output sides at 16,384 px.
- **Safe output**: exported file names are sanitised and exports are created locally as Blobs.
- **Supply chain**: a committed lockfile, `npm ci --ignore-scripts` in CI, `npm audit` as a CI gate, CodeQL, dependency review on pull requests, GitHub Actions pinned to commit SHAs, and Dependabot with a release cooldown.

## Dependency audit

Last full audit: **22 October 2026**. `npm audit` reports **0 known vulnerabilities** (production and development dependencies).
