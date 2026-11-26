/* Volume III · Mountain and Sea. Speaker keys are shared by the portrait and scene layers. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.NanlanV3Dialogue = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  return [
    {
      title: ["门前的一只竹箱", "A Bamboo Chest at the Door"],
      beats: [
        ["lu", "送货的说是这条街，可我看这牌子，像是旧埠那边的。", "The carrier said this street. But look at the tag. I would have sent it on to the old landing."],
        ["mother", "先放干燥处，别与咱们的货混了。", "Put it somewhere dry, away from our own stock."],
        ["player", "有人来认，怎样才知道是他的？", "And when someone comes to claim it, how shall we know it belongs to them?"],
        ["father", "先记箱上的字，再问里面装了什么。", "Write down what the tag says. Then ask them what is inside."],
        ["zhou", "我往新埠送，他们又照旧牌往城里转。人转了两趟，箱子先到了。", "I sent it to the new landing. They saw the old tag and sent it into town. I changed boats twice. The chest beat me here."],
        ["player", "这些打算卖到哪里？", "Where did you mean to sell these?"],
        ["zhou", "先卖出去，再替家里换些布和盐。买的人还认不认得我，我也不知道。", "Wherever they will sell. We need cloth and salt at home. I wonder whether anyone who buys one would still know who made it."]
      ],
      echo: {
        choiceA: ["周成把旧买家的名字写给你。「替我问问，那几只当初是拿来做什么的。」", "Zhou writes down his old buyer’s name. “Ask what they used those first baskets for, would you?”"],
        choiceB: ["周成把一只样篮单摆出来。「先看这只。哪些肯让你试卖，咱们一件件说清。」", "Zhou sets one basket apart. “Look at this one first. We can agree which pieces you may offer for me.”"]
      }
    },
    {
      title: ["谁替你看一会儿店", "Who Will Mind the Shop?"],
      beats: [
        ["player", "我去河埠问一趟，午后回来。", "I should like to ask at the wharf. I can be back this afternoon."],
        ["mother", "午前我能守。午后我约了人看货。", "I can mind the counter this morning. I promised to look at some wares after noon."],
        ["father", "价钱照旧写，遇到整批的单子呢？", "We can keep the prices as marked. What if someone wants a whole batch?"],
        ["player", "先记下，等我回。", "Take their name and leave the decision for me."],
        ["mother", "还有柜后那两件，是谁订的？", "And those two pieces behind the counter? Who are we keeping them for?"],
        ["narrator", "你把预留单挪到单独的位置。", "You put the slips for reserved goods in a place of their own."],
        ["mother", "这样，我就知道哪些能答应。", "There. Now I can tell what I am free to promise."]
      ],
      echo: {
        choiceA: ["母亲把选品的小册放在手边。「午前的柜台交给我。你回来，我就依约出门。」", "Mother sets her buying book within reach. “The morning counter is mine. When you come back, I shall keep my appointment.”"],
        choiceB: ["父亲把未定的事留了一行空白。「这一段我来。你母亲约好看的货，别叫人家空等。」", "Father leaves a line for matters still to be settled. “I shall take this watch. Your mother has given her word to the maker.”"]
      }
    },
    {
      title: ["河埠初见", "A First Look at the Wharf"],
      beats: [
        ["fang", "在架上合适，十只放在船里，就不好摆了。", "One sits prettily on a shelf. Try stowing ten of them in a boat."],
        ["boatman", "货轻，地方也不一定省。", "A light parcel can still take up half a bench."],
        ["player", "你们常收哪一种？", "What kind do you usually take?"],
        ["fang", "能叠、提着不勒手，湿了以后还能晾开。", "A basket that nests, with a handle that will not bite. And it must air out if it gets wet."],
        ["player", "今日也照原来的时辰开船？", "Will the boat leave at the usual hour today?"],
        ["boatman", "先看水，再看货。班次写着，变化也会留话。", "Water first, cargo second. The sailing is on the board. If it changes, I leave word there too."]
      ],
      echo: {
        choiceA: ["何行舟指着一条空隙。「这一格瞧着空，绑绳还得从这儿穿。」", "He Xingzhou points to a gap. “Looks empty, doesn’t it? That is where the lashing has to pass.”"],
        choiceB: ["方掌柜递过一只刚晾干的旧篮。「你试试提手，再看看两只叠起来留了多少空。」", "Fang passes you a basket fresh off the drying rack. “Try the handle. Then see how much room two take when they nest.”"]
      }
    },
    {
      title: ["山里的人等什么", "What the Mountain Makers Need"],
      beats: [
        ["zhou", "做十只不是做不出。可做完，谁来拿？", "I can make ten. The question is who will come to fetch them."],
        ["cen", "上一回，他等到集都散了。", "Last time he waited until the market had packed up."],
        ["doctor", "晒得合不合用，也要先说。", "If I am to dry herbs in one, say so before it is woven."],
        ["player", "先试一小批，交多少、怎样验、何时结，都写清。", "Let us try a small batch. We shall write down the number, how to inspect it and when you will be paid."],
        ["zhou", "不合的那几件呢？", "And the pieces that do not quite fit?"],
        ["player", "先分出来，问你愿不愿改，不能混着算。", "Set them aside. We shall ask if you want to alter them and reckon them separately."]
      ],
      echo: {
        choiceA: ["周成拿一根篾条量过篮沿。「这一批照同一个口径编。收货那日，咱们拿样篮对。」", "Zhou measures the rim with a strip of bamboo. “One width for this batch. Bring the sample when you collect it.”"],
        choiceB: ["青禾把晒药匾挪到提篮旁。「药要摊得开，篮子要提得住。两个用处，两张样笺。」", "Qinghe lays a drying tray beside a carrying basket. “Herbs need room to spread. A basket must take weight. A slip for each.”"]
      }
    },
    {
      title: ["旧路上的歇脚棚", "The Shelter on the Old Road"],
      beats: [
        ["cen", "这里以前能放下两担货，歇够了再往下走。", "There used to be room for two carrying poles and their loads here. We would rest before the descent."],
        ["player", "现在还走得通？", "Can people still get through?"],
        ["cen", "这段能。前面松了，别踩近边上。", "This stretch is sound. Beyond it the earth has slipped. Keep away from the edge."],
        ["player", "字快没了。", "You can hardly read that sign."],
        ["cen", "先立在看得见的地方。写什么，回去问走过的人。", "Let us put it where people can see it. We can ask those who used to walk here what it ought to say."],
        ["player", "今天就先走到这里。", "Far enough for today, then."]
      ],
      echo: {
        choiceA: ["阿岑把肩上的担子搁进棚里。「这一小段，明日就有人敢挑货来歇了。」", "A-Cen rests his load under the shelter. “Tomorrow someone can carry a load this far and be sure of a place to set it down.”"],
        choiceB: ["祖父把绕路的草图转向窗边。「折回的地方画清楚，走头一回的人才能认得。」", "Grandfather turns the sketch towards the window. “Make the turning plain. The first traveller will need it most.”"]
      }
    },
    {
      title: ["先把这一批做好", "Getting the First Batch Right"],
      beats: [
        ["lin", "空着提，自然轻巧。放上东西再试。", "Of course an empty basket feels easy in the hand. Put something in it."],
        ["player", "这里磨手。", "This part rubs."],
        ["mother", "客人不会替咱们一直忍着。", "We can hardly ask our customers to put up with a sore hand."],
        ["fang", "提手改好了。两只叠在一处，还会晃。", "The handle is better. Stack two together, though, and they still rock."],
        ["player", "这件我带回再改。", "I shall take this one back and see to it."],
        ["lin", "改哪一处记下来，下一件才照着做得成。", "Mark the place you altered. Then the next pair of hands can do the same."]
      ],
      echo: {
        choiceA: ["林师傅往提篮里添了一包米。「试这一回。重物不伤手，才算耐用。」", "Master Lin adds a packet of rice. “Try it now. A good carrying basket must spare the hand even when it is full.”"],
        choiceB: ["方掌柜把两只篮子叠进船格。「稳稳当当，拿上头一只也不带起下头那只。就记这个尺寸。」", "Fang fits two baskets into a boat compartment. “Steady. And the lower one stays when I lift the upper. Keep those measurements.”"]
      }
    },
    {
      title: ["村口的小工棚", "A Work Shed at the Village Gate"],
      beats: [
        ["player", "旁边还放得下两张台。", "We could fit another two benches along here."],
        ["lin", "人站哪儿？货从哪儿进？", "Where would the people stand? Which way would the goods come in?"],
        ["chen", "这处借给你们用，公用的那条路得留。", "You are welcome to use the shed. That path belongs to the whole village and must stay clear."],
        ["player", "先做这一张。", "One bench first, then."],
        ["mother", "做好的和没验过的，也分开放。", "And give the finished pieces a shelf apart from the ones still awaiting a look."]
      ],
      echo: {
        choiceA: ["林师傅拍了拍台沿。「小批的活，这张台就够了。往后要添，得先问这条路还够不够走。」", "Master Lin pats the bench. “This will serve for short runs. Before we add another, see if a porter can still get through.”"],
        choiceB: ["陈伯挑着空担从收货架边走过。「进来能放担，出去不挡人，这样好。」", "Chen walks past the receiving shelf with an empty pole. “Room to set a load down, and room to walk out. That will do.”"]
      }
    },
    {
      title: ["罗小满来问工", "Luo Xiaoman Asks for Work"],
      beats: [
        ["xiaoman", "字认得一些，数也算得。没做过的，我要先问。", "I know my figures and can read a little. If something is new to me, I shall ask first."],
        ["player", "先从收发和包装学起。", "Let us start with receiving and packing."],
        ["xiaoman", "每日到哪个时辰？临时多做，怎样说？", "What time would I finish each day? And how shall we agree on any extra hours?"],
        ["father", "都写在这里。你先看看。", "I have put it all here. Take your time and read it."],
        ["xiaoman", "若这里数目不同，是先搬进去，还是先叫人？", "Suppose the count here is different. Do I carry everything inside first, or call someone over?"],
        ["player", "先分开放，留下话，等一起核对。", "Keep the goods apart and leave a note. We shall check together."]
      ],
      echo: {
        choiceA: ["小满把头一只包好的篮子搁在边上。「结系在这面，下一只也照它来。我要是晚回家，得先捎个话。」", "Xiaoman sets her first wrapped basket aside. “The knot goes on this side. I shall copy it on the next. If I stay late, I must send word home first.”"],
        choiceB: ["小满把自己的字条压在待验架下。「这是收到的数；少的那件另起一行，免得算成已经到了。」", "Xiaoman tucks her slip under the inspection shelf. “This is the number received. The missing piece gets its own line so no one will count it as here.”"]
      }
    },
    {
      title: ["两捆竹子不一样", "Two Bundles of Bamboo"],
      beats: [
        ["xiaoman", "尺寸对，边上却裂了。我先没记作合格。", "The length is right, but this one is split along the edge. I have held it back."],
        ["zhou", "做小件还能用，退回去也可惜。", "It will serve for small pieces. A pity to send it all the way back."],
        ["lin", "那就写清做小件，不能混进提篮的料。", "Then mark it for small pieces. Keep it out of the pile for load-bearing baskets."],
        ["cen", "这两种不是一个价。", "Those two grades should fetch different prices."],
        ["player", "先按用途分开，再问各人接不接受。", "Let us sort them by use. Then we can ask everyone if the terms suit."]
      ],
      echo: {
        choiceA: ["周成解下那捆裂边的料。「这份我换了再送来。你把要等的那几件记给我，免你白跑。」", "Zhou unties the split bundle. “I shall bring you a sound one. Write down which pieces must wait, and save yourself a wasted trip.”"],
        choiceB: ["周成把做小件的竹料移到另一架。「这份按小料算。小满，到交货时照你分的记号找我。」", "Zhou moves the lighter strips to the other shelf. “Price these for small work. Xiaoman, bring me your mark when we settle.”"]
      }
    },
    {
      title: ["第一批交给别人做的货", "A Batch in Other Hands"],
      beats: [
        ["player", "要不我把开头做完再走？", "Would it help if I made a start before going?"],
        ["xiaoman", "这一步你教过了。我照样品做，有不一样的留给你看。", "You showed me this part. I shall work from the sample and set anything different aside for you."],
        ["lin", "头一件验过，再接着往下。", "Inspect the first piece. Then carry on."],
        ["father", "缺的材料我也写……", "I can write down the materials that are short—"],
        ["xiaoman", "这里我已经记了，您看是不是这样。", "I have put them here already. Have I read it right?"],
        ["father", "是，照你这张来。", "You have. We will go by your slip."]
      ],
      echo: {
        choiceA: ["小满把两张工条压在同一只样篮下。「同一规格，头一件验过，我接着做第二件。」", "Xiaoman tucks both work slips under one sample. “Same measure for both. Once you have seen the first, I shall make the second.”"],
        choiceB: ["小满把后一张工条折起。「先验这批，再开下一批。要改哪儿，就能及时改。」", "Xiaoman folds the later work slip. “We shall inspect this batch before starting the next. There will still be time to make a change.”"]
      }
    },
    {
      title: ["潮水改了班次", "The Tide Changes the Sailing"],
      beats: [
        ["boatman", "原来那一班，要改到后头。", "We shall have to put the first sailing back."],
        ["player", "货今日已经备好了。", "The goods are ready to go today."],
        ["yu", "备好是一件事，走得稳是另一件。", "Ready on the bank is one thing. Safe on the water is another."],
        ["boatman", "我能保证的写在这里。急用的，你先问对方要哪几件。", "Here is the sailing I can promise. If anything is needed urgently, ask them which pieces first."],
        ["fang", "客房明日才用。灶间那几只，今晚要到。", "The rooms will not need theirs until tomorrow. The kitchen needs its baskets tonight."],
        ["player", "我按这个顺序重排。", "I shall put the kitchen first, then."]
      ],
      echo: {
        choiceA: ["何行舟将急用的货从船单上划出。「这几件走陆路。路费记在旁边，余货还照船单。」", "He Xingzhou strikes the urgent pieces from his manifest. “These go overland. Put the porter’s fee alongside. The rest stay on my list.”"],
        choiceB: ["方掌柜点过先到的数。「先到的我签收，余下的另写一天。等的人也得知道是哪一天。」", "Fang counts the first lot. “I shall sign for these. Put a date against the rest, so those waiting will know the day as well.”"],
        choiceC: ["方掌柜把新日子念给灶间的人听。「今晚先借旧篮应一应。既然说定了改期，新日子就别忘。」", "Fang reads the new date to the kitchen hands. “We shall borrow baskets tonight. We have agreed to wait. Remember the new day.”"]
      }
    },
    {
      title: ["柜台上的一张留言", "A Note on the Counter"],
      beats: [
        ["mother", "预留的没动，可架上的卖完了。", "The reserved pieces are safe, but the shelf sold out."],
        ["father", "交接单上没写要留多少普通货。", "The handover sheet never said how much everyday stock to keep."],
        ["player", "她怎么说？", "What did she say?"],
        ["neighbor", "我明日再来。若还没有，留句话，省得我来回跑。", "I can come back tomorrow. If there is still none, leave word for me. It is a long walk twice."],
        ["player", "给你留到什么时辰合适？", "How late would you like us to hold it?"],
        ["neighbor", "午后。过了我不来，你也别一直压着。", "Until the afternoon. If I cannot come by then, you need not keep it tied up for me."]
      ],
      echo: {
        choiceA: ["母亲在货架边留出一小块。「常来买日用货的，眼睛总先看这里。大单要动它，先问。」", "Mother clears a little space on the shelf. “Our regulars look here first for everyday things. Ask before promising this stock to a merchant.”"],
        choiceB: ["熟客折好取货的小条。「明儿午后我来。若迟了你就放回架上，咱们说定的。」", "The customer folds her collection slip. “I shall come tomorrow afternoon. If I am late, put it back on the shelf. That is our bargain.”"]
      }
    },
    {
      title: ["青溪埠的旧集日", "Market Day at Qingxi Landing"],
      beats: [
        ["zhou", "以前是交给中间人，卖给谁，我没见过。", "I used to hand my wares to the middleman. I never saw who bought them."],
        ["neighbor", "这个提去田里，口能不能窄些？", "Could the mouth be a little narrower? I want to take this out into the fields."],
        ["zhou", "能改。你装什么？", "I can change it. What will you carry?"],
        ["narrator", "你把话让给两人，转身去看搬货处。", "You leave the two of them talking and go to see where the loads are being set down."],
        ["lu", "这里问的，和南街又不一样。", "They are asking different things here than they do on South Street."],
        ["mother", "先记下来，别忙着样样都接。", "Write them down first. There is no need to promise everything today."]
      ],
      echo: {
        choiceA: ["周成把卖出的那只篮子记在纸边。「头一回晓得，原来它是跟人下田去的。」", "Zhou notes the basket that sold in the margin. “For once I know where it is going. Out to the fields with its owner.”"],
        choiceB: ["周成捏着客人留下的口径纸样。「下个集日问起来，我有东西能对得上。」", "Zhou holds the paper pattern his customer left. “When they ask at the next market, I shall have this to go by.”"]
      }
    },
    {
      title: ["没有署名的手艺", "The Maker Behind the Weave"],
      beats: [
        ["neighbor", "这是谁的手艺？我想再订同样的。", "Whose work is this? I should like to order another just like it."],
        ["player", "是村里做的。", "It was made in the village."],
        ["xiaoman", "这一件是周师傅编的，他收口常留这道纹。", "Master Zhou wove this one. He leaves that little ridge where he finishes the rim."],
        ["zhou", "人认得东西就好。要写名字，也先让我看看怎样写。", "It is enough that they know the work. If you want my name on it, let me see how you mean to write it."],
        ["mother", "铺子负责把好货送到人手里，做它的人也该认得出来。", "Our shop puts good things into people’s hands. They ought to be able to find the hands that made them as well."]
      ],
      echo: {
        choiceA: ["周成看过小牌，用指尖压平纸角。「这样写就好。往后要这个收口的，叫他来问我。」", "Zhou looks over the tag and smooths a corner. “That will do. If someone wants this rim again, send them to me.”"],
        choiceB: ["周成在牌背描下那道收口纹。「写青溪，再记这一批的记号。想续订的，也找得回来。」", "Zhou draws the rim pattern on the back. “Put Qingxi and the batch mark. That is enough for anyone who wants another.”"]
      }
    },
    {
      title: ["一张更大的订单", "A Larger Order"],
      beats: [
        ["fang", "若每月都照这个样子送，我能先付一部分。", "If you can bring me work like this every month, I can pay part in advance."],
        ["father", "有了定钱，材料能早些备。", "A deposit would let us lay in materials sooner."],
        ["lin", "钱能先来，人手不能凭空多出来。", "Money can arrive early. Another pair of trained hands takes time."],
        ["mother", "南街常买的几样，也要留着。", "We must still keep the things our South Street neighbors come in for."],
        ["player", "我带回去算清，再给你能做到的数。", "Let me work it out at home. I shall come back with a number we can stand by."],
        ["fang", "数可以商量，答应了就按那个数来。", "We can discuss the number. Once we agree, that is the number I shall be counting on."]
      ],
      echo: {
        choiceA: ["母亲在日用货那一栏压了一枚纸签。「小单做得长久，也是一门好生意。」", "Mother marks the line for everyday stock. “A small order that we can fill year after year is good trade too.”"],
        choiceB: ["林师傅将尺搁到工棚图上。「先量放台的地方，再算教人的日子。那几件追加的，还不忙答应。」", "Master Lin lays his rule on the shed plan. “Measure the room for a bench, then count the days of teaching. Those extra pieces can wait for our answer.”"],
        choiceC: ["周成将空白工条分开。「各家能交多少，先各自在这儿落笔，别叫一家替别家担了。」", "Zhou separates the blank work slips. “Each household writes down its own share. No one should have to answer for another’s promise.”"]
      }
    },
    {
      title: ["灯下 各有一句话", "Everyone Has a Word by Lamplight"],
      beats: [
        ["father", "有固定的买家，往后心里踏实些。", "It would set my mind at ease to have a buyer we know will come back."],
        ["mother", "我也想做长久。只是总买不到的街坊，下回就不来了。", "I want work we can count on, too. But a neighbor who comes to an empty shelf every time will stop coming."],
        ["lin", "多一张台容易，多一个会做的人，要慢慢教。", "Another bench is easily made. Another hand who knows the work takes teaching."],
        ["xiaoman", "临时多做，我愿意商量。先说一声，我好安排家里。", "I am willing to talk about extra hours. Let me know in time to make arrangements at home."],
        ["cen", "这一季的竹能用多少，我明日带你去看。", "Tomorrow I can show you how much bamboo this season can spare."],
        ["player", "我定一个数，再去把交期说清。", "I shall settle on a number and go back to agree on a delivery day."]
      ],
      echo: {
        choiceA: ["方掌柜按住那张小批单。「数目我知道了。你店里的街坊照旧买得到，这边也照旧收得到。」", "Fang holds the small order flat. “I know the number. Your neighbors will find what they need on their shelf, and we can count on our share.”"],
        choiceB: ["方掌柜用纸角盖住追加的一行。「先照眼下做得出的数写。新台试过、有了熟手，再开这一行。」", "Fang covers the extra line with a corner of paper. “We shall sign for what you can make today. Open this line once the new bench and its worker are ready.”"],
        choiceC: ["方掌柜把各家的份额各念了一遍。「哪一批交给谁、哪一份钱给谁，这样就问得明白。」", "Fang reads each maker’s share aloud. “Now we know who is bringing each lot and who is owed each payment.”"]
      }
    },
    {
      title: ["你不在的那一天", "The Day You Were Away"],
      beats: [
        ["xiaoman", "价签、预留和今日要出的货，都在这里。", "The prices, the reservations and today’s outgoing goods are all here."],
        ["player", "有人来加一整批呢？", "What if someone wants to add a whole batch?"],
        ["xiaoman", "先记下，等你回。这个你写过。", "I take a note and wait for you. You already wrote that one down."],
        ["father", "我傍晚来核账。", "I shall come by to check the accounts this evening."],
        ["mother", "你今日打算去哪儿？", "Where would you like to go today?"],
        ["player", "先走走。晚饭前回来。", "Out for a walk. I shall be back before supper."],
        ["xiaoman", "有事我留在柜台左边，不塞到账页里。", "If anything needs you, I shall leave word on the left of the counter. It will not get lost among the accounts."]
      ],
      echo: {
        choiceA: ["祖父把一页纸交给旧友。「明春我还在这里。孩子想先学写谁的名字，都叫他们带来说说。」", "Grandfather hands his friend a page. “I shall be here next spring. Ask the children whose names they would like to learn to write first.”"],
        choiceB: ["阿岑蹲下比了比幼竹的新节。「那日叫你留的这几株，如今连遮脚的草都长过了。」", "A-Cen crouches to measure a fresh joint. “Remember the young bamboo we spared? It has grown clean above the grass.”"],
        choiceC: ["沈晚渔把船绳松开半尺。「听，那边有人在问下一班。你头一回来时，这埠上可没这么热闹。」", "Shen Wanyu gives the mooring rope a little slack. “Listen. Someone is asking for the next sailing. It was quieter here when you first came.”"]
      }
    },
    {
      title: ["山海之间 有人等你", "Between Mountain and Sea, Someone Waits"],
      beats: [
        ["xiaoman", "有两件事等你决定，其余都照约定办好了。", "Two things need your word. The rest went just as we agreed."],
        ["player", "这张是你写的？", "Is this slip yours?"],
        ["xiaoman", "嗯。看不明白的，我再改。", "It is. If any part is hard to follow, I can write it more clearly."],
        ["father", "清楚，我也看过了。", "It is clear. I have looked it over myself."],
        ["mother", "今日走到哪里了？", "How far did you get today?"],
        ["player", "还有一段路，想留到下回再走。", "There is another stretch of road I should like to save for next time."],
        ["father", "那就下回再走。明早先把这件事回了。", "Then keep that for another day. We shall answer this first thing tomorrow."],
        ["mother", "先回家吃饭。", "Come home. Supper is waiting."]
      ],
      echo: {
        choiceA: ["清早，南街货架上还给日用小篮留着一块地方。门铃一响，母亲抬头便叫出了来人的名字。", "In the morning there is still a place on the South Street shelf for everyday baskets. The door sounds, and Mother greets the customer by name."],
        choiceB: ["村口的工棚开了门。小满把样篮递给新来的学徒，父亲听她把工序讲完，才将笔搁在她手边。", "The shed opens at the village gate. Xiaoman hands the sample to a new apprentice. Father lets her finish the lesson, then lays the pen by her hand."],
        choiceC: ["何行舟在班牌上添了下一班船。家门口的灯还亮着，你把待访的地方折进口袋，这回知道从哪里归来。", "He Xingzhou adds another sailing to the board. The lamp at home is still burning. You slip the list of places to visit into your pocket. This time you know the way back."]
      }
    }
  ];
});
