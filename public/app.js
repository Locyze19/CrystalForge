const TG=window.Telegram&&window.Telegram.WebApp?window.Telegram.WebApp:null;
const IN_TG=!!(TG&&TG.initData);
if(TG&&TG.initDataUnsafe&&TG.initDataUnsafe.start_param==='crm'&&!/admin\.html/.test(location.pathname))location.replace('/admin.html'+location.search+location.hash);
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const now=()=>Date.now();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const KEY='cf_state';

const LEVELS=[{n:'Искра',at:0},{n:'Новичок',at:5e4},{n:'Шахтёр',at:5e5},{n:'Огранщик',at:5e6},{n:'Мастер',at:5e7},{n:'Ювелир',at:5e8},{n:'Магнат',at:5e9},{n:'Легенда',at:6e10},{n:'Титан',at:8e11},{n:'Бог кристаллов',at:1e13}];
const SKINS=[{id:'amethyst',name:'Аметист',hue:270},{id:'emerald',name:'Изумруд',hue:150,lvl:3},{id:'ruby',name:'Рубин',hue:350,lvl:5},{id:'sapphire',name:'Сапфир',hue:212,lvl:7},{id:'gold',name:'Золото',hue:44,stars:50},{id:'rainbow',name:'Призма',hue:300,stars:150,rainbow:true}];
const TAP_UPS=[
  {id:'tap',name:'Мощный удар',m:'tap',base:50,mult:1.55,desc:'+1 к силе удара'},
  {id:'energy',name:'Масляный фонарь',m:'energy',base:120,mult:1.5,desc:'+250 к запасу энергии'},
  {id:'regen',name:'Кузнечные меха',m:'regen',base:300,mult:1.8,max:15,desc:'+0,1 энергии в секунду'},
  {id:'crit',name:'Огранка',m:'crit',base:2500,mult:2.2,max:20,desc:'+1% шанс критического удара x6'}
];
const MINERS=[{id:'m1',name:'Гном-рудокоп',base:100,pps:1},{id:'m2',name:'Паровой бур',base:1100,pps:8},{id:'m3',name:'Лавовая вагонетка',base:12000,pps:47},{id:'m4',name:'Глубинная штольня',base:130000,pps:260},{id:'m5',name:'Кузня под горой',base:1.4e6,pps:1400},{id:'m6',name:'Плавильная печь',base:2e7,pps:7800},{id:'m7',name:'Врата Подгорного царства',base:3.3e8,pps:44000}].map(m=>Object.assign(m,{mult:1.15,m:m.id,miner:true}));
const MILES=[10,25,50,100,200];
const SHOP=[{id:'starter',name:'Стартовый набор',stars:25,desc:'50 000 кристаллов и ускоритель x2 на час',once:true,hot:true},{id:'refill',name:'Полная энергия',stars:5,desc:'Мгновенно заполнить энергию'},{id:'boost2',name:'Кирка-ускоритель x2',stars:15,desc:'x2 к ударам и добыче на 1 час'},{id:'boost3',name:'Гномий раж x3',stars:75,desc:'x3 ко всей добыче на 24 часа'},{id:'vault',name:'Хранилище',stars:39,desc:'Офлайн-доход копится до 12 часов',once:true},{id:'bag',name:'Сундук кристаллов',stars:99,desc:'4 часа пассивного дохода, минимум 250 000'}];
const DAILY=[500,1000,2500,5000,10000,25000,50000];
const DMIN=[5,10,15,20,30,45,60];
const dailyVal=(i,m)=>Math.round((DAILY[i]*level()+basePps()*DMIN[i]*60)*(1+itemFx('daily'))*m*accK());
const accK=()=>Math.max(1,+CFG.acK||1);
const kTxt=()=>accK()>1?` · x${String(accK()).replace('.',',')}`:'';
const refReward=()=>Math.round(Math.max(25000*level()*level(),basePps()*1800)*accK());
const taskR=t=>Math.round(t.reward*accK());
const achR=a=>Math.round(a.r*accK());
const TASKS=[
  {id:'ref1',name:'Пригласи друга',ic:'users',reward:10000,check:()=>S.refCount>=1,prog:()=>Math.min(S.refCount,1)+'/1'},
  {id:'ref5',name:'Пригласи 5 друзей',ic:'users',reward:75000,check:()=>S.refCount>=5,prog:()=>Math.min(S.refCount,5)+'/5'},
  {id:'lvl3',name:'Достигни 3 уровня',ic:'trophy',reward:20000,check:()=>level()>=3,prog:()=>Math.min(level(),3)+'/3'},
  {id:'ups10',name:'Купи 10 улучшений',ic:'wrench',reward:15000,check:()=>totalUps()>=10,prog:()=>Math.min(totalUps(),10)+'/10'},
  {id:'taps1k',name:'Сделай 1000 ударов',ic:'tap',reward:10000,check:()=>S.taps>=1000,prog:()=>Math.min(S.taps,1000)+'/1000'},
  {id:'lvl5',name:'Достигни 5 уровня',ic:'trophy',reward:250000,check:()=>level()>=5,prog:()=>Math.min(level(),5)+'/5'}
];
const ACH=[
  {id:'t100',n:'Первые искры',d:'Сделай 100 ударов',ic:'tap',r:1000,c:()=>S.taps>=100},
  {id:'t10k',n:'Тяжёлая рука',d:'Сделай 10 000 ударов',ic:'tap',r:50000,c:()=>S.taps>=1e4},
  {id:'t100k',n:'Кузнечный молот',d:'Сделай 100 000 ударов',ic:'anvil',r:2e6,c:()=>S.taps>=1e5},
  {id:'g1',n:'Первая жила',d:'Добудь 100 000 за всё время',ic:'gem',r:5000,c:()=>S.total>=1e5},
  {id:'g2',n:'Рудник',d:'Добудь 10 млн за всё время',ic:'gem',r:250000,c:()=>S.total>=1e7},
  {id:'g3',n:'Месторождение',d:'Добудь 1 млрд за всё время',ic:'gem',r:2e7,c:()=>S.total>=1e9},
  {id:'cr',n:'Точный удар',d:'Нанеси 50 критических ударов',ic:'target',r:20000,c:()=>S.st.crits>=50},
  {id:'oh',n:'Раскалённый горн',d:'Перегрей горн 25 раз',ic:'flame',r:30000,c:()=>S.st.overheat>=25},
  {id:'me1',n:'Ловец светлячков',d:'Поймай 5 светлячков',ic:'meteor',r:25000,c:()=>S.st.meteors>=5},
  {id:'me2',n:'Повелитель светлячков',d:'Поймай 25 светлячков',ic:'meteor',r:300000,c:()=>S.st.meteors>=25},
  {id:'fr',n:'Ярость кузнеца',d:'Войди в Ярость 3 раза',ic:'bolt',r:40000,c:()=>S.st.frenzy>=3},
  {id:'mi1',n:'Бригадир',d:'Найми 50 добытчиков',ic:'users',r:60000,c:()=>minersOwned()>=50},
  {id:'mi2',n:'Индустриализация',d:'Найми 250 добытчиков',ic:'chart',r:5e6,c:()=>minersOwned()>=250},
  {id:'rf',n:'Перерождение',d:'Соверши перековку',ic:'refresh',r:0,c:()=>S.st.reforge>=1},
  {id:'dy',n:'Неделя у горна',d:'Забирай награду 7 дней подряд',ic:'calendar',r:100000,c:()=>S.streak>=7},
  {id:'cf1',n:'Ремесленник',d:'Создай первую вещь в горниле',ic:'anvil',r:5000,c:()=>itemsOwned()>=1},
  {id:'cf2',n:'Полный арсенал',d:'Создай все вещи горнила',ic:'trophy',r:5e6,c:()=>itemsOwned()>=ITEMS.length},
  {id:'sk',n:'Коллекционер',d:'Открой 3 кристалла',ic:'star',r:75000,c:()=>S.owned.length>=3},
  {id:'rl1',n:'Хранитель реликвий',d:'Найди 5 реликвий',ic:'star',r:50000,c:()=>relicsOwned()>=5},
  {id:'rl2',n:'Музей кузни',d:'Собери все реликвии',ic:'trophy',r:1e7,c:()=>relicsOwned()>=RELICS.length},
  {id:'ar1',n:'Артефактор',d:'Создай 3 артефакта',ic:'anvil',r:5e5,c:()=>artsOwned()>=3},
  {id:'rl3',n:'Великий собиратель',d:'Собери все наборы реликвий',ic:'trophy',r:5e7,c:()=>RSETS.every(s=>setDone(s.id))},
  {id:'gr1',n:'Легенда кузни',d:'Получи легендарный предмет',ic:'gem',r:1e6,c:()=>S.inv.some(g=>g.r===4)},
  {id:'gr2',n:'Мастер заточки',d:'Улучши предмет до +8',ic:'up',r:3e6,c:()=>S.inv.some(g=>g.l>=8)},
  {id:'pv1',n:'Гладиатор',d:'Победи 10 раз на арене',ic:'target',r:2e5,c:()=>(S.st.pvw||0)>=10},
  {id:'pv2',n:'Золотая лига',d:'Достигни рейтинга 1300 на арене',ic:'trophy',r:3e6,c:()=>(S.st.pvbest||0)>=1300}
];
const MATS=[{id:'ore',n:'Руда',c:'#c87a4a'},{id:'coal',n:'Уголь',c:'#6a625d'},{id:'quartz',n:'Кварц',c:'#cfe8ff'},{id:'ember',n:'Жар-камень',c:'#ff5a1e'},{id:'star',n:'Светопыль',c:'#b48cff'}];
const MAT=Object.fromEntries(MATS.map(m=>[m.id,m]));
const ITEMS=[
  {id:'tongs',n:'Клещи мастера',d:'+15% к силе удара',ic:'tongs',need:{ore:25,coal:10},c:1500,fx:{tap:.15}},
  {id:'furnace',n:'Угольная печь',d:'+15% к добыче добытчиков',ic:'furnace',need:{ore:40,coal:45},c:6000,fx:{pps:.15}},
  {id:'lens',n:'Кварцевая линза',d:'+3% к шансу крита',ic:'lens',need:{quartz:12,ore:30},c:2e4,fx:{crit:.03}},
  {id:'cell',n:'Жаровой аккумулятор',d:'+300 к запасу энергии',ic:'bolt',need:{coal:70,quartz:15},c:4e4,fx:{en:300}},
  {id:'fhammer',n:'Огненный молот',d:'Крит бьёт x8 вместо x6',ic:'hammer',need:{ember:10,ore:90,quartz:20},c:15e4,fx:{critx:2}},
  {id:'compass',n:'Рудный компас',d:'Светлячки прилетают на 35% чаще',ic:'compass',need:{star:5,quartz:30},c:3e5,fx:{met:.35}},
  {id:'amulet',n:'Амулет горна',d:'Горн остывает на 40% медленнее',ic:'amulet',need:{ember:20,star:4},c:6e5,fx:{cool:.4}},
  {id:'crown',n:'Корона кузнеца',d:'+25% ко всей добыче',ic:'crown',need:{ember:35,star:12,quartz:60},c:25e5,fx:{all:.25}}
];
const CONS=[
  {id:'elixir',n:'Эликсир бодрости',d:'Полностью восстанавливает энергию',ic:'potion',need:{coal:12,quartz:3}},
  {id:'scroll',n:'Свиток ярости',d:'Ярость x5 на 20 секунд',ic:'scroll',need:{ember:4,star:1}},
  {id:'ingot',n:'Слиток удачи',d:'Буст добычи x2 на 10 минут',ic:'ingot',need:{ore:30,coal:20,ember:2}}
];
const RELICS=[
  {id:'nail',set:'forge',r:1,n:'Кованый гвоздь',d:'+3% к силе удара',ic:'nail',fx:{tap:.03}},
  {id:'chisel',set:'forge',r:1,n:'Старое зубило',d:'+3% к силе удара',ic:'chisel',fx:{tap:.03}},
  {id:'seal',set:'forge',r:2,n:'Печать цеха',d:'+1% к шансу крита',ic:'seal',fx:{crit:.01}},
  {id:'heart',set:'forge',r:3,n:'Сердце горна',d:'Горн остывает на 10% медленнее',ic:'flame',fx:{cool:.1}},
  {id:'helmet',set:'deep',r:1,n:'Каска шахтёра',d:'+3% к добыче добытчиков',ic:'helmet',fx:{pps:.03}},
  {id:'lamp',set:'deep',r:1,n:'Фонарь глубин',d:'+100 к запасу энергии',ic:'lantern',fx:{en:100}},
  {id:'map',set:'deep',r:2,n:'Карта жил',d:'+5% к добыче добытчиков',ic:'scroll',fx:{pps:.05}},
  {id:'geode',set:'deep',r:3,n:'Жеода',d:'+5% ко всей добыче',ic:'gem',fx:{all:.05}},
  {id:'shard',set:'sky',r:1,n:'Крылышко светлячка',d:'Светлячки на 5% чаще',ic:'gem',fx:{met:.05}},
  {id:'eye',set:'sky',r:2,n:'Глаз пещерника',d:'+1% к шансу крита',ic:'eye',fx:{crit:.01}},
  {id:'chron',set:'sky',r:2,n:'Летопись штолен',d:'Светлячки на 5% чаще',ic:'calendar',fx:{met:.05}},
  {id:'core',set:'sky',r:3,n:'Сердце самоцвета',d:'+8% ко всей добыче',ic:'gem',fx:{all:.08}},
  {id:'vshard',set:'void',r:1,n:'Осколок пустоты',d:'Крит сильнее на x0.5',ic:'gem',fx:{critx:.5}},
  {id:'vmask',set:'void',r:1,n:'Маска тени',d:'+1% к шансу крита',ic:'eye',fx:{crit:.01}},
  {id:'vring',set:'void',r:2,n:'Кольцо разлома',d:'Ярость длится на 25% дольше',ic:'ring',fx:{frz:.25}},
  {id:'vheart',set:'void',r:3,n:'Сердце бездны',d:'Крит сильнее на x1, горн остывает на 10% медленнее',ic:'flame',fx:{critx:1,cool:.1}},
  {id:'rcoin',set:'ruins',r:1,n:'Древняя монета',d:'Материалы выпадают на 10% чаще',ic:'ingot',fx:{mat:.1}},
  {id:'rtab',set:'ruins',r:1,n:'Глиняная табличка',d:'+1 ч к офлайн-добыче',ic:'calendar',fx:{off:1}},
  {id:'rgolem',set:'ruins',r:2,n:'Голова голема',d:'+1 к восстановлению энергии',ic:'users',fx:{regen:1}},
  {id:'rrune',set:'ruins',r:3,n:'Руна мастера',d:'Материалы на 25% чаще, +5% к добыче',ic:'scroll',fx:{mat:.25,pps:.05}},
  {id:'qcup',set:'royal',r:1,n:'Кубок пира',d:'Ежедневная награда +10%',ic:'trophy',fx:{daily:.1}},
  {id:'qseal',set:'royal',r:1,n:'Королевская печать',d:'+150 к запасу энергии',ic:'seal',fx:{en:150}},
  {id:'qorb',set:'royal',r:2,n:'Держава',d:'Каждый осколок даёт +1% сверху',ic:'refresh',fx:{shard:.01}},
  {id:'qcrown',set:'royal',r:3,n:'Венец династии',d:'+10% ко всей добыче, ежедневка +25%',ic:'crown',fx:{all:.1,daily:.25}}
];
const RSETS=[
  {id:'forge',n:'Наследие кузни',d:'+15% к силе удара и +2% к криту',fx:{tap:.15,crit:.02}},
  {id:'deep',n:'Дары глубин',d:'+20% к добыче, реликвии находятся в 1.5 раза чаще',fx:{pps:.2,luck:.5}},
  {id:'sky',n:'Светлячковый грот',d:'+10% ко всей добыче, светлячки на 15% чаще',fx:{all:.1,met:.15}},
  {id:'void',n:'Осколки бездны',d:'+3% к криту, крит сильнее на x1',fx:{crit:.03,critx:1}},
  {id:'ruins',n:'Древние руины',d:'+3 ч офлайн-добычи, материалы на 30% чаще',fx:{off:3,mat:.3}},
  {id:'royal',n:'Королевская казна',d:'Осколки +2% сверху, ежедневка +50%, +5% ко всей добыче',fx:{shard:.02,daily:.5,all:.05}}
];
const RSRC={forge:'удары',deep:'удары',sky:'светлячки',void:'криты при перегреве',ruins:'создание в горниле',royal:'ежедневки и перековка'};
const TR=25;
const ARTS=[
  {id:'aanvil',n:'Наковальня предков',d:'+30% к силе удара',ic:'anvil',rel:{nail:2,chisel:2},need:{ore:60},e:20,fx:{tap:.3}},
  {id:'adrill',n:'Бур глубин',d:'+30% к добыче добытчиков',ic:'chart',rel:{helmet:2,map:1},need:{coal:60},e:30,fx:{pps:.3}},
  {id:'aastro',n:'Рудный фонарь',d:'Светлячки на 30% чаще, Ярость на 50% дольше',ic:'meteor',rel:{shard:2,chron:1},need:{star:6},e:40,fx:{met:.3,frz:.5}},
  {id:'aprism',n:'Призма бездны',d:'+3% к криту, крит сильнее на x2',ic:'target',rel:{vshard:2,vmask:1},need:{ember:15},e:50,fx:{crit:.03,critx:2}},
  {id:'atablet',n:'Скрижаль времени',d:'+6 ч офлайн-добычи, +2 к восстановлению энергии',ic:'calendar',rel:{rtab:2,rcoin:1},need:{quartz:25},e:50,fx:{off:6,regen:2}},
  {id:'asceptre',n:'Скипетр казны',d:'Ежедневка x1.5, осколки +2% сверху',ic:'trophy',rel:{qcup:2,qseal:1},e:60,fx:{daily:.5,shard:.02}},
  {id:'agrail',n:'Грааль кузни',d:'+50% ко всей добыче, реликвии в 2 раза чаще',ic:'star',all:true,rel:{heart:1,geode:1,core:1},e:200,fx:{all:.5,luck:1}}
];
const canArt=a=>!S.arts[a.id]&&S.ess>=a.e&&Object.entries(a.rel||{}).every(([k,v])=>(S.relics[k]||0)>v)&&Object.entries(a.need||{}).every(([k,v])=>(S.mats[k]||0)>=v)&&(!a.all||RSETS.every(s=>setDone(s.id)));
const artsOwned=()=>ARTS.filter(x=>S.arts[x.id]).length;
function craftArt(id){const x=ARTS.find(q=>q.id===id);if(!x)return;if(!canArt(x)){snd.error();hap('error');toast('Не хватает реликвий, материалов или эссенции');return}
  S.ess-=x.e;for(const[k,v]of Object.entries(x.rel||{}))S.relics[k]-=v;for(const[k,v]of Object.entries(x.need||{}))S.mats[k]-=v;S.arts[id]=1;snd.buy();hap('success');
  modal({vis:thumb('m5'),k:'Артефакт',t:x.n,x:`Создан навсегда. Бонус: <b>${x.d}</b>.`});renderCraft();persist()}
function transmute(sid){if(S.ess<TR){snd.error();hap('error');toast('Не хватает эссенции');return}S.ess-=TR;gainRelic([sid]);renderCraft();persist()}
const GR=['Обычный','Необычный','Редкий','Эпический','Легендарный'],GC=['#9a8f88','#6fd08c','#5aa9ff','#c58bff','#ffb340'],GM=[1,1.6,2.5,4,7],GW=[60,25,10,4,1],INV_MAX=40;
const GSLOT={tool:'Инструмент',ring:'Кольцо',amul:'Амулет',charm:'Талисман'};
const GEAR=[
  {id:'ham',s:'tool',n:'Молот',ic:'anvil',k:'tap',v:.05,d:'к силе удара'},
  {id:'pick',s:'tool',n:'Кирка',ic:'wrench',k:'pps',v:.05,d:'к добыче добытчиков'},
  {id:'tongs',s:'tool',n:'Клещи',ic:'target',k:'crit',v:.005,d:'к шансу крита'},
  {id:'rheat',s:'ring',n:'Кольцо жара',ic:'flame',k:'cool',v:.03,d:'к медленному остыванию'},
  {id:'rluck',s:'ring',n:'Кольцо удачи',ic:'gem',k:'mat',v:.05,d:'к шансу материалов'},
  {id:'rstorm',s:'ring',n:'Кольцо искр',ic:'meteor',k:'met',v:.04,d:'к частоте светлячков'},
  {id:'aearth',s:'amul',n:'Амулет недр',ic:'star',k:'all',v:.03,d:'ко всей добыче'},
  {id:'avolt',s:'amul',n:'Амулет искр',ic:'bolt',k:'en',v:40,d:'к запасу энергии'},
  {id:'afury',s:'amul',n:'Амулет ярости',ic:'clock',k:'frz',v:.06,d:'к длительности Ярости'},
  {id:'chis',s:'tool',n:'Зубило',ic:'tap',k:'critx',v:.2,d:'к множителю крита'},
  {id:'rstar',s:'ring',n:'Кольцо жилы',ic:'star',k:'shard',v:.005,d:'к силе каждого осколка'},
  {id:'asun',s:'amul',n:'Амулет солнца',ic:'up',k:'daily',v:.08,d:'к ежедневной награде'},
  {id:'cfox',s:'charm',n:'Лисий хвост',ic:'eye',k:'luck',v:.08,d:'к шансу реликвий и редкости'},
  {id:'cglass',s:'charm',n:'Песочные часы',ic:'clock',k:'off',v:.5,d:'ч офлайн-добычи'},
  {id:'cgolem',s:'charm',n:'Сердце голема',ic:'users',k:'regen',v:.3,d:'к восстановлению энергии'},
  {id:'cmerch',s:'charm',n:'Монета торговца',ic:'bag',k:'mat',v:.06,d:'к шансу материалов'}
];
const GB=Object.fromEntries(GEAR.map(g=>[g.id,g]));
const gearVal=g=>GB[g.b].v*GM[g.r]*(1+.15*g.l);
const gText=g=>{const b=GB[g.b],v=gearVal(g);return b.k==='en'?`+${Math.round(v)} ${b.d}`:['off','regen','critx'].includes(b.k)?`+${+v.toFixed(2)} ${b.d}`:`+${+(v*100).toFixed(1)}% ${b.d}`};
const gName=g=>`${GB[g.b].n}${g.l?' +'+g.l:''}`;
const gMax=g=>4+g.r*2;
const gFind=u=>S.inv.find(g=>g.u===+u);
const chestCost=()=>5000*level()*level();
const gSellVal=g=>Math.round(chestCost()*[.1,.25,.6,1.5,4][g.r]*(1+.3*g.l));
const gUpCost=g=>({c:Math.round(chestCost()*.3*(g.l+1)*(g.r+1)),m:[['ore',5*(g.l+1)],...(g.l>=3?[['quartz',g.l-2]]:[]),...(g.l>=6?[['ember',g.l-5]]:[])]});
const gEsc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function gearFx(k){if(!S||!S.inv||!S.eq)return 0;let a=0;for(const s in S.eq){const g=S.inv.find(x=>x.u===S.eq[s]);if(g&&GB[g.b]&&GB[g.b].k===k)a+=gearVal(g)}return a}
function rollGear(minR=0){const L=itemFx('luck');const w=GW.map((x,i)=>i<minR?0:x*(i?1+L:1));let t=w.reduce((a,b)=>a+b)*Math.random(),r=0;for(;r<4;r++){t-=w[r];if(t<=0)break}return{b:GEAR[Math.random()*GEAR.length|0].id,r,l:0}}
function addGear(it,x,y,quiet){if(!GB[it.b])return null;if(S.inv.length>=INV_MAX){const v=gSellVal(it);S.coins+=v;toast(`Инвентарь полон: ${GB[it.b].n} продан за ${fmt(v)}`);return null}
  const g={u:++S.gid,b:it.b,r:it.r,l:it.l||0};S.inv.push(g);if(!quiet){if(x!=null)float(x,y-80,GB[g.b].n,false,'mat');toast(`${GR[g.r]}: ${gName(g)} — ${gText(g)}`);if(g.r>=3){snd.level();hap('success')}}dirty=true;return g}
function gearDel(g){S.inv=S.inv.filter(x=>x!==g);for(const s in S.eq)if(S.eq[s]===g.u)delete S.eq[s]}
const gTile=g=>`<button class="gi${Object.values(S.eq).includes(g.u)?' eq':''}${g.sid?' tr':''}" style="--gc:${GC[g.r]}" data-gi="${g.u}" title="${GR[g.r]} · ${gName(g)}">${ic(GB[g.b].ic)}<span class="mono">${g.l?'+'+g.l:''}</span></button>`;
function renderGear(){
  $('#gearSlots').innerHTML=Object.keys(GSLOT).map(s=>{const g=S.inv.find(x=>x.u===S.eq[s]);return`<div class="gslot"${g?` style="--gc:${GC[g.r]}" data-gi="${g.u}"`:''}><span class="gs-i">${g?ic(GB[g.b].ic):ic('lock')}</span><span class="gs-n">${g?gName(g):GSLOT[s]}</span><span class="gs-d">${g?gText(g):'Пусто'}</span></div>`}).join('');
  $('#invCount').textContent=`${S.inv.length} / ${INV_MAX}`;
  $('#invList').innerHTML=S.inv.length?[...S.inv].sort((a,b)=>b.r-a.r||b.l-a.l).map(gTile).join(''):'<div class="inv-e">Предметы выпадают с ударов, светлячков, ежедневок и из сундуков</div>';
  $('#chestBtn').innerHTML=`${ic('bag')}Сундук · ${fmt(chestCost())}`;$('#chestBtn').classList.toggle('off',S.coins<chestCost());$('#vchestBtn').innerHTML=`${ic('gem')}Торговый · ${VCH} жет.`;$('#vchestBtn').classList.toggle('off',(S.tok||0)<VCH);$('#invCount').textContent=`${S.inv.length} / ${INV_MAX} · ${S.tok||0} жет.`}
function openGear(u){const g=gFind(u);if(!g){closeSheet();return}const b=GB[g.b],eqd=S.eq[b.s]===g.u,mx=g.l>=gMax(g);let act;
  if(g.sid){const c=upTok(g);act=`${mx?'<div class="gd-h">Максимальный уровень</div>':`<button class="btn${(S.tok||0)>=c?'':' off'}" data-gup="${g.u}">${ic('up')}Улучшить · ${c} жет.</button>`}<button class="btn ghost" data-gsell="${g.u}">Продать в лавку · ${sellTok(g)} жет.</button><div class="gd-m"><input id="gPrice" type="number" min="1" max="1000000" inputmode="numeric" value="${sellTok(g)*3}"><button class="btn" data-glist="${g.u}">На рынок</button></div><div class="gd-h">Торговый предмет хранится на сервере. Цена в жетонах, комиссия рынка 5%.</div>`}
  else{const c=gUpCost(g),ok=S.coins>=c.c&&c.m.every(([k,v])=>(S.mats[k]||0)>=v);act=`${mx?'<div class="gd-h">Максимальный уровень</div>':`<button class="btn${ok?'':' off'}" data-gup="${g.u}">${ic('up')}Улучшить · ${fmt(c.c)}</button><div class="rec">${c.m.map(([k,v])=>`<span class="rc${(S.mats[k]||0)>=v?' ok':''}"><i class="md" style="--c:${MAT[k].c}"></i>${v} ${MAT[k].n}</span>`).join('')}</div>`}<button class="btn ghost" data-gsell="${g.u}">Продать в лавку · ${fmt(gSellVal(g))}</button><div class="gd-h">Привязанный предмет: на рынок выставить нельзя. Торговые предметы дают ежедневка и торговый сундук.</div>`}
  sheet(`<div class="gd" style="--gc:${GC[g.r]}"><div class="gd-i">${ic(b.ic)}</div><div class="gd-k mono">${GR[g.r]} · ${GSLOT[b.s]}${g.sid?' · торговый':''}</div><h3 id="shTitle">${gName(g)}</h3><div class="gd-v">${gText(g)}</div><div class="gd-l mono">Уровень ${g.l} / ${gMax(g)}</div></div><div class="gd-a"><button class="btn${eqd?' ghost':''}" data-geq="${g.u}">${eqd?'Снять':'Надеть'}</button>${act}</div>`)}
function gearEquip(u){const g=gFind(u);if(!g)return;const s=GB[g.b].s;if(S.eq[s]===g.u)delete S.eq[s];else S.eq[s]=g.u;hap('light');dirty=true;renderGear();persist();openGear(u)}
async function gearUp(u){const g=gFind(u);if(!g||g.l>=gMax(g))return;
  if(g.sid){try{await vCall('/api/vup',{id:g.sid});snd.level();hap('success');const n=gFind(u);if(n)toast(`${gName(n)}: ${gText(n)}`);openGear(u)}catch(e){snd.error();vErr(e)}return}
  const c=gUpCost(g);if(S.coins<c.c||!c.m.every(([k,v])=>(S.mats[k]||0)>=v)){snd.error();hap('error');toast('Не хватает кристаллов или материалов');return}
  S.coins-=c.c;c.m.forEach(([k,v])=>S.mats[k]-=v);g.l++;snd.level();hap('success');toast(`${gName(g)}: ${gText(g)}`);dirty=true;renderCraft();persist();openGear(u)}
async function gearSell(u){const g=gFind(u);if(!g)return;
  if(g.sid){try{const r=await vCall('/api/vsell',{id:g.sid});snd.coin();toast(`+${r.tok} жетонов`);closeSheet()}catch(e){vErr(e)}return}
  const v=gSellVal(g);gearDel(g);S.coins+=v;snd.coin();toast(`Продано за ${fmt(v)}`);dirty=true;renderCraft();persist();closeSheet()}
function buyChest(){const c=chestCost();if(S.coins<c){snd.error();hap('error');toast('Не хватает кристаллов');return}if(S.inv.length>=INV_MAX){toast('Инвентарь полон');return}S.coins-=c;const g=addGear(rollGear());snd.buy();renderCraft();persist();if(g)openGear(g.u)}
async function vChest(){if((S.tok||0)<VCH){snd.error();toast(`Нужно ${VCH} жетонов`);return}try{const r=await vCall('/api/vchest');snd.buy();const g=S.inv.find(x=>x.sid===r.item.id);if(g)openGear(g.u)}catch(e){vErr(e)}}
let mkData=[];
async function openMarket(){sheet(`<h3 id="shTitle">Рынок игроков</h3><div class="gd-h">Торговля идёт за жетоны, все сделки проверяет сервер. У тебя: <b id="mkTok">${S.tok||0}</b> жет.</div><div class="mk" id="mkList"><div class="inv-e">Загрузка…</div></div>`);try{const r=await vCall('/api/market');mkData=r.list||[];renderMarket()}catch(e){const el=$('#mkList');if(el)el.innerHTML='<div class="inv-e">Рынок недоступен без связи с сервером</div>'}}
function renderMarket(){const el=$('#mkList');if(!el)return;const tk=$('#mkTok');if(tk)tk.textContent=S.tok||0;const L=mkData.filter(m=>GB[m.it.b]);el.innerHTML=L.length?L.map(m=>{const g=m.it;return`<div class="mk-r" style="--gc:${GC[g.r]}"><span class="gs-i">${ic(GB[g.b].ic)}</span><div class="mk-b"><b>${gName(g)}</b><span>${GR[g.r]} · ${gText(g)}</span><span class="mono">${m.me?'Твой лот':gEsc(m.name)}</span></div>${m.me?`<button class="btn ghost" data-gun="${m.id}">Снять</button>`:`<button class="btn${(S.tok||0)>=m.p?'':' off'}" data-gbuy="${m.id}">${m.p} жет.</button>`}</div>`}).join(''):'<div class="inv-e">Лотов пока нет</div>'}
async function gearList(u){const g=gFind(u);if(!g)return;if(!g.sid){toast('Привязанный предмет нельзя продать на рынке');return}const p=Math.floor(+$('#gPrice').value);if(!(p>=1&&p<=1e6)){toast('Цена от 1 до 1 000 000 жетонов');return}try{await vCall('/api/mlist',{id:g.sid,p});toast('Лот выставлен');openMarket()}catch(e){vErr(e)}}
async function mBuy(id){const m=mkData.find(x=>x.id===id);if(!m)return;if((S.tok||0)<m.p){snd.error();hap('error');toast('Не хватает жетонов');return}
  try{await vCall('/api/mbuy',{id});mkData=mkData.filter(x=>x.id!==id);snd.buy();hap('success');toast('Предмет куплен');renderMarket()}catch(e){vErr(e);if(e.message==='404')openMarket()}}
async function mUnlist(id){try{await vCall('/api/munlist',{id});mkData=mkData.filter(x=>x.id!==id);toast('Лот снят, предмет вернулся');renderMarket()}catch(e){vErr(e)}}
const upTok=g=>(g.l+1)*(g.r+1)*2,sellTok=g=>[1,2,4,8,16][g.r],VCH=20,DT=[3,4,5,6,8,10,20];
const sDay=()=>Math.floor(Date.now()/864e5);
function vErr(e){toast({'402':'Не хватает жетонов','409':'Нельзя: инвентарь полон или уже сделано','404':'Предмет или лот не найден','429':'Не больше 10 лотов','400':'Некорректный запрос'}[e.message]||'Нет связи с сервером')}
async function vCall(p,b){const r=await API.post(p,b);if(r.vault)vSync(r.vault);persist();renderCraft();return r}
function vSync(v){if(!v||!Array.isArray(v.items))return;S.tok=v.tok;S.dd=v.d;S.streak=v.d.streak;const ids=new Set(v.items.map(x=>x.id));S.inv.filter(g=>g.sid&&!ids.has(g.sid)).forEach(gearDel);for(const it of v.items){if(!GB[it.b])continue;const g=S.inv.find(x=>x.sid===it.id);if(g){g.b=it.b;g.r=it.r;g.l=it.l}else S.inv.push({u:++S.gid,sid:it.id,b:it.b,r:it.r,l:it.l})}dirty=true;if(tab==='craft')renderGear();if(tab==='tasks')renderTasks()}
async function syncVault(){try{vSync(await API.post('/api/vault'))}catch(e){}}
function dInfo(){const d=S.dd||{last:-9,streak:0,shield:0},t=sDay(),can=d.last!==t,alive=d.last===t-1||(d.last===t-2&&d.shield>0),st=can?(alive?d.streak+1:1):d.streak;return{d,can,st,idx:(st-1)%7,w:Math.min(4,Math.floor((st-1)/7))}}
function renderDays(){const I=dInfo(),L=level(),m=1+.25*I.w;$('#days').innerHTML=DAILY.map((v,i)=>`<div class="day${i<I.idx||(!I.can&&i===I.idx)?' done':''}${I.can&&i===I.idx?' today':''}">Д${i+1}<b>${fmt(dailyVal(i,m))}</b><span class="day-x">${Math.round(DT[i]*m)}${ic('gem')}${[2,4,6].includes(i)?ic('bag'):''}</span></div>`).join('');$('#streakTxt').textContent=`Серия: ${I.d.streak} · неделя ${I.w+1} (x${m}) · щиты: ${I.d.shield}${accK()>1?` · прокачка x${String(accK()).replace('.',',')}`:''}`}
async function claimDaily(){if(!canDaily())return;const b=$('#dailyBtn');b.disabled=true;let r;try{r=await API.post('/api/daily')}catch(e){b.disabled=false;toast(e.message==='409'?'Награда уже получена сегодня':'Для ежедневки нужна связь с сервером');syncVault();return}
  vSync(r.vault);const idx=r.idx,w=r.w,mm=1+.25*w;S.lastDaily=now();const v=dailyVal(idx,mm);earn(v);const mt=[null,['coal',10],null,['quartz',6],null,['ember',4],['star',3]][idx];if(mt)addMat(mt[0],mt[1]*(1+w));addGear(rollGear(idx===6?3:0),null,null,true);if(idx===6)gainRelic(null);if(Math.random()<.25)gainRelic(['royal']);snd.coin();hap('success');
  const it=r.item?S.inv.find(x=>x.sid===r.item.id):null;modal({vis:thumb('bag'),k:`День ${idx+1} · неделя ${w+1}`,t:`+${fmt(v)} кристаллов`,x:`+${r.tok} жетонов${mt?`, +${mt[1]*(1+w)} ${MAT[mt[0]].n}`:''} и предмет в инвентарь${it?`<br>Торговый предмет: <b style="color:${GC[it.r]}">${GR[it.r]} · ${gName(it)}</b>`:''}${r.shieldUsed?'<br>Щит серии спас твою серию!':''}${idx===6?'<br>Неделя закрыта: реликвия и щит серии.':''}<br>Множитель недели: x${mm}`});renderTasks();persist()}
document.addEventListener('click',e=>{const t=e.target.closest('[data-gi],[data-geq],[data-gup],[data-gsell],[data-glist],[data-gbuy],[data-gun],#marketBtn,#chestBtn,#vchestBtn');if(!t)return;const d=t.dataset;
  if(d.gi)openGear(d.gi);else if(d.geq)gearEquip(d.geq);else if(d.gup)gearUp(d.gup);else if(d.gsell)gearSell(d.gsell);else if(d.glist)gearList(d.glist);else if(d.gbuy)mBuy(d.gbuy);else if(d.gun)mUnlist(d.gun);else if(t.id==='marketBtn')openMarket();else if(t.id==='chestBtn')buyChest();else if(t.id==='vchestBtn')vChest()});
const extraCopies=()=>RELICS.reduce((a,r)=>a+Math.max(0,(S.relics[r.id]||0)-1),0);
function dust(){let e=0;for(const r of RELICS){const c=S.relics[r.id]||0;if(c>1){e+=(c-1)*[0,2,5,12][r.r];S.relics[r.id]=1}}if(!e){toast('Нет лишних копий');return}S.ess+=e;snd.coin();hap('success');toast(`+${e} эссенции`);renderCraft();persist()}
const RC=['','#a89d95','#5aa9ff','#c58bff'],RN=['','Обычная','Редкая','Эпическая'];
const setDone=id=>RELICS.filter(r=>r.set===id).every(r=>S.relics[r.id]);
const relicsOwned=()=>RELICS.filter(r=>S.relics[r.id]).length;
const relicFx=k=>S&&S.relics?RELICS.reduce((a,r)=>S.relics[r.id]?a+(r.fx[k]||0):a,0)+RSETS.reduce((a,s)=>setDone(s.id)?a+(s.fx[k]||0):a,0)+ARTS.reduce((a,x)=>S.arts&&S.arts[x.id]?a+(x.fx[k]||0):a,0)+gearFx(k):0;
function rollRelic(sets){const pool=RELICS.filter(r=>!sets||sets.includes(r.set));const w=r=>[0,6,3,1][r.r];let t=pool.reduce((a,r)=>a+w(r),0)*Math.random();for(const r of pool){t-=w(r);if(t<=0)return r}return pool[0]}
function gainRelic(sets,x,y){const r=rollRelic(sets),s=RSETS.find(q=>q.id===r.set);
  if(S.relics[r.id]){S.relics[r.id]++;const d=[null,['ore',15],['quartz',4],['star',2]][r.r];const e=[0,1,3,8][r.r];addMat(d[0],d[1]);S.ess+=e;toast(`Дубликат «${r.n}»: +${d[1]} ${MAT[d[0]].n}, +${e} эссенции`)}
  else{S.relics[r.id]=1;snd.level();hap('success');if(x!=null)float(x,y-56,r.n,false,'mat');if(setDone(s.id))modal({vis:thumb('crit'),k:'Коллекция собрана',t:s.n,x:`Бонус набора навсегда: <b>${s.d}</b>.`});else toast(`Реликвия: ${r.n} — ${r.d}`)}
  dirty=true;return r}
function renderRelics(){$('#relicCount').textContent=`${relicsOwned()} / ${RELICS.length}`;
  renderGear();const RL=Object.fromEntries(RELICS.map(r=>[r.id,r])),ex=extraCopies();
  $('#essBox').innerHTML=`<div class="ess-b"><b class="mono">${fmt(S.ess)}</b><span>Эссенция реликвий. Дубликаты дают эссенцию, лишние копии идут на артефакты или распыляются. Трансмутация за ${TR} даёт реликвию выбранного набора.</span></div><button class="buy${ex?'':' off'}" id="dustBtn">${ic('refresh')}Распылить ${ex}</button>`;
  $('#artCount').textContent=`${artsOwned()} / ${ARTS.length}`;
  $('#artList').innerHTML=ARTS.map((x,i)=>{const own=S.arts[x.id];const rec=[...Object.entries(x.rel||{}).map(([k,v])=>{const h=Math.max(0,(S.relics[k]||0)-1);return`<span class="rc${h>=v?' ok':''}">${ic(RL[k].ic)}${RL[k].n} ${Math.min(h,v)}/${v}</span>`}),...Object.entries(x.need||{}).map(([k,v])=>{const h=S.mats[k]||0;return`<span class="rc${h>=v?' ok':''}"><i class="md" style="--c:${MAT[k].c}"></i>${fmt(Math.min(h,v))}/${v}</span>`}),x.all?`<span class="rc${RSETS.every(s=>setDone(s.id))?' ok':''}">${ic('trophy')}Все наборы</span>`:'',`<span class="rc${S.ess>=x.e?' ok':''}">${ic('star')}${fmt(x.e)} эсс.</span>`].join('');return`<div class="row" style="--i:${i}">${vis(null,x.ic)}<div class="row-b"><div class="row-t">${x.n}</div><div class="row-d">${x.d}</div>${own?'':`<div class="rec">${rec}</div>`}</div>${own?`<span class="buy done">${ic('check')}</span>`:`<button class="buy${canArt(x)?'':' off'}" data-art="${x.id}">${ic('anvil')}Создать</button>`}</div>`}).join('');
  $('#relicList').innerHTML=RSETS.map(s=>{const rs=RELICS.filter(r=>r.set===s.id),n=rs.filter(r=>S.relics[r.id]).length;return`<div class="rset${n===rs.length?' done':''}"><div class="rset-h"><b>${s.n}</b><span class="mono">${n}/${rs.length}</span><button class="buy${S.ess>=TR?'':' off'}" data-trans="${s.id}">${ic('refresh')}${TR}</button></div><div class="rset-d">${n===rs.length?ic('check'):''}${s.d}</div><div class="rset-s">Источник: ${RSRC[s.id]}</div><div class="relics">${rs.map(r=>{const c=S.relics[r.id]||0;return`<div class="relic${c?'':' off'}" style="--rc:${RC[r.r]}"><span class="relic-i">${c?ic(r.ic):'?'}</span><span class="relic-n">${c?r.n:'???'}</span><span class="relic-d">${c?r.d:RN[r.r]}</span>${c>1?`<i class="relic-x mono">x${c}</i>`:''}</div>`}).join('')}</div></div>`}).join('')}
const itemFx=k=>ITEMS.reduce((a,it)=>S&&S.items&&S.items[it.id]?a+(it.fx[k]||0):a,0)+relicFx(k);
const itemsOwned=()=>ITEMS.filter(it=>S.items[it.id]).length;
const canCraft=it=>!(ITEMS.includes(it)&&S.items[it.id])&&S.coins>=(it.c||0)&&Object.entries(it.need).every(([k,v])=>(S.mats[k]||0)>=v);
const canAnyCraft=()=>ITEMS.some(canCraft);
function addMat(id,n){S.mats[id]=(S.mats[id]||0)+n}
function drop(crit,x,y){if(Math.random()<.002*(1+itemFx('luck')))gainRelic(['forge','deep'],x,y);if(Math.random()<.004*(1+itemFx('luck')))addGear(rollGear(),x,y);let m=null;const r=Math.random()/(1+itemFx('mat'));if(crit&&Math.random()<.35)m='ember';else if(r<.012)m='quartz';else if(r<.05)m='coal';else if(r<.11)m='ore';if(!m)return;addMat(m,1);float(x,y-34,'+1 '+MAT[m].n,false,'mat')}
function craft(id){const it=ITEMS.find(x=>x.id===id)||CONS.find(x=>x.id===id);if(!it)return;if(!canCraft(it)){snd.error();hap('error');toast('Не хватает материалов');return}
  for(const[k,v]of Object.entries(it.need))S.mats[k]-=v;S.coins-=it.c||0;snd.buy();hap('success');
  if(ITEMS.includes(it)){S.items[id]=1;gainRelic(Math.random()<.6?['ruins']:null);modal({vis:thumb('m5'),k:'Горнило',t:it.n,x:`Вещь создана. Бонус: <b>${it.d}</b>.`})}else{S.cons[id]=(S.cons[id]||0)+1;toast(`${it.n} создан`);if(Math.random()<.12)gainRelic(['ruins'])}
  renderCraft();persist()}
function useCons(id){const it=CONS.find(x=>x.id===id);if(!it||!(S.cons[id]>0))return;S.cons[id]--;
  if(id==='elixir')S.energy=maxEnergy();else if(id==='scroll'){S.frenzyUntil=Math.max(now(),S.frenzyUntil)+20e3*(1+itemFx('frz'));S.st.frenzy++}else if(id==='ingot')setBoost(2,6e5);
  snd.buy();hap('medium');toast(`${it.n}: ${it.d.toLowerCase()}`);renderCraft();persist()}
function renderCraft(){const tot=MATS.reduce((a,m)=>a+(S.mats[m.id]||0),0);$('#matTotal').textContent=fmt(tot);
  $('#matList').innerHTML=MATS.map(m=>`<div class="mat"><i class="md" style="--c:${m.c}"></i><div class="mat-b"><b class="mono">${fmt(S.mats[m.id]||0)}</b><span>${m.n}</span></div></div>`).join('');
  $('#itemCount').textContent=`${itemsOwned()} / ${ITEMS.length}`;
  const rec=r=>Object.entries(r.need).map(([k,v])=>{const h=S.mats[k]||0;return`<span class="rc${h>=v?' ok':''}"><i class="md" style="--c:${MAT[k].c}"></i>${fmt(Math.min(h,v))}/${v}</span>`}).join('')+(r.c?`<span class="rc${S.coins>=r.c?' ok':''}">${ic('gem')}${fmt(r.c)}</span>`:'');
  $('#itemList').innerHTML=ITEMS.map((it,i)=>{const own=S.items[it.id];return`<div class="row" style="--i:${i}">${vis(null,it.ic)}<div class="row-b"><div class="row-t">${it.n}</div><div class="row-d">${it.d}</div>${own?'':`<div class="rec">${rec(it)}</div>`}</div>${own?`<span class="buy done">${ic('check')}</span>`:`<button class="buy${canCraft(it)?'':' off'}" data-craft="${it.id}">${ic('anvil')}Создать</button>`}</div>`}).join('');
  $('#consList').innerHTML=CONS.map((it,i)=>{const n=S.cons[it.id]||0;return`<div class="row" style="--i:${i}">${vis(null,it.ic)}<div class="row-b"><div class="row-t">${it.n}${n?`<span class="tag">x${n}</span>`:''}</div><div class="row-d">${it.d}</div><div class="rec">${rec(it)}</div></div><div class="cons-a"><button class="buy${canCraft(it)?'':' off'}" data-craft="${it.id}">${ic('anvil')}Создать</button>${n?`<button class="buy star" data-use="${it.id}">Применить</button>`:''}</div></div>`}).join('');renderRelics()}
let FL=[];
const DEF={tut:0,tutV:0,tutSkip:0,tutT:0,vis:{},coins:0,total:0,energy:500,taps:0,ups:{},lastSeen:0,boostUntil:0,boostMult:1,streak:0,lastDaily:0,skin:'amethyst',owned:['amethyst'],tasks:{},refCount:0,vault:false,bought:{},refills:3,refillDay:'',v:2,shards:0,runStart:0,frenzyUntil:0,ach:{},st:{crits:0,overheat:0,meteors:0,frenzy:0,reforge:0,best:0,play:0,pvw:0,pvbest:0},set:{snd:true,mus:false,vib:true,fx:true},onb:0,mats:{},items:{},cons:{},matAcc:0,relics:{},ess:0,arts:{},inv:[],eq:{},gid:0};

let S=load();
let CFG={bot:'',app:'',bal:{}};const BL=k=>(CFG.bal&&+CFG.bal[k])||1;
let online=false,tab='game',bm='1',heat=0,lastTap=0,overheated=false,shown=0,dirty=true;
let forge=null,embers=null,sparks=null,viewer=null,viewerCv=null,th=null;
const snd=new Sound();

function merge(st){return Object.assign({},DEF,st,{ups:Object.assign({},st.ups||{}),vis:Object.assign({},st.vis||{}),tasks:Object.assign({},st.tasks||{}),bought:Object.assign({},st.bought||{}),ach:Object.assign({},st.ach||{}),st:Object.assign({},DEF.st,st.st||{}),set:Object.assign({},DEF.set,st.set||{}),mats:Object.assign({},st.mats||{}),items:Object.assign({},st.items||{}),cons:Object.assign({},st.cons||{}),relics:Object.assign({},st.relics||{}),arts:Object.assign({},st.arts||{}),inv:Array.isArray(st.inv)?st.inv.filter(g=>g&&GB[g.b]):[],eq:Object.assign({},st.eq||{}),owned:Array.isArray(st.owned)&&st.owned.length?st.owned.slice():['amethyst']})}
function load(){try{const r=JSON.parse(localStorage.getItem(KEY)||'null');return r?merge(r):merge({})}catch(e){return merge({})}}
function persist(){S.lastSeen=now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

const API={async post(p,b){const r=await fetch(p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({initData:TG?TG.initData:''},b||{}))});if(!r.ok)throw new Error(String(r.status));return r.json()}};
async function syncLoad(){try{const r=await API.post('/api/load');if(r.config)CFG=Object.assign(CFG,r.config);CFG.uid=r.uid;CFG.admin=!!r.admin;CFG.owner=!!r.owner;CFG.free=!!r.free;if(r.shopK)CFG.shopK=+r.shopK;if(r.acK)CFG.acK=+r.acK;if(r.state&&(r.force||(r.state.total||0)>S.total)){S=merge(r.state);dispCoins=S.coins;dirty=true;persist()}S.refCount=r.refCount||0;online=true;applyGrants(r.grants||[]);if(r.vault)vSync(r.vault);if(typeof r.pv==='number')pvUnseen=r.pv;admUi()}catch(e){online=false}}
async function syncSave(){if(!online)return;try{const r=await API.post('/api/save',{state:S});if(r&&r.fix){S=merge(r.fix);dispCoins=S.coins;dirty=true;persist()}}catch(e){}evFlush()}
async function claim(){if(!online)return;try{const r=await API.post('/api/claim');if(r.force){S=merge(r.force);dispCoins=S.coins;dirty=true;persist()}if(typeof r.admin==='boolean'&&r.admin!==!!CFG.admin){CFG.admin=r.admin;admUi()}if(typeof r.free==='boolean')CFG.free=r.free;if(r.shopK)CFG.shopK=+r.shopK;if(r.acK)CFG.acK=+r.acK;applyGrants(r.grants||[]);if(typeof r.refCount==='number')S.refCount=r.refCount;if(typeof r.pv==='number'){if(r.pv>pvUnseen&&tab==='friends')loadArena();pvUnseen=r.pv}}catch(e){}}
function applyGrants(list){for(const g of list){if(g.type==='coins'){earn(g.amount);if(g.reason==='pvp'||g.reason==='bosshit'||g.reason==='exp'||g.reason==='tower')continue;if(g.reason==='season'){modal({vis:thumb('crit'),k:`Сезон арены ${g.sn} завершён`,t:`${(PLG[g.lg]||PLG[0]).n} · ${g.r}`,x:`Место в сезоне: <b>${g.place}</b>. Награда: <b>${fmt(g.amount)}</b> кристаллов и <b>${g.tok}</b> жетонов. Рейтинг мягко сброшен к 1000 — начался новый сезон.`});continue}if(g.reason==='boss'){modal({vis:thumb('crit'),k:g.win?'Босс гильдии повержен':'Босс гильдии ушёл',t:g.name,x:`${g.win?'Гильдия победила':'Гильдия не успела за неделю'}. Твой вклад: <b>${fmt(g.dmg)}</b> урона, место ${g.place}. Награда: <b>${fmt(g.amount)}</b> кристаллов, <b>${g.tok}</b> жетонов${g.item?' и торговый предмет в хранилище':''}.`});continue}if(g.reason==='pvpdef'){toast(`Защита на арене удержана: +${fmt(g.amount)}`);continue}const t=g.reason==='ref'?'Новый мастер в гильдии':g.reason==='welcome'?'Подарок от друга':g.reason==='market'?'Предмет продан на рынке':'Награда';modal({vis:thumb('friends'),k:'Гильдия',t,x:`Начислено <b>${fmt(g.amount)}</b> кристаллов`})}else if(g.type==='item')applyItem(g.item,g.k)}if(list.length){persist();dirty=true}}

const fmt=n=>{n=Math.floor(n||0);if(n<1e5)return n.toLocaleString('ru-RU');const u=['K','M','B','T','Qa','Qi','Sx'];let i=-1;while(n>=1e3&&i<u.length-1){n/=1e3;i++}return(n>=100?n.toFixed(0):n>=10?n.toFixed(1):n.toFixed(2)).replace(/\.0+$/,'')+u[i]};
const fmtT=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`:`${m}:${String(x).padStart(2,'0')}`};
const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<10||h>=20)?b:c};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dayKey=t=>new Date(t).toDateString();

const lv=id=>S.ups[id]||0;
const level=()=>{let l=1;LEVELS.forEach((x,i)=>{if(S.total>=x.at)l=i+1});return l};
const totalUps=()=>Object.values(S.ups).reduce((a,b)=>a+b,0);
const minersOwned=()=>MINERS.reduce((a,m)=>a+lv(m.id),0);
const mileMult=id=>MILES.reduce((a,m)=>lv(id)>=m?a*2:a,1);
const shardMult=()=>1+S.shards*(.05+itemFx('shard'));
const boost=()=>now()<S.boostUntil?S.boostMult:1;
const frenzy=()=>now()<S.frenzyUntil?5:1;
const maxEnergy=()=>500+250*lv('energy')+itemFx('en');
const REGEN_MAX=2.5;
const regen=()=>Math.min(REGEN_MAX,1+lv('regen')*.1+itemFx('regen'));
const tapBase=()=>(1+lv('tap'))*shardMult()*(1+itemFx('tap'))*(1+itemFx('all'))*BL('tap');
const critChance=()=>.03+.01*lv('crit')+itemFx('crit')+(overheated?.12:0);
const basePps=()=>MINERS.reduce((a,m)=>a+m.pps*lv(m.id)*mileMult(m.id),0)*shardMult()*(1+itemFx('pps'))*(1+itemFx('all'))*BL('pps');
const shopK=()=>Math.max(1,+CFG.shopK||1);
function shopFx(id,k){const p=basePps();k=k||shopK();return({starter:{c:Math.round(Math.max(5e4,p*1800)*k),ms:Math.round(3600e3*k)},refill:{c:Math.round(p*300*k),ms:0},boost2:{c:0,ms:Math.round(3600e3*k)},boost3:{c:0,ms:Math.round(86400e3*(1+(k-1)*.5))},bag:{c:Math.round(Math.max(25e4,p*14400)*k),ms:0}})[id]||{c:0,ms:0}}
function shopDesc(it){const f=shopFx(it.id),k=shopK(),h=ms=>{const mm=Math.round(ms/6e4);return mm>=60?String(Math.round(mm/6)/10).replace('.',',')+' ч':mm+' мин'},kb=k>1?` · бонус прокачки x${String(k).replace('.',',')}`:'';if(it.id==='starter')return`${fmt(f.c)} кристаллов и ускоритель x2 на ${h(f.ms)}${kb}`;if(it.id==='refill')return`Полная энергия и ${fmt(f.c)} кристаллов${kb}`;if(it.id==='boost2')return`x2 к ударам и добыче на ${h(f.ms)}${kb}`;if(it.id==='boost3')return`x3 ко всей добыче на ${h(f.ms)}${kb}`;if(it.id==='bag')return`${fmt(f.c)} кристаллов${kb}`;return it.desc}
const pps=()=>basePps()*boost();
const cost=(u,n=1)=>{const l=lv(u.id);return Math.ceil(u.base*BL('cost')*Math.pow(u.mult,l)*(Math.pow(u.mult,n)-1)/(u.mult-1))};
function amount(u){const room=u.max?u.max-lv(u.id):Infinity;if(room<=0)return 0;if(bm==='max'){let n=0;const l=lv(u.id);let c=0;while(n<room&&n<1000){const p=Math.ceil(u.base*BL('cost')*Math.pow(u.mult,l+n));if(c+p>S.coins)break;c+=p;n++}return Math.max(1,n)}return Math.min(+bm,room)}
const locked=u=>u.miner&&MINERS.indexOf(u)>0&&lv(MINERS[MINERS.indexOf(u)-1].id)<1;
function earn(v){S.coins+=v;S.total+=v}
function setBoost(x,ms){const t=now();if(t<S.boostUntil&&S.boostMult>=x)S.boostUntil+=ms;else{S.boostMult=x;S.boostUntil=t+ms}}

let _hx={};
function hueHex(h){if(_hx[h])return _hx[h];const c=hsl(h,.85,.58);return _hx[h]=(Math.round(c[0]*255)<<16)|(Math.round(c[1]*255)<<8)|Math.round(c[2]*255)}
function thumb(key,build){if(!th||!th.ok)return'';if(th.map[key])return th.map[key];const b=build||MODELS[key];if(!b)return'';try{return th.make(key,b)}catch(e){return''}}
const gemThumb=s=>thumb('gem_'+s.id,()=>MODELS.gem(hueHex(s.hue)));
function vis(key,icon,extra=''){const src=key?thumb(key):'';return src?`<div class="row-vis" data-inspect="${key}" role="button" tabindex="0" aria-label="Осмотреть модель"${extra}><img src="${src}" alt=""></div>`:`<div class="row-vis acc">${ic(icon||'gem')}</div>`}

function hap(t){if(!S.set.vib)return;try{if(TG&&TG.HapticFeedback){if(t==='error'||t==='success'||t==='warning')TG.HapticFeedback.notificationOccurred(t);else TG.HapticFeedback.impactOccurred(t||'light')}else if(navigator.vibrate)navigator.vibrate(t==='heavy'?30:t==='medium'?16:8)}catch(e){}}
let toastT=0;
function toast(t){const el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2200)}

const mq=[];let mOpen=false;
function modal(o){mq.push(o);if(!mOpen)nextModal()}
function nextModal(){const o=mq.shift();if(!o){mOpen=false;$('#modal').classList.remove('on');return}mOpen=true;$('#mVis').innerHTML=o.vis?`<img src="${o.vis}" alt="">`:'';$('#mKicker').textContent=o.k||'';$('#mTitle').textContent=o.t||'';$('#mText').innerHTML=o.x||'';const b=$('#mBtn'),a=$('#mAlt');b.textContent=o.btn||'Отлично';a.hidden=!o.alt;a.textContent=o.alt||'';b.onclick=()=>{snd.close();const f=o.ok;nextModal();f&&f()};a.onclick=()=>{snd.close();const f=o.onAlt;nextModal();f&&f()};$('#modal').classList.add('on');snd.open();setTimeout(()=>b.focus({preventScroll:true}),60)}

let shOn=false;
function sheet(html,after){$('#shBody').innerHTML=html;$('#scrim').classList.add('on');$('#sheet').classList.add('on');shOn=true;snd.open();after&&after()}
function closeSheet(){if(!shOn)return;shOn=false;$('#scrim').classList.remove('on');$('#sheet').classList.remove('on');snd.close();if(viewerCv&&viewerCv.parentNode)setTimeout(()=>{if(!shOn&&viewerCv.parentNode)viewerCv.remove()},500)}

function float(x,y,txt,crit,cls){if(!S.set.fx&&!crit&&!cls)return;const box=$('#floats');if(box.childElementCount>24)box.firstChild.remove();const T=now();FL=FL.filter(f=>f.u>T);const w=Math.max(44,txt.length*(crit?15:cls?8:11)),h=crit?32:cls?18:24;const px=x+(Math.random()*40-20);let py=y-20;for(let k=0;k<14&&FL.some(f=>Math.abs(f.x-px)<Math.max(f.w,w)&&Math.abs(f.y-py)<(f.h+h)/2);k++)py-=h;FL.push({x:px,y:py,w,h,u:T+480});const d=document.createElement('div');d.className='float'+(crit?' crit':'')+(cls?' '+cls:'');d.textContent=txt;d.style.left=px+'px';d.style.top=py+'px';box.appendChild(d);setTimeout(()=>d.remove(),900)}

function doTap(x,y){const t=now();if(S.energy<1){hap('error');snd.error();const m=$('.meter');m.classList.remove('shake');void m.offsetWidth;m.classList.add('shake');if(t-lastTap>1500)toast('Энергия закончилась — подожди или восстанови');lastTap=t;return}
  S.energy-=1;S.taps++;lastTap=t;heat=Math.min(1,heat+.055);
  if(heat>=1&&!overheated){overheated=true;S.st.overheat++;$('#heatTag').hidden=false;snd.hammer();hap('heavy')}
  const crit=Math.random()<critChance();const g=tapBase()*(1+heat)*boost()*frenzy()*(crit?6+itemFx('critx'):1);earn(g);if(g>S.st.best)S.st.best=g;drop(crit,x,y);
  forge&&forge.tap(x,y);
  const fr=frenzy()>1;
  if(crit){S.st.crits++;if(overheated&&Math.random()<.02*(1+itemFx('luck')))gainRelic(['void'],x,y);snd.crit();hap('medium');if(S.set.fx&&sparks){sparks.burst(x,y,26,'255,77,0',1.3);sparks.ring(x,y,'255,120,40')}float(x,y,'+'+fmt(g),true)}
  else{snd.tap(heat);hap('light');if(S.set.fx&&sparks)sparks.burst(x,y,fr?14:7,fr?'255,60,20':'255,140,60',fr?1:.7);float(x,y,'+'+fmt(g))}
  const b=$('.bal');b.classList.add('pop');clearTimeout(doTap.p);doTap.p=setTimeout(()=>b.classList.remove('pop'),90)}

const meteor={on:false,t:0,next:now()+(45e3+Math.random()*75e3)/(1+itemFx('met')),x0:0,y0:0,x1:0,y1:0};
function spawnMeteor(){const el=$('#meteor');const src=thumb('meteor');if(!src){meteor.next=now()+6e4;return}el.querySelector('img').src=src;const W=innerWidth,H=innerHeight,l=Math.random()<.5;meteor.x0=l?-90:W+10;meteor.x1=l?W+10:-90;meteor.y0=H*(.15+Math.random()*.2);meteor.y1=H*(.35+Math.random()*.25);meteor.t=0;meteor.on=true;el.hidden=false;snd.meteor()}
function catchMeteor(e){if(!meteor.on)return;meteor.on=false;$('#meteor').hidden=true;meteor.next=now()+(45e3+Math.random()*75e3)/(1+itemFx('met'));S.st.meteors++;addMat('star',1+(Math.random()<.4?1:0));addMat('ember',1);if(Math.random()<.5)addGear(rollGear(1));const r=e.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(sparks){sparks.burst(x,y,40,'255,77,0',1.4);sparks.ring(x,y,'255,180,120')}hap('success');snd.level();if(Math.random()<.3)gainRelic(Math.random()<.7?['sky']:null);
  if(Math.random()<.45){S.frenzyUntil=now()+20e3*(1+itemFx('frz'));S.st.frenzy++;modal({vis:thumb('meteor'),k:'Светлячок',t:'Ярость кузнеца',x:'Следующие <b>20 секунд</b> каждый удар приносит в <b>5 раз</b> больше. Бей быстрее.',btn:'В бой'})}
  else{const g=Math.max(pps()*90,tapBase()*120,500);earn(g);float(x,y,'+'+fmt(g),true);toast(`Светлячок: +${fmt(g)} кристаллов`)}dirty=true;persist()}

function buyUp(id){const u=[...TAP_UPS,...MINERS].find(x=>x.id===id);if(!u||locked(u))return;const n=amount(u);if(!n){toast('Максимальный уровень');return}const p=cost(u,n);if(S.coins<p){hap('error');snd.error();toast('Недостаточно кристаллов');return}
  const before=u.miner?mileMult(u.id):1;S.coins-=p;S.ups[u.id]=lv(u.id)+n;snd.buy();hap('medium');
  const row=document.querySelector(`.row[data-id="${id}"]`);if(row){row.classList.remove('flash');void row.offsetWidth;row.classList.add('flash');const r=row.getBoundingClientRect();sparks&&S.set.fx&&sparks.burst(r.left+44,r.top+r.height/2,10,'255,140,60',.6)}
  if(u.miner&&mileMult(u.id)>before)modal({vis:thumb(u.m),k:'Веха',t:`${u.name}: ${lv(u.id)} шт.`,x:`Добыча этого механизма удвоена. Сейчас множитель <b>x${mileMult(u.id)}</b>.`});
  if(lv(u.id)===n&&u.miner)renderUps();else refreshUps();persist()}

function applyItem(id,k){const it=SHOP.find(x=>x.id===id);const f=shopFx(id,typeof k==='number'?k:0);if(it&&it.once)S.bought[id]=1;
  if(id==='refill'){S.energy=maxEnergy();if(f.c)earn(f.c)}else if(id==='boost2')setBoost(2,f.ms);else if(id==='boost3')setBoost(3,f.ms);else if(id==='vault')S.vault=true;else if(id==='starter'){earn(f.c);setBoost(2,f.ms)}else if(id==='bag')earn(f.c);
  else if(id.startsWith('skin_')){const sid=id.slice(5);if(!S.owned.includes(sid))S.owned.push(sid);S.skin=sid;applySkin()}
  const sk=id.startsWith('skin_')?SKINS.find(s=>s.id===id.slice(5)):null;
  modal({vis:sk?gemThumb(sk):thumb(id),k:'Покупка',t:sk?sk.name:(it?it.name:'Готово'),x:sk?'Новый кристалл уже в горне.':(it?(f.c?`Начислено <b>${fmt(f.c)}</b> кристаллов. `:'')+(f.ms?`Ускоритель на ${Math.round(f.ms/6e4)} мин. `:'')+((typeof k==='number'?k:shopK())>1?`Бонус прокачки x${typeof k==='number'?k:shopK()}.`:'')||it.desc:'')});snd.level();dirty=true}
async function buyStars(item){if(!online){toast('Покупки доступны внутри Telegram');return}try{hap('medium');const r=await API.post('/api/invoice',{item});if(r.dev){toast(r.free?'Покупка выдана бесплатно':'DEV: покупка выдана бесплатно');await claim();return}if(!TG||!TG.openInvoice){toast('Открой игру в Telegram');return}TG.openInvoice(r.link,st=>{if(st==='paid'){toast('Оплата прошла');setTimeout(claim,1200);setTimeout(claim,4e3)}else if(st==='failed')toast('Оплата не прошла')})}catch(e){toast('Не удалось создать счёт')}}

function applySkin(){const s=SKINS.find(x=>x.id===S.skin)||SKINS[0];forge&&forge.setSkin(s.hue,s.rainbow)}
function skinOpen(s){return S.owned.includes(s.id)||(s.lvl&&level()>=s.lvl)}

function renderUps(){const row=(u,i)=>`<div class="row" data-id="${u.id}" style="--i:${i}">${vis(u.m,u.miner?'anvil':'wrench')}<div class="row-b"><div class="row-t">${u.name}<span class="row-lv" data-lv></span></div><div class="row-d" data-d></div>${u.miner?'<div class="mile" data-mile></div>':''}</div><button class="buy" data-up="${u.id}"></button></div>`;
  $('#tapUps').innerHTML=TAP_UPS.map(row).join('');const vm=MINERS.filter((m,i)=>i===0||lv(MINERS[i-1].id)>0||lv(m.id)>0);const nx=MINERS[vm.length];$('#miners').innerHTML=vm.map((m,i)=>row(m,i+TAP_UPS.length)).join('')+(nx?`<div class="row locked" style="--i:${vm.length+4}">${vis(nx.m,'lock')}<div class="row-b"><div class="row-t">${nx.name}</div><div class="row-d">Откроется после покупки предыдущего механизма</div></div><span class="buy off">${ic('lock')}</span></div>`:'');refreshUps()}
function refreshUps(){for(const u of[...TAP_UPS,...MINERS]){const r=document.querySelector(`.row[data-id="${u.id}"]`);if(!r)continue;const l=lv(u.id),n=amount(u),max=u.max&&l>=u.max;r.querySelector('[data-lv]').textContent=u.max?`${l}/${u.max}`:`ур. ${l}`;
  r.querySelector('[data-d]').innerHTML=u.miner?`<b>${fmt(u.pps*mileMult(u.id)*shardMult())}</b>/с за шт. · всего <b>${fmt(u.pps*l*mileMult(u.id)*shardMult())}</b>/с`:u.desc;
  const mi=r.querySelector('[data-mile]');if(mi)mi.innerHTML=MILES.map(m=>`<i class="${l>=m?'on':''}" title="${m}"></i>`).join('');
  const b=r.querySelector('.buy');if(max){b.className='buy done';b.innerHTML=ic('check');b.disabled=true;continue}const p=cost(u,n);b.disabled=false;b.className='buy'+(S.coins<p?' off':'');b.innerHTML=`${n>1?`<span>x${n}</span>`:''}${fmt(p)}`;b.setAttribute('aria-label',`Купить ${u.name} за ${fmt(p)}`)}
  $('#minersTotal').textContent=`${fmt(basePps()*boost())}/с`;renderReforge()}
function shardGain(){const run=Math.max(0,S.total-(S.runStart||0));return Math.floor(Math.sqrt(run/1e6))}
function renderReforge(){const g=shardGain();$('#reforge').innerHTML=`<div><div class="reforge-k mono">Перековка</div><div class="reforge-t">${g>0?`+${g} ${plural(g,'осколок','осколка','осколков')}`:'Рано'}</div><div class="row-d">Сбрось мастерскую и кристаллы ради осколков. Каждый навсегда даёт <b>+5%</b> ко всей добыче. Сейчас: <b>${S.shards}</b> · <b>+${Math.round(S.shards*(5+itemFx('shard')*100))}%</b></div></div><button class="btn${g>0?'':' off'}" id="reforgeBtn" ${g>0?'':'disabled'}>${ic('refresh')}Перековать</button>`}
function doReforge(){const g=shardGain();if(g<1)return;modal({vis:thumb('forge'),k:'Перековка',t:`Получить ${g} ${plural(g,'осколок','осколка','осколков')}?`,x:'Кристаллы, инструменты и механизмы обнулятся. Уровень, кристаллы-скины, реликвии, покупки и достижения сохранятся.',btn:'Перековать',alt:'Отмена',ok:()=>{S.shards+=g;S.coins=0;S.ups={};S.energy=maxEnergy();S.runStart=S.total;S.st.reforge++;gainRelic(['royal']);heat=0;persist();renderUps();snd.level();hap('success');if(sparks){const r=$('#reforgeBtn').getBoundingClientRect();sparks.burst(r.left+r.width/2,r.top,60,'255,77,0',1.6)}toast(`Добыча +${Math.round(S.shards*(5+itemFx('shard')*100))}% навсегда`)}})}

function canDaily(){return S.dd?S.dd.last!==sDay():dayKey(S.lastDaily)!==dayKey(now())}
function streakIdx(){return dInfo().idx}
function renderTasks(){const can=canDaily(),idx=can?streakIdx():(S.streak-1)%7,L=level();$('#streakTxt').textContent=`Серия: ${S.streak} ${plural(S.streak,'день','дня','дней')}`;const b=$('#dailyBtn');b.disabled=!can;b.className='btn'+(can?'':' off');b.textContent=can?'Забрать':'Завтра';
  renderDays();
  $('#taskList').innerHTML=TASKS.map((t,i)=>{const done=S.tasks[t.id];let btn;if(done)btn=`<span class="buy done">${ic('check')}</span>`;else btn=t.check()?`<button class="buy" data-task="${t.id}">Забрать</button>`:`<span class="buy off">${t.prog()}</span>`;return`<div class="row" style="--i:${i}"><div class="row-vis acc">${ic(t.ic)}</div><div class="row-b"><div class="row-t">${t.name}</div><div class="row-d">Награда <b>${fmt(taskR(t))}</b>${kTxt()}</div></div>${btn}</div>`}).join('');
  const got=ACH.filter(a=>S.ach[a.id]).length;$('#achCount').textContent=`${got}/${ACH.length}`;$('#achList').innerHTML=ACH.map(a=>{const g=S.ach[a.id],r=!g&&a.c();return`<button class="ach-i${g?' got':''}${r?' ready':''}" data-ach="${a.id}" aria-label="${a.n}">${ic(a.ic)}</button>`}).join('')}
function claimTask(id){const t=TASKS.find(x=>x.id===id);if(!t||S.tasks[id])return;if(t.check&&!t.check())return;S.tasks[id]=1;const v=taskR(t);earn(v);snd.coin();hap('success');toast(`+${fmt(v)} кристаллов`);renderTasks();persist()}
function showAch(id){const a=ACH.find(x=>x.id===id);const g=S.ach[a.id],r=!g&&a.c();modal({k:g?'Получено':r?'Готово к получению':'Достижение',t:a.n,x:`${a.d}.${a.r?` Награда <b>${fmt(achR(a))}</b>${g?'':kTxt()}`:''}`,btn:r?'Забрать':'Понятно',ok:()=>{if(!r)return;S.ach[a.id]=1;earn(achR(a));snd.level();hap('success');renderTasks();persist()}})}

function inviteLink(){const uid=CFG.uid||(TG&&TG.initDataUnsafe&&TG.initDataUnsafe.user?TG.initDataUnsafe.user.id:0);if(!CFG.bot||!uid)return '';return `https://t.me/${CFG.bot}?start=ref_${uid}`}
async function renderFriends(){renderExp();loadExp();renderTower();loadTower();renderBoss();loadBoss();renderArena();loadArena();$('#refCount').textContent=S.refCount;{const rm=$('#refMe');if(rm)rm.textContent=fmt(refReward())}const src=thumb('friends');if(src)$('#friendsImg').src=src;const box=$('#top');if(!online){box.innerHTML='<div class="empty">Рейтинг доступен внутри Telegram</div>';return}box.innerHTML='<div class="empty mono">Загрузка…</div>';try{await syncSave();const r=await API.post('/api/top');const row=(u,i)=>`<div class="row${u.me?' me':''}" style="--i:${Math.min(i,12)}"><div class="rank r${u.rank}">${String(u.rank).padStart(2,'0')}</div><div class="row-b"><div class="row-t">${esc(u.name)}</div><div class="row-d">LV ${u.level} · ${LEVELS[u.level-1]?LEVELS[u.level-1].n:''}</div></div><span class="tval">${fmt(u.total)}</span></div>`;let h=r.top.map(row).join('');if(r.me&&!r.top.some(u=>u.me))h+=row(Object.assign({me:true},r.me),50);box.innerHTML=h||'<div class="empty">Пока пусто — стань первым</div>'}catch(e){box.innerHTML='<div class="empty">Не удалось загрузить рейтинг</div>'}}

function renderShop(){const t=now();$('#shopList').innerHTML=SHOP.map((it,i)=>{const own=it.once&&S.bought[it.id];let extra='';if((it.id==='boost2'||it.id==='boost3')&&t<S.boostUntil)extra=` · активно x${S.boostMult}`;return`<div class="row" style="--i:${i}">${vis(it.id,'bag')}<div class="row-b"><div class="row-t">${it.name}${it.hot&&!own?'<span class="tag">Выгодно</span>':''}</div><div class="row-d">${shopDesc(it)}${extra}</div></div>${own?`<span class="buy done">${ic('check')}</span>`:`<button class="buy star" data-star="${it.id}">${ic('star')}${it.stars}</button>`}</div>`}).join('');
  $('#skins').innerHTML=SKINS.map((s,i)=>{const open=skinOpen(s),sel=S.skin===s.id;let b;if(sel)b=`<span class="buy done">${ic('check')}Выбран</span>`;else if(open)b=`<button class="buy ghost" data-skin="${s.id}">Выбрать</button>`;else if(s.stars)b=`<button class="buy star" data-star="skin_${s.id}">${ic('star')}${s.stars}</button>`;else b=`<span class="buy off">${ic('lock')}LV ${s.lvl}</span>`;const src=gemThumb(s);return`<div class="skin${sel?' sel':''}" style="--i:${i}">${src?`<img src="${src}" alt="" style="${open?'':'filter:grayscale(1) brightness(.4)'}">`:''}<div class="skin-n">${s.name}${s.rainbow?'<span class="tag">Анимация</span>':''}</div>${b}</div>`}).join('')}

function inspect(key){const all=[...TAP_UPS,...MINERS];const u=all.find(x=>x.m===key),it=SHOP.find(x=>x.id===key);const name=u?u.name:it?it.name:'Модель';let kv='';if(u&&u.miner){const l=lv(u.id);kv=`<div class="kv"><span>Уровень</span><span>${l}</span><span>Добыча за шт.</span><span>${fmt(u.pps*mileMult(u.id)*shardMult())}/с</span><span>Множитель вех</span><span>x${mileMult(u.id)}</span><span>Следующая веха</span><span>${MILES.find(m=>m>l)||'—'}</span></div>`}else if(u){kv=`<div class="kv"><span>Уровень</span><span>${lv(u.id)}${u.max?'/'+u.max:''}</span><span>Эффект</span><span>${u.id==='tap'?'+'+fmt(tapBase()):u.id==='energy'?fmt(maxEnergy()):u.id==='regen'?regen()+'/с':Math.round(critChance()*100)+'%'}</span></div>`}else if(it)kv=`<p class="muted sm">${it.desc}</p>`;
  sheet(`<h2 class="sh-h" id="shTitle">${name}</h2><div id="vSlot"></div>${kv}<div class="sh-foot">Потяни модель, чтобы повернуть</div>`,()=>{if(!viewerCv){viewerCv=document.createElement('canvas');viewerCv.className='sh-viewer';viewer=new Viewer(viewerCv)}$('#vSlot').appendChild(viewerCv);if(viewer.r&&viewer.r.ok)viewer.set(MODELS[key]);else viewerCv.remove()})}
function openSettings(){const sw=(k,l,i)=>`<div class="set-row"><span class="l">${ic(i)}${l}</span><button class="sw" role="switch" aria-checked="${S.set[k]}" data-set="${k}" aria-label="${l}"></button></div>`;sheet(`<h2 class="sh-h" id="shTitle">Настройки</h2>${sw('snd','Звуки','sound')}${sw('mus','Музыка','music')}${sw('vib','Вибрация','vibe')}${sw('fx','Эффекты и частицы','eye')}<div class="sh-foot">Crystal Forge v2 · ${online?'синхронизация включена':'локальное сохранение'}</div>`)}
function openProfile(){const L=level();const kv=[['Уровень',`${L} · ${LEVELS[L-1].n}`],['Добыто всего',fmt(S.total)],['Удары',fmt(S.taps)],['Критические',fmt(S.st.crits)],['Перегревы',fmt(S.st.overheat)],['Светлячки',fmt(S.st.meteors)],['Лучший удар',fmt(S.st.best)],['Добытчики',fmt(minersOwned())],['Реликвии',`${relicsOwned()} / ${RELICS.length}`],['Артефакты',`${artsOwned()} / ${ARTS.length}`],['Эссенция',fmt(S.ess)],['Предметы',`${S.inv.length} / ${INV_MAX}`],['Осколки',`${S.shards} · +${Math.round(S.shards*(5+itemFx('shard')*100))}%`],['Перековки',S.st.reforge],['В игре',fmtT(S.st.play*1000)]];sheet(`<h2 class="sh-h" id="shTitle">${esc($('#uname').textContent)}</h2><div class="kv">${kv.map(([a,b])=>`<span>${a}</span><span>${b}</span>`).join('')}</div>`)}

function go(t){if(t===tab)return;if(!isOpen(t)){snd.error();hap('error');toast(`${TUT_NAME[t]||'Раздел'} откроется по ходу обучения`);return}S.vis[t]=1;evTab(t);tab=t;$$('.tab').forEach(s=>s.classList.toggle('on',s.dataset.tab===t));$$('.nav button').forEach(b=>b.classList.toggle('on',b.dataset.go===t));snd.tone(520,{type:'sine',d:.06,v:.05});hap('light');if(t==='upgrades')renderUps();if(t==='tasks')renderTasks();if(t==='friends')renderFriends();if(t==='shop')renderShop();if(t==='craft')renderCraft();if(!tutDone())tutTick();tutUI()}

let prevLevel=0;
function checkLevel(){const L=level();if(prevLevel&&L>prevLevel){evq('lvl',{l:L,p:Math.round(S.st.play||0)});snd.level();hap('success');const sk=SKINS.find(s=>s.lvl===L);modal({vis:sk?gemThumb(sk):thumb('crit'),k:`Уровень ${L}`,t:LEVELS[L-1].n,x:sk?`Открыт новый кристалл: <b>${sk.name}</b>. Выбери его в лавке.`:'Новый ранг в гильдии мастеров.'});if(sparks){sparks.burst(innerWidth/2,innerHeight*.4,70,'255,77,0',1.6)}}prevLevel=L}
let dispCoins=S.coins;
let coinS='',coinW=0,coinN=0,coinT=0;
function coinSet(s){if(s===coinS)return;coinS=s;coinT=now();const el=$('#coins');el.textContent=s;el.style.minWidth='0px';coinN=Math.ceil(el.getBoundingClientRect().width);if(coinN>coinW)coinW=coinN;el.style.minWidth=coinW+'px'}
addEventListener('resize',()=>{coinS='';coinW=0});
function hud(dt){const t=now();if(S.coins<dispCoins)dispCoins=S.coins;else dispCoins+=(S.coins-dispCoins)*Math.min(1,dt*12);if(Math.abs(S.coins-dispCoins)<1)dispCoins=S.coins;coinSet(fmt(dispCoins));if(coinN<coinW&&dispCoins===S.coins&&t-coinT>1500){coinW=coinN;$('#coins').style.minWidth=coinW+'px'}
  const L=level(),cur=LEVELS[L-1],nx=LEVELS[L];$('#lvlNum').textContent='LV '+String(L).padStart(2,'0');$('#lvlName').textContent=cur.n;$('#lvlFill').style.transform=`scaleX(${nx?clamp((S.total-cur.at)/(nx.at-cur.at),0,1):1})`;
  $('#pps').textContent=fmt(pps());$('#tapInfo').textContent=`+${fmt(tapBase()*boost()*frenzy())} за удар`;
  const me=maxEnergy();$('#energyTxt').textContent=`${fmt(S.energy)} / ${fmt(me)}`;$('#energyFill').style.transform=`scaleX(${S.energy/me})`;
  $('#heatTxt').textContent='x'+(1+heat).toFixed(2);$('#heatFill').style.transform=`scaleX(${heat})`;
  const bb=$('#boostBadge');if(t<S.boostUntil){bb.hidden=false;bb.textContent=`x${S.boostMult} · ${fmtT(S.boostUntil-t)}`}else bb.hidden=true;
  const fb=$('#frenzyBadge');if(t<S.frenzyUntil){fb.hidden=false;fb.textContent=`Ярость x5 · ${Math.ceil((S.frenzyUntil-t)/1000)}с`}else fb.hidden=true;
  const rb=$('#refillBtn');$('#refillCnt').textContent=`${S.refills}/3`;rb.disabled=S.refills<=0||S.energy>=me;rb.classList.toggle('off',rb.disabled);
  const up=[...TAP_UPS,...MINERS].some(u=>!locked(u)&&!(u.max&&lv(u.id)>=u.max)&&S.coins>=cost(u,1)&&(!u.miner||lv(u.id)>0||MINERS.indexOf(u)===0||lv(MINERS[MINERS.indexOf(u)-1].id)>0));
  const tk=canDaily()||TASKS.some(x=>!S.tasks[x.id]&&x.check())||ACH.some(a=>!S.ach[a.id]&&a.c());
  $('.nav [data-go=upgrades]').classList.toggle('has',up&&tab!=='upgrades');$('.nav [data-go=tasks]').classList.toggle('has',tk&&tab!=='tasks');$('.nav [data-go=craft]').classList.toggle('has',canAnyCraft()&&tab!=='craft');$('.nav [data-go=friends]').classList.toggle('has',pvUnseen>0&&tab!=='friends')}

function offline(){const t=now();if(!S.lastSeen){S.lastSeen=t;return}const el=Math.max(0,t-S.lastSeen);S.lastSeen=t;if(el<5e3)return;S.energy=Math.min(maxEnergy(),S.energy+regen()*el/1000);const cap=((S.vault?12:3)+itemFx('off'))*3600e3*BL('off');const g=basePps()*Math.min(el,cap)/1000;if(g<1)return;earn(g);if(el>=6e4)modal({vis:thumb('m1'),k:'С возвращением',t:`+${fmt(g)} кристаллов`,x:`Добытчики работали ${fmtT(Math.min(el,cap))}.${S.vault?'':'<small>Хранилище в лавке продлит офлайн-добычу до 12 часов.</small>'}`})}
function refillDay(){const d=dayKey(now());if(S.refillDay!==d){S.refillDay=d;S.refills=3}}

const ONB=[{m:'forge',k:'01 / 03',t:'Бей по кристаллу',x:'Каждый удар добывает кристаллы. Частые удары разогревают горн — множитель растёт до <b>x2</b>, а перегрев повышает шанс крита.'},{m:'m1',k:'02 / 03',t:'Нанимай добытчиков',x:'Механизмы добывают сами, даже когда ты не в игре. На <b>10, 25, 50, 100</b> штуках их добыча удваивается.'},{m:'meteor',k:'03 / 03',t:'Лови светлячков',x:'Иногда над кузней пролетает самоцветный светлячок. Поймай его — получишь кристаллы или <b>Ярость x5</b>.'}];

const TUT=[
 {t:'Сделай 25 ударов по кристаллу',ok:()=>S.taps>=25,u:'upgrades',g:'game',f:45},
 {t:'Мастерская: купи «Мощный удар»',ok:()=>lv('tap')>=1,g:'upgrades',f:45},
 {t:'Найми первого гнома-рудокопа — он добывает сам, даже офлайн',ok:()=>lv('m1')>=1,u:'tasks',g:'upgrades',f:60},
 {t:'Задания: забери ежедневную награду',ok:()=>!canDaily(),u:'meteor',g:'tasks',f:45},
 {t:'Вернись в Кузню и поймай светлячка — он даёт рывок добычи',ok:()=>S.st.meteors>=1,u:'craft',g:'game',f:75},
 {t:'Загляни в Горнило: материалы, предметы и перековка',ok:()=>!!S.vis.craft,u:'friends',g:'craft',f:25},
 {t:'Гильдия: арена и общий босс для всех игроков',ok:()=>!!S.vis.friends,u:'shop',g:'friends',f:25},
 {t:'Лавка: скины кристаллов, наборы и ускорители',ok:()=>!!S.vis.shop,g:'shop',f:25}];
const TUT_NAME={upgrades:'Мастерская',tasks:'Задания',meteor:'Светлячки',craft:'Горнило',friends:'Гильдия',shop:'Лавка'};
const tutDone=()=>(S.tut||0)>=TUT.length;
function isOpen(k){if(tutDone())return true;const i=TUT.findIndex(x=>x.u===k);return i<0||S.tut>i}
function tutTick(){if(tutDone()||!S.onb)return;const s=TUT[S.tut];const el=(S.st.play||0)-(S.tutT||0);if(s.ok()||el>=s.f)tutNext()}
function tutNext(){const s=TUT[S.tut];S.tut++;S.tutT=S.st.play||0;evq('tut',{s:S.tut});if(s.u==='meteor')meteor.next=Math.min(meteor.next,now()+4e3);if(s.u){const b=$(`.nav [data-go="${s.u}"]`);if(b){b.classList.add('unl');setTimeout(()=>b.classList.remove('unl'),2600)}toast(`Открыто: ${TUT_NAME[s.u]}`);hap('success')}if(tutDone())toast('Обучение пройдено — все системы открыты');tutUI();persist()}
function tutUI(){const cur=!tutDone()&&S.onb?TUT[S.tut]:null;$$('.nav button').forEach(b=>{const lk=!isOpen(b.dataset.go);b.classList.toggle('lk',lk);b.setAttribute('aria-disabled',lk?'true':'false');b.classList.toggle('hint',!!cur&&cur.g===b.dataset.go&&tab!==cur.g)});const el=$('#tut');if(!el)return;const hide=tutDone()||!S.onb;el.hidden=hide;document.body.classList.toggle('tut-on',!hide);if(hide)return;const s=TUT[S.tut];$('#tutK').textContent=`Обучение · ${S.tut+1} из ${TUT.length}`;$('#tutT').textContent=s.t;$('#tutFill').style.transform=`scaleX(${(S.tut+1)/TUT.length})`}
function tutSkip(){modal({vis:thumb('crit'),k:'Обучение',t:'Открыть все системы сразу?',x:'Мастерская, задания, светлячки, горнило, гильдия и лавка станут доступны прямо сейчас. Вернуть обучение будет нельзя.',btn:'Открыть всё',alt:'Продолжить обучение',ok:()=>{evq('tut',{s:S.tut,skip:1});S.tut=TUT.length;S.tutSkip=1;tutUI();persist();toast('Все системы открыты')}})}
function onboarding(){modal({vis:thumb(ONB[0]&&ONB[0].m||'crit'),k:'Добро пожаловать',t:'Кузня кристаллов',x:'Бей по кристаллу — каждый удар добывает кристаллы. За первые пять минут системы откроются по очереди, чтобы не запутаться. Обучение можно пропустить в любой момент.',btn:'Начать обучение',alt:'Пропустить',ok:()=>{S.onb=1;S.tut=0;S.tutT=S.st.play||0;evq('tut',{s:0});tutUI();persist()},onAlt:()=>{S.onb=1;S.tut=TUT.length;S.tutSkip=1;evq('tut',{s:0,skip:1});tutUI();persist()}})}

const EVQ=[],EVT={};let evLT='',stUps=-1,stAt=0,stSent=0;
function evq(e,o){EVQ.push(Object.assign({e},o||{}));if(EVQ.length>60)EVQ.splice(0,EVQ.length-60)}
function evTab(t){EVT[t]=(EVT[t]||0)+1;evLT=t}
async function evFlush(){if(!online)return;const k=Object.keys(EVT);if(k.length){const c={};k.forEach(x=>{c[x]=EVT[x];delete EVT[x]});EVQ.push({e:'tabs',c,lt:evLT})}if(!EVQ.length)return;const b=EVQ.splice(0,40);try{await API.post('/api/ev',{ev:b})}catch(e){EVQ.unshift(...b.slice(0,20))}}

function stuckTick(){const n=Object.values(S.ups||{}).reduce((a,b)=>a+(+b||0),0),p=S.st.play||0;if(n!==stUps){stUps=n;stAt=p;return}if(p-stAt>600&&stSent!==level()){stSent=level();evq('stuck',{l:level()})}}
const fmtD=ms=>{const h=Math.max(0,Math.floor(ms/36e5)),d=Math.floor(h/24);return d?`${d} д ${h%24} ч`:h?`${h} ч`:fmtT(ms)};

let BS=null,bsAt=0,bsBusy=false;
async function loadBoss(){if(!online){renderBoss();return}try{const r=await API.post('/api/boss',{});BS=r.boss;bsAt=now()}catch(e){}renderBoss()}
function renderBoss(){const el=$('#boss');if(!el)return;if(!online){el.innerHTML='<div class="empty">Босс гильдии доступен, когда игра открыта в Telegram</div>';return}if(!BS){el.innerHTML='<div class="empty mono">Ищем босса…</div>';return}const b=BS,pc=b.max?Math.max(0,b.hp/b.max):0;
 el.innerHTML=`<div class="bs"><div class="bs-h"><div class="bs-ic">${ic('flame')}</div><div class="bs-tt"><div class="bs-k mono">Босс гильдии · ур. ${b.lvl}</div><div class="bs-n">${esc(b.name)}</div><div class="bs-d">Общая цель всех игроков · осталось ${fmtD(b.left-(now()-bsAt))}</div></div></div>`+
 `<div class="bs-hp"><div class="bs-bar"><i style="transform:scaleX(${pc})"></i></div><div class="bs-hpt mono"><span>${fmt(b.hp)} / ${fmt(b.max)} HP</span><span>${b.players} ${plural(b.players,'боец','бойца','бойцов')}</span></div></div>`+
 `<div class="ar-s"><div><b class="mono">${fmt(b.my)}</b><span>Твой урон</span></div><div><b class="mono">${b.rank?'#'+b.rank:'—'}</b><span>Место</span></div><div><b class="mono">~${fmt(b.est)}</b><span>За атаку</span></div></div>`+
 `<div class="bs-a"><button class="btn" id="bossHit"${b.tries&&!bsBusy?'':' disabled'}>${ic('target')}${b.tries?`Атаковать · ${b.tries}/${b.tmax}`:'Попытки вернутся завтра'}</button><button class="btn ghost square" id="bossTop" aria-label="Вклад гильдии">${ic('chart')}</button></div>`+
 `<div class="bs-f">${b.feed.length?b.feed.map(f=>`<span>${esc(f.n)} <b class="mono">−${fmt(f.d)}</b></span>`).join(''):'<span>Пока никто не атаковал — нанеси первый удар</span>'}</div></div>`}
async function bossHit(){if(bsBusy||!BS||!BS.tries)return;bsBusy=true;renderBoss();hap('medium');let r;try{await syncSave();r=await API.post('/api/bossfight',{st:'atk'})}catch(e){bsBusy=false;snd.error();toast({'402':'Попытки на сегодня закончились','404':'Босс уже повержен'}[e.message]||'Нет связи с сервером');loadBoss();return}
 bsBusy=false;BS=r.boss;bsAt=now();if(r.vault)vSync(r.vault);const cr=r.hits.filter(h=>h.c).length;
 modal({vis:thumb('crit'),k:'Босс гильдии',t:`−${fmt(r.dmg)} HP`,x:`${r.hits.length} ударов, из них критических: ${cr}. +${fmt(r.coins)} кристаллов сразу.${r.kill?`<br><b>${esc(r.name)} повержен твоим ударом!</b> Награды получат все, кто бил босса.`:''}`,ok:()=>applyGrants(r.grants||[])});
 renderBoss();persist()}
function bossTop(){if(!BS)return;const b=BS,last=b.last;const rows=b.top.length?b.top.map(x=>`<div class="row${x.me?' me':''}"><div class="rank mono">${x.rank}</div><div class="row-b"><div class="row-t">${esc(x.name)}</div></div><div class="tval mono">${fmt(x.d)}</div></div>`).join(''):'<div class="empty">Пока пусто</div>';
 sheet(`<h2 class="sh-h" id="shTitle">Вклад в босса</h2><div class="bs-help">Урон всех игроков суммируется. 3 атаки в день. Когда здоровье падает до нуля, каждый участник получает жетоны и кристаллы, лучший боец — торговый предмет, а следующий босс становится сильнее. Не успели за 7 дней — утешительная награда и босс слабее.</div><div class="list">${rows}</div>${last?`<div class="bs-help">Прошлый: ${esc(last.name)}, ур. ${last.lvl} — ${last.win?'повержен':'ушёл'}, бойцов ${last.players}</div>`:''}`)}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#bossHit,#bossTop,#tutSkip');if(!t)return;if(t.id==='bossHit')bossHit();else if(t.id==='bossTop')bossTop();else tutSkip()});

let last=performance.now(),acc=0,saveAcc=0,syncAcc=0,claimAcc=0,uiAcc=0;
function loop(ts){const dt=Math.min(.1,(ts-last)/1000);last=ts;const t=now();
  S.energy=Math.min(maxEnergy(),S.energy+regen()*dt);const p=pps();if(p)earn(p*dt);S.st.play+=dt;
  S.matAcc=(S.matAcc||0)+dt*Math.min(minersOwned(),400)*.0015;if(S.matAcc>=1){S.matAcc-=1;addMat(Math.random()<.6?'ore':'coal',1)}
  if(t-lastTap>650)heat=Math.max(0,heat-dt*.32*(1-itemFx('cool')));if(overheated&&heat<.7){overheated=false;$('#heatTag').hidden=true}
  if(forge){forge.heat=heat*(frenzy()>1?1:.85);if(tab==='game'&&!document.hidden)forge.draw(dt)}
  if(embers){embers.heat=heat;if(S.set.fx&&!document.hidden)embers.draw(dt,ts/1000)}
  sparks&&sparks.draw(dt);
  if(shOn&&viewer&&viewerCv&&viewerCv.parentNode)viewer.draw(dt);
  if(!meteor.on&&t>meteor.next&&tab==='game'&&!mOpen&&!shOn&&isOpen('meteor'))spawnMeteor();
  if(meteor.on){meteor.t+=dt/7;const k=meteor.t,x=meteor.x0+(meteor.x1-meteor.x0)*k,y=meteor.y0+(meteor.y1-meteor.y0)*k+Math.sin(k*9)*18;$('#meteor').style.transform=`translate(${x}px,${y}px) rotate(${k*360}deg)`;if(k>=1){meteor.on=false;$('#meteor').hidden=true;meteor.next=t+(45e3+Math.random()*75e3)/(1+itemFx('met'))}}
  hud(dt);uiAcc+=dt;if(uiAcc>.5){uiAcc=0;checkLevel();tutTick();stuckTick();if(tab==='upgrades')refreshUps();if(dirty){dirty=false;if(tab==='tasks')renderTasks();if(tab==='shop')renderShop()}}
  saveAcc+=dt;if(saveAcc>5){saveAcc=0;persist()}syncAcc+=dt;if(syncAcc>30){syncAcc=0;syncSave()}claimAcc+=dt;if(claimAcc>20){claimAcc=0;claim()}
  requestAnimationFrame(loop)}

const PST={bal:{n:'Баланс',d:'Без перекосов'},atk:{n:'Натиск',d:'+15% атаки, −10% здоровья, быстрее'},def:{n:'Оборона',d:'+15% здоровья, −10% атаки, медленнее'}};
const PLG=[{n:'Бронза',at:0,c:'#c98a5a'},{n:'Серебро',at:1100,c:'#cfd6da'},{n:'Золото',at:1300,c:'#ecb54e'},{n:'Платина',at:1500,c:'#74dbea'},{n:'Обсидиан',at:1800,c:'#c58bff'}];
let PV=null,pvUnseen=0,pvSt='bal',pvBusy=false,pvAt=0,pvPlay=0,pvLastTk=-1;
const pvRM=()=>!S.set.fx||matchMedia('(prefers-reduced-motion: reduce)').matches;
const pvSign=n=>(n>0?'+':'')+n;
const pvAgo=ms=>{const m=Math.floor(ms/6e4);return m<1?'только что':m<60?`${m} мин назад`:m<1440?`${Math.floor(m/60)} ч назад`:`${Math.floor(m/1440)} дн назад`};
const pvOdds=(a,b)=>{const k=a/Math.max(1,b);return k>1.2?'Лёгкий бой':k>.9?'Равный бой':k>.7?'Тяжёлый бой':'Почти без шансов'};
function pvErr(e){toast({'402':'Нет билетов на арену','406':'Не хватает жетонов','404':'Соперник недоступен, обнови список','409':'Уже получено сегодня','403':'Нужно провести 3 боя сегодня','429':'С этим соперником можно сразиться позже','400':'Некорректный запрос'}[e.message]||'Нет связи с сервером')}
function pvSync(p){if(!p)return;PV=p;pvAt=now();pvUnseen=p.unseen;S.st.pvw=p.w;S.st.pvbest=Math.max(S.st.pvbest||0,p.best);dirty=true}
function pvTk(){if(!PV)return{tk:0,nx:0};let tk=PV.tk,nx=PV.next-(now()-pvAt);while(tk<PV.max&&nx<=0){tk++;nx+=7200e3}return{tk,nx:tk>=PV.max?0:nx}}
async function loadArena(){if(!online)return;try{await syncSave();const r=await vCall('/api/pvp');pvSync(r.pvp)}catch(e){}renderArena()}
function renderArena(){const el=$('#arena');if(!el)return;if(!online){el.innerHTML='<div class="empty">Арена доступна внутри Telegram</div>';return}if(!PV){el.innerHTML='<div class="empty">Загрузка арены…</div>';return}
  const p=PV,L=PLG[p.lg]||PLG[0],nx=PLG[p.lg+1],T=pvTk();pvLastTk=T.tk;
  el.innerHTML=`<div class="ar" style="--lc:${L.c}"><div class="ar-h"><div class="ar-lg">${ic('trophy')}</div><div class="ar-t"><div class="ar-k mono">Арена · ${L.n}</div><div class="ar-r mono">${p.r}</div><div class="ar-d">${nx?`До лиги «${nx.n}»: ${nx.at-p.r}`:'Высшая лига'} · лучший ${p.best}</div></div></div>`+
  (p.season?`<div class="ar-season mono">Сезон ${p.season.n} · до сброса ${fmtD(p.season.left-(now()-pvAt))} · в сезоне ${p.season.sw}–${p.season.sl}${p.season.last?` · прошлый: ${(PLG[p.season.last.lg]||PLG[0]).n} ${p.season.last.r}`:''}</div>`:'')+`<div class="ar-s"><div><b class="mono">${p.w}</b><span>Победы</span></div><div><b class="mono">${p.l}</b><span>Поражения</span></div><div><b class="mono">${fmt(p.me.pw)}</b><span>Сила</span></div></div>`+
  `<div class="ar-tk"><span class="ar-pips" aria-label="Билеты: ${T.tk} из ${p.max}">${Array.from({length:p.max},(_,i)=>`<i class="${i<T.tk?'on':''}"></i>`).join('')}</span><span class="mono" id="pvNext">${T.nx?'+1 билет через '+fmtT(T.nx):'Билеты полны'}</span></div>`+
  `<div class="ar-a"><button class="btn" id="pvFind"${T.tk?'':' disabled'}>${ic('target')}В бой</button><button class="btn ghost" id="pvLog">${ic('calendar')}Журнал${p.unseen?`<span class="ar-n mono">${p.unseen}</span>`:''}</button><button class="btn ghost square" id="pvTop" aria-label="Рейтинг арены">${ic('chart')}</button></div>`+
  `<div class="ar-def"><div class="ar-dk">Защита, пока тебя нет: <b>${PST[p.st].n}</b> · ${PST[p.st].d}</div><div class="seg" role="group" aria-label="Стойка защиты">${Object.keys(PST).map(k=>`<button data-pvdef="${k}" class="${p.st===k?'on':''}" aria-pressed="${p.st===k}">${PST[k].n}</button>`).join('')}</div></div>`+
  `<div class="ar-c"><span>Победы с наградой: <b class="mono">${p.wn}/${p.wmax}</b></span>${p.chestReady?`<button class="buy${p.chest?'':' off'}" id="pvChest">${ic('bag')}${p.chest?'Сундук лиги':`Бои ${Math.min(p.da,3)}/3`}</button>`:`<span class="buy done">${ic('check')}Сундук</span>`}</div></div>`}
function pvTimer(){if(tab!=='friends'||!PV)return;const T=pvTk();if(T.tk!==pvLastTk){renderArena();return}const e=$('#pvNext');if(e)e.textContent=T.nx?'+1 билет через '+fmtT(T.nx):'Билеты полны'}
setInterval(pvTimer,1000);
function openArena(){if(!PV)return;const p=PV,T=pvTk();
  sheet(`<h2 class="sh-h" id="shTitle">Соперники</h2><div class="gd-h">Бой идёт со слепком соперника: его улучшения, снаряжение и стойка защиты. Он узнает о бое, когда зайдёт в игру.</div>`+
  `<div class="ar-sub mono">Стойка в атаке</div><div class="seg pv-seg" role="group" aria-label="Стойка атаки">${Object.keys(PST).map(k=>`<button data-pvatk="${k}" class="${pvSt===k?'on':''}" aria-pressed="${pvSt===k}">${PST[k].n}</button>`).join('')}</div>`+
  `<div class="list pv-list">${p.opp.length?p.opp.map((o,i)=>`<div class="row" style="--i:${i}"><div class="row-vis" style="--rar:${(PLG[o.lg]||PLG[0]).c}">${ic(o.bot?'eye':'users')}</div><div class="row-b"><div class="row-t">${esc(o.name)}${o.bot?'<span class="tag">Тень</span>':''}</div><div class="row-d">LV ${o.lvl} · ${(PLG[o.lg]||PLG[0]).n} ${o.r} · сила <b>${fmt(o.pw)}</b></div><div class="row-d">${PST[o.st]?PST[o.st].n:''} · ${pvOdds(p.me.pw,o.pw)}</div></div><button class="buy${T.tk?'':' off'}" data-pvgo="${esc(o.id)}">${ic('target')}Бой</button></div>`).join(''):'<div class="empty">Соперников нет, обнови список</div>'}</div>`+
  `<button class="btn ghost pv-re" id="pvRe">${ic('refresh')}Новые соперники${p.reroll?'':' · 1 жетон'}</button><div class="sh-foot">Билеты: ${T.tk}/${p.max} · Тени — слепки мастеров, когда живых соперников рядом нет</div>`)}
async function pvFight(id,rev){if(pvBusy)return;if(pvTk().tk<1){snd.error();hap('error');toast('Нет билетов на арену');return}pvBusy=true;hap('medium');let r;
  try{r=await vCall('/api/pvpfight',Object.assign(rev?{rev}:{id},{st:pvSt,state:S}))}catch(e){pvBusy=false;snd.error();hap('error');pvErr(e);if(e.message==='404')loadArena();return}
  pvBusy=false;pvSync(r.pvp);applyGrants(r.grants||[]);persist();renderArena();pvReplay(r)}
function pvReplay(r,done){clearTimeout(pvPlay);const F=[r.A,r.B],ev=r.ev||[];const card=(x,s)=>`<div class="pv-f${s?' r':''}" id="pvF${s}"><div class="pv-n">${esc(x.name)}</div><div class="pv-m mono">LV ${x.lvl} · ${PST[x.st]?PST[x.st].n:''} · ${fmt(x.pw)}</div><div class="bar pv-hp"><i id="pvH${s}"></i></div><div class="pv-v mono" id="pvV${s}">${fmt(x.hp)}</div></div>`;
  sheet(`<h2 class="sh-h" id="shTitle">${r.title||(r.rev?'Реванш':'Бой на арене')}</h2><div class="pv-vs">${card(F[0],0)}<div class="pv-x mono">VS</div>${card(F[1],1)}</div><div class="pv-ev mono" id="pvEv" aria-live="polite"></div><div id="pvRes"><button class="btn ghost pv-skip" id="pvSkip">Пропустить</button></div>`);
  let i=0;const lines=[];const setHp=h=>{for(let s=0;s<2;s++){const e=$('#pvH'+s),v=$('#pvV'+s);if(e)e.style.transform=`scaleX(${Math.max(0,h[s]/F[s].hp)})`;if(v)v.textContent=fmt(h[s])}};
  const step=()=>{if(!shOn||!$('#pvEv'))return;if(i>=ev.length){(done||pvResult)(r);return}const e=ev[i++],a=F[e.s],o=F[1-e.s];
    lines.unshift(e.m?`${esc(o.name)} уклоняется`:e.c?`${esc(a.name)} · крит ${fmt(e.d)}`:`${esc(a.name)} · удар ${fmt(e.d)}`);lines.length=Math.min(lines.length,4);
    $('#pvEv').innerHTML=lines.map((l,k)=>`<div class="${k?'':'on'}">${l}</div>`).join('');setHp(e.h);
    const fe=$('#pvF'+(1-e.s));if(fe&&!e.m&&!pvRM()){fe.classList.remove('hit');void fe.offsetWidth;fe.classList.add('hit')}
    if(e.m)snd.tone(880,{type:'sine',d:.05,v:.04});else if(e.c){snd.crit();hap('medium')}else{snd.tap(.5);hap('light')}
    pvPlay=setTimeout(step,pvRM()?80:e.c?620:420)};
  $('#pvSkip').onclick=()=>{clearTimeout(pvPlay);if(ev.length)setHp(ev[ev.length-1].h);i=ev.length;step()};
  pvPlay=setTimeout(step,pvRM()?60:450)}
function pvResult(r){const el=$('#pvRes');if(!el)return;const w=r.win;if(w){snd.level();hap('success')}else{snd.error();hap('warning')}const rw=[];if(r.coins)rw.push(`+${fmt(r.coins)} кристаллов`);if(r.tok)rw.push(`+${r.tok} жетонов`);
  el.innerHTML=`<div class="pv-r${w?' win':''}"><div class="pv-rk">${w?'Победа':'Поражение'}</div><div class="pv-rd mono">${pvSign(r.dA)} · рейтинг ${r.r}</div><div class="pv-rw${rw.length?'':' muted'}">${rw.length?rw.join(' · '):'Награды за сегодня уже получены'}</div></div><div class="pv-ra"><button class="btn ghost" id="pvMore">Ещё бой</button><button class="btn" id="pvDone">Готово</button></div>`;
  $('#pvMore').onclick=openArena;$('#pvDone').onclick=closeSheet}
async function openPvLog(){if(!PV)return;const p=PV,t=now();
  const row=(x,i)=>{const d=x.k==='d',can=d&&!x.win&&!x.rv&&t-x.t<864e5;return`<div class="row${d&&t-x.t<864e5&&x.t>(p.seen||0)?' me':''}" style="--i:${Math.min(i,12)}"><div class="row-vis${x.win?' acc':''}">${ic(d?'lock':'target')}</div><div class="row-b"><div class="row-t">${d?(x.win?'Защита удержана':'Защита пробита'):(x.win?'Победа':'Поражение')} · ${esc(x.n)}${x.bot?'<span class="tag">Тень</span>':''}</div><div class="row-d">${pvAgo(t-x.t)} · рейтинг <b>${pvSign(x.d)}</b>${x.c?` · +${fmt(x.c)}`:''}${x.tk?` · +${x.tk} жет.`:''}${d&&x.rv?' · реванш взят':''}</div></div>${can?`<button class="buy" data-pvrev="${esc(x.id)}">${ic('refresh')}Реванш</button>`:''}</div>`};
  sheet(`<h2 class="sh-h" id="shTitle">Журнал арены</h2><div class="gd-h">Реванш доступен 24 часа после пробитой защиты, тратит билет и даёт больше награды.</div><div class="list pv-list">${p.log.length?p.log.map(row).join(''):'<div class="empty">Боёв пока не было</div>'}</div>`);
  if(p.unseen){try{const r=await API.post('/api/pvpseen');pvSync(r.pvp);renderArena()}catch(e){}}}
async function openPvTop(){sheet(`<h2 class="sh-h" id="shTitle">Рейтинг арены</h2><div class="list" id="pvTopL"><div class="empty mono">Загрузка…</div></div>`);
  try{const r=await API.post('/api/pvptop');const row=(u,i)=>`<div class="row${u.me?' me':''}" style="--i:${Math.min(i,12)}"><div class="rank r${u.rank}">${String(u.rank).padStart(2,'0')}</div><div class="row-b"><div class="row-t">${esc(u.name)}</div><div class="row-d">${(PLG[u.lg]||PLG[0]).n} · ${u.w} ${plural(u.w,'победа','победы','побед')}</div></div><span class="tval">${u.r}</span></div>`;let h=r.top.map(row).join('');if(r.me&&!r.top.some(u=>u.me))h+=row(r.me,50);const el=$('#pvTopL');if(el)el.innerHTML=h||'<div class="empty">Пока никто не сражался</div>'}
  catch(e){const el=$('#pvTopL');if(el)el.innerHTML='<div class="empty">Не удалось загрузить рейтинг</div>'}}
async function pvDef(st){if(!PV||PV.st===st)return;try{const r=await API.post('/api/pvpst',{st});pvSync(r.pvp);hap('light');toast(`Стойка защиты: ${PST[st].n}`);renderArena()}catch(e){pvErr(e)}}
async function pvReroll(){try{const r=await vCall('/api/pvpre');pvSync(r.pvp);hap('light');openArena()}catch(e){snd.error();pvErr(e)}}
async function pvChest(){try{const r=await vCall('/api/pvpchest');pvSync(r.pvp);applyGrants(r.grants||[]);snd.coin();hap('success');modal({vis:thumb('bag'),k:'Арена',t:'Сундук лиги',x:`+${fmt(r.coins)} кристаллов и +${r.tok} жетонов`});renderArena();persist()}catch(e){snd.error();pvErr(e)}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-pvgo],[data-pvrev],[data-pvdef],[data-pvatk],#pvFind,#pvLog,#pvTop,#pvRe,#pvChest');if(!t||t.disabled)return;const d=t.dataset;
  if(d.pvgo){if(!t.classList.contains('off'))pvFight(d.pvgo);else toast('Нет билетов на арену')}else if(d.pvrev)pvFight(null,d.pvrev);else if(d.pvdef)pvDef(d.pvdef);
  else if(d.pvatk){pvSt=d.pvatk;$$('[data-pvatk]').forEach(b=>{b.classList.toggle('on',b===t);b.setAttribute('aria-pressed',b===t)});hap('light')}
  else if(t.id==='pvFind')openArena();else if(t.id==='pvLog')openPvLog();else if(t.id==='pvTop')openPvTop();else if(t.id==='pvRe')pvReroll();else if(t.id==='pvChest'){if(t.classList.contains('off'))toast('Проведи 3 боя сегодня');else pvChest()}});
let EX=null,exAt=0,exBusy=false,exNote=0;
const exLeft=()=>EX&&EX.a?Math.max(0,EX.a.left-(now()-exAt)):0;
const EXI={1:'bolt',3:'meteor',6:'trophy',12:'flame',24:'crown'};
function exErr(e){toast({'403':'Отряд слишком слаб — прокачай аккаунт','409':'Отряд уже в пути','425':'Отряд ещё не вернулся','404':'Экспедиция уже завершена','400':'Некорректный запрос'}[e.message]||'Нет связи с сервером')}
async function loadExp(){if(!online){renderExp();return}try{const r=await API.post('/api/exp',{});EX=r.exp;exAt=now()}catch(e){}renderExp()}
function renderExp(){const el=$('#exp');if(!el)return;if(!online){el.innerHTML='<div class="empty">Экспедиции доступны, когда игра открыта в Telegram</div>';return}if(!EX){el.innerHTML='<div class="empty mono">Собираем отряд…</div>';return}const a=EX.a;let body;
 if(a){const l=exLeft(),pc=a.dur?1-l/a.dur:1;body=`<div class="bs-hp"><div class="bs-bar ex-bar"><i id="exBar" style="transform:scaleX(${pc})"></i></div><div class="bs-hpt mono"><span>${esc(a.n)} · ${a.h} ч</span><span id="exLeft">${l?'вернётся через '+fmtT(l):'отряд вернулся'}</span></div></div><button class="btn" id="exClaim"${l||exBusy?' disabled':''}>${ic(l?'clock':'bag')}${l?'Отряд в пути':'Забрать добычу'}</button>`}
 else body=`<div class="list ex-l">${EX.list.map((x,i)=>{const lock=x.ok===false;return`<div class="row${lock?' ex-lock':''}" style="--i:${i}"><div class="row-vis acc">${ic(lock?'lock':(EXI[x.h]||'clock'))}</div><div class="row-b"><div class="row-t">${esc(x.n)}<span class="tag">${x.h} ч</span></div><div class="row-d">+${fmt(x.coins)} кристаллов · +${x.tok} жет.${x.it?` · предмет ${Math.round(x.it*100)}%`:''}${x.bonus?` · бонус силы +${x.bonus}%`:''}</div><div class="row-d ex-req${lock?' bad':''}">${lock?'Нужно: '+esc((x.miss||[]).join(', ')):`LV ${x.lv} · сила ${fmt(x.pw||0)} · шахтёры ${x.mi||0}`}</div></div><button class="buy" data-exgo="${x.k}"${exBusy||lock?' disabled':''}>${ic(lock?'lock':'target')}${lock?'Закрыто':'В путь'}</button></div>`}).join('')}</div>`;
 el.innerHTML=`<div class="bs ex"><div class="bs-h"><div class="bs-ic">${ic('clock')}</div><div class="bs-tt"><div class="bs-k mono">PvE · экспедиции${EX.n?' · сделано '+EX.n:''}</div><div class="bs-n">${a?'Отряд в пути':'Отправь отряд'}</div><div class="bs-d">${EX.me?`Отряд: LV ${EX.me.lv} · сила ${fmt(EX.me.pw)} · шахтёры ${EX.me.mi}. `:''}Чем сильнее аккаунт, тем дальше экспедиции и богаче добыча. Пришлём сообщение, когда отряд вернётся</div></div></div>${body}</div>`}
async function exGo(k){if(exBusy)return;exBusy=true;hap('medium');try{const r=await API.post('/api/expgo',{k,state:S});EX=r.exp;exAt=now();exNote=0;snd.buy();toast(`Отряд ушёл: ${EX.a.n}`)}catch(e){snd.error();hap('error');exErr(e);loadExp()}exBusy=false;renderExp()}
async function exClaim(){if(exBusy||!EX||!EX.a||exLeft())return;exBusy=true;renderExp();let r;try{r=await vCall('/api/expdone')}catch(e){exBusy=false;snd.error();hap('error');exErr(e);loadExp();return}
 exBusy=false;EX=r.exp;exAt=now();exNote=0;applyGrants(r.grants||[]);snd.level();hap('success');
 modal({vis:thumb('bag'),k:'Экспедиция вернулась',t:`+${fmt(r.coins)} кристаллов`,x:`${esc(r.name)}: +<b>${r.tok}</b> жетонов${r.item?'<br><b>Найден предмет</b> — он уже в хранилище':''}.<br>Отправь отряд снова — добыча ждёт.`});
 renderExp();persist()}
function exTimer(){if(!EX||!EX.a)return;const l=exLeft();if(!l&&!exNote){exNote=1;if(tab!=='friends'){toast('Отряд вернулся — забери добычу в гильдии');hap('success')}else renderExp()}if(tab!=='friends')return;const t=$('#exLeft'),b=$('#exBar');if(t)t.textContent=l?'вернётся через '+fmtT(l):'отряд вернулся';if(b&&EX.a.dur)b.style.transform=`scaleX(${1-l/EX.a.dur})`}
setInterval(exTimer,1000);

let TW=null,twBusy=false,twStance='bal';
const TWK=['Этаж','Босс','Титан'];
async function loadTower(){if(!online){renderTower();return}try{const r=await API.post('/api/tower',{});TW=r.tower}catch(e){}renderTower()}
function renderTower(){const el=$('#tower');if(!el)return;if(!online){el.innerHTML='<div class="empty">Башня доступна, когда игра открыта в Telegram</div>';return}if(!TW){el.innerHTML='<div class="empty mono">Поднимаемся по башне…</div>';return}const w=TW,f=w.foe,toB=w.nb-w.f;
 el.innerHTML=`<div class="bs tw${w.k?' tw-b':''}"><div class="bs-h"><div class="bs-ic">${ic(w.k?'flame':'up')}</div><div class="bs-tt"><div class="bs-k mono">PvE · бесконечная башня · этаж ${w.f}</div><div class="bs-n">${esc(f.name)}${w.k?`<span class="tag">${TWK[w.k]}</span>`:''}</div><div class="bs-d">${w.k?'Страж этажа — награда в разы больше':`До босса ${toB} ${plural(toB,'этаж','этажа','этажей')}`} · рекорд ${w.best} · ${pvOdds(w.me.pw,f.pw)}</div></div></div>`+
 `<div class="ar-s"><div><b class="mono">${fmt(w.me.pw)}</b><span>Твоя сила</span></div><div><b class="mono">${fmt(f.pw)}</b><span>Сила врага</span></div><div><b class="mono">+${fmt(w.rw.coins)}</b><span>Награда${w.rw.tok?' · '+w.rw.tok+' жет.':''}</span></div></div>`+
 `<div class="ar-def"><div class="ar-dk">Стойка в башне: <b>${PST[twStance].n}</b> · ${PST[twStance].d}</div><div class="seg" role="group" aria-label="Стойка в башне">${Object.keys(PST).map(k=>`<button data-twst="${k}" class="${twStance===k?'on':''}" aria-pressed="${twStance===k}">${PST[k].n}</button>`).join('')}</div></div>`+
 `<div class="bs-a"><button class="btn" id="twGo"${w.n&&!twBusy?'':' disabled'}>${ic('target')}${w.n?`Штурм · ${w.n}/${w.max}`:'Попытки вернутся завтра'}</button><button class="btn ghost square" id="twTop" aria-label="Рейтинг башни">${ic('chart')}</button></div>`+
 `<div class="bs-f"><span>Победа поднимает на этаж выше и не тратит попытку. Каждые 5 этажей — босс, каждые 25 — титан. Башня не заканчивается.</span></div></div>`}
async function twFight(){if(twBusy||!TW)return;if(!TW.n){snd.error();hap('error');toast('Попытки на сегодня закончились');return}twBusy=true;renderTower();hap('medium');let r;
 try{r=await vCall('/api/towerfight',{st:twStance,state:S})}catch(e){twBusy=false;snd.error();hap('error');toast({'402':'Попытки на сегодня закончились'}[e.message]||'Нет связи с сервером');loadTower();return}
 twBusy=false;TW=r.tower;applyGrants(r.grants||[]);persist();renderTower();pvReplay(Object.assign({title:`Башня · этаж ${r.f}`},r),twResult)}
function twResult(r){const el=$('#pvRes');if(!el)return;const w=r.win;if(w){snd.level();hap('success')}else{snd.error();hap('warning')}const rw=[];if(r.coins)rw.push(`+${fmt(r.coins)} кристаллов`);if(r.tok)rw.push(`+${r.tok} жетонов`);if(r.item)rw.push('предмет в хранилище');const T=r.tower;
 el.innerHTML=`<div class="pv-r${w?' win':''}"><div class="pv-rk">${w?(r.k===2?'Титан повержен':r.k?'Босс повержен':'Этаж пройден'):'Поражение'}</div><div class="pv-rd mono">Этаж ${r.f}${w?' → '+T.f:''} · попыток ${T.n}/${T.max}</div><div class="pv-rw${rw.length?'':' muted'}">${rw.length?rw.join(' · '):'Усиль кузню или смени стойку и попробуй снова'}</div></div><div class="pv-ra"><button class="btn ghost" id="twMore"${T.n?'':' disabled'}>${w?'Следующий этаж':'Ещё раз'}</button><button class="btn" id="twDone">Готово</button></div>`;
 $('#twMore').onclick=twFight;$('#twDone').onclick=closeSheet}
async function twTop(){sheet(`<h2 class="sh-h" id="shTitle">Рейтинг башни</h2><div class="bs-help">Место зависит от самого высокого пройденного этажа. При равном рекорде выше тот, кто добрался раньше.</div><div class="list" id="twTopL"><div class="empty mono">Загрузка…</div></div>`);
 try{const r=await API.post('/api/towertop');const row=(u,i)=>`<div class="row${u.me?' me':''}" style="--i:${Math.min(i,12)}"><div class="rank r${u.rank}">${String(u.rank).padStart(2,'0')}</div><div class="row-b"><div class="row-t">${esc(u.name)}</div><div class="row-d">LV ${u.lvl}</div></div><span class="tval">${u.best} эт.</span></div>`;let h=r.top.map(row).join('');if(r.me&&!r.top.some(u=>u.me))h+=row(r.me,50);const el=$('#twTopL');if(el)el.innerHTML=h||'<div class="empty">Пока никто не поднимался</div>'}
 catch(e){const el=$('#twTopL');if(el)el.innerHTML='<div class="empty">Не удалось загрузить рейтинг</div>'}}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-exgo],[data-twst],#exClaim,#twGo,#twTop');if(!t||t.disabled)return;const d=t.dataset;
 if(d.exgo)exGo(d.exgo);else if(d.twst){twStance=d.twst;renderTower();hap('light')}else if(t.id==='exClaim')exClaim();else if(t.id==='twGo')twFight();else twTop()});
function bind(){
  $('#balIc').innerHTML=ic('gem');$('#enIc').innerHTML=ic('bolt');$('#heatIc').innerHTML=ic('flame');$('#refIc').innerHTML=ic('refresh');$('#settingsBtn').innerHTML=ic('gear');$('#shClose').innerHTML=ic('close');$('#shareBtn').innerHTML=ic('share')+'Пригласить';$('#copyBtn').innerHTML=ic('copy');$$('.n-ic').forEach(e=>e.innerHTML=ic(e.dataset.ic));
  const u=TG&&TG.initDataUnsafe&&TG.initDataUnsafe.user;if(u){const nm=[u.first_name,u.last_name].filter(Boolean).join(' ')||u.username||'Игрок';$('#uname').textContent=nm;const av=$('#avatar');if(u.photo_url){av.style.backgroundImage=`url("${u.photo_url}")`;av.textContent=''}else av.textContent=nm[0].toUpperCase()}else $('#avatar').textContent='К';
  const cv=$('#crystal');cv.tabIndex=0;
  cv.addEventListener('pointerdown',e=>{e.preventDefault();snd.init();if(!forge||!forge.r.ok||forge.hit(e.clientX,e.clientY))doTap(e.clientX,e.clientY)});
  cv.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();const r=cv.getBoundingClientRect();doTap(r.left+r.width/2,r.top+r.height*.47)}});
  document.addEventListener('pointerdown',()=>{if(!snd.ctx){snd.init();snd.sfx=S.set.snd;if(S.set.mus)snd.setMusic(true)}},{capture:true});
  $$('.nav button').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  $$('#buyMode button').forEach(b=>b.addEventListener('click',()=>{bm=b.dataset.bm;$$('#buyMode button').forEach(x=>x.classList.toggle('on',x===b));hap('light');refreshUps()}));
  $('#meteor').addEventListener('click',catchMeteor);
  $('#refillBtn').addEventListener('click',()=>{refillDay();if(S.refills<=0){toast('Бесплатные восстановления закончились');return}S.refills--;S.energy=maxEnergy();snd.coin();hap('success');toast('Энергия восстановлена');persist()});
  $('#dailyBtn').addEventListener('click',claimDaily);
  $('#settingsBtn').addEventListener('click',openSettings);$('#profileBtn').addEventListener('click',openProfile);
  $('#shClose').addEventListener('click',closeSheet);$('#scrim').addEventListener('click',closeSheet);
  addEventListener('keydown',e=>{if(e.key==='Escape'){if(mOpen)$('#mBtn').click();else closeSheet()}});
  $('#copyBtn').addEventListener('click',async()=>{const link=inviteLink();if(!link){toast('Ссылка появится, когда игра подключится к боту');return}try{await navigator.clipboard.writeText(link);toast('Ссылка скопирована')}catch(e){toast(link)}hap('light')});
  $('#shareBtn').addEventListener('click',()=>{const link=inviteLink();if(!link){toast('Ссылка появится, когда игра подключится к боту');return}const text='Добывай кристаллы вместе со мной в Crystal Forge. По моей ссылке — 100 000 кристаллов в подарок.';const url=`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;hap('medium');if(TG&&TG.openTelegramLink&&IN_TG)TG.openTelegramLink(url);else window.open(url,'_blank')});
  document.addEventListener('click',e=>{const t=e.target.closest('[data-art],[data-trans],#dustBtn,[data-craft],[data-use],[data-up],[data-star],[data-skin],[data-task],[data-ach],[data-inspect],[data-set],#reforgeBtn');if(!t)return;const d=t.dataset;
    if(d.art)craftArt(d.art);else if(d.trans)transmute(d.trans);else if(t.id==='dustBtn')dust();else if(d.craft)craft(d.craft);else if(d.use)useCons(d.use);else if(d.up)buyUp(d.up);else if(d.star)buyStars(d.star);else if(d.skin){S.skin=d.skin;if(!S.owned.includes(d.skin))S.owned.push(d.skin);applySkin();snd.buy();hap('medium');renderShop();persist()}
    else if(d.task)claimTask(d.task);
    else if(d.ach)showAch(d.ach);else if(d.inspect)inspect(d.inspect);else if(t.id==='reforgeBtn')doReforge();
    else if(d.set){const k=d.set;S.set[k]=!S.set[k];t.setAttribute('aria-checked',S.set[k]);if(k==='snd')snd.sfx=S.set[k];if(k==='mus'){snd.init();snd.setMusic(S.set[k])}if(k==='fx')document.body.classList.toggle('lowfx',!S.set.fx);if(k==='vib'&&S.set.vib)hap('medium');persist()}});
  document.addEventListener('keydown',e=>{const t=e.target.closest&&e.target.closest('[data-inspect]');if(t&&(e.key==='Enter'||e.key===' ')){e.preventDefault();inspect(t.dataset.inspect)}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){persist();syncSave()}else{offline();claim()}});
  addEventListener('pagehide',persist)}

const frame=()=>new Promise(r=>requestAnimationFrame(()=>r()));
async function boot(){const fill=$('#ldFill'),txt=$('#ldTxt');const step=(p,t)=>{fill.style.transform=`scaleX(${p})`;if(t)txt.textContent=t};
  if(TG){try{TG.ready();TG.expand();TG.setHeaderColor&&TG.setHeaderColor('#0d0c0b');TG.setBackgroundColor&&TG.setBackgroundColor('#0d0c0b');TG.disableVerticalSwipes&&TG.disableVerticalSwipes()}catch(e){}}
  bind();document.body.classList.toggle('lowfx',!S.set.fx);snd.sfx=S.set.snd;step(.1,'Разогрев горна');await frame();
  try{embers=new Embers($('#bg'))}catch(e){}try{sparks=new Sparks($('#fx'))}catch(e){}try{forge=new Forge($('#crystal'))}catch(e){forge=null}applySkin();step(.2,'Огранка моделей');await frame();
  try{th=new Thumbs(160)}catch(e){th=null}
  const keys=[...TAP_UPS.map(u=>u.m),...MINERS.map(m=>m.m),...SHOP.map(s=>s.id),'meteor','friends','forge'];
  for(let i=0;i<keys.length;i++){thumb(keys[i]);if(i%3===2){step(.2+.5*i/keys.length);await frame()}}
  for(const s of SKINS)gemThumb(s);step(.75,'Связь с гильдией');await frame();
  await Promise.race([syncLoad(),new Promise(r=>setTimeout(r,3500))]);if(online)loadExp();
  refillDay();if(!S.runStart&&S.runStart!==0)S.runStart=0;S.energy=Math.min(S.energy,maxEnergy());dispCoins=S.coins;applySkin();prevLevel=level();
  step(1,'Готово');await new Promise(r=>setTimeout(r,280));$('#loader').classList.add('hide');
  S.vis=Object.assign({},S.vis||{});if(!S.tutV){S.tutV=2;if(S.onb||S.total>2e4||S.taps>300)S.tut=TUT.length;else{S.tut=0;S.tutT=S.st.play||0}}else if(S.tutV<2){S.tutV=2;if(S.tut>=TUT.length-1)S.tut=TUT.length}offline();tutUI();if(!S.onb)onboarding();persist();requestAnimationFrame(t=>{last=t;loop(t)})}
boot();

let ADM_U=null,ADM_ST=null,ADM_TAB='user',ADM_INFO=null,ADM_LIST=[],ADM_OUT='';
const ADM_R=['Обычный','Редкий','Эпический','Мифический','Легендарный'];
const ADM_K=[['coins','Кристаллы'],['tok','Жетоны'],['shards','Осколки'],['ess','Эссенция'],['energy','Энергия'],['refills','Восстановления энергии'],['tk','Билеты арены'],['pr','Рейтинг арены'],['tower','Этажи башни'],['lvl','Уровень (установить)']];
const ADM_E={'403':'Нет доступа','404':'Игрок не найден','400':'Некорректный запрос','401':'Нет авторизации Telegram'};
function admUi(){let b=$('#admBtn');if(!CFG.admin){if(b)b.remove();return}if(!b){b=document.createElement('button');b.className='icon-btn adm-btn';b.id='admBtn';b.type='button';b.setAttribute('aria-label','Админ-панель');b.innerHTML=ic('crown');b.addEventListener('click',()=>admOpen());const s=$('#settingsBtn');s.parentNode.insertBefore(b,s)}if((/[?&]adm=1/.test(location.search)||(TG&&TG.initDataUnsafe&&TG.initDataUnsafe.start_param==='adm'))&&!admUi.done){admUi.done=1;setTimeout(()=>admOpen(),700)}}
async function admCall(p,b){try{return await API.post('/api/adm/'+p,b||{})}catch(e){toast(ADM_E[e.message]||'Ошибка сервера');hap('error');throw e}}
async function admOpen(){if(!CFG.admin)return;try{const r=await admCall('me');ADM_INFO=r.stats;CFG.owner=r.owner;if(!ADM_U)await admLoad(r.uid,true)}catch(e){return}admPaint()}
async function admLoad(id,quiet){const r=await admCall('user',{id});ADM_U=r.user;ADM_ST=r.state;if(!quiet)admPaint()}
async function admSelf(){if(ADM_U&&String(ADM_U.id)===String(CFG.uid)){await claim();try{await syncVault()}catch(e){}renderAll()}}
function renderAll(){try{renderShop()}catch(e){}try{if(tab==='craft')renderCraft()}catch(e){}dirty=true}
function admPaint(){const h=admHtml();if(shOn&&$('#admRoot'))$('#shBody').innerHTML=h;else sheet(h)}
function admV(id){const e=$('#'+id);return e?e.value:''}
function admTag(t,c){return`<span class="adm-tag${c?' '+c:''}">${t}</span>`}
function admHtml(){const tabs=[['user','Игроки'],['world','Мир'],['bc','Рассылка']].map(([k,n])=>`<button type="button" data-admtab="${k}" class="${ADM_TAB===k?'on':''}">${n}</button>`).join('');
  return`<div id="admRoot" class="adm"><h2 class="sh-h" id="shTitle">Админ-панель</h2><div class="adm-row adm-crm"><button type="button" class="btn" data-adm="crm">Открыть CRM-систему</button></div><div class="adm-tabs">${tabs}</div>${ADM_TAB==='user'?admUserHtml():ADM_TAB==='world'?admWorldHtml():admBcHtml()}${ADM_OUT?`<div class="adm-out mono">${esc(ADM_OUT)}</div>`:''}</div>`}
function admUserHtml(){const u=ADM_U,I=ADM_INFO||{};
  const list=ADM_LIST.length?`<div class="adm-list">${ADM_LIST.map(x=>`<button type="button" class="adm-it${u&&u.id===x.id?' on':''}" data-admu="${esc(x.id)}"><span>${esc(x.name)} <span class="muted mono">${esc(x.id)}</span></span><span>LV ${x.lvl}${x.admin?admTag('админ'):''}${x.free?admTag('free'):''}${x.ban?admTag('бан','red'):''}</span></button>`).join('')}</div>`:'';
  let h=`<div class="adm-sec"><h4>Поиск игрока</h4><div class="adm-row"><input id="admQ" placeholder="ID или имя" autocomplete="off"><button type="button" class="btn" data-adm="find">Найти</button><button type="button" class="btn ghost" data-adm="self">Я</button></div>${list}</div>`;
  if(!u)return h;
  const g=[['Уровень',u.lvl],['Кристаллы',fmt(u.coins)],['Всего добыто',fmt(u.total)],['Жетоны',u.tok],['Предметы',u.items],['Осколки',u.shards],['Эссенция',u.ess],['Энергия',u.energy],['Рейтинг арены',u.pr],['Билеты',u.tk],['Башня',`${u.tf} / ${u.tb}`],['Серия',u.streak],['Друзья',u.refs],['Потрачено ⭐',u.spent]].map(([k,v])=>`<div>${k}<b class="mono">${v}</b></div>`).join('');
  const fl=(k,on,t)=>`<button type="button" class="btn${on?'':' ghost'}" data-adm="flag" data-k="${k}" data-on="${on?0:1}">${t}: ${on?'ВКЛ':'ВЫКЛ'}</button>`;
  h+=`<div class="adm-sec"><h4>${esc(u.name)} <span class="mono muted">${esc(u.id)}</span>${u.owner?admTag('владелец'):u.admin?admTag('админ'):''}${u.ban?admTag('бан','red'):''}</h4><div class="adm-grid">${g}</div><div class="adm-row"><button type="button" class="btn ghost" data-adm="reload">Обновить</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Права</h4><div class="adm-row">${fl('free',u.freeOwn,'Бесплатные ⭐ покупки')}</div>${u.free&&!u.freeOwn?'<div class="muted adm-note">Уже покупает бесплатно: админ или включено для всех</div>':''}<div class="adm-row">${!u.owner&&CFG.owner?fl('admin',u.admin,'Админ'):''}${!u.owner?fl('ban',u.ban,'Бан'):''}</div></div>`;
  h+=`<div class="adm-sec"><h4>Ресурсы</h4><div class="adm-row"><select id="admKind">${ADM_K.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select><input id="admN" type="number" inputmode="numeric" placeholder="Количество" value="100000"></div><div class="adm-row"><button type="button" class="btn" data-adm="give">+ Выдать</button><button type="button" class="btn ghost" data-adm="take">− Забрать</button></div><div class="adm-row"><button type="button" class="btn ghost" data-adm="tries">Вернуть попытки башни, босса и билеты</button></div></div>`;
  const items=I.items||{};
  h+=`<div class="adm-sec"><h4>Товар из лавки без оплаты</h4><div class="adm-row"><select id="admItem">${Object.entries(items).map(([k,t])=>`<option value="${k}">${esc(t)}</option>`).join('')}</select><input id="admItemN" type="number" value="1" min="1" max="20"></div><div class="adm-row"><button type="button" class="btn" data-adm="shop">Выдать товар</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Снаряжение</h4><div class="adm-row"><select id="admR">${ADM_R.map((n,i)=>`<option value="${i}"${i===4?' selected':''}>${n}</option>`).join('')}</select><select id="admB"><option value="">Случайный предмет</option>${(I.gids||[]).map(x=>`<option value="${x}">${esc(GB&&GB[x]&&GB[x].name?GB[x].name:x)}</option>`).join('')}</select></div><div class="adm-row"><input id="admGN" type="number" value="1" min="1" max="40" placeholder="Сколько"><input id="admGL" type="number" value="0" min="0" max="12" placeholder="Заточка"></div><div class="adm-row"><button type="button" class="btn" data-adm="gear">Выдать предметы</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Любое поле</h4><div class="muted adm-note">state.… — сохранение, v.… — хранилище, p.… — арена, tw.… — башня, ex.… — экспедиции. Значение — число, текст или JSON.</div><div class="adm-row"><input id="admPath" placeholder="state.ups.tap" autocomplete="off"><input id="admVal" placeholder="Значение" autocomplete="off"></div><div class="adm-row"><button type="button" class="btn ghost" data-adm="get">Прочитать</button><button type="button" class="btn" data-adm="set">Записать</button><button type="button" class="btn ghost" data-adm="unset">Удалить</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Сохранение целиком (JSON)</h4><textarea id="admJson" spellcheck="false">${esc(JSON.stringify(ADM_ST||{},null,1))}</textarea><div class="adm-row"><button type="button" class="btn" data-adm="state">Сохранить JSON</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Сообщение игроку</h4><div class="adm-row"><input id="admMsg" placeholder="Текст в бота"><button type="button" class="btn" data-adm="msg">Отправить</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Опасно</h4><div class="adm-row"><button type="button" class="btn adm-danger" data-adm="reset">Сбросить прогресс игрока</button></div></div>`;
  return h}
function admWorldHtml(){const I=ADM_INFO||{},B=I.bal||{},bs=I.boss||{};
  const st=[['Игроков',I.users],['DAU',I.dau],['Платящих',I.payers],['Выручка ⭐',I.stars],['Платежей',I.payments],['Бесплатных покупок',I.freeBuys],['Античит',I.ac],['Сезон',I.season]].map(([k,v])=>`<div>${k}<b class="mono">${v==null?'—':v}</b></div>`).join('');
  let h=`<div class="adm-sec"><h4>Статистика</h4><div class="adm-grid">${st}</div><div class="adm-row"><button type="button" class="btn ghost" data-adm="stats">Обновить</button><button type="button" class="btn ghost" data-adm="report">Отчёт по балансу</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Бесплатные покупки за ⭐</h4><div class="adm-row"><button type="button" class="btn${I.freeAll?'':' ghost'}" data-adm="freeall" data-on="${I.freeAll?0:1}">Для всех игроков: ${I.freeAll?'ВКЛ':'ВЫКЛ'}</button></div><div class="muted adm-note">Отдельные игроки: ${(I.freeUsers||[]).map(esc).join(', ')||'нет'}. Админы покупают бесплатно всегда.</div></div>`;
  h+=`<div class="adm-sec"><h4>Баланс (множители)</h4><div class="adm-row">${[['cost','Цены'],['pps','Добыча'],['tap','Удар'],['off','Офлайн']].map(([k,n])=>`<label class="adm-lbl">${n}<input type="number" step="0.05" data-bal="${k}" value="${B[k]==null?1:B[k]}"></label>`).join('')}</div><div class="adm-row"><button type="button" class="btn" data-adm="bal">Применить</button><button type="button" class="btn ghost" data-adm="balreset">Сбросить</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Босс гильдии</h4><div class="muted adm-note">${esc(bs.name||'')} · ур. ${bs.lvl||'—'} · ${fmt(bs.hp)} / ${fmt(bs.max)} HP</div><div class="adm-row"><input id="admHp" type="number" placeholder="HP"><button type="button" class="btn ghost" data-adm="bosshp">Задать HP</button></div><div class="adm-row"><button type="button" class="btn ghost" data-adm="bossend">Завершить босса сейчас</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Любой параметр мира</h4><div class="muted adm-note">bal.…, boss.…, season.…, market, freeAll, free, ban, payments</div><div class="adm-row"><input id="admWPath" placeholder="season.end" autocomplete="off"><input id="admWVal" placeholder="Значение" autocomplete="off"></div><div class="adm-row"><button type="button" class="btn ghost" data-adm="wget">Прочитать</button><button type="button" class="btn" data-adm="wset">Записать</button></div></div>`;
  h+=`<div class="adm-sec"><h4>Админы</h4><div class="muted adm-note">Владельцы: ${(I.owners||[]).map(esc).join(', ')}<br>Админы: ${(I.admins||[]).map(esc).join(', ')||'нет'}<br>Забанены: ${(I.bans||[]).map(esc).join(', ')||'нет'}</div></div>`;
  return h}
function admBcHtml(){return`<div class="adm-sec"><h4>Рассылка всем игрокам</h4><textarea id="admBc" placeholder="Текст сообщения"></textarea><div class="adm-row"><button type="button" class="btn" data-adm="bcast">Отправить всем</button></div></div>`}
async function admAct(t){const d=t.dataset,a=d.adm,u=ADM_U,id=u&&u.id;ADM_OUT='';hap('light');if(a==='crm'){location.href='/admin.html';return}
  try{
  if(a==='find'){const r=await admCall('find',{q:admV('admQ')});ADM_LIST=r.list;if(!r.list.length)toast('Никого не найдено');admPaint();return}
  if(a==='self'){await admLoad(CFG.uid);return}
  if(a==='reload'){await admLoad(id);return}
  if(a==='stats'||a==='report'){const r=await admCall('stats');ADM_INFO=r.stats;if(a==='report')ADM_OUT=r.text;admPaint();return}
  let r=null;
  if(a==='give'||a==='take'){const n=Math.abs(Math.trunc(+admV('admN')||0));if(!n){toast('Укажи количество');return}const k=admV('admKind');r=await admCall('give',{id,kind:k,n:a==='take'&&k!=='lvl'?-n:n})}
  else if(a==='tries')r=await admCall('give',{id,kind:'tries'});
  else if(a==='shop')r=await admCall('give',{id,kind:'shop',item:admV('admItem'),n:+admV('admItemN')||1});
  else if(a==='gear')r=await admCall('give',{id,kind:'gear',r:+admV('admR'),b:admV('admB'),n:+admV('admGN')||1,l:+admV('admGL')||0});
  else if(a==='flag')r=await admCall('flag',{id,k:d.k,on:d.on==='1'});
  else if(a==='get'){const x=await admCall('get',{id,path:admV('admPath')});ADM_OUT=JSON.stringify(x.value,null,1);if(ADM_OUT===undefined)ADM_OUT='undefined';admPaint();return}
  else if(a==='set'||a==='unset'){if(!admV('admPath')){toast('Укажи путь');return}r=await admCall('set',{id,path:admV('admPath'),value:admV('admVal'),del:a==='unset'});ADM_OUT=admV('admPath')+' = '+JSON.stringify(r.value)}
  else if(a==='state')r=await admCall('state',{id,state:admV('admJson')});
  else if(a==='msg'){await admCall('msg',{id,text:admV('admMsg')});toast('Отправлено');return}
  else if(a==='reset'){if(!confirm('Сбросить весь прогресс игрока '+u.name+'?'))return;r=await admCall('reset',{id})}
  else if(a==='freeall'){const x=await admCall('freeall',{on:d.on==='1'});ADM_INFO=x.stats;CFG.free=CFG.admin||ADM_INFO.freeAll;admPaint();return}
  else if(a==='bal'||a==='balreset'){const set={};$$('[data-bal]').forEach(e=>set[e.dataset.bal]=+e.value||1);const x=await admCall('bal',a==='bal'?{set}:{reset:1});ADM_INFO=x.stats;CFG.bal=ADM_INFO.bal;toast('Баланс обновлён');renderAll();admPaint();return}
  else if(a==='bosshp'||a==='bossend'){const x=await admCall('boss',a==='bosshp'?{hp:+admV('admHp')||0}:{end:1});ADM_INFO=x.stats;admPaint();return}
  else if(a==='wget'||a==='wset'){const p=admV('admWPath');if(!p){toast('Укажи путь');return}const x=await admCall(a==='wget'?'wget':'world',{path:p,value:admV('admWVal')});ADM_OUT=p+' = '+JSON.stringify(x.value,null,1);if(a==='wset'){const s=await admCall('me');ADM_INFO=s.stats}admPaint();return}
  else if(a==='bcast'){const t2=admV('admBc').trim();if(!t2){toast('Пустой текст');return}if(!confirm('Отправить всем игрокам?'))return;const x=await admCall('bcast',{text:t2});toast('В очереди: '+x.n);return}
  if(r){if(r.user)ADM_U=r.user;if(r.state)ADM_ST=r.state;else if(r.user){const f=await admCall('user',{id});ADM_ST=f.state}if(r.note)ADM_OUT=r.note;toast('Готово');hap('success');if(a==='flag'&&String(id)===String(CFG.uid))CFG.free=r.user.free;await admSelf();admPaint()}
  }catch(e){}}
document.addEventListener('click',e=>{const t=e.target.closest('[data-adm],[data-admtab],[data-admu]');if(!t||!$('#admRoot'))return;e.preventDefault();if(t.dataset.admtab){ADM_TAB=t.dataset.admtab;ADM_OUT='';admPaint();return}if(t.dataset.admu){admLoad(t.dataset.admu).catch(()=>{});return}admAct(t)});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target&&e.target.id==='admQ'){e.preventDefault();const b=document.querySelector('[data-adm="find"]');b&&admAct(b)}});
