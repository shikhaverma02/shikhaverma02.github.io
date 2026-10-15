# Shikha — Portfolio

Static portfolio site for Shikha, Furniture & Product Designer. No build step: plain HTML, CSS and JS.

```
index.html                    page content
styles.css                    styles (light + dark theme)
script.js                     theme toggle, mobile menu, lightbox, PDF preview
Shikha-Portfolio.pdf          full portfolio (compressed from the original InDesign export)
images/                       full-size images (opened in the lightbox)
images/thumbs/                smaller versions shown in the galleries
```

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy on GitHub Pages

Hosted from the GitHub account `shikhaverma02` as a user site:
**https://shikhaverma02.github.io/**

- Repo: `shikhaverma02/shikhaverma02.github.io` (public)
- Settings → Pages: Source = *Deploy from a branch*, Branch = `main` / `(root)`
- To update the site, commit and push to `main`; GitHub redeploys within a minute or two.

## Editing

- Text lives directly in `index.html`.
- To add a gallery image, put the full-size file in `images/` and a ~800px copy with the same name in `images/thumbs/`, then copy an existing `<figure class="g-item">` block.
