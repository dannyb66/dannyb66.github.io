# Danny Basavaraju's portfolio

Static HTML, CSS, and JavaScript published at https://dannyb66.github.io/ through GitHub Pages.

## Download CV visibility

Set the boolean `downloadCv` in [`site-config.js`](site-config.js):

- `false` (current): hide the header's Download CV link, including its layout space and keyboard focus target.
- `true`: restore the existing PDF download link.

Commit the change and deploy through the repository's normal GitHub Pages workflow. No HTML edits or PDF re-upload are needed. The setting is public and applies to the deployed site, not an individual visitor.

The link starts hidden and is shown only for the literal boolean `true`. It stays hidden if JavaScript is disabled or the config fails to load. Hiding the link does **not** restrict access to `assets/Danny-Basavaraju-CV.pdf`; the existing PDF remains public.

## Local check

Run the dependency-free regression checks with `node --test tests/site-config.test.cjs`.

Serve the repository with a static server, for example `python3 -m http.server 8000`, and open http://localhost:8000/. Check both flag values at desktop and mobile widths, then leave `downloadCv: false` before committing.
