# Vanylla website

The marketing site for Vanylla, the photo and video editor for iPhone. It is a static site for GitHub Pages:
plain HTML, one stylesheet and one script, with no build step, no frameworks, no third-party requests, no
analytics and no cookies. It uses the app's light-mode design: the cream shell, white glass, the terracotta
accent for primary actions, and Bricolage Grotesque with Archivo.

## Preview locally

```sh
cd Vanylla.app
python3 -m http.server 8765
```

Then open <http://localhost:8765/>.

## Setting the App Store link

The App Store URL lives in one place: `APP_STORE_URL` at the top of `assets/js/site.js`.

- Empty (`""`, the current value): every download button reads "Coming soon to the App Store" and points to
  the download section of the landing page.
- Set to the listing's full `https://apps.apple.com/...` URL: every button on every page reads
  "Download on the App Store" and links there.

## Pages

| Page | State |
|---|---|
| `index.html` | The landing page. |
| `support.html` | Placeholder until tickets T-140 to T-145 fill it. |
| `privacy.html` | Placeholder until tickets T-140 to T-145 fill it. |
| `terms.html` | Placeholder until tickets T-140 to T-145 fill it. |
| `404.html` | GitHub Pages' not-found page. It sets a `<base>` at run time so its links work at any depth. |

All links and asset paths are relative, so the site works under `https://<user>.github.io/Vanylla.app/` and
on a custom domain alike.

## Assets

- `assets/img/screens/`: real app screenshots (iPhone 16, light mode), JPEG, 599 × 1300.
- `assets/img/looks/`: real renders of the app's filters (Shore, Sundown, Harbor, Lagoon, Noir, Sepia) on
  three photos, used by the filter demo and the Recipe demo.
- `assets/img/recipes/`: the eight house Recipes, rendered by the app's engine. The ingredient lists in
  `site.js` (`HOUSE`) come from the app's own Recipe files.
- `assets/img/photos/`, `assets/video/`: photos and clips for the collage demo, the video section and the
  privacy band.
- `assets/fonts/`: Latin subsets (WOFF) of the variable fonts, under the SIL Open Font License (licence
  texts beside them). They were made from the full TTFs with fontTools:
  `python3 -m fontTools.subset <Font>.ttf --unicodes="U+0000-00FF,U+0100-017F,U+0131,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+25CF,U+2713" --layout-features='*' --flavor=woff --output-file=<Font>.woff`
- `assets/og.jpg`: the 1200 × 630 social preview image.

## Motion and accessibility

Sections arrive with a glassy blur-in; the hero, washes and floating cards move with scroll; the edges of the
window are frosted. With `prefers-reduced-motion: reduce`, content is shown at once with no blur, parallax,
drifting or autoplaying video. With `prefers-reduced-transparency: reduce`, glass turns opaque. If the
script fails to load, everything is shown after three seconds.
