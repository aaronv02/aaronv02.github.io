# Built with AI — portfolio site

A single-page, dependency-free portfolio of software shipped with AI.
Pure HTML/CSS/JS — no build step, no framework. Open `index.html` or drop the
folder on any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages).

## Run locally

```bash
cd ~/website && python3 -m http.server 4600
```

Then open http://localhost:4600.

## Add a new project (2 minutes)

Everything renders from [`js/data.js`](js/data.js). Append one object to the
`PROJECTS` array:

```js
{
  id: "my-new-thing",              // unique slug (anchor + spine nav)
  name: "My New Thing",
  domain: "What category it is",   // small label next to the number
  headline: "One big statement.",
  description: "Two or three sentences about it.",
  features: ["Short bullet", "Short bullet", "Short bullet"],
  tags: ["AI", "Whatever"],
  accent: "#f472b6",               // the page tints to this color on scroll
  brand: { src: "assets/brand/my-logo.png", bg: "light" }, // real logo…
  // logo: "inboxpilot",           // …or a key into LOGOS for a drawn mark
  mock: "generic",                 // or a custom key in MOCKS (js/main.js)
  image: null,                     // optional screenshot path — replaces mock
  link: "https://example.com",     // omit/null → "private build" badge
  status: "Live",
}
```

Notes:

- `brand.bg: "light"` gives the logo tile a white background (for logos
  exported on white). Use `"none"` for transparent/dark logos.
- `accent` drives the whole chapter: glows, tags, mock UI, big number.
- Real screenshots beat mocks: set `image: "assets/shots/my-thing.png"`.

## Where things live

| Path | What |
| --- | --- |
| `index.html` | page skeleton + hero/process/contact copy |
| `js/data.js` | site config, project list, drawn logo marks |
| `js/main.js` | rendering + all interaction (canvas, cursor, scroll) |
| `css/style.css` | the whole design system |
| `assets/brand/` | real project logos |

## Behavior notes

- Honors `prefers-reduced-motion` (kills canvas, cursor, and animations).
- Custom cursor and tilt only activate on fine pointers (mouse/trackpad).
- The left spine nav appears at widths ≥ 1100px.
