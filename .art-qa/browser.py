import json, os, sys, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
out=Path('.art-qa');out.mkdir(exist_ok=True)
errors=[]
def validate(url):
 with sync_playwright() as pw:
  browser=pw.chromium.launch(channel="chrome",headless=True,args=["--no-sandbox","--disable-dev-shm-usage"])
  page=browser.new_page(viewport={"width":1280,"height":820},device_scale_factor=1)
  page.on("pageerror",lambda e:errors.append(str(e)))
  page.on("console",lambda m:errors.append(m.text) if m.type=="error" and not m.text.startswith("Failed to load resource") else None)
  page.on("response",lambda r:errors.append(str(r.status)+" "+r.url) if r.status>=400 and not r.url.endswith("/favicon.ico") else None)
  page.goto(url,wait_until="domcontentloaded",timeout=60000)
  page.wait_for_function("typeof engine!=='undefined' && window.NanlanDepth && typeof NanlanDepth.raster==='function'",timeout=30000)
  assert '6.10.5' in page.title(),page.title()
  page.evaluate("() => {engine.reset('female'); engine.save()}")
  page.reload(wait_until='domcontentloaded')
  page.locator('#continueGame').click(timeout=20000)
  page.wait_for_function("started&&active&&!transitioning",timeout=30000)
  def place(sc):
   return page.evaluate("""async sc=>{
    if(!await loadSceneAssets(sc))throw Error('load '+sc);
    state().scene=sc; keys={};path=[];moving=false;
    const npc=visibleObjects().find(o=>npcRole(o)&&o.role!=='children');
    if(npc)await loadImage('npc_'+npcRole(npc));
    const p=npc||{x:world[sc].spawn[0],y:world[sc].spawn[1]};
    state().player={x:p.x+57,y:p.y};camera.scene=null;direction='down';render();
    return npc&&[npc.x,npc.y,npc.id]
   }""",sc)
  valid=page.evaluate('JSON.stringify(state())')
  npc=place('gate')
  assert npc
  page.wait_for_timeout(3700)
  def snap(name):
   page.evaluate("render()")
   clip=page.evaluate("""() => {const r=canvas.getBoundingClientRect(),p=state().player, cx=r.left+camera.ox+camera.scale*(p.x-25),cy=r.top+camera.oy+camera.scale*(p.y-61);return {x:Math.max(0,Math.min(innerWidth-460,cx-230)),y:Math.max(0,Math.min(innerHeight-340,cy-170)),width:460,height:340}}""")
   page.screenshot(path=str(out/(name+'.png')),clip=clip)
  snap('side-by-side')
  checks=page.evaluate("""([x,y])=>{
    const depth=NanlanDepth.actor, trace=[];
    NanlanDepth.actor=function(t,px,py,scale,f,paint,ground){
      trace.push({py,hero:paint===renderCharacter,ground});return depth.apply(this,arguments);
    };
    const rows=[];
    try{
      for(const d of [-6,6]){
        state().player={x:x+2,y:y+d};trace.length=0;render();
        const bodies=trace.filter(v=>!v.ground),heroes=bodies.filter(v=>v.hero);
        rows.push({d,hero:heroes.length,sorted:bodies.every((a,i)=>!i||a.py>=bodies[i-1].py),
        shadowsFirst:trace.slice(0,bodies.length).every(v=>v.ground),
        other:bodies.some(v=>!v.hero&&v.py===y)});
      }
    }finally{NanlanDepth.actor=depth}
    return rows
  }""",npc[:2])
  assert all(row['hero']==1 and row['sorted'] and row['shadowsFirst'] and row['other'] for row in checks),checks
  for d,name in [(-6,'behind'),(6,'in-front')]:
   page.evaluate("([x,y])=>{state().player={x,y};camera.scene=null;render()}",[npc[0]+2,npc[1]+d])
   snap(name)
  place('hall')
  place('yard')
  page.set_viewport_size({'width':1024,'height':768})
  tested=page.evaluate("""async()=>{
    const s=state(),list=[];
    for(const gender of ['female','male'])for(const silk of [false,true]){
      s.gender=gender;s.actorState.outfit=silk?'nanlanSilk':'old';
      if(!await loadSceneAssets(s.scene))throw Error('outfit load');
      const img=images[NanlanLocomotion.atlasKey(gender,silk)];
      if(img.naturalWidth!==3120||img.naturalHeight!==1620)throw Error('atlas size');
      for(const dir of ['up','upLeft','left','downLeft','down','downRight','right','upRight']){
        direction=dir;
        for(const p of [0,1.2,3.8]){moving=p>0;walkFrame=p;render()}
      }
      list.push([gender,silk]);
    }
    moving=false;return list
  }""")
  place('banyanBrook');page.keyboard.down('d');page.wait_for_timeout(400);page.keyboard.up('d')
  page.evaluate("raw=>{engine.state=JSON.parse(raw);const result=engine.save();if(!result.ok)throw Error(result.message)}",valid)
  page.reload(wait_until='domcontentloaded');page.locator('#continueGame').click();page.wait_for_function("started&&active")
  assert page.evaluate("state().scene")=='gate'
  assert not errors,errors
  browser.close()
  return {'ok':True,'url':url,'depth':checks,'variants':tested,'scenes':['gate','hall','yard','banyanBrook']}
if __name__=='__main__':
 try: report=validate(os.environ.get('QA_GAME_URL','http://127.0.0.1:8765/'))
 except Exception: report={'ok':False,'error':traceback.format_exc(),'console':errors}
 (out/'report.json').write_text(json.dumps(report))
 print(report)
