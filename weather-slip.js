/* Botanical season slips and the weather at the current hour share the calendar button. */
(() => {
  'use strict';
  const sun = '<circle cx="16" cy="13" r="5.6" fill="#f4c06a"/><path d="M16 2v3m0 16v3M5 13H2m28 0h-3M6 4l2.3 2.3m15.3 13.3 2 2M26 4l-2.2 2.3M6 22l2.4-2.3"/>';
  const moon = '<path fill="#f7db98" d="M21.5 3.7A10 10 0 1 0 27 18.4a9 9 0 0 1-5.5-14.7Z"/><path d="M8 3.5v3M6.5 5h3"/>';
  const cloud = '<path fill="#d4dfd1" d="M5.5 16c-5.3-.6-4.2-7.1 1.2-7.1 1.2-6.4 10.9-7.7 13.5-1.4 5.6-1.3 9.5 7 .9 8.5Z"/>';
  const wind = '<path d="M2 11h16c7.5 0 5.5-8.2 1.1-5.3M7 15h18c5.3 0 5.5 5.6 1.4 5.1M2.5 19h11"/>';
  const marks = {
    clear: sun, night: moon, cloud,
    breeze: wind + '<path d="M5 6C7 1 11 2 13 2c-1 3-4 5-8 4Z" fill="#a9ba82"/>',
    fog: '<path d="m2 14 7-8 4 5 5-7 8 9" stroke="#9ab2a0"/><path d="M2 16h22M7 20h20M2 24h15"/>',
    drizzle: cloud + '<path d="m9 19-.9 2m8-2-.9 2"/>',
    shower: '<circle cx="23.5" cy="7" r="4.8" fill="#e9b66a"/>' + cloud + '<path d="m10 18-2.9 5m10-5-2.9 5"/>',
    rain: cloud + '<path d="m7 18-3.4 6m10-6-3.4 6m10-6-3.4 6m10-6-3.4 6"/>',
    storm: cloud + '<path d="m16 14-5 7h4l-1 4 8-9h-5l1-2Z" fill="#e5b356"/><path d="m6 19-2 4m22-4-2 4"/>',
    hot: '<circle cx="15" cy="10" r="5.8" fill="#e79c55"/><path d="M15 1v2M4 10H2m26 0h-2M7 2.7l2 2m14-2-2 2M3 19q3-2 6 0t6 0 6 0 6 0M6 23q3-2 6 0t6 0 6 0"/>',
    cold: wind + '<path d="m2.5 4 4 3m-4 0 4-3m-2 4V2" stroke="#a8c4c0"/>'
  };
  const svg = paths => '<svg viewBox="0 0 32 28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">' + paths + '</svg>';
  function setText(node, value) {
    if (node.textContent !== value) node.textContent = value;
  }
  function render(button, state) {
    if (!button.classList.contains('weather-slip')) {
      button.classList.add('weather-slip');
      button.dataset.noLocalize = '';
      button.innerHTML = '<span class="season-paper" aria-hidden="true"></span><span class="weather-copy"><span class="weather-heading"><i class="weather-mark"></i><b class="weather-name"></b></span><span class="slip-date"></span><span class="slip-tide"></span><span class="slip-festival" hidden></span></span>';
    }
    const en = NanlanI18n.language === 'en';
    const date = NanlanClimate.at(state);
    const weather = NanlanWeather.current(state);
    const clock = N.clock(state);
    const light = N.daylight(state);
    const tide = N.tide(state);
    const festival = window.NanlanFestivalUI?.active(state);
    const key = weather.id === 'clear' && light.minute >= 1140 ? 'night' : weather.id;
    const time = String(clock.hour).padStart(2, '0') + ':' + String(clock.minute % 60).padStart(2, '0');
    const season = en ? date.en : date.zh;
    const weatherName = en ? weather.en : weather.zh;
    const dateLabel = clock.story ? (en ? 'Early summer · ' + NanlanI18n.t(clock.story) : '初夏 · ' + clock.story)
      : (en ? 'Year ' + date.year + ' · ' + season + ' ' + date.day : date.year + '年 · ' + season + date.day + '日') + '  ' + time;
    const tideLabel = clock.story ? '' : (en ? (tide.low ? 'Low tide' : 'High tide') : (tide.low ? '低潮' : '涨潮')) +
      (en ? ' · ' + Math.ceil(tide.remaining) + ' min' : ' · 余' + Math.ceil(tide.remaining) + '分');
    const eventName = festival ? festival.name[en ? 1 : 0] : '';
    if (button.dataset.season !== date.key) button.dataset.season = date.key;
    if (button.dataset.mark !== key) {
      button.dataset.mark = key;
      button.querySelector('.weather-mark').innerHTML = svg(marks[key]);
    }
    setText(button.querySelector('.weather-name'), weatherName);
    setText(button.querySelector('.slip-date'), dateLabel);
    setText(button.querySelector('.slip-tide'), tideLabel);
    const event = button.querySelector('.slip-festival');
    event.hidden = !eventName;
    setText(event, eventName);
    const name = [dateLabel, weatherName, tideLabel, eventName, en ? 'Open calendar' : '打开日历'].filter(Boolean).join(' · ');
    button.setAttribute('aria-label', name);
    button.title = name;
  }
  window.NanlanWeatherSlip = {render};
})();
