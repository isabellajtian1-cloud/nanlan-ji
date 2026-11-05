/* Optional South Street visits. Work is only charged when the player confirms. */
(() => {
  const M=globalThis.NanlanTown,T=M.terms;
  const words={
    '榕下布庄':'Banyan Cloth Shop','青简书坊':'Green Slip Bookshop','南街客栈':'South Street Inn',
    '顾绣娘':'Mistress Gu','叶先生':'Master Ye','冯掌柜':'Innkeeper Feng',
    '南街新铺':'South Street Shops','布样册':'Cloth Swatch Book','线装小札':'Hand-bound Notebook',
    '靛青':'Indigo','茶褐':'Tea Brown','柿红':'Persimmon Red','草木札':'Notes on Plants','行路记':'Road Journal',
    '在南街榕下布庄量布、选色后取得。':'Measure cloth and choose a color at Banyan Cloth Shop on South Street.',
    '在南街青简书坊选纸、折页、穿线后取得。':'Fold and stitch your own pages at Green Slip Bookshop on South Street.',
    '「先别忙着挑。把布沿尺铺开，看它有多宽，再拿到窗边认颜色。」':'“No hurry to choose. Lay the cloth along the ruler and take its measure, then see how it looks by the window.”',
    '沿木尺铺开布料':'Unroll the cloth along the ruler',
    '布边齐了。窗下光亮，三种布色各有深浅。':'The edges line up. By the window, each of the three dyes catches the light differently.',
    '「一小片也看得出针脚。要带回家，就给你叠进布样册里。」':'“A scrap is enough to try a stitch. I can fold one into a swatch book for you to take home.”',
    '带走选好的布样 · 2 文':'Take the chosen swatch · 2 coins',
    '布样册已放入行囊。可带回正厅给母亲看；她轮值时，也可去李家铺面找她。':'The swatch book is in your bag. Show Mother in the main hall, or at the Li shop while she is on duty.',
    '回窗边再看看':'Look again by the window',
    '「记草木，就选不透墨的纸。要随身带，薄些也好。先想想，你想把什么记下来？」':'“For plants, choose paper the ink won’t bleed through. For the road, lighter sheets will do. What would you like to remember?”',
    '「两边先对齐。折口压实了，书合起来才不散。」':'“Line up the edges first. Press the fold flat and the leaves will stay together.”',
    '把纸对折，压平折口':'Fold the paper and crease it flat',
    '「叠好纸页。从书脊穿线，再把线头收进页里。」':'“Stack the folded leaves. Pass the thread through the spine, then tuck away the loose end.”',
    '穿线收结 · 3 文，约一刻':'Stitch and tie · 3 coins, about a quarter hour',
    '重新选纸':'Choose paper again',
    '线装小札已放入行囊。回正厅时，可以翻给祖父看。':'The hand-bound notebook is in your bag. You can show Grandfather when you return to the main hall.',
    '「坐一坐罢。沿河走了一日的人，进门先要一碗热的。」':'“Sit a while. After a day on the river road, a hot bowl is the first thing anyone asks for.”',
    '食毕把碗放回桌角。歇了一阵，脚下也有了力气。':'You set the empty bowl back on the table. After a short rest, your legs feel steadier.',
    '窗纸透亮了。楼下有人掀锅盖，南街新的一日开始了。':'Light seeps through the window paper. A pot lid lifts downstairs. A new day begins on South Street.',
    '来一碗热饭 · 5 文':'Have a hot meal · 5 coins',
    '体力已满，饿了再来。':'You are fully rested. Come back when you are hungry.',
    '热饭可恢复体力，吃饭约需二十游戏分钟。':'A hot meal restores stamina and takes about twenty in-game minutes.',
    '问问客房':'Ask about a room',
    '「东窗那间铺了干席，门闩也紧。要住便住，明早天一亮我来敲门。」':'“The east room has a dry mat and a sturdy latch. Stay if you wish; I’ll knock at first light.”',
    '付房钱，睡到次日清晨 · 6 文':'Pay for the room and sleep until dawn · 6 coins',
    '回到堂前':'Return to the common room',
    '听听过路人说什么':'Listen to passing travelers',
    '挑担人卸下肩头的扁担：「河埠的石阶，雨后最滑。别看只隔几步，宁可慢些下。」':'A porter sets down his shoulder pole. “The wharf steps get slick after rain. It’s only a few steps, but take them slowly.”',
    '隔桌有人抖开一张包纸：「书坊裁下的边角也好用。我儿拿它学写字，第一笔总要划得老长。」':'At the next table, someone unfolds a paper wrapper. “Even the bookshop’s scraps come in handy. My son practices on them. He always makes the first stroke far too long.”',
    '一位老客捧着碗：「初来南街，我连哪间店肯借雨伞也不知道。现在到门口，不用开口，人家已经递过来了。」':'An old guest cups his bowl. “When I first came to South Street, I didn’t know who might lend me an umbrella. Now they hand me one as soon as I reach the door.”',
    '给母亲看布样册':'Show Mother the swatch book',
    '给祖父看线装小札':'Show Grandfather the hand-bound notebook',
    '「这色在堂里看是一种，挪到窗下又是一种。等下回裁衣，我拿你挑的样子配一配线。」':'“It looks one way here and another by the window. Next time I cut cloth, I’ll see which thread suits the color you picked.”',
    '「书线收得稳。头一页还白着，明早去看看门前的新叶。眼前有物，再落笔。」':'“The stitching will hold. Leave the first page blank tonight. In the morning, look at the new leaves by the gate. See what is before you, then take up the brush.”',
    '母亲将布样贴在窗边看了看，说下次裁衣时也试试南街的颜色。':'Mother held the swatch to the window and said she would try a South Street color the next time she cut cloth.',
    '祖父摸了摸亲手装订的小札，把第一页留给门前的新叶。':'Grandfather felt the stitching and left the first page for the new leaves by the gate.',
    '钱袋里的铜钱不够。':'There are not enough coins in your purse.',
    '体力已满，可以把这一碗留待赶路回来。':'Your stamina is full. Save the meal for after your travels.',
    '钱袋里的铜钱不够，改日再来。':'There are not enough coins in your purse. Come back another day.'
  };
  if(globalThis.NANLAN_EN&&globalThis.NanlanI18n?.configure){
    Object.assign(globalThis.NANLAN_EN,words);
    globalThis.NanlanI18n.configure(globalThis.NANLAN_EN);
  }
  const open=(speaker,shop,body)=>activity(speaker+' · '+shop,body,'town-shop');
  const pick=(label,fn,id,secondary=false)=>button(label,fn,id,secondary,false);
  function hint(text){
    const p=document.createElement('p');p.textContent=text;p.className='town-note';$('panelExtra').append(p);
  }
  function paid(label,amount,action,params,refresh,blocked){
    const b=pick(label,()=>perform(action,params,refresh),action);
    const why=blocked||(state().coins<amount?'钱袋里的铜钱不够，改日再来。':'');
    if(why){b.disabled=true;b.title=why;hint(why);}
  }
  function cloth(stage=0,color=''){
    const render=text=>open('顾绣娘','榕下布庄',text);
    if(state().bag.townSwatch){render('布样册已放入行囊。可带回正厅给母亲看；她轮值时，也可去李家铺面找她。');const c=M.colors[state().choices['town:swatch']];if(c)hint(c);return;}
    if(stage===0){
      render('「先别忙着挑。把布沿尺铺开，看它有多宽，再拿到窗边认颜色。」');
      pick('沿木尺铺开布料',()=>cloth(1),'town-measure');
    }else if(stage===1){
      render('布边齐了。窗下光亮，三种布色各有深浅。');
      for(const [id,label] of Object.entries(M.colors)){const b=pick(label,()=>cloth(2,id),'town-'+id);b.dataset.cloth=id;}
    }else{
      render('「一小片也看得出针脚。要带回家，就给你叠进布样册里。」');hint(M.colors[color]);
      paid('带走选好的布样 · 2 文',T.swatch,'townSwatch',{color},cloth);
      pick('回窗边再看看',()=>cloth(1),'town-cloth-back',true);
    }
  }
  function book(stage=0,use=''){
    const render=text=>open('叶先生','青简书坊',text);
    if(state().bag.townNotebook){render('线装小札已放入行囊。回正厅时，可以翻给祖父看。');const u=M.uses[state().choices['town:book']];if(u)hint(u);return;}
    if(stage===0){
      render('「记草木，就选不透墨的纸。要随身带，薄些也好。先想想，你想把什么记下来？」');
      for(const [id,label] of Object.entries(M.uses))pick(label,()=>book(1,id),'town-'+id);
    }else if(stage===1){
      render('「两边先对齐。折口压实了，书合起来才不散。」');hint(M.uses[use]);
      pick('把纸对折，压平折口',()=>book(2,use),'town-fold');
      pick('重新选纸',()=>book(),'town-paper-back',true);
    }else{
      render('「叠好纸页。从书脊穿线，再把线头收进页里。」');hint(M.uses[use]);
      paid('穿线收结 · 3 文，约一刻',T.book,'townBook',{use},book);
      pick('重新选纸',()=>book(),'town-paper-back',true);
    }
  }
  const rumors=[
    '挑担人卸下肩头的扁担：「河埠的石阶，雨后最滑。别看只隔几步，宁可慢些下。」',
    '隔桌有人抖开一张包纸：「书坊裁下的边角也好用。我儿拿它学写字，第一笔总要划得老长。」',
    '一位老客捧着碗：「初来南街，我连哪间店肯借雨伞也不知道。现在到门口，不用开口，人家已经递过来了。」'
  ];
  function inn(body='「坐一坐罢。沿河走了一日的人，进门先要一碗热的。」'){
    open('冯掌柜','南街客栈',body);
    paid('来一碗热饭 · 5 文',T.meal,'townMeal',{},()=>inn('食毕把碗放回桌角。歇了一阵，脚下也有了力气。'),state().stamina===100?'体力已满，饿了再来。':'');
    if(state().stamina<100)hint('热饭可恢复体力，吃饭约需二十游戏分钟。');
    pick('问问客房',()=>globalThis.NanlanFestivalUI.lodging('county',inn),'town-room',true);
    pick('听听过路人说什么',()=>{
      const {day,hour}=N.clock(state());open('冯掌柜','南街客栈',rumors[(day+Math.floor(hour/6))%rumors.length]);
      pick('回到堂前',()=>inn(),'town-inn-back',true);
    },'town-rumor',true);
  }
  function offer(o){
    if(o.action!=='townShop')return false;
    ({clothShop:cloth,bookShop:book,countyInn:inn}[state().scene])?.();
    return true;
  }
  function family(o){
    const cloth=['motherHall','v2MotherCounter'].includes(o.id);
    if(!cloth&&o.id!=='grandfather')return;
    const s=state(),key=cloth?'town:motherSaw':'town:grandfatherSaw';
    if(!s.bag[cloth?'townSwatch':'townNotebook']||s.choices[key])return;
    pick(cloth?'给母亲看布样册':'给祖父看线装小札',()=>perform(cloth?'townShowSwatch':'townShowBook',{},()=>{
      activity(cloth?'母亲':'祖父',cloth?'「这色在堂里看是一种，挪到窗下又是一种。等下回裁衣，我拿你挑的样子配一配线。」':'「书线收得稳。头一页还白着，明早去看看门前的新叶。眼前有物，再落笔。」','town-shop');
    }),key,true);
  }
  globalThis.NanlanTownUI={offer,family};
})();
