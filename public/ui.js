(()=>{
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const G=n=>{try{return Function('return typeof '+n+'!=="undefined"?'+n+':undefined')()}catch(e){return undefined}};
const low=()=>document.body.classList.contains('lowfx');
const onGame=()=>{const t=$('.tab.on');return !t||t.dataset.tab==='game'};

const sky={cv:$('#sky'),gl:null,ok:false,t:0,acc:0,dirty:true,mode:''};
(function initSky(){
  const cv=sky.cv;if(!cv)return;
  const gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)return;
  const vs='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const fs=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uR;uniform float uT,uH;uniform vec2 uP;
float h(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float n(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),u.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*n(p);p=m*p+vec2(3.1,1.7);a*=.5;}return v;}
float aa(float d,float w){return clamp(.5-d/w,0.,1.);}
vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}
vec3 ink=vec3(.05,.028,.016);
void lantern(inout vec3 c,vec2 q,vec2 lp,float by,float fl,float px){
  float ch=abs(q.x-lp.x)-px*.7;float link=step(.35,fract(q.y*140.));c=mix(c,ink*1.6,aa(ch,px)*step(lp.y+.03,q.y)*step(q.y,by)*(.6+.4*link));
  vec2 d=q-lp;float bd=length(max(vec2(abs(d.x)-.009,abs(d.y)-.017),0.))-.005;
  vec3 gl=mix(vec3(1.,.55,.18),vec3(1.,.88,.55),smoothstep(.02,0.,length(d*vec2(1.,.7))));
  c=mix(c,gl*fl*1.1,aa(bd,px));
  float bars=step(abs(d.y),.022)*aa(abs(abs(d.x)-.0115)-px*.55,px);c=mix(c,vec3(.16,.11,.07),bars*.9);
  float bar2=step(abs(d.y),.022)*aa(abs(d.x)-px*.45,px);c=mix(c,vec3(.16,.11,.07),bar2*.6);
  float cap=max(abs(d.x)-.016+(d.y-.022)*.5,abs(d.y-.028)-.006);c=mix(c,vec3(.24,.16,.09),aa(cap,px));
  float bot=max(abs(d.x)-.013,abs(d.y+.026)-.004);c=mix(c,vec3(.24,.16,.09),aa(bot,px));
  c=mix(c,ink,aa(abs(cap)-px*.45,px)*.7);c=mix(c,ink,aa(abs(bot)-px*.45,px)*.7);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uR;float ar=uR.x/uR.y;float px=1.6/uR.y;
  vec2 q=vec2((uv.x-.5)*ar,uv.y);float hw=.5*ar;
  vec2 qb=q+uP*vec2(.006,.004),qw=q+uP*vec2(.016,.01),qf=q+uP*vec2(.03,.016);
  float wide=clamp((hw-.26)/.7,0.,1.);
  vec2 L=vec2(0.,.4);float glow=exp(-length((q-L)*vec2(1.,1.2))*2.4);float ht=1.+uH*.5;
  float fl=.88+.08*sin(uT*8.3)+.04*sin(uT*21.7);
  vec2 rp=qb*7.5;float e=.05;float r0=fbm(rp),rx=fbm(rp+vec2(e,0.)),ry=fbm(rp+vec2(0.,e));
  vec3 nr=normalize(vec3((r0-rx)/e*.22,(r0-ry)/e*.22,1.));vec3 lv=normalize(vec3(L-q,.55));float dif=max(dot(nr,lv),0.);dif=smoothstep(0.,1.,dif);
  float lpx=hw*mix(.62,.5,wide);
  float lamp=exp(-length(q-vec2(-lpx,.8))*7.)+exp(-length(q-vec2(lpx,.8))*7.);
  vec3 back=mix(vec3(.1,.06,.042),vec3(.25,.155,.1),smoothstep(.25,.8,r0));
  back*=.3+(1.7*glow*ht+.55*lamp*fl)*(.45+.55*dif);
  back*=mix(1.,.55,smoothstep(.6,1.,uv.y));
  back+=vec3(.45,.16,.04)*glow*.16*ht;
  float sd=qw.x<0.?0.:1.;float ex=hw-abs(qw.x);float wy=qw.y;
  float W=(.07+.03*sin(wy*7.3+sd*2.)+.016*sin(wy*17.+sd*5.)+.07*smoothstep(.6,1.,wy)+.05*smoothstep(.32,0.,wy))*mix(1.,2.6,wide);
  float dw=W-ex;
  float top=.87+.05*(1.-pow(clamp(abs(qw.x)/hw,0.,1.),2.))+.01*sin(qw.x*19.+1.);float dc=qw.y-top;
  float fy=.15+.022*sin(qw.x*8.+1.)+.01*sin(qw.x*21.);float df=fy-qw.y;
  float mx=max(dw,max(dc,df));float cov=aa(-mx,px);
  back*=.55+.45*smoothstep(0.,.07,-mx);
  vec3 wc=mix(vec3(.14,.085,.058),vec3(.33,.21,.14),smoothstep(.25,.8,r0));
  wc*=.32+(1.3*glow*ht+.7*lamp*fl)*(.35+.65*dif);wc*=mix(1.,.6,smoothstep(0.,.1,mx));
  wc+=vec3(.5,.22,.08)*smoothstep(.022,0.,mx)*(.25+glow*1.2)*ht;
  vec3 c=mix(back,wc,cov);
  float cr=abs(n(qw*vec2(13.,24.))*.65+n(qw*vec2(29.,51.))*.35-.5);
  float fc=smoothstep(0.,.03,df);float lava=smoothstep(.06,0.,cr)*fc;
  vec3 lc=mix(vec3(.95,.28,.04),vec3(1.,.78,.35),smoothstep(.025,0.,cr));
  c=mix(c,lc*(.75+.2*sin(uT*1.4+qw.x*9.))*ht,lava*.9);
  c+=vec3(1.,.36,.08)*exp(-max(-df,0.)*16.)*.2*ht*(1.-fc);
  c=mix(c,ink,aa(abs(mx)-px*.7,px)*.85);
  float by0=.905,by1=.948;float pw=mix(.03,.045,wide);float ex2=hw-abs(qf.x);
  float db=abs(qf.y-(by0+by1)*.5)-(by1-by0)*.5;
  float bt=clamp((qf.y-by0)/(by1-by0),0.,1.);float bg=n(vec2(qf.x*6.,qf.y*170.));
  vec3 beam=mix(vec3(.3,.17,.085),vec3(.55,.34,.17),bg*.55+.25)*(.55+.45*sin(bt*3.1416))*(.5+.6*glow+.5*lamp*fl);
  c=mix(c,beam,aa(db,px));c=mix(c,ink,aa(abs(db)-px*.7,px)*.9);
  lantern(c,qw,vec2(-lpx,.8),by0,fl,px);lantern(c,qw,vec2(lpx,.8),by0,fl,px);
  c+=vec3(1.,.6,.25)*lamp*fl*.06;
  float dp=max(ex2-pw,qf.y-by1-.01);
  float pt=clamp(ex2/pw,0.,1.);float pg=n(vec2(ex2*170.,qf.y*6.));
  vec3 post=mix(vec3(.3,.17,.085),vec3(.55,.34,.17),pg*.55+.25)*(.5+.5*sin(pt*3.1416))*(.45+.6*glow+.6*lamp*fl);
  c=mix(c,post,aa(dp,px));c=mix(c,ink,aa(abs(ex2-pw)-px*.7,px)*step(qf.y,by1+.008)*.9);
  vec2 bp=vec2(ex2-pw*.5,qf.y-by0+.012);float dbr=max(abs(bp.x)-pw*.62,abs(bp.y)-.024);
  c=mix(c,vec3(.17,.16,.155)*(.7+.5*glow+.4*lamp),aa(dbr,px));c=mix(c,ink,aa(abs(dbr)-px*.6,px));
  float rv=min(length(bp-vec2(0.,.012)),length(bp+vec2(0.,.012)))-.0045;c=mix(c,vec3(.55,.5,.42),aa(rv,px));
  float vg=smoothstep(1.25,.28,length((uv-vec2(.5,.48))*vec2(mix(1.,.6,wide),1.15)));c*=.5+.5*vg;
  c+=(h(gl_FragCoord.xy)-.5)/160.;
  gl_FragColor=vec4(c,1.);
}`;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null};
  const a=sh(gl.VERTEX_SHADER,vs),b=sh(gl.FRAGMENT_SHADER,fs);if(!a||!b)return;
  const pr=gl.createProgram();gl.attachShader(pr,a);gl.attachShader(pr,b);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
  gl.useProgram(pr);const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const lp=gl.getAttribLocation(pr,'p');gl.enableVertexAttribArray(lp);gl.vertexAttribPointer(lp,2,gl.FLOAT,false,0,0);
  sky.u={R:gl.getUniformLocation(pr,'uR'),T:gl.getUniformLocation(pr,'uT'),H:gl.getUniformLocation(pr,'uH'),P:gl.getUniformLocation(pr,'uP')};
  sky.gl=gl;sky.ok=true;
  const rs=()=>{const k=Math.min(window.devicePixelRatio||1,innerWidth*innerHeight>1.6e6?1:1.5);cv.width=Math.max(2,Math.round(innerWidth*k));cv.height=Math.max(2,Math.round(innerHeight*k));gl.viewport(0,0,cv.width,cv.height);sky.dirty=true};
  rs();addEventListener('resize',rs);
  cv.addEventListener('webglcontextlost',e=>{e.preventDefault();sky.ok=false;cv.classList.remove('on')});
  requestAnimationFrame(()=>cv.classList.add('on'));
})();
function drawSky(dt,par){
  if(!sky.ok)return;
  const lw=low(),m=lw?'l':'a';
  if(m!==sky.mode){sky.mode=m;sky.dirty=true}
  const anim=!lw&&!RM.matches&&!document.hidden;
  if(!anim&&!sky.dirty)return;
  sky.acc+=dt;if(anim&&!sky.dirty&&sky.acc<1/30)return;
  if(anim)sky.t+=Math.min(sky.acc,.1);sky.acc=0;sky.dirty=false;
  const gl=sky.gl,u=sky.u,ht=+G('heat')||0;
  gl.uniform2f(u.R,sky.cv.width,sky.cv.height);gl.uniform1f(u.T,sky.t+3.);gl.uniform1f(u.H,Math.min(1,ht));gl.uniform2f(u.P,anim?par[0]:0,anim?par[1]:0);
  gl.drawArrays(gl.TRIANGLES,0,3);
}

const par={x:0,y:0,tx:0,ty:0};
addEventListener('pointermove',e=>{if(e.pointerType!=='mouse')return;par.tx=(e.clientX/innerWidth-.5)*2;par.ty=(e.clientY/innerHeight-.5)*2},{passive:true});
const ori=(b,g)=>{if(b==null||g==null)return;par.tx=Math.max(-1,Math.min(1,g/25));par.ty=Math.max(-1,Math.min(1,(b-45)/25))};
addEventListener('deviceorientation',e=>ori(e.beta,e.gamma),{passive:true});
try{const TGW=window.Telegram&&Telegram.WebApp;if(TGW&&TGW.DeviceOrientation&&TGW.isVersionAtLeast&&TGW.isVersionAtLeast('8.0')){TGW.DeviceOrientation.start({refresh_rate:60});TGW.onEvent('deviceOrientationChanged',()=>{const d=TGW.DeviceOrientation;ori(d.beta*57.3,d.gamma*57.3)})}}catch(e){}
const world=$('.world'),aura=$('.stage-aura');

const stage=$('#stage'),cr=$('#crystal'),hitL=$('.stage-hit');
const rings=$$('.stage-hit .shock'),fl=$('.stage-hit .flash');
let lastShock=0;
function shock(x,y){
  if(low()||RM.matches)return;const n=performance.now();if(n-lastShock<70)return;lastShock=n;
  const b=stage.getBoundingClientRect(),px=(x-b.left)+'px',py=(y-b.top)+'px';
  for(const el of[...rings,fl]){el.style.setProperty('--x',px);el.style.setProperty('--y',py);el.classList.remove('go');void el.offsetWidth;el.classList.add('go')}
  fbPulse=1;
}
if(cr){
  cr.addEventListener('pointerdown',e=>{const f=G('forge'),s=G('S');if(f&&f.r&&f.r.ok&&!f.hit(e.clientX,e.clientY))return;if(s&&s.energy<1)return;const b=cr.getBoundingClientRect();const cx=b.left+b.width/2,cy=b.top+b.height*.47;shock(cx+(e.clientX-cx)*.35,cy+(e.clientY-cy)*.35)});
  cr.addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const s=G('S');if(s&&s.energy<1)return;const b=cr.getBoundingClientRect();shock(b.left+b.width/2,b.top+b.height*.47)});
}

const fb=$('.stage-fb'),fx2=fb&&fb.getContext('2d');let fbOn=false,fbA=0,fbPulse=0;
setTimeout(()=>{const f=G('forge');fbOn=!!(fb&&fx2&&!(f&&f.r&&f.r.ok));if(fbOn)fb.classList.add('on')},300);
function drawFb(dt){
  if(!fbOn||!onGame())return;
  const d=Math.min(devicePixelRatio||1,2),w=fb.clientWidth,h=fb.clientHeight;if(!w||!h)return;
  if(fb.width!==Math.round(w*d)||fb.height!==Math.round(h*d)){fb.width=Math.round(w*d);fb.height=Math.round(h*d)}
  const x=fx2;x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);
  const f=G('forge');let hue=f?f.hue:24;if(f&&f.rainbow)hue=(performance.now()/40)%360;
  fbA+=dt*(RM.matches?0:.55);fbPulse=Math.max(0,fbPulse-dt*4);
  const R=Math.min(w,h)*.2*(1+fbPulse*.05),cx=w/2+par.x*4,cy=h*.47+Math.sin(fbA*2)*3,H=R*2.1,top=cy-H*.55,mid1=cy-H*.12,mid2=cy+H*.12,bot=cy+H*.5;
  const g=x.createRadialGradient(cx,cy,0,cx,cy,R*2.4);g.addColorStop(0,`hsla(${hue},80%,60%,${.22+fbPulse*.25})`);g.addColorStop(1,'transparent');x.fillStyle=g;x.fillRect(0,0,w,h);
  x.fillStyle='rgba(42,21,8,.6)';x.beginPath();x.ellipse(cx,bot+R*.25,R*1.1,R*.22,0,0,6.283);x.fill();
  const seg=6,pts=[];for(let i=0;i<seg;i++){const a=fbA+i/seg*6.283;pts.push({c:Math.cos(a),s:Math.sin(a),a})}
  const faces=[];for(let i=0;i<seg;i++){const p=pts[i],q=pts[(i+1)%seg],nz=Math.sin((p.a+q.a)/2+(i===seg-1?Math.PI:0));const mz=Math.sin(p.a+Math.PI/seg);faces.push({p,q,z:mz,l:Math.cos(p.a+Math.PI/seg-.9)})}
  faces.sort((a,b)=>a.z-b.z);
  for(const fc of faces){if(fc.z<-.05)continue;const {p,q}=fc;const X=v=>cx+v*R;
    const L=.32+.4*Math.max(0,fc.l)+fbPulse*.2;
    const col=a=>`hsla(${hue},75%,${Math.round(L*100)}%,${a})`;
    const gr=x.createLinearGradient(0,top,0,bot);gr.addColorStop(0,col(.95));gr.addColorStop(.5,`hsla(${hue},70%,${Math.round(L*70)}%,.92)`);gr.addColorStop(1,`hsla(${hue+10},70%,${Math.round(L*40)}%,.95)`);
    x.fillStyle=gr;x.strokeStyle='#2a1508';x.lineWidth=3;x.lineJoin='round';
    x.beginPath();x.moveTo(cx,top);x.lineTo(X(p.c),mid1);x.lineTo(X(q.c),mid1);x.closePath();x.fill();x.stroke();
    x.beginPath();x.moveTo(X(p.c),mid1);x.lineTo(X(q.c),mid1);x.lineTo(X(q.c*.96),mid2);x.lineTo(X(p.c*.96),mid2);x.closePath();x.fill();x.stroke();
    x.beginPath();x.moveTo(X(p.c*.96),mid2);x.lineTo(X(q.c*.96),mid2);x.lineTo(cx,bot);x.closePath();x.fill();x.stroke()}
  const sp=x.createRadialGradient(cx-R*.3,mid1-R*.2,0,cx-R*.3,mid1-R*.2,R*.6);sp.addColorStop(0,`rgba(255,255,255,${.35+fbPulse*.4})`);sp.addColorStop(1,'transparent');x.fillStyle=sp;x.fillRect(cx-R*1.2,top,R*2.4,H);
}

let last=performance.now();
function loop(n){
  const dt=Math.min(.05,(n-last)/1000);last=n;
  const k=RM.matches?0:Math.min(1,dt*4);par.x+=(par.tx-par.x)*k;par.y+=(par.ty-par.y)*k;
  if(!RM.matches&&!low()){
    if(world)world.style.transform=`scale(1.06) translate3d(${(-par.x*7).toFixed(2)}px,${(-par.y*7).toFixed(2)}px,0)`;
    if(aura&&onGame()){aura.style.transform=`translate3d(${(par.x*10).toFixed(2)}px,${(par.y*8).toFixed(2)}px,0)`;const g=aura.firstElementChild;if(g)g.style.opacity=(.7+Math.min(1,+G('heat')||0)*.3).toFixed(3)}
  }
  drawSky(dt,[par.x,par.y]);drawFb(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

const navB=$$('.nav button[data-go]');
const syncNav=()=>navB.forEach(b=>{if(b.classList.contains('on'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
const syncSeg=()=>$$('#buyMode button').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('on')?'true':'false'));
const syncTabs=()=>$$('.tab').forEach(t=>{const on=t.classList.contains('on');t.setAttribute('aria-hidden',on?'false':'true');if('inert' in t)t.inert=!on});
let lastFocus=null;
const syncDlg=el=>{const on=el.classList.contains('on');el.setAttribute('aria-hidden',on?'false':'true');if(on){if(!el.contains(document.activeElement))lastFocus=document.activeElement;requestAnimationFrame(()=>{const f=el.id==='sheet'?$('#shClose'):$('#mBtn');if(f&&!el.contains(document.activeElement))f.focus({preventScroll:true})})}else if(lastFocus&&!$('#sheet.on')&&!$('#modal.on')){const lf=lastFocus;lastFocus=null;if(document.contains(lf)&&lf.offsetParent!==null)lf.focus({preventScroll:true})}};
const mo=new MutationObserver(ms=>{let nv=false,sg=false,tb=false;for(const m of ms){const t=m.target;if(t.matches('.nav button'))nv=true;else if(t.matches('#buyMode button'))sg=true;else if(t.matches('.tab'))tb=true;else if(t.id==='sheet'||t.id==='modal')syncDlg(t)}if(nv)syncNav();if(sg)syncSeg();if(tb)syncTabs()});
[...navB,...$$('#buyMode button'),...$$('.tab'),$('#sheet'),$('#modal')].forEach(el=>el&&mo.observe(el,{attributes:true,attributeFilter:['class']}));
syncNav();syncSeg();syncTabs();

const nav=$('.nav');
if(nav)nav.addEventListener('keydown',e=>{const i=navB.indexOf(document.activeElement);if(i<0)return;let j=-1;if(e.key==='ArrowRight')j=(i+1)%navB.length;else if(e.key==='ArrowLeft')j=(i-1+navB.length)%navB.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=navB.length-1;if(j<0)return;e.preventDefault();navB[j].focus();navB[j].click()});
const seg=$('#buyMode');
if(seg)seg.addEventListener('keydown',e=>{const bs=$$('#buyMode button'),i=bs.indexOf(document.activeElement);if(i<0)return;let j=-1;if(e.key==='ArrowRight')j=(i+1)%bs.length;else if(e.key==='ArrowLeft')j=(i-1+bs.length)%bs.length;if(j<0)return;e.preventDefault();bs[j].focus();bs[j].click()});
document.addEventListener('keydown',e=>{
  if(e.key!=='Tab')return;const d=$('#modal.on')||$('#sheet.on');if(!d)return;
  const f=[...d.querySelectorAll('button,[href],[tabindex]:not([tabindex="-1"]),canvas.sh-viewer')].filter(x=>!x.hidden&&!x.disabled&&x.offsetParent!==null);if(!f.length)return;
  const a=f[0],z=f[f.length-1];if(!d.contains(document.activeElement)){e.preventDefault();a.focus();return}
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
});

const pb=[[$('.lvlbar'),$('#lvlFill')],[$('.bar.en'),$('#energyFill')],[$('.bar.heat'),$('#heatFill')]];
setInterval(()=>{for(const[b,i]of pb){if(!b||!i)continue;const m=/scaleX\(([\d.]+)\)/.exec(i.style.transform||'');if(m)b.setAttribute('aria-valuenow',Math.round(Math.min(1,+m[1])*100))}const et=$('#energyTxt');if(et&&pb[1][0])pb[1][0].setAttribute('aria-valuetext',et.textContent)},1000);
})();
