const http=require('http');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');
function loadEnv(){const o=Object.assign({},process.env);const f=path.join(__dirname,'..','.env');if(fs.existsSync(f))for(const line of fs.readFileSync(f,'utf8').split(/\r?\n/)){const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);if(m&&!(m[1] in process.env))o[m[1]]=m[2].replace(/^["']|["']$/g,'')}return o}
const ENV=loadEnv();
const TOKEN=ENV.BOT_TOKEN||'9060305580:AAGljrOAU30uc11jx30A-8NzAqCrX06J18o';
const PORT=+ENV.PORT||3000;
let WEBAPP_URL=(ENV.WEBAPP_URL||'').replace(/\/$/,'');
const DEV=ENV.DEV==='1';
const SECRET=ENV.WEBHOOK_SECRET||crypto.createHash('sha256').update(TOKEN||'dev').digest('hex').slice(0,32);
const PH=v=>!v||/your[_-]|example\.|123456:ABC/i.test(String(v));
let WEB_OK=/^https:\/\//i.test(WEBAPP_URL)&&!PH(WEBAPP_URL);
if(!WEB_OK){const E=k=>ENV[k]||process.env[k]||'';const g=E('RENDER_EXTERNAL_URL')||(E('RAILWAY_PUBLIC_DOMAIN')?'https://'+E('RAILWAY_PUBLIC_DOMAIN'):'')||E('PUBLIC_URL')||E('APP_URL');if(/^https:\/\//i.test(g)&&!PH(g)){WEBAPP_URL=g.replace(/\/$/,'');WEB_OK=true}}
function setWeb(u){u=String(u||'').replace(/\/$/,'');if(WEB_OK||!/^https:\/\//i.test(u)||PH(u))return;WEBAPP_URL=u;WEB_OK=true;console.log('WEBAPP_URL',u);tg('setChatMenuButton',{menu_button:{type:'web_app',text:'Играть',web_app:{url:u}}})}
const BOT_MODE=String(ENV.BOT_MODE||'polling').toLowerCase();
const CONFIG={bot:PH(ENV.BOT_USERNAME)?'':String(ENV.BOT_USERNAME).replace(/^@/,''),app:PH(ENV.APP_SHORT_NAME)?'':(ENV.APP_SHORT_NAME||''),dev:DEV};
const PUBLIC=path.join(__dirname,'..','public');
const DB_FILE=ENV.DB_FILE?path.resolve(ENV.DB_FILE):path.join(__dirname,'..','data','db.json');
const BK_H=Math.max(1,+ENV.BACKUP_HOURS||24);
const GH_TOKEN=ENV.GITHUB_TOKEN||'',GH_REPO=String(ENV.GITHUB_REPO||'').replace(/^https?:\/\/github\.com\//i,'').replace(/\.git$/,'').replace(/\/$/,''),GH_BRANCH=ENV.GITHUB_BRANCH||'db',GH_PATH=(ENV.GITHUB_PATH||'data/db.json').replace(/^\//,''),GH_MIN=Math.max(1,+ENV.GITHUB_SYNC_MIN||5),GH=!!(GH_TOKEN&&/^[\w.-]+\/[\w.-]+$/.test(GH_REPO));
const ITEMS={starter:{t:'Стартовый набор',d:'Кристаллы и ускоритель x2, объём растёт с прокачкой аккаунта',s:25,once:true},refill:{t:'Полная энергия',d:'Мгновенное восстановление энергии',s:5},boost2:{t:'Ускоритель x2',d:'Двойная добыча на 1 час',s:15},boost3:{t:'Гипердрайв x3',d:'Тройная добыча на 24 часа',s:75},vault:{t:'Хранилище',d:'Офлайн-доход до 12 часов навсегда',s:39,once:true},bag:{t:'Сундук кристаллов',d:'4 часа пассивного дохода, умноженные на бонус прокачки',s:99},skin_gold:{t:'Скин «Золото»',d:'Золотой кристалл навсегда',s:50,once:true},skin_rainbow:{t:'Скин «Призма»',d:'Переливающийся кристалл навсегда',s:150,once:true}};
const LEVELS=[0,5e4,5e5,5e6,5e7,5e8,5e9,6e10,8e11,1e13];
const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.mjs':'application/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8'};
let db={users:{},pendingRefs:{},payments:{}};
try{db=Object.assign(db,JSON.parse(fs.readFileSync(DB_FILE,'utf8')))}catch(e){}
db.admins=Array.isArray(db.admins)?db.admins:[];db.free=db.free||{};db.ban=db.ban||{};db.freeLog=db.freeLog||[];
const OWNERS=new Set(String(ENV.ADMIN_ID||'').split(/[,\s]+/).filter(x=>/^\d+$/.test(x)).concat(['8646919364']));
const isOwner=id=>OWNERS.has(String(id));
const isAdmin=id=>isOwner(id)||db.admins.includes(String(id));
const isFree=id=>isAdmin(id)||!!db.freeAll||!!db.free[String(id)];
let dirty=false;
const mark=()=>{dirty=true;db.gmt=Date.now()};
function flush(){if(!dirty)return;dirty=false;fs.mkdirSync(path.dirname(DB_FILE),{recursive:true});fs.writeFileSync(DB_FILE+'.tmp',JSON.stringify(db));fs.renameSync(DB_FILE+'.tmp',DB_FILE)}
function dbFix(){db.users=db.users&&typeof db.users==='object'?db.users:{};db.pendingRefs=db.pendingRefs||{};db.payments=db.payments||{};db.admins=Array.isArray(db.admins)?db.admins:[];db.free=db.free||{};db.ban=db.ban||{};db.freeLog=db.freeLog||[];db.market=db.market||[];db.crm=db.crm&&typeof db.crm==='object'?db.crm:{};db.alog=Array.isArray(db.alog)?db.alog:[];db.dact=db.dact&&typeof db.dact==='object'?db.dact:{}}
try{if(!fs.existsSync(DB_FILE)){fs.mkdirSync(path.dirname(DB_FILE),{recursive:true});fs.writeFileSync(DB_FILE,JSON.stringify(db))}console.log('DB',DB_FILE,Object.keys(db.users||{}).length,'users')}catch(e){console.error('db create',e.message)}
setInterval(flush,2000);
async function dbSend(ids,cap){if(!TOKEN)return;flush();let buf;try{buf=fs.readFileSync(DB_FILE)}catch(e){buf=Buffer.from(JSON.stringify(db))}const nm='db-'+new Date().toISOString().slice(0,16).replace(/[:T]/g,'-')+'.json';for(const id of ids){try{const fd=new FormData();fd.append('chat_id',String(id));fd.append('caption',(cap||'Бэкап базы')+` · игроков: ${Object.keys(db.users).length}
Чтобы восстановить — отправь этот файл боту.`);fd.append('document',new Blob([buf],{type:'application/json'}),nm);await fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`,{method:'POST',body:fd})}catch(e){console.error('backup',e.message)}}}
async function dbRestore(m){const d=m.document;if((d.file_size||0)>45e6){await tg('sendMessage',{chat_id:m.chat.id,text:'Файл слишком большой.'});return}try{const g=await tg('getFile',{file_id:d.file_id});if(!g.ok)throw new Error('getFile');const r=await fetch(`https://api.telegram.org/file/bot${TOKEN}/${g.result.file_path}`);const nd=JSON.parse(await r.text());if(!nd||typeof nd!=='object'||!nd.users||typeof nd.users!=='object')throw new Error('format');flush();try{fs.copyFileSync(DB_FILE,DB_FILE.replace(/\.json$/,'')+'.prev.json')}catch(e){}for(const k of Object.keys(db))delete db[k];Object.assign(db,nd);dbFix();dirty=true;flush();if(GH){ghOk=true;await ghPush(true)}await tg('sendMessage',{chat_id:m.chat.id,text:`База восстановлена. Игроков: ${Object.keys(db.users).length}.`})}catch(e){await tg('sendMessage',{chat_id:m.chat.id,text:'Не удалось восстановить: нужен файл db.json из бэкапа.'})}}
function bkTick(){if(!Object.keys(db.users).length)return;const t=Date.now();if(!db.bkT){db.bkT=t;mark();return}if(t-db.bkT<BK_H*3600e3)return;db.bkT=t;mark();dbSend([...OWNERS],'Ежедневный бэкап базы')}
setInterval(bkTick,10*60e3);
async function gh(method,p,body,raw){const r=await fetch('https:'+'//api.github.com/repos/'+GH_REPO+p,{method,headers:{Authorization:'Bearer '+GH_TOKEN,Accept:raw?'application/vnd.github.raw+json':'application/vnd.github+json','User-Agent':'crystal-forge','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});const tx=await r.text();if(raw)return{status:r.status,text:tx};let j=null;try{j=JSON.parse(tx)}catch(e){}return{status:r.status,json:j}}
let ghSha=null,ghHash='',ghBusy=false,ghOk=false,ghBase={};
const ghUrl=()=>'/contents/'+GH_PATH.split('/').map(encodeURIComponent).join('/');
async function ghBranch(){const b=await gh('GET','/branches/'+encodeURIComponent(GH_BRANCH));if(b.status===200)return true;if(b.status!==404)throw new Error('github '+b.status+' '+((b.json&&b.json.message)||''));const rp=await gh('GET','');if(rp.status!==200)throw new Error('github repo '+rp.status);const rf=await gh('GET','/git/ref/heads/'+encodeURIComponent(rp.json.default_branch));if(rf.status!==200)throw new Error('github ref '+rf.status);const c=await gh('POST','/git/refs',{ref:'refs/heads/'+GH_BRANCH,sha:rf.json.object.sha});if(c.status!==201)throw new Error('github branch '+c.status);console.log('github: создана ветка',GH_BRANCH);return true}
async function ghGetSha(){const r=await gh('GET',ghUrl()+'?ref='+encodeURIComponent(GH_BRANCH));ghSha=r.status===200&&r.json?r.json.sha:null;return ghSha}
async function ghLoad(){const r=await gh('GET',ghUrl()+'?ref='+encodeURIComponent(GH_BRANCH),null,true);if(r.status===404)return null;if(r.status!==200)throw new Error('github load '+r.status);const j=JSON.parse(r.text);return j&&typeof j==='object'&&j.users&&typeof j.users==='object'?j:null}
const jh=x=>crypto.createHash('sha1').update(JSON.stringify(x===undefined?null:x)).digest('hex');
function ghSnap(){const o={};for(const k of Object.keys(db))if(k!=='users')o[k]=jh(db[k]);return o}
const uT=u=>u?(u.mt||u.seen||u.created||0):0;
function ghMerge(nd,init){if(!nd||!nd.users||typeof nd.users!=='object')return 0;let n=0;for(const [id,ru] of Object.entries(nd.users)){if(!ru||typeof ru!=='object')continue;const lu=db.users[id];if(!lu){db.users[id]=ru;n++}else if(uT(ru)>uT(lu)){for(const k of Object.keys(lu))delete lu[k];Object.assign(lu,ru);n++}}for(const k of Object.keys(nd)){if(k==='users')continue;const take=init?(db[k]===undefined||(db.gmt||0)<=(nd.gmt||0)):jh(db[k])===(ghBase[k]||jh(undefined));if(take&&jh(db[k])!==jh(nd[k])){db[k]=nd[k];n++}}if(n){dbFix();dirty=true;flush()}return n}
async function ghPush(force){if(!GH||!ghOk||ghBusy)return false;ghBusy=true;try{for(let i=0;i<4;i++){flush();const txt=JSON.stringify(db),h=crypto.createHash('sha1').update(txt).digest('hex'),base=ghSnap();if(!force&&h===ghHash)return true;if(!ghSha)await ghGetSha();const b={message:'db '+new Date().toISOString()+' users '+Object.keys(db.users).length+' [skip ci]',content:Buffer.from(txt).toString('base64'),branch:GH_BRANCH};if(ghSha)b.sha=ghSha;const r=await gh('PUT',ghUrl(),b);if(r.status===200||r.status===201){ghSha=r.json.content.sha;ghHash=h;ghBase=base;return true}if(r.status===409||r.status===422){if(!force){const nd=await ghLoad();const n=ghMerge(nd,false);if(n)console.log('github: подтянуты чужие изменения',n)}ghSha=null;continue}throw new Error('github save '+r.status+' '+((r.json&&r.json.message)||''))}return false}catch(e){console.error(e.message);return false}finally{ghBusy=false}}
async function ghPull(init){await ghBranch();const nd=await ghLoad();const n=nd?ghMerge(nd,init):0;ghOk=true;if(init)ghBase=ghSnap();await ghGetSha();if(nd)console.log('github: база загружена, игроков',Object.keys(db.users).length,'обновлено записей',n);return nd}
const sleep=ms=>new Promise(ok=>setTimeout(ok,ms));
async function ghInit(){if(!GH){console.log('github: синхронизация выключена (нет GITHUB_TOKEN/GITHUB_REPO)');return}for(let i=0;i<4&&!ghOk;i++){try{const nd=await ghPull(true);if(!nd)console.log('github: в репозитории ещё нет базы, создаю',GH_REPO+'@'+GH_BRANCH+':'+GH_PATH);await ghPush(!nd)}catch(e){console.error('github init',e.message);if(i<3)await sleep(2000*(i+1))}}if(!ghOk){console.error('github: базу загрузить не удалось — запись в GitHub заблокирована, чтобы не затереть сохранение. Повтор каждую минуту.');const t=setInterval(async()=>{try{await ghPull(true);clearInterval(t);await ghPush(false)}catch(e){console.error('github retry',e.message)}},60e3)}const late=()=>{if(ghOk)ghPull(false).then(()=>ghPush(false)).catch(e=>console.error('github pull',e.message))};setTimeout(late,45e3);setTimeout(late,150e3);setInterval(()=>ghPush(false),GH_MIN*60e3)}
for(const sig of ['SIGINT','SIGTERM'])process.on(sig,async()=>{flush();if(GH&&ghOk){const end=Date.now()+25e3;while(ghBusy&&Date.now()<end)await sleep(200);await Promise.race([ghPush(false),sleep(Math.max(1000,end-Date.now()))])}process.exit(0)});
const GIDS=['ham','pick','tongs','chis','rheat','rluck','rstorm','rstar','aearth','avolt','afury','asun','cfox','cglass','cgolem','cmerch'];
const VMAX=40,VCHEST=20,DTOK=[3,4,5,6,8,10,20];
const ERR=(m,c)=>Object.assign(new Error(m),{code:c});
const sDay=()=>Math.floor(Date.now()/864e5);
function vault(u){if(!u.v)u.v={tok:0,items:[],d:{last:-9,streak:0,shield:0}};return u.v}
function sRoll(minR){const w=[60,25,10,4,1].map((x,i)=>i<minR?0:x);let t=w.reduce((a,b)=>a+b)*Math.random(),r=0;for(;r<4;r++){t-=w[r];if(t<=0)break}return{id:crypto.randomBytes(6).toString('hex'),b:GIDS[crypto.randomInt(GIDS.length)],r,l:0}}
function vOut(u){const v=vault(u);return{tok:v.tok,items:v.items,d:v.d,today:sDay(),lots:(db.market||[]).filter(m=>m.u===u.id).length}}
function getUser(uid){if(!db.users[uid])db.users[uid]={id:uid,name:'Игрок',state:null,total:0,refs:0,pending:[],spent:0,created:Date.now()};return db.users[uid]}
const BK_SKIP=new Set(['state','force','bt','mt','name','id']);
const bkSig=(id,t,d)=>crypto.createHmac('sha256','cf-bk:'+(TOKEN||'dev')).update(id+'.'+t+'.'+d).digest('base64url');
function bkMake(u){const t=Date.now();u.bt=t;const o={};for(const k of Object.keys(u))if(!BK_SKIP.has(k))o[k]=u[k];const d=Buffer.from(JSON.stringify(o)).toString('base64');return{u:String(u.id),t,d,s:bkSig(String(u.id),t,d)}}
function bkUse(uid,bk){if(!bk||typeof bk!=='object'||typeof bk.d!=='string'||typeof bk.s!=='string'||bk.d.length>4e6)return false;const t=+bk.t;if(!Number.isFinite(t)||t>Date.now()+6e4)return false;const s=bkSig(uid,t,bk.d);if(s.length!==bk.s.length||!crypto.timingSafeEqual(Buffer.from(s),Buffer.from(bk.s)))return false;const cur=db.users[uid];if(cur&&(cur.bt||0)>=t)return false;let o;try{o=JSON.parse(Buffer.from(bk.d,'base64').toString('utf8'))}catch(e){return false}if(!o||typeof o!=='object'||Array.isArray(o))return false;const u=getUser(uid);for(const k of Object.keys(o))if(!BK_SKIP.has(k))u[k]=o[k];u.bt=t;mark();console.log('восстановлен из копии игрока',uid);return true}
function levelOf(t){let l=1;for(let i=0;i<LEVELS.length;i++)if(t>=LEVELS[i])l=i+1;return l}
function verify(initData){
if(!initData)return DEV?{user:{id:1,first_name:'Dev'},start_param:''}:null;
if(!TOKEN)return null;
const p=new URLSearchParams(initData);const hash=p.get('hash');if(!hash)return null;p.delete('hash');
const dcs=[...p.entries()].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([k,v])=>k+'='+v).join('\n');
const secret=crypto.createHmac('sha256','WebAppData').update(TOKEN).digest();
const h=crypto.createHmac('sha256',secret).update(dcs).digest('hex');
if(h.length!==hash.length||!crypto.timingSafeEqual(Buffer.from(h),Buffer.from(hash)))return null;
if(Date.now()/1000-(+p.get('auth_date')||0)>86400*7)return null;
let user=null;try{user=JSON.parse(p.get('user')||'null')}catch(e){}
if(!user||!user.id)return null;
return{user,start_param:p.get('start_param')||''}}
async function tg(method,body){if(!TOKEN)return{ok:false};try{const r=await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body||{})});return await r.json()}catch(e){console.error('tg',method,e.message);return{ok:false}}}
function playBtn(text,p){if(WEB_OK)return{text,web_app:{url:WEBAPP_URL+(p||'')}};if(CONFIG.bot&&CONFIG.app){const sp=p&&/admin\.html/.test(p)?'?startapp=crm':p&&/adm=1/.test(p)?'?startapp=adm':'';return{text,url:`https://t.me/${CONFIG.bot}/${CONFIG.app}${sp}`}}return null}
function kb(rows){const r=rows.map(x=>x.filter(Boolean)).filter(x=>x.length);return r.length?{inline_keyboard:r}:undefined}
async function botSay(chat_id,text,reply_markup){const r=await tg('sendMessage',reply_markup?{chat_id,text,reply_markup}:{chat_id,text});if(!r.ok&&reply_markup){console.error('sendMessage',r.description||'');return tg('sendMessage',{chat_id,text})}return r}
function send(res,code,obj){const b=JSON.stringify(obj);res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(b)}
function readBody(req){return new Promise((ok,bad)=>{let s='';req.on('data',c=>{s+=c;if(s.length>2e5){bad(new Error('big'));req.destroy()}});req.on('end',()=>{try{ok(s?JSON.parse(s):{})}catch(e){bad(e)}});req.on('error',bad)})}
function serveStatic(req,res){let u=decodeURIComponent(req.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.normalize(path.join(PUBLIC,u));if(!f.startsWith(PUBLIC)){res.writeHead(403);return res.end()}fs.readFile(f,(e,data)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':path.extname(f)==='.html'?'no-cache':'public, max-age=3600'});res.end(data)})}
function sanitize(st,old){if(!st||typeof st!=='object')return old;const s=JSON.stringify(st);if(s.length>30000)return old;const n=JSON.parse(s);n.coins=Math.max(0,+n.coins||0);n.total=Math.max(0,+n.total||0);return n}

if(!db.bal||typeof db.bal!=='object')db.bal={};if(!db.ac)db.ac={n:0,log:[]};
const BAL_DEF={cost:1,pps:1,tap:1,off:1};
const BAL=()=>Object.assign({},BAL_DEF,db.bal);
const SV_TU={tap:[50,1.55,1e5],energy:[120,1.5,1e5],regen:[300,1.8,15],crit:[2500,2.2,20]};
const SV_MI=[[100,1],[1100,8],[12000,47],[130000,260],[1.4e6,1400],[2e7,7800],[3.3e8,44000]];
const SV_MILES=[10,25,50,100,200];

const SV_WIN=16*3600,SV_SLACK=4,SV_FLAT=5000,SV_TAPS=15;
const TASK_R={ref1:1e4,ref5:75e3,lvl3:2e4,ups10:15e3,taps1k:1e4,lvl5:25e4},ACH_R=5e7,DAILY_MAX=50000;
const svN=(v,max)=>{v=Math.floor(+v||0);return v<0?0:v>max?max:v};
function svGeo(b,m,from,to){return to<=from?0:b*Math.pow(m,from)*(Math.pow(m,to-from)-1)/(m-1)}
function svUps(up){up=up&&typeof up==='object'?up:{};const o={};for(const k in SV_TU)o[k]=svN(up[k],SV_TU[k][2]);for(let i=1;i<=7;i++)o['m'+i]=svN(up['m'+i],1e5);return o}
function svCost(a,b){const B=BAL();let c=0;for(const k in SV_TU)c+=svGeo(SV_TU[k][0]*B.cost,SV_TU[k][1],a[k],b[k]);SV_MI.forEach((m,i)=>{c+=svGeo(m[0]*B.cost,1.15,a['m'+(i+1)],b['m'+(i+1)])});return c}
function svRate(st,up){const B=BAL(),sh=1+.05*svN(st&&st.shards,1e4);let pps=0;SV_MI.forEach((m,i)=>{const l=up['m'+(i+1)];pps+=m[1]*l*SV_MILES.reduce((a,x)=>l>=x?a*2:a,1)});return{pps:pps*sh*B.pps,tap:(1+up.tap)*sh*B.tap,en:500+250*up.energy,rg:1+up.regen}}
function svMax(a,b){return{pps:Math.max(a.pps,b.pps),tap:Math.max(a.tap,b.tap),en:Math.max(a.en,b.en),rg:Math.max(a.rg,b.rg)}}
function svAllow(r,el){const B=BAL();const taps=Math.min(SV_TAPS*el,r.en*4+(2*r.rg+5)*el);const tapG=taps*r.tap*2*4*3;const ppsG=r.pps*el*3*Math.max(1,B.off);return(tapG+ppsG)*SV_SLACK+SV_FLAT}
function svCredit(o,n,pps,ak){ak=Math.max(1,ak||1)*1.25;let c=0;const ot=o.tasks||{},nt=n.tasks&&typeof n.tasks==='object'?n.tasks:{};for(const k in TASK_R)if(nt[k]&&!ot[k])c+=TASK_R[k]*ak;const oa=o.ach||{},na=n.ach&&typeof n.ach==='object'?n.ach:{};let na_=0;for(const k in na)if(na[k]&&!oa[k])na_++;c+=Math.min(na_,10)*ACH_R*.2*ak;if((n.lastDaily||0)!==(o.lastDaily||0)||JSON.stringify(n.dd||null)!==JSON.stringify(o.dd||null))c+=(DAILY_MAX*10*2*3+(pps||0)*3600*2*10)*ak;return c}

function svCheck(u,old,n){const t=Date.now();
  if(u.svT==null&&old){u.svT=t;u.cr=0;return{state:n,fix:false}}
  const o=old||{coins:0,total:0,ups:{},shards:0,tasks:{},ach:{}};const el=Math.min(SV_WIN,Math.max(1,(t-(u.svT||u.created||t))/1000));
  const ou=svUps(o.ups),nu=svUps(n.ups),credit=(u.cr||0)+svCredit(o,n,svRate(o,ou).pps,acK(u));let why=[];
  const r0=svRate(o,ou),allow0=svAllow(r0,el)+credit;const upCost=svCost(ou,nu)*.95;
  let upOK=upCost<=(+o.coins||0)+allow0+100;if(!upOK){why.push('ups');n.ups=Object.assign({},n.ups&&typeof n.ups==='object'?n.ups:{},o.ups||{});for(const k in n.ups)if(!(o.ups||{})[k])delete n.ups[k]}
  const r=upOK?svMax(r0,svRate(n,nu)):r0,allow=svAllow(r,el)+credit;
  const gain=n.total-(+o.total||0);let acc=gain;if(gain>allow){acc=allow;n.total=(+o.total||0)+allow;why.push('gain')}
  const maxCoins=Math.max(0,(+o.coins||0)+Math.max(0,acc)-(upOK?upCost:0))+100;if(n.coins>maxCoins&&n.coins>(+o.coins||0)){n.coins=Math.floor(maxCoins);if(!why.includes('gain'))why.push('coins')}
  if(n.coins>n.total)n.coins=n.total;
  const os=svN(o.shards,1e4),ns=svN(n.shards,1e4),run=Math.max(0,(+n.total||0)-(+o.runStart||0));if(ns>os+Math.floor(Math.sqrt(run/1e6))+1){n.shards=os;why.push('shards')}
  u.svT=t;u.cr=0;
  if(why.length){db.ac.n++;u.ac=(u.ac||0)+1;db.ac.log.unshift({u:u.id,n:u.name,t,why:why.join(','),gain:Math.round(gain),allow:Math.round(allow)});db.ac.log.length=Math.min(db.ac.log.length,50)}
  return{state:n,fix:why.length?why.join(','):false}}
function acceptState(u,st){if(u.force)return false;const old=u.state,n=sanitize(st,old);if(!n||n===old)return false;const r=isAdmin(u.id)?{state:n,fix:false}:svCheck(u,old,n);u.state=r.state;u.total=u.state.total||0;u.seen=Date.now();return r.fix}
const REF_WELCOME=100000;
function refReward(u){const L=levelOf(u.total||0),st=u.state||{},r=svRate(st,svUps(st.ups));return Math.round(Math.max(25000*L*L,r.pps*1800)*acK(u))}
function popGrants(u){const g=u.pending.splice(0);if(!g.length)return g;const st=u.state||{},r=svRate(st,svUps(st.ups)),k=shopK(u);let c=0;for(const x of g){if(x.type==='coins')c+=+x.amount||0;else if(x.type==='item'){x.k=k;c+=2*k*Math.max(25e4,r.pps*14400)}}u.cr=(u.cr||0)+c;return g}

function an(u){if(!u.an)u.an={lv:{},tut:-1,skip:0,tabs:{},ss:0,dn:0,dl:-1,lt:''};return u.an}
const TUT_N=['25 ударов','Мощный удар','Дрон-сборщик','Ежедневка','Метеорит','Горнило','Гильдия','Готово'];
function balReport(){const t=Date.now(),D=864e5,all=Object.values(db.users).filter(u=>u.state);const med=a=>{a=a.filter(x=>x!=null&&isFinite(x));if(!a.length)return null;a.sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
  const active=u=>(u.seen||u.created||0)>t-3*D,gone=u=>!active(u)&&(u.created||0)<t-3*D,play=u=>+(u.state.st&&u.state.st.play)||0;
  const life=d=>{const c=all.filter(u=>(u.created||0)<t-d*D);return{base:c.length,pct:c.length?Math.round(100*c.filter(u=>(u.seen||0)-(u.created||0)>=d*D-4*3600e3).length/c.length):null}};
  const tutU=all.filter(u=>u.state.tutV);const tut=TUT_N.map((n,i)=>({step:i,name:n,reached:tutU.filter(u=>(+u.state.tut||0)>=i).length,gone:tutU.filter(u=>gone(u)&&!u.state.tutSkip&&(+u.state.tut||0)===i).length}));
  const levels=[];for(let L=1;L<=10;L++){const reached=all.filter(u=>levelOf(u.total)>=L),at=all.filter(u=>levelOf(u.total)===L),g=at.filter(gone);const toL=L===1?0:med(reached.map(u=>an(u).lv[L]));const step=med(all.map(u=>{const A=an(u);return A.lv[L+1]!=null&&(L===1||A.lv[L]!=null)?A.lv[L+1]-(L===1?0:A.lv[L]):null}));const stay=med(at.filter(active).map(u=>play(u)-(L===1?0:(an(u).lv[L]||0))));levels.push({L,reached:reached.length,now:at.length,gone:g.length,churn:reached.length?Math.round(100*g.length/reached.length):0,toMin:toL==null?null:Math.round(toL/60),nextMin:step==null?null:Math.round(step/60),stayMin:stay==null?null:Math.round(stay/60)})}
  const stuck=all.filter(u=>{if(!active(u))return false;const L=levelOf(u.total),lv=levels[L-1],st=play(u)-(L===1?0:(an(u).lv[L]||0));return lv&&lv.nextMin!=null?st>3*lv.nextMin*60&&st>1800:st>7200}).length;
  const wall=levels.filter(x=>x.nextMin!=null&&x.L<10).sort((a,b)=>b.nextMin-a.nextMin)[0]||null,exit=levels.filter(x=>x.reached>=5).sort((a,b)=>b.churn-a.churn)[0]||null;
  const lastTab={};all.filter(gone).forEach(u=>{const k=an(u).lt||'—';lastTab[k]=(lastTab[k]||0)+1});
  const sys={arena:all.filter(u=>u.p&&u.p.w+u.p.l>0).length,boss:all.filter(u=>an(u).boss).length,exp:all.filter(u=>an(u).exp).length,tower:all.filter(u=>u.tw&&u.tw.best>0).length,towerTop:Math.max(0,...all.map(u=>u.tw?u.tw.best:0)),craft:all.filter(u=>an(u).tabs.craft).length,shop:all.filter(u=>an(u).tabs.shop).length,payers:all.filter(u=>u.spent>0).length};
  return{at:new Date(t).toISOString(),players:all.length,active3d:all.filter(active).length,new7d:all.filter(u=>(u.created||0)>t-7*D).length,life:{d1:life(1),d3:life(3),d7:life(7)},tutorial:{players:tutU.length,skipped:tutU.filter(u=>u.state.tutSkip).length,steps:tut},levels,wall,exit,stuckNow:stuck,lastTabBeforeLeaving:lastTab,systems:sys,bal:BAL(),cheat:{flags:db.ac.n,players:all.filter(u=>u.ac).length,recent:db.ac.log.slice(0,10)},season:db.season?{n:db.season.n,end:new Date(db.season.end).toISOString()}:null,boss:db.boss?{name:db.boss.name,lvl:db.boss.lvl,hp:db.boss.hp,max:db.boss.max,players:Object.keys(db.boss.dmg).length}:null}}
function balText(R){const pc=x=>x.pct==null?'—':x.pct+'%';const m=v=>v==null?'—':v+'м';let s=`БАЛАНС · игроков ${R.players}, активны 3д ${R.active3d}, новых 7д ${R.new7d}\nДоживают: день1 ${pc(R.life.d1)} · день3 ${pc(R.life.d3)} · день7 ${pc(R.life.d7)}\n\nОБУЧЕНИЕ (${R.tutorial.players}, пропустили ${R.tutorial.skipped})\n`;
  R.tutorial.steps.forEach(x=>{s+=`${x.step}. ${x.name}: ${x.reached}${x.gone?` · ушли здесь ${x.gone}`:''}\n`});
  s+='\nУРОВНИ: дошли / сейчас / ушли(%) · мин до ур. · мин до след. · сидят\n';R.levels.filter(x=>x.reached).forEach(x=>{s+=`LV${x.L}: ${x.reached} / ${x.now} / ${x.gone}(${x.churn}%) · ${m(x.toMin)} · ${m(x.nextMin)} · ${m(x.stayMin)}\n`});
  s+=`\nСтена (дольше всего до след. уровня): ${R.wall?`LV${R.wall.L} → ${R.wall.nextMin} мин игры`:'мало данных'}\nГлавный выход: ${R.exit?`LV${R.exit.L} — ушли ${R.exit.churn}%`:'мало данных'}\nЗастряли сейчас: ${R.stuckNow}\nПоследняя вкладка ушедших: ${Object.entries(R.lastTabBeforeLeaving).sort((a,b)=>b[1]-a[1]).slice(0,4).map(e=>e[0]+' '+e[1]).join(', ')||'—'}\nСистемы: арена ${R.systems.arena}, босс ${R.systems.boss}, экспедиции ${R.systems.exp}, башня ${R.systems.tower} (рекорд ${R.systems.towerTop}), горнило ${R.systems.craft}, лавка ${R.systems.shop}, платят ${R.systems.payers}\nКоэффициенты: цена x${R.bal.cost}, добыча x${R.bal.pps}, удар x${R.bal.tap}, офлайн x${R.bal.off}\nАнтичит: срабатываний ${R.cheat.flags}, игроков ${R.cheat.players}`;return s}

const SEASON_MS=14*864e5,SEASON_TOK=[2,4,7,12,20],SEASON_TOP=[15,10,5];
const BOSS_MS=7*864e5,BOSS_TRIES=3,BOSS_HITS=15,BOSS_HP=12000,BOSS_GROW=1.3;
const BOSS_N=['Пепельный дракон','Рудный колосс','Хрустальный змей','Повелитель шлака','Матка тёмной жилы','Обсидиановый страж'];
const NQ=[];let nqOn=false;
function ntfQueue(list){if(!TOKEN||!list.length)return;NQ.push(...list);if(nqOn)return;nqOn=true;const step=async()=>{const m=NQ.shift();if(!m){nqOn=false;return}if(!m.reply_markup){const k=kb([[playBtn('Играть')]]);if(k)m.reply_markup=k}await tg('sendMessage',m);setTimeout(step,60)};step()}
function seasonCur(){const t=Date.now();if(!db.season){db.season={n:1,start:t,end:t+SEASON_MS,hall:[]};mark()}return db.season}
function seasonTick(){const s=seasonCur(),t=Date.now();if(t<s.end)return;
  const parts=Object.values(db.users).filter(u=>u.p&&((u.p.sw||0)+(u.p.sl||0))>0).sort((a,b)=>b.p.r-a.p.r||b.p.w-a.p.w);
  parts.forEach((u,i)=>{const p=u.p,lg=league(p.r),L=levelOf(u.total||0),tok=Math.round((SEASON_TOK[lg]+(SEASON_TOP[i]||0))*tkK(u)),coins=Math.round(4000*(lg+1)*L*L*acK(u));vault(u).tok+=tok;u.pending.push({type:'coins',amount:coins,reason:'season',sn:s.n,lg,r:p.r,place:i+1,tok});p.hist=[{n:s.n,r:p.r,lg,pl:i+1,w:p.sw||0,l:p.sl||0}].concat(p.hist||[]).slice(0,8)});
  for(const u of Object.values(db.users)){if(!u.p)continue;const p=u.p;p.r=Math.round(PVP_START+(p.r-PVP_START)/2);p.sw=0;p.sl=0;p.sb=p.r}
  const hall=[{n:s.n,top:parts.slice(0,3).map(u=>({name:u.name,r:u.p.hist[0].r}))}].concat(s.hall||[]).slice(0,10);
  let ne=s.end+SEASON_MS;while(ne<=t)ne+=SEASON_MS;db.season={n:s.n+1,start:s.end,end:ne,hall};mark();
  ntfQueue(parts.map(u=>{const h=u.p.hist[0];return{chat_id:u.id,text:`Сезон арены ${s.n} завершён: ${LEAGUES[h.lg].n}, ${h.r}, место ${h.pl}. Награда ждёт в игре. Рейтинг мягко сброшен — начинается сезон ${s.n+1}.`}}))}
function sOut(p){const s=seasonCur();return{n:s.n,end:s.end,left:Math.max(0,s.end-Date.now()),sw:p.sw||0,sl:p.sl||0,last:(p.hist||[])[0]||null,hall:(s.hall||[])[0]||null}}
function bossActive(){const t=Date.now()-7*864e5;return Math.max(3,Object.values(db.users).filter(u=>u.state&&(u.seen||0)>t).length)}
function bossNew(lvl){const t=Date.now(),n=db.boss?db.boss.n+1:1,max=Math.round(BOSS_HP*bossActive()*Math.pow(BOSS_GROW,lvl-1));db.boss={n,lvl,name:BOSS_N[(n-1)%BOSS_N.length],hp:max,max,start:t,end:t+BOSS_MS,dmg:{},hits:0,feed:[]};mark();return db.boss}
function bossCur(){return db.boss||bossNew(1)}
function bossEnd(win,killer){const b=db.boss,ent=Object.entries(b.dmg).sort((x,y)=>y[1]-x[1]),sum=ent.reduce((a,e)=>a+e[1],0)||1;
  ent.forEach(([id,d],i)=>{const u=db.users[id];if(!u)return;const L=levelOf(u.total||0),sh=d/sum;const tok=Math.round((win?2+b.lvl+([6,4,2][i]||0)+(id===killer?2:0):1+(i<3?1:0))*tkK(u));const coins=Math.round((win?3000:1200)*L*L*(1+b.lvl*.25)*(1+Math.min(1,sh*5))*acK(u));vault(u).tok+=tok;let item=0;if(win&&i===0){const v=vault(u);if(v.items.length<VMAX){v.items.push(sRoll(2));item=1}}u.pending.push({type:'coins',amount:coins,reason:'boss',win:!!win,name:b.name,lvl:b.lvl,place:i+1,dmg:d,tok,item})});
  db.bossHall=[{n:b.n,name:b.name,lvl:b.lvl,win:!!win,players:ent.length,t:Date.now(),top:ent.slice(0,3).map(([id,d])=>({name:db.users[id]?db.users[id].name:'—',d}))}].concat(db.bossHall||[]).slice(0,10);
  if(win)ntfQueue(ent.slice(0,200).map(([id])=>({chat_id:id,text:`Гильдия одолела босса «${b.name}» (ур. ${b.lvl})! Награда ждёт в игре.`})));
  bossNew(win?b.lvl+1:Math.max(1,b.lvl-1));mark()}
function bossTick(){const b=bossCur();if(Date.now()>=b.end)bossEnd(false)}
function bossDay(u){const d=sDay();if(!u.bs||u.bs.d!==d)u.bs={d,n:0};return u.bs}
function bOut(u){const b=bossCur(),uid=u.id,ent=Object.entries(b.dmg).sort((x,y)=>y[1]-x[1]),idx=ent.findIndex(e=>e[0]===uid),bs=bossDay(u),f=fighter(u,'atk');return{n:b.n,name:b.name,lvl:b.lvl,hp:b.hp,max:b.max,left:Math.max(0,b.end-Date.now()),tries:Math.max(0,BOSS_TRIES-bs.n),tmax:BOSS_TRIES,my:b.dmg[uid]||0,rank:idx>=0?idx+1:0,players:ent.length,top:ent.slice(0,5).map(([id,d],i)=>({rank:i+1,name:db.users[id]?db.users[id].name:'—',d,me:id===uid})),feed:b.feed.slice(0,5),last:(db.bossHall||[])[0]||null,atk:f.atk,est:Math.round(f.atk*BOSS_HITS*(1+f.crit*.8))}}
const PVP_MAX_TK=5,PVP_TK_MS=2*3600e3,PVP_K=32,PVP_START=1000,PVP_LOG=20,PVP_CD=3600e3,PVP_WIN_TOK=5,PVP_DEF_PAY=10,PVP_RE_MS=10*60e3,PVP_OPP_MS=30*60e3,PVP_NTF_MS=30*60e3;
const LEAGUES=[{n:'Бронза',at:0,c:1},{n:'Серебро',at:1100,c:2},{n:'Золото',at:1300,c:3},{n:'Платина',at:1500,c:5},{n:'Обсидиан',at:1800,c:8}];
const STANCES={bal:{a:1,h:1,s:0},atk:{a:1.15,h:.9,s:6},def:{a:.9,h:1.15,s:-6}};
const GSLOTS={ham:'tool',pick:'tool',tongs:'tool',chis:'tool',rheat:'ring',rluck:'ring',rstorm:'ring',rstar:'ring',aearth:'amul',avolt:'amul',afury:'amul',asun:'amul',cfox:'charm',cglass:'charm',cgolem:'charm',cmerch:'charm'};
const GPVP={tool:'a',ring:'c',amul:'h',charm:'s'};
const BOTN=['Тень кузнеца','Железный голем','Странник руды','Пепельный мастер','Медный страж','Гранильщик пустоши','Хранитель жилы','Угольный рыцарь'];
const pNum=(v,a,b)=>Math.max(a,Math.min(b,Math.floor(+v||0)));
function league(r){let i=0;for(let j=0;j<LEAGUES.length;j++)if(r>=LEAGUES[j].at)i=j;return i}
function pvp(u){if(!u.p)u.p={r:PVP_START,best:PVP_START,w:0,l:0,tk:PVP_MAX_TK,tkT:Date.now(),log:[],seen:0,opp:[],oppT:0,hit:{},st:'bal',day:-1,da:0,wn:0,dwn:0,lc:-1,nt:0};const p=u.p;if(p.sw==null){p.sw=0;p.sl=0;p.sb=p.r;p.hist=[]}return p}
function pvpTick(p){const t=Date.now();if(p.tk>=PVP_MAX_TK){p.tkT=t;return}const n=Math.floor((t-p.tkT)/PVP_TK_MS);if(n>0){p.tk=Math.min(PVP_MAX_TK,p.tk+n);p.tkT=p.tk>=PVP_MAX_TK?t:p.tkT+n*PVP_TK_MS}}
function pvpDay(p){const d=sDay();if(p.day!==d){p.day=d;p.da=0;p.wn=0;p.dwn=0}}
const pvUnseen=u=>u.p?u.p.log.filter(x=>x.k==='d'&&x.t>u.p.seen).length:0;
function pPower(f){return Math.round(Math.sqrt(f.atk*(1+.8*f.crit)*f.hp/(1-f.dodge))*f.spd/10)}
function fighter(u,stance){const s=u.state||{},up=s.ups||{},L=levelOf(u.total||0);const tap=pNum(up.tap,0,3000),en=pNum(up.energy,0,3000),rg=pNum(up.regen,0,15),cr=pNum(up.crit,0,20),sh=pNum(s.shards,0,1000);let mi=0;for(let i=1;i<=7;i++)mi+=pNum(up['m'+i],0,1e4);
const g={a:0,c:0,h:0,s:0},v=vault(u),inv=Array.isArray(s.inv)?s.inv:[],eq=s.eq&&typeof s.eq==='object'?s.eq:{},used=new Set();
for(const slot of ['tool','ring','amul','charm']){const x=inv.find(q=>q&&q.u===eq[slot]);if(!x||GSLOTS[x.b]!==slot)continue;let r=pNum(x.r,0,4),l=pNum(x.l,0,12);if(x.sid){const it=v.items.find(q=>q.id===x.sid);if(!it||used.has(it.id))continue;used.add(it.id);r=it.r;l=it.l}l=Math.min(l,4+r*2);g[GPVP[slot]]+=(1+r)*(1+.15*l)}
const st=STANCES[stance]?stance:'bal',k=STANCES[st],sm=1+.01*Math.min(sh,200);
const f={name:u.name||'Игрок',lvl:L,st,atk:Math.round((20+6*Math.sqrt(tap)+4*L+1.5*Math.sqrt(mi))*sm*(1+.06*g.a)*k.a),hp:Math.round((300+40*Math.sqrt(en)+25*L+10*rg)*sm*(1+.06*g.h)*k.h),crit:Math.min(.4,.05+.01*cr+.01*g.c),dodge:Math.min(.25,.03+.006*g.c+.004*g.s),spd:Math.round(100+2*rg+3*g.s+k.s)};f.pw=pPower(f);return f}
const fOut=f=>({name:f.name,lvl:f.lvl,st:f.st,atk:f.atk,hp:f.hp,crit:+f.crit.toFixed(3),dodge:+f.dodge.toFixed(3),spd:f.spd,pw:f.pw});
function pRng(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function battle(A,B,seed){const R=pRng(seed),F=[A,B],hp=[A.hp,B.hp],nx=[1000/A.spd,1000/B.spd],ev=[];
for(let i=0;i<40&&hp[0]>0&&hp[1]>0;i++){const s=nx[0]<=nx[1]?0:1,o=1-s;nx[s]+=1000/F[s].spd;if(R()<F[o].dodge){ev.push({s,m:1,h:[hp[0],hp[1]]});continue}const c=R()<F[s].crit,d=Math.max(1,Math.round(F[s].atk*(.85+.3*R())*(c?1.8:1)));hp[o]=Math.max(0,hp[o]-d);ev.push({s,d,c:c?1:0,h:[hp[0],hp[1]]})}
const win=hp[1]<=0?true:hp[0]<=0?false:hp[0]/A.hp>hp[1]/B.hp;return{win,ev}}
function pvpBot(me,r,m){const j=()=>.92+Math.random()*.16,sts=Object.keys(STANCES);const f={name:BOTN[crypto.randomInt(BOTN.length)],lvl:me.lvl,st:sts[crypto.randomInt(sts.length)],atk:Math.max(10,Math.round(me.atk*m*j())),hp:Math.max(150,Math.round(me.hp*m*j())),crit:me.crit,dodge:me.dodge,spd:Math.round(me.spd*(.95+Math.random()*.1))};f.pw=pPower(f);return{id:'bot_'+crypto.randomBytes(5).toString('hex'),bot:1,r:Math.max(0,Math.round(r+(m-1)*300+crypto.randomInt(-40,41))),f}}
function pvpPick(u){const p=pvp(u),t=Date.now(),me=fighter(u,p.st);for(const k in p.hit)if(t-p.hit[k]>PVP_CD)delete p.hit[k];
const near=Object.values(db.users).filter(x=>x.id!==u.id&&x.state&&x.total>0&&!p.hit[x.id]).sort((a,b)=>Math.abs((a.p?a.p.r:PVP_START)-p.r)-Math.abs((b.p?b.p.r:PVP_START)-p.r)).slice(0,40);
const pool=near.map(x=>{const f=fighter(x,x.p?x.p.st:'bal');return{id:x.id,s:Math.abs((x.p?x.p.r:PVP_START)-p.r)+Math.abs(f.pw-me.pw)/Math.max(me.pw,1)*300}}).filter(x=>x.s<450).sort((a,b)=>a.s-b.s).slice(0,10);
const out=[];while(out.length<3&&pool.length)out.push({id:pool.splice(crypto.randomInt(pool.length),1)[0].id});const mul=[.85,1,1.15];for(let i=0;out.length<3;i++)out.push(pvpBot(me,p.r,mul[i%3]));p.opp=out;p.oppT=t}
function oOut(o){if(o.bot)return{id:o.id,bot:1,name:o.f.name,lvl:o.f.lvl,r:o.r,lg:league(o.r),pw:o.f.pw,st:o.f.st};const t=db.users[o.id];if(!t)return null;const tp=pvp(t),f=fighter(t,tp.st);return{id:o.id,name:t.name,lvl:f.lvl,r:tp.r,lg:league(tp.r),pw:f.pw,st:tp.st}}
function pOut(u){const p=pvp(u);pvpTick(p);pvpDay(p);const t=Date.now(),day=sDay();return{r:p.r,best:p.best,lg:league(p.r),w:p.w,l:p.l,tk:p.tk,max:PVP_MAX_TK,next:p.tk>=PVP_MAX_TK?0:Math.max(0,PVP_TK_MS-(t-p.tkT)),st:p.st,me:fOut(fighter(u,p.st)),opp:p.opp.map(oOut).filter(Boolean),log:p.log.slice(0,PVP_LOG),unseen:pvUnseen(u),da:p.da,wn:p.wn,wmax:PVP_WIN_TOK,chestReady:p.lc!==day,chest:p.lc!==day&&p.da>=3,reroll:t-p.oppT>=PVP_RE_MS,season:sOut(p)}}
function pvpRes(u){return{pvp:pOut(u),vault:vOut(u)}}
const EXP={h1:{h:1,n:'Разведка штолен',c:1,tok:1,it:0,r:0,lv:1,pw:0,mi:0},h3:{h:3,n:'Глубинная жила',c:2.6,tok:3,it:.15,r:0,lv:2,pw:1300,mi:10},h6:{h:6,n:'Сердце горы',c:4.8,tok:7,it:.4,r:1,lv:4,pw:2500,mi:40},h12:{h:12,n:'Лавовые чертоги',c:9,tok:14,it:.6,r:2,lv:6,pw:4500,mi:150},h24:{h:24,n:'Корни мира',c:18,tok:30,it:.85,r:3,lv:8,pw:8000,mi:500}};
const EXP_BASE=900;
function expAcc(u){const up=svUps((u.state||{}).ups);let mi=0;for(let i=1;i<=7;i++)mi+=up['m'+i];return{lv:levelOf(u.total||0),pw:fighter(u,'bal').pw,mi}}
function expMul(me,x){return Math.min(3,Math.max(1,me.pw/Math.max(EXP_BASE,x.pw)))}
function expRw(L,k,pm,ak){ak=ak||1;const x=EXP[k],b=1+(pm-1)*.6;return{coins:Math.round(1500*L*L*x.c*b*ak),tok:Math.round(x.tok*b*(1+(ak-1)*.5)),it:x.it?Math.min(.95,x.it+(pm-1)*.1):0}}
function acK(u){const me=expAcc(u),p=u.p||{},tw=u.tw||{},ex=u.ex||{},A=u.an||{},ach=Object.values((u.state||{}).ach||{}).filter(Boolean).length;return Math.round((1+(me.lv-1)*.2+Math.min(1,me.mi/500)*.5+Math.min(1,Math.max(0,me.pw-EXP_BASE)/9000)*.5+Math.min(1,Math.max(0,(p.best||1000)-1000)/1500)*.6+Math.min(.6,(p.w||0)/500)+Math.min(1,(tw.best||0)/150)*.6+Math.min(.5,(ex.n||0)/200)+Math.min(.4,(A.boss||0)/500)+Math.min(1,ach/26)*.8)*100)/100}
function tkK(u){return 1+(acK(u)-1)*.5}
function shopK(u){const me=expAcc(u);return Math.round((1+(me.lv-1)*.25+Math.min(1,me.mi/500)+Math.min(1,Math.max(0,me.pw-EXP_BASE)/9000))*100)/100}
function expMiss(me,x){const m=[];if(me.lv<x.lv)m.push(`уровень ${x.lv}`);if(me.pw<x.pw)m.push(`сила ${x.pw}`);if(me.mi<x.mi)m.push(`шахтёры ${x.mi}`);return m}
function expSt(u){if(!u.ex)u.ex={a:null,n:0,h:{}};return u.ex}
function expOut(u){const e=expSt(u),t=Date.now(),me=expAcc(u);return{a:e.a&&EXP[e.a.k]?{k:e.a.k,n:EXP[e.a.k].n,h:EXP[e.a.k].h,left:Math.max(0,e.a.end-t),dur:e.a.end-e.a.start}:null,n:e.n,me,list:Object.keys(EXP).map(k=>{const x=EXP[k],pm=expMul(me,x),rw=expRw(Math.max(1,me.lv),k,pm,acK(u)),miss=expMiss(me,x);return{k,n:x.n,h:x.h,coins:rw.coins,tok:rw.tok,it:rw.it,lv:x.lv,pw:x.pw,mi:x.mi,ok:!miss.length,miss,bonus:Math.round((pm-1)*60)}})}}
function expTick(){const t=Date.now(),out=[];for(const u of Object.values(db.users)){const a=u.ex&&u.ex.a;if(a&&!a.nt&&t>=a.end&&EXP[a.k]){a.nt=1;out.push({chat_id:u.id,text:`Отряд вернулся из экспедиции «${EXP[a.k].n}» с добычей. Забери награду в гильдии и отправь его снова.`})}}if(out.length){mark();ntfQueue(out)}}
const TW_TRIES=5,TW_BOSS=5,TW_TITAN=25,TW_GROW=1.06;
const TW_N=['Шлаковый голем','Искровой бес','Рудный паук','Каменный страж','Пепельная гончая','Кварцевый рыцарь','Жаровой дух','Тень жилы'];
const TW_B=['Хранитель горна','Кварцевый тиран','Огненный элементаль','Король шлака','Королева осколков','Сталеглав','Мать лавы'];
const TW_T=['Титан бездны','Древний горн','Пожиратель кристаллов','Отец всех жил','Сердце вулкана'];
const twKind=f=>f%TW_TITAN===0?2:f%TW_BOSS===0?1:0;
function twSt(u){const d=sDay();if(!u.tw)u.tw={f:1,best:0,d,n:0,w:0,bt:0};if(u.tw.d!==d){u.tw.d=d;u.tw.n=0}return u.tw}
function twFoe(f){const k=twKind(f),g=Math.pow(TW_GROW,f-1),R=pRng(f*7919+13),m=[[1,1],[1.25,1.8],[1.45,3]][k],list=[TW_N,TW_B,TW_T][k],i=k===2?f/TW_TITAN-1:k===1?f/TW_BOSS-1:f-1,c=Math.floor(i/list.length);
const x={name:list[i%list.length]+(c?' '+['','II','III','IV','V'][Math.min(c,4)]+(c>4?'+':''):''),lvl:f,st:'bal',atk:Math.max(8,Math.round(16*g*m[0]*(.95+.1*R()))),hp:Math.max(120,Math.round(260*g*m[1]*(.95+.1*R()))),crit:Math.min(.35,.04+.002*f+(k?.05:0)),dodge:Math.min(.22,.02+.0015*f),spd:Math.round(Math.min(170,92+.6*f+(k===2?10:0)))};x.pw=pPower(x);return x}
function twRw(L,f,ak){ak=ak||1;const k=twKind(f);return{coins:Math.round(250*L*L*(1+.04*f)*[1,4,10][k]*ak),tok:Math.round((k===2?6+2*Math.floor(f/TW_TITAN):k===1?2+Math.floor(f/TW_TITAN):f%3===0?1:0)*(1+(ak-1)*.5)),item:k===2?1:k===1?.3:0}}
function twOut(u){const w=twSt(u),L=levelOf(u.total||0);return{f:w.f,best:w.best,k:twKind(w.f),nb:Math.ceil(w.f/TW_BOSS)*TW_BOSS,n:Math.max(0,TW_TRIES-w.n),max:TW_TRIES,w:w.w,foe:fOut(twFoe(w.f)),me:fOut(fighter(u,'bal')),rw:twRw(L,w.f,acK(u))}}
const routes={
async '/api/load'(a,body){const uid=String(a.user.id);const had=!!db.users[uid];const rest=bkUse(uid,body&&body.bk);const isNew=!had&&!rest;const u=getUser(uid);u.name=[a.user.first_name,a.user.last_name].filter(Boolean).join(' ')||a.user.username||'Игрок';if(isNew){const m=(a.start_param||'').match(/^ref_(\d+)$/);const ref=m?m[1]:db.pendingRefs[uid];delete db.pendingRefs[uid];if(ref&&ref!==uid&&db.users[ref]){const r=db.users[ref];r.refs=(r.refs||0)+1;r.pending.push({type:'coins',amount:refReward(r),reason:'ref'});u.referrer=ref;u.pending.push({type:'coins',amount:REF_WELCOME,reason:'welcome'})}}{const A=an(u);A.ss++;const d=sDay();if(A.dl!==d){A.dl=d;A.dn++}}const grants=popGrants(u);const force=!!u.force;u.force=0;mark();return{force,admin:isAdmin(uid),owner:isOwner(uid),free:isFree(uid),shopK:shopK(u),acK:acK(u),state:u.state,refCount:u.refs||0,grants,config:Object.assign({},CONFIG,{bal:BAL()}),uid,vault:vOut(u),pv:pvUnseen(u)}},
async '/api/save'(a,body){const u=getUser(String(a.user.id));if(u.force){u.force=0;u.seen=Date.now();mark();return{ok:true,fix:u.state,why:'admin'}}const fix=acceptState(u,body.state);u.seen=Date.now();mark();return fix?{ok:true,fix:u.state,why:fix}:{ok:true}},
async '/api/claim'(a){const u=getUser(String(a.user.id));const force=u.force?u.state:null;if(force){u.force=0;mark()}const grants=popGrants(u);if(grants.length)mark();return{force,admin:isAdmin(u.id),free:isFree(u.id),shopK:shopK(u),acK:acK(u),grants,refCount:u.refs||0,pv:pvUnseen(u)}},
async '/api/top'(a){const uid=String(a.user.id);const all=Object.values(db.users).filter(u=>u.total>0).sort((x,y)=>y.total-x.total);const top=all.slice(0,50).map((u,i)=>({rank:i+1,name:u.name,total:Math.floor(u.total),level:levelOf(u.total),me:u.id===uid}));const idx=all.findIndex(u=>u.id===uid);const me=idx>=0?{rank:idx+1,name:all[idx].name,total:Math.floor(all[idx].total),level:levelOf(all[idx].total)}:null;return{top,me}},
async '/api/vault'(a){return vOut(getUser(String(a.user.id)))},
async '/api/daily'(a){const u=getUser(String(a.user.id));const v=vault(u),d=v.d,day=sDay();if(d.last===day)throw ERR('done',409);let shieldUsed=false;if(d.last===day-1)d.streak++;else if(d.last===day-2&&d.shield>0){d.shield--;d.streak++;shieldUsed=true}else d.streak=1;d.last=day;const idx=(d.streak-1)%7,w=Math.min(4,Math.floor((d.streak-1)/7));const tok=Math.round(DTOK[idx]*(1+.25*w)*tkK(u));v.tok+=tok;let item=null;if((idx===2||idx===4||idx===6)&&v.items.length<VMAX){item=sRoll(idx===6?Math.min(4,2+(w>=2?1:0)):idx===4?1:0);v.items.push(item)}if(idx===6)d.shield=Math.min(2,d.shield+1);mark();return{idx,w,tok,item,shieldUsed,vault:vOut(u)}},
async '/api/vchest'(a){const u=getUser(String(a.user.id));const v=vault(u);if(v.tok<VCHEST)throw ERR('tok',402);if(v.items.length>=VMAX)throw ERR('full',409);v.tok-=VCHEST;const item=sRoll(0);v.items.push(item);mark();return{item,vault:vOut(u)}},
async '/api/vup'(a,body){const u=getUser(String(a.user.id));const v=vault(u);const it=v.items.find(x=>x.id===body.id);if(!it)throw ERR('gone',404);if(it.l>=4+it.r*2)throw ERR('max',409);const c=(it.l+1)*(it.r+1)*2;if(v.tok<c)throw ERR('tok',402);v.tok-=c;it.l++;mark();return{item:it,vault:vOut(u)}},
async '/api/vsell'(a,body){const u=getUser(String(a.user.id));const v=vault(u);const i=v.items.findIndex(x=>x.id===body.id);if(i<0)throw ERR('gone',404);const it=v.items.splice(i,1)[0];const tok=[1,2,4,8,16][it.r]||1;v.tok+=tok;mark();return{tok,vault:vOut(u)}},
async '/api/market'(a){const u=getUser(String(a.user.id));db.market=db.market||[];return{list:db.market.slice(-100).reverse().map(m=>({id:m.id,name:m.name,it:{b:m.it.b,r:m.it.r,l:m.it.l},p:m.p,me:m.u===u.id})),vault:vOut(u)}},
async '/api/mlist'(a,body){const u=getUser(String(a.user.id));const v=vault(u);const p=Math.floor(+body.p);if(!(p>=1&&p<=1e6))throw ERR('price',400);db.market=db.market||[];if(db.market.filter(m=>m.u===u.id).length>=10)throw ERR('limit',429);const i=v.items.findIndex(x=>x.id===body.id);if(i<0)throw ERR('gone',404);const it=v.items.splice(i,1)[0];db.market.push({id:crypto.randomBytes(6).toString('hex'),u:u.id,name:u.name,it,p,t:Date.now()});mark();return{vault:vOut(u)}},
async '/api/mbuy'(a,body){const u=getUser(String(a.user.id));const v=vault(u);db.market=db.market||[];const i=db.market.findIndex(m=>m.id===body.id);if(i<0)throw ERR('gone',404);const m=db.market[i];if(m.u===u.id)throw ERR('own',400);if(v.tok<m.p)throw ERR('tok',402);if(v.items.length>=VMAX)throw ERR('full',409);db.market.splice(i,1);v.tok-=m.p;v.items.push(m.it);const sv=vault(getUser(m.u));sv.tok+=m.p-Math.ceil(m.p*.05);mark();return{it:m.it,vault:vOut(u)}},
async '/api/munlist'(a,body){const u=getUser(String(a.user.id));const v=vault(u);db.market=db.market||[];const i=db.market.findIndex(m=>m.id===body.id&&m.u===u.id);if(i<0)throw ERR('gone',404);if(v.items.length>=VMAX)throw ERR('full',409);const m=db.market.splice(i,1)[0];v.items.push(m.it);mark();return{vault:vOut(u)}},
async '/api/pvp'(a){const u=getUser(String(a.user.id));const p=pvp(u);if(!p.opp.length||Date.now()-p.oppT>PVP_OPP_MS||p.opp.some(o=>!o.bot&&!db.users[o.id]))pvpPick(u);mark();return pvpRes(u)},
async '/api/pvpre'(a){const u=getUser(String(a.user.id));const p=pvp(u),v=vault(u);if(Date.now()-p.oppT<PVP_RE_MS){if(v.tok<1)throw ERR('tok',406);v.tok-=1}pvpPick(u);mark();return pvpRes(u)},
async '/api/pvpst'(a,body){const u=getUser(String(a.user.id));if(!STANCES[body.st])throw ERR('st',400);pvp(u).st=body.st;mark();return pvpRes(u)},
async '/api/pvpseen'(a){const u=getUser(String(a.user.id));pvp(u).seen=Date.now();mark();return pvpRes(u)},
async '/api/pvpchest'(a){const u=getUser(String(a.user.id));const p=pvp(u);pvpDay(p);const day=sDay();if(p.lc===day)throw ERR('done',409);if(p.da<3)throw ERR('few',403);p.lc=day;const c=LEAGUES[league(p.r)].c,tok=Math.round(c*2*tkK(u)),coins=Math.round(2500*c*levelOf(u.total)**2*acK(u));vault(u).tok+=tok;u.pending.push({type:'coins',amount:coins,reason:'pvp'});mark();return Object.assign(pvpRes(u),{tok,coins,grants:popGrants(u)})},
async '/api/pvptop'(a){const uid=String(a.user.id);const all=Object.values(db.users).filter(u=>u.p&&(u.p.sw||0)+(u.p.sl||0)>0).sort((x,y)=>y.p.r-x.p.r||y.p.w-x.p.w);const o=(u,i)=>({rank:i+1,name:u.name,r:u.p.r,lg:league(u.p.r),w:u.p.w,me:u.id===uid});const idx=all.findIndex(u=>u.id===uid);return{season:sOut(pvp(getUser(uid))),top:all.slice(0,50).map(o),me:idx>=0?o(all[idx],idx):null}},
async '/api/pvpfight'(a,body){const u=getUser(String(a.user.id));if(body.state)acceptState(u,body.state);seasonTick();const p=pvp(u);pvpTick(p);pvpDay(p);if(p.tk<1)throw ERR('tk',402);const t=Date.now(),st=STANCES[body.st]?body.st:'bal';let o=null,rev=null;
if(body.rev){rev=p.log.find(x=>x.id===body.rev&&x.k==='d'&&!x.win&&!x.rv&&t-x.t<864e5);if(!rev||!db.users[rev.o])throw ERR('gone',404);o={id:rev.o}}else{o=p.opp.find(x=>x.id===String(body.id));if(!o||(!o.bot&&!db.users[o.id]))throw ERR('gone',404);if(!o.bot&&p.hit[o.id]&&t-p.hit[o.id]<PVP_CD)throw ERR('cd',429)}
if(o.id===u.id)throw ERR('self',400);const A=fighter(u,st);let D=null,B,dr;if(o.bot){B=o.f;dr=o.r}else{D=db.users[o.id];const dp=pvp(D);pvpTick(dp);pvpDay(dp);B=fighter(D,dp.st);dr=dp.r}
const res=battle(A,B,crypto.randomInt(2147483647)),ea=1/(1+10**((dr-p.r)/400));let dA=Math.round(PVP_K*((res.win?1:0)-ea));if(res.win&&dA<1)dA=1;if(!res.win&&dA>-1)dA=-1;
p.tk--;p.r=Math.max(0,p.r+dA);p.best=Math.max(p.best,p.r);if(res.win){p.w++;p.sw++}else{p.l++;p.sl++}p.sb=Math.max(p.sb||0,p.r);p.da++;
const L=levelOf(u.total);let tok=0,coins=0;if(res.win&&p.wn<PVP_WIN_TOK){p.wn++;tok=Math.round((LEAGUES[league(p.r)].c+(rev?1:0))*tkK(u));vault(u).tok+=tok;coins=Math.round(1500*L*L*(rev?1.5:1)*acK(u))}else if(!res.win&&p.da<=PVP_WIN_TOK*2)coins=Math.round(300*L*L*acK(u));if(coins)u.pending.push({type:'coins',amount:coins,reason:'pvp'});
let dB=0;if(D){const dp=D.p;dB=-Math.round(dA/2);dp.r=Math.max(0,dp.r+dB);dp.best=Math.max(dp.best,dp.r);if(res.win){dp.l++;dp.sl++}else{dp.w++;dp.sw++}let dc=0;if(!res.win&&dp.dwn<PVP_DEF_PAY){dp.dwn++;dc=Math.round(500*levelOf(D.total)**2*acK(D));D.pending.push({type:'coins',amount:dc,reason:'pvpdef'})}
dp.log.unshift({id:crypto.randomBytes(6).toString('hex'),t,k:'d',o:u.id,n:u.name,win:!res.win,d:dB,pw:A.pw,c:dc});dp.log.length=Math.min(dp.log.length,PVP_LOG);
if(TOKEN&&t-(dp.nt||0)>PVP_NTF_MS){dp.nt=t;tg('sendMessage',{chat_id:D.id,text:`${u.name} напал на твою кузню на арене и ${res.win?'пробил защиту':'отступил'}. Рейтинг: ${dB>0?'+':''}${dB}.${res.win?' Реванш доступен 24 часа.':''}`,reply_markup:kb([[playBtn('На арену')]])})}}
if(rev)rev.rv=1;p.hit[o.id]=t;p.log.unshift({id:crypto.randomBytes(6).toString('hex'),t,k:'a',o:o.id,n:B.name,win:res.win,d:dA,pw:B.pw,bot:o.bot?1:0,c:coins,tk:tok,rv:rev?1:0});p.log.length=Math.min(p.log.length,PVP_LOG);
p.opp=p.opp.filter(x=>x.id!==o.id);if(!p.opp.length)pvpPick(u);mark();
return Object.assign(pvpRes(u),{A:fOut(A),B:fOut(B),ev:res.ev,win:res.win,dA,dB,r:p.r,tok,coins,rev:!!rev,grants:popGrants(u)})},
'/api/exp'(a){const u=getUser(String(a.user.id));return{exp:expOut(u)}},
'/api/expgo'(a,body){const u=getUser(String(a.user.id)),e=expSt(u),x=EXP[body.k];if(!x)throw ERR('bad',400);if(e.a)throw ERR('busy',409);if(body.state)acceptState(u,body.state);const me=expAcc(u);if(expMiss(me,x).length)throw ERR('lock',403);const t=Date.now();e.a={k:body.k,start:t,end:t+x.h*3600e3,nt:0,pm:expMul(me,x)};mark();return{exp:expOut(u)}},
'/api/expdone'(a){const u=getUser(String(a.user.id)),e=expSt(u),c=e.a;if(!c)throw ERR('none',404);if(Date.now()<c.end)throw ERR('early',425);const x=EXP[c.k],L=levelOf(u.total||0),v=vault(u),rw=expRw(Math.max(1,L),c.k,c.pm||1,acK(u)),coins=rw.coins;let tok=rw.tok,item=null;if(Math.random()<rw.it){if(v.items.length<VMAX){item=sRoll(x.r);v.items.push(item)}else tok+=4}
  v.tok+=tok;u.pending.push({type:'coins',amount:coins,reason:'exp'});e.a=null;e.n++;e.h[c.k]=(e.h[c.k]||0)+1;const A=an(u);A.exp=(A.exp||0)+1;mark();return{coins,tok,item,k:c.k,name:x.n,exp:expOut(u),vault:vOut(u),grants:popGrants(u)}},
'/api/tower'(a){const u=getUser(String(a.user.id));return{tower:twOut(u)}},
'/api/towerfight'(a,body){const u=getUser(String(a.user.id));if(body.state)acceptState(u,body.state);const w=twSt(u);if(w.n>=TW_TRIES)throw ERR('tries',402);const f=w.f,k=twKind(f),A=fighter(u,STANCES[body.st]?body.st:'bal'),B=twFoe(f),res=battle(A,B,crypto.randomInt(2147483647));let coins=0,tok=0,item=null;
  if(res.win){const L=levelOf(u.total||0),rw=twRw(L,f,acK(u)),v=vault(u);coins=rw.coins;tok=rw.tok;if(rw.item&&Math.random()<rw.item){if(v.items.length<VMAX){item=sRoll(Math.min(3,k===2?1+Math.floor(f/50):Math.floor(f/40)));v.items.push(item)}else tok+=4}v.tok+=tok;u.pending.push({type:'coins',amount:coins,reason:'tower'});w.f++;w.w++;if(f>w.best){w.best=f;w.bt=Date.now()}}else w.n++;
  const An=an(u);An.tower=(An.tower||0)+1;mark();return{win:res.win,f,k,A:fOut(A),B:fOut(B),ev:res.ev,coins,tok,item,tower:twOut(u),vault:vOut(u),grants:popGrants(u)}},
'/api/towertop'(a){const uid=String(a.user.id);const all=Object.values(db.users).filter(u=>u.tw&&u.tw.best>0).sort((x,y)=>y.tw.best-x.tw.best||(x.tw.bt||0)-(y.tw.bt||0));const o=(u,i)=>({rank:i+1,name:u.name,best:u.tw.best,lvl:levelOf(u.total||0),me:u.id===uid});const i=all.findIndex(u=>u.id===uid);return{top:all.slice(0,50).map(o),me:i>=0?o(all[i],i):null}},
'/api/boss'(a){const u=getUser(String(a.user.id));bossTick();return{boss:bOut(u)}},
'/api/bossfight'(a,body){const u=getUser(String(a.user.id));if(body.state)acceptState(u,body.state);bossTick();const b=bossCur(),bs=bossDay(u);if(bs.n>=BOSS_TRIES)throw ERR('tries',402);if(b.hp<=0)throw ERR('gone',404);
  const st=STANCES[body.st]?body.st:'atk',F=fighter(u,st),R=pRng(crypto.randomInt(2147483647)),hits=[];let dmg=0;for(let i=0;i<BOSS_HITS;i++){const c=R()<F.crit,d=Math.max(1,Math.round(F.atk*(.85+.3*R())*(c?1.8:1)));hits.push({d,c:c?1:0});dmg+=d}
  dmg=Math.min(dmg,b.hp);bs.n++;b.hp-=dmg;b.hits++;b.dmg[u.id]=(b.dmg[u.id]||0)+dmg;b.feed.unshift({n:u.name,d:dmg,t:Date.now()});b.feed.length=Math.min(b.feed.length,10);
  const L=levelOf(u.total||0),coins=Math.round(400*L*L*acK(u));u.pending.push({type:'coins',amount:coins,reason:'bosshit'});const A=an(u);A.boss=(A.boss||0)+1;const name=b.name;let kill=false;if(b.hp<=0){kill=true;bossEnd(true,u.id)}mark();
  return{dmg,hits,coins,kill,name,boss:bOut(u),vault:vOut(u),grants:popGrants(u)}},
'/api/ev'(a,body){const u=getUser(String(a.user.id)),A=an(u),list=Array.isArray(body.ev)?body.ev.slice(0,40):[];for(const e of list){if(!e||typeof e!=='object')continue;
  if(e.e==='tut'){const s=svN(e.s,50);if(s>A.tut)A.tut=s;if(e.skip){A.skip=1;A.skipAt=s}}
  else if(e.e==='lvl'){const l=svN(e.l,20);if(l>=2&&A.lv[l]==null)A.lv[l]=svN(e.p,1e8)}
  else if(e.e==='tabs'&&e.c&&typeof e.c==='object'){for(const k of Object.keys(e.c).slice(0,10)){if(!/^[a-z]{2,10}$/.test(k))continue;A.tabs[k]=(A.tabs[k]||0)+svN(e.c[k],1e4)}if(typeof e.lt==='string'&&/^[a-z]{2,10}$/.test(e.lt))A.lt=e.lt}
  else if(e.e==='stuck'){A.stuck=(A.stuck||0)+1;A.stuckL=svN(e.l,20)}}
  mark();return{ok:true}},
async '/api/invoice'(a,body){const uid=String(a.user.id);const it=ITEMS[body.item];if(!it)throw Object.assign(new Error('item'),{code:400});const u=getUser(uid);if(isFree(uid)||(DEV&&!TOKEN)){u.pending.push({type:'item',item:body.item});db.freeLog.unshift({uid,item:body.item,at:Date.now()});if(db.freeLog.length>300)db.freeLog.length=300;mark();return{dev:true,free:isFree(uid)}}const payload=JSON.stringify({u:uid,i:body.item,n:crypto.randomBytes(4).toString('hex')});const r=await tg('createInvoiceLink',{title:it.t,description:(it.d+' · бонус прокачки x'+shopK(u)).slice(0,250),payload,currency:'XTR',prices:[{label:it.t,amount:it.s}]});if(!r.ok)throw Object.assign(new Error('invoice'),{code:502});return{link:r.result}}
};
const BADK=new Set(['__proto__','constructor','prototype']);
function admPath(p){const k=String(p||'').split('.').map(x=>x.trim()).filter(Boolean);if(!k.length||k.some(x=>BADK.has(x)))throw ERR('path',400);return k}
function admSet(o,k,v){let c=o;for(let i=0;i<k.length-1;i++){if(c[k[i]]==null||typeof c[k[i]]!=='object')c[k[i]]={};c=c[k[i]]}if(v===undefined)delete c[k[k.length-1]];else c[k[k.length-1]]=v}
function admGet(o,k){return k.reduce((c,x)=>c==null?c:c[x],o)}
function admVal(v){if(typeof v!=='string')return v;const s=v.trim();if(s==='')return '';try{return JSON.parse(s)}catch(e){return v}}
function admU(id){id=String(id||'').trim();if(!db.users[id])throw ERR('nouser',404);const u=db.users[id];u.bt=u.mt=Date.now();return u}
function admSt(u){if(!u.state||typeof u.state!=='object')u.state={coins:0,total:0};return u.state}
function admForce(u){const st=admSt(u);u.total=Math.max(0,+st.total||0);u.force=1;mark()}
function admCard(u){const st=u.state||{},v=vault(u),p=pvp(u),w=twSt(u),b=bossDay(u);return{id:u.id,name:u.name,lvl:levelOf(u.total||0),coins:Math.floor(st.coins||0),total:Math.floor(u.total||0),shards:Math.floor(st.shards||0),ess:Math.floor(st.ess||0),energy:Math.floor(st.energy||0),refills:st.refills||0,tok:v.tok,items:v.items.length,streak:v.d.streak,pr:p.r,tk:p.tk,tf:w.f,tb:w.best,tn:w.n,bn:b.n,refs:u.refs||0,spent:u.spent||0,seen:u.seen||0,created:u.created||0,admin:isAdmin(u.id),owner:isOwner(u.id),free:isFree(u.id),freeOwn:!!db.free[u.id],ban:!!db.ban[u.id],skin:st.skin||'',owned:st.owned||[]}}
function admStats(){const users=Object.values(db.users),day=Date.now()-864e5,pay=Object.values(db.payments),b=bossCur();return{users:users.length,dau:users.filter(u=>(u.seen||0)>day).length,payers:new Set(pay.map(p=>p.uid)).size,stars:pay.reduce((a,p)=>a+(p.stars||0),0),payments:pay.length,freeBuys:db.freeLog.length,ac:db.ac?db.ac.n:0,season:seasonCur().n,owners:[...OWNERS],admins:db.admins.slice(),freeAll:!!db.freeAll,freeUsers:Object.keys(db.free),bans:Object.keys(db.ban),bal:BAL(),boss:{name:b.name,lvl:b.lvl,hp:b.hp,max:b.max},items:Object.fromEntries(Object.entries(ITEMS).map(([k,x])=>[k,x.t])),gids:GIDS}}
const ADM={
me(a){const u=db.users[String(a.user.id)];return{ok:true,uid:String(a.user.id),name:u?u.name:([a.user.first_name,a.user.last_name].filter(Boolean).join(' ')||'Админ'),owner:isOwner(a.user.id),stats:admStats()}},
stats(){return{stats:admStats(),text:balText(balReport())}},
find(a,b){const q=String(b.q||'').trim().toLowerCase();let L=Object.values(db.users);if(q)L=L.filter(u=>String(u.id).includes(q)||String(u.name||'').toLowerCase().includes(q));L.sort((x,y)=>(y.seen||0)-(x.seen||0));return{list:L.slice(0,40).map(u=>({id:u.id,name:u.name,lvl:levelOf(u.total||0),total:Math.floor(u.total||0),admin:isAdmin(u.id),free:isFree(u.id),ban:!!db.ban[u.id]}))}},
user(a,b){const u=admU(b.id);const card=admCard(u);return{user:card,state:u.state,extra:{v:u.v,p:u.p,tw:u.tw,ex:u.ex,bs:u.bs}}},
give(a,b){const u=admU(b.id),k=String(b.kind||''),n=Math.trunc(+b.n||0),st=admSt(u),v=vault(u),p=pvp(u),w=twSt(u);let note='';
if(k==='coins'){st.coins=Math.max(0,(+st.coins||0)+n);if(n>0)st.total=(+st.total||0)+n;admForce(u)}
else if(k==='shards'||k==='ess'||k==='energy'||k==='refills'){st[k]=Math.max(0,(+st[k]||0)+n);admForce(u)}
else if(k==='lvl'){const L=Math.min(LEVELS.length,Math.max(1,n));st.total=Math.max(+st.total||0,LEVELS[L-1]);st.coins=Math.max(+st.coins||0,0);admForce(u)}
else if(k==='tok'){v.tok=Math.max(0,v.tok+n)}
else if(k==='gear'){const r=Math.min(4,Math.max(0,Math.trunc(+b.r||0))),c=Math.min(VMAX,Math.max(1,n||1)),lv=Math.min(4+r*2,Math.max(0,Math.trunc(+b.l||0)));let got=0;for(let i=0;i<c&&v.items.length<VMAX;i++){const it=sRoll(r);it.r=r;it.l=lv;if(GIDS.includes(b.b))it.b=b.b;v.items.push(it);got++}note=`выдано ${got} из ${c}`+(got<c?' (хранилище заполнено)':'')}
else if(k==='shop'){if(!ITEMS[b.item])throw ERR('item',400);const c=Math.min(20,Math.max(1,n||1));for(let i=0;i<c;i++)u.pending.push({type:'item',item:b.item,reason:'adm'});note=`${ITEMS[b.item].t} ×${c}`}
else if(k==='tk'){p.tk=Math.max(0,p.tk+n)}
else if(k==='pr'){p.r=Math.max(0,p.r+n);p.best=Math.max(p.best||0,p.r)}
else if(k==='tower'){w.f=Math.max(1,w.f+n);w.best=Math.max(w.best,w.f-1)}
else if(k==='tries'){w.n=0;bossDay(u).n=0;p.tk=Math.max(p.tk,PVP_MAX_TK)}
else throw ERR('kind',400);
mark();return{user:admCard(u),note}},
set(a,b){const u=admU(b.id),k=admPath(b.path);if(k[0]==='id')throw ERR('path',400);admSet(u,k,b.del?undefined:admVal(b.value));if(k[0]==='state'||k[0]==='total')admForce(u);mark();return{user:admCard(u),state:u.state,value:admGet(u,k)}},
get(a,b){const u=admU(b.id),k=admPath(b.path);return{value:admGet(u,k)}},
state(a,b){const u=admU(b.id);let s=b.state;if(typeof s==='string'){try{s=JSON.parse(s)}catch(e){throw ERR('json',400)}}if(!s||typeof s!=='object'||Array.isArray(s))throw ERR('state',400);u.state=s;admForce(u);return{user:admCard(u),state:u.state}},
reset(a,b){const u=admU(b.id);u.state={coins:0,total:0};u.v=null;u.p=null;u.tw=null;u.ex=null;u.bs=null;u.pending=[];u.cr=0;admForce(u);return{user:admCard(u)}},
flag(a,b){const u=admU(b.id),k=String(b.k||''),on=!!b.on;if(k==='free'){if(on)db.free[u.id]=1;else delete db.free[u.id]}else if(k==='ban'){if(isAdmin(u.id)&&!isOwner(a.user.id))throw ERR('owner',403);if(isOwner(u.id))throw ERR('owner',403);if(on)db.ban[u.id]=1;else delete db.ban[u.id]}else if(k==='admin'){if(!isOwner(a.user.id)||isOwner(u.id))throw ERR('owner',403);db.admins=db.admins.filter(x=>x!==u.id);if(on)db.admins.push(u.id)}else throw ERR('k',400);mark();return{user:admCard(u)}},
freeall(a,b){db.freeAll=!!b.on;mark();return{stats:admStats()}},
bal(a,b){if(b.reset)db.bal={};else{const o=b.set&&typeof b.set==='object'?b.set:{[b.k]:b.v};for(const [k,v] of Object.entries(o)){if(BAL_DEF[k]==null)throw ERR('k',400);db.bal[k]=Math.min(20,Math.max(.05,+v||1))}}mark();return{stats:admStats()}},
world(a,b){const k=admPath(b.path);if(!['bal','boss','season','bossHall','market','freeAll','ac','free','ban','freeLog','payments'].includes(k[0]))throw ERR('path',400);admSet(db,k,b.del?undefined:admVal(b.value));mark();return{value:admGet(db,k)}},
wget(a,b){const k=admPath(b.path);if(['users','pendingRefs'].includes(k[0])&&k.length<2)throw ERR('path',400);return{value:admGet(db,k)}},
boss(a,b){const bs=bossCur();if(b.kill)bs.hp=0;else if(b.hp!=null)bs.hp=Math.max(0,Math.min(bs.max,Math.trunc(+b.hp||0)));if(b.end)bs.end=Date.now();mark();try{bossTick()}catch(e){}const c=bossCur();return{boss:{name:c.name,lvl:c.lvl,hp:c.hp,max:c.max},stats:admStats()}},
bcast(a,b){const t=String(b.text||'').trim().slice(0,4000);if(!t)throw ERR('text',400);const L=Object.keys(db.users).filter(id=>/^\d+$/.test(id)).map(id=>({chat_id:id,text:t}));ntfQueue(L);return{n:L.length}},
msg(a,b){const u=admU(b.id),t=String(b.text||'').trim().slice(0,4000);if(!t)throw ERR('text',400);ntfQueue([{chat_id:u.id,text:t}]);return{ok:true}}
};
db.crm=db.crm&&typeof db.crm==='object'?db.crm:{};db.alog=Array.isArray(db.alog)?db.alog:[];db.dact=db.dact&&typeof db.dact==='object'?db.dact:{};
const D1=864e5;
function track(uid){const d=sDay(),k=String(d);let o=db.dact[k];if(!o){o=db.dact[k]={};for(const x of Object.keys(db.dact))if(+x<d-40)delete db.dact[x]}if(!o[uid]){o[uid]=1;mark()}}
function crmOf(id){if(!db.crm[id])db.crm[id]={tags:[],notes:[]};return db.crm[id]}
function crmGet(id){return db.crm[id]||{tags:[],notes:[]}}
function admTags(){const m={};for(const c of Object.values(db.crm))for(const g of c.tags||[])m[g]=(m[g]||0)+1;return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([n,c])=>({n,c}))}
function admSeg(u,s,t){const seen=u.seen||u.created||0;switch(s){case 'active':return seen>t-D1;case 'week':return seen>t-7*D1;case 'new':return(u.created||0)>t-7*D1;case 'sleep':return seen<=t-7*D1;case 'payers':return(u.spent||0)>0;case 'nopay':return!((u.spent||0)>0);case 'ban':return!!db.ban[u.id];case 'admins':return isAdmin(u.id);case 'free':return!!db.free[u.id];case 'cheat':return(u.ac||0)>0;case 'tagged':return!!(db.crm[u.id]&&db.crm[u.id].tags.length);default:return true}}
function admPick(b){const t=Date.now(),seg=String(b.seg||'all'),tag=String(b.tag||'').trim();return Object.values(db.users).filter(u=>admSeg(u,seg,t)&&(!tag||(db.crm[u.id]&&db.crm[u.id].tags.includes(tag))))}
function admRow(u){const c=crmGet(u.id);return{id:u.id,name:u.name,lvl:levelOf(u.total||0),total:Math.floor(u.total||0),coins:Math.floor((u.state&&u.state.coins)||0),spent:u.spent||0,refs:u.refs||0,pr:u.p?u.p.r:PVP_START,seen:u.seen||0,created:u.created||0,ac:u.ac||0,admin:isAdmin(u.id),owner:isOwner(u.id),free:isFree(u.id),ban:!!db.ban[u.id],tags:c.tags,notes:c.notes.length}}
const ADM_SORT={seen:u=>u.seen||u.created||0,created:u=>u.created||0,total:u=>u.total||0,spent:u=>u.spent||0,refs:u=>u.refs||0,pr:u=>u.p?u.p.r:PVP_START,ac:u=>u.ac||0,name:u=>String(u.name||'').toLowerCase()};
const ADM_W=new Set(['give','set','state','reset','flag','freeall','bal','world','boss','bcast','seg','msg','note','unnote','tags']);
function admLog(a,k,b,r){const who=String(a.user.id),wu=db.users[who];let d='';
  if(k==='give')d=`${b.kind} ${b.n!=null?b.n:''}${b.item?' '+b.item:''}${b.kind==='gear'?' редкость '+b.r:''}`;else if(k==='set')d=`${b.path} = ${b.del?'удалено':String(b.value).slice(0,80)}`;else if(k==='flag')d=`${b.k}: ${b.on?'вкл':'выкл'}`;else if(k==='freeall')d=b.on?'вкл':'выкл';else if(k==='bal')d=b.reset?'сброс':JSON.stringify(b.set||{[b.k]:b.v});else if(k==='world')d=`${b.path}${b.del?' удалено':' = '+String(b.value).slice(0,60)}`;else if(k==='boss')d=b.kill?'убит':b.end?'неделя завершена':'HP '+b.hp;else if(k==='bcast'||k==='seg')d=`${r&&r.n||0} получателей · ${String(b.text||'').slice(0,80)}`;else if(k==='msg'||k==='note')d=String(b.text||'').slice(0,80);else if(k==='tags')d=(Array.isArray(b.tags)?b.tags:[]).join(', ');
  db.alog.unshift({t:Date.now(),a:who,an:wu?wu.name:who,k,id:b.id!=null?String(b.id):'',un:b.id!=null&&db.users[String(b.id)]?db.users[String(b.id)].name:'',d});if(db.alog.length>500)db.alog.length=500;mark()}
Object.assign(ADM,{
list(a,b){const q=String(b.q||'').trim().toLowerCase();let L=admPick(b);if(q)L=L.filter(u=>String(u.id).includes(q)||String(u.name||'').toLowerCase().includes(q)||(db.crm[u.id]&&db.crm[u.id].notes.some(n=>n.text.toLowerCase().includes(q))));const f=ADM_SORT[b.sort]||ADM_SORT.seen,dir=b.dir==='asc'?1:-1;L.sort((x,y)=>{const p=f(x),r=f(y);return(p<r?-1:p>r?1:0)*dir});const per=Math.min(100,Math.max(10,Math.trunc(+b.per||25))),pages=Math.max(1,Math.ceil(L.length/per)),page=Math.min(pages,Math.max(1,Math.trunc(+b.page||1)));return{total:L.length,page,pages,per,rows:L.slice((page-1)*per,page*per).map(admRow),tags:admTags()}},
dash(){const t=Date.now(),N=30,d0=sDay()-N+1,users=Object.values(db.users),pay=Object.values(db.payments);const days=Array.from({length:N},(x,i)=>({d:d0+i,date:new Date((d0+i)*D1).toISOString().slice(0,10),reg:0,act:Object.keys(db.dact[String(d0+i)]||{}).length,stars:0,pays:0}));
  for(const u of users){const c=Math.floor((u.created||0)/D1)-d0;if(c>=0&&c<N)days[c].reg++}for(const p of pay){const i=Math.floor((p.at||0)/D1)-d0;if(i>=0&&i<N){days[i].stars+=p.stars||0;days[i].pays++}}
  const lv=Array(LEVELS.length).fill(0);users.forEach(u=>lv[levelOf(u.total||0)-1]++);const it={};for(const p of pay){const k=p.item;if(!it[k])it[k]={k,n:ITEMS[k]?ITEMS[k].t:k,c:0,s:0};it[k].c++;it[k].s+=p.stars||0}
  const stars=pay.reduce((s,p)=>s+(p.stars||0),0),payers=new Set(pay.map(p=>p.uid)).size,s=seasonCur(),bs=bossCur();
  return{kpi:{users:users.length,dau:users.filter(u=>(u.seen||0)>t-D1).length,wau:users.filter(u=>(u.seen||0)>t-7*D1).length,mau:users.filter(u=>(u.seen||0)>t-30*D1).length,new1:users.filter(u=>(u.created||0)>t-D1).length,new7:users.filter(u=>(u.created||0)>t-7*D1).length,stars,stars7:pay.filter(p=>(p.at||0)>t-7*D1).reduce((s,p)=>s+(p.stars||0),0),payments:pay.length,payers,conv:users.length?+(100*payers/users.length).toFixed(1):0,arppu:payers?Math.round(stars/payers):0,bans:Object.keys(db.ban).length,ac:db.ac.n,free:db.freeLog.length},days,lv,items:Object.values(it).sort((a,b)=>b.s-a.s),top:users.filter(u=>(u.spent||0)>0).sort((a,b)=>b.spent-a.spent).slice(0,5).map(admRow),season:{n:s.n,end:s.end},boss:{name:bs.name,lvl:bs.lvl,hp:bs.hp,max:bs.max,end:bs.end,players:Object.keys(bs.dmg).length},alog:db.alog.slice(0,8)}},
prof(a,b){const u=admU(b.id),p=pvp(u);return{user:admCard(u),row:admRow(u),crm:crmGet(u.id),state:u.state,pays:Object.entries(db.payments).filter(([,x])=>x.uid===u.id).map(([id,x])=>({id,item:x.item,title:ITEMS[x.item]?ITEMS[x.item].t:x.item,stars:x.stars||0,at:x.at||0})).sort((x,y)=>y.at-x.at),free:db.freeLog.filter(x=>x.uid===u.id).slice(0,30).map(x=>({item:x.item,title:ITEMS[x.item]?ITEMS[x.item].t:x.item,at:x.at})),ac:db.ac.log.filter(x=>x.u===u.id),pvp:p.log.slice(0,15),alog:db.alog.filter(x=>x.id===u.id).slice(0,30),ref:u.referrer?{id:u.referrer,name:db.users[u.referrer]?db.users[u.referrer].name:'—'}:null,invited:Object.values(db.users).filter(x=>x.referrer===u.id).slice(0,50).map(x=>({id:x.id,name:x.name,lvl:levelOf(x.total||0)})),items:Object.fromEntries(Object.entries(ITEMS).map(([k,x])=>[k,x.t])),gids:GIDS,tags:admTags(),extra:{v:u.v,p:u.p,tw:u.tw,ex:u.ex,bs:u.bs}}},
pays(a,b){const q=String(b.q||'').trim().toLowerCase(),item=String(b.item||'');let L=Object.entries(db.payments).map(([id,p])=>({id,uid:String(p.uid),name:db.users[p.uid]?db.users[p.uid].name:'—',item:p.item,title:ITEMS[p.item]?ITEMS[p.item].t:p.item,stars:p.stars||0,at:p.at||0}));if(item)L=L.filter(p=>p.item===item);if(q)L=L.filter(p=>p.uid.includes(q)||String(p.name).toLowerCase().includes(q)||p.id.toLowerCase().includes(q));L.sort((x,y)=>y.at-x.at);const per=50,pages=Math.max(1,Math.ceil(L.length/per)),page=Math.min(pages,Math.max(1,Math.trunc(+b.page||1)));return{total:L.length,sum:L.reduce((s,p)=>s+p.stars,0),payers:new Set(L.map(p=>p.uid)).size,page,pages,rows:L.slice((page-1)*per,page*per),items:Object.fromEntries(Object.entries(ITEMS).map(([k,x])=>[k,x.t+' · '+x.s+' ⭐'])),free:db.freeLog.slice(0,50).map(f=>({uid:f.uid,name:db.users[f.uid]?db.users[f.uid].name:'—',item:f.item,title:ITEMS[f.item]?ITEMS[f.item].t:f.item,at:f.at}))}},
note(a,b){const u=admU(b.id),x=String(b.text||'').trim().slice(0,2000);if(!x)throw ERR('text',400);const c=crmOf(u.id),wu=db.users[String(a.user.id)];c.notes.unshift({id:crypto.randomBytes(5).toString('hex'),t:Date.now(),a:String(a.user.id),an:wu?wu.name:String(a.user.id),text:x});c.notes.length=Math.min(c.notes.length,100);mark();return{crm:c}},
unnote(a,b){const u=admU(b.id),c=crmOf(u.id);c.notes=c.notes.filter(n=>n.id!==b.nid);mark();return{crm:c}},
tags(a,b){const u=admU(b.id),c=crmOf(u.id);c.tags=[...new Set((Array.isArray(b.tags)?b.tags:[]).map(x=>String(x).trim().slice(0,24)).filter(Boolean))].slice(0,12);mark();return{crm:c,tags:admTags()}},
segcount(a,b){return{n:admPick(b).filter(u=>/^\d+$/.test(u.id)).length,tags:admTags()}},
seg(a,b){const x=String(b.text||'').trim().slice(0,4000);if(!x)throw ERR('text',400);const L=admPick(b).filter(u=>/^\d+$/.test(u.id)).map(u=>({chat_id:u.id,text:x}));ntfQueue(L);return{n:L.length}},
logs(){return{alog:db.alog.slice(0,200),ac:db.ac.log.slice(0,50),acn:db.ac.n}},
csv(a,b){const e=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';const L=admPick(b).map(admRow);return{n:L.length,csv:'\ufeff'+['id,name,level,total,coins,spent_stars,refs,arena,created,last_seen,tags'].concat(L.map(r=>[r.id,r.name,r.lvl,r.total,r.coins,r.spent,r.refs,r.pr,r.created?new Date(r.created).toISOString():'',r.seen?new Date(r.seen).toISOString():'',r.tags.join(' ')].map(e).join(','))).join('\n')}}
});
for(const [k,f] of Object.entries(ADM))routes['/api/adm/'+k]=async(a,b)=>{if(!isAdmin(a.user.id))throw ERR('forbidden',403);b=b||{};const r=await f(a,b);if(ADM_W.has(k))admLog(a,k,b,r);return r};
async function onUpdate(up){
if(up.pre_checkout_query){const q=up.pre_checkout_query;let ok=false;try{const pl=JSON.parse(q.invoice_payload);ok=!!ITEMS[pl.i]&&ITEMS[pl.i].s===q.total_amount&&q.currency==='XTR'}catch(e){}await tg('answerPreCheckoutQuery',ok?{pre_checkout_query_id:q.id,ok:true}:{pre_checkout_query_id:q.id,ok:false,error_message:'Товар недоступен'});return}
const m=up.message;if(!m)return;
if(m.successful_payment){const sp=m.successful_payment;try{const pl=JSON.parse(sp.invoice_payload);const id=sp.telegram_payment_charge_id;if(!db.payments[id]){const u=getUser(String(pl.u));db.payments[id]={uid:String(pl.u),item:pl.i,stars:sp.total_amount,at:Date.now()};u.pending.push({type:'item',item:pl.i});u.spent=(u.spent||0)+sp.total_amount;mark()}}catch(e){console.error('payment',e.message)}await tg('sendMessage',{chat_id:m.chat.id,text:'Покупка зачислена! Возвращайся в игру.',reply_markup:kb([[playBtn('Играть')]])});return}
if(m.document&&isOwner(m.from.id)&&/\.json$/i.test(m.document.file_name||'')){await dbRestore(m);return}
const text=m.text||'';
if(/^\/backup(@\S+)?$/.test(text.trim())&&isAdmin(m.from.id)){const ok=GH?await ghPush(false):null;await dbSend([m.chat.id],'Бэкап базы по команде'+(ok===null?'':ok?' · GitHub обновлён':' · GitHub: ошибка, см. логи'));return}
if(/^\/start(@\S+)?(\s|$)/.test(text)){const arg=(text.split(/\s+/)[1]||'').trim();const uid=String(m.from.id);const r=arg.match(/^ref_(\d+)$/);let refTxt='';if(r&&r[1]!==uid&&!db.users[uid]&&db.users[r[1]]){db.pendingRefs[uid]=r[1];mark();refTxt=`\n\nТебя пригласил ${db.users[r[1]].name||'друг'} — ${REF_WELCOME.toLocaleString('ru-RU')} кристаллов ждут тебя в игре.`}const rows=[[playBtn('🎮 Играть')]];if(isAdmin(uid))rows.push([playBtn('📊 CRM-панель','/admin.html')]);const k=kb(rows);await botSay(m.chat.id,`Добро пожаловать в Crystal Forge, ${m.from.first_name||'мастер'}!\n\nТапай по кристаллу, нанимай шахтёров, прокачивай кузню, отправляй отряды в экспедиции и соревнуйся с друзьями.${refTxt}${k?'\n\nЖми кнопку ниже, чтобы начать:':'\n\nОткрой игру кнопкой «Играть» в меню бота.'}${isAdmin(uid)&&!k?'\n\n⚠️ Для админа: кнопки не появятся, пока в .env не указан WEBAPP_URL — https-адрес сайта игры. Либо просто открой игру по https один раз — адрес подхватится сам.':''}`,k);return}
if(isAdmin(m.from.id)){
  {const me={user:{id:String(m.from.id)}},say=t=>tg('sendMessage',{chat_id:m.chat.id,text:String(t).slice(0,4000)}),ar=text.trim().split(/\s+/),c=(ar.shift()||'').split('@')[0],on=x=>!/^(off|0|нет|выкл)$/i.test(x||'on');
  const card=x=>`${x.name} (${x.id})\nLV ${x.lvl} · кристаллы ${x.coins} · всего ${x.total}\nжетоны ${x.tok} · предметы ${x.items} · осколки ${x.shards} · эссенция ${x.ess}\nарена ${x.pr} · билеты ${x.tk} · башня ${x.tf} (рекорд ${x.tb})\nадмин: ${x.admin?'да':'нет'} · бесплатные покупки: ${x.free?'да':'нет'} · бан: ${x.ban?'да':'нет'}`;
  try{
  if(c==='/admin'){await botSay(m.chat.id,'Админ-панель Crystal Forge\n\nПолная CRM-панель открывается кнопкой ниже: дашборд, игроки, теги и заметки, платежи, рассылки по сегментам, баланс, журнал действий.\n\nКоманды:\n/user ID — карточка игрока\n/find текст — поиск по имени или ID\n/give ID coins|tok|shards|ess|energy|refills|lvl|tk|pr|tower N — выдать (минус — забрать)\n/item ID ключ [N] — товар из лавки\n/gear ID редкость(0-4) [N] — предметы снаряжения\n/set ID путь значение — любое поле, например state.coins 1000\n/free ID on|off — бесплатные покупки за звёзды\n/freeall on|off — бесплатные покупки для всех\n/addadmin ID, /deladmin ID\n/ban ID, /unban ID\n/reset ID — сбросить прогресс\n/msg ID текст — сообщение игроку\n/bcast текст — рассылка всем\n/stats, /balance, /bal, /cheat, /season\n\nТовары: '+Object.keys(ITEMS).join(', ')+(WEB_OK||(CONFIG.bot&&CONFIG.app)?'':'\n\nКнопки недоступны: укажи в .env реальный WEBAPP_URL (https) или APP_SHORT_NAME.'),kb([[playBtn('📊 Открыть CRM-панель','/admin.html')],[playBtn('👑 Админка в игре','/?adm=1')],[playBtn('🎮 Играть')]]));return}
  if(c==='/user'){await say(card(ADM.user(me,{id:ar[0]||m.from.id}).user));return}
  if(c==='/find'){const r=ADM.find(me,{q:ar.join(' ')});await say(r.list.map(x=>`${x.id} · ${x.name} · LV ${x.lvl}${x.admin?' · админ':''}${x.free?' · free':''}${x.ban?' · бан':''}`).join('\n')||'Никого не найдено');return}
  if(c==='/give'){await say(card(ADM.give(me,{id:ar[0],kind:ar[1],n:ar[2]}).user));return}
  if(c==='/item'){const r=ADM.give(me,{id:ar[0],kind:'shop',item:ar[1],n:ar[2]||1});await say('Выдано: '+r.note);return}
  if(c==='/gear'){const r=ADM.give(me,{id:ar[0],kind:'gear',r:ar[1],n:ar[2]||1});await say('Предметы: '+r.note);return}
  if(c==='/set'){const r=ADM.set(me,{id:ar[0],path:ar[1],value:ar.slice(2).join(' ')});await say(`${ar[1]} = ${JSON.stringify(r.value)}`);return}
  if(c==='/free'){await say(card(ADM.flag(me,{id:ar[0],k:'free',on:on(ar[1])}).user));return}
  if(c==='/freeall'){ADM.freeall(me,{on:on(ar[0])});await say('Бесплатные покупки для всех: '+(db.freeAll?'включены':'выключены'));return}
  if(c==='/addadmin'||c==='/deladmin'){await say(card(ADM.flag(me,{id:ar[0],k:'admin',on:c==='/addadmin'}).user));return}
  if(c==='/ban'||c==='/unban'){await say(card(ADM.flag(me,{id:ar[0],k:'ban',on:c==='/ban'}).user));return}
  if(c==='/reset'){ADM.reset(me,{id:ar[0]});await say('Прогресс игрока сброшен');return}
  if(c==='/msg'){ADM.msg(me,{id:ar[0],text:ar.slice(1).join(' ')});await say('Отправлено');return}
  if(c==='/bcast'){const r=ADM.bcast(me,{text:text.replace(/^\/bcast(@\S+)?\s*/,'')});await say(`Рассылка поставлена в очередь: ${r.n}`);return}
  }catch(e){await say('Ошибка: '+({nouser:'игрок не найден',path:'неверный путь',kind:'неизвестный ресурс',item:'неизвестный товар',owner:'только владелец может это сделать',text:'пустой текст'}[e.message]||e.message));return}}
  if(text.startsWith('/balance')){await tg('sendMessage',{chat_id:m.chat.id,text:balText(balReport())});return}
  if(text.startsWith('/bal')){const [,k,v]=text.split(/\s+/);if(k&&BAL_DEF[k]!=null&&v){const x=Math.min(4,Math.max(.25,+v||1));db.bal[k]=x;mark()}const B=BAL();await tg('sendMessage',{chat_id:m.chat.id,text:`Коэффициенты баланса (применяются у игроков при следу��щем входе):\ncost x${B.cost} — цены улучшений\npps x${B.pps} — добыча механизмов\ntap x${B.tap} — сила удара\noff x${B.off} — офлайн-доход\n\nИзменить: /bal cost 0.9 (0.25–4)`});return}
  if(text.startsWith('/cheat')){await tg('sendMessage',{chat_id:m.chat.id,text:`Срабатываний: ${db.ac.n}\n`+(db.ac.log.slice(0,15).map(x=>`${new Date(x.t).toISOString().slice(5,16)} ${x.n} (${x.u}) ${x.why}: +${x.gain} при лимите ${x.allow}`).join('\n')||'Пусто')});return}
  if(text.startsWith('/season')){const s=seasonCur(),b=bossCur();await tg('sendMessage',{chat_id:m.chat.id,text:`Сезон ${s.n}, до сброса ${Math.ceil((s.end-Date.now())/36e5)} ч\nБосс: ${b.name} ур.${b.lvl} — ${b.hp}/${b.max} HP, бойцов ${Object.keys(b.dmg).length}`});return}
}
if(/^\/admin(@\S+)?(\s|$)/.test(text)){await botSay(m.chat.id,`Нет доступа к админ-панели.\n\nТвой Telegram ID: ${m.from.id}\nВладелец добавляется в ADMIN_ID в файле .env (после перезапуска сервера), админы назначаются владельцем командой /addadmin ID.`);return}
if(text.startsWith('/paysupport')){await tg('sendMessage',{chat_id:m.chat.id,text:ENV.SUPPORT_TEXT||'По вопросам оплаты напишите в поддержку — мы ответим в течение 24 часов.'});return}
if(text.startsWith('/stats')&&isAdmin(m.from.id)){const users=Object.values(db.users);const day=Date.now()-864e5;const stars=Object.values(db.payments).reduce((a,p)=>a+p.stars,0);const payers=new Set(Object.values(db.payments).map(p=>p.uid)).size;await tg('sendMessage',{chat_id:m.chat.id,text:`Игроков: ${users.length}\nDAU: ${users.filter(u=>(u.seen||0)>day).length}\nПлатящих: ${payers}\nВыручка: ${stars} \nПлатежей: ${Object.keys(db.payments).length}\nАнтичит: ${db.ac.n}\nСезон: ${seasonCur().n}\n\n/balance — где застревают и уходят\n/bal — коэффициенты баланса\n/cheat — журнал античита\n/season — сезон и босс`})}
}
const server=http.createServer(async(req,res)=>{if(!WEB_OK){const h=String(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim(),pr=String(req.headers['x-forwarded-proto']||'').split(',')[0].trim();if(h&&(pr==='https'||req.socket.encrypted)&&!/^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|\[)/.test(h))setWeb('https://'+h)}
const url=req.url.split('?')[0];
try{
if(req.method==='POST'&&url==='/bot/'+SECRET){const up=await readBody(req);send(res,200,{ok:true});onUpdate(up).catch(e=>console.error('update',e.message));return}
if(req.method==='POST'&&routes[url]){const body=await readBody(req);const a=verify(body.initData);if(!a)return send(res,401,{error:'auth'});if(db.ban[String(a.user.id)]&&!isAdmin(a.user.id))return send(res,403,{error:'ban'});track(String(a.user.id));const out=await routes[url](a,body);const bu=db.users[String(a.user.id)];if(bu){bu.mt=Date.now();mark();if(out&&typeof out==='object'&&!Array.isArray(out)&&(url==='/api/load'||url==='/api/save'||Date.now()-(bu.bt||0)>15e3))out.bk=bkMake(bu)}return send(res,200,out)}
if(req.method==='GET'&&url==='/admin/balance'){const q=new URLSearchParams(req.url.split('?')[1]||'');const key=ENV.ADMIN_KEY||'';if(!(key?q.get('key')===key:DEV))return send(res,403,{error:'key'});const R=balReport();if(q.get('json'))return send(res,200,R);res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width"><title>Crystal Forge · баланс</title><pre style="font:14px/1.5 ui-monospace,monospace;padding:16px;white-space:pre-wrap">'+balText(R).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))+'</pre>')}
if(req.method==='GET'&&url==='/health')return send(res,200,{ok:true,users:Object.keys(db.users).length});
if(req.method==='GET')return serveStatic(req,res);
send(res,404,{error:'not found'})
}catch(e){send(res,e.code||500,{error:e.message})}
});
setInterval(()=>{try{seasonTick();bossTick();expTick()}catch(e){console.error('tick',e.message)}},60e3);
async function poll(){let off=0;const d=await tg('deleteWebhook',{drop_pending_updates:false});console.log('bot: long polling',d.ok?'ok':JSON.stringify(d));for(;;){const r=await tg('getUpdates',{offset:off,timeout:50,allowed_updates:['message','pre_checkout_query']});if(r&&r.ok){for(const up of r.result){off=up.update_id+1;try{await onUpdate(up)}catch(e){console.error('update',e.message)}}}else{if(r&&r.error_code===409)await tg('deleteWebhook',{drop_pending_updates:false});await new Promise(ok=>setTimeout(ok,3000))}}}
async function botSetup(){if(!TOKEN)return;const me=await tg('getMe');if(me.ok&&me.result&&me.result.username){CONFIG.bot=me.result.username;console.log('bot: @'+CONFIG.bot)}else console.error('bot: getMe',JSON.stringify(me));
  if(!WEB_OK){const mb=await tg('getChatMenuButton',{});if(mb.ok&&mb.result&&mb.result.type==='web_app'&&mb.result.web_app)setWeb(mb.result.web_app.url)}
  let hook=false;if(BOT_MODE==='webhook'&&WEB_OK){const w=await tg('setWebhook',{url:`${WEBAPP_URL}/bot/${SECRET}`,allowed_updates:['message','pre_checkout_query'],drop_pending_updates:false});hook=!!w.ok;console.log('setWebhook',w.ok?'ok':JSON.stringify(w))}
  if(WEB_OK)await tg('setChatMenuButton',{menu_button:{type:'web_app',text:'Играть',web_app:{url:WEBAPP_URL}}});else console.error('WEBAPP_URL не задан или не https: кнопки web_app недоступны');
  await tg('setMyCommands',{commands:[{command:'start',description:'Открыть игру'},{command:'paysupport',description:'Помощь по оплате'}]});
  for(const id of new Set([...OWNERS,...db.admins]))await tg('setMyCommands',{scope:{type:'chat',chat_id:+id},commands:[{command:'admin',description:'CRM и админ-панель'},{command:'backup',description:'Бэкап базы'},{command:'start',description:'Открыть игру'},{command:'stats',description:'Статистика'},{command:'user',description:'Карточка игрока'},{command:'give',description:'Выдать ресурсы'},{command:'free',description:'Бесплатные покупки за звёзды'}]});
  if(!hook)poll()}
ghInit().finally(()=>server.listen(PORT,()=>{try{seasonTick();bossTick();expTick()}catch(e){}console.log(`Crystal Forge запущен на порту ${PORT}${DEV?' (DEV)':''}`);botSetup().catch(e=>console.error('bot',e.message))}));
