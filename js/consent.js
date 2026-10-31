/* Evästesuostumus ja Google Analytics 4.
   - Google Consent Mode v2: kaikki oletuksena kielletty.
   - GA4 ladataan vasta, kun kävijä painaa Hyväksy. Valinta tallennetaan selaimeen.
   - Valintaa voi muuttaa valikon Evästeet-kohdasta. Hylkäys aiemman hyväksynnän jälkeen
     poistaa GA:n evästeet ja lataa sivun uudelleen ilman seurantaa. */
(() => {
  const GA_ID = 'G-MMCSFYS9GC';
  const STORAGE_KEY = 'summanen-consent';

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
  };

  const removeAnalyticsCookies = () => {
    const host = location.hostname;
    document.cookie.split(';').forEach((cookie) => {
      const name = cookie.split('=')[0].trim();
      if (!name.startsWith('_ga')) return;
      ['; path=/', `; path=/; domain=${host}`, `; path=/; domain=.${host}`]
        .forEach((scope) => { document.cookie = `${name}=; Max-Age=0${scope}`; });
    });
  };

  let choice = readChoice();
  if (choice === 'granted') loadAnalytics();

  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('consent');
    if (!banner) return;

    const show = () => { banner.hidden = false; };
    const hide = () => { banner.hidden = true; };

    if (choice !== 'granted' && choice !== 'denied') show();

    document.getElementById('consent-accept').addEventListener('click', () => {
      saveChoice('granted');
      choice = 'granted';
      loadAnalytics();
      hide();
    });

    document.getElementById('consent-reject').addEventListener('click', () => {
      const wasGranted = choice === 'granted';
      saveChoice('denied');
      choice = 'denied';
      hide();
      gtag('consent', 'update', { analytics_storage: 'denied' });
      if (wasGranted) {
        removeAnalyticsCookies();
        location.reload();
      }
    });

    const openButton = document.getElementById('consent-open');
    if (openButton) openButton.addEventListener('click', show);
  });
})();
