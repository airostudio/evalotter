# Evalotter

A simple static website that displays all of our tests as a searchable, filterable grid.

## Running locally

No build step required. Serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open http://localhost:8000

## Adding a new test

Open `data/tests.json` and add a new entry to the array:

```json
{
  "id": "unique-id",
  "name": "Test Name",
  "category": "Category Name",
  "description": "One or two sentence summary of what the test measures.",
  "color": "#6366f1"
}
```

- `id` — a unique, URL-friendly identifier.
- `category` — tests sharing a category are grouped by the filter buttons.
- `color` — hex color used for the card's accent dot (optional, defaults to indigo).

No code changes or rebuilds are needed — the page reads `data/tests.json` at load time.

## Deploying

This is a static site (`index.html` + `assets/` + `data/`), so it can be deployed as-is to
GitHub Pages, Vercel, Netlify, or any static host with no build configuration.
