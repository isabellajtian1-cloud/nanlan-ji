/* Presentation-only localization. Canonical game state and save identifiers stay unchanged. */
(function(root,factory){const api=factory(root.NANLAN_EN||{});if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanI18n=api;})(typeof globalThis!=='undefined'?globalThis:this,function(initial){
'use strict';
const KEY='nanlan_language',han=/[\u3400-\u9fff]/;let language='zh',catalog=initial,matcher=null,observer=null;
const originals=new WeakMap(),attributes=new WeakMap(),missing=new Set();
function configure(data){catalog=data;const keys=Object.keys(data).filter(k=>k).sort((a,b)=>b.length-a.length);matcher=new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');}
configure(initial);
function english(value){const s=String(value??'');if(!han.test(s))return s;const trim=s.trim();
 let m;
 if((m=trim.match(/^母亲正在裁绣。第\s*(\d+)\s*日清晨，新衣就能穿上。$/)))return 'Mother is sewing. The clothes will be ready at dawn on Day '+m[1]+'.';
 if((m=trim.match(/^第\s*(\d+)\s*日清晨可穿新衣；期间可以照常探索与经营。$/)))return 'The new clothes will be ready at dawn on Day '+m[1]+'. You may explore and trade while you wait.';
 if((m=trim.match(/^收茧缫丝 · (特级|普通)生丝 ×(\d+)，留蚕种 ×(\d+)$/)))return 'Harvest Cocoons & Reel Silk · '+(m[1]==='特级'?'Fine Raw Silk':'Raw Silk')+' ×'+m[2]+' · Keep Silkworm Eggs ×'+m[3];
 const seals={'南澜\n记印':'Nanlan\nChronicles\nSeal','借灯\n阁印':'Lantern’s\nGrace\nSeal','桑榆\n铺印':'Mulberry\nHope\nSeal'};if(Object.hasOwn(seals,trim))return seals[trim];
 if(Object.hasOwn(catalog,trim))return s.slice(0,s.indexOf(trim))+catalog[trim]+s.slice(s.indexOf(trim)+trim.length);
 // Dates and UI slots are assembled around numeric state. Keep numeric values intact.
 let source=s.replace(/当前游戏时间：第\s*(\d+)\s*日。按约观察会推进到对应时段；菜畦与其他事务同步经过这段时间。/g,(_,d)=>'Current game time: Day '+d+'. Keeping an observation appointment advances time to that slot. Crops and other activities progress during the same interval.').replace(/第\s*(\d+)\s*日闭账：收入/g,(_,d)=>'Day '+d+' closing: revenue ').replace(/第\s*(\d+)\s*片/g,'Fragment $1').replace(/第\s*(\d+)\s*日/g,'Day $1').replace(/第\s*(\d+)\s*格/g,'Slot $1');
 let out=source.replace(matcher,(key,offset)=>{let v=catalog[key];const before=source[offset-1],after=source[offset+key.length];if(before&&/[\w\u3400-\u9fff]/.test(before)&&/^[A-Za-z0-9]/.test(v))v=' '+v;if(after&&/[\w\u3400-\u9fff]/.test(after)&&/[A-Za-z0-9]$/.test(v))v+=' ';return v;});
 out=out.replace(/「/g,'“').replace(/」/g,'”').replace(/（/g,'(').replace(/）/g,')').replace(/：/g,': ').replace(/，/g,', ').replace(/。/g,'.').replace(/；/g,'; ').replace(/、/g,', ').replace(/《/g,'“').replace(/》/g,'”');
 if(han.test(out))missing.add(s);
 return out.replace(/[ \t]{2,}/g,' ').replace(/:([A-Za-z])/g,': $1').replace(/\b1 coins\b/g,'1 coin');
}
function t(s){return language==='en'?english(s):String(s??'');}
function ignored(el){return !el||el.closest('script,style,noscript,[data-no-localize]');}
function text(node){if(ignored(node.parentElement))return;const old=originals.get(node);const source=old&&node.data===old.output?old.source:node.data;const output=t(source);originals.set(node,{source,output});if(node.data!==output)node.data=output;}
const attributeNames=['aria-label','title','placeholder','alt','content'];
function attrs(el){if(ignored(el))return;let records=attributes.get(el);if(!records){records={};attributes.set(el,records);}for(const name of attributeNames){if(!el.hasAttribute(name))continue;const value=el.getAttribute(name),old=records[name],source=old&&value===old.output?old.source:value,output=t(source);records[name]={source,output};if(value!==output)el.setAttribute(name,output);}}
function walk(node){if(node.nodeType===3){text(node);return;}if(node.nodeType!==1&&node.nodeType!==9)return;if(node.nodeType===1){if(ignored(node))return;attrs(node);}for(const child of node.childNodes)walk(child);}
function observe(){if(!observer)return;observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributeNames});}
function flush(records){observer?.disconnect();for(const r of records){if(r.type==='characterData')text(r.target);else if(r.type==='attributes')attrs(r.target);else for(const n of r.addedNodes)walk(n);}observe();}
function setLanguage(value,persist=true){if(value!=='zh'&&value!=='en')return false;language=value;if(typeof document!=='undefined'){
 const pending=observer?.takeRecords()||[];observer?.disconnect();for(const r of pending){if(r.type==='characterData')text(r.target);}
 document.documentElement.lang=value==='en'?'en':'zh-CN';document.documentElement.dataset.language=value;
 document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===value)));
 walk(document.documentElement);observe();
 document.dispatchEvent(new CustomEvent('nanlanlanguagechange',{detail:{language:value}}));
 const status=document.getElementById('languageStatus');if(status)status.textContent=value==='en'?'English selected. Your progress is unchanged.':'已选择中文，游戏进度不变。';
 }
 if(persist&&typeof localStorage!=='undefined')try{localStorage.setItem(KEY,value);}catch{const status=typeof document!=='undefined'&&document.getElementById('languageStatus');if(status)status.textContent=value==='en'?'English selected for this visit. Browser storage is unavailable.':'已切换为中文；浏览器暂不能记住下次的语言选择。';}
 return true;
}
function matches(source,query){return (source+' '+english(source)).toLocaleLowerCase('en').includes(query.toLocaleLowerCase('en'));}
function boot(){try{const saved=localStorage.getItem(KEY);if(saved==='en'||saved==='zh')language=saved;}catch{}
 document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>{rootSound();setLanguage(b.dataset.language);}));
 const toggle=document.getElementById('languageToggle');if(toggle)toggle.addEventListener('click',()=>{rootSound();setLanguage(language==='en'?'zh':'en');});
 observer=new MutationObserver(flush);setLanguage(language,false);
}
function rootSound(){if(typeof window!=='undefined')window.NanlanAudio?.play('click');}
if(typeof document!=='undefined'){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();}
return {t,english,setLanguage,matches,configure,get language(){return language;},get missing(){return [...missing];},KEY};
});
