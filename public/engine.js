const V3={
  sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  len:a=>Math.hypot(a[0],a[1],a[2]),
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]}
};

const M4={
  id(){const o=new Float32Array(16);o[0]=o[5]=o[10]=o[15]=1;return o},
  mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o},
  persp(f,a,n,far){const t=1/Math.tan(f/2),o=new Float32Array(16);o[0]=t/a;o[5]=t;o[10]=(far+n)/(n-far);o[11]=-1;o[14]=2*far*n/(n-far);return o},
  look(e,c,u){const z=V3.norm(V3.sub(e,c)),x=V3.norm(V3.cross(u,z)),y=V3.cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-V3.dot(x,e),-V3.dot(y,e),-V3.dot(z,e),1])},
  local(p,r,s){
    const cx=Math.cos(r[0]),sx=Math.sin(r[0]),cy=Math.cos(r[1]),sy=Math.sin(r[1]),cz=Math.cos(r[2]),sz=Math.sin(r[2]);
    const a=cy*cz+sy*sx*sz,b=-cy*sz+sy*sx*cz,c=sy*cx,d=cx*sz,e=cx*cz,f=-sx,g=-sy*cz+cy*sx*sz,h=sy*sz+cy*sx*cz,i=cy*cx;
    const S=typeof s==='number'?[s,s,s]:s;
    return new Float32Array([a*S[0],d*S[0],g*S[0],0,b*S[1],e*S[1],h*S[1],0,c*S[2],f*S[2],i*S[2],0,p[0],p[1],p[2],1])
  }
};

function mesh(tris,crease){
  const P=[],F=[];
  for(const t of tris){
    let n=V3.cross(V3.sub(t[1],t[0]),V3.sub(t[2],t[0]));
    if(V3.len(n)<1e-9)continue;
    n=V3.norm(n);
    if(V3.dot(n,t[3])<0)n=[-n[0],-n[1],-n[2]];
    P.push(t);F.push(n)
  }
  const key=p=>Math.round(p[0]*1e4)+','+Math.round(p[1]*1e4)+','+Math.round(p[2]*1e4);
  const map=new Map();
  if(crease<1)P.forEach((t,i)=>{for(let k=0;k<3;k++){const q=key(t[k]);let a=map.get(q);if(!a)map.set(q,a=[]);a.push(i)}});
  const d=new Float32Array(P.length*18);let o=0;
  P.forEach((t,i)=>{
    const fn=F[i];
    for(let k=0;k<3;k++){
      const p=t[k];let n=fn;
      if(crease<1){const s=[0,0,0];for(const j of map.get(key(p))){const m=F[j];if(V3.dot(m,fn)>=crease){s[0]+=m[0];s[1]+=m[1];s[2]+=m[2]}}n=V3.norm(s)}
      d[o++]=p[0];d[o++]=p[1];d[o++]=p[2];d[o++]=n[0];d[o++]=n[1];d[o++]=n[2]
    }
  });
  return{d,n:P.length*3}
}

const Geo={
  lathe(pr,seg,crease=1.1,ph=0){
    const T=[];
    for(let i=0;i<seg;i++){
      const a0=ph+i/seg*Math.PI*2,a1=ph+(i+1)/seg*Math.PI*2,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1),cm=Math.cos((a0+a1)/2),sm=Math.sin((a0+a1)/2);
      for(let j=0;j<pr.length-1;j++){
        const[r0,y0]=pr[j],[r1,y1]=pr[j+1];
        const nr=y1-y0,ny=-(r1-r0),or=[cm*nr,ny,sm*nr];
        const A=[c0*r0,y0,s0*r0],B=[c1*r0,y0,s1*r0],C=[c1*r1,y1,s1*r1],D=[c0*r1,y1,s0*r1];
        T.push([A,B,C,or],[A,C,D,or])
      }
    }
    return mesh(T,crease)
  },
  sphere(r,seg=24){const p=[];const st=Math.max(8,seg>>1);for(let i=0;i<=st;i++){const a=i/st*Math.PI;p.push([Math.sin(a)*r,-Math.cos(a)*r])}return Geo.lathe(p,seg,.3)},
  ellipsoid(rx,ry,seg=28){const p=[];for(let i=0;i<=14;i++){const a=i/14*Math.PI;p.push([Math.sin(a)*rx,-Math.cos(a)*ry])}return Geo.lathe(p,seg,.3)},
  cyl(r,h,seg=24,rt){return Geo.lathe([[0,-h/2],[r,-h/2],[rt??r,h/2],[0,h/2]],seg,.7)},
  cone(r,h,seg=24){return Geo.lathe([[0,0],[r,0],[0,h]],seg,.7)},
  disc(r0,r1,h,seg=48){return Geo.lathe([[r0,-h/2],[r1,-h/2],[r1,h/2],[r0,h/2],[r0,-h/2]],seg,.7)},
  torus(R,r,s1=40,s2=14){
    const T=[],P=(u,v)=>[(R+r*Math.cos(v))*Math.cos(u),r*Math.sin(v),(R+r*Math.cos(v))*Math.sin(u)];
    for(let i=0;i<s1;i++)for(let j=0;j<s2;j++){
      const u0=i/s1*Math.PI*2,u1=(i+1)/s1*Math.PI*2,v0=j/s2*Math.PI*2,v1=(j+1)/s2*Math.PI*2,um=(u0+u1)/2,vm=(v0+v1)/2;
      const or=[Math.cos(vm)*Math.cos(um),Math.sin(vm),Math.cos(vm)*Math.sin(um)];
      T.push([P(u0,v0),P(u1,v0),P(u1,v1),or],[P(u0,v0),P(u1,v1),P(u0,v1),or])
    }
    return mesh(T,.5)
  },
  box(w,h,d){
    const x=w/2,y=h/2,z=d/2,v=[[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[-x,-y,z],[x,-y,z],[x,y,z],[-x,y,z]];
    const f=[[0,1,2,3,[0,0,-1]],[4,5,6,7,[0,0,1]],[0,1,5,4,[0,-1,0]],[3,2,6,7,[0,1,0]],[0,3,7,4,[-1,0,0]],[1,2,6,5,[1,0,0]]];
    const T=[];for(const q of f){T.push([v[q[0]],v[q[1]],v[q[2]],q[4]],[v[q[0]],v[q[2]],v[q[3]],q[4]])}
    return mesh(T,1.1)
  },
  poly(verts,faces){const T=[];for(const f of faces){const a=verts[f[0]],b=verts[f[1]],c=verts[f[2]];T.push([a,b,c,[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3]])}return mesh(T,1.1)},
  octa(r,sy=1){return Geo.poly([[r,0,0],[-r,0,0],[0,r*sy,0],[0,-r*sy,0],[0,0,r],[0,0,-r]],[[0,2,4],[4,2,1],[1,2,5],[5,2,0],[0,4,3],[4,1,3],[1,5,3],[5,0,3]])},
  ico(r,sy=1,jit=0,seed=1){
    const t=(1+Math.sqrt(5))/2;let s=seed;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
    const v=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(p=>{const l=Math.hypot(...p),k=r*(1+(rnd()-.5)*jit)/l;return[p[0]*k,p[1]*k*sy,p[2]*k]});
    return Geo.poly(v,[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]])
  },
  crystal(r,h,seg=6){return Geo.lathe([[0,-h*.5],[r*.92,-h*.24],[r,h*.22],[0,h*.5]],seg,1.1,Math.PI/seg)},
  brilliant(r){return Geo.lathe([[0,-r*.86],[r,-r*.05],[r,r*.04],[r*.62,r*.36],[0,r*.36]],8,1.1,Math.PI/8)}
};

function hex(c){return[(c>>16&255)/255,(c>>8&255)/255,(c&255)/255]}
function hsl(h,s,l){h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return[f(0),f(8),f(4)]}
function Mat(c,o={}){return{c:Array.isArray(c)?c:hex(c),e:o.emi!=null?(Array.isArray(o.emi)?o.emi:hex(o.emi)):[0,0,0],ei:o.ei??1,met:o.met??0,rough:o.rough??.5,gem:o.gem??0,mode:o.mode??0}}
function N(g,m,p=[0,0,0],r=[0,0,0],s=1,c=[],u=null){return{g,m,p:[...p],r:[...r],s,c,u,e:1,hide:false}}

const VS=`attribute vec3 aP;attribute vec3 aN;uniform mat4 uM,uVP;varying vec3 vN,vW,vL;void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vL=aP;vN=mat3(uM)*aN;gl_Position=uVP*w;}`;
const FS=`precision highp float;varying vec3 vN,vW,vL;uniform vec3 uC,uE,uCam,uL,uAcc;uniform float uMet,uRough,uGem,uMode,uShR,uT;
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 env(vec3 d){float y=d.y*.5+.5;vec3 c=mix(vec3(.05,.025,.012),vec3(.3,.16,.08),smoothstep(.2,.55,y));c=mix(c,vec3(.7,.5,.32),smoothstep(.6,1.,y));
c+=vec3(1.,.86,.62)*pow(max(dot(d,normalize(vec3(-.45,.7,.55))),0.),24.)*4.;
c+=uAcc*pow(max(dot(d,normalize(vec3(.85,.15,-.5))),0.),10.)*2.4;
c+=vec3(1.,.45,.1)*pow(max(dot(d,normalize(vec3(0.,-.8,.4))),0.),6.)*1.4;
c+=vec3(1.,.82,.55)*pow(max(dot(d,normalize(vec3(-.8,.2,-.4))),0.),40.)*2.;
c+=vec3(1.,.55,.3)*pow(max(dot(d,normalize(vec3(.7,.4,-.6))),0.),40.)*1.6;return c;}
void main(){
if(uMode>.5){float r=length(vL.xz)/uShR;float a=pow(clamp(1.-r,0.,1.),1.6)*.62;gl_FragColor=vec4(0.,0.,0.,a);return;}
vec3 N=normalize(vN);vec3 V=normalize(uCam-vW);if(dot(N,V)<0.)N=-N;
vec3 R=reflect(-V,N);float NV=max(dot(N,V),0.);vec3 L=normalize(uL);vec3 H=normalize(L+V);
float dif=max(dot(N,L),0.);dif=floor(dif*3.+.5)/3.;float sh=mix(6.,420.,pow(1.-uRough,2.));float sp=pow(max(dot(N,H),0.),sh)*(sh+8.)/50.;
vec3 F0=mix(vec3(.04),uC,uMet);vec3 F=F0+(1.-F0)*pow(1.-NV,5.);
vec3 amb=mix(vec3(.08,.04,.02),vec3(.3,.2,.13),N.y*.5+.5);
vec3 er=env(R);vec3 blur=mix(env(N),er,1.-uRough);
vec3 col=uC*(1.-uMet)*(dif*vec3(1.,.9,.75)*1.3+amb)+F*blur*mix(.6,1.25,uMet)+F*sp*1.4;
col+=uAcc*pow(1.-NV,4.)*.22*(1.-uGem);
if(uGem>0.){vec3 T=refract(-V,N,.62);vec3 inner=env(T)*uC*1.5+uC*uC*.35;inner+=uC*pow(max(dot(T,L),0.),6.)*1.2;
float fr=.06+.94*pow(1.-NV,3.5);vec3 g=mix(inner,er*mix(vec3(1.),uC,.35)*1.25,fr)+vec3(1.)*sp*2.2;
g+=vec3(1.)*pow(max(dot(R,L),0.),180.)*10.;col=mix(col,g,uGem);}
col+=uE;col=aces(col*1.05);col=pow(col,vec3(1./2.2));col=mix(col,vec3(.12,.06,.025),smoothstep(.3,.1,NV)*(1.-uGem*.55));gl_FragColor=vec4(col,1.);}`;

class R3D{
  constructor(cv,o={}){
    this.cv=cv;this.dpr=o.dpr||Math.min(window.devicePixelRatio||1,2);
    const gl=cv.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:!!o.keep});
    this.gl=gl;this.ok=!!gl;if(!gl)return;
    const sh=(t,s)=>{const x=gl.createShader(t);gl.shaderSource(x,s);gl.compileShader(x);return x};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,VS));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS)){this.ok=false;return}
    gl.useProgram(p);this.p=p;this.aP=gl.getAttribLocation(p,'aP');this.aN=gl.getAttribLocation(p,'aN');
    this.u={};for(const k of['uM','uVP','uC','uE','uCam','uL','uAcc','uMet','uRough','uGem','uMode','uShR','uT'])this.u[k]=gl.getUniformLocation(p,k);
    this.buf=new Map();this.acc=[1,.3,0];
    gl.enableVertexAttribArray(this.aP);gl.enableVertexAttribArray(this.aN)
  }
  size(w,h){const W=Math.max(1,Math.round(w*this.dpr)),H=Math.max(1,Math.round(h*this.dpr));if(this.cv.width!==W||this.cv.height!==H){this.cv.width=W;this.cv.height=H}}
  vbo(g){let b=this.buf.get(g);if(!b){const gl=this.gl;b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,g.d,gl.STATIC_DRAW);this.buf.set(g,b)}return b}
  update(n,t){if(n.u)n.u(n,t);for(const c of n.c)this.update(c,t)}
  render(root,cam,t=0){
    const gl=this.gl;if(!this.ok)return;
    gl.viewport(0,0,this.cv.width,this.cv.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.depthMask(true);
    const asp=this.cv.width/this.cv.height,eye=cam.eye,VP=M4.mul(M4.persp(cam.fov||.55,asp,.1,60),M4.look(eye,cam.at||[0,0,0],[0,1,0]));
    const u=this.u;gl.uniformMatrix4fv(u.uVP,false,VP);gl.uniform3fv(u.uCam,eye);gl.uniform3fv(u.uL,cam.light||[-.5,.8,.6]);gl.uniform3fv(u.uAcc,this.acc);gl.uniform1f(u.uT,t);
    this.update(root,t);
    const list=[],sh=[];
    const walk=(n,P)=>{if(n.hide)return;const M=M4.mul(P,M4.local(n.p,n.r,n.s));if(n.g&&n.m)(n.m.mode?sh:list).push([n,M]);for(const c of n.c)walk(c,M)};
    walk(root,M4.id());
    const draw=([n,M])=>{const m=n.m;gl.bindBuffer(gl.ARRAY_BUFFER,this.vbo(n.g));gl.vertexAttribPointer(this.aP,3,gl.FLOAT,false,24,0);gl.vertexAttribPointer(this.aN,3,gl.FLOAT,false,24,12);
      gl.uniformMatrix4fv(u.uM,false,M);gl.uniform3fv(u.uC,n.col||m.c);const k=m.ei*n.e,e=n.emi||m.e;gl.uniform3f(u.uE,e[0]*k,e[1]*k,e[2]*k);
      gl.uniform1f(u.uMet,m.met);gl.uniform1f(u.uRough,m.rough);gl.uniform1f(u.uGem,m.gem);gl.uniform1f(u.uMode,m.mode);gl.uniform1f(u.uShR,n.shr||1);gl.drawArrays(gl.TRIANGLES,0,n.g.n)};
    list.forEach(draw);
    if(sh.length){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);sh.forEach(draw);gl.depthMask(true);gl.disable(gl.BLEND)}
  }
}

class Embers{
  constructor(cv){this.cv=cv;this.x=cv.getContext('2d');this.p=[];this.heat=0;this.rs();addEventListener('resize',()=>this.rs());for(let i=0;i<46;i++)this.p.push(this.mk(true))}
  rs(){const d=Math.min(devicePixelRatio||1,2);this.w=innerWidth;this.h=innerHeight;this.cv.width=this.w*d;this.cv.height=this.h*d;this.x.setTransform(d,0,0,d,0,0)}
  mk(any){const cr=['255,196,96','255,150,60','255,226,150','255,120,70'];return{x:Math.random()*this.w,y:any?Math.random()*this.h:this.h+10,v:6+Math.random()*16,s:.6+Math.random()*1.8,a:.15+Math.random()*.5,ph:Math.random()*6.28,c:Math.random()<.28?cr[Math.random()*4|0]:null}}
  draw(dt,t){
    const x=this.x;x.clearRect(0,0,this.w,this.h);x.globalCompositeOperation='lighter';
    const sp=1+this.heat*5;
    for(const p of this.p){p.y-=p.v*dt*sp;p.x+=Math.sin(t*.6+p.ph)*dt*6;if(p.y<-10)Object.assign(p,this.mk(false));
      const f=Math.min(1,(this.h-p.y)/(this.h*.3))*Math.min(1,p.y/(this.h*.25));const a=p.a*Math.max(0,f)*(.6+.4*Math.sin(t*3+p.ph));
      x.fillStyle=p.c?`rgba(${p.c},${a})`:`rgba(255,${110+p.s*40|0},40,${a})`;x.beginPath();x.arc(p.x,p.y,p.s,0,6.283);x.fill()}
    x.globalCompositeOperation='source-over'
  }
}

class Sparks{
  constructor(cv){this.cv=cv;this.x=cv.getContext('2d');this.p=[];this.rs();addEventListener('resize',()=>this.rs())}
  rs(){const d=Math.min(devicePixelRatio||1,2);this.w=innerWidth;this.h=innerHeight;this.cv.width=this.w*d;this.cv.height=this.h*d;this.x.setTransform(d,0,0,d,0,0)}
  burst(x,y,n,col,pow=1){for(let i=0;i<n;i++){const a=Math.random()*6.283,s=(120+Math.random()*420)*pow;this.p.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120*pow,l:1,d:.5+Math.random()*.6,w:.8+Math.random()*1.6,c:Math.random()<.5?col:'255,190,120'})}if(this.p.length>420)this.p.splice(0,this.p.length-420)}
  ring(x,y,col){this.p.push({ring:1,x,y,r:10,l:1,d:.55,c:col})}
  draw(dt){
    const x=this.x;x.clearRect(0,0,this.w,this.h);if(!this.p.length)return;x.globalCompositeOperation='lighter';x.lineCap='round';
    for(let i=this.p.length-1;i>=0;i--){const p=this.p[i];p.l-=dt/p.d;if(p.l<=0){this.p.splice(i,1);continue}
      if(p.ring){p.r+=dt*260;x.strokeStyle=`rgba(${p.c},${p.l*.5})`;x.lineWidth=1.5;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.stroke();continue}
      p.vy+=700*dt;p.vx*=.985;const ox=p.x,oy=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;
      x.strokeStyle=`rgba(${p.c},${p.l})`;x.lineWidth=p.w;x.beginPath();x.moveTo(ox-(p.x-ox)*1.5,oy-(p.y-oy)*1.5);x.lineTo(p.x,p.y);x.stroke()}
    x.globalCompositeOperation='source-over'
  }
}
