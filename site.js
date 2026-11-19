(function () {
  var doc = document, root = doc.documentElement;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* header and bottom bar: hide on scroll down, return on scroll up */
  var hdr = $('.hdr'), bar = $('.bar'), chips = $('.chips');
  var lastY = window.pageYOffset, ticking = false, overFooter = false, overForm = false;
  function setStick(hidden) { root.style.setProperty('--stick', hidden ? '0px' : ''); }
  function onScroll() {
    var y = window.pageYOffset, d = y - lastY;
    if (Math.abs(d) > 6) {
      var down = d > 0 && y > 120;
      if (hdr) { hdr.classList.toggle('is-hidden', down); setStick(down); }
      if (bar) bar.classList.toggle('is-hidden', down || overFooter || overForm);
      lastY = y;
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  function watch(sel, set) {
    var el = $(sel);
    if (!el || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { set(es[0].isIntersecting); if (bar) bar.classList.toggle('is-hidden', overFooter || overForm); }, { threshold: 0.01 }).observe(el);
  }
  watch('.ftr', function (v) { overFooter = v; });
  watch('.formsec', function (v) { overForm = v; });

  /* drawer */
  var drawer = $('#drawer'), burger = $('.burger'), lastFocus = null;
  function openDrawer() {
    lastFocus = doc.activeElement;
    drawer.classList.add('is-open'); drawer.removeAttribute('inert'); drawer.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    $('.drawer-x', drawer).focus();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open'); drawer.setAttribute('inert', ''); drawer.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  if (drawer && burger) {
    burger.addEventListener('click', openDrawer);
    $$('[data-close]', drawer).forEach(function (b) { b.addEventListener('click', closeDrawer); });
    $$('a', drawer).forEach(function (a) { a.addEventListener('click', function () { drawer.classList.remove('is-open'); drawer.setAttribute('inert', ''); burger.setAttribute('aria-expanded', 'false'); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });
  }

  /* AR toggle pop-up */
  var dlg = $('#ar-dlg');
  $$('.ar').forEach(function (b) {
    b.addEventListener('click', function () { if (closeDrawerIfOpen) closeDrawerIfOpen(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); });
  });
  function closeDrawerIfOpen() { if (drawer && drawer.classList.contains('is-open')) { drawer.classList.remove('is-open'); drawer.setAttribute('inert', ''); burger.setAttribute('aria-expanded', 'false'); } }
  if (dlg) {
    $$('[data-dlg-close]', dlg).forEach(function (b) { b.addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  }

  /* the day: breakfast or lunch */
  var tabs = $$('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) {
        var on = o === t;
        o.setAttribute('aria-selected', on ? 'true' : 'false');
        o.tabIndex = on ? 0 : -1;
        $('#' + o.getAttribute('aria-controls')).hidden = !on;
      });
    });
    t.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(t);
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        var n = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        n.focus(); n.click(); e.preventDefault();
      }
    });
  });

  /* menu chips: scroll-spy */
  var chipLinks = $$('.chip');
  if (chipLinks.length && 'IntersectionObserver' in window) {
    var secs = chipLinks.map(function (c) { return $(c.getAttribute('href')); });
    var cur = null;
    function setActive(id) {
      if (cur === id) return; cur = id;
      chipLinks.forEach(function (c) {
        var on = c.getAttribute('href') === '#' + id;
        c.classList.toggle('is-active', on);
        if (on) { c.setAttribute('aria-current', 'true'); var bx = c.parentElement; bx.scrollTo({ left: c.offsetLeft - (bx.clientWidth - c.offsetWidth) / 2, behavior: 'smooth' }); }
        else c.removeAttribute('aria-current');
      });
    }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-22% 0px -68% 0px' });
    secs.forEach(function (s) { if (s) io.observe(s); });
    setActive(secs[0].id);
  }

  /* gathering form: ready-written WhatsApp message */
  var form = $('#gather');
  if (form) {
    var PHONE = '201550067619';
    var dateIn = $('#g-date');
    var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
    if (dateIn) dateIn.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    var q = new URLSearchParams(location.search).get('type');
    if (q && $('#g-type')) { var o = $('#g-type option[value="' + q + '"]'); if (o) $('#g-type').value = q; }
    var field = function (id, bad, msg) {
      var f = $('#' + id).closest('.field'); f.classList.toggle('bad', bad);
      if (bad && msg) $('.err', f).textContent = msg;
      $('#' + id).setAttribute('aria-invalid', bad ? 'true' : 'false');
      return bad;
    };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#g-name').value.trim(), date = dateIn.value, time = $('#g-time').value, guests = parseInt($('#g-guests').value, 10), type = $('#g-type').value, note = $('#g-note').value.trim();
      var typeLabel = $('#g-type').selectedOptions[0].textContent;
      var bad = false;
      bad = field('g-name', !name, 'Please add your name.') || bad;
      bad = field('g-date', !date, 'Please choose a date.') || bad;
      var gbad = !(guests >= 1) || (type === 'private' && guests < 10);
      bad = field('g-guests', gbad, type === 'private' && guests >= 1 ? 'The private room is for 10 people or more.' : 'Please add how many guests.') || bad;
      if (bad) { var first = $('.field.bad input, .field.bad select', form); if (first) first.focus(); return; }
      var lines = ['Hello Carmel California, I would like to plan a gathering.', 'Name: ' + name, 'Date: ' + date + (time ? ', ' + time : ''), 'Guests: ' + guests, 'Type: ' + typeLabel];
      if (note) lines.push('Note: ' + note);
      var url = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(lines.join('\n'));
      var st = $('#g-status');
      st.innerHTML = '';
      var a = doc.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.id = 'wa-link'; a.textContent = 'Open WhatsApp with your message';
      st.appendChild(a);
      st.appendChild(doc.createTextNode(' or call us on 015 50067619.'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* footer signature: write on hover, and once when it scrolls into view on touch */
  (function(){var a=document.querySelector('a.sig');if(!a)return;function play(){a.classList.remove('on');void a.getBoundingClientRect();a.classList.add('on')}a.addEventListener('mouseenter',function(){if(!a.classList.contains('on'))play()});if(!matchMedia('(hover: none)').matches||!('IntersectionObserver' in window))return;var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){io.disconnect();setTimeout(play,400)}},{threshold:.9});io.observe(a)})();
})();
