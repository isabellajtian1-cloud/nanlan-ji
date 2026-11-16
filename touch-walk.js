/* A tap picks a destination. A drag steers relative to the initial touch. */
function installTouchWalk(canvas, guide, canWalk, takeControl, tap, worldPoint) {
  const thumb = guide.firstElementChild;
  let contact = null, vector = null;

  function cancel() {
    if (!contact) return;
    const id = contact.id;
    contact = vector = null;
    guide.hidden = true;
    if (canvas.hasPointerCapture(id)) canvas.releasePointerCapture(id);
  }
  function updateVector(event) {
    const dx = event.clientX - contact.x, dy = event.clientY - contact.y;
    const radius = Math.hypot(dx, dy);
    if (!vector && radius < 10) return;
    vector = radius < 6 ? {x: 0, y: 0} : {x: dx / radius, y: dy / radius};
    guide.hidden = false;
    const offset = Math.min(radius, 21);
    thumb.style.transform = 'translate(' + vector.x * offset + 'px,' + vector.y * offset + 'px)';
  }

  canvas.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || !event.isPrimary || contact || !canWalk()) return;
    event.preventDefault();
    takeControl();
    contact = {id: event.pointerId, x: event.clientX, y: event.clientY, target: worldPoint(event)};
    guide.style.left = contact.x + 'px';
    guide.style.top = contact.y + 'px';
    canvas.setPointerCapture(contact.id);
  });
  canvas.addEventListener('pointermove', event => {
    if (event.pointerId !== contact?.id) return;
    if (!canWalk()) { cancel(); return; }
    updateVector(event);
  });
  canvas.addEventListener('pointerup', event => {
    if (event.pointerId !== contact?.id) return;
    updateVector(event);
    const target = contact.target, tapped = !vector && canWalk();
    cancel();
    if (tapped) tap(target);
  });
  for (const type of ['pointercancel', 'lostpointercapture']) {
    canvas.addEventListener(type, event => { if (event.pointerId === contact?.id) cancel(); });
  }
  window.addEventListener('blur', cancel);
  window.addEventListener('resize', cancel);
  document.addEventListener('visibilitychange', cancel);
  return { get vector() { return vector; }, cancel };
}
