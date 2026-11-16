const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=process.cwd(),types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.woff':'font/woff','.flac':'audio/flac'};
let mode='boot',history=[];
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname).slice(1)||'index.html';
  history.push({name,url:url.href});
  const file=path.join(root,name);
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  if((mode==='boot'&&name==='engine.js'&&!url.searchParams.has('retry'))||(mode==='offline'&&name==='water-jar-v6914.webp')){
    res.writeHead(503,{'Cache-Control':'no-store'});res.end();return;
  }
  const data=fs.readFileSync(file);
  res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-store'});
  if(((mode==='slow'||mode==='cancel')&&name==='stove-v6914.webp')||(mode==='baseline'&&name.endsWith('/stove-v6914.png'))){
    let start=0;const chunk=Math.ceil(data.length/12);
    const next=()=>{res.write(data.subarray(start,start+chunk));start+=chunk;if(start>=data.length)res.end();};
    next();const timer=setInterval(next,1000);res.on('close',()=>clearInterval(timer));return;
  }
  res.end(data);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+server.address().port+'/';
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',args:['--no-sandbox','--mute-audio']});
 const errors=[];
 try {
   async function pageFor(save,english=false){
     const c=await browser.newContext({viewport:{width:1024,height:768},hasTouch:true});
     const p=await c.newPage();p.setDefaultTimeout(20000);
     p.on('pageerror',e=>{errors.push(e.message);console.log('Page exception',e.stack);});
     p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))console.log('Console',m.text());});
     await p.addInitScript(({save,english})=>{localStorage.setItem('nanlan_sound','off');if(save)localStorage.setItem('nanlan_v20',save);if(english)localStorage.setItem('nanlan_language','en');},{save,english});
     await p.goto(url,{waitUntil:'domcontentloaded'});
     await p.waitForFunction(()=>document.getElementById('bootStatus').hidden);
     assert.match(await p.title(),/6\.10\.6/);
     return p;
   }
   let p=await pageFor(null);
   assert(history.some(x=>x.name==='engine.js'&&x.url.includes('retry=')));
   assert(!history.some(x=>['stove-v6914.webp','garden-stages-v6914.webp','npc-idle-v3911.webp'].includes(x.name)));
   await p.click('#begin');await p.click('#characterConfirm');try{await p.waitForFunction(()=>started&&!!images.gate?.naturalWidth);}catch(e){console.log(await p.evaluate(()=>({started,transitioning,dialog:$('dialog').innerText,warning:$('loadWarning').innerText,loading:$('sceneLoading').innerText,form:$('characterCreate').hidden,characterError:$('characterError').innerText,keys:Object.keys(images)})),history.slice(-12));throw e;}
   await p.click('#openingSkip');await p.waitForFunction(()=>!NanlanOpening.running());
   const old=await browser.newPage();old.setDefaultTimeout(25000);
   await old.goto(url+'.qa/previous/index.html');await old.click('#begin');await old.click('#characterConfirm');await old.waitForFunction(()=>started);
   assert.match(await old.title(),/6\.10\.5/);
   let fixture=await old.evaluate(()=>{
     const actor=world.gate.objects.find(o=>o.id==='familyLuggage');engine.move(actor.x,actor.y);
     for(const [name,args] of [['handover',{choice:'grandfather'}],['takeKey',{}],['openGate',{}]]){
       const r=engine.act(name,args);if(!r.ok)throw Error(r.message);
     }
     return JSON.parse(localStorage.getItem(N.SAVE_KEY));
   });
   assert.equal(fixture.scene,'yard');await old.close();
   const save=JSON.stringify(fixture);
   console.log('New journey and opening passed. Title resumed at the failed script.');
   await p.context().close();
   mode='baseline';
   const prior=await browser.newPage();prior.setDefaultTimeout(30000);
   await prior.addInitScript(save=>localStorage.setItem('nanlan_v20',save),save);
   await prior.goto(url+'.qa/previous/index.html');await prior.click('#continueGame');
   await prior.waitForFunction(()=>$('loadingHint').textContent.includes('连接未完成'),null,{timeout:35000});
   assert.equal(await prior.evaluate(()=>started),false);await prior.close();
   console.log('Reproduced original connection-incomplete message with a progressing courtyard download on V6.10.5.');
   mode='slow';p=await pageFor(save,true);assert.equal(await p.locator('html').getAttribute('lang'),'en');
   history=[];const t=Date.now();await p.click('#continueGame');await p.waitForFunction(()=>started&&state().scene==='yard'&&images.stove?.naturalWidth);
   const elapsed=Date.now()-t;
   assert(elapsed>8000);assert.equal(history.filter(x=>x.name==='stove-v6914.webp').length,1);
   assert(!history.some(x=>x.name.startsWith('production-stages')||x.name.startsWith('production-items')));
   assert.equal(await p.evaluate(()=>state().coins),fixture.coins);
   console.log('Old courtyard save entered with one uninterrupted stove transfer in '+elapsed+' ms.');
   await p.context().close();
   mode='offline';p=await pageFor(save);history=[];await p.click('#continueGame');
   await p.waitForFunction(()=>!$('sceneLoading').hidden&&!$('sceneLoadRetry').disabled);
   assert.equal(await p.evaluate(()=>localStorage.getItem('nanlan_v20')),save);
   const stoveBefore=history.filter(x=>x.name==='stove-v6914.webp').length;assert.equal(stoveBefore,1);
   assert.equal(history.filter(x=>x.name==='water-jar-v6914.webp').length,2);
   mode='normal';await p.evaluate(()=>window.dispatchEvent(new Event('online')));
   await p.waitForFunction(()=>started&&images.waterJar?.naturalWidth);
   assert.equal(history.filter(x=>x.name==='stove-v6914.webp').length,stoveBefore);
   console.log('Network recovery fetched only the missing artwork. Save remained unchanged until entry.');
   let scenes=await p.evaluate(()=>Object.keys(world));
   for(const scene of scenes){
     await p.evaluate(scene=>Promise.race([loadSceneAssets(scene),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Scene '+scene+' '+$('loadingHint').textContent)),15000))]),scene);
     assert.equal(await p.locator('#sceneLoading').isHidden(),true);
   }
   console.log('All '+scenes.length+' scene manifests decoded.');
   await p.context().close();
   mode='cancel';p=await pageFor(save);
   await p.click('#continueGame');await p.waitForFunction(()=>!$('sceneLoading').hidden);await p.click('#sceneLoadCancel');
   await p.waitForFunction(()=>!transitioning&&$('sceneLoading').hidden);
   assert.equal(await p.evaluate(()=>localStorage.getItem('nanlan_v20')),save);assert.equal(await p.evaluate(()=>started),false);
   mode='normal';await p.waitForFunction(()=>performance.now()>=pointerQuietUntil);await p.click('#continueGame');await p.waitForFunction(()=>started&&state().scene==='yard');
   console.log('Cancellation preserved the original save and a second Continue succeeded.');
   await p.context().close();
   mode='offline';p=await pageFor(save);
   await p.click('#continueGame');await p.waitForFunction(()=>!$('sceneLoading').hidden&&!$('sceneLoadRetry').disabled);
   mode='normal';await p.click('#sceneLoadRetry');await p.waitForFunction(()=>started&&state().scene==='yard');
   console.log('Manual retry succeeded without restarting the page.');await p.context().close();
   const local=await browser.newPage();local.on('pageerror',e=>errors.push(e.message));
   await local.goto(require('node:url').pathToFileURL(path.join(root,'index.html')).href);
   await local.waitForFunction(()=>document.getElementById('bootStatus').hidden);
   await local.click('#begin');await local.click('#characterConfirm');await local.waitForFunction(()=>started&&images.gate?.naturalWidth);
   console.log('Direct file entry passed.');
   assert.deepEqual(errors,[]);
 }finally{await browser.close();server.closeAllConnections();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.closeAllConnections();server.close();});