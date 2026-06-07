# Clover Tower Website

Static HTML website for Clover Tower clinics, doctors, services, and contact pages.

## Card Data Workflow

Doctor and clinic card data is maintained in these component files:

- `assets/components/doctor-cards.html`
- `assets/components/clinic-cards.html`

The directory pages are generated from those components:

- `doctors.html`
- `clinics.html`

After editing either card component file, regenerate the directory pages:

```bash
node generate-card-pages.js
```

If Node is not available in WSL but is installed on Windows, this project has also been tested with:

```bash
"/mnt/c/Program Files/nodejs/node.exe" generate-card-pages.js
```

The generator ignores commented-out cards, keeps placeholder doctor images, sorts cards with real images before placeholder cards, and writes the output between the `GENERATED` comments in `doctors.html` and `clinics.html`.

Do not manually edit the generated card sections in `doctors.html` or `clinics.html`; those sections will be overwritten the next time the generator runs.

## Homepage Cards

`index.html` still uses `assets/js/card-loader.js` because the homepage featured doctor and clinic cards are intentionally loaded dynamically and shuffled.

## Site Shell

Shared navbar, footer, and AOS initialization are loaded through:

- `assets/js/site-shell.js`

## Visual QA

Playwright is installed for local responsive layout checks. Start a static server first:

```bash
python3 -m http.server 4173
```

Then run the desktop/tablet/mobile audit:

```bash
cmd.exe /c npm run audit:visual
```

The audit writes screenshots and a JSON report to `audit-screenshots/`, which is ignored by git.
