/* Evästesuostumus, Google Analytics 4 ja Microsoft Clarity.
   - Google Consent Mode v2: kaikki oletuksena kielletty.
   - GA4 ja Clarity ladataan vasta, kun kävijä painaa Hyväksy. Valinta tallennetaan selaimeen.
   - Valintaa voi muuttaa evästesivun kytkimellä (evasteet/, en/cookies/). Hylkäys aiemman hyväksynnän jälkeen
     poistaa GA:n ja Clarityn evästeet ja lataa sivun uudelleen ilman seurantaa. */
(() => {
  const GA_ID = 'G-MMCSFYS9GC';
  const CLARITY_ID = 'zh4hj173ay';
  /* sivuston omat evästeet, jotka poistetaan hylkäyksen yhteydessä (GA: _ga*, Clarity: _clck, _clsk) */
  const COOKIE_PREFIXES = ['_ga', '_cl'];
  const STORAGE_KEY = 'summanen-consent';
  /* evästesivun kytkimen tila sivun kielen mukaan */
  const SWITCH_TEXT = { fi: { on: 'Päällä', off: 'Pois' }, en: { on: 'On', off: 'Off' } };

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); }; /* gtag vaatii arguments-olion */
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  });

  const readChoice = () => { try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; } };
  const saveChoice = (value) => { try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* ei tallennusta */ } };

  let analyticsLoaded = false;
  const loadAnalytics = () => {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    document.head.appendChild(script);
    gtag('js', new Date());
    gtag('config', GA_ID);
    loadClarity();
  };

  /* Microsoft Clarity (lämpökartat ja istuntotallenteet); sama latauskoodi kuin Clarityn ohjeessa */
  const loadClarity = () => {
    window.clarity = window.clarity || function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
    document.head.appendChild(script);
  };

  const removeAnalyticsCookies = () => {
    const host = location.hostname;
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (!COOKIE_PREFIXES.some((prefix) => name.startsWith(prefix))) return;
      ['; path=/', `; path=/; domain=${host}`, `; path=/; domain=.${host}`]
        .forEach((scope) => { document.cookie = `${name}=; Max-Age=0${scope}`; });
    });
  };

  let choice = readChoice();
  if (choice === 'granted') loadAnalytics();

  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('consent');
    const switches = document.querySelectorAll('[data-consent-switch]');
    const text = SWITCH_TEXT[document.documentElement.lang] || SWITCH_TEXT.fi;

    /* evästesivun kytkin näyttää nykyisen valinnan */
    const showState = () => {
      switches.forEach((sw) => {
        const on = choice === 'granted';
        sw.setAttribute('aria-checked', String(on));
        sw.querySelector('.switch__state').textContent = on ? text.on : text.off;
      });
    };

    const accept = () => {
      saveChoice('granted');
      choice = 'granted';
      loadAnalytics();
      if (banner) banner.hidden = true;
      showState();
    };

    const reject = () => {
      const wasGranted = choice === 'granted';
      saveChoice('denied');
      choice = 'denied';
      if (banner) banner.hidden = true;
      showState();
      gtag('consent', 'update', { analytics_storage: 'denied' });
      if (window.clarity) window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
      if (wasGranted) {
        removeAnalyticsCookies();
        location.reload();
      }
    };

    showState();
    switches.forEach((sw) => sw.addEventListener('click', () => (choice === 'granted' ? reject() : accept())));

    /* ilmoitus näkyy etu- ja evästesivulla, kunnes kävijä on valinnut */
    if (!banner) return;
    if (choice !== 'granted' && choice !== 'denied') banner.hidden = false;
    document.getElementById('consent-accept').addEventListener('click', accept);
    document.getElementById('consent-reject').addEventListener('click', reject);
  });
})();
