/* Daytime village friends and the itinerant seller at the town market. */
(function(root,make){
  if(typeof module==='object'&&module.exports)module.exports=make();
  else root.NanlanMarketFamilies=make();
})(globalThis,function(){
  const l=(zh,en)=>[zh,en];
  function child(name,x,y,height,originalCamp,hello,hours,topics,toy){
    return {name,trade:l('村里孩童','Village child'),scene:'village',x,y,height,originalCamp,hello,hours,topics,toy,child:true};
  }
  const say=(ask,reply,remember)=>({ask,reply,remember});
  return {
    kidRong:child(l('阿榕','A-Rong'),700,420,62,true,
      l('「我今天只造一条船。昨天做了五条，最会游的偏是我随手折的那条。」','“One boat today. Yesterday I made five, and the one I folded without looking sailed best.”'),
      [l('阿榕把新捡的叶子摊在手心。','A-Rong unfolds a fresh leaf on his palm.'),l('阿榕给叶船挑一片最小的帆。','A-Rong chooses a tiny sail for his leaf boat.'),l('阿榕正给船起名字。','A-Rong is naming his boat.')],
      [say(l('船上头一个客人是谁？','Who is the first passenger?'),l('「豆娘说是蚂蚁。我看它根本没买船票，扛一粒米就上来了。不过它忙，我让它过。」','“Dou says an ant. It came aboard with a grain of rice and no fare. Looks busy. I’ll let it pass.”'),l('「那粒米也算半张船票吧？」阿榕还惦着那只蚂蚁。','“Does a grain of rice count as half a ticket?” A-Rong is still thinking about his ant.')),
       say(l('今天的船叫什么？','What is this boat called?'),l('「还空着，等砚仔来写。他一写字就得想半天，我的船差点得等到冬天。」','“Waiting for Yanzai to write it. Takes him so long to choose a character that my boat may have to winter here.”'),l('阿榕拍拍叶船边沿，给名字留了一道空。','A-Rong has left a gap along his hull for the name.'))],
      l("阿榕双手拢在嘴边。「开船喽！」他小声跟你说，「一声是靠岸，两声才是开船，别把船客摇糊涂了。」","A-Rong cups his hands. “Cast off! One beat to dock, two to sail,” he whispers. “Don’t muddle the passengers.”")),
    kidYan:child(l('砚仔','Yanzai'),658,455,58,true,
      l('「你站这儿，当我的见证。豆娘说我的鸡画得不像，鸡自己可没这么说。」','“Stand there and be my witness. Dou says my chicken looks wrong. The chicken never complained.”'),
      [l('砚仔用小石块在地上划字。','Yanzai writes on the ground with a little stone.'),l('砚仔正在给地上的鸡添爪子。','Yanzai adds claws to a chicken drawn in dust.'),l('砚仔用鞋尖护着快被蹭掉的字。','Yanzai guards a dusty character with his shoe.')],
      [say(l('几条腿才像鸡？','How many legs would convince her?'),l('「两条！我多画的是影子。」他用袖子蹭去了一条，又悄悄蹭去一条。','“Two! The rest are shadows.” He rubs one out, then quietly rubs out another.'),l('砚仔指了指地上的两条腿，没提影子的事。','Yanzai points out the two legs and says nothing about shadows.')),
       say(l('帮阿榕给船取名了么？','Have you named A-Rong’s boat?'),l('「叫‘快’。别的字太多，它等不及。」他把字写在自己掌心，拔腿之前又想起来，先吹干。','“Swift. No room on that boat for a longer name.” He traces the word on his palm and remembers to blow it dry before running.'),l('砚仔朝你亮一亮手心，那个「快」字还在。','Yanzai shows you the word for swift still on his palm.'))],
      l("砚仔伸指头在膝上点。「左一响，右一响。你只摇了一下，它怎么替你答了两句？」","Yanzai taps his knee. “One on the left and one on the right. You only shook it once. How did it get in two words?”")),
    kidDou:child(l('豆娘','Dou-niang'),683,548,53,true,
      l('「小声些，我这只鸭子胆小。」豆娘摊开手给你看。是一块很像鸭嘴的石头。','“Quiet. My duck is shy.” Dou opens her hand to show a stone shaped like a duck’s bill.'),
      [l('豆娘把小石子依个儿摆上石沿。','Dou lines up pebbles on a ledge.'),l('豆娘替石鸭找一处阴凉地。','Dou looks for shade for a stone duck.'),l('豆娘数了两遍她的石鸭队。','Dou counts her stone ducks twice.')],
      [say(l('鸭子饿了吃什么？','What does a stone duck eat?'),l('「小石米。这个白的最香，圆的那个留到明早。」她挑了两粒砂放在鸭嘴前，自己先咂了一下嘴。','“Pebble rice. The white grain is the nicest. The round one’s for morning.” She sets two specks before its bill and smacks her lips.'),l('豆娘指给你看石鸭碗里的「米」。','Dou shows you the “rice” in the duck’s dish.')),
       say(l('哪一只是要坐船的？','Which one wants a ride?'),l('「最小的。大的上去，阿榕的船就得学会潜水了。」','“The little one. Put the big one in and A-Rong’s boat will have to learn to dive.”'),l('豆娘把最小的石鸭单独排在前头等船。','Dou puts the smallest duck first in the queue for a boat.'))],
      l("豆娘把石鸭轻轻抱起。「这是给它送行的鼓。你摇轻些，它头一回坐这么大的船。」","Dou picks up her stone duck. “A drum to see it off. Softly, please. It’s never sailed on such a big ship.”")),
    kidLing:child(l('小铃','Xiaoling'),354,457,56,false,
      l('「你帮我数，掉了也别往回改数，我听得出来！」小铃把毽子放在鞋面上。','“Count for me. No changing the number if I drop it. I’ll hear you!” Xiaoling balances a shuttlecock on her shoe.'),
      [l('小铃把松了的毽羽重新拢齐。','Xiaoling straightens her shuttlecock feathers.'),l('小铃用鞋尖轻碰一下毽底，等你抬头。','Xiaoling taps the shuttlecock with her toe and waits for you to look up.'),l('小铃在数回家前还能再踢几回。','Xiaoling counts how many kicks she can fit in before going home.')],
      [say(l('我数，你来踢。','I’ll count. You kick.'),l('一下，两下，还是两下。小铃抬起头来：「你数得比我脚慢！」她把毽子捡起来，笑着从头来过。','One, two, still two. “Your counting’s slower than my feet!” Xiaoling scoops it up, laughing, to start again.'),l('小铃一见你就举起两根手指。「今儿从三数！」','Xiaoling holds up two fingers at the sight of you. “Start at three today!”')),
       say(l('这根花羽从哪来的？','Where did that spotted feather come from?'),l('「陶家大公鸡掉的。我跟了它半个院子，它一根也不肯掉。第二天倒在我家门口捡着了。」','“Tao’s rooster dropped it. I followed him round the yard and he wouldn’t spare a feather. Next day one was on our very doorstep.”'),l('她把那根花羽拨正，朝你晃晃。','She straightens the spotted feather for you to see.'))],
      l("小铃照着鼓点把毽子踢了两下。第三下你没摇，她还把脚停在半空，自己笑得先掉了毽。","Xiaoling kicks twice to your beat. You leave the third beat silent. She holds her foot in the air and laughs till she drops the shuttlecock.")),
    kidChun:child(l('阿椿','A-Chun'),415,474,54,false,
      l('「你牵着这头。我说放再放，不然纸鸢还在家里，线就先飞走了。」阿椿攥着一团细绳。','“Hold this end until I say let go. The kite’s at home. We can’t send the line flying without it.” A-Chun grips a ball of thread.'),
      [l('阿椿两手倒着缠线。','A-Chun winds thread from hand to hand.'),l('阿椿正同一个怎么解也解不开的结生气。','A-Chun frowns at a knot that refuses to budge.'),l('阿椿把线圈一匝一匝地绕回去。','A-Chun winds the line back, loop by loop.')],
      [say(l('把最松的一圈给我看看。','Show me the loosest loop.'),l('你一提，他一松，结散了。阿椿怔了一下：「原来刚才是我自己不肯松手。」','You lift as he lets go. The knot falls apart. A-Chun blinks. “It was me that wouldn’t let go all this time.”'),l('阿椿张开手心给你看。「我这回松着呢。」','A-Chun shows you his open hand. “I’m letting go this time.”')),
       say(l('你家的纸鸢长什么样？','What does your kite look like?'),l('「是只燕子，一边翅膀稍大。升起来老打转。我娘说像它正找自己的家。」','“A swallow with one wing a little bigger. Goes round and round up there. Mother says it’s looking for home.”'),l('阿椿用两手比一比那只大小翅膀的燕子。','A-Chun spreads his hands to show the swallow’s uneven wings.'))],
      l("阿椿把线绕上手腕，腾出两只手来拍。「你摇两下，我拍一下，看看谁先乱！」","A-Chun loops the thread round his wrist to free both hands. “You give two beats and I’ll clap once. See who loses count first!”")),
    kidQiao:child(l('巧儿','Qiao-er'),513,540,59,false,
      l('「我爹说看幌子便知道风向。我这个小，风要跑到我跟前，我才晓得。」巧儿举着纸风车。','“Father reads the wind from shop banners. Mine’s smaller. The wind has to come right up to me.” Qiao-er holds up a paper pinwheel.'),
      [l('巧儿举起纸风车试着转了半圈。','Qiao-er holds her pinwheel up to catch half a turn.'),l('巧儿蹲下来给风车扶正纸角。','Qiao-er crouches to straighten a paper vane.'),l('巧儿把风车藏在背风的一边。','Qiao-er shelters her pinwheel from the wind.')],
      [say(l('我替你吹一口。','Let me give it a puff.'),l('风车嗡地转起来。巧儿望你一眼：「今儿吹的是什么风？是人风！」她自己先咯咯笑出声。','The pinwheel hums. “What wind is that today? A people wind!” Qiao-er giggles before you can answer.'),l('巧儿见你鼓起腮帮子，也跟着鼓了一回。','Qiao-er puffs her cheeks at the sight of you.')),
       say(l('这些纸是新买的？','Did you buy the paper?'),l('「闻先生裁信封剩的。他叮嘱我挑没字的。我专找带红边的，转起来好看。」','“Offcuts from Master Wen’s envelopes. He told me to take only the blank bits. I looked for red edges because they look pretty spinning.”'),l('巧儿把风车停住，让你看纸角上的那点红边。','Qiao-er stops the pinwheel to show you its red edge.'))],
      l("巧儿听了第一声就回头：「货郎来啦？」看见鼓在你手里，她红着脸笑了。「原来今天你挑担！」","Qiao-er turns at the first beat. “Is the peddler here?” She sees the drum and laughs. “Oh! You’re carrying the baskets today!”")),
    peddler:{
      name:l('周六顺','Zhou Liushun'),trade:l('挑担货郎','Traveling peddler'),scene:'market',x:660,y:442,
      hours:[l('两只货筐刚落稳，周六顺便用小拨浪鼓摇了两声。','His two baskets barely touch the ground before Zhou gives his little rattle two shakes.'),l('货郎把担子靠在肩边，揭开一只筐盖给路人看。','The peddler steadies his yoke against his shoulder and tips open a basket lid.'),l('周六顺收紧担绳，留着一只筐还没扣盖。','Zhou tightens his carrying cords, leaving one basket open for a last look.')],
      hello:l('「五色线带，葫芦，把镜！不赶路就凑近点。瞧这拨浪鼓，比我嗓门还响，喊一声抵我喊三声。」','“Ribbons, gourds, mirrors! Come closer. This rattle drum shouts louder than I do. One shake saves me three calls.”'),
      topics:[
        say(l('为什么两只筐一大一小？','Why are your baskets different sizes?'),l('「大的装轻货，小的装沉货。分量差不多，肩膀才不跟我闹别扭。」他轻抬扁担给你看，两只筐离地一样高。','“Light goods in the big one, heavy in the small. That way my shoulders stay on speaking terms.” He lifts the yoke. Both baskets rise the same distance.'),l('周六顺冲你抬一抬扁担。「看，今儿两头也平。」','Zhou lifts the yoke for you. “Balanced today too, see?”')),
        say(l('你摇一下鼓，孩子就知道你来了？','Do the children know you by the rattle?'),l('「村口巧儿听得最准。有回我还没摇，她先跑来，说巷里的狗都朝镇集竖耳朵，准是我的筐在响。」','“Qiao-er hears me first. Once she came running before I’d touched it. Said all the dogs were listening towards the market, so my baskets must be rattling.”'),l('周六顺把鼓抵在掌心，只摇给你听了两下。','Zhou cups the rattle in his palm and gives two little shakes for you alone.'))]
    }
  };
});
