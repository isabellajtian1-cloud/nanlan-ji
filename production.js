/* Garden-like touch controls for mulberry, silkworms, fish, family clothes and shop naming. */
(()=>{'use strict';
const M=window.NanlanProductionModel,labels=['池边桑畦','廊下蚕匾','桑基鱼塘'];
let selected=0,pending=null,morningShown=false,morningLoading=false,artSerial=0;
const nameEcho={
'南澜记':['祖父：「初来时，我只想着记清归路。住到今日，倒有许多舍不得忘的事了。」','父亲：「那就记下来。第一顿热饭，第一位肯赊米的街坊，还有今日这间铺子。往后的日子，咱们接着写。」'],
'借灯阁':['母亲：「风雨那夜，咱们自己的灯都快灭了，陈伯还护着灯火来敲门。我一直记着。」','父亲：「这名字好。往后铺里留一盏灯，晚归的人也能照着走一段。借来的那点暖意，总该传下去。」'],
'桑榆铺':['祖父：「年轻时读‘失之东隅，收之桑榆’，只觉得是句宽慰人的话。如今在这里种桑、过日子，才知道这话也得一日一日地过。」','母亲：「等桑叶养出好丝，咱们便把这里的花样绣上去。往后客人问起铺名，也好同他说说咱们在南澜的日子。」']};
const clothesWords='（祖父习惯性地摸向旧衣磨损的袖口，指尖却停在一枝细密的新绣上。他将衣袖迎着晨光抬起。）\n\n祖父：「这是我记在册里的那枝花？你母亲竟将它绣到衣上了。」\n\n「从前总念着京里的绸缎，以为这一走，往后便只有旧衣补旧衣。如今这丝是你亲手养出来的，花样也是咱们在南澜一笔一笔记下的……」\n\n（他慢慢抚平衣襟，眼里有了笑意。）\n\n「好，穿着它出门走走。也叫街坊看看，咱们家的桑树，已经养出好丝来了。」';
function cell(file,box,cls,w,h){const id='production-crop-'+(++artSerial);return '<svg class="'+cls+'" viewBox="'+box.join(' ')+'" aria-hidden="true"><defs><clipPath id="'+id+'"><rect x="'+box[0]+'" y="'+box[1]+'" width="'+box[2]+'" height="'+box[3]+'"/></clipPath></defs><image clip-path="url(#'+id+')" href="'+file+'" width="'+w+'" height="'+h+'"/></svg>';}
function art(row,col,cls='production-art'){const ys=[0,370,680,1024];return cell('production-stages-v399.png',[col*384,ys[row],384,ys[row+1]-ys[row]],cls,1536,1024);}
function itemArt(id){const i=M.itemIds.indexOf(id);if(i<0)return '';const ys=[0,445,805,1254],row=Math.floor(i/3);return cell('production-items-v399.png',[i%3*418,ys[row],418,ys[row+1]-ys[row]],'inventory-art',1254,1254);}
function paragraph(text,cls='production-note'){const p=document.createElement('p');p.className=cls;p.textContent=text;$('panelExtra').append(p);return p;}
function nav(label,scene,id){button(label,()=>{closeDialog();startNavigation(scene,id);},'silk-nav-'+id,true);}
function action(label,name,p={},again=()=>show(selected),ready=true,why='材料尚未备齐。'){const b=actButton(label,name,{sequence:state().revision,...p},again,'silk-'+name);if(!ready){b.disabled=true;paragraph(why);}return b;}
function stage(i){const s=state(),p=s.production,z=M.status(s);if(i===0)return !p.mulberry.planted?0:!p.mulberry.watered?1:z.mulberryReady?2:p.mulberry.harvests?3:1;if(i===1)return z.wormAge===null?0:z.wormReady?3:z.wormAge>=180?2:1;return !p.fish.stocked?0:p.fish.fedAt===null?1:z.fishReady?3:2;}
function statusText(i){const s=state(),p=s.production,z=M.status(s);if(i===0)return !p.mulberry.planted?'空畦待种':!p.mulberry.watered?'桑苗待浇水':z.mulberryReady?'桑叶可采':'长叶中 · '+Math.ceil(p.mulberry.readyAt-s.worldTick)+' 分钟';if(i===1)return z.wormAge===null?'空匾待养':z.wormReady?(p.worms.tended?'整匾蚕茧待缫':'普通生丝待缫'):z.careOpen?(p.worms.cleaned?'蚕沙已清 · 待支窗':'吐丝前 · 可清扫开窗'):p.worms.tended?'已照料 · 等待结茧':z.wormAge>=300?'已上簇 · 等待结茧':'食叶中 · '+Math.ceil(180-z.wormAge)+' 分钟后照料';return !p.fish.stocked?'空塘待放苗':p.fish.fedAt===null?'鱼苗待投喂':z.fishReady?'塘鱼可收':'鱼群生长 · '+Math.ceil(z.fishDue-s.worldTick)+' 分钟';}
function show(i=selected){selected=i;const s=state(),p=s.production,z=M.status(s);activity('后院 · 桑基鱼塘',pending?'已拿起'+pending.label+'，请点'+labels[pending.index]+'放下。':'选中桑畦、蚕匾或鱼塘，再亲手照料。\n离开面板后继续生长；也可以在池边守候。错过蚕事照料仍会结茧，不会死亡或罚款。','production');
 if(!s.flags.volume2Started){paragraph('第二卷开启后，母亲会备下桑苗、蚕种和鱼苗。');nav('回正厅读铺讯','hall','v2Family');return;}
 const board=document.createElement('div');board.className='production-board';for(let n=0;n<3;n++){const b=document.createElement('button');b.className='production-tile'+(selected===n?' selected':'');b.setAttribute('aria-label',labels[n]+'，'+statusText(n));b.setAttribute('aria-pressed',String(selected===n));b.innerHTML=art(n,stage(n))+'<strong>'+labels[n]+'</strong><small>'+statusText(n)+'</small>';b.onclick=async()=>{if(b.disabled)return;window.NanlanAudio?.play('click');selected=n;if(pending?.index===n){const task=pending;pending=null;b.disabled=true;await perform(task.action,{sequence:state().revision},()=>show(n));if(b.isConnected)b.disabled=false;}else{pending=null;show(n);}};board.append(b);}$('panelExtra').append(board);
 const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
 const weather=N.rural.weather(s),tomorrow=N.rural.weather(s,N.rural.day(s)+1);
 const sky={fair:L('天晴，桑叶宜采。','Clear skies. A good day to pick leaves.'),damp:L('回南天，砖面返潮。湿叶先摊开，免得这一匾少出一束。','A damp spell. Air wet leaves first to keep the full silk yield.'),rain:L('雨脚渐密，塘水将涨，午前可扎篱保塘。','Floodwater is rising. Mend the fence before noon to protect the fish.')};
 paragraph(sky[weather]);if(N.clock(s).minute>=1020)paragraph(L('明晨塘边','Tomorrow at the pond')+' · '+sky[tomorrow]);
 if(!p.kit){paragraph(L('修塘先备枯枝二份、竹材一根。安塘二十分钟，费四点体力。','Bring two wood and one bamboo. Prepare the bank in 20 minutes for four stamina.'));action('整理池岸、安放蚕匾，接过初养物资','silkKit',{},()=>show(0));return;}
 const pick=(label,index,name)=>button('拿起'+label+' → 点'+labels[index],()=>{pending={label,index,action:name};show(index);},'silk-pick-'+index);
 if(selected===0){
   if(!p.mulberry.planted)pick('桑苗',0,'silkPlant');
   else if(!p.mulberry.watered){action('提桶浇透桑苗 · 桶内水 ×1','silkWater',{},undefined,s.bucketWater>0,'水桶空了，请先到水缸取水。');if(!s.bucketWater)nav('去水缸装水','yard','waterJar');}
   else if(z.mulberryReady)action(L('采下六份桑叶，留树再长','Pick Six Leaves and Leave the Tree Growing'),'silkLeaves');
   else if(!p.mulberry.fertilized&&s.bag.pondMud)action(L('敷塘泥 · 本轮快一小时','Dress with Pond Mud · One Hour Earlier'),'silkFertilize');
   if(s.bag.wetLeaf){action(L('摊开湿叶 · 一刻钟','Air Wet Leaves · 15 Minutes'),'silkDryLeaves');action(L('用一份柴温叶 · 五分钟','Dry with One Wood · 5 Minutes'),'silkDryLeaves',{heat:true});}
 }
 if(selected===1){
   if(z.wormAge===null){
     paragraph(L('安蚕用一份蚕种、三份桑叶。干叶足可得两束，湿叶只够一束。','Use one egg lot and three leaves. Dry leaves yield two skeins. Wet leaves yield one.'));
     if((s.bag.silkwormEgg||0)>0&&(s.bag.mulberryLeaf||0)+(s.bag.wetLeaf||0)>=3)pick('蚕种与桑叶',1,'silkStart');
     else paragraph(L('种苗可向村里的乡邻补给摊买，桑叶到池边采。','Buy eggs at the village pantry and pick leaves here.'));
   }else if(z.wormReady){
     if(!p.worms.newLot)action(L('收起先前养好的这一匾','Gather the Batch You Started Earlier'),'silkHarvest');
     else{button(L('温茧拾绪 · 全部缫丝','Warm the Cocoons · Reel the Whole Batch'),()=>reel(false),'silk-reel-all');
       if(p.worms.yield>1)button(L('留一份种茧，再温茧拾绪','Keep Seed Cocoons and Reel the Rest'),()=>reel(true),'silk-reel-keep',true);}
   }else if(z.careOpen){
     paragraph(L('母亲：「快上簇了。拿竹刮轻清匾底，把窗支开一道缝，莫让风直吹。」','Mother says, “They will spin soon. Clean the tray gently and crack the window, out of the draught.”'));
     action(L('清匾支窗 · 照料这一次','Clean the Tray and Open the Shutter'),'silkCare');
   }else paragraph(p.worms.tended?'匾底清爽，窗边透进微凉。让它们安静吐丝吧。':'桑叶已备足，不必反复投喂。吐丝前再来清匾支窗。');
 }
 if(selected===2){
   if(!p.fish.stocked)pick('鱼苗',2,'silkStockFish');
   else{
     if(weather==='rain'&&p.fish.start!=null&&!p.fish.protected&&!z.rainLoss&&!z.fishReady&&N.clock(s).minute+20<=720)action(L('扎篱通水 · 竹材一根','Secure the Fence with One Bamboo'),'silkGuard');
     if(p.fish.fedAt===null){
       action(L('把一份蚕沙撒入塘中','Scatter One Share of Silkworm Litter'),'silkFeedFish',{food:'litter'},undefined,(s.bag.silkwormCompost||0)>0,L('可在清蚕匾或收茧时取得蚕沙。','Collect litter when cleaning the tray or gathering cocoons.'));
       action('投一份鱼食','silkFeedFish',{food:'feed'},undefined,N.available(s,'fishFeed')>=1,'鱼食不足，可用桑叶投喂。');
       action('投桑叶 ×2','silkFeedFish',{food:'leaves'},undefined,(s.bag.mulberryLeaf||0)+(s.bag.wetLeaf||0)>=2,'先去桑畦采两份桑叶。');
     }else if(z.fishReady){
       action(L('起鱼取泥 · 全收','Lift the Fish and Gather Pond Mud'),'silkHarvestFish');
       if(p.fish.start!=null)action(L('少收一尾，留苗取泥','Keep One Fry and Gather Pond Mud'),'silkHarvestFish',{keep:true});
     }else paragraph(z.rainLoss?L('水已漫过岸，鱼慢长两小时，仍可收两尾。','The flood reached the bank. Two fish will be ready two hours later.'):'鱼群已吃过一餐，会慢慢长大；不必反复投喂。');
   }
 }
 if((p.mulberry.watered&&!z.mulberryReady)||(z.wormAge!==null&&!z.wormReady)||(p.fish.fedAt!==null&&!z.fishReady))action(z.careOpen?'这次不照料，守候它自然结茧':'在池边守候至下一生长阶段','silkWait',{skipCare:z.careOpen},undefined,N.clock(s).minute<1320,'夜已深，回东厢房睡一夜可继续推进生长。');
 if(N.clock(s).minute>=1320)nav('回卧房睡一夜','bed','bedRest');
 button('查看生产成果与新衣进度',progress,'silk-progress',true);button('收好农具，返回庭院',()=>{pending=null;closeDialog();},'silk-resume',true);
}
function reel(keep){
 const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
 const s=state(),w=s.production.worms;
 activity(L('廊下 · 温茧抽丝','Under the Eaves · Reel the Silk'),w.tended?L('拾起丝头。丝圈亮起时点木轮或按空格；也可慢慢缫完，收日用丝。','Pick up the thread. Tap the reel or press Space when the loop shines. A slow reel always gives plain silk.'):L('这一匾已自然成茧。慢慢抽丝，也能收得日用丝。','This tray spun on its own. Reel it slowly for plain silk.'),'silk-reel');
 paragraph(L('枯枝一份 · 十分钟 · 两点体力','One wood · 10 minutes · Two stamina'));
 const revision=s.revision;
 if(!(s.bag.wood>=1&&s.stamina>=2&&N.clock(s).minute+10<=1320)){paragraph(L('先备柴、歇脚，或明早带够工时再来。茧会留在匾上。','Bring fuel and leave time and strength for the work. The cocoons will wait.'));button('回池边',()=>show(1),'reel-back');return;}
 let elapsed=0,last=null,raf=0,started=false,finished=false,held=false;const hits=new Set(),beats=[2000,4000,6000];
 const box=document.createElement('div');box.className='silk-reel-board';box.innerHTML=art(1,3);
 const wheel=document.createElement('button');wheel.type='button';wheel.textContent=L('木轮 · 拾绪','Reel · Pick up the Thread');
 const bar=document.createElement('progress');bar.max=8000;bar.value=0;
 const echo=document.createElement('span');echo.setAttribute('role','status');box.append(wheel,bar,echo);$('panelExtra').append(box);
 const alive=()=>box.isConnected&&!$('dialog').hidden&&dialogKind==='silk-reel';
 const target=()=>beats.findIndex((ms,i)=>!hits.has(i)&&Math.abs(elapsed-ms)<=450);
 function stop(){cancelAnimationFrame(raf);window.removeEventListener('keydown',key,true);window.removeEventListener('keyup',release,true);document.removeEventListener('visibilitychange',pause);}
 async function finish(score){if(finished||!alive())return;finished=true;stop();wheel.disabled=true;bar.value=8000;const result=await perform('silkHarvest',{sequence:revision,keep,hits:score},()=>show(1));if(!result.ok&&alive()){show(1);paragraph(result.message);}}
 function frame(t){if(!alive()){stop();return;}if(!document.hidden&&last!==null)elapsed+=Math.max(0,t-last);last=document.hidden?null:t;bar.value=elapsed;wheel.classList.toggle('thread-loose',target()>=0);if(elapsed>=8000){finish(hits.size);return;}raf=requestAnimationFrame(frame);}
 function tap(){if(!alive()||finished)return;if(!started){started=true;wheel.textContent=L('引丝 · 空格或轻点','Draw the Thread · Space or Tap');raf=requestAnimationFrame(frame);return;}const i=target();if(i>=0){hits.add(i);wheel.classList.remove('thread-loose');echo.textContent=L('丝路已理顺','Thread caught')+' · '+hits.size+'/3';window.NanlanAudio?.play('click');}}
 function key(e){if(!alive()){stop();return;}if(e.code==='Space'&&(e.target===wheel||e.target===$('skip')||e.target===document.body)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat&&!held){held=true;tap();}}}
 function release(e){if(e.code==='Space')held=false;}
 function pause(){last=null;held=false;}
 box.addEventListener('reelresume',()=>{if(finished)return;last=null;cancelAnimationFrame(raf);if(started)raf=requestAnimationFrame(frame);if(w.tended){window.addEventListener('keydown',key,true);window.addEventListener('keyup',release,true);document.addEventListener('visibilitychange',pause);}});
 if(w.tended){wheel.onclick=tap;wheel.focus();window.addEventListener('keydown',key,true);window.addEventListener('keyup',release,true);document.addEventListener('visibilitychange',pause);}else wheel.hidden=true;
 button(L('慢慢缫完 · 收日用丝','Reel Slowly for Plain Silk'),()=>finish(0),'reel-slow',true);
 button('回池边',()=>{stop();show(1);},'reel-back',true);
}
function care(){const p=state().production,z=M.status(state());activity('廊下蚕匾 · 吐丝前的一次照料','母亲：「蚕儿快上簇了。把匾底的蚕沙轻轻清净，再将窗扇支开一道缝，散散闷气，别让风直吹着它们。」','silk-care');
 if(!z.careOpen){paragraph(p.worms.tended?'这次照料已经完成，不必再惊动。':'时机已过也不妨事，蚕茧仍会照常成熟。');button('回池边',()=>show(1),'silk-care-back');return;}
 const tray=document.createElement('div');tray.className='silk-care-tray';tray.innerHTML=art(1,p.worms.cleaned?1:2);$('panelExtra').append(tray);
 if(!p.worms.cleaned){paragraph('沿蚕匾轻划一次清扫，或点下方按钮。两步照料几秒即可，不考手速。');const b=action('用竹刮板轻清蚕沙','silkClean',{},care);let start=null;tray.onpointerdown=e=>{start=[e.clientX,e.clientY];tray.setPointerCapture(e.pointerId);};tray.onpointerup=e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>=30)b.click();start=null;};tray.onpointercancel=()=>start=null;}
 else{paragraph('蚕沙已清好，收作堆肥。再支开窗扇，让屋里透一口气。');action('支开一道窗缝 · 完成照料','silkVent',{},()=>{show(1);paragraph('母亲点点头，示意你放轻脚步，让蚕儿安静吐丝。');});}
 button('先回池边',()=>show(1),'silk-care-back',true);
}
function progress(){dialogObject=null;activity('桑叶成丝 · 家中有新衣','桑叶养蚕，蚕沙喂鱼，塘泥敷桑。生丝与塘鱼都可带到南街出售。','production-progress');const s=state(),p=s.production;const goods=document.createElement('div');goods.className='production-goods';for(const id of ['mulberryLeaf','rawSilk','fineSilk','pondFish']){const item=document.createElement('div');item.innerHTML=itemArt(id);const t=document.createElement('small');t.textContent=N.itemNames[id]+' ×'+N.quantity(s,id);item.append(t);goods.append(item);}$('panelExtra').append(goods);
 if(!p.kit)nav('去池边领取初养物资','yard','silkPond');else nav('回池边种桑、养蚕、喂鱼','yard','silkPond');
 if(!p.botanical){paragraph('祖父近来记了几页岭南草木，可去书案看一看，借作母亲的绣样。');nav('到书房看草木底稿','study','books');}
 if(p.clothesStartedAt===null){paragraph('全家新衣需要特级生丝 ×2、祖父的草木底稿。交料前会再次确认；不自动扣除行囊里的生丝。');const shop=N.story2.familyAtShop(s,'mother');nav('去找母亲商量新衣',shop?'generalStore':'hall',shop?'v2MotherCounter':'motherHall');}else if(s.actorState.outfit!=='nanlanSilk')paragraph('母亲正在裁绣。第 '+(Math.floor(p.clothesReadyAt/1440)+1)+' 日清晨，新衣就能穿上。');else button('回看清晨的新衣',morning,'silk-memory',true);
 if(s.flags.v2Sign)nav('将生产成果装车送往南街','store','goodsCrates');
 button('打开行囊',showBag,'silk-bag',true);
}
function mother(){const s=state(),p=s.production;activity('母亲 · 南澜新花样',p.clothesStartedAt!==null?'「针脚慢慢收，衣裳才耐穿。用自家的丝，绣咱们亲眼见过的花，我也喜欢。」':'「你祖父记下的草木，有几枝正好绣在袖口。若肯留两份好丝，咱们一家都能添件新衣。」','silk-clothes');
 if(p.clothesStartedAt!==null){paragraph(s.actorState.outfit==='nanlanSilk'?'新衣已穿在身上。':'第 '+(Math.floor(p.clothesReadyAt/1440)+1)+' 日清晨可穿新衣；期间可以照常探索与经营。');button('查看制衣进度',progress,'silk-clothes-progress',true);return;}
 if(!p.botanical){paragraph('请先到书房看祖父的草木底稿。');nav('前往书房','study','books');return;}
 paragraph('确认后从行囊扣除特级生丝 ×2，交给母亲裁绣；等待三个游戏日后的清晨。');action('确认留下特级生丝 ×2，给全家做新衣','silkClothes',{},()=>{mother();for(const id of ['familySilk','walkFemaleSilk','walkMaleSilk'])loadImage(id);},N.available(s,'fineSilk')>=2,'特级生丝不足两份，先照料一匾蚕再来。');button('这些丝先留着，暂不交料',closeDialog,'silk-clothes-cancel',true);
}
function botanical(){activity('祖父 · 记草木','（祖父摊开册页，桑叶边画着几枝细小的白花。）\n\n「起初只记哪条路通向哪里。如今看见花开，总想记下它的样子。你母亲若要绣样，尽管拿去。」','silk-botanical');const paper=document.createElement('div');paper.className='botanical-paper';paper.innerHTML=itemArt('mulberryLeaf');const text=document.createElement('p');text.textContent='桑叶 · 叶缘细齿\n白花 · 清晨初开\n南澜草木小记';paper.append(text);$('panelExtra').append(paper);if(!state().production.botanical)action('誊好草木底稿，留作新衣绣样','silkBotanical',{},()=>{botanical();paragraph('祖父的底稿已记下，可去找母亲。');});else paragraph('草木底稿已记下，不会消耗或重复领取。');button('回到书案',showArchive,'silk-desk-back',true);}
function nameScene(preview=null){const chosen=state().production.shopName;activity('祖父 · 书案题字号',chosen?'墨已干透，祖父将题好的字号交给你。':'宣纸铺开，祖父提笔等你。三张小笺压在案角，选一个名字，先看看家人的心意。','shop-name');const name=chosen||preview;const paper=document.createElement('div');paper.className='naming-paper';paper.setAttribute('aria-label',name?'宣纸上的字号：'+name:'待题字的宣纸');if(name){const heading=document.createElement('strong');heading.textContent=name;heading.className=chosen?'name-ink':'name-preview';paper.append(heading);}else paper.textContent='一纸新名，待落南街';$('panelExtra').append(paper);
 if(chosen){paragraph(nameEcho[chosen].join('\n\n'),'family-echo');nav(state().flags.v2Sign?'回南街看看自家铺号':'带字号去南街亲手挂匾','generalStore','v2Repair');return;}
 for(const option of M.shopNames)button(option,()=>nameScene(option),'shop-name-'+M.shopNames.indexOf(option),option!==preview);
 if(preview){paragraph({'南澜记':'见证一家人在异乡的岁月。','借灯阁':'记着风雨夜街坊借来的灯火。','桑榆铺':'失之东隅，收之桑榆；盼着亲手种出新的日子。'}[preview]);action('请祖父落笔题「'+preview+'」','silkChooseName',{name:preview},()=>nameScene());}
}
function npc(o){if(!state().flags.volume2Started)return;if(['mother','motherHall','v2MotherCounter'].includes(o.id))button('说说自家生丝与全家新衣',mother,'silk-mother');if(o.id==='grandfather'){button('看看祖父记下的草木',()=>{nav('去书房看草木底稿','study','books');paragraph('祖父把底稿收在书案上，去书房翻看即可。');},'silk-grandpa',true);if(state().actorState.outfit==='nanlanSilk')button('说说身上的南澜新衣',morning,'silk-grandpa-clothes',true);}}
function desk(){if(!state().flags.volume2Started)return;button(state().production.shopName?'重读祖父题下的字号':'铺开宣纸，请祖父题字号',()=>nameScene(),'silk-name');button('翻看祖父的岭南草木底稿',botanical,'silk-botanical');}
function portrait(role){if(state().actorState?.outfit!=='nanlanSilk')return null;const indices={grandfather:0,father:1,mother:2},rects=[[0,0,555,1024],[555,0,480,1024],[1035,0,501,1024]];if(role in indices){const b=rects[indices[role]];return {asset:'familySilk',rect:b};}if(['playerMale','playerFemale'].includes(role))return {asset:role==='playerMale'?'walkMaleSilk':'walkFemaleSilk',rect:[0,0,384,512]};return null;}
function portraitElement(role,name){const spec=portrait(role);if(!spec)return null;const holder=document.createElement('div');holder.innerHTML=cell(DATA.assets[spec.asset],spec.rect,'costume-portrait',1536,1024);const el=holder.firstElementChild;el.removeAttribute('aria-hidden');el.setAttribute('role','img');el.setAttribute('aria-label',name+'身着南澜新衣');return el;}
function morning(){activity('祖父 · 清晨的新衣',clothesWords,'silk-morning');const family=document.createElement('div');family.className='new-clothes-family';for(const [role,label]of [['grandfather','祖父'],['father','父亲'],['mother','母亲'],[state().gender==='male'?'playerMale':'playerFemale','你']]){const f=document.createElement('figure'),im=portraitElement(role,label);if(im)f.append(im);const c=document.createElement('figcaption');c.textContent=label;f.append(c);family.append(f);}$('panelExtra').append(family);if(!state().production.clothesSeen)action('穿着南澜的新衣，继续这一日','silkClothesSeen',{},()=>{closeDialog();refreshHud();});else button('收好这段回忆',closeDialog,'silk-memory-close');}
async function maybeMorning(){if(state().actorState?.outfit==='old')morningShown=false;if(morningShown||morningLoading||!started||!active||transitioning||!$('dialog').hidden||state().actorState?.outfit!=='nanlanSilk'||state().production.clothesSeen)return;morningLoading=true;const ok=(await Promise.all(['familySilk','walkFemaleSilk','walkMaleSilk'].map(loadImage))).every(Boolean);morningLoading=false;if(!ok){morningShown=true;notice('新衣已经做好，图像暂未载入。稍后可在行囊的生产进度中重看。',true);return;}if(!active||!$('dialog').hidden)return;morningShown=true;dialogObject=null;morning();}
function mounted(){const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;const n=state().production.shopName;if(!n)return;activity('南街 · 亲手挂匾','你与父亲扶正匾额。铺号落在门楣上，母亲退到街边看了又看。','shop-plaque');const plaque=document.createElement('div');plaque.className='shop-plaque';plaque.textContent=n;$('panelExtra').append(plaque);paragraph(nameEcho[n].join('\n\n'),'family-echo');if(N.current(state())==='V2_07'){paragraph(L('铺号已挂好，下一步回旧宅仓房装入首批实货，再选择车次送来。','The sign is up. Next pack the first real goods in the home storehouse and choose a carrier.'));nav(L('回仓房准备首批货','Prepare First Stock in the Storehouse'),'store','goodsCrates');}button('去看看柜台',()=>window.NanlanV2.show('v2Shop'),'silk-plaque-next',true);}
window.NanlanProduction={show,progress,care,mother,npc,desk,nameScene,morning,maybeMorning,mounted,portrait,portraitElement,itemArt,art};
})();
