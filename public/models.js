const G={
  shadow:Geo.cyl(1,.001,48),
  s04:Geo.sphere(.4,28),s012:Geo.sphere(.12,18),s006:Geo.sphere(.06,12),s022:Geo.sphere(.22,24),s03:Geo.sphere(.3,28),
  oct:Geo.octa(.12,1.4),oct2:Geo.octa(.07,1.5),
  cr:Geo.crystal(.46,2.4),crS:Geo.crystal(.26,1.2),crT:Geo.crystal(.18,.8),
  bril:Geo.brilliant(.7),
  rock:Geo.ico(.55,1,.35,7),rockS:Geo.ico(.2,1,.4,3)
};
const MT={
  graph:Mat(0x5a4a40,{met:.2,rough:.6}),
  dark:Mat(0x2a1a10,{met:.1,rough:.6}),
  steel:Mat(0xa8a39b,{met:1,rough:.24}),
  satin:Mat(0x6d6862,{met:1,rough:.45}),
  brass:Mat(0xc8a05a,{met:1,rough:.28}),
  copper:Mat(0xc86a3c,{met:1,rough:.3}),
  rubber:Mat(0x0f0e0d,{rough:.9}),
  ceramic:Mat(0xe8e1d6,{rough:.38}),
  wood:Mat(0x8a5530,{rough:.72}),
  molten:Mat(0x3a0e00,{emi:0xff3a00,ei:1.05,rough:.4}),
  hot:Mat(0x4a1a06,{emi:0xff6420,ei:1.5,rough:.3}),
  white:Mat(0xffffff,{emi:0xffe6cc,ei:1.6}),
  void:Mat(0x050404,{rough:.15,met:.2}),
  shadow:Mat(0,{mode:1})
};
const gem=(c)=>Mat(Array.isArray(c)?c:hex(c),{gem:1,rough:.04});
const SH=(y,r)=>{const n=N(G.shadow,MT.shadow,[0,y,0],[0,0,0],[r,1,r]);return n};
const cache={};
const geo=(k,f)=>cache[k]||(cache[k]=f());

const MODELS={
  m1(){
    const SK=Mat(0xf0b48a,{rough:.6}),TU=Mat(0x8a3a22,{rough:.7}),BE=Mat(0xd2742c,{rough:.85}),LE=Mat(0x3a2414,{rough:.7});
    const tip=N(null,null,[0,0,0]);
    const sparks=[0,1,2,3,4].map(i=>N(G.oct2,MT.hot,[0,0,0],[0,0,0],.5,[],(n,t)=>{const k=((t*1.1)%1-.72)/.28;if(k<0||k>1){n.hide=true;return}n.hide=false;const a=i*1.3+.4;n.p=[1.05+Math.cos(a)*k*.45,-.66+k*.5-k*k*.55,Math.sin(a)*k*.3];n.s=.55*(1-k);n.e=3*(1-k)}));
    const arm=N(null,null,[.4,-.15,.04],[0,0,-1.8],1,[
      N(geo('dwarm',()=>Geo.ellipsoid(.075,.17,16)),TU,[0,.08,0]),
      N(geo('dwhand',()=>Geo.sphere(.07,14)),SK,[0,.26,0]),
      N(geo('dwh',()=>Geo.cyl(.032,.86,12)),MT.wood,[0,.33,0]),
      N(geo('dwpb',()=>Geo.box(.13,.13,.1)),MT.steel,[0,.72,0]),
      N(geo('dwpt',()=>Geo.cone(.05,.3,10)),MT.steel,[.06,.72,0],[0,0,-Math.PI/2]),
      N(geo('dwpt',()=>Geo.cone(.05,.3,10)),MT.steel,[-.06,.72,0],[0,0,Math.PI/2])
    ],(n,t)=>{const k=(t*1.1)%1;n.r[2]=k<.62?-1.85+Math.sin(k/.62*Math.PI/2)*1.55:k<.72?-.3-(k-.62)/.1*1.55:-1.85});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('dwboot',()=>Geo.box(.18,.14,.28)),MT.dark,[-.15,-.78,.03]),
      N(geo('dwboot',()=>Geo.box(.18,.14,.28)),MT.dark,[.15,-.78,.03]),
      N(geo('dwbody',()=>Geo.ellipsoid(.36,.4,28)),TU,[0,-.38,0]),
      N(geo('dwbelt',()=>Geo.cyl(.37,.07,28)),LE,[0,-.45,0]),
      N(geo('dwbk',()=>Geo.box(.12,.09,.04)),MT.brass,[0,-.45,.375]),
      N(geo('dwsh',()=>Geo.sphere(.1,16)),TU,[.31,-.13,.03]),
      N(geo('dwsh',()=>Geo.sphere(.1,16)),TU,[-.31,-.13,.03]),
      N(geo('dwarm',()=>Geo.ellipsoid(.075,.17,16)),TU,[-.38,-.3,.05],[0,0,-.25]),
      N(geo('dwhand',()=>Geo.sphere(.07,14)),SK,[-.42,-.47,.07]),
      N(geo('dwhead',()=>Geo.sphere(.24,24)),SK,[0,.2,0]),
      N(geo('dwbeard',()=>Geo.ellipsoid(.22,.3,22)),BE,[0,.0,.16],[0,0,0],[1,1,.62]),
      N(geo('dwnose',()=>Geo.sphere(.07,14)),SK,[0,.19,.235]),
      N(geo('dweye',()=>Geo.sphere(.028,10)),MT.rubber,[-.085,.27,.205]),
      N(geo('dweye',()=>Geo.sphere(.028,10)),MT.rubber,[.085,.27,.205]),
      N(geo('dwhelm',()=>Geo.lathe([[0,.27],[.08,.262],[.16,.215],[.22,.14],[.255,.06],[.265,0],[0,0]],24,.4)),MT.brass,[0,.25,0]),
      N(geo('dwbrim',()=>Geo.cyl(.29,.035,24)),MT.brass,[0,.26,0]),
      N(geo('dwlamp',()=>Geo.cyl(.06,.07,14)),MT.steel,[0,.42,.2],[Math.PI/2-.55,0,0]),
      N(geo('dwlg',()=>Geo.cyl(.045,.02,14)),MT.white,[0,.442,.232],[Math.PI/2-.55,0,0],1,[],(n,t)=>{n.e=1.6+Math.sin(t*3)*.2}),
      N(geo('dwore',()=>Geo.ico(.13,.8,.3,9)),MT.molten,[1.08,-.79,0],[0,0,0],1,[],(n,t)=>{const k=(t*1.1)%1;n.e=1.3+Math.sin(t*2.2)*.25}),
      arm,...sparks,SH(-.86,1.25)
    ]),cam:{eye:[.6,.55,4.6],at:[.3,-.12,0]}}
  },
  m2(){
    const legs=[];for(const[x,z]of[[.45,.45],[-.45,.45],[.45,-.45],[-.45,-.45]])legs.push(N(geo('dleg',()=>Geo.box(.08,1.5,.08)),MT.satin,[x,0,z]));
    const brace=[];for(let i=0;i<4;i++)brace.push(N(geo('dbr',()=>Geo.box(.9,.04,.04)),MT.steel,[0,-.1,0],[0,i*Math.PI/2,0],1,[N(null,null)]));
    const spin=N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('shaft',()=>Geo.cyl(.05,1.1,12)),MT.steel,[0,.15,0]),
      N(geo('bit',()=>Geo.cone(.2,.55,6)),MT.steel,[0,-.4,0],[Math.PI,0,0]),
      N(geo('bitr',()=>Geo.torus(.12,.025,24,8)),MT.brass,[0,-.375,0])
    ],(n,t)=>{n.r[1]=t*7;n.p[1]=.3+Math.sin(t*3)*.03});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('dbase',()=>Geo.box(1.4,.16,1.4)),MT.graph,[0,-.84,0]),
      N(geo('dplate',()=>Geo.box(1.16,.04,1.16)),MT.satin,[0,-.74,0]),
      ...legs,...brace.map((b,i)=>{const a=i*Math.PI/2;b.p=[Math.sin(a)*.45,-.1,Math.cos(a)*.45];b.r=[0,a,0];return b}),
      N(geo('dtop',()=>Geo.box(1.06,.14,1.06)),MT.graph,[0,.78,0]),
      N(geo('dmot',()=>Geo.cyl(.24,.42,24)),MT.steel,[0,1.04,0]),
      N(geo('dmotr',()=>Geo.torus(.25,.03,40,8)),MT.molten,[0,.92,0],[0,0,0],1,[],(n,t)=>{n.e=1+Math.sin(t*2.2)*.15}),
      spin,
      N(G.s012,MT.hot,[0,-.74,0],[0,0,0],[1,.25,1],[],(n,t)=>{n.e=1.4+Math.sin(t*2.6)*.18}),
      SH(-.93,1.05)
    ]),cam:{eye:[0,1.4,5.6],at:[0,.1,0]}}
  },
  m3(){
    const IR=Mat(0x403833,{met:.7,rough:.45});
    const fr=(i,s)=>N(G.rockS,MT.molten,s[0],[i,i*1.7,i*.6],s[1],[],(n,t)=>{n.e=1.1+Math.sin(t*2+i*1.4)*.35});
    const wheel=(x,z)=>N(geo('mcw',()=>Geo.cyl(.13,.06,20)),IR,[x,-.645,z],[Math.PI/2,0,0],1,[N(geo('mchub',()=>Geo.cyl(.045,.08,12)),MT.brass)]);
    const sl=[-.9,-.45,0,.45,.9].map(x=>N(geo('mcsl',()=>Geo.box(.14,.05,1.36)),MT.wood,[x,-.85,0]));
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      ...sl,
      N(geo('mcrail',()=>Geo.box(2.2,.05,.06)),MT.steel,[0,-.8,.52]),
      N(geo('mcrail',()=>Geo.box(2.2,.05,.06)),MT.steel,[0,-.8,-.52]),
      wheel(-.42,.52),wheel(.42,.52),wheel(-.42,-.52),wheel(.42,-.52),
      N(geo('mcax',()=>Geo.cyl(.03,1.04,10)),MT.satin,[-.42,-.645,0],[Math.PI/2,0,0]),
      N(geo('mcax',()=>Geo.cyl(.03,1.04,10)),MT.satin,[.42,-.645,0],[Math.PI/2,0,0]),
      ...[[-.42,.3],[.42,.3],[-.42,-.3],[.42,-.3]].map(p=>N(geo('mcbr',()=>Geo.box(.1,.07,.1)),IR,[p[0],-.6,p[1]])),
      N(geo('mcbody',()=>Geo.cyl(.62,.5,4,.78)),IR,[0,-.33,0],[0,Math.PI/4,0],[1.3,1,1]),
      N(geo('mcband',()=>Geo.cyl(.675,.04,4)),MT.brass,[0,-.45,0],[0,Math.PI/4,0],[1.3,1,1]),
      N(geo('mcband2',()=>Geo.cyl(.795,.05,4)),MT.brass,[0,-.105,0],[0,Math.PI/4,0],[1.3,1,1]),
      N(geo('mclava',()=>Geo.cyl(.74,.02,4)),MT.molten,[0,-.07,0],[0,Math.PI/4,0],[1.3,1,1],[],(n,t)=>{n.e=1.2+Math.sin(t*1.6)*.25}),
      fr(1,[[-.34,-.03,-.12],.62]),fr(2,[[.02,0,.14],.7]),fr(3,[[.34,-.03,-.1],.6]),fr(4,[[-.16,.07,.16],.5]),fr(5,[[.22,.06,.2],.45]),
      SH(-.9,1.5)
    ]),cam:{eye:[1.3,1.15,4.3],at:[0,-.38,0]}}
  },
  m4(){
    const ST=Mat(0x6a5a50,{rough:.9});
    const lamp=N(null,null,[0,.22,.24],[0,0,0],1,[
      N(geo('msch',()=>Geo.box(.016,.1,.016)),MT.satin,[0,-.05,0]),
      N(geo('msl',()=>Geo.cyl(.055,.11,6)),MT.hot,[0,-.155,0],[0,0,0],1,[],(n,t)=>{n.e=1.6+Math.sin(t*2.1)*.12}),
      N(geo('mslc',()=>Geo.cone(.075,.06,6)),MT.brass,[0,-.1,0]),
      N(geo('mslb',()=>Geo.cyl(.065,.025,6)),MT.brass,[0,-.222,0])
    ],(n,t)=>{n.r[2]=Math.sin(t*1.3)*.12});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(G.rock,ST,[0,-.23,-.45],[0,.3,0],[2,1.5,.8]),
      N(geo('msop',()=>Geo.box(.8,1,.04)),Mat(0x0a0503,{emi:0x3a1204,ei:.7}),[0,-.38,.1],[0,0,0],1,[],(n,t)=>{n.e=.5+Math.sin(t*.9)*.15}),
      N(geo('mspo',()=>Geo.box(.14,1.1,.14)),MT.wood,[-.48,-.33,.2]),
      N(geo('mspo',()=>Geo.box(.14,1.1,.14)),MT.wood,[.48,-.33,.2]),
      N(geo('msbm',()=>Geo.box(1.2,.16,.18)),MT.wood,[0,.3,.2]),
      N(geo('msbr',()=>Geo.box(.18,.05,.2)),MT.satin,[-.48,.2,.2]),
      N(geo('msbr',()=>Geo.box(.18,.05,.2)),MT.satin,[.48,.2,.2]),
      lamp,
      N(geo('msrail',()=>Geo.box(.04,.04,1.1)),MT.steel,[-.2,-.86,.7]),
      N(geo('msrail',()=>Geo.box(.04,.04,1.1)),MT.steel,[.2,-.86,.7]),
      ...[.35,.65,.95].map(z=>N(geo('mssl',()=>Geo.box(.6,.04,.1)),MT.wood,[0,-.9,z])),
      N(G.crT,gem(0xb48cff),[-.82,.05,.05],[.5,0,.6],.8),
      N(G.crT,gem(0x5ef0d8),[.86,-.45,.05],[.5,0,-.7],.7),
      SH(-.93,1.4)
    ]),cam:{eye:[.7,.45,4.6],at:[0,-.22,0]}}
  },
  m5(){
    const sparks=[];for(let i=0;i<7;i++){const ph=i/7;sparks.push(N(G.oct2,MT.hot,[0,0,0],[0,0,0],.6,[],(n,t)=>{const k=(t*.9+ph)%1;const a=ph*6.28;n.p=[Math.cos(a)*k*.9,.05+k*.8-k*k*1.1,.2+Math.abs(Math.sin(a))*k*.5];n.s=.7*(1-k);n.e=3*(1-k)}))}
    const hammer=N(null,null,[.72,.13,0],[0,0,0],1,[
      N(geo('hh',()=>Geo.cyl(.035,.85,12)),MT.wood,[-.2089,.1281,0],[0,0,Math.PI/2-.55]),
      N(geo('hhead',()=>Geo.box(.2,.34,.2)),MT.steel,[-.5712,.3502,0],[0,0,-.55])
    ],(n,t)=>{const k=(t*1.1)%1,lo=-.3,w=.55-lo;n.r[2]=k<.25?lo+k*4*w:.55-Math.pow((k-.25)/.75,.5)*w});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('ab',()=>Geo.box(.6,.24,.46)),MT.graph,[0,-.76,0]),
      N(geo('aw',()=>Geo.box(.34,.3,.3)),MT.dark,[0,-.5,0]),
      N(geo('at',()=>Geo.box(1.1,.24,.46)),MT.satin,[.05,-.24,0]),
      N(geo('ah',()=>Geo.cone(.12,.5,4)),MT.satin,[-.5,-.24,0],[0,0,Math.PI/2],[1,1,1.3]),
      N(geo('ing',()=>Geo.box(.42,.08,.18)),MT.hot,[.05,-.08,0],[0,0,0],1,[],(n,t)=>{const k=(t*1.1)%1;n.e=1.7+Math.sin(t*2.2)*.25}),
      hammer,...sparks,SH(-.88,1)
    ]),cam:{eye:[.3,1.2,4.8],at:[0,-.12,0]}}
  },
  m6(){
    const BR=Mat(0x8a5a40,{rough:.85}),ST=Mat(0x5a4e48,{rough:.9}),SM=Mat(0x6a625c,{rough:1});
    const puffs=[0,1,2].map(i=>N(G.s012,SM,[0,0,0],[0,0,0],1,[],(n,t)=>{const k=(t*.35+i/3)%1;n.p=[Math.sin(k*4+i)*.06+k*.12,1.0+k*.9,0];const s=(.07+.09*k)/.12*(k<.85?1:(1-k)/.15);n.s=s;n.hide=s<.05}));
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('fnpl',()=>Geo.cyl(.75,.12,8)),ST,[0,-.82,0]),
      N(geo('fndome',()=>Geo.lathe([[0,-.76],[.62,-.76],[.64,-.4],[.55,-.05],[.36,.18],[.16,.3],[0,.3]],20,.6)),BR,[0,0,0]),
      N(geo('fnch',()=>Geo.cyl(.13,.6,12)),BR,[0,.55,0]),
      N(geo('fncap',()=>Geo.cyl(.17,.06,12)),MT.dark,[0,.88,0]),
      N(geo('fnmo',()=>Geo.box(.38,.28,.12)),MT.hot,[0,-.53,.58],[0,0,0],1,[],(n,t)=>{n.e=1.5+Math.sin(t*2)*.18}),
      N(geo('fnli',()=>Geo.box(.5,.06,.14)),MT.dark,[0,-.36,.57]),
      N(geo('fnba',()=>Geo.cyl(.655,.05,20)),MT.dark,[0,-.62,0]),
      N(G.rockS,MT.graph,[.75,-.8,.45],[1,2,0],.5),
      N(G.rockS,MT.graph,[.97,-.8,.18],[2,1,1],.45),
      N(G.rockS,MT.molten,[-.8,-.81,.38],[0,1,2],.4,[],(n,t)=>{n.e=.9+Math.sin(t*2)*.3}),
      ...puffs,SH(-.89,1.15)
    ]),cam:{eye:[.4,1.0,4.6],at:[0,-.08,0]}}
  },
  m7(){
    const ST=Mat(0x6e625a,{rough:.85}),SD=Mat(0x4a403a,{rough:.9}),DW=Mat(0x5a3820,{rough:.7});
    const rune=(x,y,i)=>N(geo('gtr',()=>Geo.box(.05,.2,.015)),MT.hot,[x,y,.177],[0,0,0],1,[],(n,t)=>{n.e=.9+(Math.sin(t*1.2-i*.9)*.5+.5)*.7});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('gts1',()=>Geo.box(2.3,.1,.7)),SD,[0,-.85,.15]),
      N(geo('gts2',()=>Geo.box(2,.1,.5)),ST,[0,-.75,.05]),
      N(geo('gtp',()=>Geo.box(.34,1.5,.34)),ST,[-.75,.05,0]),
      N(geo('gtp',()=>Geo.box(.34,1.5,.34)),ST,[.75,.05,0]),
      N(geo('gtc',()=>Geo.box(.42,.1,.42)),SD,[-.75,.85,0]),
      N(geo('gtc',()=>Geo.box(.42,.1,.42)),SD,[.75,.85,0]),
      N(geo('gtl',()=>Geo.box(1.94,.22,.42)),ST,[0,1.01,0]),
      N(geo('gtt',()=>Geo.box(1.16,.2,.2)),SD,[0,.8,0]),
      N(geo('gtd',()=>Geo.box(.56,1.4,.08)),DW,[-.29,0,0]),
      N(geo('gtd',()=>Geo.box(.56,1.4,.08)),DW,[.29,0,0]),
      ...[-.4,.4].flatMap(y=>[-.29,.29].map(x=>N(geo('gtb',()=>Geo.box(.5,.05,.02)),MT.brass,[x,y,.05]))),
      N(geo('gtsm',()=>Geo.box(.012,1.36,.06)),MT.hot,[0,0,0],[0,0,0],1,[],(n,t)=>{n.e=.8+Math.sin(t*1.2)*.2}),
      N(geo('gtk',()=>Geo.sphere(.04,12)),MT.brass,[-.08,0,.07]),
      N(geo('gtk',()=>Geo.sphere(.04,12)),MT.brass,[.08,0,.07]),
      N(G.oct,gem(0xff8a2a),[0,1.01,.24],[Math.PI/2,0,0],1,[],(n,t)=>{n.emi=[1,.45,.1];n.e=.3+Math.sin(t*1.6)*.2}),
      rune(-.75,-.3,0),rune(-.75,.1,1),rune(-.75,.5,2),rune(.75,.5,3),rune(.75,.1,4),rune(.75,-.3,5),
      SH(-.92,1.6)
    ]),cam:{eye:[.5,.5,5.2],at:[0,.06,0]}}
  },
  tap(){
    const h=N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('th',()=>Geo.cyl(.05,1.5,16)),MT.wood,[0,-.25,0]),
      N(geo('thg',()=>Geo.cyl(.065,.45,16)),MT.rubber,[0,-.78,0]),
      N(geo('thead',()=>Geo.box(.95,.34,.34)),MT.steel,[0,.55,0]),
      N(geo('tcore',()=>Geo.box(.97,.07,.36)),MT.molten,[0,.55,0],[0,0,0],1,[],(n,t)=>{n.e=1.2+Math.sin(t*2)*.25}),
      N(geo('tcap',()=>Geo.box(.16,.42,.42)),MT.graph,[.52,.55,0]),
      N(geo('tcap',()=>Geo.box(.16,.42,.42)),MT.graph,[-.52,.55,0])
    ],(n,t)=>{n.r[2]=-.55+Math.sin(t*1.8)*.12;n.p[1]=Math.sin(t*1.8)*.04});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[h,SH(-1.02,.8)]),cam:{eye:[0,.9,4.6],at:[0,-.05,0]}}
  },
  energy(o={}){
    const bars=[0,1,2,3].map(i=>{const a=Math.PI/4+i*Math.PI/2;return N(geo('lnbar',()=>Geo.box(.04,.8,.04)),MT.brass,[Math.cos(a)*.27,-.29,Math.sin(a)*.27])});
    const strut=(a,b,w,m,k)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return N(geo(k,()=>Geo.box(w,l,w)),m,[(a[0]+b[0])/2,(a[1]+b[1])/2,0],[0,0,-Math.atan2(dx,dy)])};
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('lnbase',()=>Geo.cyl(.34,.08,8)),MT.brass,[0,-.78,0]),
      N(geo('lnpl',()=>Geo.cyl(.3,.05,8)),MT.dark,[0,-.715,0]),
      N(geo('lnwk',()=>Geo.cyl(.05,.08,12)),MT.brass,[0,-.65,0]),
      N(geo('lngl',()=>Geo.cyl(.24,.8,8)),gem(0xffe2b0),[0,-.29,0]),
      N(geo('lnfl',()=>Geo.ellipsoid(.085,.17,16)),MT.white,[0,-.3,0],[0,0,0],1,[],(n,t)=>{const f=1+Math.sin(t*9)*.06+Math.sin(t*23)*.04,b=o.full?1.18:1;n.s=[f*b,f*b*(1+Math.sin(t*6)*.05),f*b];n.e=(o.full?2.6:1.9)+Math.sin(t*2.4)*.15}),
      ...bars,
      N(geo('lnpl',()=>Geo.cyl(.3,.05,8)),MT.dark,[0,.135,0]),
      N(geo('lnroof',()=>Geo.cone(.32,.3,8)),MT.brass,[0,.16,0]),
      N(geo('lnchm',()=>Geo.cyl(.08,.08,12)),MT.dark,[0,.5,0]),
      N(G.s006,MT.brass,[-.2,.3,0],[0,0,0],.6),N(G.s006,MT.brass,[.2,.3,0],[0,0,0],.6),
      strut([-.2,.3],[-.17,.72],.03,MT.steel,'lnb1'),strut([.2,.3],[.17,.72],.03,MT.steel,'lnb2'),strut([-.17,.72],[.17,.72],.03,MT.steel,'lnb3'),
      SH(-.83,.7)
    ],(n,t)=>{n.r[1]=.4}),cam:{eye:[0,.9,4.2],at:[0,-.12,0]}}
  },
  regen(){
    const LT=Mat(0x4a2a1a,{rough:.8}),IR=Mat(0x403833,{met:.7,rough:.45});
    const ph=t=>.1+.14*(.5+.5*Math.sin(t*2.2));
    const lv=Geo.poly([[.68,-.34,.25],[-.34,-.34,.25],[-.34,.68,.25],[.68,-.34,-.25],[-.34,-.34,-.25],[-.34,.68,-.25]],[[0,1,2],[3,5,4],[0,3,4],[0,4,1],[1,4,5],[1,5,2],[2,5,3],[2,3,0]]);
    const leather=N(geo('blv',()=>lv),LT,[-.68,0,0],[0,0,0],1,[],(n,t)=>{const k=Math.tan(ph(t));n.s=[1,k,1];n.p[1]=.34*k});
    const top=N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('bbd',()=>Geo.box(1.1,.06,.56)),MT.wood,[-.55,.03,0]),
      N(geo('bbs',()=>Geo.box(.3,.02,.3)),MT.brass,[-.6,.07,0]),
      N(geo('bhd',()=>Geo.cyl(.04,.3,10)),MT.wood,[-1.2,.03,0],[0,0,Math.PI/2])
    ],(n,t)=>{n.r[2]=-ph(t)});
    const hinge=N(null,null,[.45,-.4,0],[0,0,0],1,[leather,top]);
    const puff=N(G.oct2,MT.hot,[0,0,0],[0,0,0],.6,[],(n,t)=>{const k=((t*2.2/6.283)+.25)%1;n.p=[.82+k*.4,-.4+k*.05,0];n.s=.6*(1-k);n.e=2.5*(1-k)});
    return{root:N(null,null,[0,0,0],[0,.5,0],1,[
      N(geo('bbd',()=>Geo.box(1.1,.06,.56)),MT.wood,[-.1,-.43,0]),
      N(geo('bhd',()=>Geo.cyl(.04,.3,10)),MT.wood,[-.78,-.43,0],[0,0,Math.PI/2]),
      N(geo('bhb',()=>Geo.box(.16,.22,.62)),IR,[.42,-.4,0]),
      N(geo('bnz',()=>Geo.cone(.09,.36,16)),MT.brass,[.5,-.4,0],[0,0,-Math.PI/2]),
      hinge,puff,SH(-.47,1.05)
    ]),cam:{eye:[.1,1.35,3.7],at:[-.1,-.28,0]}}
  },
  crit(){
    const strut=(a,b,w,m,k)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return N(geo(k,()=>Geo.box(w,l,w)),m,[(a[0]+b[0])/2,(a[1]+b[1])/2,0],[0,0,-Math.atan2(dx,dy)])};
    const prong=i=>N(null,null,[0,0,0],[0,i*Math.PI/2,0],1,[
      strut([.12,-.49],[.677,.084],.045,MT.brass,'cp1'),
      strut([.677,.084],[.68,.2],.045,MT.brass,'cp2'),
      strut([.68,.2],[.6,.27],.04,MT.brass,'cp3')
    ]);
    const glint=(p,i)=>N(G.oct2,MT.white,p,[0,0,0],.5,[],(n,t)=>{const k=Math.max(0,Math.sin(t*2.2+i*2.1));n.s=.5*k*k+.001;n.hide=k<.2;n.e=2.5});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(null,null,[0,0,0],[0,0,0],1,[
        N(G.bril,gem(0xd8ecff),[0,.15,0]),
        prong(0),prong(1),prong(2),prong(3),
        N(geo('ccol',()=>Geo.cyl(.13,.06,16)),MT.brass,[0,-.5,0]),
        N(geo('cstem',()=>Geo.cyl(.05,.4,12)),MT.brass,[0,-.73,0]),
        N(geo('cbase',()=>Geo.cyl(.3,.08,8)),MT.dark,[0,-.97,0])
      ],(n,t)=>{n.r[1]=t*.6}),
      glint([.32,.62,.18],0),glint([-.38,.5,.2],1),glint([.05,.72,-.2],2),
      SH(-1.02,.7)
    ]),cam:{eye:[0,1.3,4.1],at:[0,-.18,0]}}
  },
  starter(){
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('cr1',()=>Geo.box(1.2,.7,.85)),MT.wood,[0,-.45,0]),
      N(geo('crb',()=>Geo.box(1.24,.08,.89)),MT.satin,[0,-.2,0]),
      N(geo('crb',()=>Geo.box(1.24,.08,.89)),MT.satin,[0,-.7,0]),
      N(geo('crv',()=>Geo.box(.1,.72,.89)),MT.satin,[-.42,-.45,0]),
      N(geo('crv',()=>Geo.box(.1,.72,.89)),MT.satin,[.42,-.45,0]),
      N(G.crS,gem(0xff7a30),[0,.37,0],[0,0,0],.85,[],(n,t)=>{n.r[1]=t*.9;n.p[1]=.37+Math.sin(t*2)*.04}),
      N(G.crT,gem(0x7fd3ff),[-.5,.25,.1],[0,0,.4]),
      N(G.crT,gem(0xa6ff8a),[.5,.25,-.05],[0,0,-.4]),
      SH(-.81,1.05)
    ]),cam:{eye:[0,1.4,4.4],at:[0,0,0]}}
  },
  refill(){return MODELS.energy({full:1})},
  boost2(){
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(null,null,[0,0,0],[0,0,.6],1,[
        N(geo('phandle',()=>Geo.cyl(.07,1.7,16)),Mat(0x9a5f32,{rough:.7}),[0,-.1,0]),
        N(geo('pband',()=>Geo.cyl(.09,.12,16)),MT.brass,[0,-.7,0]),
        N(geo('phead',()=>Geo.box(1.15,.2,.2)),MT.steel,[0,.68,0]),
        N(geo('ptip',()=>Geo.cone(.1,.38,12)),MT.steel,[.56,.68,0],[0,0,-Math.PI/2]),
        N(geo('ptip',()=>Geo.cone(.1,.38,12)),MT.steel,[-.56,.68,0],[0,0,Math.PI/2]),
        N(geo('pcore',()=>Geo.box(.26,.3,.26)),MT.brass,[0,.68,0]),
        N(G.oct,gem(0xff8a2a),[0,.68,.16],[Math.PI/2,0,0],1.3)
      ],(n,t)=>{n.p[1]=.05+Math.sin(t*2)*.05;n.r[1]=t*.8}),
      SH(-1.05,.9)
    ]),cam:{eye:[0,.5,4.6],at:[0,0,0]}}
  },
  boost3(){
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(null,null,[0,0,0],[0,0,0],1,[
        N(geo('mug',()=>Geo.cyl(.48,1,24)),Mat(0x9a5f32,{rough:.7}),[0,-.2,0]),
        N(geo('mugb',()=>Geo.cyl(.5,.08,24)),MT.brass,[0,.18,0]),
        N(geo('mugb',()=>Geo.cyl(.5,.08,24)),MT.brass,[0,-.58,0]),
        N(geo('mugh',()=>Geo.torus(.28,.07,24,10)),MT.brass,[.5,-.2,0],[Math.PI/2,0,0]),
        N(geo('foam',()=>Geo.sphere(.5,20)),MT.ceramic,[0,.32,0],[0,0,0],[1,.45,1]),
        N(G.s012,MT.ceramic,[.28,.46,.15]),
        N(G.s012,MT.ceramic,[-.2,.48,-.1]),
        N(G.oct,gem(0xffb347),[0,-.2,.5],[Math.PI/2,0,0],1.6)
      ],(n,t)=>{n.p[1]=.05+Math.sin(t*2.2)*.05;n.r[1]=t*.7}),
      SH(-.8,.85)
    ]),cam:{eye:[0,.8,4.2],at:[0,-.1,0]}}
  },
  vault(){
    const bolts=[];for(let i=0;i<8;i++){const a=i/8*6.28;bolts.push(N(G.s006,MT.steel,[Math.cos(a)*.5,.05+Math.sin(a)*.5,.48],[0,0,0],.6))}
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('vb',()=>Geo.box(1.3,1.3,.9)),MT.graph,[0,.05,0]),
      N(geo('vf',()=>Geo.box(1.36,.06,.96)),MT.satin,[0,.72,0]),
      N(geo('vf',()=>Geo.box(1.36,.06,.96)),MT.satin,[0,-.62,0]),
      N(geo('vd',()=>Geo.cyl(.46,.08,48)),MT.steel,[0,.05,.46],[Math.PI/2,0,0]),
      N(geo('vdr',()=>Geo.torus(.46,.03,48,8)),MT.molten,[0,.05,.47],[Math.PI/2,0,0],1,[],(n,t)=>{n.e=.8+Math.sin(t*1.6)*.2}),
      ...bolts,
      N(null,null,[0,.05,.54],[0,0,0],1,[0,1,2].map(i=>N(geo('vsp',()=>Geo.box(.52,.05,.05)),MT.brass,[0,0,0],[0,0,i*1.047])).concat([N(geo('vhub',()=>Geo.cyl(.08,.08,24)),MT.brass,[0,0,0],[Math.PI/2,0,0])]),(n,t)=>{n.r[2]=Math.sin(t*1.2)*1.2}),
      SH(-.66,1.05)
    ],(n,t)=>{}),cam:{eye:[1.2,1.1,4.1],at:[0,0,0]}}
  },
  bag(){
    const gems=[[0xff5a2a,-.36,0,.15],[0x7fd3ff,0,.02,.22],[0xa6ff8a,.36,0,.15],[0xffd25a,-.18,.03,-.18],[0xff7fb0,.18,.03,-.18]].map(([c,x,y,z],i)=>N(G.oct,gem(c),[x,y,z],[0,i*2,0],1,[],(n,t)=>{n.r[1]=i*2+t*(.5+i*.1)}));
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(geo('bb',()=>Geo.box(1.2,.6,.8)),MT.wood,[0,-.45,0]),
      N(geo('bbs',()=>Geo.box(1.24,.06,.84)),MT.brass,[0,-.18,0]),
      N(geo('bbv',()=>Geo.box(.08,.62,.84)),MT.brass,[-.4,-.45,0]),
      N(geo('bbv',()=>Geo.box(.08,.62,.84)),MT.brass,[.4,-.45,0]),
      N(geo('blk',()=>Geo.box(.16,.2,.06)),MT.brass,[0,-.3,.42]),
      N(null,null,[0,-.15,-.4],[-2.05,0,0],1,[N(geo('blid',()=>Geo.box(1.2,.08,.8)),MT.wood,[0,0,.4])]),
      N(geo('bglow',()=>Geo.box(1.1,.04,.7)),MT.hot,[0,-.16,0]),
      ...gems,SH(-.76,1)
    ]),cam:{eye:[0,1.5,4.2],at:[0,-.1,0]}}
  },
  gem(c){
    const col=gem(c);
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(G.cr,col,[0,.05,0],[0,0,.05],.62),
      N(G.crS,col,[-.36,-.3,.1],[0,1,.55],.9),
      N(G.crT,col,[.34,-.45,.05],[0,.4,-.6],1),
      N(geo('gb',()=>Geo.cyl(.55,.12,6)),MT.graph,[0,-.72,0]),
      N(geo('gbs',()=>Geo.torus(.55,.015,6,4)),MT.molten,[0,-.66,0]),
      SH(-.79,.8)
    ],(n,t)=>{n.p[1]=Math.sin(t*1.5)*.02}),cam:{eye:[0,.9,4],at:[0,-.05,0]}}
  },
  meteor(){
    const wing=k=>N(geo('fw',()=>Geo.sphere(.3,16)),gem(0xbff7ff),[k*.3,.18,-.06],[0,0,k*.5],[1,.14,.62],[],(n,t)=>{n.r[2]=k*(.35+Math.sin(t*26)*.45)});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(null,null,[0,0,0],[0,0,0],1,[
        N(geo('fbody',()=>Geo.sphere(.34,24)),Mat(0x6a4422,{rough:.5}),[0,.05,0],[0,0,0],[1,.9,1.15]),
        N(G.s022,Mat(0x3a2a10,{emi:0xffe36a,ei:1.8,rough:.3}),[0,-.02,-.08],[0,0,0],.8,[],(n,t)=>{n.e=1.1+Math.sin(t*2.2)*.2}),
        N(G.s006,MT.white,[-.13,.18,.3],[0,0,0],1.3),
        N(G.s006,MT.white,[.13,.18,.3],[0,0,0],1.3),
        N(G.oct,gem(0x7fffd8),[0,.39,0],[0,0,0],1.4,[],(n,t)=>{n.r[1]=t*2}),
        wing(-1),wing(1)
      ],(n,t)=>{n.p[1]=Math.sin(t*3)*.06;n.r[1]=Math.sin(t*1.3)*.5})
    ]),cam:{eye:[0,.5,3.6],at:[0,0,0]}}
  },
  friends(){
    const RK=Mat(0x5a483c,{rough:.88});
    return{root:N(null,null,[0,0,0],[0,0,0],1,[
      N(null,null,[0,0,0],[0,0,0],1,[
        N(geo('frk',()=>Geo.ico(.5,.55,.22,5)),RK,[0,-.55,0]),
        N(G.crS,gem(0xff7a30),[-.38,.15,0],[0,0,.3],1.15),
        N(G.crS,gem(0xffd8b0),[.38,.15,0],[0,0,-.3],1.15),
        N(G.crT,gem(0xffb060),[0,-.3,.36],[.6,0,0],.6)
      ],(n,t)=>{n.r[1]=t*.5}),
      SH(-.86,1)
    ]),cam:{eye:[0,.9,4.1],at:[0,-.1,0]}}
  },
  forge(){return MODELS.m5()}
};

class Thumbs{
  constructor(size=200){this.cv=document.createElement('canvas');this.r=new R3D(this.cv,{dpr:1,keep:true});this.r.size(size,size);this.map={}}
  get ok(){return this.r.ok}
  make(key,build,t=.9){if(!this.r.ok)return'';const m=build();const tt=N(null,null,[0,0,0],[0,.55,0],1,[m.root]);const c=m.cam;this.r.render(tt,{eye:c.eye,at:c.at,fov:.5},t);return this.map[key]=this.cv.toDataURL('image/png')}
}

class Viewer{
  constructor(cv){this.cv=cv;this.r=new R3D(cv);this.m=null;this.rot=0;this.vr=.3;this.drag=null;this.t=0;
    cv.addEventListener('pointerdown',e=>{this.drag=e.clientX;this.vr=0;cv.setPointerCapture(e.pointerId)});
    cv.addEventListener('pointermove',e=>{if(this.drag!=null){this.rot+=(e.clientX-this.drag)*.012;this.vr=(e.clientX-this.drag)*.6;this.drag=e.clientX}});
    const up=()=>{this.drag=null;if(Math.abs(this.vr)<.2)this.vr=.3};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up)}
  set(build){if(!build){this.m=null;return}const m=build();this.m=m;this.root=N(null,null,[0,0,0],[0,0,0],1,[m.root])}
  draw(dt){if(!this.m||!this.r.ok)return;this.t+=dt;if(this.drag==null){this.vr=Math.max(-2.5,Math.min(2.5,this.vr));this.vr+=(.3-this.vr)*Math.min(1,dt*2);this.rot+=this.vr*dt}
    const b=this.cv.getBoundingClientRect();this.r.size(b.width,b.height);this.root.r[1]=this.rot;const c=this.m.cam;this.r.render(this.root,{eye:c.eye,at:c.at,fov:.5},this.t*.6)}
}

class Forge{
  constructor(cv){
    this.cv=cv;this.r=new R3D(cv);this.t=0;this.spin=0;this.vs=.35;this.sq=0;this.flash=0;this.heat=0;this.hue=24;this.rainbow=false;this.tilt=[0,0];this.hp=0;
    this.col=[1,.4,.1];
    this.gemM=gem([1,.5,.2]);this.gemS=gem([1,.5,.2]);
    const RK=Mat(0x4a3a31,{rough:.86}),IR=Mat(0x3b342f,{met:.7,rough:.5});
    this.main=N(G.cr,this.gemM,[0,.3,0],[0,0,0],[.92,.9,.92]);
    this.side=[N(G.crS,this.gemS,[-.36,-.3,.1],[0,1,.55],1),N(G.crT,this.gemS,[.36,-.4,.04],[0,.4,-.6],1),N(G.crT,this.gemS,[.06,-.42,-.34],[-.55,0,.1],.8)];
    this.druse=N(geo('fdruse',()=>Geo.ico(.5,.62,.22,11)),RK,[0,-.66,0],[0,.4,0],1);
    this.cluster=N(null,null,[0,.12,0],[0,0,0],1,[this.druse,this.main,...this.side]);
    this.runes=[0,1,2,3,4,5].map(i=>{const a=(i+.5)*Math.PI/3;return N(geo('frune',()=>Geo.box(.2,.06,.02)),MT.hot,[Math.cos(a)*.872,0,Math.sin(a)*.872],[0,Math.PI/2-a,0],1)});
    const strut=(a,b,w,m)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);return N(geo('fst'+w+'_'+l.toFixed(3),()=>Geo.box(w,l,w)),m,[(a[0]+b[0])/2,(a[1]+b[1])/2,0],[0,0,-Math.atan2(dx,dy)],1)};
    this.claws=[0,1,2,3,4,5].map(i=>N(null,null,[0,0,0],[0,-i*Math.PI/3,0],1,[
      N(geo('fcm',()=>Geo.box(.12,.04,.12)),IR,[.93,-.971,0]),
      strut([.93,-.955],[.89,-.66],.05,MT.brass),
      strut([.89,-.66],[.8,-.55],.042,MT.brass),
      N(G.s006,MT.brass,[.89,-.66,0],[0,0,0],.5),
      N(geo('fct',()=>Geo.octa(.045,1.3)),MT.brass,[.79,-.54,0],[0,0,.7])
    ]));
    this.bed=N(geo('fbed',()=>Geo.cyl(.74,.012,6)),MT.molten,[0,-.944,0]);
    this.root=N(null,null,[0,0,0],[0,0,0],1,[
      this.cluster,
      N(geo('fped',()=>Geo.cyl(1,.24,6)),MT.graph,[0,-1.11,0]),
      N(null,null,[0,-1.11,0],[0,0,0],1,this.runes),
      N(geo('fped2',()=>Geo.cyl(.84,.04,6)),MT.satin,[0,-.97,0]),
      N(geo('flip',()=>Geo.cyl(1.04,.028,6)),MT.brass,[0,-1.005,0]),
      N(geo('fband',()=>Geo.cyl(1.04,.03,6)),MT.brass,[0,-1.215,0]),
      this.bed,...this.claws,
      N(geo('fped3',()=>Geo.cyl(1.12,.08,6)),MT.dark,[0,-1.27,0]),
      SH(-1.32,1.7)
    ]);
  }
  setSkin(h,rb){this.hue=h;this.rainbow=!!rb}
  hit(x,y){const b=this.cv.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height*.47;return Math.hypot(x-cx,y-cy)<Math.min(b.width,b.height)*.36}
  tap(x,y){const b=this.cv.getBoundingClientRect();this.sq=1;this.flash=1;this.tilt=[((y-b.top)/b.height-.5)*.12,((x-b.left)/b.width-.5)*.12]}
  pose(t){
    const k=Math.sin(this.sq*Math.PI);
    this.cluster.r=[0,this.spin,0];this.cluster.p[1]=.12+Math.sin(t*1.1)*.035;this.main.r=[this.tilt[0],0,-this.tilt[1]];this.main.s=[.92*(1+k*.05),.9*(1-k*.06),.92*(1+k*.05)];
  }
  draw(dt){
    if(!this.r.ok)return;this.t+=dt;const t=this.t;
    const b=this.cv.getBoundingClientRect();this.r.size(b.width,b.height);
    this.hp+=dt*10;const h=this.rainbow?this.hp%360:this.hue;const c=hsl(h,.9,.56);this.col=c;this.gemM.c=c;this.gemS.c=hsl(h+12,.85,.6);
    this.vs+=(.22+this.heat*.18-this.vs)*Math.min(1,dt*.8);this.spin+=this.vs*dt;
    this.sq=Math.max(0,this.sq-dt*5);this.flash=Math.max(0,this.flash-dt*3.2);
    this.tilt[0]*=1-Math.min(1,dt*6);this.tilt[1]*=1-Math.min(1,dt*6);
    this.pose(t);
    this.main.emi=c;this.main.e=this.flash*.55+this.heat*.12;
    const g=.45+this.heat*1.6+this.flash*.7;
    this.bed.e=g*.8+Math.sin(t*1.7)*.08;

    this.runes.forEach((o,i)=>{o.e=.35+this.heat*1.4+this.flash*.8+Math.sin(t*1.5+i)*.12});
    this.r.acc=[1,.3+this.heat*.1,0];
    this.r.render(this.root,{eye:[0,1.15,5.6],at:[0,-.18,0],fov:.62},t)
  }
}
