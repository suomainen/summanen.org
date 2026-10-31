/* Kopiointinapit sähköpostin ja puhelinnumeron perässä.
   Onnistuessa kuvake vaihtuu hetkeksi väkäseksi ja ruudunlukija kertoo tuloksen.
   Jos selain ei salli kopiointia, teksti valitaan valmiiksi näppäimillä kopioitavaksi. */
(() => {
  const RESET_MS = 2200;
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* tekstit sivun kielen mukaan (html lang="fi" tai "en") */
  const TEXT = {
    fi: { copied: 'kopioitu', selected: 'valittu, kopioi se näppäimillä', copiedTitle: 'Kopioitu', selectedTitle: 'Valittu, kopioi näppäimillä' },
    en: { copied: 'copied', selected: 'selected, copy it with the keyboard', copiedTitle: 'Copied', selectedTitle: 'Selected, copy with the keyboard' },
  };
  const t = TEXT[document.documentElement.lang] || TEXT.fi;

  const status = document.getElementById('copy-status');

  document.querySelectorAll('.copy').forEach((btn) => {
    const originalIcon = btn.innerHTML;
    const originalTitle = btn.title;
    const what = btn.dataset.what;
    let timer = null;

    const selectText = () => {
      const range = document.createRange();
      range.selectNodeContents(btn.parentNode.querySelector('a'));
      const selection = getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    };

    const showResult = (copied) => {
      clearTimeout(timer);
      status.textContent = `${what} ${copied ? t.copied : t.selected}`;
      btn.title = copied ? t.copiedTitle : t.selectedTitle;
      if (copied) {
        btn.innerHTML = CHECK_ICON;
        btn.classList.add('is-done');
      }
      timer = setTimeout(() => {
        btn.innerHTML = originalIcon;
        btn.classList.remove('is-done');
        btn.title = originalTitle;
        status.textContent = '';
      }, RESET_MS);
    };

    btn.addEventListener('click', () => {
      const fail = () => { selectText(); showResult(false); };
      try {
        navigator.clipboard.writeText(btn.dataset.copy).then(() => showResult(true), fail);
      } catch (e) {
        fail();
      }
    });
  });
})();
