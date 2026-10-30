/* Evästesuostumus ja Google Analytics 4.
   GA4 ladataan vasta, kun kävijä hyväksyy evästeet. Valinta tallennetaan selaimeen. */
(function () {
  var GA_ID = 'G-MMCSFYS9GC';
  var KEY = 'summanen-consent';

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var choice = read();
  if (choice === 'granted') loadGA();

  document.addEventListener('DOMContentLoaded', function () {
    var banner = document.getElementById('consent');
    var openBtn = document.getElementById('consent-open');
    if (!banner) return;

    function show() { banner.hidden = false; }
    function hide() { banner.hidden = true; }

    if (choice !== 'granted' && choice !== 'denied') show();

    document.getElementById('consent-accept').addEventListener('click', function () {
      save('granted'); choice = 'granted'; loadGA(); hide();
    });
    document.getElementById('consent-reject').addEventListener('click', function () {
      var wasGranted = choice === 'granted';
      save('denied'); choice = 'denied'; hide();
      gtag('consent', 'update', { analytics_storage: 'denied' });
      /* jos suostumus peruttiin, poistetaan GA:n evästeet ja ladataan sivu uudelleen ilman seurantaa */
      if (wasGranted) {
        document.cookie.split(';').forEach(function (c) {
          var n = c.split('=')[0].trim();
          if (n.indexOf('_ga') === 0) {
            document.cookie = n + '=; Max-Age=0; path=/';
            document.cookie = n + '=; Max-Age=0; path=/; domain=' + location.hostname;
            document.cookie = n + '=; Max-Age=0; path=/; domain=.' + location.hostname;
          }
        });
        location.reload();
      }
    });
    if (openBtn) openBtn.addEventListener('click', show);
  });
})();
