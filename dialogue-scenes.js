/* Optional, bilingual conversations around actions the player has already taken. */
(() => {
  const L=(zh,en)=>deskText(zh,en);
  const lines=(zh,en)=>[zh,en];
  const scene=(speaker,question,first,firstReply,second,secondReply)=>({speaker,question,answers:[[first,firstReply],[second,secondReply]]});
  const mother=lines('母亲','Mother'),father=lines('父亲','Father'),grandfather=lines('祖父','Grandfather');
  const chen=lines('陈伯','Uncle Chen'),cen=lines('阿岑','A-Cen'),wan=lines('程婉','Cheng Wan');
  const xiaoman=lines('罗小满','Luo Xiaoman'),boatman=lines('何行舟','He Xingzhou'),lin=lines('林师傅','Master Lin');

  const moments={
    M02:scene(mother,lines('母亲把床褥往干燥的那边推了推。「你祖父昨夜在车上醒了三回。今夜，总算能伸直腿了。」','Mother nudges the bedding toward the dry side. “Your grandfather woke three times in the cart last night. Tonight he can finally stretch his legs.”'),
      lines('让祖父先歇着。','Let Grandfather rest first.'),lines('「好。你把箱笼留在门外，我去扶他进来。」她说着，把门边的鞋挪开。','“All right. Leave the trunk by the door. I’ll bring him in.” She moves the shoes out of the way.'),
      lines('娘，你也坐一会儿。','Mother, sit for a while too.'),lines('她在榻边坐下，又把床褥往里推了半寸。「好，那你也别站着。」','She sits on the edge and shifts the bedding another inch. “All right. Then you needn’t stand either.”')),
    M04:scene(grandfather,lines('祖父先捧着碗暖了暖手，才尝第一口。「一路上都在算还要走几日。方才我想的，却是明日吃什么。」','Grandfather warms his hands on the bowl before taking a bite. “On the road I counted the days left to travel. Just now I wondered what we might eat tomorrow.”'),
      lines('明日我去看看能种些什么。','Tomorrow I’ll see what we can plant.'),lines('「好，记得留一点空地。喜欢的东西，可以慢慢添。」','“Good. Leave a little earth empty. We can add what we like as we go.”'),
      lines('今晚先把饭吃完。','Let us finish tonight’s meal first.'),lines('祖父点点头，把盛菜的碟子往你面前推近了些。','Grandfather nods and nudges the dish a little closer to you.')),
    M05:scene(chen,lines('陈伯把茶碗翻正。「念信的人换过几回，有人图快，把落款也略了。你今日念得慢，我倒听清是谁写的了。」','Uncle Chen turns a bowl upright. “Others have hurried through that letter and skipped the signature. You read slowly enough for me to hear who wrote it.”'),
      lines('下回也叫我来。','Call me again next time.'),lines('「那我等你有空再来。走前认认榕树，往后从这里回去准没错。」','“Come when you have a moment. Remember this banyan on your way out. It will always show you the road home.”'),
      lines('我也想认认村里的路。','I’d like to learn the village paths too.'),lines('他用茶水在桌上划了两道。「一道去山脚，一道去湾边。你先走近的。」','He draws two lines in tea on the table. “One to the foothills, one to the bay. Try the nearer road first.”')),
    M10:scene(mother,lines('母亲用指节碰了碰摊布上的铜钱。「第一文你打算留在哪儿？我总怕一转身，就和家里原有的混了。」','Mother taps a coin on the stall cloth. “Where will you keep the first one? I’m afraid it will get mixed in with the old savings the moment I turn away.”'),
      lines('先把这笔记在账上。','Let us put this sale in the ledger.'),lines('「记上买走的是什么。下次好知道，这条路是从哪一件货走起来的。」','“Write down what sold. Next time we’ll remember which piece started us down this road.”'),
      lines('我想把这件事讲给家里听。','I want to tell everyone at home.'),lines('「那你回去自己讲。我只管烧水，让他们都坐下来听。」','“Then you tell them yourself. I’ll heat the water and make sure everyone sits down to listen.”')),
    M15:scene(father,lines('父亲把湿鞋放到门边。鞋底带回一截河草，他用指尖拈起来看了看。「早知道你们会来找，我该留句话。」','Father leaves his wet shoes at the door. A bit of river grass clings to a sole. He picks it off. “I should have left a word. Of course you would come looking.”'),
      lines('下次说一声就好。','Tell us next time. That is enough.'),lines('「好。我写在门边，谁先回来谁就能看见。」','“I will leave a note by the door, where whoever comes home first can see it.”'),
      lines('先把脚擦干吧。','Dry your feet first.'),lines('他接过布，等你把凳子推来，这才坐下。「回来就好。这句我也该对你说。」','He takes the cloth and sits only after you bring the stool. “I’m glad you came back too.”')),
    M16:scene(wan,lines('程婉摸到簿角一道旧折痕。「父亲每回停笔，都从这里折一下。我小时候总劝他用书签，他偏说这样一摸就知道。」','Cheng Wan finds an old crease at the corner of the ledger. “Father folded it here whenever he stopped writing. I told him to use a marker. He said he could find it by touch this way.”'),
      lines('这道折痕也该留着。','The crease belongs there too.'),lines('「嗯。誊本留字，这本原簿，连没写字的地方也要原样收好。」','“Yes. A copy keeps the words. In the original, I want even the places without words to stay as they are.”'),
      lines('他还留下过什么习惯？','What else did he do that you remember?'),lines('「灯快灭了还不肯收笔。也是因此，看到这本簿，我先想起的是那盏灯。」','“He wouldn’t put down his brush even when the lamp was going out. That is why I think of the lamp first.”')),
    M20:scene(grandfather,lines('祖父等最后一个人放下筷子，才数桌上的碗。「刚来那晚，我怕这张桌子太大。如今倒想问，明年还加不加得下一把椅子。」','Grandfather waits for the last pair of chopsticks to go down before counting the bowls. “That first night I feared this table was too large. Now I wonder if there’s room for another chair next year.”'),
      lines('我给街坊留个位置。','I’ll leave a place for a neighbor.'),lines('「好。客来时先添碗，叫什么名字，可以坐下慢慢问。」','“Good. Set out a bowl first. Their name can wait until they’ve sat down.”'),
      lines('先让家里人都坐舒服。','Let us make sure the family has room.'),lines('「也是。忙了一年，连照看灶火的人都该坐在桌边。」','“Quite right. After a year of work, even the one watching the fire should sit at the table.”')),
    V2_06:scene(lin,lines('林师傅在新木上划了一道小线。「柜台前站的是人。木头齐整，也得弯腰够得到才算好。」','Master Lin marks the wood. “People stand at a counter. It may look neat, but it only works if they can reach what they need.”'),
      lines('把常用的货放低些。','Put the everyday goods lower down.'),lines('「好。贵的也一样，不能因着贵就只许人远看。」','“Good. That goes for fine goods too. A high price is no reason to keep them out of reach.”'),
      lines('你也来试一次。','Try it yourself once.'),lines('他把尺收在袖里，空着手站到了客人的一边。','He slips the ruler into his sleeve and walks empty-handed to the customer’s side.')),
    V2_10:scene(mother,lines('客人走了，母亲才把那件货留下的空处扫净。「我方才险些追出去问他买得可合意，想了想，等他自己再来更好。」','After the customer leaves, Mother wipes the empty place. “I almost ran after him to ask how he liked his purchase. Better to let him come back if he wishes.”'),
      lines('记记他问过什么。','Let us note what he asked.'),lines('「他问能不能提得稳。往后样货就留一件，让人当场试。」','“He asked if the handle was steady. We can keep one sample out for people to try.”'),
      lines('先歇口气。','Let us take a breath first.'),lines('她放下布，把你和自己的茶盏都添满。','She sets down the cloth and refills both cups.')),
    V2_18:scene(father,lines('父亲把闭账的纸叠成一小摞。「三日写的是货。要是再写一行，我想记记谁替谁照看过门。」','Father folds the closing accounts into a small stack. “Three days of goods on these pages. If I add a line, I’d like to note who watched whose door.”'),
      lines('也记上邻铺转来的那位客。','Note the customer our neighbor sent too.'),lines('「好。过阵子若有人问起他家卖什么，我们也好实话实说。」','“Good. When someone asks what the neighboring shop sells, we can return the favor honestly.”'),
      lines('把这几张纸留着。','Keep these pages.'),lines('「留着。哪天账写得太满，翻回来看看最早的几笔。」','“We will. If the books ever grow too crowded, we can look back at these first entries.”')),
    V3_08:scene(xiaoman,lines('小满先看工位，再看了看门外的路。「我能来做工。只是家里也有事，收工的时辰，能不能先写明？」','Xiaoman looks at the workbench and then out at the road. “I can come to work. I have things to do at home too. Can we write down when I finish?”'),
      lines('时辰也写在约定里。','We’ll put the hours in the agreement.'),lines('「那我心里有数。手里的活做清，门外的日子也能照顾到。」','“Then I know where I stand. I can finish the work here and still look after things beyond the door.”'),
      lines('有急单时也先问你。','We’ll ask you first if an urgent order comes in.'),lines('她把袖口挽好。「你问，我就照实答。能做的那一段，我会做好。」','She rolls up her sleeves. “Ask, and I’ll tell you plainly. I will do well what I can take on.”')),
    V3_11:scene(boatman,lines('船家把旧班次从木牌上抹去。「等水合适才开船。客人要问，你就说我在岸上等着，不必替我许个准点。」','The boatman wipes the old sailing time from the board. “We leave when the water is right. If anyone asks, tell them I’m waiting ashore. Don’t promise an hour for me.”'),
      lines('先把消息送到。','Let us get word to them first.'),lines('「这样最好。等着的人知道缘由，便能先去办自己的事。」','“That is best. If they know why, they can get on with something else.”'),
      lines('我也留在岸上看看水。','I’ll stay and watch the water too.'),lines('他让出一段石阶。「看那根桩。下一回，你就认得水到哪里算稳。」','He makes room on the steps. “Watch that post. Next time you’ll know how high the water should be.”')),
    V3_18:scene(mother,lines('母亲没有先问卖了多少。她把一碗热汤放到你跟前。「归路上，你最想早点见到哪一处？」','Mother doesn’t ask how much sold. She puts hot soup in front of you. “On the way home, what place did you most want to see?”'),
      lines('想先看见院里的灯。','The lamp in our courtyard.'),lines('「那以后回来晚了，我便给你留一盏。也给偶尔晚归的自己留一盏。」','“Then I’ll leave one burning when you are late. And one for myself when I’m the late one.”'),
      lines('河埠也慢慢认得我了。','The people at the wharf know me now too.'),lines('「多一处有人认得你，就多一处可以停下来。」','“Every place where someone knows you is another place where you can stop.”')),
    V4_05:scene(chen,lines('陈伯把各家的约摆开，空出桌角。「哪一家若有话还没说完，就把纸留在这里。过后再补，也比当场点头稳妥。」','Uncle Chen spreads out the agreements and leaves a corner free. “If a household has more to say, leave their paper here. Better to add it later than get a hasty nod now.”'),
      lines('也给不接单的人留话。','Let those who decline speak too.'),lines('「该留。他家这回有别的日子要过，下回照样是邻居。」','“We should. They have their own affairs this time. They will still be neighbors the next time.”'),
      lines('我再读一遍各家的约。','I’ll read each agreement aloud once more.'),lines('他把最末一张推给你。「念慢些，等人听清自家的那一行。」','He pushes the last paper toward you. “Read slowly, so each household can hear its own line.”')),
    V4_14:scene(father,lines('父亲把钱匣搁在一边，让每家人先坐稳。「等把工钱、材料和约定都念清，再揭盖子。」','Father sets the cashbox aside until every household is seated. “We’ll open it after reading the labor, materials and agreements aloud.”'),
      lines('让做工的人先说。','Let the people who did the work speak first.'),lines('「也好。写账的人记得数字，动手的人才知道哪处最费工夫。」','“Good. The bookkeeper knows the figures. The maker knows what took the work.”'),
      lines('给来迟的人留一张清单。','Leave a copy for anyone who arrives late.'),lines('「照原样抄一份。有人回来问，叫他自己也能看明白。」','“Make a faithful copy. Anyone who comes back to ask should be able to read it for themselves.”')),
    V4_18:scene(grandfather,lines('祖父听着后堂外的脚步声。「以前听见有人从京里来，只想着他会带什么消息。如今也会想，他走这么远，有没有吃饭。」','Grandfather listens to the footsteps outside the back hall. “I used to wonder what news a visitor from the Capital carried. Now I also wonder whether they’ve eaten on the long road.”'),
      lines('下次先添一副碗筷。','Next time we’ll set out a bowl first.'),lines('「对。信可以晚些拆，饭凉了，倒得再热一回。」','“Yes. The letter can wait. A cold meal will only need heating again.”'),
      lines('我们在这里也有人等了。','We have people waiting for us here too.'),lines('他把灯拨亮一些。「这句话，回信里也能写。」','He turns up the lamp. “That could go in a letter home.”')),
    S5_05:scene(mother,lines('母亲将空出来的那一天圈了起来。「往常一空下来，总有人说顺手再做一件。今日我想让这处空白就留着。」','Mother circles the day she has set aside. “Whenever time opens up, someone asks for one more thing. I want to leave this space empty.”'),
      lines('那天我替你看一下柜台。','I can mind the counter that day.'),lines('「先看看你自己的安排。若也忙，就把门早关一刻，大家都松一松。」','“Check your own plans first. If you’re busy, we can close a little early and both rest.”'),
      lines('那天你想去哪儿？','Where would you like to go?'),lines('「看看布，或只是沿河走走。也许到那天才知道。」','“Look at cloth, or just walk by the river. Perhaps I’ll only know when the day comes.”')),
    S5_09:scene(lin,lines('林师傅把留样与待售的货隔开。「这件有一处好，一处还得再试。卖出去，人家只知道它好不好用。留在这里，咱们知道为什么。」','Master Lin sets the sample apart from the stock. “One part works well. Another needs a second try. A buyer can tell us if it works. Keeping it lets us learn why.”'),
      lines('给需要再试的地方留个记号。','Mark the part that needs another try.'),lines('「让下一个动手的人也看得懂。别只画一个你自己认得的点。」','“Make it clear to the next person who handles it. Don’t leave a mark only you recognize.”'),
      lines('下回拿它和新样比。','Compare it with the next sample.'),lines('「对。手艺进了一步，也得有东西能指给人看。」','“Exactly. When the craft improves, we should be able to show where.”')),
    S5_18:scene(xiaoman,lines('小满把来年的纸翻到背面。「这里先不写满。我有几天想留给家里，也想看看别人怎么做活。」','Xiaoman turns next year’s page over. “Let’s leave room. I’d like a few days for my family and a few to see how others work.”'),
      lines('等你定了再记进账。','We’ll write them in when you’ve decided.'),lines('「好。我也会先告诉你，哪几天不能当班。」','“Good. I’ll tell you ahead of time which days I can’t cover.”'),
      lines('明年也留几天给自己。','Keep a few days for yourself too.'),lines('她笑着把笔搁回笔架。「那今日先写到这里。」','She smiles and sets the brush down. “Then let us leave today’s page here.”')),
    V6_06:scene(grandfather,lines('祖父把空册推到桌边，手还按在封皮上。「头一页留白。到了岛上，先看看他们是怎样过一日的。」','Grandfather pushes the blank book across the table, one hand still on its cover. “Leave the first page empty. When you reach the island, see how people spend a day there.”'),
      lines('先问他们愿意讲什么。','I’ll ask what they wish to share.'),lines('「能听到一句实话，胜过抄满一册自己猜的事。」','“One honest sentence is worth more than a book of guesses.”'),
      lines('回来再给你看。','I’ll show you when I return.'),lines('「好，我也留个故事，等你回来一换一。」','“Good. I’ll keep a story to exchange for yours.”')),
    V6_14:scene(boatman,lines('风过旧灯台，一阵紧，一阵松。何行舟用手挡住你纸角。「写生不用写风有多大，写你在这里看见了什么就成。」','Wind gusts and eases around the old beacon. Xingzhou holds down the corner of your paper. “You needn’t write how hard the wind blows. Write what you saw here.”'),
      lines('我想记下回去的方向。','I want to mark the way back.'),lines('「好。也记下你站在哪儿。换了地方，归路看起来就不一样了。」','“Good. Mark where you stood too. The way back looks different from somewhere else.”'),
      lines('我想先坐一会儿。','I’d rather sit a while first.'),lines('他把手移到风来的那一边，替你压着纸，没再说话。','He moves his hand to the windward edge to hold the paper, and says nothing more.')),
    V6_18:scene(father,lines('父亲翻过旅册最后一页，看见后面还有空纸。「下一程要不要去，不必今日就定。先在家好好住几日。」','Father turns the last written page of the travel book and finds blank paper after it. “We don’t have to decide on another journey today. Let us spend a few good days at home.”'),
      lines('先和家里吃一顿饭。','Let us share a meal at home first.'),lines('「好。你去问母亲今日想吃什么，我去叫祖父。」','“Good. Ask Mother what she would like. I’ll fetch Grandfather.”'),
      lines('把空白留给以后的日子。','Leave the blank pages for the days to come.'),lines('他合上册子，轻轻推回你面前。「往后哪件事值得记，由你自己定。」','He closes the book and slides it back to you. “What is worth writing down next is yours to decide.”'))
  };

  function show(exchange,back){
    activity(exchange.speaker[0],L(...exchange.question),'dialogue-scene');
    dialogObject=null;
    for(const [i,[answer,reply]] of exchange.answers.entries()){
      button(L(...answer),()=>{
        activity(exchange.speaker[0],L(...reply),'dialogue-scene');
        navButton(L('收起这段话','Close this conversation'),back,'scene-return');
      },'scene-answer-'+i,false,false);
    }
    navButton(L('改日再聊','Talk another time'),back,'scene-return');
  }
  function after(id){
    if(!moments[id])return;
    const label=L('再听一句','Hear one more thing');
    const open=()=>show(moments[id],()=>closeDialog(true));
    if(!$('dialog').hidden){navButton(label,open,'scene-after');return;}
    const link=document.createElement('button');
    link.className='receipt-open';link.textContent=label;link.onclick=()=>{if(active)open();};
    $('message').append(link);
  }
  function link(){
    if(!Object.keys(moments).some(id=>N.done(state(),id)))return;
    navButton(L('回听走过的故事','Revisit story conversations'),catalog,'scene-catalog');
  }
  function catalog(){
    activity(L('走过的故事','Story Conversations'),L('这里留着一路上家人和街坊说过的话。','Words from family and neighbors along the road.'),'dialogue-scene');
    dialogObject=null;
    for(const [id,exchange] of Object.entries(moments).reverse()){
      if(N.done(state(),id))navButton(N.titles[id],()=>show(exchange,catalog),'scene-revisit-'+id);
    }
    navButton(L('回到记事','Return to the journal'),showQuest,'scene-catalog-back');
  }

  const everyday={
    mother:[mother,lines('母亲把手上的活放了放。「有些事我还想自己学。得空时，陪我去看一眼别家怎么做，好不好？」','Mother sets her work down. “There are things I would like to learn for myself. When there is time, come see how another household does them with me.”'),lines('「就看看。若见着喜欢的，再回来想想合不合咱们的用处。」','“We can just look. If something catches my eye, I’ll think about whether it would suit us once we’re home.”')],
    father:[father,lines('父亲把账页翻过去，背面有一幅极浅的路图。「这条线是我头一回走错的。留着，倒比画对了还记得牢。」','Father turns over a ledger page to a faint map. “This line is where I took a wrong turn the first time. Leaving it here helps me remember better than getting it right.”'),lines('「你认得的新路也画一笔。等我下回出门，就拿着你的图走。」','“Add a path you’ve learned. I’ll take your map the next time I go out.”')],
    grandfather:[grandfather,lines('祖父把一张练字纸倒过来。「这面写得不成样，背面倒还好。你说，该拿它记点什么？」','Grandfather turns over a practice sheet. “This side is a mess. The back will still do. What shall we write on it?”'),lines('「就记一件今日的小事罢。若不是今日写，下回多半只记得那些大事了。」','“One small thing from today will do. Later we will remember the big things readily enough.”')],
    chen:[chen,lines('陈伯把长凳上的落叶扫掉，给你空出半边。「路上若有人叫住你，先看看人家是不是只想说两句话。」','Uncle Chen brushes leaves from the bench and clears half of it for you. “If someone stops you on the road, see if all they want is a word or two.”'),lines('「你听完了再走。能叫住一个肯听的人，也是件好事。」','“Hear them out before you go. Having someone who will listen is a good thing.”')],
    doctor:[lines('许青禾','Xu Qinghe'),lines('青禾把两束草放得很远。「长得相像的，反而要分开。给人看的样，也要带上一截根。」','Qinghe sets two bundles well apart. “Keep look-alikes separate. Leave a bit of root on the sample you show someone.”'),lines('「记下它长在水边还是山坡。下回认错了，也知道从哪儿再查。」','“Note whether it grew by water or on a hillside. If you mistake it later, you’ll know where to look again.”')],
    cen:[cen,lines('阿岑把一截细竹横在膝上，慢慢削去毛刺。「不赶路的时候，我喜欢做点这样的慢活。」','Cen rests a length of bamboo across his knee and shaves away the burrs. “When I’m not hurrying along the paths, I like slow work like this.”'),lines('「削过的这一头摸着滑。用手比一比，你就知道该在哪儿停刀。」','“Feel how smooth this end is. Compare the two by hand and you’ll know when to stop.”')],
    yu:[lines('沈晚渔','Shen Wanyu'),lines('晚渔没立刻解缆，先听了一会儿浪。「同一条路，水声不一样，走法也得换。」','Wanyu listens to the surf before untying the line. “It may be the same route, but when the water sounds different, you travel it differently.”'),lines('「等潮不是白等。我会趁这个工夫看看绳、看看船，再看看岸上还有谁没回来。」','“Waiting for the tide is time to check the lines and the boat, and see who ashore has yet to return.”')],
    wan:[wan,lines('程婉把纸放在窗边的斜光里。「有些印记迎光才见得着。着急翻页，反倒只看到字。」','Cheng Wan holds the paper at an angle to the window. “Some marks only show in slanting light. Turn too quickly and all you see are words.”'),lines('「我有时候只看纸上从哪处磨薄了。那是有人来来回回摸过的地方。」','“Sometimes I only look for where it has worn thin. That is where someone came back to it over and over.”')],
    qiu:[lines('邱管事','Manager Qiu'),lines('邱管事另叠了一张凭单。「交货的人照这个记。收货的人若记了别的，咱们就把两张放在一处看。」','Manager Qiu folds a second slip. “The delivery is recorded here. If the receiver has something different, we’ll look at the two together.”'),lines('「我也有写错的时候。两边都留一张，谁也不必只信我的记性。」','“I make mistakes too. With a copy on each side, no one has to trust only my memory.”')],
    xiaoman:[xiaoman,lines('小满把当天的纸折起来，露出角上一个记号。「我自己的那一张，收工前就放到这儿。明早再来接着做。」','Xiaoman folds the day’s page so a small mark shows at the corner. “I leave my copy here before I go home. It can wait until morning.”'),lines('「以前总怕忘，什么都带回家想。现在能留在这儿，回去也就能好好吃饭了。」','“I used to bring every thought home in case I forgot. Now I can leave the work here and enjoy my supper.”')],
    boatman:[boatman,lines('何行舟把一根湿缆搭在桩上。「今日不急着开。咱们站在这儿，也能看见船路是怎样拐弯的。」','Xingzhou hangs a wet rope on the post. “No hurry to sail today. You can see the bend in the route from right here.”'),lines('「认住对岸那棵歪树。行到水面上，看不见脚下的路，就看远处还站着什么。」','“Remember the crooked tree across the water. When there’s no path beneath your feet, look at what still stands in the distance.”')],
    lin:[lin,lines('林师傅把锉刀举到光下。「手上有点累，就先收刀。今日多削一分，明日可添不回来。」','Master Lin holds his file to the light. “When your hand tires, put the tool down. Take off a sliver too much today and you cannot put it back tomorrow.”'),lines('「搁一晚，明早再量。肯等一晚，也是手艺。」','“Set it aside and measure again tomorrow. Knowing when to wait is part of the craft.”')],
    neighbor:[lines('陆掌柜','Shopkeeper Lu'),lines('陆掌柜撑住铺门。「我也卖竹器，不过有客要买更轻便的，我就想起你家那一排。」','Shopkeeper Lu props open his door. “I sell bamboo wares too. When someone wants something lighter to carry, I think of your display.”'),lines('「你也只说你亲眼见过的好处。客人买着合用，日后自然认得这一条街。」','“Tell people only what you’ve seen for yourself. When they find what suits them, they’ll remember the street.”')],
    tea:[lines('茶馆掌柜','Tea Keeper'),lines('掌柜换了桌角那盏茶。「日头还没落，船边的人就来坐了。一盏茶能等凉，一封想寄的信有时也得等。」','The keeper replaces a cup at the corner table. “People from the boats sit here before sundown. A cup may take time to cool. A letter sometimes takes time before you are ready to send it.”'),lines('「你若也在等，坐窗边好。看得见水，不必总看着门。」','“If you’re waiting too, sit by the window. You can watch the water instead of the door.”')],
    clothKeeper:[lines('顾绣娘','Seamstress Gu'),lines('顾绣娘把同一块布翻到背面。「先看看光下的颜色，再看看折起来的地方。衣裳是要穿着走路的。」','Seamstress Gu turns the same cloth over. “See the color in the light, then look where it folds. Clothes are meant to be walked in.”'),lines('「带一小片回去问问做针线的人。摸一摸布边，比记住我说的有用。」','“Take a scrap back to whoever will sew it. Feeling the edge will help more than remembering my words.”')],
    bookKeeper:[lines('叶先生','Master Ye'),lines('叶先生把纸页托平。「书有时候要天天翻。你试试用一只手翻得开么？」','Master Ye holds the pages flat. “A book sometimes has to be opened every day. See if it turns easily with one hand.”'),lines('「能翻得开，手就腾得出来写字。做札记比摆样书，更要想着这点。」','“Then your other hand is free to write. A notebook needs that even more than a display volume.”')],
    innKeeper:[lines('冯掌柜','Innkeeper Feng'),lines('掌柜把饭桌往墙边挪了一点。「夜里还有赶路的人。留这道缝，他进门不用挤过一桌客。」','The keeper shifts the table toward the wall. “Travelers still come at night. With this space they needn’t squeeze past a full table.”'),lines('「你有空也帮我看着门边。有人进来先请他坐，房钱可以等喘匀了再问。」','“Keep an eye on the door if you like. Give a traveler a seat first. The bill can wait till they catch their breath.”')],
    prefTeaCounter:[lines('茶铺掌柜','Teahouse Keeper'),lines('掌柜把热壶搁到离桌沿远一点的地方。「蒸米糕刚起锅，要吃正好。慢一点，这张桌子今日不用赶着让。」','The keeper sets the hot pot well back from the edge. “The rice cakes just came out of the steamer. Have one if you like. There’s no need to give up the table in a hurry.”'),lines('「等喝到第二盏，再说你偏爱哪一种茶。头一口，常只喝得出热来。」','“Tell me your favorite after the second cup. On the first sip we often taste only the heat.”')],
    prefInnkeeper:[lines('杜掌柜','Innkeeper Du'),lines('杜掌柜在柜台上摆着一只空碗。「回来晚的人，看到这只碗就知道灶里还有热水。」','Innkeeper Du keeps an empty bowl on the counter. “Late travelers see that bowl and know there’s still hot water by the hearth.”'),lines('「早市客起得早。你若不赶早船，可以等脚步声过了再下楼。」','“Market guests rise early. If you’re not catching the early boat, come down when the footsteps have passed.”')],
    liang:[lines('梁问炊','Liang Wenchui'),lines('梁问炊用竹勺从锅沿拨出一点汤。「我试味只取这么多。做饭的人喝第一口，才知道待会儿端给人家的是怎样一碗。」','Liang takes a little broth from the edge of the pot. “This is all I need to taste. The cook should try the first sip and know what they are about to serve.”'),lines('「若今日盐少些，也不妨让客人先尝。吃饭的人，未必都喜欢咱们一样的味道。」','“If there’s less salt today, let your guests try it first. They need not like exactly what we do.”')],
    seaMerchant:[lines('苏茂','Su Mao'),lines('苏茂按住被风掀起的单子。「海上有许多能带走的东西，也有许多得留在岸上的约。出船前，先把后一桩说清。」','Su Mao holds down a slip the wind lifts. “You can carry a great deal out to sea. The promises you leave ashore need settling first.”'),lines('「若还没说清，就坐下来再问一遍。宁可改一回船期，也别让人守着空码头等。」','“If anything is still unclear, sit and ask again. Better to change the sailing once than leave someone waiting at an empty quay.”')],
    landlord:[lines('郑掌柜','Landlord Zheng'),lines('郑掌柜抬头看了一眼屋檐。「租出去的屋，雨天才最容易看清。看铺时若碰上晴日，记得回来再看一回。」','Zheng glances up at the eaves. “You learn the most about a shop in the rain. If you first see it in fine weather, come back and look again.”'),lines('「哪处该由谁修，都写清罢。以后抬头看见那块瓦，就不用再争。」','“Write down who mends what. The next time you look up at that tile, you won’t have to argue.”')]
  };
  function everydayWords(role,s){
    const entry=everyday[role];
    if(!entry)return null;
    const weather=window.NanlanWeather?.current(s);
    if(role==='mother'&&s.flags.firstRepair&&!s.flags.firstShared){
      const repaired=s.choices.repair==='window';
      return [mother,repaired?
        lines('母亲伸手试了试窗缝。「风不直往屋里钻了。待把床褥铺好，今晚能睡得稳些。」','Mother tests the window with her hand. “The draft no longer blows straight in. Once the bedding is laid, we will sleep better.”'):
        lines('母亲蹲下来摸了摸墙边。「这里干了。床褥往这边铺，别挨着还潮的地砖。」','Mother touches the floor by the wall. “This part is dry. Lay the bedding here, clear of the tiles that are still damp.”'),entry[2]];
    }
    if(role==='chen'&&s.rural?.chen==='done')return [chen,lines('陈伯往长凳边上挪了挪。「坐。你那杯还热着。上回你来帮忙，大家都记得。」','Uncle Chen moves aside on the bench. “Sit. Your cup is still warm. We remember how you came to help.”'),lines('「今日没事要你跑腿。你肯坐一会儿，就很好。」','“There is nothing I need you to do today. It’s enough that you sat down with me.”')];
    if(role==='father'&&weather?.wet&&s.flags.fatherHome)return [father,lines('父亲把一张纸压在门边。「天又湿了。我今日去哪儿，都写在这儿了。」','Father weighs down a slip by the door. “Wet weather again. I’ve written where I’ll be today.”'),lines('「若是天黑还不回来，去纸上写的地方找我。你出门也留一句，咱们都省心。」','“If I’m not back by dark, you’ll know where to find me. Leave me a word when you go out, and we can both rest easier.”')];
    if(role==='grandfather'&&s.flags.feastShared)return [grandfather,lines('祖父翻到家宴那页，指着一处沾油的纸角。「我记得那天谁坐得离汤最近。你看，连册子也挨得近。」','Grandfather opens to the feast and points out a grease stain. “I remember who sat closest to the soup. The book must have been close too.”'),lines('「这角不要裁了。字忘了还可以查，那一晚的热气，倒只剩这点痕迹。」','“Leave the corner as it is. We can look the words up, but this is all the steam of that evening left behind.”')];
    if(role==='doctor'&&s.flags.medicinalHarvested)return [entry[0],lines('青禾把你收过的药草摊开看。「这一回你知道它从芽长到能收，得等几日了。」','Qinghe spreads out the herbs you harvested. “Now you know how many days it takes from a shoot to something you can gather.”'),lines('「等不是闲着。留心哪一叶先变色，下回便知道什么时候要多看一眼。」','“Waiting has its work. Notice which leaf changes first and you’ll know when to take a closer look next time.”')];
    return entry;
  }
  function offer(o){
    if($('dialog').hidden||!nearObject(o)||$('choices').querySelector('[data-action="scene-local"]')||dialogKind==='voyage-extra-story')return;
    const role=everyday[o.id]?o.id:(NanlanConversations.roles[o.id]||npcRole(o));
    const words=everydayWords(role,state());
    if(!words)return;
    const [name,first,reply]=words;
    navButton(L('坐下聊两句','Sit and talk a while'),()=>{
      if(!nearObject(o))return;
      const back=()=>interact(o);
      activity(name[0],L(...first),'dialogue-scene');dialogObject=o;
      navButton(L('再听一句','Listen a little longer'),()=>{
        activity(name[0],L(...reply),'dialogue-scene');dialogObject=o;
        navButton(L('回到眼前的事','Return to what brought you here'),back,'scene-local-back');
      },'scene-local-continue');
      navButton(L('回到眼前的事','Return to what brought you here'),back,'scene-local-back');
    },'scene-local');
  }

  if(window.NANLAN_EN&&window.NanlanI18n?.configure){
    for(const exchange of Object.values(moments))window.NANLAN_EN[exchange.speaker[0]]??=exchange.speaker[1];
    for(const [name] of Object.values(everyday))window.NANLAN_EN[name[0]]??=name[1];
    window.NanlanI18n.configure(window.NANLAN_EN);
  }
  window.NanlanDialogueScenes={after,link,offer};
})();
