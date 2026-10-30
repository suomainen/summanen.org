# summanen.org – nettisivut

Oskari Summasen henkilö- ja yrityssivu. Julkaistaan GitHub Pagesilla: https://suomainen.github.io/summanen.org/

## Rakenne

```
index.html            sivun sisältö
404.html              "sivua ei löytynyt" -sivu
favicon.ico           selainvälilehden kuvake (16/32/48 px)
favicon.svg           sama kuvake vektorina
apple-touch-icon.png  iPhonen/iPadin kotivalikkokuvake (180 px)
site.webmanifest      Android-kuvakkeet ja sovelluksen nimi
robots.txt            ohjeet hakukoneille
sitemap.xml           sivukartta hakukoneille
css/
  fonts.css           @font-face-määrittelyt
  style.css           sivun tyylit
js/
  consent.js          evästeilmoitus ja Google Analytics 4 (latautuu vasta suostumuksella)
  main.js             3D-metsä, vieritysanimaatiot, valikko ja kopiointinapit
  vendor/             kolmannen osapuolen kirjastot (ei muokata)
fonts/                fonttitiedostot (woff2)
img/                  logot, henkilökuvat ja jakokuva (og-kuva.jpg)
  icons/              Android-kuvakkeet (192/512 px)
```

Kirjastot ja fontit ovat repositoriossa. Ainoa ulkopuolinen lataus on Google Analytics, ja sekin vasta kävijän suostumuksella.

Hakukoneita varten sivulla on kuvaus, kanoninen osoite, Open Graph- ja Twitter-jakotiedot sekä JSON-LD-henkilötiedot. Kun sivuun tehdään isompia muutoksia, päivitä `sitemap.xml`:n `lastmod`-päivämäärä.

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
