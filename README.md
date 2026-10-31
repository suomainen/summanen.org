# summanen.org – nettisivut

Oskari Summasen henkilö- ja yrityssivu: järjestelmäarkkitehti, yrittäjä, kaupunginvaltuutettu ja isä. Sivu on yksi staattinen HTML-sivu, jonka taustalla on three.js:llä tehty 3D-metsä ja vierityksen mukana etenevä kamera.

**Sivu:** https://summanen.org/
**Julkaisu:** GitHub Pages, `main`-haaran juuresta. Verkkotunnus on määritelty `CNAME`-tiedostossa, ja DNS on GoDaddyssa.

## Rakenne

```
index.html            sivun sisältö suomeksi (ensisijainen kieli)
en/index.html         sama sivu englanniksi (polut ../css, ../js, ../img)
404.html              "sivua ei löytynyt" -sivu
CNAME                 GitHub Pagesin verkkotunnus (älä poista)
CHANGELOG.md          muutosloki: versiot ja mitä kussakin muuttui
favicon.ico           selainvälilehden kuvake (16/32/48 px)
favicon.svg           sama kuvake vektorina
apple-touch-icon.png  iPhonen ja iPadin kotivalikkokuvake (180 px)
site.webmanifest      Android-kuvakkeet ja sovelluksen nimi
robots.txt            ohjeet hakukoneille
llms.txt              tiivistelmä tekoälyhakukoneille ja kielimalleille (suomeksi ja englanniksi)
sitemap.xml           sivukartta hakukoneille
css/
  fonts.css           @font-face-määrittelyt
  style.css           sivun tyylit (osiot numeroitu, värit muuttujina :root-lohkossa)
js/
  consent.js          evästeilmoitus ja Google Analytics 4
  forest.js           3D-metsä (asetukset tiedoston alussa)
  animations.js       vieritysanimaatiot, edistymispalkki ja 3D-metsän käynnistys
  menu.js             valikko ja nykyisen osion seuranta
  copy.js             sähköpostin ja puhelinnumeron kopiointinapit
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

- **Kieliversiot:** suomi on `index.html` ja englanti `en/index.html`. Kun muutat tekstiä, muuta se molempiin. Kielivalinta FI / EN on yläreunassa valikkonapin vieressä. Sivut on linkitetty toisiinsa hakukoneille (`hreflang`), ja skriptien tekstit valitaan sivun `lang`-määrityksen mukaan (`js/menu.js`, `js/copy.js`).
- **Tekstit:** `index.html`. Jokainen rooli on oma `<section>`-osionsa, ja sen alla olevat laatikot ovat `.values`-elementin sisällä.
- **Värit ja fontit:** `css/style.css`, kohta 1. Läpinäkyvät sävyt käyttävät rgb-muuttujia, esim. `rgba(var(--ember-rgb), 0.3)`.
- **3D-metsä:** `js/forest.js`, `SETTINGS`-lohko tiedoston alussa: puiden määrä, piirtotaajuus (oletus 30 kertaa sekunnissa), värit ja kameran pysähdyspaikat (yksi per osio).
- **3D-metsän käynnistysviive:** `js/animations.js`, `FOREST_FALLBACK_MS`.
- **Valikon roolitekstit** oikeassa ylänurkassa: `js/menu.js`, `SECTION_LABELS`.
- **Versionumero** valikon alareunassa: `js/menu.js`, `SITE_VERSION` (ks. Versiointi). Numero on linkki GitHubin muutoslokiin, ja sen vieressä oleva GitHub-logo vie repoon.
- Kun sivuun tehdään isompia muutoksia, päivitä `sitemap.xml`:n `lastmod`-päivämäärä.

## Julkaisu

```
git add -A
git commit -m "Kuvaus muutoksesta"
git push
```

Sivu päivittyy noin minuutin kuluttua. Jos `git push` hylätään, koska GitHubissa on uudempia muutoksia, aja ensin `git pull --rebase` ja sitten uudelleen `git push`.

## Versiointi

Versionumero on muotoa pää.osa.korjaus (esim. 1.7.0), ja se näkyy valikon alareunassa. Kun julkaiset muutoksen:

1. Nosta numeroa `js/menu.js`:n `SITE_VERSION`-kohdassa: kokonaan uusi sivu → pää, uusi osio tai ominaisuus → osa, pieni korjaus → korjaus.
2. Lisää `CHANGELOG.md`:n alkuun uusi versionumero ja lyhyt kuvaus muutoksista.
3. Tallenna, merkitse versio ja julkaise:

```
git add -A
git commit -m "Kuvaus muutoksesta"
git tag -a v1.7.1 -m "Lyhyt kuvaus"
git push --follow-tags
```

`--follow-tags` vie GitHubiin myös versiomerkinnät (tagit).

## Analytiikka ja evästeet

Kävijämäärät mitataan Google Analytics 4:llä (`G-MMCSFYS9GC`). Seuranta latautuu vasta, kun kävijä hyväksyy evästeet (Google Consent Mode v2, oletuksena kielletty). Valinta tallennetaan selaimeen, ja sitä voi muuttaa valikon Evästeet-kohdasta. Toteutus on tiedostossa `js/consent.js`.

Muuten sivu ei lataa mitään ulkopuolisilta palvelimilta: kirjastot ja fontit ovat repositoriossa.

## Hakukoneet ja jakaminen

`index.html`:n `<head>`-osassa on otsikko, kuvaus, kanoninen osoite, Open Graph- ja Twitter-jakotiedot (jakokuva `img/og-kuva.jpg`, 1200 × 630 px) sekä JSON-LD-rakenteinen tieto (WebSite ja Person).

## Suorituskyky

Sivun skriptit ladataan vasta HTML:n jälkeen (`defer`). Raskas 3D-metsä käynnistyy vasta, kun sivu on latautunut ja kävijä vierittää tai liikuttaa hiirtä, tai viimeistään kuuden sekunnin kuluttua. Metsä piirretään 30 kertaa sekunnissa, piirtäminen pysähtyy kun välilehti on piilossa, ja puhelimessa puita on vähemmän ja piirtotarkkuus matalampi.

## Kolmannen osapuolen tiedostot ja oikeudet

| Tiedosto | Versio | Lisenssi tai oikeus |
|---|---|---|
| `js/vendor/three.min.js` | three.js r128 | MIT |
| `js/vendor/gsap.min.js`, `ScrollTrigger.min.js` | GSAP 3.12.5 | GSAP Standard License (maksuton) |
| `fonts/archivo-variable.woff2` | Archivo | SIL Open Font License 1.1 |
| `fonts/jetbrains-mono-variable.woff2` | JetBrains Mono | SIL Open Font License 1.1 |
| `img/sitowise-logo.webp` | – | Sitowise Oy:n tavaramerkki |
| `img/paimio-logo.webp` | – | Paimion kaupungin tunnus |
| Some-logot yhteystiedoissa (`index.html`, `en/index.html`) | Bootstrap Icons 1.11.3; Google Maps: Simple Icons 13; drone: Phosphor Icons 2 | MIT (Bootstrap Icons, Phosphor Icons), CC0 (Simple Icons); logot ovat palveluiden tavaramerkkejä, käytetty linkkeinä omiin profiileihin |
| GitHub-logo valikossa (`index.html`, `en/index.html`) | Octicons 19 (mark-github) | MIT; GitHubin tavaramerkki, käytetty linkkinä omaan repoon |
| `img/oskari-summanen.jpg`, `img/virpi-lindvall.jpg` | – | Kuvaajan tekijänoikeus, käyttö luvalla |

Sivun omat tekstit, kuvat ja koodi: © Oskari Summanen. Kaikki oikeudet pidätetään.
