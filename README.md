<p align="center">
  <img src="public/logo.svg" alt="PhotoWizard logo" width="96" height="96" />
</p>

<h1 align="center">PhotoWizard</h1>

<p align="center">
  A free, private photo editor that runs entirely in your browser.<br />
  Бесплатный приватный фоторедактор, который работает целиком в браузере.
</p>

<p align="center">
  <a href="https://github.com/PsyGioX/webphoto-wizardry/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/PsyGioX/webphoto-wizardry/actions/workflows/ci.yml/badge.svg" /></a>
</p>

## Features

- **Private**: photos are processed on the device with the Canvas API. Nothing is uploaded.
- **Crop** freely or with 1:1, 4:3, 3:2, 16:9, 3:4 and 9:16 presets. Mouse, touch and keyboard (arrow keys) supported.
- **Rotate and flip** in 90° steps, **resize** to exact pixels or by percentage.
- **Remove plain backgrounds** with an adjustable tolerance (colour-key flood fill, see [Limitations](#limitations)).
- **Adjust** brightness, contrast, saturation and hue, or pick one of nine filters. Edits are non-destructive until you crop, resize or remove the background.
- **Undo / redo** (`Ctrl+Z`, `Ctrl+Shift+Z`), hold-to-compare with the original.
- **Export** to PNG, JPEG or WebP with quality control.
- Drag and drop, paste from clipboard (`Ctrl+V`), light and dark themes, English and Russian UI, responsive down to small phones.
- **Hardened**: strict Content-Security-Policy, input limits, sanitised file names, audited dependencies (see [SECURITY.md](SECURITY.md)).
- SEO-ready: meta and Open Graph tags, JSON-LD (`WebApplication`, `FAQPage`), sitemap and robots generated at build time.

## Getting started

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev        # http://localhost:8080
```

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                     |
| `npm run build`     | Typecheck and build to `dist/`                |
| `npm run preview`   | Serve the production build locally            |
| `npm run lint`      | Run ESLint                                    |
| `npm run typecheck` | Run TypeScript without emitting files         |
| `npm test`          | Run unit tests (Vitest)                       |
| `npm run copyright` | Add or refresh the copyright header in sources |

## Deploying

The project is a static Vite app and deploys to Vercel, Netlify or any static host.

Set your public URL **before building**, because it is used for the canonical link, Open Graph tags, `sitemap.xml` and `robots.txt`:

```bash
# .env (or an environment variable in your hosting dashboard)
VITE_SITE_URL=https://your-domain.example
```

`vercel.json` already sets security headers and long-term caching for hashed assets.

## Project structure

```
src/
  components/   UI (Landing, EditorWorkspace, ToolPanel, CropOverlay, dialogs, ...)
  hooks/        useImageEditor (state + undo history), useFileIntake (drop / paste)
  i18n/         English and Russian strings, language provider
  lib/          Canvas operations, filters, crop maths, background removal
public/         Logo, favicons, web manifest, Open Graph image
brand/          Logo sources (maskable / Apple icon SVGs, 1024px PNG)
```

## Limitations

- Background removal is a colour-key method. It is quick and private, and works best on plain or studio backgrounds. It is not an AI cut-out, so busy scenes will need a dedicated tool.
- Photos above 16 megapixels are scaled down on open, which keeps mobile browsers stable.
- Safari has no canvas `filter` support, so export uses an equivalent pixel pipeline there.

## Security

- `npm audit` reports **0 known vulnerabilities** (audited 22 October 2026). The build stack is Vite 8, Vitest 5, Tailwind CSS 4 and ESLint 10.
- CI runs `npm ci --ignore-scripts`, `npm audit`, lint, tests and a build. [CodeQL](.github/workflows/codeql.yml) and [dependency review](.github/workflows/dependency-review.yml) run on pull requests. All GitHub Actions are pinned to commit SHAs.
- `vercel.json` ships a strict CSP (no inline scripts, no third-party hosts), HSTS, COOP and a locked-down Permissions-Policy.
- Report vulnerabilities privately, see [SECURITY.md](SECURITY.md).

## Dependency updates

[Dependabot](.github/dependabot.yml) opens weekly pull requests for npm packages (grouped by React, Radix UI, fonts and tooling) and monthly ones for GitHub Actions. A short release cooldown gives the community time to spot compromised versions; security updates skip the cooldown. The [CI workflow](.github/workflows/ci.yml) runs lint, tests and a build on every pull request.

---

© 2026 [PsyGioX](https://github.com/PsyGioX). All rights reserved.
