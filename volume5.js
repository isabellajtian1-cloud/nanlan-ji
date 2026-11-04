/* Volume V is played at real scene objects; each click changes a visible record or place. */
(()=>{'use strict';const V=N.v5,L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
const cast={chen:['陈伯','Uncle Chen'],doctor:['许青禾','Xu Qinghe'],mother:['母亲','Mother'],father:['父亲','Father'],grandfather:['祖父','Grandfather'],cen:['阿岑','A-Cen'],xiaoman:['罗小满','Luo Xiaoman'],zhou:['周成','Zhou Cheng'],seaMerchant:['苏茂','Su Mao'],yu:['沈晚渔','Shen Wanyu'],child:['村童','Village Child'],player:['你','You']};
const moments={
 brine:['把井绳晾到日光下，看纤维间留下什么','Lay the rope in sunlight and inspect its fibres'],
 clear:['先用脚尖试稳浮石，再挪开枯枝','Test the loose stones before moving deadfall'],
 build:['把两节竹槽空接，沿缝慢慢摸一遍','Dry-fit two troughs and feel the whole seam'],
 rinse:['看头水带走木屑，再接第二碗','Watch the first run carry shavings away'],
 forgotten:['轻叩院门，先听屋里有没有应声','Knock softly and wait for an answer'],
 night:['熄掉说话声，在灯下只听水响','Fall silent and listen to the water by lantern'],
 storm:['按住木牌，和晚渔一起看潮头','Hold the tide board steady and read the surge'],
 home:['扶稳取水碗，让清水慢慢落进缸里','Steady the bowl and let clear water fill the jar']
};
let useOriginal=false;const touched=new Set();
function note(txt){const p=document.createElement('p');p.className='production-note';p.textContent=txt;$('panelExtra').append(p);}
function go(sc,id){closeDialog();startNavigation(sc,id);}
function route(label,sc,id){navButton(label,()=>go(sc,id),'v5-route-'+id);}
function objective(){const s=state(),r=V.first(s);if(!r)return null;const [sc,id]=V.target(s,r[0]);return {sc,id,r};}
function nextRoute(o){const to=objective();if(!to)return;if(o&&to.sc===state().scene&&to.id===o.id)button(to.r[3],()=>panel(o),'v5-continue');else route(to.r[3],to.sc,to.id);}
function visible(s,o){
 if(o.id==='v5Ledger')return !!s.flags.volume4Complete;
 if(o.action!=='v5Scene')return true;
 if(!s.story5)return false;
 const to=objective();return !!s.flags.volume5Complete||to?.id===o.id||['v5Ledger','v5Well','v5GuildBoard','v5Jar'].includes(o.id);
}
function objectAction(label,key,choice,again){return actButton(label,'v5Step',{key,choice,sequence:state().revision},again,'clear-water-'+key+(choice??''));}
function prologue(o){
 activity(L('后堂 · 一碗带咸味的水','Back Hall · A Bowl Touched by Salt'),L('天刚亮，陈伯把一只盖着粗布的碗放到后堂桌上。井绳晒干后结着细白，碗里的水尝来微咸。无人说这是灾，也没人把它当作寻常。','At first light, Uncle Chen sets a cloth-covered bowl on the back-hall table. Fine white crystals cling to the dried well rope, and the water tastes faintly of salt. No one calls it a disaster; no one dismisses it.'));
 note(L('第五卷从井边的一碗水开始。公所续单与前四卷日常仍可照常经营。','Volume V begins with one bowl from the village well. Guild orders and all earlier daily play remain available.'));
 actButton(L('接过水样，去井边亲自看','Take the sample and inspect the well'),'v5Start',{sequence:state().revision},()=>{closeDialog();notice(L('陈伯在村井旁等你。','Uncle Chen is waiting by the village well.'));},'v5-start');
 button(L('先把手边事情做完','Return to Today’s Work'),closeDialog,'v5-later',true,false);
}
function reader(i,o,pos=0){const ch=V.script[i],b=ch.beats[pos],en=window.NanlanI18n?.language==='en';activity(cast[b[0]][en?1:0],b[en?2:1],'v5-voices');$('dialogKicker').textContent=ch.title[en?1:0]+' · '+(pos+1)+' / '+ch.beats.length;
 if(pos+1<ch.beats.length)button(L('听下一句','Hear the Next Line'),()=>reader(i,o,pos+1),'v5-read-next');
 else button(L('回到手边的事','Return to the Work'),()=>panel(o),'v5-read-back');}
function ledger(){
 const s=state(),t=s.story5;activity(L('清渠簿','Clear-Water Ledger'),t?L('这里记水从哪里来、经过谁的手、哪一处漏过，也记没有来到井边的人。','It records where water came from, whose hands carried it, where it leaked, and who never reached the well.'):'');
 if(t){note(L('已洗槽 '+t.clearRuns+' 次 · 已实修 '+t.repairs+' 处','Trough flushed '+t.clearRuns+' · repairs completed '+t.repairs));if(t.named)note(L('共用水路：','Shared waterway: ')+t.named);
 const d=document.createElement('details'),h=document.createElement('summary');h.textContent=L('逐页查看清渠记录','Read the Waterway Record');d.append(h);for(const e of t.ledger){const p=document.createElement('p');p.textContent=e.text;d.append(p);}$('panelExtra').append(d);}
 nextRoute(null);
}
function panel(o,stage=0){
 const s=state(),to=objective(),r=to?.r;if(!to||to.sc!==s.scene||to.id!==o.id){activity(o.label,s.flags.volume5Complete?L('清渠仍照轮值流着。今日若有漏处，也知道该去找哪一本簿、哪一双手。','The channel still runs by its watch. A leak today has a ledger and a pair of hands to answer it.'):L('水路上的每一处都要走到眼前再动手。','Every part of the waterway must be handled where it stands.'));nextRoute(o);}
 else{
  const k=r[0],i=V.chapter[k],ch=V.script[i],en=window.NanlanI18n?.language==='en',line=ch.beats[Math.min(V.chapters[i].indexOf(r),ch.beats.length-1)];
  activity(cast[line[0]][en?1:0],line[en?2:1],'v5-story');$('dialogKicker').textContent=ch.title[en?1:0];note(r[3]);
  const m=moments[k];
  if(m&&stage===0){button(m[en?1:0],()=>{touched.add(k);panel(o,1);},'v5-hands-'+k,false,false);}
  else if(r.length>4){for(let c=0;c<r.length-4;c++)objectAction(r[c+4],k,c,()=>outcome(o,k,i));}
  else objectAction(r[3],k,undefined,()=>outcome(o,k,i));
  button(L('听这一章的前后对白','Hear the Full Scene'),()=>reader(i,o),'v5-read-scene',true,false);
 }
 button(L('翻开清渠簿','Open the Clear-Water Ledger'),ledger,'v5-ledger',true,false);
 if(o.action!=='v5Scene')button(L('照常使用这个地点','Use This Place as Usual'),()=>{useOriginal=true;void interact(o);},'v5-usual',true,false);
}
function outcome(o,k,i){const t=state().story5,final=k==='home';activity(final?L('清水满缸','The Jar Filled Clear'):V.script[i].title[window.NanlanI18n?.language==='en'?1:0],final?L('水落进缸里。院门外有人经过，看见缸边留着的碗，脚步慢了一下。','Water fills the jar. Someone passing the gate notices the bowl left beside it and slows for a moment.'):L('这一处已经亲手办妥，清渠簿也留下了实情。','This part is done by hand, and the ledger keeps what truly happened.'));
 nextRoute(o);button(L('沿路继续','Continue Along the Road'),closeDialog,'v5-close',true,false);if(final)button(L('回看十八章清渠簿','Review the Eighteen Chapters'),ledger,'v5-final-book');}
function offer(o){if(useOriginal){useOriginal=false;return false;}const s=state();
 if(o.id==='v5Ledger'&&V.canStart(s)){prologue(o);return true;}
 if(!s.story5||o.type==='door')return false;const to=objective();
 if(to&&to.sc===s.scene&&to.id===o.id){if(!touched.has(to.r[0])){touched.add(to.r[0]);panel(o,0);}else panel(o);return true;}
 if(o.action==='v5Scene'){panel(o);return true;}return false;
}
window.NanlanV5={offer,visible,ledger};
})();