# EEGMeanFlow project page

A static research project page with an interactive EEG sample explorer and the authors' original method diagrams.

## Open locally

Open `index.html` in a browser. Keep the `assets` folder beside it. The recorded samples are bundled in a JavaScript data file, so the explorer does not require a server or a JSON fetch to work.

For an HTTP preview, run:

```sh
python -m http.server 8080
```

Then visit `http://localhost:8080`. No build or package installation is required. Google Fonts are optional; system fonts are used when offline.

## Contents

- `index.html`: page content, original diagram links, and GitHub links.
- `style.css`: responsive layout, signal studio, and motion styles.
- `app.js`: sample validation, playback, condition selection, downloads, and diagram viewer.
- `assets/samples.js`: portable sample-bank wrapper.
- `assets/samples.json`: the same data as plain JSON and an HTTP fallback.
- `assets/{process,backbone,loss}.{pdf,png}`: original diagrams and previews.

## Sample provenance

The explorer uses 27 existing EEGMeanFlow outputs: the first three stored samples from each of the nine FACED classes. Each original output has 32 channels and 2,000 time points at 200 Hz. The browser shows the first six stored channels, subsampled to 100 Hz, for ten seconds. Channels use generic storage-order labels. No human EEG records are distributed here.

Animation replays recorded generated signals; it does not perform neural-network inference in the browser. The samples are illustrative and are not paired reconstructions of individual real trials. The display scale is computed per sample; exported data retain their original microvolt values. The hero wave is decorative artwork, separate from the recorded sample explorer.

## Hosting

Upload the contents of `` to a static host, including GitHub Pages. Relative asset paths support deployment under a repository subpath. All Code buttons point to https://github.com/yunyunfanfan/EEGMeanFlow.

