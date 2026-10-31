/* Vieritykseen liittyvät animaatiot (GSAP ScrollTrigger) ja 3D-metsän käynnistys.
   Jos käyttäjä on pyytänyt vähemmän liikettä tai kirjastot puuttuvat, mitään ei animoida. */
(() => {
  /* 3D-metsä käynnistyy viimeistään tämän ajan kuluttua sivun latautumisesta */
  const FOREST_FALLBACK_MS = 6000;
  /* nämä kävijän toimet käynnistävät metsän heti */
  const START_EVENTS = ['scroll', 'pointermove', 'touchstart', 'keydown', 'wheel'];

  const canvas = document.getElementById('city');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || !window.THREE || !window.gsap || !window.startForest) {
    canvas.style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* osioiden sisältö liukuu esiin, kun osio tulee näkyviin */
  gsap.utils.toArray('.scene').forEach((section) => {
    gsap.from(section.children, {
      y: 40, opacity: 0.15, duration: 0.9, stagger: 0.09, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 74%', once: true },
    });
  });

  /* edistymispalkki yläreunassa ja "Vieritä"-vihjeen piilotus */
  const bar = document.getElementById('bar');
  const cue = document.getElementById('cue');
  ScrollTrigger.create({
    trigger: 'main', start: 'top top', end: 'bottom bottom',
    onUpdate: ({ progress }) => {
      bar.style.width = `${progress * 100}%`;
      cue.style.opacity = progress > 0.02 ? '0' : '1';
    },
  });

  /* 3D-metsä on raskas, joten se käynnistyy vasta kun sivu on latautunut ja kävijä
     vierittää, liikuttaa hiirtä, koskettaa tai painaa näppäintä – tai viimeistään viiveen jälkeen */
  const small = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
  let started = false;

  const start = (e) => {
    /* jotkin selaimet lähettävät latauksessa nollan mittaisen hiiren liikkeen: ei lasketa */
    if (e && e.type === 'pointermove' && !e.movementX && !e.movementY) return;
    if (started) return;
    started = true;
    START_EVENTS.forEach((type) => removeEventListener(type, start));
    window.startForest(canvas, { small });
  };

  const waitForVisitor = () => {
    START_EVENTS.forEach((type) => addEventListener(type, start, { passive: true }));
    setTimeout(start, FOREST_FALLBACK_MS);
  };

  if (document.readyState === 'complete') waitForVisitor();
  else addEventListener('load', waitForVisitor);
})();
