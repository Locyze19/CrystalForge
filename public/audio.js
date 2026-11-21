class Sound{
  constructor(){this.ctx=null;this.sfx=true;this.music=false;this.mus=null;this.last=0;this.mt=0}
  init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    const c=this.ctx=new C();this.out=c.createGain();this.out.gain.value=.7;
    const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;this.out.connect(comp);comp.connect(c.destination);
    this.fx=c.createGain();this.fx.connect(this.out);
    this.dl=c.createDelay(1);this.dl.delayTime.value=.17;this.fb=c.createGain();this.fb.gain.value=.34;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1900;
    this.dl.connect(lp);lp.connect(this.fb);this.fb.connect(this.dl);
    this.dl2=c.createDelay(1);this.dl2.delayTime.value=.29;const g2=c.createGain();g2.gain.value=.45;lp.connect(this.dl2);this.dl2.connect(g2);
    this.wet=c.createGain();this.wet.gain.value=.24;lp.connect(this.wet);g2.connect(this.wet);this.wet.connect(this.out);
    const len=c.sampleRate;this.nb=c.createBuffer(1,len,c.sampleRate);const ch=this.nb.getChannelData(0);for(let i=0;i<len;i++)ch[i]=Math.random()*2-1;
    if(this.music)this.startMusic()}
  env(g,t,a,d,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)}
  osc(f,o,t,dest){const c=this.ctx,os=c.createOscillator(),g=c.createGain(),a=o.a||.004,d=o.d||.25;os.type=o.type||'sine';os.frequency.setValueAtTime(f,t);if(o.to)os.frequency.exponentialRampToValueAtTime(o.to,t+(o.sw||d));
    this.env(g,t,a,d,o.v||.2);let n=os;
    if(o.lp){const bq=c.createBiquadFilter();bq.type='lowpass';bq.frequency.setValueAtTime(o.lp,t);if(o.lp2)bq.frequency.exponentialRampToValueAtTime(o.lp2,t+a+d);bq.Q.value=o.q||1;os.connect(bq);n=bq}
    n.connect(g);g.connect(dest||this.fx);if(o.wet)g.connect(this.dl);os.start(t);os.stop(t+a+d+.05)}
  nz(t,d,f,v,q,type,dest){const c=this.ctx,s=c.createBufferSource();s.buffer=this.nb;const bf=c.createBiquadFilter();bf.type=type;bf.frequency.value=f;bf.Q.value=q;const g=c.createGain();this.env(g,t,.002,d,v);s.connect(bf);bf.connect(g);g.connect(dest||this.fx);s.start(t,Math.random()*.5);s.stop(t+d+.05)}
  tone(f,o={}){if(!this.ctx||!this.sfx)return;this.osc(f,o,this.ctx.currentTime+(o.at||0))}
  noise(d,f,v,q=1,type='bandpass',at=0){if(!this.ctx||!this.sfx)return;this.nz(this.ctx.currentTime+at,d,f,v,q,type)}
  clink(f,at=0,v=.1,d=.6){[1,2.76,5.4,8.93].forEach((m,i)=>this.tone(f*m,{at,d:d/(1+i*.8),v:v/(1+i*1.4),wet:i<2?1:0}))}
  pluck(f,at=0,v=.12,d=.35){this.tone(f,{at,d,v,wet:1});this.tone(f*4,{at,d:d*.18,v:v*.35})}
  thock(at=0,v=.12,f=190){this.tone(f,{to:f*.5,sw:.08,at,d:.1,v});this.noise(.03,1400,v*.4,3,'bandpass',at)}
  boom(at=0,v=.25){this.tone(120,{to:42,sw:.22,at,d:.32,v})}
  horn(f,at,d,v){this.tone(f,{type:'sawtooth',at,a:.03,d,v,lp:1100,lp2:520,q:2,wet:1});this.tone(f*1.006,{type:'square',at,a:.03,d,v:v*.3,lp:800,lp2:400})}
  tap(heat=0){const now=performance.now();if(now-this.last<28)return;this.last=now;const sc=[0,2,4,7,9,12,14,16,19],i=Math.min(sc.length-1,Math.floor(heat*sc.length)),f=659.25*Math.pow(2,sc[(i+(Math.random()*2|0))%sc.length]/12);
    this.noise(.025,4200,.07,1.5);this.thock(0,.07,240);this.clink(f,.006,.055,.45)}
  crit(){this.noise(.18,7000,.07,.8,'highpass');this.boom(0,.18);[0,4,7,12,16].forEach((s,i)=>this.clink(880*Math.pow(2,s/12),i*.045,.05,.7))}
  buy(){this.thock(0,.12,170);this.thock(.07,.09,230);this.clink(1567.98,.1,.06,.4);this.clink(2093,.16,.05,.5)}
  coin(){this.clink(1975.5,0,.06,.35);this.clink(2637,.07,.05,.45)}
  level(){[392,523.25,659.25,783.99].forEach((f,i)=>this.horn(f,i*.12,.22,.07));[523.25,659.25,783.99].forEach(f=>this.horn(f,.5,.9,.05));this.boom(0,.2);this.boom(.5,.24);[0,4,7].forEach((s,i)=>this.clink(1046.5*Math.pow(2,s/12),.5+i*.05,.04,.9))}
  error(){this.tone(196,{type:'square',to:98,sw:.18,d:.2,v:.05,lp:800});this.thock(0,.14,140);this.noise(.12,300,.08,1,'lowpass')}
  open(){this.thock(0,.07,260);this.pluck(784,.03,.07,.2)}
  close(){this.thock(0,.06,200);this.pluck(523.25,.02,.06,.16)}
  meteor(){[0,.09,.18,.34].forEach((a,i)=>this.tone(1800+i*260,{to:2600+i*300,sw:.06,at:a,d:.12,v:.05,wet:1}));this.tone(330,{type:'triangle',a:.05,d:.5,v:.025});this.clink(1318.5,.42,.05,.6)}
  hammer(){this.boom(0,.28);this.noise(.15,2200,.12,.9);this.clink(523.25,.01,.12,1.4);this.clink(784,.03,.05,1.1)}
  startMusic(){if(!this.ctx||this.mus)return;const c=this.ctx,g=c.createGain();g.gain.value=0;g.gain.linearRampToValueAtTime(.42,c.currentTime+2.5);g.connect(this.out);
    const mf=m=>440*Math.pow(2,(m-69)/12),note=(f,t,o)=>this.osc(f,o,t,g);
    const dlp=c.createBiquadFilter();dlp.type='lowpass';dlp.frequency.value=320;dlp.connect(g);
    const drone=[73.42,110].map(f=>{const o=c.createOscillator(),og=c.createGain();o.type='triangle';o.frequency.value=f;og.gain.value=.05;o.connect(og);og.connect(dlp);o.start();return o});
    const _=null;
    const A=[[69,_,67,69,74,_,72,69],[67,_,65,67,69,_,65,64],[62,_,65,69,72,_,71,69],[67,65,64,65,62,_,_,_]];
    const B=[[74,_,72,74,76,_,74,72],[69,_,67,69,72,_,69,67],[65,_,67,69,71,_,72,74],[69,67,65,64,62,_,_,_]];
    const RA=[38,36,41,33],RB=[41,36,38,33],form=[[A,RA],[A,RA],[B,RB],[A,RA]],dur=60/108/2;
    let step=0,next=c.currentTime+.3,alive=true;
    const sch=()=>{if(!alive)return;if(next<c.currentTime)next=c.currentTime+.05;
      while(next<c.currentTime+.35){const i=step%32,bar=i>>3,e=i&7,[M,R]=form[Math.floor(step/32)%4],mel=Math.floor(step/128)%3!==2;
        if(this.music){const m=M[bar][e];
          if(mel&&m!=null){note(mf(m),next,{d:.32,v:.07,wet:1});note(mf(m)*4,next,{d:.06,v:.02})}
          if(e%2===0)note(mf(R[bar]+(e%4===2?7:0)),next,{type:'triangle',d:.24,v:.13,lp:600});
          if(e===0||e===4)note(110,next,{to:45,sw:.15,d:.2,v:.14});
          if(e%2===1){note(e===3?2700:2400,next,{d:.04,v:.014});this.nz(next,.02,5000,.012,2,'bandpass',g)}
          if(Math.random()<.025)note(900+Math.random()*700,next+.1,{to:2000,sw:.05,d:.12,v:.03,wet:1})}
        step++;next+=dur}
      this.mt=setTimeout(sch,90)};
    sch();
    this.mus={g,stop:()=>{alive=false;clearTimeout(this.mt);g.gain.cancelScheduledValues(c.currentTime);g.gain.setValueAtTime(g.gain.value,c.currentTime);g.gain.linearRampToValueAtTime(0,c.currentTime+1.2);setTimeout(()=>{drone.forEach(o=>o.stop());g.disconnect()},1400)}}}
  setMusic(on){this.music=on;if(!this.ctx)return;if(on)this.startMusic();else if(this.mus){this.mus.stop();this.mus=null}}
}
