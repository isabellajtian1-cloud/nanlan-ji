(()=>{
 'use strict';
 const dict=window.NANLAN_EN||(window.NANLAN_EN={});Object.assign(dict,{'大明 · 岭南 · 山海人家':'MING DYNASTY · LINGNAN · A HOME BETWEEN HILLS AND SEA','启程 · 写下你的故事':'Begin · Write Your Story'});window.NanlanI18n?.configure(dict);
 const host=document.createElement('section');host.id='characterCreate';host.hidden=true;host.dataset.noLocalize='';host.setAttribute('role','dialog');host.setAttribute('aria-modal','true');host.setAttribute('aria-labelledby','characterHeading');
 host.innerHTML=`<form id="characterForm" class="character-sheet"><header><div><small data-copy="book"></small><h2 id="characterHeading" data-copy="heading"></h2></div><button type="button" id="characterClose" data-copy="close"></button></header><p class="character-intro" data-copy="intro"></p><div class="character-layout"><div class="character-preview"><div id="characterPortrait" class="identity-sprite" role="img"></div><span id="characterNamePreview"></span><small data-copy="preview"></small></div><div class="character-fields"><fieldset><legend data-copy="name"></legend><div class="identity-name-fields"><label><span data-copy="surname"></span><input id="characterSurname" name="surname" maxlength="24" value="李" required autocomplete="off" spellcheck="false"></label><label><span data-copy="given"></span><input id="characterGiven" name="givenName" maxlength="24" value="明棠" required autocomplete="off" spellcheck="false"></label></div><p data-copy="hint"></p></fieldset><fieldset><legend data-copy="portrait"></legend><div class="identity-options"><button type="button" data-portrait="female" aria-pressed="true"><span class="identity-sprite" data-gender="female" aria-hidden="true"></span><b data-copy="female"></b></button><button type="button" data-portrait="male" aria-pressed="false"><span class="identity-sprite" data-gender="male" aria-hidden="true"></span><b data-copy="male"></b></button></div></fieldset><p id="characterError" role="alert"></p><button id="characterConfirm" type="submit" data-copy="confirm"></button><p class="identity-footnote" data-copy="footnote"></p></div></div></form>`;
 document.body.append(host);
 const $=id=>document.getElementById(id),form=$('characterForm'),surname=$('characterSurname'),given=$('characterGiven');
 const copy={book:['南澜行记 · 卷首','NANLAN · A NEW JOURNEY'],heading:['落笔，便是你的人生','A name. A new beginning.'],close:['返回 ×','Back ×'],intro:['山海之间，总有一段故事，等你亲自写下。','Between the hills and sea, a story waits for you.'],preview:['此身入画，与你同行','Your companion through this story'],name:['一 · 题名','I · Your name'],surname:['姓','Family name'],given:['名','Given name'],hint:['姓与名分开填写，也支持复姓。','Enter each part separately; compound family names are welcome.'],portrait:['二 · 择一幅立绘','II · Choose your portrait'],female:['女主角','Female protagonist'],male:['男主角','Male protagonist'],confirm:['落笔启程 →','Begin your story →'],footnote:['姓名与形象将随本次旅程保存。','Your name and portrait will be saved with this journey.']};
 let gender='female',accept=null,previous=null,dirty=false;
 const english=()=>window.NanlanI18n?.language==='en';
 function refresh(){
  for(const el of host.querySelectorAll('[data-copy]'))el.textContent=copy[el.dataset.copy][english()?1:0];
  $('characterPortrait').dataset.gender=gender;$('characterPortrait').setAttribute('aria-label',copy[gender][english()?1:0]);
  $('characterNamePreview').textContent=NanlanCharacter.display({surname:surname.value,givenName:given.value});
  for(const b of host.querySelectorAll('[data-portrait]'))b.setAttribute('aria-pressed',String(b.dataset.portrait===gender));
 }
 function close(){host.hidden=true;accept=null;previous?.focus({preventScroll:true});}
 $('characterClose').onclick=close;
 for(const b of host.querySelectorAll('[data-portrait]'))b.onclick=()=>{gender=b.dataset.portrait;if(!dirty)given.value=gender==='male'?'云舟':'明棠';refresh();};
 surname.oninput=()=>{refresh();$('characterError').textContent='';};given.oninput=()=>{dirty=true;refresh();$('characterError').textContent='';};
 form.onsubmit=e=>{e.preventDefault();try{const identity=NanlanCharacter.validate({surname:surname.value,givenName:given.value,portraitId:gender},gender),done=accept;close();done?.({...identity,gender});}catch(err){$('characterError').textContent=english()?'Enter a family and given name (up to 24 letters each). Use letters, spaces, apostrophes or hyphens.':err.message;}};
 document.addEventListener('keydown',e=>{
  if(host.hidden)return;
  if(e.key==='Escape'){e.preventDefault();close();}else if(e.key==='Tab'){
   const items=[...host.querySelectorAll('button,input')].filter(el=>!el.disabled),first=items[0],last=items.at(-1);
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  e.stopImmediatePropagation();
 },true);
 document.addEventListener('keyup',e=>{if(!host.hidden)e.stopImmediatePropagation();},true);
 document.addEventListener('nanlanlanguagechange',refresh);
 window.NanlanCharacterUI={open(value,callback){if(!host.hidden)return;gender=value;accept=callback;previous=document.activeElement;refresh();host.hidden=false;surname.focus();},isOpen:()=>!host.hidden};
})();
