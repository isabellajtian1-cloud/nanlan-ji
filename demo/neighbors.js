/* Six neighbours, three shared errands. Facts are learned only in a face-to-face conversation. */
(function(root,create){
  if(typeof module==='object'&&module.exports)module.exports=create(require('./market-families.js'));
  else root.NanlanNeighbors=create(root.NanlanMarketFamilies);
})(globalThis,function(families){
  'use strict';
  const l=(zh,en)=>[zh,en];
  const subject=(ask,reply,remember)=>({ask,reply,remember});
  const residents={
    cakeAunt:{
      name:l('陶三娘','Tao Sanniang'),trade:l('糕贩','Rice-cake seller'),scene:'market',x:360,y:425,partner:'ferryPorter',
      hours:[l('陶三娘揭开笼盖一条缝，热气熏得她眯起了眼。','Tao cracks the steamer lid. Steam makes her squint.'),l('陶三娘把点心一块块隔在竹叶里，留出一只空食盒。','Tao separates the cakes with bamboo leaves, leaving one food box empty.'),l('陶三娘拿布擦着蒸笼沿，最后一片竹叶还没收。','Tao wipes the steamer rim. One bamboo leaf still lies out.')],
      hello:l('「当心烫。想闻就站我这边，风把香气往这儿送。」','“Mind the steam. Stand on my side if you want a good sniff. The breeze brings it this way.”'),
      topics:[
        subject(l('食盒盖上怎么缠着红线？','Why the red thread round the lid?'),l('「河埠的杜七替我捎盒。上回两家盒子长一样，他捎回来一匣子鞋样！这回我缠了红线。他若问，你告诉他，认红的。」','“Du Qi at the wharf brings back my boxes. Last time he brought a whole box of shoe patterns! This time I tied red thread on the lid. Tell him to look for red if you see him.”'),l('她拎起盒盖，冲你晃了晃那截红线。','She lifts the lid and gives its red thread a shake.')),
        subject(l('边上那块怎么少个角？','Why is one cake missing a corner?'),l('「我尝的。我娘从前就掰一小角，尝得芝麻熟透了才肯起笼。如今轮到我倒有个好处，缺角的那块，总归我吃。」','“My doing. Mother tested a corner before taking the batch off the heat. There’s an advantage to doing it myself. The odd-shaped one is mine.”'),l('她捻起一小角糕给你看。「瞧，做糕人的那一口。」','She holds up a corner of cake. “The cook’s portion, see?”'))],
      pass:l('杜七说盒底有两道浅痕。','Du Qi says there are two nicks underneath.'),
      received:l('陶三娘把盒子一翻，真有两道，忍不住笑。「原来他倒比我仔细。红线也留着，天暗的时候好认。」','Tao turns the box over. Two nicks. She laughs. “He’s more careful than I am. I’ll keep the thread too, for when it gets dark.”')
    },
    ferryPorter:{
      name:l('杜七','Du Qi'),trade:l('河埠脚夫','Wharf porter'),scene:'wharf',x:658,y:480,partner:'cakeAunt',
      hours:[l('杜七把肩绳抖开，先在掌心试了试松紧。','Du shakes out the rope and tests it against his palm.'),l('杜七放下肩绳，让绳印在肩上缓一缓。','Du sets down his rope to give his shoulder a rest.'),l('杜七把散绳一圈圈收好，绕臂的动作比数钱还熟。','Du coils his rope round his arm more readily than he counts coins.')],
      hello:l('「借个地方站？往里半步，别叫来往的担子碰着。」','“Need a place to stand? Half a step in. The loads pass close.”'),
      topics:[
        subject(l('这么多空盒，怎么认得谁家的？','How do you tell all the empty boxes apart?'),l('「摸盒底。镇集陶三娘那只，磕了两道浅痕。上回没摸，捎错了，她至今还笑我。见她替我说声，我这回记住了。」','“Feel underneath. Tao’s box at the market has two nicks. I didn’t feel last time, and she’s still laughing about the mix-up. Tell her I know the marks now.”'),l('他用指腹在掌心轻划两下，给你比那食盒底的记号。','He draws two little lines on his palm to show the marks beneath the box.')),
        subject(l('你歇脚时还数着什么？','What are you counting while you rest?'),l('「数过来的船。不数脚程，脚就轻一点。头一日上工我数了七趟，晚上做梦还在岸上转身。」','“Boats coming in. Easier on the legs than counting steps. My first day I counted seven trips and spent the night turning round on the quay in my dreams.”'),l('杜七伸出三根手指，又往水上指指。「数船呢。」','Du raises three fingers and points to the river. “Counting boats.”'))],
      pass:l('陶三娘给食盒缠了红线。','Tao tied red thread round her food box.'),
      received:l('「红线！早说嘛。」杜七摸摸后脑。「上回我还想，陶家怎么忽然卖起鞋底来了。行，下回就看红的。」','“Red thread! That’ll do it.” Du scratches his head. “Last time I wondered when Tao had started selling shoe soles. I’ll look for red.”')
    },
    netMender:{
      name:l('卢阿婆','Granny Lu'),trade:l('补网人','Net mender'),scene:'coast',x:529,y:463,partner:'youngWeaver',
      hours:[l('卢阿婆把网眼举向亮处，漏过去的光在衣襟上晃。','Lu holds the mesh up. Light dances through it onto her coat.'),l('卢阿婆用脚尖绷着一小幅网，膝上的网梭来回穿。','Lu holds the net taut with one toe and works a shuttle over her knee.'),l('卢阿婆用拇指挨个摸过绳结，眼睛已经歇了。','Lu gives her eyes a rest and feels each knot with her thumb.')],
      hello:l('「站那头吧，别绊了脚。这网破眼儿多，兜住个活人倒还行。」','“Stand on that side or you’ll trip. Full of holes, this net, but it could still catch a person.”'),
      topics:[
        subject(l('梭边为什么缠一小圈线？','Why wind a thread round the shuttle?'),l('「山脚潘禾削的。梭尾留个缺口，我冷天手指发僵也能摸着正反。碰着他替我道个好，这缺口别磨平。」','“Pan He at the foothills made it. He left a notch so even cold fingers can tell the sides apart. Tell him my thanks, and not to smooth it away.”'),l('卢阿婆拿拇指抵住梭尾的缺口，递近些给你看。','Lu rests her thumb in the shuttle notch and holds it up for you.')),
        subject(l('这么多结，数错过没有？','Have you ever lost count of the knots?'),l('「你这么一问，我就数错了。」她看你慌忙闭嘴，倒先乐了。「逗你的。摸到上一个紧结，接着来便是。」','“I have now you mention it.” You fall silent. She grins. “Teasing! Find the last tight knot and carry on.”'),l('卢阿婆一见你就故意高声数起网结，数了三个便笑了。','At the sight of you Lu counts her knots aloud, giving up with a laugh at three.'))],
      pass:l('潘禾说那只梭子是照您的手量的。','Pan He measured the shuttle for your hand.'),
      received:l('「怪不得。」她将梭子往掌心一合，梭尖刚露出一点。「我当他笨，做得比旁人的短。原来是我的手小。」','“So that’s it.” The tip just clears her closed palm. “I thought he’d made it too short. Turns out I have small hands.”')
    },
    youngWeaver:{
      name:l('潘禾','Pan He'),trade:l('篾匠学徒','Apprentice bamboo weaver'),scene:'foothill',x:595,y:454,partner:'netMender',
      hours:[l('潘禾把篾条宽头归在一边，嘴里一个劲儿数。','Pan lines up the wide ends of his bamboo strips, counting under his breath.'),l('潘禾手里一只未收口的篓子，篓边比膝头高出些许。','Pan balances an unfinished basket just above his knee.'),l('潘禾把余下的篾条卷拢，挑出一根歪的又留在手里。','Pan rolls up his leftover strips, keeping one crooked one in hand.')],
      hello:l('「可别喊师傅，真师傅正好路过，我就没脸了。叫我潘禾。」','“Don’t call me master. If my teacher happened by, I’d never live it down. Pan He will do.”'),
      topics:[
        subject(l('怎么量一只补网的梭子？','How do you measure a netting shuttle?'),l('「要看谁用。海湾卢阿婆的，我照她手掌量的，比寻常短一截。她老嫌我做小了，你碰见她帮我说说缘故。」','“Depends whose it is. I measured Granny Lu’s palm down at the bay. Hers is shorter than most. She thinks I made it too small. Tell her why if you meet her.”'),l('潘禾伸开五指，再把小指蜷回去，比给你看两只梭子的长短。','Pan spreads his fingers, then curls in his little finger to show the two lengths.')),
        subject(l('篓上这根歪篾非拆不可？','Must the crooked strip come out?'),l('「我原想藏一藏。」他把篓口一转，歪处正硌着手腕。「得，叫自己的手逮着了。」他不情不愿拆回去两道。','“I meant to hide it.” He turns the rim and the strip digs into his wrist. “Caught by my own hand.” Reluctantly, he unweaves two rows.'),l('潘禾先用手腕蹭一下篓边，冲你点点头。「顺了。」','Pan rubs his wrist along the rim and nods. “Smooth now.”'))],
      pass:l('卢阿婆嘱咐你留着梭尾的缺口。','Granny Lu wants the notch left in the tip.'),
      received:l('潘禾呼出一口气。「师傅还嫌我忘了收光。下回他又问，我就说，是用梭子的人叫我留的。」','Pan lets out a breath. “My teacher thought I’d forgotten to finish it. Next time I can tell him the woman who uses it asked me to leave it.”')
    },
    blueDyer:{
      name:l('姚青娘','Yao Qingniang'),trade:l('染坊女工','Dyer'),scene:'county',x:420,y:401,partner:'letterScribe',
      hours:[l('姚青娘将一方蓝布展开，又合拢看折里的颜色。','Yao opens a length of indigo cloth, then checks the colour inside the fold.'),l('姚青娘抬手理鬓发，瞧见手指上染着蓝，又改用手腕。','Yao starts to tidy her hair, notices her blue fingers and uses her wrist instead.'),l('姚青娘把布头叠成小方块，按深浅一块块排好。','Yao folds her swatches into little squares and sorts them by shade.')],
      hello:l('「看布得换个角度。你站的那边，我都舍不得收钱，颜色暗了一层。」','“Look from this side. I’d hardly charge you for the colour you see from over there in the shade.”'),
      topics:[
        subject(l('这块小布头也有人要？','Is someone waiting for this little swatch?'),l('「村口替人写信的闻先生，想包一方旧砚。替我告诉他，蓝布已经漂清，沾湿也不会弄花他的纸。」','“Master Wen, the letter writer in the village, wants to wrap his old inkstone. Tell him the blue cloth is rinsed clear. It won’t stain his paper if it gets damp.”'),l('姚青娘把那块包砚的蓝布拢好，布边一点也不掉色。','Yao gathers the blue cloth for the inkstone. The edge leaves her fingers clean.')),
        subject(l('你的手洗了还是蓝的？','Do your hands stay blue even after washing?'),l('「旁人认不出我，邻家小孩倒是一眼认得。」她把指头藏起来学孩子的口气。「哪，青娘来了，连手指也穿蓝衫！」','“The neighbor’s child can pick me out anywhere.” She hides her fingers and imitates the child. “Here comes Qingniang! Even her fingers wear blue coats!”'),l('姚青娘晃晃两根蓝指头。「两件小蓝衫，还没脱呢。」','Yao wiggles two blue fingers. “Still wearing their little coats.”'))],
      pass:l('闻先生想把布边的白线留着。','Master Wen would like to keep the white selvedge.'),
      received:l('「他看上的是我想剪掉的那一寸！」姚青娘将剪子搁回去，顺着白边把布折好。「行，这点白留给他。」','“He wants the very inch I was going to cut!” Yao sets down her scissors and folds along the white edge. “His to keep, then.”')
    },
    letterScribe:{
      name:l('闻先生','Master Wen'),trade:l('代写家书','Letter writer'),scene:'village',x:512,y:495,partner:'blueDyer',
      hours:[l('闻先生把信封齐齐排开，把最平整的一面翻到上头。','Wen lays out his envelopes with their smoothest sides uppermost.'),l('闻先生把笔搁在砚边，手心还给一封未干的信扇着风。','Wen rests his brush and fans a newly written letter with his hand.'),l('闻先生收起砚台，留了一张小笺在外头。','Wen puts away his inkstone but leaves one slip within reach.')],
      hello:l('「替人写信，最难的是等人开那个头。你不赶的话，坐下说句闲话，我也给手松一松。」','“The hard bit about writing letters for people is waiting for their first word. Sit if you’re in no hurry. My hand could use the rest.”'),
      topics:[
        subject(l('这方旧砚用什么包？','What do you wrap that inkstone in?'),l('「原来包砚的布烂了，我问南街姚青娘讨块蓝布。若碰见她，劳你说句，白布边千万别剪，暗里一摸就知道哪头朝上。」','“The wrapper wore through. Yao on South Street offered me blue cloth. Ask her to keep the white selvedge. I can feel which way is up with it in the dark.”'),l('闻先生把砚台翻过来又转回去，给你看布边该贴着哪一端。','Wen turns the inkstone over and back to show where the selvedge should lie.')),
        subject(l('有人一个字也说不出来么？','Does anyone come without finding a single word?'),l('「有。昨日一位只说，叫他多穿件衣。我问可还有，仍是这句话。」他把笔尖在清水里轻点了一下。「我就替他写了两遍。」','“Yesterday a man could only say, tell him to wear another layer. Anything else, I asked. Same words again.” He dips the brush tip in water. “So I wrote them twice.”'),l('闻先生没催你开口，挪开信纸给你腾了个坐处。','Wen makes room beside the envelopes and lets you speak in your own time.'))],
      pass:l('姚青娘说布漂清了，湿了也不沾纸。','Qingniang says the rinsed cloth won’t stain wet paper.'),
      received:l('「好，那我敢把砚和信装在一个包里了。」闻先生小心吹干笔尖的一滴水。「她惦记的是纸，我倒只想着砚。」','“Good. The inkstone and the letters can go in the same bag.” Wen blows a drop from the brush tip. “She thought of the paper. I only thought of the stone.”')
    }
  };
  Object.assign(residents,families);
  const goods={
    ribbon:{name:l('五色线带','Five-colour ribbons'),price:4,detail:l('五样颜色绾成一束，拆开一缕就能束发，也能在自家食盒上打个记号。','Five dyed colours in a bundle. A length can tie back hair or mark a family food box.')},
    gourdFlask:{name:l('系绳葫芦','Corded gourd'),price:6,detail:l('葫芦晒干掏净，腰间系一圈细绳。货郎拎起来让你掂掂空壳的轻重。','A dried, hollowed gourd with cord round its waist. The peddler lifts it so you can feel how little the empty shell weighs.')},
    handMirror:{name:l('铜把镜','Handled bronze mirror'),price:12,detail:l('镜面磨得亮，柄却磨得暗。货郎把它向亮处一转，镜里照出半边斗笠。','The face is polished bright, the handle worn dull. He tilts it till half his straw hat appears in the bronze.')},
    handDrum:{name:l('拨浪鼓','Rattle drum'),price:5,detail:l('短柄两旁各垂一颗鼓丸。捏住柄轻轻一转，两丸轮流敲鼓面。带去村里，可以摇给孩子听。','Two little beaters hang from cords on either side. Twist the handle to tap the faces in turn. Play it for the village children.')},
    waxTapers:{name:l('一对蜡烛','Pair of wax candles'),price:3,detail:l('两支蜡烛并排裹在纸里，露出一点棉芯。货郎用手拢着，免得在筐里磕弯了。','Two wax tapers share a paper wrapping, with their wicks just showing. He shields them with his hand.')},
    featherFan:{name:l('鹅毛扇','Goose-feather fan'),price:8,detail:l('几管鹅翎顺着一个方向排好，梗脚用线缠紧。扇一下，旁边的线带先动了。','Goose feathers lie in one direction, their quills bound with thread. One stroke sets the ribbons beside it moving.')}
  };
  function present(s,id,camp){
    const p=residents[id],minute=s.worldTick%1440;
    if(p?.child)return minute>=420&&minute<1080&&(!p.originalCamp||!camp);
    if(id==='peddler')return minute>=420&&minute<1140;
    return true;
  }
  function install(data,dictionary={}){
    for(const [id,p] of Object.entries(residents)){
      const hours=p.child?'（白日）':id==='peddler'?'（7时至19时）':'';
      const label=p.name[0]+' · '+p.trade[0]+hours;
      data.assets['npc_'+id]='resident-'+id+'-v6923.webp';
      if(!data.world[p.scene].objects.some(o=>o.id===id)){
        data.world[p.scene].objects.push({id,role:id,type:'npc',label,x:p.x,y:p.y});
        data.profiles.push([id,p.name[0],p.trade[0],p.hello[0]]);
      }
      dictionary[label]=p.name[1]+' · '+p.trade[1]+(p.child?' (daytime)':id==='peddler'?' (07:00–19:00)':'');
      for(const pair of [p.name,p.trade,p.hello])dictionary[pair[0]]=pair[1];
    }
    for(const g of Object.values(goods))dictionary[g.name[0]]=g.name[1];
  }
  const heard=(s,id)=>s.choices['chatStreetHeard:'+id]||0;
  const relayed=(s,id)=>s.choices['chatStreetTold:'+id]===true;
  const canRelay=(s,id)=>Boolean(residents[id].partner&&(heard(s,residents[id].partner)&1))&&!relayed(s,id);
  function act(s,p,need){
    const id=p.object,person=residents[id];
    need(person&&person.scene===s.scene,'请到这位街坊身边再聊。');
    if(p.topic==='drum'){
      need(person.child&&s.bag.handDrum>0&&!s.choices['chatStreetDrum:'+id],'先带上拨浪鼓，改日再来。');
      s.choices['chatStreetDrum:'+id]=true;
    }else if(p.topic==='relay'){
      need(canRelay(s,id),'这句话已经带到，或还没有听到原委。');
      s.choices['chatStreetTold:'+id]=true;
    }else{
      need(p.topic===0||p.topic===1,'请选择要听的事。');
      const bit=1<<p.topic;
      need(!(heard(s,id)&bit),'这段话已经记下。');
      s.choices['chatStreetHeard:'+id]=heard(s,id)|bit;
      s.choices['chatStreetLast:'+id]=p.topic;
    }
    const key='chatCount:'+id;
    s.choices[key]=(s.choices[key]||0)+1;
  }
  return {residents,goods,present,install,heard,relayed,canRelay,act};
});
