/* Cancellable image downloads. The HTTP watchdog measures silence between bytes. */
(function(root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.NanlanAssetLoader = factory;
})(globalThis, function({images = {}, assets, resolveKey = id => id, ImageType = Image,
    timeout = 30000, timers = {setTimeout, clearTimeout}}) {
  const jobs = new Map();
  const failures = new Map();
  const useXHR = typeof location !== 'undefined' && /^https?:$/.test(location.protocol)
    && typeof XMLHttpRequest !== 'undefined' && typeof URL.createObjectURL === 'function';

  function load(id, {retry = false, passive = false, onProgress} = {}) {
    const key = resolveKey(id);
    if (images[key]?.naturalWidth) return Promise.resolve(true);
    if (jobs.has(key)) {
      const job = jobs.get(key);
      if (onProgress) job.listeners.add(onProgress);
      return job.promise;
    }
    const source = assets[key];
    if (!source || (passive && Date.now() < (failures.get(key) || 0))) return Promise.resolve(false);
    const sources = [source, assets[key + '_fallback'] || source];
    let resolve, timer, cleanup = () => {}, finished = false;
    const job = {promise:new Promise(r => {resolve = r;}), listeners:new Set(onProgress ? [onProgress] : []),
      cancel:() => finish(null, true)};
    jobs.set(key, job);

    function finish(image, cancelled = false) {
      if (finished) return;
      finished = true;
      timers.clearTimeout(timer);
      cleanup();
      jobs.delete(key);
      if (image) { images[key] = image; failures.delete(key); }
      else if (!cancelled) failures.set(key, Date.now() + 15000);
      job.listeners.clear();
      resolve(Boolean(image));
    }
    function attempt(index) {
      const image = new ImageType();
      let xhr, objectURL, ended = false;
      cleanup = () => {
        if (ended) return;
        ended = true;
        image.onload = image.onerror = null;
        if (xhr) {
          xhr.onprogress = xhr.onload = xhr.onerror = xhr.onabort = null;
          if (xhr.readyState !== 4) xhr.abort();
        }
        if (!image.naturalWidth && image.getAttribute?.('src')) image.removeAttribute('src');
        if (objectURL) URL.revokeObjectURL(objectURL);
      };
      function failed() {
        if (ended || finished) return;
        timers.clearTimeout(timer);
        cleanup();
        if (index + 1 === sources.length) finish(null);
        else attempt(index + 1);
      }
      function resetTimer(ms) {
        timers.clearTimeout(timer);
        timer = timers.setTimeout(failed, ms);
      }
      const file = sources[index];
      const url = file + (file.includes('?') ? '&' : '?') + 'build=6922';
      image.onload = () => {
        if (ended || finished) return;
        if (image.naturalWidth) finish(image);
        else failed();
      };
      image.onerror = failed;
      if (!useXHR) {
        resetTimer(Math.max(timeout, typeof location === 'undefined' ? timeout : 90000));
        image.src = url;
        return;
      }
      try {
        xhr = new XMLHttpRequest();
        xhr.open('GET', url + ((index || retry) ? '&retry=' + Date.now() : ''));
        xhr.responseType = 'blob';
        xhr.onprogress = event => {
          if (ended || finished) return;
          resetTimer(timeout);
          for (const listener of job.listeners) listener(key, event.loaded);
        };
        xhr.onerror = xhr.onabort = failed;
        xhr.onload = () => {
          if (ended || finished) return;
          if (xhr.status < 200 || xhr.status >= 300 || !xhr.response?.size) { failed(); return; }
          resetTimer(timeout);
          objectURL = URL.createObjectURL(xhr.response);
          image.src = objectURL;
        };
        resetTimer(timeout);
        xhr.send();
      } catch { failed(); }
    }
    attempt(0);
    return job.promise;
  }
  function cancel(id) { jobs.get(resolveKey(id))?.cancel(); }
  function cancelOther(ids) {
    const keep = new Set(ids.map(resolveKey));
    for (const [key, job] of jobs) if (!keep.has(key)) job.cancel();
  }
  return {load, cancel, cancelOther};
});
