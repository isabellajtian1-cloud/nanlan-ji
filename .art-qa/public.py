import os, hashlib, io, json, sys, time, urllib.request, zipfile, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('.art-qa')
sha=sys.argv[1]
repo='isabellajtian1-cloud/nanlan-ji'
url='https://isabellajtian1-cloud.github.io/nanlan-ji/?v=6105&build='+sha[:12]
archive='https://github.com/'+repo+'/archive/'+sha+'.zip'
report={'sha':sha,'url':url,'archive':archive}
try:
  raw=urllib.request.urlopen(archive,timeout=90).read()
  z=zipfile.ZipFile(io.BytesIO(raw))
  prefix=z.namelist()[0].split('/')[0]+'/'
  def git_blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
  source={}
  for line in subprocess.check_output(['git','ls-tree','-rz',sha]).split(b'\0'):
    if line:
      meta,p=line.split(b'\t',1)
      source[p.decode()]=meta.split()[-1].decode()
  files={n[len(prefix):] for n in z.namelist() if not n.endswith('/')}
  assert files==set(source)
  for path,h in source.items():assert git_blob(z.read(prefix+path))==h,path
  report.update(files=len(files),zip_verified=True)
  try:
    api='https://api.github.com/repos/'+repo
    headers={'User-Agent':'Nanlan-release-check','Authorization':'Bearer '+os.environ.get('GH_TOKEN','')}
    for key,path in [('pages','/pages'),('builds','/pages/builds?per_page=4'),('runs','/actions/runs?branch=main&per_page=7')]:
      try:
        obj=json.load(urllib.request.urlopen(urllib.request.Request(api+path,headers=headers),timeout=15))
        if key=='pages':report[key]=[obj.get('status'),obj.get('build_type'),obj.get('source')]
        if key=='builds':report[key]=[[e.get('status'),e.get('commit'),e.get('error')] for e in obj]
        if key=='runs':report[key]=[[e.get('id'),e.get('name'),e.get('status'),e.get('conclusion'),e.get('head_sha')] for e in obj['workflow_runs']]
      except Exception as e:report[key]=repr(e)
  except Exception:pass
  (out/'deployment.json').write_text(json.dumps(report))
  subprocess.run(['git','config','user.name','github-actions[bot]'],check=True)
  subprocess.run(['git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com'],check=True)
  subprocess.run(['git','add','--','.art-qa/deployment.json'],check=True)
  subprocess.run(['git','commit','-m','Record Pages build and deployment status'],check=True)
  subprocess.run(['git','push','origin','HEAD:character-art-6105'],check=True)
  with sync_playwright() as pw:
    browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1100,'height':760})
    report['seen']=[]
    for i in range(55):
        try:
            actual=url+'&check='+str(i)
            page.goto(actual,wait_until='domcontentloaded',timeout=25000)
            if page.title() not in report['seen']:report['seen'].append(page.title())
            if 'V6.10.5' in page.title() and page.evaluate("!!window.NanlanDepth?.raster"):break
        except Exception: pass
        time.sleep(9)
    assert 'V6.10.5' in page.title(),page.title()
    report['url']=actual
    page.evaluate("()=>{engine.reset('female');engine.save()}")
    page.reload(wait_until='domcontentloaded')
    page.locator('#continueGame').click()
    page.wait_for_function("started&&active&&!transitioning")
    info=page.evaluate("()=>[document.title,state().scene,images.gaitFemale.naturalWidth,images.gaitFemale.naturalHeight]")
    assert info[2:]==[3120,1620],info
    report.update(online=True,loaded=info)
except Exception as e: report['error']=repr(e)
(out/'public.json').write_text(json.dumps(report,ensure_ascii=False))
print(report)
