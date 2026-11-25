/* The fish follow the positions actually touched. A whole stroke uses one ration. */
(() => {
  'use strict';
  const L=(zh,en)=>deskText(zh,en);
  const home=[[.33,.50],[.61,.68],[.44,.70],[.66,.43],[.40,.37]];
  function open(food,back) {
    const names={feed:L('鱼食','fish feed'),litter:L('蚕沙','silkworm litter'),leaves:L('桑叶','mulberry leaves')};
    activity(L('桑塘边 · 撒食','At the fishpond'),L('在水面轻点，或沿水面划一道，松手撒食。方向键选落点，空格撒食。','Tap the water or draw a trail and release. Use the arrows to aim and Space to scatter.'));
    const pond=document.createElement('button');
    pond.type='button';pond.className='pond-stage';pond.dataset.noLocalize='';
    pond.setAttribute('aria-label',L('鱼塘水面 · 撒','Pond surface · Scatter ')+names[food]);
    pond.innerHTML=NanlanProduction.art(2,0,'pond-painting');
    const layer=document.createElement('canvas');layer.width=640;layer.height=574;layer.setAttribute('aria-hidden','true');
    pond.append(layer);
    const note=document.createElement('p');note.dataset.noLocalize='';note.className='pond-note';note.setAttribute('role','status');
    note.textContent=names[food]+' ×'+(food==='leaves'?2:1);
    $('panelExtra').append(pond,note);
    button(L('回到塘边','Back to the bank'),back,'pond-back',true,false);
    pond.focus({preventScroll:true});
    const ctx=layer.getContext('2d'), w=layer.width,h=layer.height;
    const quiet=matchMedia('(prefers-reduced-motion: reduce)').matches;
    let aim=[.5,.54], trail=[], pointer=null, fed=false, busy=false, frame=0;
    function water(x,y) {
      const dx=(x-.50)/.30,dy=(y-.54)/.265,len=Math.max(1,Math.hypot(dx,dy));
      return [.50+.30*dx/len,.54+.265*dy/len];
    }
    function fish(x,y,angle,i,t){
      ctx.save();ctx.translate(x*w,y*h);ctx.rotate(angle);ctx.scale(1.36+i*.10,1.36+i*.10);
      ctx.fillStyle='rgba(35,59,52,.29)';ctx.beginPath();ctx.ellipse(-2,4,17,5,0,0,2*Math.PI);ctx.fill();
      const grad=ctx.createLinearGradient(0,-5,0,5);
      grad.addColorStop(0,'#d0d0aa');grad.addColorStop(.43,i%2?'#838066':'#657e6c');grad.addColorStop(1,'#364e45');
      ctx.fillStyle=grad;ctx.beginPath();ctx.moveTo(15,0);ctx.bezierCurveTo(10,-7,0,-6,-10,0);ctx.bezierCurveTo(0,5,10,6,15,0);ctx.fill();
      const sway=quiet?0:Math.sin(t/110+i)*2;
      ctx.fillStyle='#788b73';ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-18,-5+sway);ctx.lineTo(-16,1+sway);ctx.lineTo(-18,5+sway);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#babfa0';ctx.lineWidth=.85;ctx.beginPath();ctx.moveTo(-5,-1);ctx.quadraticCurveTo(1,-4,7,-2);ctx.stroke();
      ctx.fillStyle='#323e34';ctx.beginPath();ctx.arc(10,-1.4,1.2,0,Math.PI*2);ctx.fill();ctx.restore();
    }
    function draw(t=0){
      ctx.clearRect(0,0,w,h);
      const progress=fed?(quiet?1:Math.min(1,t/1700)):0;
      for(const [i,start] of home.entries()){
        const mark=trail.length?trail[Math.round(i*(trail.length-1)/(home.length-1))]:aim;
        const dest=water(mark[0]+Math.cos(i*2.4)*.045,mark[1]+Math.sin(i*2.4)*.035);
        const ease=1-(1-progress)**2, dx=dest[0]-start[0],dy=dest[1]-start[1];
        fish(start[0]+dx*ease,start[1]+dy*ease,Math.atan2(dy*h,dx*w),i,t);
      }
      if(!fed){
        ctx.strokeStyle='#e6d5a5';ctx.lineWidth=2.4;ctx.beginPath();ctx.ellipse(aim[0]*w,aim[1]*h,13,6,0,0,Math.PI*2);ctx.stroke();
      }
      for(const [i,p] of trail.entries()){
        if(!fed||progress<.84){
          ctx.fillStyle=food==='leaves'?'#7d954f':'#dbc38d';
          for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(p[0]*w+Math.cos(i+k*2)*6,p[1]*h+Math.sin(i+k*2)*4,food==='leaves'?4:2.5,2,k,0,Math.PI*2);ctx.fill();}
        }
        if(fed && i%2===0){
          const wave=quiet?.45:((t/1100+i*.17)%1);
          ctx.strokeStyle='rgba(223,239,210,'+(.72*(1-wave))+')';ctx.lineWidth=1.7;
          ctx.beginPath();ctx.ellipse(p[0]*w,p[1]*h,4+wave*22,2+wave*9,0,0,2*Math.PI);ctx.stroke();
        }
      }
    }
    function aimAt(e){
      const r=pond.getBoundingClientRect();
      aim=water((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);
      const last=trail.at(-1);
      if(!last || Math.hypot(aim[0]-last[0],aim[1]-last[1])>.025){
        trail.push(aim);if(trail.length>32)trail=trail.filter((_,i)=>i%2===0||i===trail.length-1);
      }
      draw();
    }
    async function scatter(){
      if(fed||busy||!pond.isConnected||$('dialog').hidden)return;
      busy=true;if(!trail.length)trail=[aim];
      const result=await perform('silkFeedFish',{food,sequence:state().revision},()=>{});
      busy=false;if(!result.ok){trail=[];draw();return;}
      fed=true;pond.setAttribute('aria-disabled','true');note.textContent=L('鱼群围过来了。这一塘已经喂好。','The fish have gathered. This batch is fed.');
      const start=performance.now();
      const paint=now=>{if(!pond.isConnected||$('dialog').hidden||document.hidden)return;
        draw(now-start);if(!quiet&&now-start<2500)frame=requestAnimationFrame(paint);};
      cancelAnimationFrame(frame);paint(start);
    }
    pond.onpointerdown=e=>{
      if(fed||busy||!e.isPrimary||e.button!==0)return;
      pointer=e.pointerId;pond.setPointerCapture(pointer);trail=[];aimAt(e);
    };
    pond.onpointermove=e=>{if(pointer===e.pointerId)aimAt(e);};
    pond.onpointerup=e=>{if(pointer!==e.pointerId)return;aimAt(e);pointer=null;void scatter();};
    pond.onlostpointercapture=pond.onpointercancel=()=>{if(pointer!==null){pointer=null;trail=[];draw();}};
    pond.onclick=e=>{if(e.detail===0)void scatter();};
    pond.onkeydown=e=>{
      if(fed||busy)return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        e.preventDefault();e.stopPropagation();const d=.055;
        aim=water(aim[0]+(e.key==='ArrowLeft'?-d:e.key==='ArrowRight'?d:0),aim[1]+(e.key==='ArrowUp'?-d:e.key==='ArrowDown'?d:0));draw();
      }else if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)void scatter();}
    };
    draw();
  }
  window.NanlanPondFeeding={open};
})();
