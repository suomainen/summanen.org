# summanen.org – nettisivut

## Perustiedot

| Asia | Tieto |
|---|---|
| Sivusto | Oskari Summasen henkilö- ja yrityssivu |
| Osoite | https://summanen.org/ |
| Julkaisu | GitHub Pages, `main`-haara, juurikansio |
| Verkkotunnus | `CNAME`-tiedosto (summanen.org), DNS GoDaddyssa |

## Rakenne

| Polku | Sisältö |
|---|---|
| `index.html` | Sivun sisältö |
| `404.html` | "Sivua ei löytynyt" -sivu |
| `CNAME` | GitHub Pagesin oma verkkotunnus (älä poista) |
| `favicon.ico` | Selainvälilehden kuvake (16/32/48 px) |
| `favicon.svg` | Sama kuvake vektorina |
| `apple-touch-icon.png` | iPhonen ja iPadin kotivalikkokuvake (180 px) |
| `site.webmanifest` | Android-kuvakkeet ja sovelluksen nimi |
| `robots.txt` | Ohjeet hakukoneille |
| `sitemap.xml` | Sivukartta hakukoneille |
| `css/fonts.css` | Fonttien @font-face-määrittelyt |
| `css/style.css` | Sivun tyylit |
| `js/consent.js` | Evästeilmoitus ja Google Analytics 4 |
| `js/main.js` | 3D-metsä, vieritysanimaatiot, valikko ja kopiointinapit |
| `js/vendor/` | Kolmannen osapuolen kirjastot (ei muokata) |
| `fonts/` | Fonttitiedostot (woff2) |
| `img/` | Logot, henkilökuvat ja jakokuva (`og-kuva.jpg`) |
| `img/icons/` | Android-kuvakkeet (192/512 px) |

## Ulkoiset palvelut ja hakukoneet

| Asia | Toteutus |
|---|---|
| Kirjastot ja fontit | Repositoriossa, ei latauksia ulkopuolelta |
| Google Analytics 4 | `G-MMCSFYS9GC`, latautuu vasta kävijän suostumuksella (Consent Mode v2) |
| Evästevalinnan muutos | Valikon Evästeet-kohta |
| Hakukonetiedot | Otsikko, kuvaus, kanoninen osoite, Open Graph ja Twitter-kortti |
| Rakenteinen tieto | JSON-LD: WebSite ja Person |
| Sivukartta | Päivitä `sitemap.xml`:n `lastmod`, kun sivuun tehdään isompia muutoksia |

## Esikatselu ja julkaisu

| Tehtävä | Ohje |
|---|---|
| Esikatselu | Avaa `index.html` selaimessa tai aja kansiossa `python -m http.server` ja avaa http://localhost:8000 |
| Julkaisu | `git add -A`, `git commit -m "viesti"`, `git push` |
| Jos push hylätään | `git pull --rebase`, sitten `git push` |

## Kolmannen osapuolen tiedostot ja oikeudet

| Tiedosto | Versio | Lisenssi tai oikeus |
|---|---|---|
| `js/vendor/three.min.js` | three.js r128 | MIT |
| `js/vendor/gsap.min.js`, `ScrollTrigger.min.js` | GSAP 3.12.5 | GSAP Standard License (maksuton) |
| `fonts/archivo-variable.woff2` | Archivo | SIL Open Font License 1.1 |
| `fonts/jetbrains-mono-variable.woff2` | JetBrains Mono | SIL Open Font License 1.1 |
| `img/sitowise-logo.png` | – | Sitowise Oy:n tavaramerkki |
| `img/paimio-logo.png` | – | Paimion kaupungin tunnus |
| `img/oskari-summanen.jpg`, `img/virpi-lindvall.jpg` | – | Kuvaajan tekijänoikeus, käyttö luvalla |
