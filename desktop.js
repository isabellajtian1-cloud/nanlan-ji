/* Desktop controls keep menu history in memory, never in the game save. */
(function(){
let returnView=null,bagSession=false;
const parts=['speaker','line','panelExtra','choices','dialogPortraits','dialogKicker'];
function capture(){return {dialog:!$('dialog').hidden,map:!$('worldMap').hidden,gallery:!$('gallery').hidden,kind:dialogKind,object:dialogObject,focus:document.activeElement,previous:previousFocus,scroll:$('dialog').scrollTop,parts:parts.map(id=>({id,nodes:[...$(id).childNodes],hidden:$(id).hidden,className:$(id).className})),next:{hidden:$('next').hidden,text:$('next').textContent,onclick:$('next').onclick}};}
function restore(){if(!bagSession)return false;const v=returnView;bagSession=false;returnView=null;
 $('dialog').hidden=true;$('worldMap').hidden=!v.map;$('gallery').hidden=!v.gallery;
 if(v.dialog){for(const p of v.parts){$(p.id).replaceChildren(...p.nodes);$(p.id).hidden=p.hidden;$(p.id).className=p.className;}dialogKind=v.kind;dialogObject=v.object;previousFocus=v.previous;$('next').hidden=v.next.hidden;$('next').textContent=v.next.text;$('next').onclick=v.next.onclick;$('dialog').hidden=false;$('dialog').scrollTop=v.scroll;}
 else{dialogKind=null;dialogObject=null;}
 active=started&&!v.dialog&&!v.map&&!v.gallery&&!transitioning&&!document.hidden;keys={};path=[];moving=false;window.NanlanAudio?.setDialogue(v.dialog&&!$('dialogPortraits').hidden);if(v.focus?.isConnected)v.focus.focus({preventScroll:true});return true;}
function toggleBag(){if(bagSession){restore();return;}if(!started||transitioning)return;
 if(document.querySelector('[data-busy="true"]'))return;
 showBag();}
function enterBag(){if(bagSession)return;returnView=capture();bagSession=true;$('worldMap').hidden=true;$('gallery').hidden=true;dialogObject=null;}
function dialogue(title,text){$('choices').hidden=false;if(!dialogueCast(title).length)return;
 const paragraphs=String(text).split(/\n+/).filter(Boolean),pages=[];
 for(const paragraph of paragraphs){const sentences=paragraph.match(/[^。！？.!?]+[。！？.!?]?[”」]?/g)||[paragraph];let page='';for(const sentence of sentences){if(page.length+sentence.length>200&&page){pages.push(page);page='';}page+=sentence;}if(page)pages.push(page);}
 if(!pages.length)return;let cursor=0;const paint=()=>{$('line').textContent=pages[cursor];$('choices').hidden=cursor<pages.length-1;$('next').hidden=false;$('next').textContent=cursor<pages.length-1?'继续 · 空格':'继续 / 选择 · 空格';};paint();
 $('next').onclick=()=>{if(cursor<pages.length-1){cursor++;paint();return;}const choices=[...$('choices').querySelectorAll('button:not(:disabled)')];if(choices.length){$('next').hidden=true;choices[0].focus();}else closeDialog();};
}
window.NanlanDesktop={restore,discard(){bagSession=false;returnView=null;},toggleBag,enterBag,dialogue};
$('bagOpen').onclick=toggleBag;
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.target?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(e.target?.tagName))return;
 const k=e.key.toLowerCase();const stop=()=>{e.preventDefault();e.stopImmediatePropagation();};
 if(!$('audioPanel').hidden)return;
 if(k==='b'&&started){stop();if(!e.repeat)toggleBag();return;}
 if(k==='escape'&&bagSession){stop();if(!e.repeat)restore();return;}
 if(!$('dialog').hidden&&(k===' '||k==='arrowdown'||k==='arrowup')){
  stop();if(e.repeat)return;
  if(k===' '){if(!$('next').hidden)$('next').click();else{const choices=[...$('choices').querySelectorAll('button:not(:disabled)')];if(!choices.length)closeDialog();else {choices[0].focus();notice('方向键选择，Enter 确认，Esc 返回。');}}return;}
  const options=[...$('choices').querySelectorAll('button:not(:disabled)')];if($('choices').hidden||!options.length)return;let i=options.indexOf(document.activeElement);i=(i+(k==='arrowdown'?1:-1)+options.length)%options.length;options[i].focus();return;
 }
 if(k===' '&&active){stop();if(e.repeat)return;const near=visibleObjects().filter(o=>engine.near(o)).sort((a,b)=>Math.hypot(a.x-state().player.x,a.y-state().player.y)-Math.hypot(b.x-state().player.x,b.y-state().player.y))[0];if(near)interact(near);else notice('靠近人物或物件，按空格或 E 互动。');}
},true);
window.addEventListener('keyup',e=>{if(e.key===' '&&!['INPUT','TEXTAREA'].includes(e.target?.tagName)){e.preventDefault();}},true);
})();
