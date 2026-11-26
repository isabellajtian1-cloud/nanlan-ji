/* Players overhear the children first. A visit never spends stamina or starts a quest. */
(()=>{'use strict';
const M=N.children;
const story={
 village:{
  title:'老树下 · 一船两头', opening:[['阿榕','这头是船头。我折的，我知道。'],['砚仔','可它是倒着走的。照你这么说，船尾先到岸，船头还在半路。'],['豆娘','嘘！船上还有客呢。你们吵得它六只脚都抓紧了。']],
  watch:'「你们当船家，我替你们看岸。」',join:'「借我一片叶子，我也来摆渡。」',
  reaction:{watch:[['阿榕','那你守着这块石头。船靠了岸，你才许喊。'],['砚仔','你看，明明是尾先到。'],['豆娘','客人已经下船啦！你们还在等船头。']],join:[['阿榕','摆渡的人得报地名。你这船去哪儿？'],['砚仔','这一洼到那一洼，中间隔着我的鞋，可得绕。'],['豆娘','那就叫「绕鞋埠」。谁先到谁替我看住鞋，别叫它也开船！']]},
  present:'豆娘把一粒鸭嘴似的石头塞过来。「今儿让你做岸上的人。这只鸭子不会游水，正好陪你回家。」',
  again:'阿榕把最宽的叶船留着：「上回那个会看岸的，又来啦。」',item:'duckStone'},
 foothill:{
  title:'溪边 · 谁给蚂蚁领路',opening:[['阿榕','我数了六只，都往这边。前头那只准是队长。'],['砚仔','队长方才绕了三圈。我瞧它也在问路。'],['豆娘','那你把脚抬一抬。它问到你鞋底下啦！']],
  watch:'「我把脚挪开，咱们看看它自己往哪走。」',join:'「这根落草能搭桥，它爱走就走。」',
  reaction:{watch:[['阿榕','都退半步！今日谁也不许替它当队长。'],['砚仔','你嘴上说不当，怎么还在发号施令？'],['豆娘','小点声，它找到路了。']],join:[['阿榕','桥架好了，头一个过的免收路钱！'],['砚仔','蚂蚁又没有钱。'],['豆娘','那第二个也免。最后那个也免。咱们这桥真好开。']]},
  present:'阿榕把草蚂蚱搁在你手上。「它跟你回去。你忙你的，不用替它想路，它认得桌子那么大的天下。」',
  again:'砚仔指着石缝：「你上回让的那条路，它们今日还走呢。」',item:'grassHopper'}
};
const desc={duckStone:'像鸭子的只有一张嘴。豆娘说，把它放碗边就好，别放碗里——它还没学会凫水。',grassHopper:'一长一短两根草须。阿榕说长的那根专听人回家，短的那根留着听雨。'};
function art(k){return '<span aria-hidden="true" class="kids-gift-art '+(k==='duckStone'?'stone':'hopper')+'"></span>';}
function words(lines){const box=document.createElement('div');box.className='kids-lines';for(const [who,line]of lines){const p=document.createElement('p'),name=document.createElement('strong');name.textContent=who;p.append(name,document.createTextNode(line));box.append(p);}$('panelExtra').append(box);}
function groupArt(){const img=document.createElement('img');img.className='kids-portrait';img.alt='阿榕、砚仔和豆娘';img.src=DATA.assets.npc_children;$('panelExtra').append(img);}
function play(){
 const s=state(),scene=M.camp(s);if(!scene||scene!==s.scene)return;const d=story[scene],returned=!!s.children?.memory[scene];
 const greeting=s.children?.memory[scene]==='join'?(scene==='village'?'绕鞋埠的船家来了，给你留了片最大的叶子。':'桥还在。今日头一个过的，照旧不收路钱。'):d.again;
 activity(d.title,returned?greeting:scene==='village'?'榕树还在滴水，一片叶船打着转。三个孩子都蹲在岸上。':'溪石晒得温热，一行蚂蚁绕着草籽走。三个脑袋凑在一处。','kids-play');
 groupArt();words(d.opening);
 for(const choice of ['watch','join']){const first=!s.children?.gifts[d.item];actButton(d[choice],'kidsPlay',{choice,sequence:s.revision},()=>{
    activity(d.title,scene==='village'?'叶船轻轻碰到了石岸。':'蚂蚁带着草籽钻进了石缝。','kids-play');groupArt();words(d.reaction[choice]);
    if(first){words([['',d.present]]);const gift=document.createElement('p');gift.className='kids-receipt';gift.innerHTML=art(d.item);gift.append(document.createTextNode('已收进小物袋 · '+N.itemNames[d.item]));$('panelExtra').append(gift);}
    else words([['豆娘','你今天也肯蹲下来。下回我们还给你留地方。']]);
    button('慢慢起身，继续赶路',closeDialog,'kids-home',true,false);
 },'kids-'+choice);}
 button('听过就好，沿路走走',closeDialog,'kids-pass',true,false);
}
function home(refresh){
 const s=state();if(!s.children)return;
 for(const k of M.keepsakes){
   if(s.children.places[k]===s.scene){button('看看'+N.itemNames[k],()=>{
     activity(N.itemNames[k],s.scene==='hall'?(k==='duckStone'?'晚饭时，祖父把碗向旁边挪了半寸：「给它留点岸。」':'穿堂风动了一下草须。父亲放轻了算盘珠，抬头听院门外的脚步。'):(k==='grassHopper'?'窗风吹得草须轻轻一颤。你把今日的账页合上，让它听一会儿晚风。':'小石鸭伏在纸角。你才摊开纸，就想起豆娘喊的那声「靠岸啦」。'),'kids-gift');
     words([['',desc[k]]]);actButton('收回行囊','kidsTake',{item:k,sequence:state().revision},refresh,'kids-take-'+k);button('让它再待会儿',refresh,'kids-stay',true,false);},'kids-look-'+k,true,false);}
   else if(s.children.gifts[k]&&!s.children.places[k])actButton('把'+N.itemNames[k]+(s.scene==='hall'?'放在正厅桌角':'放在书房窗下'),'kidsPlace',{item:k,sequence:s.revision},refresh,'kids-place-'+k,true);
 }
}
function draw(scene){const a=state().children;if(!a)return;const placed=M.keepsakes.filter(k=>a.places[k]===scene);if(!placed.length)return;
 const img=images.kidsGifts;if(!img){loadImage('kidsGifts');return;}const half=img.naturalWidth/2;
 placed.forEach((k,j)=>{const w=k==='duckStone'?14:20,h=w*img.naturalHeight/half,x=(scene==='hall'?540:464)+20*j,y=scene==='hall'?238:329;ctx.drawImage(img,k==='duckStone'?0:half,0,half,img.naturalHeight,x,y-h,w,h);});
}
window.NanlanKids={play,home,art,desc,draw};
})();
