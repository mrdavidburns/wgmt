/* WGMT — progressive enhancement. Site works without JS; this adds:
   mobile nav, stone-library filtering + favorites, AJAX form submit. */

// ---- Mobile nav ----
const toggle = document.querySelector('.header__toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// ---- Stone library: filter chips ----
const chips = document.querySelectorAll('.chip[data-filter]');
const stones = document.querySelectorAll('[data-stone-type]');
const countEl = document.querySelector('[data-stone-count]');
chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
    chip.setAttribute('aria-pressed', 'true');
    const filter = chip.dataset.filter;
    let shown = 0;
    stones.forEach((el) => {
      const show = filter === 'All' || el.dataset.stoneType === filter;
      el.hidden = !show;
      if (show) shown++;
    });
    if (countEl) countEl.textContent = `${shown} stone${shown === 1 ? '' : 's'}`;
  });
});

// ---- Stone library: favorites (localStorage) ----
const FAV_KEY = 'wgmt-favs';
const favBanner = document.querySelector('[data-fav-banner]');
const readFavs = () => {
  try { return JSON.parse(localStorage.getItem(FAV_KEY)) || {}; } catch { return {}; }
};
const writeFavs = (favs) => localStorage.setItem(FAV_KEY, JSON.stringify(favs));
const paintFavs = () => {
  const favs = readFavs();
  document.querySelectorAll('.stone__fav').forEach((btn) => {
    const on = Boolean(favs[btn.dataset.stone]);
    btn.setAttribute('aria-pressed', String(on));
    btn.textContent = on ? '♥' : '♡';
  });
  if (favBanner) {
    const n = Object.keys(favs).length;
    favBanner.textContent = n > 0
      ? `${n} favorite${n > 1 ? 's' : ''} saved — see ${n > 1 ? 'them' : 'it'} full-size in Ardmore.`
      : 'Tap ♡ to save favorites — we’ll pull them for your visit.';
  }
};
document.querySelectorAll('.stone__fav').forEach((btn) => {
  btn.addEventListener('click', () => {
    const favs = readFavs();
    if (favs[btn.dataset.stone]) delete favs[btn.dataset.stone];
    else favs[btn.dataset.stone] = true;
    writeFavs(favs);
    paintFavs();
  });
});
paintFavs();

// ---- Contact form: AJAX submit to Formspree, redirect to /thanks/ ----
const form = document.querySelector('form[data-estimate-form]');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        window.location.href = form.dataset.thanksUrl;
        return;
      }
      throw new Error('Form endpoint returned ' + res.status);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Request My Estimate';
      let msg = form.querySelector('.form-error');
      if (!msg) {
        msg = document.createElement('p');
        msg.className = 'form-error';
        msg.style.color = '#a33';
        msg.style.font = '400 13px var(--sans)';
        form.appendChild(msg);
      }
      msg.textContent = 'Something went wrong sending the form — please call us instead.';
    }
  });
}
