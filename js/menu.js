/* Valikko oikeassa ylänurkassa ja tieto siitä, mikä osio on nyt näkyvissä.
   - Klikkaus avaa ja sulkee. Hiirellä valikko aukeaa myös, kun hiiri viedään sen päälle.
   - Esc, klikkaus valikon ulkopuolelle tai fokuksen siirtyminen pois sulkee valikon.
   - Nykyinen osio näkyy napin vieressä ja valikossa (aria-current).
   - Sivuston versionumero näkyy valikon alareunassa. */
(() => {
  /* sivuston versio: nosta tätä, lisää rivi CHANGELOG.md:hen ja tee samanniminen git-tagi (ks. README) */
  const SITE_VERSION = '1.7.0';

  /* teksti napin vieressä osioiden järjestyksessä (data-s / data-i), sivun kielen mukaan */
  const SECTION_LABELS = {
    fi: ['neljä roolia', 'rooli 1/4 · arkkitehti', 'rooli 2/4 · yrittäjä', 'rooli 3/4 · valtuutettu', 'rooli 4/4 · isä', 'yhteys · auki'],
    en: ['four roles', 'role 1/4 · architect', 'role 2/4 · entrepreneur', 'role 3/4 · councillor', 'role 4/4 · father', 'contact · open'],
  };
  const labels = SECTION_LABELS[document.documentElement.lang] || SECTION_LABELS.fi;
  /* osio on aktiivinen, kun sen yläreuna on ohittanut tämän kohdan näytön korkeudesta */
  const ACTIVE_LINE = 0.4;
  /* viive ennen kuin hiirellä avattu valikko sulkeutuu, kun hiiri lähtee */
  const HOVER_CLOSE_MS = 250;

  const menu = document.querySelector('.menu');
  const button = document.getElementById('menu-btn');
  const list = document.getElementById('menu-list');
  const links = list.querySelectorAll('a');
  const stateLabel = document.getElementById('sys');

  document.getElementById('site-version').textContent = `v${SITE_VERSION}`;

  /* ---- avaaminen ja sulkeminen ---- */

  let openedByHover = false;
  let leaveTimer = null;

  const setOpen = (open, returnFocus = false) => {
    if (!open) openedByHover = false;
    list.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (!open && returnFocus) button.focus();
  };

  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (canHover) {
    menu.addEventListener('mouseenter', () => {
      clearTimeout(leaveTimer);
      if (list.hidden) {
        openedByHover = true;
        setOpen(true);
      }
    });
    menu.addEventListener('mouseleave', () => {
      if (!openedByHover) return;
      leaveTimer = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
    });
  }

  button.addEventListener('click', () => {
    /* hiirellä avattu valikko jää auki, kun nappia klikataan */
    if (openedByHover) {
      openedByHover = false;
      return;
    }
    const open = list.hidden;
    setOpen(open);
    if (open) (list.querySelector('[aria-current]') || links[0]).focus();
  });

  list.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !list.hidden) setOpen(false, true);
  });
  document.addEventListener('click', (e) => {
    if (!list.hidden && !e.target.closest('.menu')) setOpen(false);
  });
  menu.addEventListener('focusout', (e) => {
    if (!list.hidden && e.relatedTarget && !e.relatedTarget.closest('.menu')) setOpen(false);
  });

  /* ---- nykyinen osio ---- */

  const sections = document.querySelectorAll('main .scene');
  let activeIndex = -1;

  const setActive = (index) => {
    activeIndex = index;
    stateLabel.textContent = labels[index] || labels[0];
    links.forEach((a) => {
      if (Number(a.dataset.i) === index) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };

  /* mitataan vierityksen aikana (IntersectionObserver ei huomioi rootMarginia iframessa) */
  let pending = false;
  const checkActive = () => {
    pending = false;
    const line = innerHeight * ACTIVE_LINE;
    let index = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= line) index = i;
    });
    if (index !== activeIndex) setActive(index);
  };

  addEventListener('scroll', () => {
    if (!pending) {
      pending = true;
      requestAnimationFrame(checkActive);
    }
  }, { passive: true });
  addEventListener('resize', checkActive);
  checkActive();
})();
