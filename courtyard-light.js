/* Light and foreground coverage for the three painted courtyard plates. World units
   are the same 1100 × 733 coordinates used by doors, feet and the camera. */
window.NanlanCourtyard = (() => {
  const resolution = 2, left = -87, top = -110, width = 154, height = 143;
  const rows = {estateOld: 0, yard: 1, estateYard: 2};
  const posts = [
    {foot: 362, shape: new Path2D('M368 286 L378 284 L377 350 L380 351 L379 357 L370 360 L367 356 L369 352 Z')},
    {foot: 322, shape: new Path2D('M756 228 L764 226 L763 308 L765 310 L764 316 L756 318 L753 314 L756 309 Z')}
  ];
  const limit = n => Math.max(0, Math.min(1, n));
  let buffers;
  function surface() {
    const canvas = document.createElement('canvas');
    canvas.width = width * resolution;
    canvas.height = height * resolution;
    return canvas.getContext('2d');
  }
  function reset(c, x, y) {
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    c.setTransform(resolution, 0, 0, resolution, -(x + left) * resolution, -(y + top) * resolution);
  }
  function frame(baseKey, mattes, light, weather, stableLights) {
    const cloud = weather?.wet ? .22 : weather?.id === 'fog' ? .34 : weather?.id === 'cloud' ? .58 : 1;
    const sun = cloud * (1 - light.darkness) * (1 - light.morning * .36) * (1 - light.warmth * .21);
    return {row: rows[baseKey] ?? 1, mattes, light, sun, stableLights};
  }
  function wash(c, color, opacity, x, y) {
    if (opacity <= 0) return;
    c.globalAlpha = limit(opacity);
    c.fillStyle = color;
    c.fillRect(x + left, y + top, width, height);
    c.globalAlpha = 1;
  }
  function drawPerson(target, x, y, lighting, paint) {
    if (!buffers) buffers = [surface(), surface(), surface()];
    const [body, silhouette, result] = buffers;
    for (const c of buffers) reset(c, x, y);
    const {row, mattes, light, sun} = lighting;
    const px = x + left, py = y + top;
    body.save();
    paint(body, true);
    body.restore();
    silhouette.drawImage(body.canvas, px, py, width, height);
    silhouette.globalCompositeOperation = 'source-in';
    silhouette.fillStyle = '#443743';
    silhouette.fillRect(px, py, width, height);
    silhouette.globalCompositeOperation = 'source-over';

    // Project the current pose, including the moving foot, onto the flagstones.
    // The courtyard painting puts the sun on the right in all three plates.
    result.save();
    result.translate(x, y);
    result.transform(1, 0, .56, -.22, 0, 0);
    result.globalAlpha = (.035 + .27 * sun) * (row === 0 ? .75 : 1);
    result.drawImage(silhouette.canvas, left, top, width, height);
    result.restore();
    result.save();
    result.translate(x, y);
    result.scale(1, .28);
    const contact = result.createRadialGradient(0, 0, 0, 0, 0, 10);
    contact.addColorStop(0, 'rgba(50,39,35,.50)');
    contact.addColorStop(.48, 'rgba(60,46,42,.27)');
    contact.addColorStop(1, 'rgba(60,46,42,0)');
    result.fillStyle = contact;
    result.fillRect(-10, -10, 20, 20);
    result.restore();

    body.save();
    body.globalCompositeOperation = 'source-atop';
    wash(body, '#78634c', row === 0 ? .16 : .045, x, y);
    wash(body, '#ecb966', light.warmth * .14 + light.morning * .08, x, y);
    wash(body, '#283a50', .06 * (1 - sun) + light.darkness * .40, x, y);
    if (mattes?.naturalWidth && x > 475 && x < 708 && y > 235 && y < 405 && sun > .02) {
      body.save();
      // A point higher on the body intercepts light further to its right.
      // Inverse-project the ground's painted shade back onto the moving cloth.
      body.translate(0, y);
      body.transform(1, 0, .56 / .34, -1 / .34, 0, 0);
      body.globalAlpha = sun * .47;
      body.drawImage(mattes, 190, row * 175, 110, 80, 505, 300 - y, 110, 80);
      body.restore();
    }
    // Depth into the east portico changes smoothly as the actor crosses its lip.
    const across = limit((x - 743) / 22) * limit((906 - x) / 25);
    const awning = across * limit((339 - y + (x - 810) * -.09) / 43);
    wash(body, '#373947', awning * (.11 + .29 * sun), x, y);
    if (lighting.stableLights && light.darkness > 0) {
      let glow = 0;
      for (const [lx, ly] of [[400,183],[570,160],[745,280]]) {
        glow = Math.max(glow, limit(1 - Math.hypot(x - lx, y - 32 - ly) / 93));
      }
      wash(body, '#ffc77d', light.darkness * glow * .35, x, y);
    }
    body.restore();
    result.drawImage(body.canvas, px, py, width, height);

    // Erase only the actor's own pixels. Underneath are the original flowers,
    // pillars and the fully graded live plate, including its seasonal lighting.
    result.save();
    result.globalCompositeOperation = 'destination-out';
    if (mattes?.naturalWidth && x > 520 && x < 799 && y > 167 && y < 367) {
      result.globalAlpha = limit((367 - y) / 6);
      result.drawImage(mattes, 0, row * 175, 170, 175, 570, 195, 170, 175);
      result.globalAlpha = limit((350 - y) / 3);
      result.drawImage(mattes, 190, row * 175 + 89, 58, 63, 580, 289, 58, 63);
    }
    result.fillStyle = '#000';
    for (const post of posts) {
      result.globalAlpha = limit((post.foot - y) / 3);
      if (result.globalAlpha > 0) result.fill(post.shape);
    }
    result.restore();
    target.drawImage(result.canvas, px, py, width, height);
  }
  return {frame, drawPerson};
})();
