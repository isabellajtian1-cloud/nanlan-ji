from pathlib import Path
import cv2
import numpy as np
from PIL import Image, ImageFilter

W,H=240,324
yy,xx=np.mgrid[:H,:W].astype(np.float32)
idle=Image.open('player-idle-v6911.png').convert('RGBA')
anchor=[[(198,18,350),(180,18,350),(154,18,350)],[(198,8,342),(179,10,342),(154,10,342)],[(198,14,346),(179,16,346),(152,16,346)],[(198,6,344),(180,10,344),(154,10,344)]]
walk=[
[[(210,22,496),(181,20,491),(215,18,492)],[(208,10,480),(183,10,475),(205,12,475)]],
[[(237,9,484),(203,9,485),(180,10,478)],[(222,3,473),(207,3,480),(186,5,461)]],
[[(211,22,496),(181,21,493),(216,20,493)],[(208,10,484),(183,10,478),(209,10,480)]],
[[(238,9,487),(202,9,487),(179,11,480)],[(222,1,475),(206,2,481),(186,4,465)]]]
def align(im,foot):
    x,t,b=foot
    scale=294/(b-t)
    v=im.resize((round(im.width*scale),round(im.height*scale)),Image.Resampling.LANCZOS)
    dst=Image.new('RGBA',(W,H))
    dst.alpha_composite(v,(round(120-x*scale),round(312-b*scale)))
    return dst
def lum(im):
    a=np.asarray(im,dtype=np.float32)
    alpha=a[:,:,3]/255
    return np.uint8(np.clip((.28*a[:,:,0]+.61*a[:,:,1]+.11*a[:,:,2])*alpha+170*(1-alpha),0,255))
def steer(start,end):
    flow=cv2.calcOpticalFlowFarneback(lum(start),lum(end),None,.5,5,21,6,7,1.5,0)
    src=np.asarray(start,dtype=np.float32)/255
    src[:,:,:3]*=src[:,:,3:]
    def frame(t):
        x,y=xx,yy
        for _ in range(3):
            v=cv2.remap(flow,x,y,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
            x,y=xx-t*v[:,:,0],yy-t*v[:,:,1]
        warped=cv2.remap(src,x,y,cv2.INTER_CUBIC)
        warped[:,:,:3]/=np.maximum(warped[:,:,3:],1/255)
        return Image.fromarray(np.uint8(np.clip(warped*255+.5,0,255)))
    return frame
def finish(im):
    alpha=im.getchannel('A')
    y,cb,cr=im.convert('RGB').convert('YCbCr').split()
    enhanced=Image.merge('YCbCr',(y.filter(ImageFilter.UnsharpMask(1.15,95,3)),cb,cr)).convert('RGB')
    rgb=Image.composite(enhanced,im.convert('RGB'),alpha.point(lambda a:max(0,min(255,(a-180)*4))))
    rgb.putalpha(alpha.point(lambda a:max(0,round((a-9)*255/246))))
    return rgb

for n in range(4):
    gender=['female','male'][n%2]
    cloth='silk' if n>=2 else 'plain'
    original='gait-female-courtyard-6928.webp' if n==0 else f'gait-{gender}-{cloth}.webp'
    gait=Image.open(original).convert('RGBA')
    key='silk-v399' if n>=2 else 'walk-v39'
    sheet=Image.open(f'player-{gender}-{key}.png').convert('RGBA')
    stride_h=500 if n%2 else 512
    atlas=Image.new('RGBA',(W*13,H*5))
    for row in range(5):
        if n and row in [0,2,4]:
            c={0:0,2:2,4:1}[row]
            keys=[align(idle.crop((362*c,362*n,362*(c+1),362*(n+1))),anchor[n][c])]
            keys.extend(align(sheet.crop((384*c,stride_h*j,384*(c+1),stride_h*(j+1))),walk[n][j][c]) for j in range(2))
        else:
            # The three unblended paintings in the shipped atlas preserve these views.
            keys=[gait.crop((c*160,row*216,(c+1)*160,(row+1)*216)).resize((W,H),Image.Resampling.LANCZOS) for c in [0,4,10]]
        frames=[keys[0]]
        for step in keys[1:]:
            outgoing,incoming=steer(keys[0],step),steer(step,keys[0])
            for t in [.08,.44,.83,1.,.72,.30]:
                frames.append(step if t==1 else outgoing(t) if t<.5 else incoming(1-t))
        for c,frame in enumerate(frames):
            sprite=finish(frame)
            assert sprite.getbbox() and 297<=sprite.getbbox()[3]<=324
            atlas.paste(sprite,(c*W,row*H))
    name=f'figure-{gender}-{cloth}-6105.webp'
    atlas.save(name,quality=88,method=5,alpha_quality=100)
    with Image.open(name) as check: assert check.size==(3120,1620)
    print(name,Path(name).stat().st_size,flush=True)
