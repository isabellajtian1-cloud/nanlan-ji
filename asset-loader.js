/* Bounded, cancellable artwork requests. Failed and abandoned jobs never stay cached. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;else root.NanlanAssetLoader=factory;})(typeof globalThis!=='undefined'?globalThis:this,function({ImageType=Image,images={},assets,resolveKey=id=>id,timeout=8000,timers={setTimeout:(fn,ms)=>setTimeout(fn,ms),clearTimeout:id=>clearTimeout(id)}}){
 const jobs=new Map();let serial=0;
 function cancel(id){jobs.get(resolveKey(id))?.cancel();}
 function load(id,{restart=false}={}){
  const key=resolveKey(id);if(images[key]?.naturalWidth>0)return Promise.resolve(true);
  if(restart)cancel(key);if(jobs.has(key))return jobs.get(key).promise;
  const source=assets[key];if(!source)return Promise.resolve(false);
  const candidates=[source,assets[key+'_fallback']||source],nonce=++serial;
  let complete,im,timer,settled=false;
  const job={promise:new Promise(r=>complete=r),cancel:()=>finish(false)};
  function cleanup(){timers.clearTimeout(timer);if(im){im.onload=im.onerror=null;im.src='';}}
  function finish(ok){if(settled)return;settled=true;if(ok){timers.clearTimeout(timer);im.onload=im.onerror=null;images[key]=im;}else cleanup();if(jobs.get(key)===job)jobs.delete(key);complete(ok);}
  function attempt(index){
   if(settled)return;if(index>=candidates.length){finish(false);return;}
   im=new ImageType();const current=im;let ended=false;
   const end=ok=>{if(ended||settled||current!==im)return;ended=true;timers.clearTimeout(timer);current.onload=current.onerror=null;if(ok){finish(true);return;}current.src='';attempt(index+1);};
   current.onload=()=>end(current.naturalWidth>0);current.onerror=()=>end(false);timer=timers.setTimeout(()=>end(false),timeout);
   const url=candidates[index];current.src=url+(url.includes('?')?'&':'?')+'build=6921'+(restart||index?'&retry='+Date.now()+'-'+nonce+'-'+index:'');
  }
  jobs.set(key,job);attempt(0);return job.promise;
 }
 function cancelOther(keep){const keys=new Set(keep.map(resolveKey));for(const [key,job]of jobs)if(!keys.has(key))job.cancel();}
 return {load,cancel,cancelOther};
});
