import hashlib, io, json, sys, time, urllib.request, zipfile, subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
out=Path('.art-qa')
sha=sys.argv[1]
repo='isabellajtian1-cloud/nanlan-ji'
url='https://isabellajtian1-cloud.github.io/nanlan-ji/?v=6105'
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
  with sync_playwright() as pw:
    browser=pw.chromium.launch(channel='chrome',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1100,'height':760})
    for i in range(32):
        try:
            page.goto(url,wait_until='domcontentloaded',timeout=25000)
            if 'V6.10.5' in page.title() and page.evaluate("!!window.NanlanDepth?.raster"):break
        except Exception: pass
        time.sleep(6)
    assert 'V6.10.5' in page.title(),page.title()
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
