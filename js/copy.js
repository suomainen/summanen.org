/* Kopiointinapit sähköpostin ja puhelinnumeron perässä.
   Onnistuessa kuvake vaihtuu hetkeksi väkäseksi ja ruudunlukija kertoo tuloksen.
   Jos selain ei salli kopiointia, teksti valitaan valmiiksi näppäimillä kopioitavaksi. */
(() => {
  const RESET_MS = 2200;
  const CHECK_ICON =
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

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
      status.textContent = copied ? `${what} kopioitu` : `${what} valittu, kopioi se näppäimillä`;
      btn.title = copied ? 'Kopioitu' : 'Valittu, kopioi näppäimillä';
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
