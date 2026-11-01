/* Presentation-only localization. Canonical game state and save identifiers stay unchanged. */
(function(root,factory){const api=factory(root.NANLAN_EN||{});if(typeof module==='object'&&module.exports)module.exports=api;else root.NanlanI18n=api;})(typeof globalThis!=='undefined'?globalThis:this,function(initial){
'use strict';
const KEY='nanlan_language',han=/[\u3400-\u9fff]/;let language='zh',catalog=initial,matcher=null,observer=null;
const originals=new WeakMap(),attributes=new WeakMap(),missing=new Set();
const questNames={
 M01:['门外的行李','Belongings at the Gate'],M02:['今夜睡在哪里','A Place to Sleep Tonight'],M03:['后院见光','Light in the Back Garden'],M04:['南澜的第一顿饭','Our First Meal in Nanlan'],M05:['村口那碗茶','Tea at the Village Gate'],M06:['竹林里的借路人','A Stranger on the Bamboo Path'],M07:['等它慢慢长','Let It Grow in Its Own Time'],M08:['雨声里的书箱','The Book Chest in the Rain'],M09:['潮退以后','After the Tide Recedes'],M10:['镇上的第一张摊布','The First Market Cloth'],M11:['一单生意两种打算','One Order, Two Ways Forward'],M12:['南街有间空铺','An Empty Shop on South Street'],M13:['山雨未到','Before the Mountain Rain'],M14:['灯火借人','A Light to Share'],M15:['父亲没有按时回来','Father Has Not Come Home'],M16:['原来这些不是欠账','These Were Never Debts'],M17:['水痕上的账','Accounts in the Watermarks'],M18:['南街第一盏灯','The First Lantern on South Street'],M19:['京中来信','A Letter from the Capital'],M20:['岁末满庭','A Courtyard at Year’s End'],
 V2_01:['家宴后的一张铺讯','A Shop Notice After the Feast'],V2_02:['南街三时','Three Hours on South Street'],V2_03:['两扇铺门','Two Shop Doors'],V2_04:['纸上先算一遍','Count It on Paper First'],V2_06:['林师傅的尺','Master Lin’s Measure'],V2_07:['一车货 两处账','One Cart, Two Ledgers'],V2_08:['谁站在第一排','Who Stands in the Front Row'],V2_09:['开门之前','Before Opening the Door'],V2_10:['第一位客人','The First Customer'],V2_11:['午后的一笔大单','A Large Afternoon Order'],V2_13:['隔壁也卖竹篮','The Neighbor Sells Baskets Too'],V2_14:['熟客的一次空手来','A Regular Arrives Empty-Handed'],V2_15:['县集前的两张订单','Two Orders Before the County Market'],V2_16:['南澜来的货','Goods from Nanlan'],V2_17:['灯下再分一回工','Dividing the Work by Lamplight'],V2_18:['一街灯火','A Street of Lanterns']
};
function immersive(value){const source=String(value??''),out=source.replace(/\b(M\d{2}|V2_\d{2})\b\s*(?:[,，]\s*)?(?:[「“"]([^」”"]+)[」”"])?/g,(all,id,label,offset)=>{const name=label||questNames[id]?.[language==='en'?1:0];if(!name)return '';let result=language==='en'?'“'+name+'”':'「'+name+'」';if(language==='en'&&/[A-Za-z0-9]/.test(source[offset+all.length]||''))result+=' ';return result;});return language==='zh'?out.replace(/\s+「/g,'「'):out;}
function configure(data){catalog=data;const keys=Object.keys(data).filter(k=>k).sort((a,b)=>b.length-a.length);matcher=new RegExp(keys.map(k=>k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'),'g');}
configure(initial);
function english(value){const s=String(value??'');if(!han.test(s))return s;const trim=s.trim();
 let m;
 if((m=trim.match(/^母亲正在裁绣。第\s*(\d+)\s*日清晨，新衣就能穿上。$/)))return 'Mother is sewing. The clothes will be ready at dawn on Day '+m[1]+'.';
 if((m=trim.match(/^第\s*(\d+)\s*日清晨可穿新衣；期间可以照常探索与经营。$/)))return 'The new clothes will be ready at dawn on Day '+m[1]+'. You may explore and trade while you wait.';
 if((m=trim.match(/^行囊已有\s*(\d+)\s*·\s*单价\s*(\d+)\s*文\s*\/\s*份$/)))return 'In inventory: '+m[1]+' · '+m[2]+' coins each';
 if((m=trim.match(/^确认购入\s*·\s*(\d+)\s*份\s*\/\s*(\d+)\s*文$/)))return 'Confirm Purchase · '+m[1]+' items / '+m[2]+' coins';
 if((m=trim.match(/^已选\s*(\d+)\s*份\s*·\s*合计\s*(\d+)\s*文。家用不足，还差\s*(\d+)\s*文。$/)))return 'Selected: '+m[1]+' items · Total: '+m[2]+' coins. You need '+m[3]+' more coins.';
 if((m=trim.match(/^已选\s*(\d+)\s*份\s*·\s*合计\s*(\d+)\s*文。确认后一次放入行囊。$/)))return 'Selected: '+m[1]+' items · Total: '+m[2]+' coins. Confirm to add everything to your inventory.';
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
function t(s){return immersive(language==='en'?english(s):String(s??''));}
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
