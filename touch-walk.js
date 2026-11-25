/* Both steering surfaces feed the same collision-aware movement loop. */
function installTouchWalk(canvas, guide, canWalk, takeControl, tap, worldPoint, step) {
  const pad = document.getElementById('steeringPad');
  const toggle = document.getElementById('steeringToggle');
  const coarse = matchMedia('(any-pointer: coarse)');
  const prefKey = 'nanlan_show_steering';
  let preference = null, contact = null, vector = null;
  try { preference = localStorage.getItem(prefKey); } catch {}

  function cancel() {
    if (!contact) return;
    const {id, surface} = contact;
    contact = vector = null;
    guide.hidden = true;
    if (pad) {
      pad.classList.remove('steering-held');
      pad.lastElementChild.style.transform = '';
    }
    if (surface.hasPointerCapture(id)) surface.releasePointerCapture(id);
  }

  function syncPad() {
    if (!pad || !toggle) return;
    const visible = preference === null ? coarse.matches || navigator.maxTouchPoints > 0 : preference === '1';
    if (!visible && contact?.surface === pad) cancel();
    pad.hidden = !visible;
    toggle.setAttribute('aria-pressed', String(visible));
    const en = document.documentElement.lang === 'en';
    toggle.textContent = en ? 'On-screen direction pad' : '屏幕方向盘';
    pad.title = en ? 'Hold a direction to walk' : '按住方向行走';
  }
  if (toggle) {
    toggle.addEventListener('click', () => {
      preference = pad.hidden ? '1' : '0';
      try { localStorage.setItem(prefKey, preference); } catch {}
      syncPad();
    });
    coarse.addEventListener('change', syncPad);
    document.addEventListener('nanlanlanguagechange', syncPad);
    syncPad();
  }

  function steer(event) {
    const fixed = contact.surface === pad;
    const dx = event.clientX - contact.x, dy = event.clientY - contact.y;
    const radius = Math.hypot(dx, dy);
    if (!fixed && !vector && radius < 10) return;
    const deadZone = fixed ? 10 : 6;
    vector = radius < deadZone ? {x: 0, y: 0} : {x: dx / radius, y: dy / radius};
    const thumb = fixed ? pad.lastElementChild : guide.firstElementChild;
    if (!fixed) guide.hidden = false;
    const offset = Math.min(radius, fixed ? 18 : 21);
    thumb.style.transform = 'translate(' + vector.x * offset + 'px,' + vector.y * offset + 'px)';
  }

  function begin(event) {
    const surface = event.currentTarget, fixed = surface === pad;
    if (event.button !== 0 || !event.isPrimary || contact || !canWalk()) return;
    if (!fixed && event.pointerType !== 'touch') return;
    event.preventDefault();
    takeControl();
    const box = surface.getBoundingClientRect();
    contact = {
      id: event.pointerId, surface, started: performance.now(),
      x: fixed ? box.left + box.width / 2 : event.clientX,
      y: fixed ? box.top + box.height / 2 : event.clientY,
      target: fixed ? null : worldPoint(event)
    };
    surface.setPointerCapture(contact.id);
    if (fixed) {
      pad.classList.add('steering-held');
      steer(event);
    } else {
      guide.style.left = contact.x + 'px';
      guide.style.top = contact.y + 'px';
    }
  }

  function end(event) {
    if (event.pointerId !== contact?.id) return;
    if (!canWalk()) { cancel(); return; }
    steer(event);
    const {surface, target, started} = contact, lastVector = vector;
    cancel();
    if (surface === canvas && !lastVector) tap(target);
    if (surface === pad && lastVector && performance.now() - started < 90) step?.(lastVector);
  }
  for (const surface of [canvas, pad].filter(Boolean)) {
    surface.addEventListener('pointerdown', begin);
    surface.addEventListener('pointermove', event => {
      if (event.pointerId !== contact?.id) return;
      if (canWalk()) steer(event); else cancel();
    });
    surface.addEventListener('pointerup', end);
    for (const type of ['pointercancel', 'lostpointercapture']) {
      surface.addEventListener(type, event => { if (event.pointerId === contact?.id) cancel(); });
    }
  }
  window.addEventListener('blur', cancel);
  window.addEventListener('resize', cancel);
  document.addEventListener('visibilitychange', cancel);
  return {get vector() { return vector; }, cancel};
}
