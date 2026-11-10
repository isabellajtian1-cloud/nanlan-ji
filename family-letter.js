/* The family letter is story fiction. Reading and replaying never spend time or grant rewards. */
(()=>{'use strict';
const L=(zh,en)=>window.NanlanI18n?.language==='en'?en:zh;
const original=[
 ['南澜李家诸位安好：','To the Li family in Nanlan,'],
 ['前封报平安的短笺已收到，得知一家同在，悬着的心才放下。京中旧巷入秋添了凉意，檐下那株老树仍在。几位旧识相遇，总要问一句：你们的住处可挡雨，老人夜里睡得可安？','Your brief note of safe arrival reached us. Knowing you are together brought relief. Autumn has cooled our old lane; the tree beneath the eaves still stands. Old friends ask whether your roof keeps out rain and whether the elder sleeps well.'],
 ['家中小辈听说南澜近海，问海边的贝壳是什么模样，又问当地的草木可与京里一样。我答不上，只能等你们来信教我。若方便，写几件寻常事便好：吃什么，遇见了谁，日子怎样慢慢安顿。','The younger ones ask what shells look like by the sea, and whether your plants resemble ours. I cannot answer. Tell us a few ordinary things: what you eat, whom you meet, and how you are settling in.'],
 ['此信只是亲故问安，并无别的确讯。远近传言，尚未核实的，不敢写来扰你们心绪。回信不必急，也不必报喜避忧；有什么难处，愿听你们慢慢说。','This is a personal greeting, with no other confirmed news. We will not trouble you with unverified rumours. There is no hurry to reply, nor any need to hide your difficulties. We are ready to listen.'],
 ['愿灯下有饭，夜里无漏。待来日能相见，再把路上的事一一说来。\n京中故交 手书','May there be supper beneath your lamp and a dry roof at night. When we meet again, tell us the journey in full.\nAn old friend in the capital']
];
const talks={
 father:{name:'父亲',en:'Father',pages:[
 ['父亲把封皮压在茶盏旁，先指给你看转信的痕迹。\n「是祖父在京中的故交。我们先前托人捎过一张报平安的短笺，他收到后，才循着南澜这个住处回信。信走得慢，问候却没忘。」','Father lays the cover beside his cup. “An old friend of your grandfather wrote this. Our earlier note reached him, and he sent his answer to Nanlan. Letters travel slowly; care has not forgotten us.”'],
 ['你问：「那信里说京中有什么消息么？」\n父亲摇摇头：「写得明白，只是问安，没有别的确讯。谁在巷口说了什么，不能当成事情已经定了。我们把信读准，也把眼下的日子过准。」','“Does he bring news from the capital?” you ask. Father shakes his head. “A greeting, nothing else confirmed. Talk in a lane is not a settled fact. Let us read what he actually wrote and tend the life before us.”'],
 ['他摸了摸账本边角。\n「回他屋子已经能住，家人都好。你第一回做货、在镇集收下凭单，也可以写进去。不是说咱们如今多了不起，是告诉惦记咱们的人：我们正在认真过日子。」','He touches the ledger’s worn edge. “Tell him the house is livable and we are together. Write about your first goods and your first market receipt. Not to boast, but to tell those who worry that we are making a life.”']
 ]},
 mother:{name:'母亲',en:'Mother',pages:[
 ['母亲把信读到「夜里睡得可安」时，停了一会儿。\n「隔着这么远，问的还是屋漏不漏、饭热不热。初到那晚，我把铺盖翻了又翻，怕祖父睡在潮处。如今能回一句睡得安稳，便很好。」','Mother pauses at the question about sleep. “From so far away, he asks about rain and warm meals. That first night I turned the bedding over and over, afraid your grandfather would lie in damp cloth. Now we can say he rests safely.”'],
 ['你问她，回信还该写些什么。\n「写陈伯帮咱们认门，写邻里肯分一碗饭，也写你在灶前学着把火看稳。别只写账上有多少文，信那头的人想知道的，是咱们每天怎样坐在一起。」','You ask what else to write. “How Chen helped us find our way. How neighbors shared a bowl. How you learned to tend the fire. Not only the coins in the account—the people reading want to know how we sit together each day.”'],
 ['她看向你带回来的草叶与贝壳。\n「随信的小物，要挑你自己认得来处的。草药让他们看看南澜的叶形，贝壳让孩子想一想海边。不是贵重才值得寄，是它真的经过咱们的手。」','She looks at your herbs and shells. “Choose something whose place you know. A leaf can show our plants; a shell can let a child imagine the shore. It matters because it has passed through our hands, not because it is costly.”']
 ]},
 grandfather:{name:'祖父',en:'Grandfather',pages:[
 ['祖父认出笔锋，笑着把信往窗光里移了移。\n「他从前写信，总先说一段大事。这回只问檐下漏不漏。年岁长了，才知道有人好好睡了一夜，也是值得专门问的事。」','Grandfather recognizes the brushwork and holds the page toward the light. “He used to begin with grand affairs. Now he asks whether our roof leaks. With years, one learns that a good night’s sleep deserves its own question.”'],
 ['你提起信中那株仍在的老树。\n「树在，旧巷也还在，可咱们不必把回信写成只望着过去。」祖父指指门外，「南澜的路、借来的灯、程婉收回的旧簿，都已经是咱们自己的见闻。写亲眼见过的，没认准的便留白。」','You mention the old tree. “The tree and lane remain, but our reply need not look only backward.” Grandfather points outside. “The roads here, a borrowed lamp, the ledger returned to Cheng Wan—these are our own experiences now. Write what we know; leave uncertainty blank.”'],
 ['祖父铺开回信纸，却没有催你选小物。\n「你先把父亲和母亲的话听完，想好要让那头看见哪一段日子。等你点头，我再落笔。家书是一家人的话，不能只剩我一个人的笔迹。」','Grandfather lays out reply paper without hurrying your choice. “Hear your parents first. Decide which part of our days you want them to see. Then I shall write. A family letter should hold more than one person’s voice.”']
 ]}
};
function readOriginal(back){activity(L('京中来信 · 原信留存','Letter from the Capital · Kept for Reading'),L('京中故交回覆一家人的报平安短笺。原信可反复读，不推进时辰。','An old friend answers the family’s note of safe arrival. Reading it again advances no time.'),'family-letter');$('dialogPortraits').hidden=true;const letter=document.createElement('article');letter.className='family-letter-paper';for(const line of original){const p=document.createElement('p');p.textContent=L(...line);letter.append(p);}$('panelExtra').append(letter);if(back)navButton(L('合上信纸，接着说','Fold the letter and return'),back,'letter-return');else navButton(L('收好来信','Put the letter away'),closeDialog,'letter-close');}
function talk(role,o,page=0,replay=false){const t=talks[role],s=state();activity(L(t.name+' · 灯下读信',t.en+' · A Letter by Lamplight'),L(...t.pages[page]),'family-letter');dialogObject=o;$('dialogKicker').textContent=L('京中来信 · '+(page+1)+' / 3','Letter from the capital · '+(page+1)+' / 3');
 const art=document.createElement('div');art.className='letter-keepsake';art.innerHTML=inventoryArt('reply');const cap=document.createElement('span');cap.textContent=L('故人问安 · 京中旧友手书','A personal greeting · No unverified news');art.append(cap);$('panelExtra').append(art);
 navButton(L('展开原信，对照着读','Unfold the original letter'),()=>readOriginal(()=>talk(role,o,page,replay)),'letter-original');
 if(page<2)navButton(L(['问问信里的消息','听家人把话说完'][page],['Ask about the news','Hear the rest'][page]),()=>talk(role,o,page+1,replay),'letter-next');
 else if(!replay&&!s.familyTalks[role]&&N.current(s)==='M19')actButton(L('把'+t.name+'的话记在心里','Remember '+t.en+'’s words'),'familyLetter',{who:role},()=>{talk(role,o,2,true);},'letter-remember');
 else{const p=document.createElement('p');p.className='production-note';p.textContent=L('这段话已记下。重读不会重复推进任务。','These words are remembered. Re-reading does not advance the task again.');$('panelExtra').append(p);}
 if(role==='grandfather'&&s.flags.letterFamily&&s.flags.giftChosen&&!s.flags.replyWritten&&N.current(s)==='M19')actButton(L('把三个人的话与小物写入回信','Write the family’s reply'),'writeReply',{},()=>talk(role,o,2,true),'letter-write');
 navButton(L('先放下信，回到正厅','Set down the letter'),closeDialog,'letter-pause');}
function folder(){if(!N.reached(state(),'M19')){activity(L('往来家书','Family Letters'),L('尚未收到京中来信，先过好眼前这一段日子。','The capital’s letter has not arrived yet.'),'family-letter');return;}readOriginal();for(const role of Object.keys(talks))if(state().familyTalks[role])navButton(L('重温'+talks[role].name+'的话','Recall '+talks[role].en+'’s words'),()=>talk(role,null,0,true),'letter-replay-'+role);}
const b=document.createElement('button');b.type='button';b.id='familyLetters';b.textContent=L('往来家书','Family letters');b.onclick=()=>{window.NanlanSettings?.close();folder();};$('settingsGameOptions').querySelector('.settings-grid').append(b);window.NanlanFamilyLetter={talk,folder,readOriginal};
})();
