# summanen.org – nettisivut

Oskari Summasen henkilö- ja yrityssivu: järjestelmäarkkitehti, yrittäjä, kaupunginvaltuutettu ja isä. Sivu on yksi staattinen HTML-sivu, jonka taustalla on three.js:llä tehty 3D-metsä ja vierityksen mukana etenevä kamera.

**Sivu:** https://summanen.org/
**Julkaisu:** GitHub Pages, `main`-haaran juuresta. Verkkotunnus on määritelty `CNAME`-tiedostossa, ja DNS on GoDaddyssa.

## Rakenne

```
index.html            sivun sisältö
404.html              "sivua ei löytynyt" -sivu
CNAME                 GitHub Pagesin verkkotunnus (älä poista)
favicon.ico           selainvälilehden kuvake (16/32/48 px)
favicon.svg           sama kuvake vektorina
apple-touch-icon.png  iPhonen ja iPadin kotivalikkokuvake (180 px)
site.webmanifest      Android-kuvakkeet ja sovelluksen nimi
robots.txt            ohjeet hakukoneille
llms.txt              tiivistelmä tekoälyhakukoneille ja kielimalleille
sitemap.xml           sivukartta hakukoneille
css/
  fonts.css           @font-face-määrittelyt
  style.css           sivun tyylit ja väritokenit (:root)
js/
  consent.js          evästeilmoitus ja Google Analytics 4
  main.js             3D-metsä, vieritysanimaatiot, valikko ja kopiointinapit
  vendor/             kolmannen osapuolen kirjastot (ei muokata)
fonts/                fonttitiedostot (woff2)
img/                  logot (WebP), henkilökuvat ja jakokuva (og-kuva.jpg)
  icons/              Android-kuvakkeet (192/512 px)
```

## Esikatselu

Avaa `index.html` suoraan selaimessa. Jos haluat toimivat polut myös 404-sivulle, käynnistä kansiossa kevyt palvelin ja avaa http://localhost:8000:

```
python -m http.server
```

## Muokkaaminen

- **Tekstit:** `index.html`. Jokainen rooli on oma `<section>`-osionsa, ja sen alla olevat laatikot ovat `.values`-elementin sisällä.
- **Värit ja fontit:** `css/style.css`-tiedoston alussa olevat muuttujat (`--void`, `--ember`, `--ice` jne.).
- **3D-metsä ja kameran reitti:** `js/main.js`, taulukko `keys`.
- **Valikon roolitekstit** oikeassa ylänurkassa: `js/main.js`, taulukko `states`.
- Kun sivuun tehdään isompia muutoksia, päivitä `sitemap.xml`:n `lastmod`-päivämäärä.

## Julkaisu

```
git add -A
git commit -m "Kuvaus muutoksesta"
git push
```

Sivu päivittyy noin minuutin kuluttua. Jos `git push` hylätään, koska GitHubissa on uudempia muutoksia, aja ensin `git pull --rebase` ja sitten uudelleen `git push`.

## Analytiikka ja evästeet

Kävijämäärät mitataan Google Analytics 4:llä (`G-MMCSFYS9GC`). Seuranta latautuu vasta, kun kävijä hyväksyy evästeet (Google Consent Mode v2, oletuksena kielletty). Valinta tallennetaan selaimeen, ja sitä voi muuttaa valikon Evästeet-kohdasta. Toteutus on tiedostossa `js/consent.js`.

Muuten sivu ei lataa mitään ulkopuolisilta palvelimilta: kirjastot ja fontit ovat repositoriossa.

## Hakukoneet ja jakaminen

`index.html`:n `<head>`-osassa on otsikko, kuvaus, kanoninen osoite, Open Graph- ja Twitter-jakotiedot (jakokuva `img/og-kuva.jpg`, 1200 × 630 px) sekä JSON-LD-rakenteinen tieto (WebSite ja Person).

## Suorituskyky

Sivun skriptit ladataan vasta HTML:n jälkeen (`defer`). Raskas 3D-metsä käynnistyy vasta, kun sivu on latautunut ja kävijä vierittää tai liikuttaa hiirtä, tai viimeistään kuuden sekunnin kuluttua. Piirtäminen pysähtyy, kun välilehti on piilossa, ja puhelimessa puita on vähemmän ja piirtotarkkuus matalampi.

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

Sivun omat tekstit, kuvat ja koodi: © Oskari Summanen. Kaikki oikeudet pidätetään.
