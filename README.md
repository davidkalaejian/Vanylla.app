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

Every download button is Apple's official "Download on the App Store" badge (`assets/img/app-store-badge.svg`,
the black badge from Apple's marketing resources), used unmodified: no recolouring or effects, at least 40 px
tall (40 px in the nav, 52 px elsewhere) and with clear space of a quarter of its height around it. The URL lives
in one place: `APP_STORE_URL` at the top of `assets/js/site.js`. Set it to the listing's full
`https://apps.apple.com/...` URL and every badge on every page links there. While it is empty (the current
value) the badges point to the landing page's download section.

## Pages

| Page | State |
|---|---|
| `index.html` | The landing page. |
| `support.html` | Placeholder until its content is published. |
| `privacy.html` | Placeholder until its content is published. |
| `terms.html` | Placeholder until its content is published. |
| `404.html` | GitHub Pages' not-found page. It sets a `<base>` at run time so its links work at any depth. |

All links and asset paths are relative, so the site works under `https://<user>.github.io/Vanylla.app/` and
on a custom domain alike. The exceptions are in `index.html`'s head: `og:url`, `og:image`, `twitter:image` and
`<link rel="canonical">` are absolute (`https://davidkalaejian.github.io/Vanylla.app/`), as link previews need;
change them if the site moves to a custom domain.

## Assets

- `assets/img/screens/`: real app screenshots (iPhone 16, light mode), JPEG, at 599 × 1300 and at full width
  (`*-1179.jpg`, 1179 × 2556), chosen by `srcset`. `duo-library*.jpg` is the Library on the cover display of a
  folded iPhone Duo (1398 × 2034, and 699 × 1017), drawn in the hero inside a CSS Duo frame.
- `assets/img/looks/`: real renders of the app's filters (Shore, Sundown, Harbor, Lagoon, Noir, Sepia) on
  three photos, used by the filter demo and the Recipe demo; `thumb-<photo>-<look>.jpg` are 160 px squares of
  them for the filter strip.
- `assets/img/packs/`: one thumbnail per filter pack, all of the convertible photo. Coastal and Mono are crops
  of the app's own renders; Chrome (Portre), Vivid (Summit), Sunlit (Saffron) and Cinema (Marquee) were made
  with ffmpeg's `lut3d` from the app's `.cube` files (sRGB in, sRGB out, per `house-luts.json`), e.g.
  `ffmpeg -i conv-original.jpg -vf "lut3d=file=HouseLUTs/ROYALS__1.P1066595.cube,crop=776:776:0:150,scale=160:160" chrome.jpg`.
- `assets/img/recipes/`: the house Recipes, rendered by the app's engine. The ingredient lists in
  `site.js` (`HOUSE`) come from the app's own Recipe files.
- `assets/img/photos/`, `assets/video/`: photos and clips for the collage demo, the final call to action, the
  video section and the privacy band.
- `assets/fonts/`: Latin subsets (WOFF) of the variable fonts, under the SIL Open Font License (licence
  texts beside them). They were made from the full TTFs with fontTools:
  `python3 -m fontTools.subset <Font>.ttf --unicodes="U+0000-00FF,U+0100-017F,U+0131,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2190-2199,U+2212,U+2215,U+2248,U+2260,U+2264-2265,U+25CF,U+2713" --layout-features='*' --flavor=woff --output-file=<Font>.woff`
- `assets/og.jpg`: the 1200 × 630 social preview image.

## Motion and accessibility

Sections arrive with a glassy blur-in; the hero, washes and floating cards move with scroll; the edges of the
window are frosted. With `prefers-reduced-motion: reduce`, content is shown at once with no blur, parallax,
drifting or autoplaying video. With `prefers-reduced-transparency: reduce`, glass turns opaque. If the
script fails to load, everything is shown after three seconds.

## Releasing a change

GitHub Pages lets browsers cache files for 10 minutes. The pages load `assets/css/site.css?v=N` and `assets/js/site.js?v=N`; bump `N` on every page whenever the stylesheet or script changes, so a visitor never gets a new page with an old stylesheet.
