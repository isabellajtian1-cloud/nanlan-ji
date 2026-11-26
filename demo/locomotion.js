/* Player sprites share a foot anchor. Walking phase is measured in ground distance. */
(function (root, make) {
  const api = make();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NanlanLocomotion = api;
})(globalThis, () => {
  'use strict';
  const directions = ['right', 'downRight', 'down', 'downLeft', 'left', 'upLeft', 'up', 'upRight'];
  const spriteRows = [2, 1, 0, 1, 2, 3, 4, 3];
  const sector = Math.PI / 4;
  const walkSpeed = 112, briskSpeed = 175, stepLength = 40;
  const acceleration = walkSpeed / 0.080;
  const cellWidth = 240, cellHeight = 324, frames = 12;

  function facing(dx, dy, previous) {
    if (Math.hypot(dx, dy) < 0.0001) return previous;
    const angle = Math.atan2(dy, dx);
    const index = directions.indexOf(previous);
    if (index >= 0) {
      const delta = angle - index * sector;
      const difference = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
      // Keep the facing stable when a finger or a route hovers at a sector boundary.
      if (difference <= sector / 2 + Math.PI / 36) return previous;
    }
    return directions[(Math.round(angle / sector) + 8) % 8];
  }

  function advanceSpeed(speed, target, dt) {
    const rampTime = Math.min(dt, Math.abs(target - speed) / acceleration);
    const next = speed + Math.sign(target - speed) * acceleration * rampTime;
    return { speed: next, distance: (speed + next) * rampTime / 2 + target * (dt - rampTime) };
  }

  function atlasKey(gender, silk) {
    return 'gait' + (gender === 'male' ? 'Male' : 'Female') + (silk ? 'Silk' : '');
  }

  function pose(gender, silk, direction, phase, walking) {
    const index = directions.indexOf(direction);
    const row = index < 0 ? 0 : spriteRows[index];
    const cycle = (phase / (2 * Math.PI) % 1 + 1) % 1;
    const col = walking ? 1 + Math.floor(cycle * frames) : 0;
    const height = gender === 'male' ? 88 : 84, scale = height / 294;
    return {
      asset: atlasKey(gender, silk), idle: !walking, flip: index >= 3 && index <= 5,
      source: [col * cellWidth, row * cellHeight, cellWidth, cellHeight],
      destination: [-120 * scale, -312 * scale, cellWidth * scale, cellHeight * scale],
      height
    };
  }
  return { facing, advanceSpeed, atlasKey, pose, walkSpeed, briskSpeed, stepLength };
});
