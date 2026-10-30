# summanen.org – nettisivut

Oskari Summasen henkilö- ja yrityssivu. Julkaistaan GitHub Pagesilla: https://suomainen.github.io/summanen.org/

## Rakenne

```
index.html            sivun sisältö
css/
  fonts.css           @font-face-määrittelyt
  style.css           sivun tyylit
js/
  main.js             3D-metsä, vieritysanimaatiot, valikko ja kopiointinapit
  vendor/             kolmannen osapuolen kirjastot (ei muokata)
fonts/                fonttitiedostot (woff2)
img/                  logot ja henkilökuvat
```

Sivu ei lataa mitään ulkopuolisilta palvelimilta: kirjastot ja fontit ovat repositoriossa.

## Paikallinen esikatselu

Avaa `index.html` selaimessa tai käynnistä kansiossa kevyt palvelin, esim. `python -m http.server`, ja avaa http://localhost:8000.

## Kolmannen osapuolen tiedostot

| Tiedosto | Versio | Lisenssi |
|---|---|---|
| js/vendor/three.min.js | three.js r128 | MIT |
| js/vendor/gsap.min.js, ScrollTrigger.min.js | GSAP 3.12.5 | GSAP Standard License (maksuton) |
| fonts/archivo-variable.woff2 | Archivo | SIL Open Font License 1.1 |
| fonts/jetbrains-mono-variable.woff2 | JetBrains Mono | SIL Open Font License 1.1 |

Sitowisen ja Paimion kaupungin logot ovat organisaatioiden omaisuutta.
