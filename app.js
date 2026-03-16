// ══════════════════════════════════════════════════
// FRANÇAIS POSÉ — app.js  v6
// ══════════════════════════════════════════════════

let DB={p:[]};
const DB_KEY='frDB4';
function saveDB(){try{localStorage.setItem(DB_KEY,JSON.stringify(DB));}catch(e){}}
function loadDB(){try{const d=localStorage.getItem(DB_KEY);if(d)DB=JSON.parse(d);}catch(e){}}
function mkProf(name,av){return{name,av,xp:0,totalQ:0,perfectRounds:0,maxCombo:0,
  conjOk:0,homoOk:0,orthoOk:0,synoOk:0,revisionDone:0,
  badges:[],history:[],errors:[],typeStats:{},
  streak:0,lastPlayed:'',bestStreak:0};}
function curP(){return DB.p[cur]||null;}

// ══════════════════════════════════════════════════
// STREAK
function todayStr(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function updateStreak(){
  const p=curP();if(!p)return;
  const today=todayStr();
  if(p.lastPlayed===today)return; // déjà joué aujourd'hui
  const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);
  const yStr=yesterday.getFullYear()+'-'+(yesterday.getMonth()+1)+'-'+yesterday.getDate();
  if(p.lastPlayed===yStr){p.streak=(p.streak||0)+1;}
  else if(p.lastPlayed!==today){p.streak=1;}
  p.bestStreak=Math.max(p.bestStreak||0,p.streak);
  p.lastPlayed=today;
  saveDB();
}

// ══════════════════════════════════════════════════
// SRS — Spaced Repetition System
const SRS_DAY=86400000; // 1 jour en ms
function srsNext(interval){return Date.now()+interval*SRS_DAY;}
function storeSRS(q){
  const p=curP();if(!p)return;
  if(!p.errors)p.errors=[];
  const key=q.t+(q.verb||'')+(q.tense||'')+(q.pi||0)+(q.phrase||'')+(q.mot||'')+(q.correct||'');
  const existing=p.errors.find(e=>{
    const ek=e.t+(e.verb||'')+(e.tense||'')+(e.pi||0)+(e.phrase||'')+(e.mot||'')+(e.correct||'');
    return ek===key;
  });
  if(existing){
    // Renforce l'erreur : repasse à intervalle 1
    existing.srs_interval=1;existing.srs_next=srsNext(1);existing.srs_ease=existing.srs_ease||2.5;
  }else{
    const copy={...q,choices:q.choices,srs_interval:1,srs_next:srsNext(1),srs_ease:2.5};
    p.errors.unshift(copy);
    if(p.errors.length>60)p.errors.length=60;
  }
  saveDB();
}
function advanceSRS(q){
  // Appelé quand on réussit une question en mode révision
  const p=curP();if(!p||!p.errors)return;
  const key=q.t+(q.verb||'')+(q.tense||'')+(q.pi||0)+(q.phrase||'')+(q.mot||'')+(q.correct||'');
  const e=p.errors.find(e=>{
    const ek=e.t+(e.verb||'')+(e.tense||'')+(e.pi||0)+(e.phrase||'')+(e.mot||'')+(e.correct||'');
    return ek===key;
  });
  if(!e)return;
  const ease=e.srs_ease||2.5;
  const newInt=Math.min(Math.round((e.srs_interval||1)*ease),30);
  e.srs_interval=newInt;e.srs_next=srsNext(newInt);
  // Si intervalle très long → retirer de la liste d'erreurs
  if(newInt>=30){
    p.errors=p.errors.filter(er=>{
      const ek=er.t+(er.verb||'')+(er.tense||'')+(er.pi||0)+(er.phrase||'')+(er.mot||'')+(er.correct||'');
      return ek!==key;
    });
  }
  saveDB();
}
function srsDueCount(){
  const p=curP();if(!p||!p.errors)return 0;
  return p.errors.filter(e=>!e.srs_next||e.srs_next<=Date.now()).length;
}
function srsDueErrors(){
  const p=curP();if(!p||!p.errors)return[];
  return p.errors.filter(e=>(!e.srs_next||e.srs_next<=Date.now())&&!e._invalid);
}

// ══════════════════════════════════════════════════
// SONS — Web Audio API (pas de fichiers)
let soundOn=true;
let AC=null;
function getAC(){if(!AC&&typeof AudioContext!=='undefined'){try{AC=new AudioContext();}catch(e){}}return AC;}
function beep(freq,dur,type='sine',vol=0.28,delay=0){
  const ac=getAC();if(!ac||!soundOn)return;
  try{
    const o=ac.createOscillator(),g=ac.createGain();
    o.connect(g);g.connect(ac.destination);
    o.type=type;o.frequency.value=freq;
    const t=ac.currentTime+delay;
    g.gain.setValueAtTime(0.001,t);g.gain.linearRampToValueAtTime(vol,t+0.01);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.start(t);o.stop(t+dur+0.05);
  }catch(e){}
}
function sfxOk(comboN){
  if(comboN>=3){[523,659,784].forEach((f,i)=>beep(f,0.1,'sine',0.22,i*0.07));}
  else{beep(440,0.06,'sine',0.2);beep(554,0.1,'sine',0.18,0.06);}
}
function sfxWrong(){beep(160,0.18,'sawtooth',0.15);}
function sfxCombo(){[523,659,784,1047].forEach((f,i)=>beep(f,0.1,'sine',0.22,i*0.08));}
function sfxResult(pct){
  if(pct>=90){[523,659,784,1047,1319].forEach((f,i)=>beep(f,0.12,'sine',0.2,i*0.09));}
  else if(pct>=60){beep(440,0.1,'sine',0.2);beep(554,0.15,'sine',0.2,0.1);}
  else{beep(220,0.25,'sawtooth',0.12);}
}
function toggleSound(){
  soundOn=!soundOn;
  const btn=document.getElementById('snd-btn');
  if(btn){btn.textContent=soundOn?'🔊':'🔇';btn.classList.toggle('muted',!soundOn);}
  if(soundOn){sfxOk(0);} // petit bip de confirmation
}


// ══════════════════════════════════════════════════
// STATE
let cur=0,curOp='conj_pres',isMix=false,isRev=false;
let targetVerb=localStorage.getItem('frTargetVerb')||null;
let selLvls=['CP'],qCount=5,chronoMode='libre';
let ctmLeft=0,ctmID=null;
let qs=[],qi=0,ans=[],combo=0,sessXP=0;
let recentKeys=new Set(); // anti-répétition dans une session
let blocked=false,triesLeft=2;
let qStartTime=0,curQ=null;
const MAX_TRIES=2;

// ══════════════════════════════════════════════════
// UTILS
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function pickFresh(arr,keyFn){
  const fresh=arr.filter(x=>!recentKeys.has(keyFn(x)));
  const pool=fresh.length?fresh:arr;
  const chosen=pool[Math.floor(Math.random()*pool.length)];
  const k=keyFn(chosen);
  recentKeys.add(k);if(recentKeys.size>20)recentKeys=new Set([...recentKeys].slice(-10));
  return chosen;
}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function maxLvlI(){return Math.max(...selLvls.map(lvlIdx));}
function compatVerbs(){
  const m=maxLvlI();
  let pool=VERB_LIST.filter(v=>lvlIdx(v[4])<=m);
  if(targetVerb)pool=pool.filter(v=>v[0]===targetVerb);
  return pool.length?pool:VERB_LIST.filter(v=>lvlIdx(v[4])<=m); // fallback si verbe hors niveau
}

// ══════════════════════════════════════════════════
// CONJUGATION ENGINE
function conjForm(verb,tense,pi){
  if(CONJ_IRREG[verb]?.[tense]?.[pi]!==undefined)return CONJ_IRREG[verb][tense][pi];
  const info=VERB_LIST.find(v=>v[0]===verb);if(!info)return'?';
  const[inf,gr]=info;
  if(gr===1){
    if(tense==='pres'){const s=inf.replace(/er$/,'');const e=['e','es','e','ons','ez','ent'];
      if(inf.endsWith('ger')&&pi===3)return s+'eons';
      if(inf.endsWith('cer')&&pi===3)return s.slice(0,-1)+'çons';return s+e[pi];}
    if(tense==='imp'){const s=inf.replace(/er$/,'');return s+['ais','ais','ait','ions','iez','aient'][pi];}
    if(tense==='fut')return inf+['ai','as','a','ons','ez','ont'][pi];
    if(tense==='cond')return inf+['ais','ais','ait','ions','iez','aient'][pi];
    if(tense==='subj'){const s=inf.replace(/er$/,'');return s+['e','es','e','ions','iez','ent'][pi];}
  }
  if(gr===2){const s=inf.replace(/ir$/,'');
    if(tense==='pres')return s+['is','is','it','issons','issez','issent'][pi];
    if(tense==='imp')return s+['issais','issais','issait','issions','issiez','issaient'][pi];
    if(tense==='fut')return inf+['ai','as','a','ons','ez','ont'][pi];
    if(tense==='cond')return inf+['ais','ais','ait','ions','iez','aient'][pi];
    if(tense==='subj')return s+['isse','isses','isse','issions','issiez','issent'][pi];
  }
  return'?';
}
function pcForm(verb,pi){
  const i=VERB_LIST.find(v=>v[0]===verb);if(!i)return'?';
  const pp=i[3];const et=['suis','es','est','sommes','êtes','sont'];
  const av=['ai','as','a','avons','avez','ont'];
  const auxF=i[2]==='et'?et[pi]:av[pi];
  let ppF=pp;if(i[2]==='et'&&pi===5)ppF=pp+(pp.endsWith('s')?'':'s');
  return auxF+' '+ppF;
}
function pqpForm(verb,pi){
  const i=VERB_LIST.find(v=>v[0]===verb);if(!i)return'?';
  const pp=i[3];const et=['étais','étais','était','étions','étiez','étaient'];
  const av=['avais','avais','avait','avions','aviez','avaient'];
  return(i[2]==='et'?et[pi]:av[pi])+' '+pp;
}
function elide(subj,form){
  if(subj==='je'&&/^[aeiouéèêëàâùûôîïh]/i.test(form))return"j'"+form;
  return subj+' '+form;
}
function fullForm(verb,tense,pi){
  let f;
  if(tense==='pc')f=pcForm(verb,pi);
  else if(tense==='pqp')f=pqpForm(verb,pi);
  else f=conjForm(verb,tense,pi);
  return elide(SUBJ_S[pi],f);
}

// ══════════════════════════════════════════════════
// QUESTION GENERATOR
// Principe des distracteurs : plausibles, jamais aléatoires.
// Chaque mauvaise réponse doit être le genre d'erreur
// qu'un élève pourrait réellement faire.
// ══════════════════════════════════════════════════
function genQ(opId,attempt=0){
  if(attempt>8)return null; // évite boucle infinie
  if(opId==='mix'){
    const m=maxLvlI();
    const ok=OPS.filter(o=>lvlIdx(o.min)<=m);
    opId=pick(ok).id;
  }

  // ── CONJUGAISON ────────────────────────────────
  // RÈGLE ABSOLUE : toutes les réponses concernent TOUJOURS
  // le même verbe ET la même personne. Les distracteurs sont
  // des formes erronées réalistes (mauvais temps, mauvaise
  // terminaison, faute d'orthographe typique).
  if(opId.startsWith('conj_')){
    const tense=opId.replace('conj_','');
    const verbs=compatVerbs();if(!verbs.length)return null;
    const v=pick(verbs);const pi=0|Math.random()*6;
    const inf=v[0];
    const getF=(vb,t,p)=>{
      if(t==='pc')return pcForm(vb,p);
      if(t==='pqp')return pqpForm(vb,p);
      return conjForm(vb,t,p);
    };
    const correct=getF(inf,tense,pi);
    const wrongs=[];
    const add=f=>{if(f&&f!=='?'&&f!==correct&&!wrongs.includes(f))wrongs.push(f);};

    // ── 1. Confusion de temps : même verbe, même personne, autre temps
    //    C'est la confusion la plus fréquente et la plus réaliste.
    //    "je dansais" / "je danserai" / "j'ai dansé" au lieu de "je danse"
    const confusable={
      pres:['imp','fut','cond','subj'],
      imp:['pres','cond','subj'],
      fut:['cond','pres','imp'],
      pc:['pqp','imp','pres'],
      pqp:['pc','imp','cond'],
      cond:['fut','imp','pres'],
      subj:['pres','imp','cond'],
    };
    shuffle(confusable[tense]||[]).forEach(t2=>add(getF(inf,t2,pi)));

    // ── 2. Fautes de terminaison cohérentes avec la personne ──────────────
    // RÈGLE ABSOLUE : on ne substitue que par des terminaisons
    // qui existent pour CETTE personne en français.
    //
    // Terminaisons valides par personne (tous temps confondus) :
    //   je   → e  s  x  ai  ais          (PAS -ait, PAS -a, PAS -ons/-ez/-ent)
    //   tu   → es s  x  ai  ais  as       (PAS -ait, PAS -a, PAS -ons/-ez/-ent)
    //   il   → e  t  d  a   ait           (PAS -s, PAS -ais, PAS -ons/-ez/-ent/-aient)
    //   nous → ons ions                   (PAS -ez, PAS -ent, PAS -ait)
    //   vous → ez  iez                    (PAS -ons, PAS -ent, PAS -ait)
    //   ils  → ent aient ont              (PAS -ait singulier, PAS -ons/-ez)
    //
    // Chaque substitution ci-dessous respecte cette contrainte.

    // Présent gr.1 : confusion entre personnes proches
    if(tense==='pres'&&v[1]===1){
      const rad=inf.replace(/er$/,'');
      if(pi===0)add(elide(SUBJ_S[0],rad+'es'));     // "je danses"  (terminaison tu → confusion je/tu)
      if(pi===1)add(elide(SUBJ_S[1],rad+'e'));      // "tu danse"   (terminaison je → confusion tu/je)
      if(pi===2)add(elide(SUBJ_S[2],rad+'ent'));    // "il dansent" (terminaison ils → confusion il/ils)
      if(pi===3)add(elide(SUBJ_S[3],rad+'ont'));    // "nous dansont" (erreur enfant très fréquente)
      if(pi===4)add(elide(SUBJ_S[4],rad+'és'));     // "vous dansés" (confusion participe passé)
      if(pi===5)add(elide(SUBJ_S[5],rad+'ont'));    // "ils dansont" (erreur enfant très fréquente)
    }

    // Présent gr.2 : confusions -is/-it/-issent etc.
    if(tense==='pres'&&v[1]===2){
      const rad=inf.replace(/ir$/,'');
      if(pi===0)add(elide(SUBJ_S[0],rad+'is'));     // correct → ajoute "je finis" (ok)… on prend autres formes
      if(pi===2)add(elide(SUBJ_S[2],rad+'ient'));   // "il finient" (confusion avec venir/tenir)
      if(pi===5)add(elide(SUBJ_S[5],rad+'issont')); // "ils finissont"
    }

    // Présent verbes irréguliers : formes "régularisées fautives"
    // Un élève peut appliquer les règles du 1er groupe à un irrégulier.
    // Ex : "aller" → je "alle", "faire" → je "faise"
    if(tense==='pres'&&v[1]===3){
      // Forme "régularisée" 1er groupe : radical apparent + terminaison régulière
      // On extrait un radical apparent en retirant la terminaison courante
      const forms=CONJ_IRREG[inf]&&CONJ_IRREG[inf].pres;
      if(forms){
        // Radical apparent = forme il/elle sans terminaison
        // Stratégie : prendre les formes d'autres personnes confusables
        const confused=[
          [0,1],[1,0],[2,5],[5,2],[3,4],[4,3]  // paires confusables
        ];
        confused.forEach(([src,alt])=>{
          if(src===pi&&forms[alt]){
            // Ajouter la forme d'une autre personne confusable
            add(elide(SUBJ_S[pi],forms[alt]));
          }
        });
        // Forme infinitif appliqué comme présent : "je aller", "je faire"
        // (déjà fait en step 3, mais ici on fait une fausse forme conjuguée)
        // Ex "être" → "je êtes" (vous appliqué à je), "faire" → "je faites"
        const persWrong=[5,3,4]; // personnes les plus éloignées → formes les plus surprenantes
        persWrong.forEach(pw=>{
          if(pw!==pi&&forms[pw])add(elide(SUBJ_S[pi],forms[pw]));
        });
      }
    }

    // Imparfait : confusion terminaisons de la même personne
    if(tense==='imp'){
      // je/tu : -ais → -ai  (passé simple, terminaison valide pour je/tu)
      if(pi===0||pi===1) add(correct.replace(/ais$/,'ai'));
      // il    : -ait → -a   (passé simple, terminaison valide pour il)
      if(pi===2)         add(correct.replace(/ait$/,'a'));
      // nous  : -ions → -iont (erreur d'enfant courante, pas une vraie terminaison mais piège réaliste)
      if(pi===3)         add(correct.replace(/ions$/,'iont'));
      // vous  : -iez → -iés  (confusion avec participe)
      if(pi===4)         add(correct.replace(/iez$/,'iés'));
      // ils   : -aient → -ont (confusion imparfait/futur, terminaison valide pour ils)
      // JAMAIS -ait ici — c'est la terminaison singulière il, pas celle de ils
      if(pi===5)         add(correct.replace(/aient$/,'ont'));
    }

    // Futur : confusion futur/conditionnel (terminaisons symétriques de la même personne)
    if(tense==='fut'){
      // je   : -ai  → -ais  (conditionnel je, terminaison valide pour je) ✓
      if(pi===0)         add(correct.replace(/ai$/,'ais'));
      // tu   : -as  → -ais  (conditionnel tu, terminaison valide pour tu) ✓
      if(pi===1)         add(correct.replace(/as$/,'ais'));
      // il   : -a   → -ait  (conditionnel il, terminaison valide pour il) ✓
      if(pi===2)         add(correct.replace(/a$/,'ait'));
      // nous : -ons → -ont  (erreur très fréquente chez les élèves)
      if(pi===3)         add(correct.replace(/ons$/,'ont'));
      // vous : -ez  → -iez  (conditionnel vous, terminaison valide pour vous) ✓
      if(pi===4)         add(correct.replace(/ez$/,'iez'));
      // ils  : -ont → -aient (conditionnel ils, terminaison valide pour ils) ✓
      if(pi===5)         add(correct.replace(/ont$/,'aient'));
    }

    // Conditionnel : confusion conditionnel/futur (symétrique du futur)
    if(tense==='cond'){
      // je   : -ais → -ai   (futur je, terminaison valide pour je) ✓
      if(pi===0)         add(correct.replace(/ais$/,'ai'));
      // tu   : -ais → -as   (futur tu, terminaison valide pour tu) ✓
      if(pi===1)         add(correct.replace(/ais$/,'as'));
      // il   : -ait → -a    (futur il, terminaison valide pour il) ✓
      // JAMAIS -ais ici — c'est je/tu, pas il
      if(pi===2)         add(correct.replace(/ait$/,'a'));
      // nous : -ions → -ons (futur nous, terminaison valide pour nous) ✓
      if(pi===3)         add(correct.replace(/ions$/,'ons'));
      // vous : -iez → -ez   (futur vous, terminaison valide pour vous) ✓
      if(pi===4)         add(correct.replace(/iez$/,'ez'));
      // ils  : -aient → -ont (futur ils, terminaison valide pour ils) ✓
      // JAMAIS -ait — c'est le singulier il
      if(pi===5)         add(correct.replace(/aient$/,'ont'));
    }

    // Subjonctif
    if(tense==='subj'){
      // nous/vous : confusion subjonctif / présent indicatif
      if(pi===3) add(correct.replace(/ions$/,'ons'));   // "nous dansons" (indicatif) ✓
      if(pi===4) add(correct.replace(/iez$/,'ez'));     // "vous dansez"  (indicatif) ✓
    }

    // ── 3. Infinitif et participe passé : confusions classiques
    //    "je danser" / "je dansé" au lieu de "je danse"
    add(elide(SUBJ_S[pi],inf));                          // infinitif brut
    add(elide(SUBJ_S[pi],v[3]));                        // participe passé seul

    // ── 4. Passé composé / PQP : pièges spécifiques auxiliaire & accord
    if(tense==='pc'||tense==='pqp'){
      const auxPc=['ai','as','a','avons','avez','ont'][pi];
      const auxEt=['suis','es','est','sommes','êtes','sont'][pi];
      const aux=v[2]==='et'?auxEt:auxPc;
      const pp=v[3];
      // Mauvais auxiliaire
      const wrongAux=v[2]==='et'?auxPc:auxEt;
      add(elide(SUBJ_S[pi],wrongAux+' '+pp));
      // Infinitif à la place du participe
      add(elide(SUBJ_S[pi],aux+' '+inf));
      // Participe mal accordé
      if(!pp.endsWith('s'))add(elide(SUBJ_S[pi],aux+' '+pp+'s'));
      if(pp.endsWith('é'))add(elide(SUBJ_S[pi],aux+' '+pp.replace(/é$/,'er')));
    }

    // ── Fallback : formes des autres personnes si vraiment pas assez
    shuffle([0,1,2,3,4,5]).forEach(p2=>{
      if(p2!==pi&&wrongs.length<3)add(getF(inf,tense,p2));
    });

    const qKey='conj:'+inf+':'+tense+':'+pi;
    if(recentKeys.has(qKey)&&attempt<6)return genQ('conj_'+tense,attempt+1);
    recentKeys.add(qKey);if(recentKeys.size>20)recentKeys=new Set([...recentKeys].slice(-10));
    return{t:'conj',verb:inf,tense,pi,grp:v[1],subj:SUBJECTS[pi],correct,
      choices:shuffle([correct,...wrongs.slice(0,3)]),opId};
  }


  // ── PONCTUATION ──────────────────────────────────
  if(opId==='ponct'){
    const m=maxLvlI();
    const pool=PONCT.filter(e=>lvlIdx(e[3])<=m);
    if(!pool.length)return genQ(opId,attempt+1);
    const e=shuffle([...pool])[0];
    const[phrase,correct,wrongs,lvl]=e;
    const qKey='ponct:'+phrase;
    if(recentKeys.has(qKey)&&attempt<6)return genQ(opId,attempt+1);
    recentKeys.add(qKey);
    return{t:'ponct',phrase,correct,choices:shuffle([correct,...wrongs.slice(0,3)]),opId};
  }

  // ── DÉFINITIONS ──────────────────────────────────
  if(opId==='defin'){
    const m=maxLvlI();
    const pool=DEFIN.filter(e=>lvlIdx(e[3])<=m);
    if(!pool.length)return genQ(opId,attempt+1);
    const e=shuffle([...pool])[0];
    const[defin,correct,wrongs,lvl]=e;
    const qKey='defin:'+defin;
    if(recentKeys.has(qKey)&&attempt<6)return genQ(opId,attempt+1);
    recentKeys.add(qKey);
    return{t:'defin',defin,correct,choices:shuffle([correct,...wrongs.slice(0,3)]),opId};
  }

  // ── NIVEAU DE LANGUE ─────────────────────────────
  if(opId==='niveau'){
    const m=maxLvlI();
    const pool=NIVEAU.filter(e=>lvlIdx(e[3])<=m);
    if(!pool.length)return genQ(opId,attempt+1);
    const e=shuffle([...pool])[0];
    const[mot,correct,wrongs,lvl]=e;
    const qKey='niveau:'+mot;
    if(recentKeys.has(qKey)&&attempt<6)return genQ(opId,attempt+1);
    recentKeys.add(qKey);
    return{t:'niveau',mot,correct,choices:shuffle([correct,...wrongs]),opId};
  }

  const m=maxLvlI();

  // ── HOMOPHONES ─────────────────────────────────
  // Distracteurs = les autres homophones stockés dans l'entrée, c'est tout.
  if(opId==='homo'){
    const pool=HOMO.filter(h=>lvlIdx(h[3])<=m);if(!pool.length)return null;
    const[phrase,correct,wrongs]=pickFresh(pool,h=>h[0]);
    return{t:'homo',phrase,correct,choices:shuffle([correct,...wrongs].slice(0,4)),opId};
  }

  // ── ACCORD D'ADJECTIF ──────────────────────────
  // Distracteurs = les 3 autres formes du MÊME adjectif (ms/fs/mp/fp).
  // Ex: correct="grande" → distracteurs: "grand","grands","grandes"
  // L'élève doit réfléchir au genre et au nombre, pas à quel adjectif choisir.
  if(opId==='adj_accord'){
    const ap=ADJ.filter(a=>lvlIdx(a[4])<=m);
    const np=NOUNS.filter(n=>lvlIdx(n[4])<=m);
    if(!ap.length||!np.length)return null;
    const adj=pick(ap);
    const noun=pick(np);
    const g=Math.random()<.5?'m':'f';
    const nb=Math.random()<.5?'s':'p';
    const ai=(g==='f'?1:0)+(nb==='p'?2:0);
    const ni=(g==='f'?1:0)+(nb==='p'?2:0);
    const correct=adj[ai];
    const nf=noun[ni];
    // Les 3 autres formes du même adjectif = distracteurs parfaits
    const wf=[adj[0],adj[1],adj[2],adj[3]].filter(f=>f!==correct);
    const det=g==='m'?(nb==='s'?'un':'des'):(nb==='s'?'une':'des');
    return{t:'adj',noun:nf,det,g,nb,adjBase:adj[0],correct,
      choices:shuffle([correct,...shuffle(wf).slice(0,3)]),opId};
  }

  // ── ACCORD GROUPE NOMINAL ──────────────────────
  // Même principe : 4 formes du même adjectif.
  if(opId==='gn_accord'){
    const pool=GN.filter(g=>lvlIdx(g[5])<=m);if(!pool.length)return null;
    const[det,nom,adjMs,genre,nb]=pick(pool);
    const ae=ADJ.find(a=>a[0]===adjMs)||ADJ[0];
    const ai=(genre==='f'?1:0)+(nb==='p'?2:0);
    const correct=ae[ai];
    const wf=[ae[0],ae[1],ae[2],ae[3]].filter(f=>f!==correct);
    return{t:'gn',det,nom,genre,nb,adjMs,correct,
      choices:shuffle([correct,...shuffle(wf).slice(0,3)]),opId};
  }

  // ── NATURE DES MOTS ────────────────────────────
  // Distracteurs = catégories grammaticales stockées dans les données.
  if(opId==='nature'){
    const pool=NATURE.filter(n=>lvlIdx(n[4])<=m);if(!pool.length)return null;
    const[phrase,mot,correct,wrongs]=pick(pool);
    return{t:'nature',phrase,mot,correct,choices:shuffle([correct,...wrongs].slice(0,4)),opId};
  }

  // ── ORTHOGRAPHE ────────────────────────────────
  // Distracteurs = les graphies fausses du MÊME mot, stockées dans les données.
  if(opId==='ortho'){
    const pool=ORTHO.filter(o=>lvlIdx(o[5])<=m);if(!pool.length)return null;
    const entry=pickFresh(pool,o=>o[0]);
    const correct=entry[0];
    const wrongs=entry.slice(1,5).filter(f=>f&&f!==correct&&!['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2de','1re','Tle'].includes(f));
    return{t:'ortho',correct,choices:shuffle([correct,...wrongs.slice(0,3)]),opId};
  }

  // ── ACCENTS ────────────────────────────────────
  if(opId==='accents'){
    const pool=ORTHO.filter(o=>lvlIdx(o[5])<=m&&/[éèêëàâùûîïôœæç]/i.test(o[0]));
    if(!pool.length)return null;
    const entry=pickFresh(pool,o=>o[0]);
    const correct=entry[0];
    const wrongs=entry.slice(1,5).filter(f=>f&&f!==correct&&!['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2de','1re','Tle'].includes(f));
    return{t:'ortho',correct,choices:shuffle([correct,...wrongs.slice(0,3)]),opId:'accents'};
  }

  // ── SYNONYMES ──────────────────────────────────
  // Distracteurs = les faux synonymes stockés dans l'entrée, c'est tout.
  // Ils ont été choisis pour être des leurres crédibles (proches sémantiquement).
  if(opId==='synonyme'){
    const pool=SYNO.filter(s=>lvlIdx(s[3])<=m);if(!pool.length)return null;
    const[mot,correct,wrongs]=pickFresh(pool,s=>s[0]);
    return{t:'syno',mot,correct,choices:shuffle([correct,...wrongs].slice(0,4)),opId};
  }

  // ── ANTONYMES ──────────────────────────────────
  // Même principe : distracteurs stockés dans l'entrée uniquement.
  if(opId==='antonyme'){
    const pool=ANTO.filter(a=>lvlIdx(a[3])<=m);if(!pool.length)return null;
    const[mot,correct,wrongs]=pickFresh(pool,a=>a[0]);
    return{t:'anto',mot,correct,choices:shuffle([correct,...wrongs].slice(0,4)),opId};
  }

  // ── DICTÉE ─────────────────────────────────────
  if(opId==='dictee'){
    const pool=DICTEE_DATA.filter(d=>lvlIdx(d[1])<=maxLvlI());
    if(!pool.length)return null;
    const[phrase]=pick(pool);
    return{t:'dictee',phrase,opId};
  }

  // ── CORRIGER LA PHRASE ─────────────────────────
  // Distracteurs = variantes morphologiques du mot à corriger,
  // stockées directement dans les données. JAMAIS des mots d'autres phrases.
  if(opId==='phrase_corr'){
    const pool=PHRASE_CORR.filter(d=>lvlIdx(d[5])<=maxLvlI());
    if(!pool.length)return null;
    const[phrase,erreur,correction,distractors,explication]=pick(pool);
    return{t:'phrase_corr',phrase,erreur,correction,explication,
      choices:shuffle([correction,...distractors.slice(0,3)]),opId};
  }

  // ── GENRE DES NOMS ─────────────────────────────
  if(opId==='genre'){
    const pool=GENRE_DATA.filter(d=>lvlIdx(d[3])<=maxLvlI());
    if(!pool.length)return null;
    const[mot,correct,wrongs]=pick(pool);
    return{t:'genre',mot,correct,choices:shuffle([correct,...wrongs]),opId};
  }

  return null;
}

// ══════════════════════════════════════════════════
// RENDER HOME
function renderHome(){renderProfiles();renderWeakSpots();renderRevBanner();renderLevels();renderOps();}

function xpProgress(xp){
  let cur_lv=XP_LEVELS[0],next_lv=null;
  for(let i=0;i<XP_LEVELS.length;i++){if(xp>=XP_LEVELS[i].min){cur_lv=XP_LEVELS[i];next_lv=XP_LEVELS[i+1]||null;}}
  if(!next_lv)return{pct:100,cur:cur_lv,next:null,remaining:0};
  const pct=(xp-cur_lv.min)/(next_lv.min-cur_lv.min)*100;
  return{pct,cur:cur_lv,next:next_lv,remaining:next_lv.min-xp};
}

function srsDueCount_for(p){
  if(!p||!p.errors)return 0;
  return p.errors.filter(e=>!e.srs_next||e.srs_next<=Date.now()).length;
}

function renderProfiles(){
  const w=document.getElementById('profiles-wrap');w.innerHTML='';
  if(!DB.p.length){
    const msg=document.createElement('div');
    msg.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px 16px;';
    msg.innerHTML='<div style="font-size:2.2rem">👤</div>'+
      '<div style="font-size:.85rem;font-weight:700;color:var(--txt)">Bienvenue !</div>'+
      '<div style="font-size:.72rem;color:var(--txt2);text-align:center">Crée un profil pour commencer<br>et suivre ta progression.</div>'+
      '<button class="btn-go" style="margin-top:6px;padding:10px 22px;font-size:.82rem" onclick="openProfModal()">➕ Créer un profil</button>';
    w.appendChild(msg);
    return;
  }
  DB.p.forEach((p,i)=>{
    const lv=getXPLevel(p.xp);
    const prog=xpProgress(p.xp);
    const errN=srsDueCount_for(p);
    const d=document.createElement('div');
    d.className='prof-card'+(i===cur?' active':'');
    const streakHtml=(p.streak>=2)?`<div class="prof-streak">🔥${p.streak}</div>`:'';
    // XP ring via outline animé CSS
    const pct=prog.pct;
    d.style.setProperty('--xp-pct',pct+'%');
    d.innerHTML=streakHtml+
      `<div class="av">${p.av}</div>`+
      `<div class="pname">${p.name}</div>`+
      `<div class="plvl">${lv.ic} ${lv.lbl}</div>`+
      (p.stars?`<div class="stars-badge">⭐ ${p.stars}</div>`:'')+
      (errN?`<div class="perr">📅 ${errN} due${errN>1?'s':''}</div>`:'');
    d.onclick=()=>{
      if(i===cur){openProfileScreen(i);}
      else{cur=i;renderProfiles();renderRevBanner();renderWeakSpots();}
    };
    w.appendChild(d);
  });
  const add=document.createElement('div');add.className='prof-card add-prof';
  add.innerHTML='<div class="av">➕</div><div class="pname">Nouveau</div>';
  add.onclick=openProfModal;w.appendChild(add);
}

function renderRevBanner(){
  const p=curP();const ban=document.getElementById('rev-banner');
  if(!p||!p.errors||!p.errors.length){ban.classList.remove('show');return;}
  const due=srsDueCount();
  const total=p.errors.length;
  const laterN=total-due;
  const dueHtml=due>0?`<span class="srs-due">${due}</span>`:'';
  ban.innerHTML=`<div class="rev-icon">🔁</div>
    <div class="rev-text">
      <div class="rt">Révision ${dueHtml}</div>
      <div class="rs">${due>0?`${due} erreur${due>1?'s':''} à revoir maintenant`:`✓ À jour${laterN>0?' · '+laterN+' prévue'+(laterN>1?'s':''):''} plus tard`}</div>
    </div>
    <button class="rev-cta">Réviser →</button>`;
  ban.classList.add('show');
}

function renderWeakSpots(){
  const sec=document.getElementById('weak-section');
  const grid=document.getElementById('weak-grid');
  if(!grid)return;
  const p=curP();
  if(!p||!p.typeStats||Object.keys(p.typeStats).length<2){sec.style.display='none';return;}
  const weak=Object.entries(p.typeStats)
    .filter(([,s])=>s.tot>=5)
    .map(([t,s])=>({t,pct:Math.round(s.ok/s.tot*100),tot:s.tot}))
    .sort((a,b)=>a.pct-b.pct).slice(0,3);
  if(!weak.length){sec.style.display='none';return;}
  sec.style.display='block';
  grid.innerHTML='';
  weak.forEach(({t,pct})=>{
    const op=OPS.find(o=>o.id===t)||{lbl:t,ic:'?'};
    const c=document.createElement('div');c.className='weak-card';
    c.innerHTML=`<div class="wc-icon">${op.ic}</div>
      <div class="wc-lbl">${op.lbl}</div>
      <div class="wc-pct">${pct}% réussite</div>
      <div class="wc-bar"><div class="wc-bar-fill" style="width:${pct}%"></div></div>`;
    c.onclick=()=>{isMix=false;curOp=t;startGame(t);};
    grid.appendChild(c);
  });
}

function renderLevels(){
  const sc=document.getElementById('lvl-row');sc.innerHTML='';
  // Filtrer selon parentLockedLevels si défini
  const p=curP();
  const allowed=p&&p.parentLockedLevels?p.parentLockedLevels:null;
  LEVELS.forEach(l=>{
    if(allowed&&!allowed.includes(l))return; // masqué par parent
    const b=document.createElement('button');
    b.className='lpill'+(selLvls.includes(l)?selLvls.length>1?' on range':' on':'');
    b.id='lp-'+l;b.textContent=l;b.onclick=()=>setLvl(l);sc.appendChild(b);
  });
}
function setLvl(lv){
  const anchor=selLvls[0];
  if(!anchor||anchor===lv){selLvls=[lv];}
  else{const a=lvlIdx(anchor),b=lvlIdx(lv);selLvls=LEVELS.slice(Math.min(a,b),Math.max(a,b)+1);}
  syncLvlUI();renderOps();
}
function syncLvlUI(){
  LEVELS.forEach(l=>{const b=document.getElementById('lp-'+l);if(!b)return;
    b.className='lpill'+(selLvls.includes(l)?selLvls.length>1?' on range':' on':'');});
}
function rndLvl(){selLvls=[LEVELS[0|Math.random()*LEVELS.length]];syncLvlUI();renderOps();}
function allLvls(){selLvls=[...LEVELS];syncLvlUI();renderOps();}

function renderOps(){
  const g=document.getElementById('ex-grid');g.innerHTML='';
  const p=curP();
  const mix=document.createElement('div');
  mix.className='ex-card ex-mix'+(isMix?' selected':'');
  mix.innerHTML='<div class="eicon">🎲</div><div class="elabel">Méli-mélo</div><div class="esub">Tout mélangé !</div>';
  mix.onclick=()=>{isMix=true;startGame('mix');};g.appendChild(mix);
  syncVerbRow();
  OPS.forEach(op=>{
    const avail=maxLvlI()>=lvlIdx(op.min);
    const ts=p&&p.typeStats&&p.typeStats[op.id];
    let masteryDot='';
    if(ts&&ts.tot>=5){
      const pct=ts.ok/ts.tot;
      const cls=pct>=0.8?'g':pct>=0.5?'y':'r';
      masteryDot=`<div class="mastery-dot ${cls}"></div>`;
    }
    const d=document.createElement('div');
    d.className='ex-card'+(!avail?' off':'')+((!isMix&&curOp===op.id)?' selected':'');
    d.innerHTML=`<div class="eicon">${op.ic}</div><div class="elabel">${op.lbl}</div>`+
      `<div class="esub">${op.sub}</div><div class="ebadge">${op.min}+</div>${masteryDot}`;
    if(avail)d.onclick=()=>{isMix=false;curOp=op.id;startGame(op.id);};
    g.appendChild(d);
  });
}
function setOpt(type,val,btn){
  if(type==='q')qCount=val;
  if(type==='c')chronoMode=val;
  btn.parentElement.querySelectorAll('.opb').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
}
function syncVerbRow(){
  // Montrer la ligne "verbe" seulement si un exercice de conjugaison est actif ou sera actif
  const row=document.getElementById('opt-verb-row');if(!row)return;
  const conjActive=curOp.startsWith('conj_')||isMix;
  row.style.display=conjActive?'flex':'none';
}

// ══════════════════════════════════════════════════
// PROFILE MODAL
const BASE_AVATS=['🧒','👦','👧','🧑','👨','👩','🧔','👴','👵','🎓','🌟','🏆'];
let selAv=BASE_AVATS[0];
function openProfModal(){
  const g=document.getElementById('av-grid');g.innerHTML='';
  BASE_AVATS.forEach(a=>{
    const b=document.createElement('button');b.className='avb'+(a===selAv?' sel':'');b.textContent=a;
    b.onclick=()=>{selAv=a;g.querySelectorAll('.avb').forEach(x=>x.classList.remove('sel'));b.classList.add('sel');};
    g.appendChild(b);
  });
  document.getElementById('pname-inp').value='';
  document.getElementById('prof-modal').classList.add('open');
  setTimeout(()=>document.getElementById('pname-inp').focus(),120);
}
function closeProfModal(){document.getElementById('prof-modal').classList.remove('open');}
function saveProfModal(){
  const n=document.getElementById('pname-inp').value.trim();if(!n)return;
  DB.p.push(mkProf(n,selAv));cur=DB.p.length-1;saveDB();closeProfModal();renderProfiles();
}

// ══════════════════════════════════════════════════
// SETTINGS
function openSettings(){
  const k=localStorage.getItem('frAIKey')||'';
  document.getElementById('api-key-inp').value=k?'••••••••':'';
  // del prof list
  const dl=document.getElementById('del-prof-list');dl.innerHTML='';
  DB.p.forEach((p,i)=>{
    const b=document.createElement('button');
    b.style.cssText='background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.25);border-radius:8px;padding:5px 10px;font-size:.72rem;font-weight:700;color:#f43f5e;cursor:pointer;font-family:inherit';
    b.textContent=p.av+' '+p.name+' ×';
    b.onclick=()=>{if(confirm('Supprimer '+p.name+' ?')){DB.p.splice(i,1);if(cur>=DB.p.length)cur=Math.max(0,DB.p.length-1);saveDB();openSettings();renderProfiles();}};
    dl.appendChild(b);
  });
  document.getElementById('settings-modal').classList.add('open');
}
function closeSettings(){document.getElementById('settings-modal').classList.remove('open');}
function saveKey(){
  const k=document.getElementById('api-key-inp').value.trim();
  if(k&&k!=='••••••••')localStorage.setItem('frAIKey',k);
  toast('✅ Clé sauvegardée');closeSettings();
}
function nukeAll(){
  if(confirm('Effacer TOUTES les données ?')){
    localStorage.clear();DB={p:[]};
    DB.p.push(mkProf('Moi','🧒'));saveDB();
    renderHome();closeSettings();toast('✅ Réinitialisé');
  }
}

// ══════════════════════════════════════════════════
// TOAST
let toastT=null;
function toast(msg){
  const t=document.getElementById('toast');t.textContent=msg;t.style.opacity=1;
  clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity=0,2400);
}

// ══════════════════════════════════════════════════
// SCREEN NAVIGATION
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ══════════════════════════════════════════════════
// GAME
function startGame(opId){
  if(!DB.p.length){toast('Crée un profil d\'abord !');return;}
  updateStreak();
  curOp=opId;isRev=false;qs=[];qi=0;ans=[];combo=0;sessXP=0;blocked=false;recentKeys=new Set();
  renderBoosterBar();
  if(qCount===0){const q=genQ(opId);if(!q){toast('Aucune question disponible');return;}qs=[q];}
  else{for(let i=0;i<qCount;i++){const q=genQ(opId);if(q)qs.push(q);}if(!qs.length){toast('Niveau indisponible pour cet exercice');return;}}
  document.getElementById('stop-btn').style.display=qCount===0?'block':'none';
  showScreen('game');showQ();
}
function startRevision(){
  const p=curP();
  if(!p||!p.errors||!p.errors.length){toast('Aucune erreur à réviser !');return;}
  isRev=true;curOp='mix';
  // Priorité aux questions SRS dues, puis le reste par ordre d'ajout
  const due=srsDueErrors();
  const later=(p.errors||[]).filter(e=>e.srs_next&&e.srs_next>Date.now());
  const pool=shuffle(due).concat(later);
  qs=pool.slice(0,Math.min(12,pool.length));
  qi=0;ans=[];combo=0;sessXP=0;blocked=false;
  updateStreak();
  document.getElementById('stop-btn').style.display='block';
  showScreen('game');showQ();
}

function showQ(){
  // Infinite mode: generate next question on the fly
  if(qCount===0&&!isRev&&qi>=qs.length){
    const q=genQ(curOp);if(q)qs.push(q);else{showResult();return;}
  }
  if(qi>=qs.length){showResult();return;}
  const q=qs[qi];curQ=q;triesLeft=MAX_TRIES;blocked=false;qStartTime=Date.now();

  const lbl=document.getElementById('g-label');
  if(isRev){lbl.textContent='🔁 Révision des erreurs';}
  else{
    const op=OPS.find(o=>o.id===q.opId)||{lbl:q.opId};
    const ls=selLvls.length===1?selLvls[0]:selLvls[0]+'→'+selLvls[selLvls.length-1];
    lbl.textContent=(isMix?'🎲 ':'')+op.lbl+' · '+ls;
  }
  document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
  const cp=document.getElementById('combo-pill');
  if(combo>=2){cp.style.display='block';cp.textContent='🔥 ×'+combo;}else cp.style.display='none';

  renderDots();buildCard(q);
  if(chronoMode!=='libre')startCTM(parseInt(chronoMode));
}

function renderDots(){
  const row=document.getElementById('dots');const txt=document.getElementById('prog-txt');row.innerHTML='';
  const total=isRev?qs.length:(qCount===0?null:qs.length);
  if(!total){
    ans.slice(-8).forEach(a=>{const d=document.createElement('div');d.className='dot '+(a?'ok':'ko');row.appendChild(d);});
    row.appendChild(Object.assign(document.createElement('div'),{className:'dot cur'}));
    txt.textContent=qi+' Q';
  }else{
    qs.forEach((_,i)=>{const d=document.createElement('div');
      d.className='dot '+(i<ans.length?(ans[i]?'ok':'ko'):(i===qi?'cur':''));row.appendChild(d);});
    txt.textContent=(qi+1)+'/'+qs.length;
  }
}

function buildCard(q){
  const type=document.getElementById('q-type');
  const main=document.getElementById('q-main');
  const hint=document.getElementById('q-hint');
  document.getElementById('ch-grid').innerHTML='';
  document.getElementById('ch-grid').style.display='';
  document.getElementById('fb').style.display='none';
  hideDicteeZone();
  document.getElementById('ch-grid').style.display='';
  const card=document.getElementById('q-card');
  card.classList.remove('shake-card');
  card.style.animation='none';void card.offsetWidth;card.style.animation='';

  const lbl={
    conj:'Conjugaison — ',adj:'Accord de l\'adjectif',
    gn:'Accord du GN',homo:'Homophones',nature:'Nature des mots',
    ortho:'Orthographe',
    accents:'Accents & orthographe',syno:'Synonymes',anto:'Antonymes'
  };

  if(q.t==='conj'){
    type.textContent=lbl.conj+TENSE_LBL[q.tense];
    main.innerHTML=`Conjugue <em>${q.verb}</em> avec <strong>${q.subj}</strong>`;
    hint.textContent='';
  }else if(q.t==='homo'){
    type.textContent=lbl.homo;
    main.innerHTML=q.phrase.replace('___','<span class="q-blank">___</span>');
    hint.textContent='Choisis le bon mot :';
  }else if(q.t==='adj'){
    type.textContent=lbl.adj;
    main.innerHTML=`Accorde <em>${q.adjBase}</em> avec <strong>${q.det} ${q.noun}</strong>`;
    hint.textContent='Genre : '+(q.g==='m'?'masculin':'féminin')+' · Nombre : '+(q.nb==='s'?'singulier':'pluriel');
  }else if(q.t==='gn'){
    type.textContent=lbl.gn;
    main.innerHTML=`<strong>${q.det} ${q.nom}</strong> <em>___</em>`;
    hint.textContent='Genre : '+(q.genre==='m'?'masculin':'féminin')+' · Nombre : '+(q.nb==='s'?'singulier':'pluriel');
  }else if(q.t==='nature'){
    type.textContent=lbl.nature;
    if(!q.mot){qi++;showQ();return;} // sécurité: mot manquant (cache SRS ancien)
    main.innerHTML=`Quelle est la nature de <em>${q.mot}</em> ?`;
    hint.textContent=q.phrase;
  }else if(q.t==='ortho'){
    type.textContent=lbl.ortho;
    main.innerHTML='Quelle est la <em>bonne orthographe</em> ?';
    hint.textContent='';
  }else if(q.t==='syno'){
    type.textContent=lbl.syno;
    main.innerHTML=`Quel mot a le même sens que <em>${q.mot}</em> ?`;
    hint.textContent='';
  }else if(q.t==='anto'){
    type.textContent=lbl.anto;
    if(!q.mot){qi++;showQ();return;}
    main.innerHTML=`Quel est le contraire de <em>${q.mot}</em> ?`;
    hint.textContent='';
  }else if(q.t==='dictee'){
    type.textContent='🎙 Dictée';
    main.innerHTML='Écoute la phrase et écris-la.';
    hint.textContent='Appuie sur les lettres accentuées si besoin.';
    document.getElementById('ch-grid').style.display='none';
    showDicteeZone(q.phrase);
    return; // no buildChoices
  }else if(q.t==='phrase_corr'){
    type.textContent='🔍 Corriger la phrase';
    main.innerHTML='Quelle est la version <em>correcte</em> ?';
    const errHl=q.phrase.replace(q.erreur,
      '<u style="color:var(--red);font-weight:900">'+q.erreur+'</u>');
    hint.innerHTML='<span style="color:var(--txt3)">'+errHl+'</span>';
    document.getElementById('ch-grid').style.display='';
  }else if(q.t==='genre'){
    type.textContent='⚖️ Genre des noms';
    main.innerHTML=`Quel est le genre du nom <em>${q.mot}</em> ?`;
    hint.innerHTML='<span style="color:var(--txt2)"><em>le/un</em> → masculin · <em>la/une</em> → féminin</span>';
    document.getElementById('ch-grid').style.display='';
  }
  if(q.t==='phrase_corr') buildChoices(q.choices, q.correction);
  else buildChoices(q.choices, q.correct);
}

function buildChoices(choices,correct){
  const g=document.getElementById('ch-grid');g.innerHTML='';
  // Filtrer les choix invalides ('?', vides) qui peuvent venir du cache
  const valid=choices.filter(c=>c&&c!=='?'&&c.trim()!=='');
  valid.forEach(c=>{
    const b=document.createElement('button');b.className='ch';b.textContent=c;
    b.onclick=()=>!blocked&&checkChoice(b,c,correct);g.appendChild(b);
  });
}

function checkChoice(btn,val,correct){
  if(blocked)return;
  if(val===correct){
    blocked=true;stopCTM();btn.classList.add('correct');
    document.querySelectorAll('.ch').forEach(b=>{if(b!==btn)b.classList.add('dim');});
    finishAns(true);
  }else{
    triesLeft--;btn.classList.add('wrong');btn.disabled=true;
    if(triesLeft<=0){
      blocked=true;stopCTM();
      document.querySelectorAll('.ch').forEach(b=>{
        if(b.textContent===correct)b.classList.add('correct');
        else if(!b.classList.contains('wrong'))b.classList.add('dim');
      });
      finishAns(false);
    }else{
      sfxWrong();
      document.getElementById('q-card').classList.add('shake-card');
      showFb(false,'❌ Encore '+triesLeft+' essai !',false);
    }
  }
}

function finishAns(ok){
  const elapsed=(Date.now()-qStartTime)/1000;
  ans.push(ok);
  const q=qs[qi];let pts=0;
  if(ok){
    combo++;
    pts=Math.round(5*(triesLeft===MAX_TRIES?1:.5)*(combo>=3?2:combo>=2?1.5:1));
    if(elapsed<5&&triesLeft===MAX_TRIES)pts=Math.round(pts*1.2);
    sessXP+=pts;
    if(combo===3||combo===5||combo===10)sfxCombo();else sfxOk(combo);
    showFb(true,getExpl(q,true),true);
    if(isRev)advanceSRS(q); // avance l'intervalle SRS
  }else{
    combo=0;
    sfxWrong();
    showFb(false,getExpl(q,false),true);
    storeSRS(q); // stocke avec intervalle SRS
  }
  document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
  if(ok&&pts>0)flyPts('+'+pts);
  setTimeout(()=>{qi++;showQ();},ok?1500:4200);
}

function storeErr(q){storeSRS(q);}

function conjRule(tense,pi,grp){
  // Retourne une règle courte et mémorisable pour la conjugaison
  const term1=['e','es','e','ons','ez','ent'];
  const term2=['is','is','it','issons','issez','issent'];
  const termImp=['ais','ais','ait','ions','iez','aient'];
  const termFut=['ai','as','a','ons','ez','ont'];
  const persC=['je','tu','il/elle','nous','vous','ils/elles'][pi];
  if(tense==='pres'){
    if(grp===1)return`1er groupe : ${persC} → -${term1[pi]}`;
    if(grp===2)return`2e groupe : ${persC} → -${term2[pi]}`;
    return`Verbe irrégulier — forme à retenir`;
  }
  if(tense==='imp')return`Imparfait : ${persC} → -${termImp[pi]}`;
  if(tense==='fut')return`Futur : radical + -${termFut[pi]}`;
  if(tense==='cond')return`Conditionnel : radical futur + -${termImp[pi]}`;
  if(tense==='pc')return`Passé composé : ${['avoir/être'][0]} conjugué + participe passé`;
  if(tense==='pqp')return`Plus-que-parfait : avais/était + participe passé`;
  if(tense==='subj')return`Subjonctif : que ${persC} → -${['e','es','e','ions','iez','ent'][pi]}`;
  return'';
}

function getExpl(q,ok){
  if(q.t==='conj'){
    const f=fullForm(q.verb,q.tense,q.pi);
    if(ok)return`✅ <strong>${f}</strong> — ${TENSE_LBL[q.tense]}`;
    const rule=conjRule(q.tense,q.pi,q.grp||1);
    return`Réponse : <strong>${f}</strong><br><small style="opacity:.8">${rule}</small>`;
  }
  if(q.t==='homo'){
    if(ok)return`✅ <strong>${q.correct}</strong>`;
    // Règle selon l'homophone correct
    const rules={
      'à':`"à" (préposition) ≠ "a" (verbe avoir)`,
      'a':`"a" (avoir) ≠ "à" (préposition)`,
      'on':`"on" (pronom sujet) ≠ "ont" (avoir)`,
      'ont':`"ont" (ils ont) ≠ "on" (pronom)`,
      'est':`"est" (être) ≠ "et" (conjonction)`,
      'et':`"et" (conjonction) ≠ "est" (être)`,
      'son':`"son" (possessif) ≠ "sont" (être)`,
      'sont':`"sont" (ils sont) ≠ "son" (possessif)`,
      'ou':`"ou" (choix) ≠ "où" (lieu/question)`,
      'où':`"où" (lieu) ≠ "ou" (choix)`,
      'mes':`"mes" (possessif) ≠ "mais" (opposition)`,
      'mais':`"mais" (opposition) ≠ "mes" (possessif)`,
      'ces':`"ces" (démonstratif) ≠ "ses" (possessif)`,
      'ses':`"ses" (possessif) ≠ "ces" (démonstratif)`,
      "c'est":`"c'est" ≠ "s'est" (passé composé pronominal)`,
      "s'est":`"s'est" (se + être) ≠ "c'est"`,
      'ce':`"ce" (démonstratif) ≠ "se" (pronom réfléchi)`,
      'se':`"se" (pronom réfléchi) ≠ "ce" (démonstratif)`,
      'leur':`"leur" (pronom/possessif sing.) ≠ "leurs" (pluriel)`,
      'leurs':`"leurs" (possessif pluriel) ≠ "leur" (singulier)`,
      'tout':`"tout" (singulier) ≠ "tous" (pluriel masculin)`,
      'tous':`"tous" (pluriel) ≠ "tout" (singulier)`,
      'la':`"la" (article/pronom) ≠ "là" (adverbe de lieu)`,
      'là':`"là" (lieu) ≠ "la" (article/pronom)`,
      "l'a":`"l'a" (l' + avoir) ≠ "la"/"là"`,
      'davantage':`"davantage" (adverbe) ≠ "d'avantage"`,
      'plutôt':`"plutôt" (préférence) ≠ "plus tôt" (heure)`,
      'plus tôt':`"plus tôt" (heure) ≠ "plutôt" (préférence)`,
    };
    const hint=rules[q.correct]||`Bonne réponse : ${q.correct}`;
    return`Bonne réponse : <strong>${q.correct}</strong><br><small style="opacity:.8">${hint}</small>`;
  }
  if(q.t==='adj')
    return ok?`✅ <strong>${q.correct}</strong> — accord correct`
      :`<strong>${q.correct}</strong> — accord avec le nom (genre + nombre)`;
  if(q.t==='gn')
    return ok?`✅ <strong>${q.correct}</strong> — GN accordé`
      :`<strong>${q.correct}</strong> — l'adjectif s'accorde avec le nom`;
  if(q.t==='nature')
    return ok?`✅ <strong>${q.mot}</strong> → ${q.correct}`
      :`<strong>${q.mot}</strong> est un(e) <strong>${q.correct}</strong>`;
  if(q.t==='ortho')
    return ok?`✅ <strong>${q.correct}</strong>`
      :`Bonne orthographe : <strong>${q.correct}</strong>`;
  if(q.t==='syno')
    return ok?`✅ Synonyme de "${q.mot}" : <strong>${q.correct}</strong>`
      :`Synonyme de "<strong>${q.mot}</strong>" : <strong>${q.correct}</strong>`;
  if(q.t==='anto')
    return ok?`✅ Contraire de "${q.mot}" : <strong>${q.correct}</strong>`
      :`Contraire de "<strong>${q.mot}</strong>" : <strong>${q.correct}</strong>`;
  if(q.t==='phrase_corr')
    return ok?`✅ <strong>${q.correction}</strong> — bonne correction !`
      :`<strong>${q.correction}</strong> — ${q.explication}`;
  if(q.t==='genre')
    return ok?`✅ <strong>${q.mot}</strong> est bien ${q.correct}`
      :`<strong>${q.mot}</strong> est <strong>${q.correct}</strong>`;
  if(q.t==='dictee')return ok?'✅ Parfait !':'Regarde les erreurs en rouge.';
  return ok?'✅ Bravo !':'Essaie encore.';
}

function showFb(ok,msg,persist){
  const fb=document.getElementById('fb');
  fb.className='fb '+(ok?'ok':'ko');
  const aiKey=localStorage.getItem('frAIKey');
  const aiHtml=!ok?`<div class="fb-row2"><span class="fb-note">Comprendre pourquoi</span>`+
    `<button class="ai-btn" onclick="askAI()">💡 Expliquer</button></div>`:'';
  fb.innerHTML=`<div>${msg}</div>${aiHtml}`;
  fb.style.display='block';
  if(!persist)setTimeout(()=>fb.style.display='none',1500);
}

function flyPts(txt){
  const d=document.createElement('div');d.className='pts-fly';d.textContent=txt;
  d.style.cssText='left:44%;top:40%;position:fixed';
  document.body.appendChild(d);setTimeout(()=>d.remove(),950);
}

function startCTM(sec){
  ctmLeft=sec;
  const bar=document.getElementById('ctm-bar');
  const row=document.getElementById('ctm-row');
  bar.style.display='block';bar.style.transition='none';bar.style.width='100%';
  row.style.display='flex';
  document.getElementById('ctm-n').textContent=ctmLeft;
  setTimeout(()=>{bar.style.transition='width 1s linear';bar.style.width=((ctmLeft-1)/sec*100)+'%';},50);
  ctmID=setInterval(()=>{
    ctmLeft--;
    document.getElementById('ctm-n').textContent=ctmLeft;
    bar.style.width=(ctmLeft/sec*100)+'%';
    if(ctmLeft<=0){stopCTM();ctmTimeout();}
  },1000);
}
function stopCTM(){
  clearInterval(ctmID);ctmID=null;
  document.getElementById('ctm-bar').style.display='none';
  document.getElementById('ctm-row').style.display='none';
}
function ctmTimeout(){
  if(blocked)return;blocked=true;
  document.querySelectorAll('.ch').forEach(b=>{
    if(b.textContent===qs[qi]?.correct)b.classList.add('correct');
    else b.classList.add('dim');b.disabled=true;
  });
  finishAns(false);toast('⏱ Temps écoulé !');
}
function stopInfini(){showResult();}

// ══════════════════════════════════════════════════
// RESULT
function showResult(){
  stopCTM();
  const total=ans.length,okN=ans.filter(Boolean).length;
  const pct=total?Math.round(okN/total*100):0;
  document.getElementById('stars').textContent=pct>=90?'⭐⭐⭐':pct>=70?'⭐⭐':pct>=50?'⭐':'';
  document.getElementById('score-num').textContent=okN+'/'+total;
  document.getElementById('score-sub').textContent=pct+'% · +'+sessXP+' XP';
  const tags=document.getElementById('res-tags');tags.innerHTML='';
  const op=OPS.find(o=>o.id===curOp)||{lbl:isRev?'Révision':'?'};
  const ls=isRev?'Révision':selLvls.length>3?selLvls[0]+'→'+selLvls[selLvls.length-1]:selLvls.join(', ');
  [isRev?'🔁 Révision':isMix?'🎲 Méli-mélo':op.lbl,ls].forEach(t=>{
    const s=document.createElement('span');s.className='rtag';s.textContent=t;tags.appendChild(s);
  });

  const p=curP();
  if(p){
    p.xp+=sessXP;p.totalQ+=total;
    if(pct===100&&total>=5)p.perfectRounds++;
    p.maxCombo=Math.max(p.maxCombo,combo);
    if(!p.typeStats)p.typeStats={};
    qs.forEach((q,i)=>{
      if(i>=ans.length)return;
      const t=q.t;if(!p.typeStats[t])p.typeStats[t]={ok:0,tot:0};
      p.typeStats[t].tot++;if(ans[i])p.typeStats[t].ok++;
      if(ans[i]){
        if(q.t==='conj')p.conjOk++;
        if(q.t==='homo')p.homoOk++;
        if(q.t==='ortho')p.orthoOk++;
        if(q.t==='syno'||q.t==='anto')p.synoOk++;
      }
    });
    if(isRev&&okN>0)p.revisionDone=(p.revisionDone||0)+1;
    const opKey=isRev?'révision':curOp;
    p.history.unshift({date:Date.now(),op:opKey,ok:okN,total,pts:sessXP});
    if(p.history.length>50)p.history.length=50;
    // Double XP actif ?
    if((curP()||{}).doubleXPActive)sessXP=Math.round(sessXP*2);
    // Niveau avant/après
    const lvBefore=getXPLevel(p.xp-sessXP);
    const lvAfter=getXPLevel(p.xp);
    const leveledUp=lvAfter.min>lvBefore.min;
    const newBdg=[];
    BADGES.forEach(b=>{if(!p.badges.includes(b.id)&&b.cond(p)){p.badges.push(b.id);newBdg.push(b);}});
    saveDB();
    setTimeout(()=>awardStars(sessXP),800);
    if(leveledUp)setTimeout(()=>levelUpPopup(lvAfter),400);
    newBdg.forEach((b,i)=>setTimeout(()=>badgePopup(b),(leveledUp?2800:600)+i*2000));
  }
  sfxResult(pct);
  if(pct>=80)confetti();
  buildCorr();buildStats();buildLB();buildBdg();
  // reset tabs
  document.querySelectorAll('.tab').forEach((t,i)=>{t.classList.toggle('on',i===0);});
  document.querySelectorAll('.pane').forEach((p,i)=>{p.classList.toggle('on',i===0);});
  showScreen('result');
}

function buildCorr(){
  const pane=document.getElementById('pane-corr');pane.innerHTML='';
  qs.forEach((q,i)=>{
    if(i>=ans.length)return;
    const ok=ans[i];let qa='',qb='';
    if(q.t==='conj'){qa=`${q.verb} (${SUBJECTS[q.pi]}, ${TENSE_LBL[q.tense]})`;qb=fullForm(q.verb,q.tense,q.pi);}
    else if(q.t==='homo'){qa=q.phrase;qb=q.correct;}
    else if(q.t==='ponct'){qa=q.phrase.replace('___','___');qb=q.correct;}
    else if(q.t==='defin'){qa=q.defin;qb=q.correct;}
    else if(q.t==='niveau'){qa='« '+q.mot+' »';qb=q.correct;}
    else if(q.t==='adj'){qa=`${q.det} ${q.noun} + ${q.adjBase}`;qb=q.correct;}
    else if(q.t==='gn'){qa=`${q.det} ${q.nom} ___`;qb=q.correct;}
    else if(q.t==='nature'){qa=q.phrase;qb=q.correct;}
    else if(q.t==='ortho'){qa='Orthographe';qb=q.correct;}
    else if(q.t==='syno'){qa=`Synonyme de "${q.mot}"`;qb=q.correct;}
    else if(q.t==='anto'){qa=`Contraire de "${q.mot}"`;qb=q.correct;}
    else if(q.t==='dictee'){qa='Dictée';qb=q.phrase;}
    else if(q.t==='phrase_corr'){qa=q.phrase;qb=q.correction;}
    else if(q.t==='genre'){qa=`Genre de "${q.mot}"`;qb=q.correct;}
    const d=document.createElement('div');d.className='corr-item';
    // Explication statique (sans IA) affichée directement pour les erreurs
    let expl='';
    if(!ok){
      if(q.t==='phrase_corr'&&q.explication)expl=q.explication;
      else if(q.t==='conj'){expl=conjRule(q.tense,q.pi,q.grp||1);}
      else if(q.t==='homo'){
        const homoRules={'à':'"à" préposition ≠ "a" avoir','a':'"a" avoir ≠ "à" préposition',
          'on':'"on" pronom sujet ≠ "ont" avoir','ont':'"ont" avoir ≠ "on" pronom',
          'est':'"est" être ≠ "et" conjonction','et':'"et" conjonction ≠ "est" être',
          'son':'"son" possessif ≠ "sont" être','sont':'"sont" être ≠ "son" possessif',
          'ou':'"ou" choix ≠ "où" lieu','où':'"où" lieu ≠ "ou" choix',
          'ce':'"ce" démonstratif ≠ "se" pronom réfléchi',
          'se':'"se" pronom réfléchi ≠ "ce" démonstratif',
          "c'est":"c'est ≠ s'est (passé composé pronominal)","s'est":"s'est (se+être) ≠ c'est",
        };
        expl=homoRules[q.correct]||'';
      }else if(q.t==='adj')expl="L'adjectif s'accorde en genre et en nombre avec le nom.";
      else if(q.t==='genre')expl='Consulter le dictionnaire ou mémoriser : le/un = masculin, la/une = féminin.';
    }
    const explHtml=expl?`<div class="ci-expl">${expl}</div>`:'';
    // Explication enrichie avec exemple en contexte
    const enriched=typeof getEnrichedExpl==='function'?getEnrichedExpl(q):'';
    const aiBtn=!ok?`<button class="ci-why" onclick="askAIForQ(${i})">💡 Approfondir</button>`:'';
    d.innerHTML=`<div class="ci-icon">${ok?'✅':'❌'}</div>`+
      `<div class="ci-body"><div class="ci-q">${qa}</div>`+
      `<div class="ci-a">→ <span>${qb}</span></div>${explHtml}${enriched}${aiBtn}</div>`;
    pane.appendChild(d);
  });
}

const TYPE_LBL={dictee:'Dictée',phrase_corr:'Correction',genre:'Genre',conj:'Conjugaison',adj:'Accord adj.',gn:'Accord GN',homo:'Homophones',nature:'Nature',ortho:'Orthographe',syno:'Synonymes',anto:'Antonymes'};
function buildStats(){
  const pane=document.getElementById('pane-stats');pane.innerHTML='';
  const p=curP();if(!p)return;
  const total=ans.length,okN=ans.filter(Boolean).length;
  // Cards
  const row=document.createElement('div');row.className='stat-cards';
  [['🎯',okN+'/'+total,'Score session'],
   ['🔥',combo>0?combo+'× combo':'—','Combo max'],
   ['⭐',p.xp+' XP',getXPLevel(p.xp).lbl]].forEach(([ic,v,l])=>{
    const c=document.createElement('div');c.className='scard';
    c.innerHTML=`<div class="scard-v">${ic} ${v}</div><div class="scard-l">${l}</div>`;
    row.appendChild(c);
  });
  pane.appendChild(row);
  // Bars
  if(p.typeStats&&Object.keys(p.typeStats).length){
    const sec=document.createElement('div');
    sec.innerHTML='<div class="section-h">Précision par type</div>';
    Object.entries(p.typeStats)
      .sort((a,b)=>(b[1].ok/b[1].tot)-(a[1].ok/a[1].tot))
      .slice(0,6).forEach(([t,s])=>{
        const pct2=Math.round(s.ok/s.tot*100);
        const r=document.createElement('div');r.className='bar-row';
        r.innerHTML=`<div class="bar-lbl">${TYPE_LBL[t]||t}</div>`+
          `<div class="bar-track"><div class="bar-fill" data-p="${pct2}"></div></div>`+
          `<div class="bar-pct">${pct2}%</div>`;
        sec.appendChild(r);
      });
    pane.appendChild(sec);
    setTimeout(()=>pane.querySelectorAll('.bar-fill').forEach(b=>b.style.width=b.dataset.p+'%'),80);
  }
  // History
  if(p.history&&p.history.length){
    const sec=document.createElement('div');
    sec.innerHTML='<div class="section-h">Historique récent</div>';
    p.history.slice(0,7).forEach(h=>{
      const d=new Date(h.date);
      const ds=d.getDate()+'/'+(d.getMonth()+1);
      const op=OPS.find(o=>o.id===h.op)||{lbl:h.op==='révision'?'🔁 Révision':h.op||'?'};
      const pct2=h.total?Math.round(h.ok/h.total*100):0;
      const r=document.createElement('div');r.className='hist-item';
      r.innerHTML=`<span class="hi-date">${ds}</span><span class="hi-op">${op.lbl||h.op}</span><span class="hi-score">${h.ok}/${h.total} (${pct2}%)</span>`;
      sec.appendChild(r);
    });
    pane.appendChild(sec);
  }
}

function buildLB(){
  const pane=document.getElementById('pane-rank');pane.innerHTML='';
  [...DB.p].map((p,i)=>({...p,idx:i})).sort((a,b)=>b.xp-a.xp).forEach((p,r)=>{
    const d=document.createElement('div');d.className='lb-row'+(p.idx===cur?' me':'');
    const medal=r===0?'🥇':r===1?'🥈':r===2?'🥉':(r+1);
    d.innerHTML=`<div class="lb-rank">${medal}</div><div class="lb-av">${p.av}</div>`+
      `<div class="lb-name">${p.name}</div><div class="lb-xp">${p.xp} XP</div>`;
    pane.appendChild(d);
  });
}

function buildBdg(){
  const pane=document.getElementById('pane-bdg');pane.innerHTML='';
  const p=curP();if(!p)return;
  const g=document.createElement('div');g.className='bdg-grid';
  BADGES.forEach(b=>{
    const e=p.badges.includes(b.id);
    const c=document.createElement('div');c.className='bdg'+(e?' earned':'');
    c.innerHTML=`<span class="bi">${b.ic}</span><div class="bn">${b.nm}</div>`;
    g.appendChild(c);
  });
  pane.appendChild(g);
}

function levelUpPopup(lv){
  beep(440,0.08,'sine',0.2);beep(554,0.08,'sine',0.2,0.09);
  beep(659,0.08,'sine',0.2,0.18);beep(880,0.25,'sine',0.22,0.27);
  const d=document.createElement('div');
  d.style.cssText='position:fixed;bottom:90px;left:50%;transform:translateX(-50%);'+
    'background:linear-gradient(135deg,#1a2b45,#0c1525);'+
    'border:1.5px solid rgba(0,201,167,.45);border-radius:18px;'+
    'padding:14px 22px;z-index:600;display:flex;align-items:center;gap:13px;'+
    'animation:slideUp .4s cubic-bezier(.22,.68,0,1.2);box-shadow:0 4px 28px rgba(0,0,0,.5);white-space:nowrap';
  d.innerHTML=`<div style="font-size:2rem">${lv.ic}</div>`+
    `<div><div style="font-size:.7rem;font-weight:800;color:var(--acc)">⬆️ Niveau supérieur !</div>`+
    `<div style="font-size:.88rem;font-weight:900;color:var(--txt)">${lv.lbl}</div></div>`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),3500);
}

function badgePopup(b){
  const d=document.createElement('div');d.className='badge-pop';
  d.innerHTML=`<div class="bp-icon">${b.ic}</div><div><div class="bp-top">🎉 Nouveau badge !</div><div class="bp-name">${b.nm}</div></div>`;
  document.body.appendChild(d);setTimeout(()=>d.remove(),3200);
}

function switchTab(id,btn){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.pane').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on');document.getElementById('pane-'+id).classList.add('on');
  if(id==='stats')setTimeout(()=>{document.querySelectorAll('.bar-fill').forEach(b=>b.style.width=b.dataset.p+'%');},60);
}

function confetti(){
  const c=document.getElementById('confetti-c');c.width=c.offsetWidth;c.height=c.offsetHeight;
  const cols=['#00c9a7','#818cf8','#f59e0b','#fbbf24','#f43f5e'];
  for(let i=0;i<80;i++){
    const el=document.createElement('div');el.className='cf';
    el.style.cssText=`left:${Math.random()*100}%;background:${cols[i%cols.length]};`+
      `width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;`+
      `animation-delay:${Math.random()*.9}s;animation-duration:${1.5+Math.random()*.8}s;`+
      `border-radius:${Math.random()<.5?'50%':'2px'}`;
    c.appendChild(el);
  }
  setTimeout(()=>c.innerHTML='',3500);
}

function replayGame(){
  showScreen('home');
  if(isRev)startRevision();else startGame(curOp);
}

function exportResult(){
  const total=ans.length,okN=ans.filter(Boolean).length;
  const pct=total?Math.round(okN/total*100):0;
  const p=curP();
  const stars=pct>=90?'⭐⭐⭐':pct>=70?'⭐⭐':pct>=50?'⭐':'';
  const op=OPS.find(o=>o.id===curOp)||{lbl:isRev?'Révision':'Exercice'};
  const lvl=p?getXPLevel(p.xp).lbl:'';
  const txt=[
    '📚 Français Posé',
    stars+' '+okN+'/'+total+' ('+pct+'%)',
    (isRev?'🔁 Révision':isMix?'🎲 Méli-mélo':op.lbl)+' · '+selLvls.join('-'),
    p?p.av+' '+p.name+' — '+lvl+' · '+p.xp+' XP':'',
    '🔥 Combo max : '+(p?p.maxCombo:combo),
    '---',
    qs.slice(0,ans.length).map((q,i)=>(ans[i]?'✅':'❌')).join(' '),
  ].filter(Boolean).join('\n');
  navigator.clipboard.writeText(txt).then(()=>toast('✅ Résultat copié !')).catch(()=>{
    // Fallback: textarea
    const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);
    ta.select();document.execCommand('copy');document.body.removeChild(ta);
    toast('✅ Résultat copié !');
  });
}
function goHome(){
  stopCTM();isRev=false;renderHome();showScreen('home');
}


// ══════════════════════════════════════════════════
// DICTÉE ENGINE
const ACCENTS_BAR=['à','â','é','è','ê','ë','î','ï','ô','ù','û','ü','ç','œ','æ'];
let dicteePhrase='';
let synthVoice=null;
function loadVoice(){
  const voices=speechSynthesis.getVoices();
  synthVoice=voices.find(v=>v.lang.startsWith('fr'))||voices[0]||null;
}
if(typeof speechSynthesis!=='undefined'){
  if(speechSynthesis.onvoiceschanged!==undefined)speechSynthesis.onvoiceschanged=loadVoice;
  setTimeout(loadVoice,300);
}

function showDicteeZone(phrase){
  dicteePhrase=phrase;
  const zone=document.getElementById('dictee-zone');
  zone.classList.add('show');
  const inp=document.getElementById('dictee-input');
  inp.value='';inp.disabled=false;
  // Remove any previous diff
  zone.querySelectorAll('.diff-wrap,.diff-corr').forEach(el=>el.remove());
  document.getElementById('btn-listen').textContent='🔊 Écouter la phrase';
  document.getElementById('btn-listen').classList.remove('playing');
  // Build accent bar
  const bar=document.getElementById('accents-bar');bar.innerHTML='';
  ACCENTS_BAR.forEach(ch=>{
    const b=document.createElement('button');b.className='acc-key';b.textContent=ch;
    b.onclick=()=>insertAccent(ch);bar.appendChild(b);
  });
  // Auto-speak
  setTimeout(()=>speakDictee(),400);
}

function hideDicteeZone(){
  if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();
  document.getElementById('dictee-zone').classList.remove('show');
}
function passerDictee(){
  if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();
  combo=0;
  ans.push(false);
  storeSRS(qs[qi]);
  hideDicteeZone();
  qi++;
  showQ();
}


function insertAccent(ch){
  const inp=document.getElementById('dictee-input');
  const s=inp.selectionStart,e=inp.selectionEnd;
  inp.value=inp.value.slice(0,s)+ch+inp.value.slice(e);
  inp.selectionStart=inp.selectionEnd=s+ch.length;
  inp.focus();
}

function speakDictee(){
  if(!dicteePhrase||typeof speechSynthesis==='undefined'){toast('🔇 Synthèse vocale non disponible');return;}
  speechSynthesis.cancel();
  const utt=new SpeechSynthesisUtterance(dicteePhrase);
  utt.lang='fr-FR';utt.rate=0.80;utt.pitch=1;
  if(synthVoice)utt.voice=synthVoice;
  const btn=document.getElementById('btn-listen');
  btn.classList.add('playing');btn.textContent='🔊 En cours…';
  utt.onend=utt.onerror=()=>{btn.classList.remove('playing');btn.textContent='🔊 Réécouter';};
  speechSynthesis.speak(utt);
}

function normStr(s){
  return s.trim().toLowerCase().replace(/['']/g,"'").replace(/\s+/g,' ');
}
// Version sans accents pour comparaison tolérante
function stripAccents(s){
  return s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[œ]/g,'oe').replace(/[æ]/g,'ae');
}
// Compare deux mots : true=ok, 'accent'=ok sauf accent, false=faux
function cmpWord(typed,expected){
  if(typed===expected)return true;
  if(stripAccents(typed)===stripAccents(expected))return 'accent';
  return false;
}

function validerDictee(){
  const inp=document.getElementById('dictee-input');
  if(!inp.value.trim()){toast('Écris la phrase d\'abord !');inp.focus();return;}
  if(blocked)return;
  blocked=true;stopCTM();inp.disabled=true;
  if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();

  const typed=normStr(inp.value);
  const expected=normStr(dicteePhrase);
  const tw=typed.split(' ');
  const cw=expected.split(' ');
  let errCount=0;

  // Build diff display — tolérant aux accents manquants
  const diff=document.createElement('div');diff.className='diff-wrap';
  const maxL=Math.max(tw.length,cw.length);
  let accentOnly=0; // mots avec accent manquant seulement
  for(let i=0;i<maxL;i++){
    if(i>0)diff.appendChild(document.createTextNode(' '));
    const t=tw[i]||'';const cw2=cw[i]||'';
    const sp=document.createElement('span');
    const res=cmpWord(t,cw2);
    if(res===true){sp.className='diff-ok';sp.textContent=t;}
    else if(res==='accent'){
      // Accent manquant : avertissement mais pas erreur comptée
      accentOnly++;
      sp.className='diff-warn';sp.title='Accent attendu : '+cw2;sp.textContent=t;
      sp.style.cssText='color:var(--acc2);text-decoration:underline dotted';
    }else if(!t){errCount++;sp.className='diff-miss';sp.textContent='['+cw2+']';}
    else{errCount++;sp.className='diff-err';sp.title='Attendu : '+cw2;sp.textContent=t;}
    diff.appendChild(sp);
  }
  const zone=document.getElementById('dictee-zone');
  zone.querySelectorAll('.diff-wrap,.diff-corr').forEach(el=>el.remove());
  inp.insertAdjacentElement('afterend',diff);

  if(errCount>0||accentOnly>0){
    const corr=document.createElement('div');corr.className='diff-corr';
    corr.innerHTML='<span style="color:var(--acc2);font-weight:700">Phrase correcte :</span> '+dicteePhrase;
    diff.insertAdjacentElement('afterend',corr);
  }

  const ok=errCount===0&&accentOnly===0;
  const almostOk=errCount===0&&accentOnly>0;
  // Scoring : parfait=10, accents manquants=7, 1-2 erreurs=5, plus=0
  const frac=ok?1:almostOk?0.7:errCount<=2?0.5:0;
  const pts=Math.round(10*frac*(combo>=3?2:combo>=2?1.5:1));
  if(ok)combo++;else{combo=0;storeErr(qs[qi]);}
  ans.push(ok);
  sessXP+=pts;
  document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
  if(pts>0)flyPts('+'+pts);

  showFb(ok||almostOk,
    ok?'✅ Parfait ! Aucune erreur.':
    almostOk?`⚠️ ${accentOnly} accent${accentOnly>1?'s':''} manquant${accentOnly>1?'s':''}. Vérifie les mots soulignés.`:
    errCount<=2?`❌ ${errCount} erreur${errCount>1?'s':''}. Regarde les mots soulignés.`:
    `❌ ${errCount} erreurs. La correction est affichée ci-dessus.`,
    true);

  setTimeout(()=>{qi++;showQ();},ok?1800:4500);
}

// ══════════════════════════════════════════════════
// AI EXPLAIN
function buildPrompt(q){
  if(!q)return'Donne un conseil général de grammaire française en 2 phrases.';
  if(q.t==='conj')return`Pourquoi "${fullForm(q.verb,q.tense,q.pi)}" est la bonne conjugaison de "${q.verb}" (${SUBJECTS[q.pi]}, ${TENSE_LBL[q.tense]}) ? Explique la règle en 2-3 phrases simples pour un élève.`;
  if(q.t==='homo')return`Dans la phrase "${q.phrase}", pourquoi utilise-t-on "${q.correct}" ? Explique la règle des homophones en 2 phrases simples.`;
  if(q.t==='adj')return`Pourquoi l'adjectif "${q.adjBase}" s'accorde en "${q.correct}" avec "${q.det} ${q.noun}" ? Explique la règle en 2 phrases.`;
  if(q.t==='gn')return`Pourquoi l'adjectif dans "${q.det} ${q.nom} ___" s'écrit "${q.correct}" ? Explique la règle d'accord en 2 phrases.`;
  if(q.t==='ortho')return`Pourquoi ce mot s'écrit "${q.correct}" ? Explique l'orthographe en 1-2 phrases simples.`;
  if(q.t==='syno')return`Pourquoi "${q.correct}" est un synonyme de "${q.mot}" ? Nuance le sens en 2 phrases.`;
  if(q.t==='anto')return`Pourquoi "${q.correct}" est le contraire de "${q.mot}" ? Explique en 1-2 phrases.`;
  return`Explique pourquoi la bonne réponse est "${q.correct}" pour cette question de grammaire française. Sois bref.`;
}

async function askAI(){await callAI(curQ);}
async function askAIForQ(idx){await callAI(qs[idx]||null);}

async function callAI(q){
  const key=localStorage.getItem('frAIKey');
  if(!key){toast('⚙️ Configure ta clé API d\'abord');openSettings();return;}
  document.getElementById('ai-content').innerHTML=
    '<div class="ai-spinner"><div class="spinner-ring"></div>Analyse en cours…</div>';
  document.getElementById('ai-modal').classList.add('open');
  try{
    const r=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':key,
        'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:220,
        messages:[{role:'user',content:buildPrompt(q)}]})
    });
    const data=await r.json();
    if(data.error){document.getElementById('ai-content').textContent='Erreur : '+data.error.message;return;}
    const txt=(data.content?.[0]?.text||'Aucune réponse.').trim();
    document.getElementById('ai-content').textContent=txt;
  }catch(e){
    document.getElementById('ai-content').textContent='Erreur de connexion. Vérifie ta clé API et ta connexion internet.';
  }
}
function closeAI(){document.getElementById('ai-modal').classList.remove('open');}

// ══════════════════════════════════════════════════
// KEYBOARD SHORTCUTS
document.addEventListener('keydown',e=>{
  const onHome=document.getElementById('home').classList.contains('active');
  const onGame=document.getElementById('game').classList.contains('active');
  const onResult=document.getElementById('result').classList.contains('active');
  const modalOpen=['prof-modal','settings-modal','ai-modal','verb-modal'].some(id=>document.getElementById(id)?.classList.contains('open'));

  if(e.key==='Enter'){
    if(document.getElementById('prof-modal').classList.contains('open')){saveProfModal();return;}
    // Valider dictée avec Entrée (Ctrl+Entrée ou Entrée si textarea pas focus)
    if(onGame&&!blocked){
      const dz=document.getElementById('dictee-zone');
      if(dz.classList.contains('show')&&document.activeElement!==document.getElementById('dictee-input')){
        validerDictee();return;
      }
    }
  }
  if(e.key==='Escape'){
    closeProfModal();closeSettings();closeAI();closeVerbModal();closeShop();
    if(typeof closeCarte==='function')closeCarte();
    if(typeof closeParent==='function')closeParent();
  }
  // 1-4 pour les choix pendant le jeu
  if(['1','2','3','4'].includes(e.key)&&onGame&&!modalOpen){
    const idx=parseInt(e.key)-1;
    const btns=document.querySelectorAll('.ch');
    if(btns[idx]&&!blocked)btns[idx].click();
  }
  // Espace = rejouer depuis résultat
  if(e.key===' '&&onResult&&!modalOpen){
    e.preventDefault();replayGame();
  }
  // R = retour accueil depuis résultat
  if(e.key==='r'&&onResult&&!modalOpen){goHome();}
});


// ══════════════════════════════════════════════════
// DRILL VERBE
function openVerbModal(){
  const inp=document.getElementById('verb-search');
  if(inp)inp.value='';
  renderVerbList('');
  document.getElementById('verb-modal').classList.add('open');
  setTimeout(()=>inp&&inp.focus(),100);
}
function closeVerbModal(){document.getElementById('verb-modal').classList.remove('open');}
function filterVerbs(q){renderVerbList(q.toLowerCase().trim());}
function renderVerbList(q){
  const list=document.getElementById('verb-list');if(!list)return;
  const m=maxLvlI();
  const verbs=VERB_LIST.filter(v=>lvlIdx(v[4])<=m&&(!q||v[0].includes(q)));
  list.innerHTML='';
  verbs.forEach(v=>{
    const b=document.createElement('button');
    b.className='verb-pill'+(targetVerb===v[0]?' sel':'');
    b.textContent=v[0];
    b.onclick=()=>setTargetVerb(v[0]);
    list.appendChild(b);
  });
}
function setTargetVerb(verb,btn){
  targetVerb=verb;
  // Mise à jour UI options
  const anyBtn=document.getElementById('opt-verb-any');
  const pickBtn=document.getElementById('opt-verb-pick');
  if(anyBtn)anyBtn.classList.toggle('on',!verb);
  if(pickBtn){
    pickBtn.classList.toggle('on',!!verb);
    pickBtn.textContent=verb?'🎯 '+verb:'🎯 Cibler…';
    pickBtn.classList.toggle('opt-verb-active',!!verb);
  }
  closeVerbModal();
  // Persister le choix
  if(verb)localStorage.setItem('frTargetVerb',verb);
  else localStorage.removeItem('frTargetVerb');
  if(verb)toast('🎯 Verbe ciblé : '+verb);
  else toast('Tous les verbes');
}

// ══════════════════════════════════════════════════
// SPARKLINE XP
function buildSparkline(p){
  const wrap=document.getElementById('ps-sparkline');
  if(!wrap)return;
  if(!p.history||p.history.length<2){wrap.innerHTML='<div style="font-size:.65rem;color:var(--txt2);padding:8px 0">Joue quelques sessions pour voir ta progression.</div>';return;}
  // Prendre les 20 dernières sessions, ordre chronologique
  const pts=p.history.slice(0,20).reverse().map(h=>({
    xp:h.pts||0,
    pct:h.total?Math.round(h.ok/h.total*100):0,
    op:h.op
  }));
  const W=300,H=60,pad=6;
  const vals=pts.map(p=>p.pct);
  const min=Math.min(...vals),max=Math.max(...vals);
  const range=max-min||1;
  const xs=pts.map((_,i)=>pad+i*(W-2*pad)/(pts.length-1));
  const ys=vals.map(v=>H-pad-(v-min)/(range)*(H-2*pad));
  // Path
  const path='M'+xs.map((x,i)=>`${x.toFixed(1)},${ys[i].toFixed(1)}`).join('L');
  // Area fill
  const area=path+`L${xs[xs.length-1].toFixed(1)},${H} L${xs[0].toFixed(1)},${H}Z`;
  // Dernier point
  const lx=xs[xs.length-1],ly=ys[ys.length-1];
  wrap.innerHTML=`<div class="sparkline-wrap">
    <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="height:${H}px">
      <defs>
        <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#00c9a7" stop-opacity=".22"/>
          <stop offset="100%" stop-color="#00c9a7" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#spGrad)"/>
      <path d="${path}" fill="none" stroke="#00c9a7" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3.5" fill="#00c9a7"/>
    </svg>
    <div class="spark-label">
      <span>${pts.length} sessions</span>
      <span>Dernier : ${vals[vals.length-1]}%</span>
    </div>
  </div>`;
}

// ══════════════════════════════════════════════════
// PROFILE SCREEN
const TYPE_ICONS={conj:'📝',adj:'🎨',gn:'🔗',homo:'👂',nature:'🔤',ortho:'✏️',syno:'💬',anto:'↔️',phrase_corr:'🔍',genre:'⚖️',dictee:'🎙'};
function openProfileScreen(idx){
  const p=DB.p[idx];if(!p)return;
  const lv=getXPLevel(p.xp);
  const prog=xpProgress(p.xp);
  document.getElementById('ps-av').textContent=p.av;
  // Bouton changer avatar
  const avWrap=document.getElementById('ps-av-wrap');
  const existingBtn=avWrap.querySelector('.ps-av-change-btn');
  if(existingBtn)existingBtn.remove();
  // Bouton changer sous le nom
  let changeBtn=document.getElementById('ps-change-av-btn');
  if(!changeBtn){
    changeBtn=document.createElement('button');
    changeBtn.id='ps-change-av-btn';
    changeBtn.style.cssText='background:var(--bg3);border:1.5px solid var(--bg4);border-radius:10px;padding:6px 16px;font-size:.72rem;font-weight:700;color:var(--txt2);cursor:pointer;margin-top:6px;display:block;width:auto';
    const hero=document.querySelector('.ps-hero');
    if(hero){
      const lv=document.getElementById('ps-lv');
      if(lv) lv.insertAdjacentElement('afterend', changeBtn);
      else hero.appendChild(changeBtn);
    }
  }
  changeBtn.textContent='✏️ Changer d\'avatar';
  changeBtn.onclick=()=>openAvatarPicker(idx);
  document.getElementById('ps-name').textContent=p.name;
  document.getElementById('ps-lv').textContent=lv.ic+' '+lv.lbl+(p.streak>=2?' · 🔥'+p.streak+' jours':'');
  document.getElementById('ps-xp-bar').style.width=prog.pct+'%';
  const nxt=prog.next?`${p.xp} / ${prog.next.min} XP`:`${p.xp} XP — niveau max`;
  document.getElementById('ps-xp-txt').textContent=nxt;
  // Animer le ring SVG
  const ring=document.getElementById('ps-ring-fill');
  if(ring){const circ=2*Math.PI*38;const dash=prog.pct*circ/100;
    setTimeout(()=>ring.style.strokeDasharray=dash+' '+circ,80);}
  buildSparkline(p);
  // KPIs
  const kpis=document.getElementById('ps-kpis');
  kpis.innerHTML=[
    ['🎯',p.totalQ,'Questions'],
    ['⭐',p.perfectRounds,'Parfaites'],
    ['🔥',p.maxCombo,'Max combo'],
    ['📅',p.streak||0,'Streak'],
  ].map(([ic,v,l])=>`<div class="ps-kpi"><div class="ps-kpi-v">${ic} ${v}</div><div class="ps-kpi-l">${l}</div></div>`).join('');
  // Type stats
  const ts=document.getElementById('ps-typestats');ts.innerHTML='';
  if(p.typeStats&&Object.keys(p.typeStats).length){
    Object.entries(p.typeStats).sort((a,b)=>b[1].tot-a[1].tot).forEach(([t,s])=>{
      const pct=s.tot?Math.round(s.ok/s.tot*100):0;
      const col=pct>=80?'var(--acc)':pct>=50?'var(--acc2)':'var(--red)';
      const row=document.createElement('div');row.className='ps-type-row';
      row.innerHTML=`<div class="ps-type-icon">${TYPE_ICONS[t]||'?'}</div>`+
        `<div class="ps-type-lbl">${TYPE_LBL[t]||t}</div>`+
        `<div class="ps-type-track"><div class="ps-type-fill" data-p="${pct}" style="background:${col}"></div></div>`+
        `<div class="ps-type-pct">${pct}%</div>`;
      ts.appendChild(row);
    });
    setTimeout(()=>ts.querySelectorAll('.ps-type-fill').forEach(b=>b.style.width=b.dataset.p+'%'),80);
  }
  // Badges
  const bg=document.getElementById('ps-bdgs');bg.innerHTML='';
  BADGES.forEach(b=>{
    const e=p.badges.includes(b.id);
    const d=document.createElement('div');d.className='ps-bdg'+(e?' earned':'');
    d.innerHTML=`<span class="bi">${b.ic}</span><div class="bn">${b.nm}</div>`;
    bg.appendChild(d);
  });
  // Historique
  const hist=document.getElementById('ps-hist');hist.innerHTML='';
  (p.history||[]).slice(0,10).forEach(h=>{
    const d2=new Date(h.date);
    const ds=d2.getDate()+'/'+(d2.getMonth()+1);
    const op=OPS.find(o=>o.id===h.op)||{lbl:h.op==='révision'?'Révision':h.op||'?'};
    const pct2=h.total?Math.round(h.ok/h.total*100):0;
    const r=document.createElement('div');r.className='ps-hist-item';
    r.innerHTML=`<span style="font-size:.64rem;color:var(--txt2);min-width:38px">${ds}</span>`+
      `<span style="flex:1;font-size:.71rem;font-weight:700">${op.lbl||h.op}</span>`+
      `<span style="font-size:.69rem;font-weight:800;color:var(--acc)">${h.ok}/${h.total} (${pct2}%)</span>`;
    hist.appendChild(r);
  });
  showScreen('profile');
}

// ══════════════════════════════════════════════════
// INIT
loadDB();
// Migration des données vers v6
DB.p.forEach(p=>{
  if(!p.errors)p.errors=[];
  if(!p.typeStats)p.typeStats={};
  if(p.synoOk===undefined)p.synoOk=0;
  if(p.revisionDone===undefined)p.revisionDone=0;
  if(p.streak===undefined)p.streak=0;
  if(p.bestStreak===undefined)p.bestStreak=0;
  if(p.lastPlayed===undefined)p.lastPlayed='';
  if(p.srsClearedTotal===undefined)p.srsClearedTotal=0;
  // Migration erreurs existantes → format SRS
  p.errors.forEach(e=>{
    if(!e.srs_interval){e.srs_interval=1;e.srs_next=Date.now();e.srs_ease=2.5;}
    // Nettoyer les choix invalides sauvegardés ('?' ou vides)
    if(e.choices) e.choices=e.choices.filter(c=>c&&c!=='?'&&c.trim()!=='');
    // Purger les erreurs dont la bonne réponse est '?' ou manquante dans les choices
    if(!e.correct||e.correct==='?') e._invalid=true;
    if(e.choices&&e.correct&&!e.choices.includes(e.correct)) e._invalid=true;
    if(e.t==='nature'&&!e.mot) e._invalid=true;
  });
});
saveDB();
// Migration données nouvelles features
DB.p.forEach(p=>{
  if(!p.deptsUnlocked)p.deptsUnlocked=['75'];
  if(!p.deptsMastered)p.deptsMastered=[];
  if(!p.parentLockedLevels)p.parentLockedLevels=null;
});
saveDB();
if(!DB.p.length){openProfModal();}
renderHome();
setTimeout(()=>{ if(typeof showOnboarding==='function') showOnboarding(); },600);


// ══════════════════════════════════════════════════
// ⭐ BOUTIQUE — étoiles, boosters, thèmes, avatars
// ══════════════════════════════════════════════════

const SHOP_THEMES=[
  {id:'default', nm:'Nuit profonde', ic:'🌙', desc:'Thème par défaut sombre', price:0},
  {id:'ocean',   nm:'Océan',         ic:'🌊', desc:'Bleu profond apaisant',  price:150},
  {id:'foret',   nm:'Forêt',         ic:'🌿', desc:'Vert nature et doux',    price:300},
  {id:'flamme',  nm:'Flamme',        ic:'🔥', desc:'Rouge et orange ardent', price:500},
  {id:'aurore',  nm:'Aurore',        ic:'🌸', desc:'Violet et rose mystique',price:800},
  {id:'creme',   nm:'Parchemin',     ic:'📜', desc:'Thème clair, yeux reposés',price:1200},
];

const SHOP_BOOSTER_DEFS=[
  {id:'joker',    ic:'🎯', nm:'Joker',       desc:'Passe une question, elle compte comme correcte. Combo préservé !', price:30,  max:5},
  {id:'indice',   ic:'💡', nm:'Indice',      desc:'Élimine 2 mauvaises réponses. Plus facile de trouver !',          price:20,  max:5},
  {id:'doubleXP', ic:'⚡', nm:'Double XP',   desc:'Multiplie l\'XP gagné ×2 pour toute la prochaine session.',       price:100, max:3},
];

const SHOP_AVATAR_PACKS=[
  {id:'animaux', nm:'Animaux', ic:'🐾', desc:'Communs · 15⭐ chacun', price:80,
   avs:[
     {av:'🐶',price:15},{av:'🐱',price:15},{av:'🐰',price:15},{av:'🐮',price:15},
     {av:'🦊',price:20},{av:'🐻',price:20},{av:'🐨',price:20},
     {av:'🐯',price:25},{av:'🦁',price:25},{av:'🐼',price:30},
   ]},
  {id:'space', nm:'Espace', ic:'🚀', desc:'Communs · 15⭐, rares · 30⭐', price:80,
   avs:[
     {av:'🌍',price:15},{av:'🌙',price:15},{av:'⭐',price:15},
     {av:'🚀',price:20},{av:'🛸',price:20},{av:'☄️',price:20},
     {av:'🪐',price:25},{av:'👾',price:25},
     {av:'👨‍🚀',price:35},{av:'🌌',price:40},
   ]},
  {id:'sport', nm:'Sport', ic:'⚽', desc:'Communs · 15⭐, rares · 30⭐', price:80,
   avs:[
     {av:'⚽',price:15},{av:'🏀',price:15},{av:'🎾',price:15},
     {av:'🏊',price:20},{av:'🚴',price:20},{av:'⛷️',price:20},
     {av:'🤸',price:25},{av:'🏋️',price:25},
     {av:'🧗',price:30},{av:'🏇',price:40},
   ]},
  {id:'food', nm:'Gourmand', ic:'🍕', desc:'Communs · 10⭐, rares · 25⭐', price:80,
   avs:[
     {av:'🍎',price:10},{av:'🍕',price:10},{av:'🍦',price:10},{av:'🥐',price:10},
     {av:'🌮',price:15},{av:'🍜',price:15},{av:'☕',price:15},
     {av:'🍣',price:20},{av:'🧁',price:20},
     {av:'🎂',price:30},
   ]},
  {id:'legend', nm:'Légendaire', ic:'👑', desc:'Épiques · 50⭐, légendaires · 80⭐', price:300,
   avs:[
     {av:'🧚',price:50},{av:'🧝',price:50},{av:'🦸',price:50},{av:'🦹',price:50},
     {av:'🧜',price:60},{av:'🧙',price:60},
     {av:'🦄',price:70},{av:'🏰',price:70},
     {av:'🐉',price:80},{av:'👑',price:100},
   ]},
];

// ── Étoiles ───────────────────────────────────────
function getStars(p){return p.stars||0;}
function addStars(p,n){
  if(!p)return;
  p.stars=(p.stars||0)+n;
  saveDB();
  if(n>0){
    const el=document.createElement('div');el.className='stars-popup';
    el.textContent='+'+n+' ⭐';document.body.appendChild(el);
    setTimeout(()=>el.remove(),2200);
  }
}
function starsEarned(xp){return xp<=0?0:Math.max(1,Math.floor(xp/10));}

// ── Initialisation boutique ───────────────────────
function ensureShopData(p){
  if(!p.stars)p.stars=0;
  if(!p.boosters)p.boosters={joker:0,indice:0,doubleXP:0};
  if(!p.theme)p.theme='default';
  if(!p.unlockedThemes)p.unlockedThemes=['default'];
  if(!p.unlockedAvatarPacks)p.unlockedAvatarPacks=[];
  if(!p.doubleXPActive)p.doubleXPActive=false;
}

// ── Appliquer thème ───────────────────────────────
function applyTheme(themeId){
  const themes=['ocean','foret','flamme','aurore','creme'];
  themes.forEach(t=>document.body.classList.remove('theme-'+t));
  if(themeId&&themeId!=='default')document.body.classList.add('theme-'+themeId);
}

// ── Ouvrir / fermer boutique ──────────────────────
function openShop(){
  const p=curP();if(!p){toast('Crée un profil d\'abord !');return;}
  ensureShopData(p);
  renderShopStars();
  renderShopBoosters();
  renderShopThemes();
  renderShopAvatars();
  document.getElementById('shop-modal').classList.add('open');
}
function closeShop(){document.getElementById('shop-modal').classList.remove('open');}

function shopTab(sec){
  document.querySelectorAll('.shop-tab').forEach((t,i)=>{
    t.classList.toggle('on',['boosters','themes','avatars'][i]===sec);
  });
  document.querySelectorAll('.shop-section').forEach(s=>s.classList.remove('on'));
  document.getElementById('shop-sec-'+sec).classList.add('on');
}

function renderShopStars(){
  const p=curP();if(!p)return;
  document.getElementById('shop-stars-hd').textContent='⭐ '+getStars(p);
}

// ── Render boosters ───────────────────────────────
function renderShopBoosters(){
  const p=curP();if(!p)return;
  const sec=document.getElementById('shop-sec-boosters');
  sec.innerHTML='<div style="font-size:.65rem;color:var(--txt2);margin-bottom:12px;line-height:1.5">Les boosters s\'utilisent pendant une partie. Chaque achat ajoute +1 au stock.</div>';
  SHOP_BOOSTER_DEFS.forEach(b=>{
    const stock=(p.boosters||{})[b.id]||0;
    const canBuy=getStars(p)>=b.price&&stock<b.max;
    const div=document.createElement('div');div.className='shop-booster';
    div.innerHTML=`<div class="sb-ic">${b.ic}</div>
      <div class="sb-body"><div class="sb-nm">${b.nm}</div><div class="sb-desc">${b.desc}</div></div>
      <div class="sb-right">
        <div class="sb-price">⭐ ${b.price}</div>
        <div class="sb-count">×${stock}</div>
        <button class="sb-btn" ${canBuy?'':'disabled'} onclick="buyBooster('${b.id}')">Acheter</button>
      </div>`;
    sec.appendChild(div);
  });
}

function buyBooster(id){
  const p=curP();if(!p)return;ensureShopData(p);
  const def=SHOP_BOOSTER_DEFS.find(b=>b.id===id);if(!def)return;
  const stock=p.boosters[id]||0;
  if(getStars(p)<def.price){toast('⭐ Pas assez d\'étoiles !');return;}
  if(stock>=def.max){toast('Stock maximum atteint !');return;}
  p.stars-=def.price;
  if((p.boosters[id]||0)>=1){toast('⚠️ Tu en as déjà un ! Utilise-le d\'abord.');return;}
  p.boosters[id]=1;
  saveDB();
  beep(523,0.08,'sine',0.3);beep(659,0.08,'sine',0.3,0.1);
  toast('✅ '+def.ic+' '+def.nm+' acheté !');
  renderShopBoosters();renderShopStars();
}

// ── Render thèmes ─────────────────────────────────
function renderShopThemes(){
  const p=curP();if(!p)return;
  const sec=document.getElementById('shop-sec-themes');sec.innerHTML='';
  const grid=document.createElement('div');grid.className='shop-grid';
  SHOP_THEMES.forEach(t=>{
    const owned=(p.unlockedThemes||[]).includes(t.id)||t.price===0;
    const active=p.theme===t.id;
    const canBuy=!owned&&getStars(p)>=t.price;
    const div=document.createElement('div');
    div.className='shop-item'+(owned?' owned':'')+(active?' active':'');
    div.innerHTML=`<div class="si-ic">${t.ic}</div>
      <div class="si-nm">${t.nm}</div>
      <div class="si-desc">${t.desc}</div>
      ${active?'<div class="si-price free">✓ Actif</div>':
        owned?'<div class="si-price free">Équiper</div>':
        `<div class="si-price">⭐ ${t.price}</div>`}`;
    div.onclick=()=>{
      if(owned){equipTheme(t.id);}
      else if(canBuy){buyTheme(t.id);}
      else toast('⭐ Pas assez d\'étoiles !');
    };
    grid.appendChild(div);
  });
  sec.appendChild(grid);
}

function buyTheme(id){
  const p=curP();if(!p)return;ensureShopData(p);
  const def=SHOP_THEMES.find(t=>t.id===id);if(!def)return;
  if(getStars(p)<def.price){toast('⭐ Pas assez d\'étoiles !');return;}
  p.stars-=def.price;
  if(!p.unlockedThemes.includes(id))p.unlockedThemes.push(id);
  saveDB();
  beep(523,0.08,'sine',0.3);beep(659,0.08,'sine',0.3,0.1);beep(784,0.15,'sine',0.3,0.2);
  equipTheme(id);
}
function equipTheme(id){
  const p=curP();if(!p)return;
  p.theme=id;saveDB();
  applyTheme(id);
  renderShopThemes();renderShopStars();
  toast('🎨 Thème appliqué !');
}

// ── Render avatars ────────────────────────────────
function renderShopAvatars(){
  const p=curP();if(!p)return;ensureShopData(p);
  const sec=document.getElementById('shop-sec-avatars');sec.innerHTML='';
  SHOP_AVATAR_PACKS.forEach(pack=>{
    const packDiv=document.createElement('div');
    packDiv.innerHTML=`<div style="font-size:.7rem;font-weight:800;color:var(--txt2);margin:12px 0 6px;text-transform:uppercase;letter-spacing:.05em">${pack.ic} ${pack.nm} <span style="font-weight:400;opacity:.6">${pack.desc}</span></div>`;
    sec.appendChild(packDiv);
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:4px';
    pack.avs.forEach(item=>{
      const av=item.av; const avPrice=item.price;
      const owned=(p.unlockedAvatarPacks||[]).includes(pack.id)||(p.unlockedAvatars||[]).includes(av);
      const isEquipped=p.av===av;
      const canBuy=!owned&&getStars(p)>=avPrice;
      const btn=document.createElement('button');
      // Couleur badge selon prix
      const tier=avPrice<=15?'#4ade80':avPrice<=30?'#60a5fa':avPrice<=60?'#c084fc':'#f59e0b';
      btn.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 4px;border-radius:10px;border:2px solid '+(isEquipped?'var(--acc)':owned?'var(--bg4)':'var(--bg4)')+';background:'+(isEquipped?'rgba(0,201,167,.15)':owned?'var(--bg3)':'var(--bg2)')+';cursor:'+(owned||canBuy?'pointer':'not-allowed');
      const priceColor=canBuy?tier:(owned?'var(--acc)':'rgba(255,255,255,.3)');
      btn.innerHTML='<span style="font-size:1.4rem">'+av+'</span><span style="font-size:.6rem;font-weight:700;color:'+priceColor+'">'+(isEquipped?'✓ Équipé':owned?'Équiper':'⭐'+avPrice)+'</span>';
      if(owned||isEquipped){ btn.onclick=()=>pickAvatar(av); }
      else if(canBuy){ btn.onclick=()=>buyAvatar(av,pack.id,avPrice); }
      grid.appendChild(btn);
    });
    sec.appendChild(grid);
  });
}


function buyAvatarPack(id){
  const p=curP();if(!p)return;ensureShopData(p);
  const pack=SHOP_AVATAR_PACKS.find(pk=>pk.id===id);if(!pack)return;
  if(getStars(p)<pack.price){toast('⭐ Pas assez d\'étoiles !');return;}
  p.stars-=pack.price;
  if(!p.unlockedAvatarPacks.includes(id))p.unlockedAvatarPacks.push(id);
  saveDB();
  beep(523,0.06,'sine',0.3);beep(659,0.06,'sine',0.3,0.08);beep(784,0.06,'sine',0.3,0.16);beep(1047,0.2,'sine',0.3,0.24);
  toast('🎭 Pack '+pack.nm+' débloqué !');
  renderShopAvatars();renderShopStars();
}

function buyAvatar(av, packId, price){
  const p=curP();if(!p)return;ensureShopData(p);
  if(getStars(p)<price){toast('⭐ Pas assez d\'étoiles !');return;}
  if(!p.unlockedAvatars)p.unlockedAvatars=[];
  if(p.unlockedAvatars.includes(av)){toast('Déjà débloqué !');return;}
  p.stars-=price;
  p.unlockedAvatars.push(av);
  p.av=av; // équiper automatiquement
  saveDB();
  beep(523,0.06,'sine',0.3);beep(784,0.06,'sine',0.3,0.1);
  toast('🎭 Avatar '+av+' débloqué et équipé !');
  renderShopAvatars();renderShopStars();renderProfiles();
}

function openAvatarPicker(idx){
  const p=DB.p[idx];if(!p)return;
  ensureShopData(p);
  // Créer une modale simple
  let modal=document.getElementById('av-picker-modal');
  if(!modal){
    modal=document.createElement('div');
    modal.id='av-picker-modal';
    modal.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:1000;display:flex;align-items:flex-end;justify-content:center';
    modal.onclick=e=>{if(e.target===modal)modal.remove();};
    document.body.appendChild(modal);
  }
  modal.innerHTML='';
  const box=document.createElement('div');
  box.style.cssText='background:var(--bg2);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:480px;max-height:70vh;overflow-y:auto';
  // Header
  const hd=document.createElement('div');
  hd.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:14px';
  hd.innerHTML='<div style="font-size:.95rem;font-weight:800">🎭 Changer d\'avatar</div><button onclick="document.getElementById(\'av-picker-modal\').remove()" style="background:none;border:none;color:var(--txt2);font-size:1.2rem;cursor:pointer">✕</button>';
  box.appendChild(hd);
  // Avatars de base (toujours disponibles)
  const baseLabel=document.createElement('div');
  baseLabel.style.cssText='font-size:.7rem;font-weight:800;color:var(--txt2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em';
  baseLabel.textContent='✨ Avatars de base';
  box.appendChild(baseLabel);
  const baseGrid=document.createElement('div');
  baseGrid.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:14px';
  // BASE_AVATS défini globalement
  BASE_AVATS.forEach(av=>{
    const isEquipped=p.av===av;
    const btn=document.createElement('button');
    btn.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:10px;border:2px solid '+(isEquipped?'var(--acc)':'var(--bg4)')+';background:'+(isEquipped?'rgba(0,201,167,.15)':'var(--bg3)')+';cursor:pointer';
    btn.innerHTML='<span style="font-size:1.6rem">'+av+'</span><span style="font-size:.55rem;color:'+(isEquipped?'var(--acc)':'var(--txt2)')+'">'+( isEquipped?'✓':'Gratuit')+'</span>';
    btn.onclick=()=>{p.av=av;saveDB();renderProfiles();openProfileScreen(idx);modal.remove();toast('Avatar changé !');};
    baseGrid.appendChild(btn);
  });
  box.appendChild(baseGrid);
  // Avatars débloqués
  const unlocked=(p.unlockedAvatars||[]);
  const unlockedPacks=(p.unlockedAvatarPacks||[]);
  const allUnlocked=[];
  SHOP_AVATAR_PACKS.forEach(pack=>{
    pack.avs.forEach(item=>{
      if(unlockedPacks.includes(pack.id)||unlocked.includes(item.av)){
        allUnlocked.push(item.av);
      }
    });
  });
  if(allUnlocked.length){
    const unlockLabel=document.createElement('div');
    unlockLabel.style.cssText='font-size:.7rem;font-weight:800;color:var(--txt2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em';
    unlockLabel.textContent='🔓 Débloqués';
    box.appendChild(unlockLabel);
    const unlockGrid=document.createElement('div');
    unlockGrid.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-bottom:14px';
    allUnlocked.forEach(av=>{
      const isEquipped=p.av===av;
      const btn=document.createElement('button');
      btn.style.cssText='display:flex;flex-direction:column;align-items:center;gap:2px;padding:8px 4px;border-radius:10px;border:2px solid '+(isEquipped?'var(--acc)':'var(--bg4)')+';background:'+(isEquipped?'rgba(0,201,167,.15)':'var(--bg3)')+';cursor:pointer';
      btn.innerHTML='<span style="font-size:1.6rem">'+av+'</span><span style="font-size:.55rem;color:'+(isEquipped?'var(--acc)':'var(--txt2)')+'">'+( isEquipped?'✓':'Équiper')+'</span>';
      btn.onclick=()=>{p.av=av;saveDB();renderProfiles();openProfileScreen(idx);modal.remove();toast('Avatar changé !');};
      unlockGrid.appendChild(btn);
    });
    box.appendChild(unlockGrid);
  }
  // Lien boutique
  const shopLink=document.createElement('button');
  shopLink.style.cssText='width:100%;background:var(--bg3);border:1.5px solid var(--bg4);border-radius:12px;padding:12px;font-size:.8rem;font-weight:700;color:var(--acc2);cursor:pointer;margin-top:4px';
  shopLink.textContent='🛒 Acheter plus d\'avatars en boutique';
  shopLink.onclick=()=>{modal.remove();openShop();setTimeout(()=>shopTab('avatars'),100);};
  box.appendChild(shopLink);
  modal.appendChild(box);
}

function pickAvatar(av){
  const p=curP();if(!p)return;
  p.av=av;saveDB();
  renderProfiles();renderShopAvatars();
  toast('Avatar changé !');
}

// ── Boosters pendant le jeu ───────────────────────
function renderBoosterBar(){
  const bar=document.getElementById('booster-bar');if(!bar)return;
  bar.innerHTML='';
  const p=curP();if(!p)return;ensureShopData(p);
  SHOP_BOOSTER_DEFS.forEach(b=>{
    const stock=p.boosters[b.id]||0;
    const btn=document.createElement('button');btn.className='bst-btn';
    btn.disabled=stock===0||blocked;
    btn.innerHTML=`${b.ic} ${b.nm} <span>${stock}</span>`;
    btn.onclick=()=>useBooster(b.id);
    bar.appendChild(btn);
  });
}

function useBooster(id){
  const p=curP();if(!p||blocked)return;ensureShopData(p);
  const stock=p.boosters[id]||0;if(stock<=0)return;
  if(id==='joker'){
    if(document.getElementById('game').classList.contains('active')&&qi<qs.length){
      p.boosters.joker--;saveDB();
      const q=qs[qi];
      ans.push(true);combo++;
      const pts=10*(combo>=3?2:combo>=2?1.5:1)*(p.doubleXPActive?2:1);
      sessXP+=Math.round(pts);
      document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
      flyPts('🎯 Joker !');
      beep(523,0.06,'sine',0.25);beep(784,0.15,'sine',0.25,0.08);
      qi++;showQ();renderBoosterBar();
    }
  } else if(id==='indice'){
    const grid=document.getElementById('ch-grid');
    const btns=[...grid.querySelectorAll('.ch:not(.correct):not(.wrong)')];
    const q=qs[qi];
    const wrongs=btns.filter(b=>b.textContent!==q.correct&&b.textContent!==(q.choices&&q.choices[0]));
    let removed=0;
    shuffle([...btns]).forEach(b=>{
      if(removed>=2)return;
      if(b.textContent!==q.correct){b.disabled=true;b.style.opacity='.3';removed++;}
    });
    p.boosters.indice--;saveDB();
    beep(440,0.05,'sine',0.2);beep(554,0.12,'sine',0.2,0.07);
    toast('💡 2 mauvaises réponses éliminées !');
    renderBoosterBar();
  } else if(id==='doubleXP'){
    p.boosters.doubleXP--;p.doubleXPActive=true;saveDB();
    beep(523,0.06,'sine',0.3);beep(659,0.06,'sine',0.3,0.09);beep(784,0.15,'sine',0.3,0.18);
    toast('⚡ Double XP activé pour cette session !');
    renderBoosterBar();
  }
}

// ── Intégration showResult (étoiles gagnées) ──────
function awardStars(sessXP){
  const p=curP();if(!p)return;
  ensureShopData(p);
  const earned=starsEarned(sessXP);
  addStars(p,earned);
  // Désactiver doubleXP après session
  if(p.doubleXPActive){p.doubleXPActive=false;saveDB();}
  // Mise à jour badge étoiles sur profil
  renderProfiles();
}

// ── Au démarrage : charger thème + avatars ─────────
(function initShop(){
  const p=curP();
  if(p){ensureShopData(p);applyTheme(p.theme||'default');}
})();
// ══════════════════════════════════════════════════
// DONNÉES — 96 DÉPARTEMENTS FRANÇAIS
// ══════════════════════════════════════════════════
const DEPARTEMENTS = [
  {num:'01',nm:'Ain',ch:'Bourg-en-Bresse',reg:'Auvergne-Rhône-Alpes',cost:40,fact:'Célèbre pour sa volaille AOC et ses reculées du Jura.'},
  {num:'02',nm:'Aisne',ch:'Laon',reg:'Hauts-de-France',cost:30,fact:'Théâtre de nombreuses batailles de la Première Guerre mondiale.'},
  {num:'03',nm:'Allier',ch:'Moulins',reg:'Auvergne-Rhône-Alpes',cost:35,fact:'Cœur du Bourbonnais historique, pays de Vichy.'},
  {num:'04',nm:'Alpes-de-Haute-Provence',ch:'Digne-les-Bains',reg:'PACA',cost:45,fact:'Département le moins peuplé de France métropolitaine.'},
  {num:'05',nm:'Hautes-Alpes',ch:'Gap',reg:'PACA',cost:50,fact:'Plus haute altitude moyenne des départements français.'},
  {num:'06',nm:'Alpes-Maritimes',ch:'Nice',reg:'PACA',cost:60,fact:'Abrite la Promenade des Anglais et Monaco à sa frontière.'},
  {num:'07',nm:'Ardèche',ch:'Privas',reg:'Auvergne-Rhône-Alpes',cost:45,fact:'La Grotte Chauvet-Pont d\'Arc est le site préhistorique le plus vieux du monde.'},
  {num:'08',nm:'Ardennes',ch:'Charleville-Mézières',reg:'Grand Est',cost:30,fact:'Patrie du poète Arthur Rimbaud.'},
  {num:'09',nm:'Ariège',ch:'Foix',reg:'Occitanie',cost:40,fact:'Abrite les vestiges du château cathare de Montségur.'},
  {num:'10',nm:'Aube',ch:'Troyes',reg:'Grand Est',cost:35,fact:'Troyes fut la capitale de la Champagne médiévale.'},
  {num:'11',nm:'Aude',ch:'Carcassonne',reg:'Occitanie',cost:45,fact:'La cité de Carcassonne est la plus grande forteresse médiévale d\'Europe.'},
  {num:'12',nm:'Aveyron',ch:'Rodez',reg:'Occitanie',cost:40,fact:'Berceau du roquefort et du viaduc de Millau.'},
  {num:'13',nm:'Bouches-du-Rhône',ch:'Marseille',reg:'PACA',cost:65,fact:'Marseille, fondée en 600 av. J.-C., est la plus vieille ville de France.'},
  {num:'14',nm:'Calvados',ch:'Caen',reg:'Normandie',cost:45,fact:'Les plages du Débarquement de juin 1944 longent ce littoral.'},
  {num:'15',nm:'Cantal',ch:'Aurillac',reg:'Auvergne-Rhône-Alpes',cost:35,fact:'Le Massif cantalien est l\'ancien volcan le plus grand d\'Europe.'},
  {num:'16',nm:'Charente',ch:'Angoulême',reg:'Nouvelle-Aquitaine',cost:40,fact:'Capitale mondiale de la BD grâce à son festival annuel.'},
  {num:'17',nm:'Charente-Maritime',ch:'La Rochelle',reg:'Nouvelle-Aquitaine',cost:50,fact:'Île de Ré, Île d\'Oléron, marais salants de l\'Atlantique.'},
  {num:'18',nm:'Cher',ch:'Bourges',reg:'Centre-Val de Loire',cost:35,fact:'La cathédrale Saint-Étienne de Bourges est inscrite au patrimoine mondial.'},
  {num:'19',nm:'Corrèze',ch:'Tulle',reg:'Nouvelle-Aquitaine',cost:35,fact:'Berceau de deux présidents : Chirac et Hollande.'},
  {num:'2A',nm:'Corse-du-Sud',ch:'Ajaccio',reg:'Corse',cost:55,fact:'Ajaccio est la ville natale de Napoléon Bonaparte.'},
  {num:'2B',nm:'Haute-Corse',ch:'Bastia',reg:'Corse',cost:55,fact:'La Corse est surnommée l\'Île de Beauté pour ses paysages variés.'},
  {num:'21',nm:'Côte-d\'Or',ch:'Dijon',reg:'Bourgogne-Franche-Comté',cost:50,fact:'Route des Grands Crus, moutarde de Dijon : capitale de la gastronomie.'},
  {num:'22',nm:'Côtes-d\'Armor',ch:'Saint-Brieuc',reg:'Bretagne',cost:40,fact:'Abrite les fameuses Côtes de Granit Rose.'},
  {num:'23',nm:'Creuse',ch:'Guéret',reg:'Nouvelle-Aquitaine',cost:30,fact:'Connu pour ses tapisseries d\'Aubusson, inscrites à l\'UNESCO.'},
  {num:'24',nm:'Dordogne',ch:'Périgueux',reg:'Nouvelle-Aquitaine',cost:45,fact:'La grotte de Lascaux abrite les plus belles peintures préhistoriques du monde.'},
  {num:'25',nm:'Doubs',ch:'Besançon',reg:'Bourgogne-Franche-Comté',cost:45,fact:'Besançon est la capitale mondiale de l\'horlogerie française.'},
  {num:'26',nm:'Drôme',ch:'Valence',reg:'Auvergne-Rhône-Alpes',cost:40,fact:'Berceau de la lavande et de la truffe mélanospore.'},
  {num:'27',nm:'Eure',ch:'Évreux',reg:'Normandie',cost:35,fact:'Les Andelys abrite le château Gaillard construit par Richard Cœur de Lion.'},
  {num:'28',nm:'Eure-et-Loir',ch:'Chartres',reg:'Centre-Val de Loire',cost:40,fact:'La cathédrale de Chartres est un chef-d\'œuvre du gothique français.'},
  {num:'29',nm:'Finistère',ch:'Quimper',reg:'Bretagne',cost:45,fact:'Pointe la plus occidentale de France continentale.'},
  {num:'30',nm:'Gard',ch:'Nîmes',reg:'Occitanie',cost:45,fact:'Le Pont du Gard est l\'aqueduc romain le mieux conservé au monde.'},
  {num:'31',nm:'Haute-Garonne',ch:'Toulouse',reg:'Occitanie',cost:60,fact:'La Ville Rose, capitale de l\'aéronautique européenne avec Airbus.'},
  {num:'32',nm:'Gers',ch:'Auch',reg:'Occitanie',cost:35,fact:'Cœur de la Gascogne, pays du foie gras et de l\'armagnac.'},
  {num:'33',nm:'Gironde',ch:'Bordeaux',reg:'Nouvelle-Aquitaine',cost:65,fact:'Premier vignoble du monde par la renommée de ses grands crus.'},
  {num:'34',nm:'Hérault',ch:'Montpellier',reg:'Occitanie',cost:55,fact:'Montpellier possède la plus vieille université de médecine en activité.'},
  {num:'35',nm:'Ille-et-Vilaine',ch:'Rennes',reg:'Bretagne',cost:50,fact:'Le Mont-Saint-Michel, merveille de l\'Occident médiéval, s\'y trouve.'},
  {num:'36',nm:'Indre',ch:'Châteauroux',reg:'Centre-Val de Loire',cost:30,fact:'Le pays de George Sand et de Nohant.'},
  {num:'37',nm:'Indre-et-Loire',ch:'Tours',reg:'Centre-Val de Loire',cost:50,fact:'La Loire et ses châteaux sont inscrits au patrimoine mondial de l\'UNESCO.'},
  {num:'38',nm:'Isère',ch:'Grenoble',reg:'Auvergne-Rhône-Alpes',cost:55,fact:'Grenoble, capitale des Alpes, a accueilli les JO d\'hiver en 1968.'},
  {num:'39',nm:'Jura',ch:'Lons-le-Saunier',reg:'Bourgogne-Franche-Comté',cost:40,fact:'Pays de Pasteur, du comté AOP et des reculées jurassiennes.'},
  {num:'40',nm:'Landes',ch:'Mont-de-Marsan',reg:'Nouvelle-Aquitaine',cost:40,fact:'La plus grande forêt artificielle d\'Europe, plantée au XIXe siècle.'},
  {num:'41',nm:'Loir-et-Cher',ch:'Blois',reg:'Centre-Val de Loire',cost:40,fact:'Château de Chambord : la plus grande façade Renaissance de France.'},
  {num:'42',nm:'Loire',ch:'Saint-Étienne',reg:'Auvergne-Rhône-Alpes',cost:40,fact:'Capitale du design et du vélo, ancienne ville minière.'},
  {num:'43',nm:'Haute-Loire',ch:'Le Puy-en-Velay',reg:'Auvergne-Rhône-Alpes',cost:35,fact:'Le Puy est le plus grand site de pèlerinage vers Saint-Jacques-de-Compostelle.'},
  {num:'44',nm:'Loire-Atlantique',ch:'Nantes',reg:'Pays de la Loire',cost:55,fact:'Nantes, ancienne capitale du duché de Bretagne, abrite les Machines de l\'île.'},
  {num:'45',nm:'Loiret',ch:'Orléans',reg:'Centre-Val de Loire',cost:45,fact:'Orléans fut libérée par Jeanne d\'Arc en 1429 pendant la Guerre de Cent Ans.'},
  {num:'46',nm:'Lot',ch:'Cahors',reg:'Occitanie',cost:40,fact:'Gouffre de Padirac et Saint-Cirq-Lapopie, plus beaux villages de France.'},
  {num:'47',nm:'Lot-et-Garonne',ch:'Agen',reg:'Nouvelle-Aquitaine',cost:35,fact:'Capitale mondiale du pruneau et du rugby à XIII.'},
  {num:'48',nm:'Lozère',ch:'Mende',reg:'Occitanie',cost:35,fact:'Département le moins peuplé de France : 76 000 habitants.'},
  {num:'49',nm:'Maine-et-Loire',ch:'Angers',reg:'Pays de la Loire',cost:45,fact:'L\'Apocalypse d\'Angers est la plus grande tapisserie médiévale du monde.'},
  {num:'50',nm:'Manche',ch:'Saint-Lô',reg:'Normandie',cost:40,fact:'Le Mont-Saint-Michel est accessible à pied à marée basse.'},
  {num:'51',nm:'Marne',ch:'Châlons-en-Champagne',reg:'Grand Est',cost:45,fact:'Reims : cathédrale des sacres des rois de France, capitale du champagne.'},
  {num:'52',nm:'Haute-Marne',ch:'Chaumont',reg:'Grand Est',cost:30,fact:'Célèbre pour son festival international de l\'affiche et ses sources de la Seine.'},
  {num:'53',nm:'Mayenne',ch:'Laval',reg:'Pays de la Loire',cost:30,fact:'Patrie d\'Alfred Jarry, auteur d\'Ubu Roi.'},
  {num:'54',nm:'Meurthe-et-Moselle',ch:'Nancy',reg:'Grand Est',cost:45,fact:'La place Stanislas de Nancy est l\'une des plus belles places d\'Europe.'},
  {num:'55',nm:'Meuse',ch:'Bar-le-Duc',reg:'Grand Est',cost:30,fact:'La Voie Sacrée reliait Bar-le-Duc à Verdun pendant la Grande Guerre.'},
  {num:'56',nm:'Morbihan',ch:'Vannes',reg:'Bretagne',cost:45,fact:'Carnac et ses 3 000 menhirs : le plus grand alignement mégalithique du monde.'},
  {num:'57',nm:'Moselle',ch:'Metz',reg:'Grand Est',cost:45,fact:'La cathédrale de Metz possède les plus grandes verrières gothiques du monde.'},
  {num:'58',nm:'Nièvre',ch:'Nevers',reg:'Bourgogne-Franche-Comté',cost:30,fact:'Nevers abrite le corps incorrompu de Bernadette Soubirous.'},
  {num:'59',nm:'Nord',ch:'Lille',reg:'Hauts-de-France',cost:60,fact:'Première ville universitaire de France, capitale de la frite et du maroilles.'},
  {num:'60',nm:'Oise',ch:'Beauvais',reg:'Hauts-de-France',cost:40,fact:'Le château de Pierrefonds inspira le château de La Belle au Bois Dormant.'},
  {num:'61',nm:'Orne',ch:'Alençon',reg:'Normandie',cost:35,fact:'La dentelle d\'Alençon est inscrite au patrimoine immatériel de l\'UNESCO.'},
  {num:'62',nm:'Pas-de-Calais',ch:'Arras',reg:'Hauts-de-France',cost:40,fact:'Le Louvre-Lens et le bassin minier sont classés au patrimoine mondial.'},
  {num:'63',nm:'Puy-de-Dôme',ch:'Clermont-Ferrand',reg:'Auvergne-Rhône-Alpes',cost:50,fact:'Capitale mondiale du pneu : Michelin y est né et y a son siège.'},
  {num:'64',nm:'Pyrénées-Atlantiques',ch:'Pau',reg:'Nouvelle-Aquitaine',cost:50,fact:'Pays Basque et Béarn : deux cultures, deux langues, deux gastronomies.'},
  {num:'65',nm:'Hautes-Pyrénées',ch:'Tarbes',reg:'Occitanie',cost:45,fact:'Lourdes est le plus grand lieu de pèlerinage catholique d\'Europe.'},
  {num:'66',nm:'Pyrénées-Orientales',ch:'Perpignan',reg:'Occitanie',cost:45,fact:'Salvador Dalí déclarait que la gare de Perpignan est le centre du monde.'},
  {num:'67',nm:'Bas-Rhin',ch:'Strasbourg',reg:'Grand Est',cost:60,fact:'Strasbourg, siège du Parlement européen, capitale de Noël.'},
  {num:'68',nm:'Haut-Rhin',ch:'Colmar',reg:'Grand Est',cost:55,fact:'Colmar abrite La statue de la Liberté originale (modèle de Bartholdi).'},
  {num:'69',nm:'Rhône',ch:'Lyon',reg:'Auvergne-Rhône-Alpes',cost:65,fact:'Lyon, capitale mondiale de la gastronomie, a le plus de bouchons au monde.'},
  {num:'70',nm:'Haute-Saône',ch:'Vesoul',reg:'Bourgogne-Franche-Comté',cost:30,fact:'Pays de la Comtoise, l\'horloge à balancier la plus répandue en France.'},
  {num:'71',nm:'Saône-et-Loire',ch:'Mâcon',reg:'Bourgogne-Franche-Comté',cost:40,fact:'Patrie de Lamartine et berceau du rugby en France.'},
  {num:'72',nm:'Sarthe',ch:'Le Mans',reg:'Pays de la Loire',cost:40,fact:'Les 24 Heures du Mans, plus grande course automobile du monde depuis 1923.'},
  {num:'73',nm:'Savoie',ch:'Chambéry',reg:'Auvergne-Rhône-Alpes',cost:50,fact:'Abrite le Mont-Blanc, toit de l\'Europe (4 808 m).'},
  {num:'74',nm:'Haute-Savoie',ch:'Annecy',reg:'Auvergne-Rhône-Alpes',cost:55,fact:'Le lac d\'Annecy est le lac le plus propre d\'Europe.'},
  {num:'75',nm:'Paris',ch:'Paris',reg:'Île-de-France',cost:100,fact:'Paris est la ville la plus visitée au monde avec 100 millions de touristes par an.'},
  {num:'76',nm:'Seine-Maritime',ch:'Rouen',reg:'Normandie',cost:45,fact:'Rouen : là où Jeanne d\'Arc fut brûlée vive en 1431.'},
  {num:'77',nm:'Seine-et-Marne',ch:'Melun',reg:'Île-de-France',cost:45,fact:'Disneyland Paris, plus grand parc d\'attractions d\'Europe, s\'y trouve.'},
  {num:'78',nm:'Yvelines',ch:'Versailles',reg:'Île-de-France',cost:60,fact:'Le château de Versailles fut la résidence royale la plus grandiose d\'Europe.'},
  {num:'79',nm:'Deux-Sèvres',ch:'Niort',reg:'Nouvelle-Aquitaine',cost:30,fact:'Le marais poitevin est surnommé la Venise verte.'},
  {num:'80',nm:'Somme',ch:'Amiens',reg:'Hauts-de-France',cost:40,fact:'La cathédrale d\'Amiens est la plus grande cathédrale gothique de France.'},
  {num:'81',nm:'Tarn',ch:'Albi',reg:'Occitanie',cost:40,fact:'La cité épiscopale d\'Albi est inscrite au patrimoine mondial de l\'UNESCO.'},
  {num:'82',nm:'Tarn-et-Garonne',ch:'Montauban',reg:'Occitanie',cost:35,fact:'Patrie du peintre Ingres et de la tomate AOC de Marmande.'},
  {num:'83',nm:'Var',ch:'Toulon',reg:'PACA',cost:55,fact:'Saint-Tropez, Hyères, Porquerolles : la Côte d\'Azur varoise.'},
  {num:'84',nm:'Vaucluse',ch:'Avignon',reg:'PACA',cost:55,fact:'Avignon fut la résidence des papes pendant 70 ans au XIVe siècle.'},
  {num:'85',nm:'Vendée',ch:'La Roche-sur-Yon',reg:'Pays de la Loire',cost:40,fact:'Le Puy du Fou est le deuxième parc à thème le plus visité de France.'},
  {num:'86',nm:'Vienne',ch:'Poitiers',reg:'Nouvelle-Aquitaine',cost:40,fact:'Poitiers fut une des capitales culturelles du Moyen Âge.'},
  {num:'87',nm:'Haute-Vienne',ch:'Limoges',reg:'Nouvelle-Aquitaine',cost:35,fact:'La porcelaine de Limoges est connue dans le monde entier.'},
  {num:'88',nm:'Vosges',ch:'Épinal',reg:'Grand Est',cost:35,fact:'Patrie de Jeanne d\'Arc et des Images d\'Épinal.'},
  {num:'89',nm:'Yonne',ch:'Auxerre',reg:'Bourgogne-Franche-Comté',cost:35,fact:'Chablis et Irancy : les vins les plus septentrionaux de Bourgogne.'},
  {num:'90',nm:'Territoire de Belfort',ch:'Belfort',reg:'Bourgogne-Franche-Comté',cost:35,fact:'Le Lion de Belfort commémore la résistance de 1870. Plus petit département.'},
  {num:'91',nm:'Essonne',ch:'Évry-Courcouronnes',reg:'Île-de-France',cost:45,fact:'Plateau de Saclay : premier site de recherche scientifique d\'Europe.'},
  {num:'92',nm:'Hauts-de-Seine',ch:'Nanterre',reg:'Île-de-France',cost:55,fact:'La Défense est le premier quartier d\'affaires européen.'},
  {num:'93',nm:'Seine-Saint-Denis',ch:'Bobigny',reg:'Île-de-France',cost:45,fact:'Le Stade de France accueille les plus grands événements sportifs et musicaux.'},
  {num:'94',nm:'Val-de-Marne',ch:'Créteil',reg:'Île-de-France',cost:45,fact:'Vincennes abrite le plus grand bois de France avec son château médiéval.'},
  {num:'95',nm:'Val-d\'Oise',ch:'Cergy',reg:'Île-de-France',cost:40,fact:'Auvers-sur-Oise : Van Gogh y vécut et y mourut en peignant 80 tableaux en 70 jours.'},
];

// ══════════════════════════════════════════════════
// CARTE DE FRANCE — coordonnées simplifiées des départements
// (positions approximatives dans un viewBox 550x600)
// ══════════════════════════════════════════════════
const DEPT_POSITIONS = {
  '01':{x:395,y:285},'02':{x:272,y:120},'03':{x:312,y:288},
  '04':{x:422,y:408},'05':{x:453,y:352},'06':{x:462,y:405},
  '07':{x:339,y:479},'08':{x:250,y:90},'09':{x:236,y:496},
  '10':{x:295,y:185},'11':{x:290,y:465},'12':{x:295,y:400},
  '13':{x:370,y:455},'14':{x:150,y:130},'15':{x:290,y:345},
  '16':{x:190,y:305},'17':{x:165,y:290},'18':{x:270,y:250},
  '19':{x:245,y:335},'2A':{x:460,y:500},'2B':{x:465,y:480},
  '21':{x:340,y:230},'22':{x:95,y:165},'23':{x:250,y:305},
  '24':{x:215,y:355},'25':{x:390,y:235},'26':{x:375,y:385},
  '27':{x:175,y:140},'28':{x:205,y:185},'29':{x:60,y:185},
  '30':{x:335,y:430},'31':{x:250,y:455},'32':{x:225,y:430},
  '33':{x:175,y:385},'34':{x:315,y:450},'35':{x:125,y:195},
  '36':{x:230,y:270},'37':{x:195,y:235},'38':{x:400,y:355},
  '39':{x:370,y:255},'40':{x:175,y:430},'41':{x:225,y:220},
  '42':{x:340,y:325},'43':{x:315,y:355},'44':{x:135,y:240},
  '45':{x:240,y:210},'46':{x:255,y:390},'47':{x:210,y:400},
  '48':{x:315,y:400},'49':{x:165,y:240},'50':{x:125,y:140},
  '51':{x:275,y:160},'52':{x:320,y:185},'53':{x:155,y:195},
  '54':{x:370,y:150},'55':{x:330,y:150},'56':{x:100,y:215},
  '57':{x:390,y:135},'58':{x:305,y:250},'59':{x:210,y:85},
  '60':{x:215,y:135},'61':{x:170,y:170},'62':{x:185,y:90},
  '63':{x:295,y:325},'64':{x:180,y:455},'65':{x:215,y:465},
  '66':{x:275,y:480},'67':{x:420,y:170},'68':{x:425,y:195},
  '69':{x:365,y:310},'70':{x:385,y:205},'71':{x:345,y:270},
  '72':{x:180,y:205},'73':{x:420,y:335},'74':{x:430,y:305},
  '75':{x:237,y:148},'76':{x:185,y:110},'77':{x:262,y:160},
  '78':{x:208,y:148},'79':{x:175,y:270},'80':{x:200,y:110},
  '81':{x:270,y:440},'82':{x:245,y:420},'83':{x:400,y:440},
  '84':{x:370,y:420},'85':{x:145,y:265},'86':{x:200,y:270},
  '87':{x:220,y:315},'88':{x:375,y:175},'89':{x:285,y:210},
  '90':{x:405,y:210},'91':{x:228,y:168},'92':{x:218,y:152},
  '93':{x:252,y:148},'94':{x:245,y:162},'95':{x:228,y:132},
};

// ══════════════════════════════════════════════════
// ONBOARDING
// ══════════════════════════════════════════════════
const OB_SLIDES = 4; // slides 0-3 + test
let obCurSlide = 0;
let lvtAnswers = [];
let lvtCur = 0;

const LVL_TEST_QUESTIONS = [
  {q:'Conjugue "aller" : Je ___ à l\'école.',a:'vais',choices:['vais','va','allons','aller'],niv:'CE1'},
  {q:'Choisis le bon mot : Le chien mange ___ os.',a:'son',choices:['son','sont','ses','ces'],niv:'CM1'},
  {q:'Accord : Les filles sont ___ (content).',a:'contentes',choices:['content','contents','contente','contentes'],niv:'CM2'},
  {q:'Conjugue (imparfait) : Il ___ (partir) quand je suis arrivé.',a:'partait',choices:['partait','parti','partirait','parte'],niv:'6e'},
  {q:'Subjonctif : Il faut que tu ___ (finir) tes devoirs.',a:'finisses',choices:['finis','finisse','finisses','finiras'],niv:'4e'},
];

const LEVEL_ORDER = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2de','1re','Tle'];

function showOnboarding() {
  const shown = localStorage.getItem('frOnboardingDone');
  if(shown) return;
  obCurSlide = 0;
  renderObSlide();
  document.getElementById('onboarding').classList.add('open');
}

function renderObSlide() {
  document.querySelectorAll('.ob-slide').forEach((s,i) => s.classList.toggle('on', i === obCurSlide));
  // Dots (on ne compte que les 4 premières + test)
  const total = OB_SLIDES + 1;
  const dotsEl = document.getElementById('ob-dots');
  dotsEl.innerHTML = '';
  for(let i=0;i<total;i++){
    const d=document.createElement('div');d.className='ob-dot'+(i===obCurSlide?' on':'');
    dotsEl.appendChild(d);
  }
  const btn = document.getElementById('ob-next');
  if(obCurSlide === OB_SLIDES) {
    btn.textContent = 'Terminer ✓';
    initLvlTest();
  } else {
    btn.textContent = obCurSlide === OB_SLIDES-1 ? 'Test de niveau →' : 'Suivant →';
  }
}

function obNext() {
  if(obCurSlide === OB_SLIDES) {
    finishOnboarding();
    return;
  }
  obCurSlide++;
  renderObSlide();
}

function skipOnboarding() { finishOnboarding(); }

function finishOnboarding() {
  // Appliquer le niveau détecté
  const p = curP();
  if(p && lvtAnswers.length > 0) {
    const score = lvtAnswers.filter(Boolean).length;
    const niveaux = ['CP','CE1','CE2','CM1','CM2','6e','5e','4e'];
    // On détermine le niveau suggéré par les réponses
    let suggestIdx = Math.min(score * 2, niveaux.length - 1);
    if(!p.parentLockedLevels) {
      // Sélectionner par défaut jusqu'au niveau suggéré
      const allLvls = LEVEL_ORDER;
      p.suggestedLevel = niveaux[suggestIdx];
      saveDB();
    }
  }
  localStorage.setItem('frOnboardingDone','1');
  document.getElementById('onboarding').classList.remove('open');
  // Montrer un toast de bienvenue
  if(curP()) toast('🎉 Bienvenue ' + curP().name + ' ! Bonne chance !');
}

function initLvlTest() {
  lvtAnswers = [];
  lvtCur = 0;
  renderLvtProg();
  renderLvtQuestion();
}

function renderLvtProg() {
  const prog = document.getElementById('lvt-prog');
  if(!prog) return;
  prog.innerHTML = '';
  LVL_TEST_QUESTIONS.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'lvl-test-dot' + (i < lvtCur ? ' done' : i === lvtCur ? ' cur' : '');
    prog.appendChild(d);
  });
}

function renderLvtQuestion() {
  const wrap = document.getElementById('lvt-wrap');
  if(!wrap) return;
  if(lvtCur >= LVL_TEST_QUESTIONS.length) {
    const score = lvtAnswers.filter(Boolean).length;
    const niveau = LVL_TEST_QUESTIONS[Math.min(score * Math.floor(LVL_TEST_QUESTIONS.length/4), LVL_TEST_QUESTIONS.length-1)].niv;
    wrap.innerHTML = `<div class="lvl-test-q" style="text-align:center;padding:20px">
      <div style="font-size:2rem;margin-bottom:8px">${score >= 4 ? '🏆' : score >= 2 ? '📖' : '🌱'}</div>
      <div style="font-size:.9rem;font-weight:800;color:var(--txt);margin-bottom:6px">${score}/5 bonnes réponses</div>
      <div style="font-size:.75rem;color:var(--txt2)">Niveau suggéré : <strong style="color:var(--acc)">${niveau}</strong></div>
    </div>`;
    document.getElementById('ob-next').textContent = 'C\'est parti ! 🚀';
    return;
  }
  const q = LVL_TEST_QUESTIONS[lvtCur];
  // Shuffle choices
  const choices = [...q.choices].sort(() => Math.random() - 0.5);
  wrap.innerHTML = `
    <div class="lvl-test-q">${q.q}</div>
    <div class="lvl-test-choices">
      ${choices.map(c => `<button class="lvl-test-ch" onclick="answerLvt('${c}','${q.a}',this)">${c}</button>`).join('')}
    </div>`;
}

function answerLvt(chosen, correct, btn) {
  if(lvtCur >= LVL_TEST_QUESTIONS.length) return;
  const ok = chosen === correct;
  lvtAnswers.push(ok);
  // Visual feedback
  document.querySelectorAll('.lvl-test-ch').forEach(b => {
    b.disabled = true;
    if(b.textContent === correct) b.classList.add('ok');
    else if(b === btn && !ok) b.classList.add('ko');
  });
  setTimeout(() => {
    lvtCur++;
    renderLvtProg();
    renderLvtQuestion();
  }, 700);
}

// ══════════════════════════════════════════════════
// CARTE DE FRANCE
// ══════════════════════════════════════════════════
// CARTE DE FRANCE — vraie carte géographique GeoJSON
// Source : france-geojson (gregoiredavid, MIT)
// ══════════════════════════════════════════════════

let _carteGeoJSON = null; // cache GeoJSON
let _carteLoadState = 'idle'; // 'idle' | 'loading' | 'done' | 'error'
const GEOJSON_URL = 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';
const GEOJSON_FALLBACK = 'https://cdn.jsdelivr.net/npm/france-geojson@2.0.0/departements.geojson';

function ensureCarteData(p) {
  if(!p.deptsUnlocked) p.deptsUnlocked = ['75'];
  if(!p.deptsMastered) p.deptsMastered = [];
}

function openCarte() {
  const p = curP();
  if(!p){ toast('Crée un profil d\'abord !'); return; }
  ensureCarteData(p); ensureShopData(p);
  document.getElementById('carte-modal').classList.add('open');
  loadCarteGeoJSON();
}

function closeCarte() {
  document.getElementById('carte-modal').classList.remove('open');
}

function loadCarteGeoJSON() {
  if(_carteLoadState === 'done') { renderCarte(); return; }
  if(_carteLoadState === 'loading') return;
  _carteLoadState = 'loading';
  showCarteSpinner(true);
  fetch(GEOJSON_URL)
    .then(r => { if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
    .catch(() => fetch(GEOJSON_FALLBACK).then(r=>r.json()))
    .then(geojson => {
      _carteGeoJSON = geojson;
      _carteLoadState = 'done';
      showCarteSpinner(false);
      renderCarte();
    })
    .catch(err => {
      _carteLoadState = 'error';
      showCarteSpinner(false);
      showCarteOffline();
    });
}

function showCarteSpinner(on) {
  let el = document.getElementById('carte-spinner');
  if(!el) return;
  el.style.display = on ? 'flex' : 'none';
}

function showCarteOffline() {
  const svg = document.getElementById('carte-svg');
  if(!svg) return;
  svg.innerHTML = '';
  const NS = 'http://www.w3.org/2000/svg';
  // Fond arrondi
  const rect = document.createElementNS(NS,'rect');
  rect.setAttribute('x','60'); rect.setAttribute('y','80');
  rect.setAttribute('width','380'); rect.setAttribute('height','180');
  rect.setAttribute('rx','20'); rect.setAttribute('fill','rgba(255,255,255,.04)');
  rect.setAttribute('stroke','rgba(255,255,255,.08)'); rect.setAttribute('stroke-width','1.5');
  svg.appendChild(rect);
  // Icône
  const ic = document.createElementNS(NS,'text');
  ic.setAttribute('x','250'); ic.setAttribute('y','130');
  ic.setAttribute('text-anchor','middle'); ic.setAttribute('font-size','32');
  ic.textContent = '📡';
  svg.appendChild(ic);
  // Titre
  const txt = document.createElementNS(NS,'text');
  txt.setAttribute('x','250'); txt.setAttribute('y','162');
  txt.setAttribute('text-anchor','middle'); txt.setAttribute('font-size','13');
  txt.setAttribute('font-weight','700'); txt.setAttribute('fill','rgba(255,255,255,.6)');
  txt.textContent = 'Connexion internet requise';
  svg.appendChild(txt);
  // Sous-titre
  const txt2 = document.createElementNS(NS,'text');
  txt2.setAttribute('x','250'); txt2.setAttribute('y','182');
  txt2.setAttribute('text-anchor','middle'); txt2.setAttribute('font-size','10');
  txt2.setAttribute('fill','rgba(255,255,255,.3)');
  txt2.textContent = 'La carte se charge automatiquement dès que tu es en ligne';
  svg.appendChild(txt2);
  // Bouton réessayer
  const btn = document.createElementNS(NS,'g');
  btn.setAttribute('cursor','pointer');
  btn.onclick = () => { _carteLoadState='idle'; loadCarteGeoJSON(); };
  const btnRect = document.createElementNS(NS,'rect');
  btnRect.setAttribute('x','175'); btnRect.setAttribute('y','200');
  btnRect.setAttribute('width','150'); btnRect.setAttribute('height','36');
  btnRect.setAttribute('rx','10'); btnRect.setAttribute('fill','rgba(0,201,167,.15)');
  btnRect.setAttribute('stroke','rgba(0,201,167,.4)'); btnRect.setAttribute('stroke-width','1.5');
  const btnTxt = document.createElementNS(NS,'text');
  btnTxt.setAttribute('x','250'); btnTxt.setAttribute('y','223');
  btnTxt.setAttribute('text-anchor','middle'); btnTxt.setAttribute('font-size','11');
  btnTxt.setAttribute('font-weight','700'); btnTxt.setAttribute('fill','rgba(0,201,167,.9)');
  btnTxt.textContent = '🔄 Réessayer';
  btn.appendChild(btnRect); btn.appendChild(btnTxt);
  svg.appendChild(btn);
}

// ── Projection Lambert-93 simplifiée → SVG ──────────
// On projette lon/lat sur un viewBox 500×520
function projectPoint(lon, lat) {
  // Bounding box métropole : lon [−5.5, 9.6], lat [41.2, 51.2]
  const MINLON=-5.5, MAXLON=9.6, MINLAT=41.2, MAXLAT=51.2;
  const W=500, H=520, PAD=8;
  // Correction de l'étirement latitude (cos moyen ≈ 46°)
  const cosMid = Math.cos(46 * Math.PI/180);
  const scaleX = (W - 2*PAD) / ((MAXLON - MINLON) * cosMid);
  const scaleY = (H - 2*PAD) / (MAXLAT - MINLAT);
  const scale = Math.min(scaleX, scaleY);
  const offX = PAD + ((W - 2*PAD) - (MAXLON - MINLON)*cosMid*scale) / 2;
  const offY = PAD;
  const x = offX + (lon - MINLON) * cosMid * scale;
  const y = H - (offY + (lat - MINLAT) * scale); // Y inversé
  return [x, y];
}

function geoRingToPath(ring) {
  return ring.map((pt, i) => {
    const [x, y] = projectPoint(pt[0], pt[1]);
    return (i===0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  }).join(' ') + ' Z';
}

function geoFeatureToPath(geometry) {
  if(!geometry) return '';
  const parts = [];
  if(geometry.type === 'Polygon') {
    geometry.coordinates.forEach(ring => parts.push(geoRingToPath(ring)));
  } else if(geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(poly => poly.forEach(ring => parts.push(geoRingToPath(ring))));
  }
  return parts.join(' ');
}

function renderCarte() {
  const p = curP(); if(!p) return;
  ensureCarteData(p);
  document.getElementById('carte-stars-hd').textContent = '⭐ ' + (p.stars||0);
  const unlocked = p.deptsUnlocked.length;
  document.getElementById('carte-prog-num').textContent = unlocked + '/96';
  document.getElementById('carte-prog-fill').style.width = (unlocked/96*100) + '%';

  const svg = document.getElementById('carte-svg');
  if(!svg) return;
  svg.innerHTML = '';

  if(!_carteGeoJSON) return;

  const NS = 'http://www.w3.org/2000/svg';
  const selectedDept = window._selectedDept || null;

  _carteGeoJSON.features.forEach(feature => {
    const props = feature.properties;
    // Normaliser le code département (GeoJSON utilise "code")
    // Normaliser : GeoJSON donne '1'..'9' ou '01'..'09', on veut toujours '01'..'09'
    const rawCode = (props.code || props.CODE_DEPT || props.num || '').toUpperCase();
    const num = rawCode.match(/^\d$/) ? '0'+rawCode : rawCode;
    // Trouver dans DEPARTEMENTS
    const dept = DEPARTEMENTS.find(d => d.num === num);
    if(!dept) return;

    const isUnlocked = p.deptsUnlocked.includes(dept.num);
    const isMastered = p.deptsMastered.includes(dept.num);
    const isSelected = selectedDept === dept.num;

    const pathD = geoFeatureToPath(feature.geometry);
    if(!pathD) return;

    const path = document.createElementNS(NS,'path');
    path.setAttribute('d', pathD);
    path.setAttribute('class','dept '+(isMastered?'mastered':isUnlocked?'unlocked':'locked')+(isSelected?' selected':''));
    path.setAttribute('stroke','var(--bg)');
    path.setAttribute('stroke-width','1');
    path.onclick = () => {
      window._selectedDept = dept.num;
      renderCarte();
      showDeptInfo(dept);
    };

    // Label centroïde approximatif
    const centroid = getGeoCentroid(feature.geometry);
    if(centroid) {
      const [cx,cy] = projectPoint(centroid[0], centroid[1]);
      const lbl = document.createElementNS(NS,'text');
      lbl.setAttribute('x', cx.toFixed(1));
      lbl.setAttribute('y', (cy+1).toFixed(1));
      lbl.setAttribute('text-anchor','middle');
      lbl.setAttribute('dominant-baseline','middle');
      lbl.setAttribute('font-size','8');
      lbl.setAttribute('font-weight','700');
      lbl.setAttribute('fill', isUnlocked||isMastered ? 'rgba(0,0,0,.8)' : 'rgba(255,255,255,.3)');
      lbl.setAttribute('pointer-events','none');
      lbl.textContent = dept.num;
      svg.appendChild(path);
      svg.appendChild(lbl);
    } else {
      svg.appendChild(path);
    }
  });
}

function getGeoCentroid(geometry) {
  // Centroïde simple : moyenne des coordonnées du premier ring
  let ring = null;
  if(geometry.type === 'Polygon') ring = geometry.coordinates[0];
  else if(geometry.type === 'MultiPolygon') {
    // Prendre le polygone le plus grand
    let maxLen = 0;
    geometry.coordinates.forEach(poly => {
      if(poly[0].length > maxLen){ maxLen=poly[0].length; ring=poly[0]; }
    });
  }
  if(!ring || ring.length===0) return null;
  let sumX=0, sumY=0;
  ring.forEach(pt=>{ sumX+=pt[0]; sumY+=pt[1]; });
  return [sumX/ring.length, sumY/ring.length];
}

function showDeptInfo(dept) {
  const p = curP(); if(!p) return;
  ensureCarteData(p);
  const isUnlocked = p.deptsUnlocked.includes(dept.num);
  const isMastered = p.deptsMastered.includes(dept.num);
  const stars = p.stars||0;
  const canBuy = !isUnlocked && stars >= dept.cost;
  const infoEl = document.getElementById('dept-info');
  infoEl.innerHTML = `
    <div class="dept-info-name">${dept.num} — ${dept.nm}</div>
    <div class="dept-info-num">📍 ${dept.ch} · ${dept.reg}</div>
    ${isUnlocked || isMastered ? `
      <div class="dept-unlocked-info">✅ Débloqué${isMastered?' · 🏆 Maîtrisé':''}</div>
      <div style="font-size:.7rem;color:var(--txt2);margin-top:8px;line-height:1.5;font-style:italic">💡 ${dept.fact}</div>
      ${!isMastered && (p.totalQ||0) >= 50 ? `<button class="dept-unlock-btn" style="background:var(--acc2);margin-top:8px" onclick="masterDept('${dept.num}')">🏆 Marquer comme maîtrisé (50 questions requises)</button>` : ''}
    ` : `
      <div class="dept-info-cost">⭐ ${dept.cost} étoiles pour débloquer</div>
      <div style="font-size:.68rem;color:var(--txt2);margin-bottom:8px">Tu as : ⭐ ${stars}</div>
      <button class="dept-unlock-btn" ${canBuy?'':'disabled'} onclick="unlockDept('${dept.num}')">
        ${canBuy ? '🔓 Débloquer ' + dept.nm : stars < dept.cost ? '⭐ Pas assez d\'étoiles' : '✓ Déjà débloqué'}
      </button>
    `}`;
}

function unlockDept(num) {
  const p = curP(); if(!p) return;
  ensureCarteData(p); ensureShopData(p);
  const dept = DEPARTEMENTS.find(d => d.num === num);
  if(!dept) return;
  if((p.stars||0) < dept.cost){ toast('⭐ Pas assez d\'étoiles !'); return; }
  if(p.deptsUnlocked.includes(num)){ toast('Déjà débloqué !'); return; }
  p.stars -= dept.cost;
  p.deptsUnlocked.push(num);
  saveDB();
  [523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,.06,'sine',.3),i*80));
  toast('🗺️ ' + dept.nm + ' débloqué ! 💡 ' + dept.fact.substring(0,60)+'…');
  checkRegionBonus(p, dept.reg);
  window._selectedDept = num;
  renderCarte();
  showDeptInfo(dept);
  renderProfiles();
}

function masterDept(num) {
  const p = curP(); if(!p) return;
  ensureCarteData(p);
  if(!p.deptsUnlocked.includes(num)){ toast('Débloque d\'abord ce département !'); return; }
  if(p.deptsMastered.includes(num)){ toast('Déjà maîtrisé !'); return; }
  p.deptsMastered.push(num);
  saveDB();
  [523,659,784,880,1047].forEach((f,i)=>setTimeout(()=>beep(f,.08,'triangle',.3),i*70));
  toast('🏆 Département maîtrisé ! Bravo !');
  window._selectedDept = num;
  renderCarte();
}

function checkRegionBonus(p, region) {
  const regDepts = DEPARTEMENTS.filter(d => d.reg === region);
  const allUnlocked = regDepts.every(d => p.deptsUnlocked.includes(d.num));
  if(allUnlocked) {
    setTimeout(()=>{
      [784,880,988,1047,1175].forEach((f,i)=>setTimeout(()=>beep(f,.08,'sine',.3),i*100));
      toast('🎉 Région complète : ' + region + ' ! Bonus ⭐+50');
      addStars(p, 50);
    }, 1000);
  }
}


// ══════════════════════════════════════════════════
// MODE PARENT / PROF
// ══════════════════════════════════════════════════
const DEFAULT_PIN = '1234';
let parentPin = '';
let pinBuffer = '';
let pinMode = 'enter'; // 'enter' | 'set' | 'confirm'
let pinNew = '';
let parentUnlocked = false;
let parentViewProf = 0;
let parentTmpLvls = [];


function getStoredPin() { return localStorage.getItem('frParentPin') || DEFAULT_PIN; }
function setStoredPin(pin) { localStorage.setItem('frParentPin', pin); }

function openParent() {
  parentUnlocked = false;
  pinBuffer = '';
  pinMode = 'enter';
  document.getElementById('parent-modal').classList.add('open');
  document.getElementById('parent-pin-screen').style.display = 'flex';
  document.getElementById('parent-dashboard').style.display = 'none';
  renderPinScreen('Entrez votre code PIN', getStoredPin()===DEFAULT_PIN ? 'PIN par défaut : 1234' : 'Accès parent / prof sécurisé');
}
function closeParent() {
  document.getElementById('parent-modal').classList.remove('open');
  parentUnlocked = false;
  pinBuffer = '';
}

function renderPinScreen(title, sub) {
  document.getElementById('pin-title').textContent = title;
  document.getElementById('pin-sub').textContent = sub;
  renderPinDots();
  renderPinPad();
}

function renderPinDots() {
  const dotsEl = document.getElementById('pin-dots');
  dotsEl.innerHTML = '';
  for(let i=0;i<4;i++){
    const d = document.createElement('div');
    d.className = 'pin-dot' + (i < pinBuffer.length ? ' filled' : '');
    dotsEl.appendChild(d);
  }
}

function renderPinPad() {
  const pad = document.getElementById('pin-pad');
  pad.innerHTML = '';
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'pin-key' + (k==='⌫'?' del':'');
    btn.textContent = k;
    if(k===''){btn.style.visibility='hidden';}
    else {
      btn.onclick = () => {
        if(k==='⌫') { pinBuffer=pinBuffer.slice(0,-1); }
        else if(pinBuffer.length<4){ pinBuffer+=k; }
        renderPinDots();
        if(pinBuffer.length===4) setTimeout(()=>validatePin(),200);
      };
    }
    pad.appendChild(btn);
  });
}

function validatePin() {
  const msg = document.getElementById('pin-msg');
  if(pinMode === 'enter') {
    if(pinBuffer === getStoredPin()) {
      parentUnlocked = true;
      document.getElementById('parent-pin-screen').style.display = 'none';
      document.getElementById('parent-dashboard').style.display = 'flex';
      renderParentDashboard();
    } else {
      msg.textContent = '❌ Code incorrect';
      pinBuffer = ''; renderPinDots();
      setTimeout(()=>msg.textContent='',2000);
    }
  } else if(pinMode === 'set') {
    pinNew = pinBuffer;
    pinBuffer = '';
    pinMode = 'confirm';
    renderPinScreen('Confirmez le nouveau PIN', 'Saisissez le même code à nouveau');
    renderPinDots();
  } else if(pinMode === 'confirm') {
    if(pinBuffer === pinNew) {
      setStoredPin(pinBuffer);
      pinBuffer=''; pinMode='enter'; pinNew='';
      document.getElementById('parent-pin-screen').style.display = 'none';
      document.getElementById('parent-dashboard').style.display = 'flex';
      renderParentDashboard();
      toast('✅ PIN mis à jour !');
    } else {
      msg.textContent = '❌ Les codes ne correspondent pas';
      pinBuffer=''; renderPinDots();
      setTimeout(()=>msg.textContent='',2000);
    }
  }
}

function startChangePin() {
  if(!parentUnlocked) return;
  pinBuffer=''; pinMode='set'; pinNew='';
  document.getElementById('parent-dashboard').style.display='none';
  document.getElementById('parent-pin-screen').style.display='flex';
  renderPinScreen('Choisissez un nouveau PIN','4 chiffres de votre choix');
}

function renderParentDashboard() {
  if(!parentUnlocked) return;
  // Sélection profil
  parentViewProf = Math.min(parentViewProf, DB.p.length-1);
  const ppsList = document.getElementById('pps-list');
  ppsList.innerHTML = '';
  DB.p.forEach((p,i)=>{
    const btn=document.createElement('button');
    btn.className='pps-btn'+(i===parentViewProf?' on':'');
    btn.textContent=p.av+' '+p.name;
    btn.onclick=()=>{ parentViewProf=i; renderParentDashboard(); };
    ppsList.appendChild(btn);
  });
  const p = DB.p[parentViewProf];
  if(!p){ document.getElementById('psg').innerHTML='<div style="color:var(--txt2);font-size:.75rem">Aucun profil</div>'; return; }
  ensureShopData(p);
  // KPIs
  const lv = getXPLevel(p.xp);
  document.getElementById('psg').innerHTML = `
    <div class="psg-card"><div class="psg-v">${p.xp}</div><div class="psg-l">XP Total</div></div>
    <div class="psg-card"><div class="psg-v">${p.totalQ||0}</div><div class="psg-l">Questions</div></div>
    <div class="psg-card"><div class="psg-v">${p.streak||0}</div><div class="psg-l">🔥 Série</div></div>
    <div class="psg-card"><div class="psg-v">${p.perfectRounds||0}</div><div class="psg-l">Parfaits</div></div>
    <div class="psg-card"><div class="psg-v">${p.stars||0}⭐</div><div class="psg-l">Étoiles</div></div>
    <div class="psg-card"><div class="psg-v">${lv.ic}</div><div class="psg-l">${lv.lbl}</div></div>`;
  // Barres par type
  const ts = p.typeStats||{};
  const types = [
    ['Conjugaison','conj'],['Homophones','homo'],['Orthographe','ortho'],
    ['Synonymes','syno'],['Antonymes','anto'],['Genre','genre'],
    ['Dictée','dictee'],['Correction','phrase_corr']
  ];
  let barsHtml = '';
  types.forEach(([lbl,key])=>{
    const s = ts[key]||{ok:0,tot:0};
    const pct = s.tot>0 ? Math.round(s.ok/s.tot*100) : 0;
    barsHtml += `<div class="parent-bar-row">
      <div class="pbr-lbl">${lbl}</div>
      <div class="pbr-track"><div class="pbr-fill" style="width:${pct}%"></div></div>
      <div class="pbr-pct">${pct}%</div>
    </div>`;
  });
  document.getElementById('pbars').innerHTML = barsHtml || '<div style="color:var(--txt2);font-size:.72rem">Pas encore de données</div>';
  // Historique
  const hist = (p.history||[]).slice(0,8);
  const histBody = document.getElementById('parent-hist-body');
  histBody.innerHTML = hist.length ? hist.map(h=>{
    const d=new Date(h.date);
    const ds=d.getDate()+'/'+(d.getMonth()+1);
    return `<tr><td>${ds}</td><td>${h.op||'?'}</td><td>${h.ok||0}/${h.total||0}</td><td>+${h.pts||0}</td></tr>`;
  }).join('') : '<tr><td colspan="4" style="color:var(--txt2)">Aucune session</td></tr>';
  // Points faibles (erreurs SRS)
  const errors = (p.errors||[]).slice(0,5);
  document.getElementById('parent-weak').innerHTML = errors.length
    ? errors.map(e=>`<div style="padding:4px 0;border-bottom:1px solid var(--bg3)">• ${e.q||e.correct||'?'} <span style="color:var(--txt3)">(${e.t||'?'})</span></div>`).join('')
    : '✅ Aucun point faible détecté !';
  // Niveaux autorisés
  const allowed = p.parentLockedLevels || [...LEVEL_ORDER];
  parentTmpLvls = [...allowed];
  const lvlGrid = document.getElementById('parent-lvl-grid');
  lvlGrid.innerHTML = '';
  LEVEL_ORDER.forEach(lv=>{
    const tag=document.createElement('div');
    tag.className='plvl-tag'+(parentTmpLvls.includes(lv)?' on':'');
    tag.textContent=lv;
    tag.onclick=()=>{
      if(parentTmpLvls.includes(lv)){ if(parentTmpLvls.length>1) parentTmpLvls=parentTmpLvls.filter(x=>x!==lv); }
      else parentTmpLvls.push(lv);
      tag.classList.toggle('on', parentTmpLvls.includes(lv));
    };
    lvlGrid.appendChild(tag);
  });
}

function saveParentLvls() {
  if(!parentUnlocked) return;
  const p = DB.p[parentViewProf]; if(!p) return;
  p.parentLockedLevels = [...parentTmpLvls];
  saveDB();
  toast('✅ Niveaux enregistrés !');
  // Re-render les niveaux dans l'app principale
  renderLevels();
}

// Surcharger renderLevels pour respecter parentLockedLevels
const _origRenderLevels = typeof renderLevels === 'function' ? renderLevels : null;

// ══════════════════════════════════════════════════
// EXPLICATIONS ENRICHIES dans le corrigé
// ══════════════════════════════════════════════════
const ENRICHED_RULES = {
  // Conjugaison — exemples en contexte
  conj: {
    pres:  { ex: 'Je <u>mange</u>, tu <u>manges</u>, il <u>mange</u>, nous <u>mangeons</u>.' },
    impa:  { ex: 'Quand j\'étais petit, je <u>jouais</u> dehors tous les soirs.' },
    futu:  { ex: 'Demain, elle <u>partira</u> à 8h précises.' },
    passe: { ex: 'Hier, il <u>est tombé</u> de son vélo.' },
    cond:  { ex: 'Si j\'avais de l\'argent, j\'<u>achèterais</u> un vélo.' },
    subj:  { ex: 'Il faut que tu <u>finisses</u> tes devoirs avant ce soir.' },
  },
  // Homophones — rappels de règle
  homo: {
    'a/à':    'Test : remplace par "avait". Si ça marche → "a". Sinon → "à".',
    'est/et': 'Test : remplace "est" par "était". Si ça marche → "est". Sinon → "et".',
    'ses/ces':'<b>ses</b> = lui appartient (ses livres = les livres de quelqu\'un). <b>ces</b> = ceux-là (ces livres = ceux qu\'on voit).',
    'son/sont':'<b>son</b> = lui appartient. <b>sont</b> = verbe être au pluriel (ils/elles sont).',
    'ou/où':  '<b>où</b> = lieu ou choix. Test : remplace par "ou bien". Si absurde → "où".',
    'se/ce':  '<b>se</b> précède un verbe pronominal (se laver). <b>ce</b> = déterminant/pronom démonstratif.',
    'ma/m\'a':'<b>m\'a</b> = m\'a dit (elle m\'a parlé). <b>ma</b> = mon (ma maison).',
    'la/là':  '<b>là</b> = endroit (il est là). <b>la</b> = article ou pronom (la maison, je la vois).',
  },
  // Accord — rappels visuels
  adj: 'L\'adjectif s\'accorde toujours avec le nom qu\'il qualifie.\n→ <u>féminin</u> : ajouter -e (grand → grand<u>e</u>)\n→ <u>pluriel</u> : ajouter -s (grand → grand<u>s</u>)',
  genre: 'Astuce : le/un → <b>masculin</b> | la/une → <b>féminin</b>. En doute, cherche dans le dictionnaire.',
};

function getEnrichedExpl(q) {
  let base = '';
  if(q.t === 'conj' && q.tense) {
    const rule = ENRICHED_RULES.conj[q.tense];
    if(rule) base = `<div class="ci-rule-ex">Exemple : ${rule.ex}</div>`;
  } else if(q.t === 'homo' && q.correct) {
    // Chercher une règle pour cet homophone
    const key = Object.keys(ENRICHED_RULES.homo).find(k => k.includes(q.correct.replace(/_/g,'').toLowerCase()));
    if(key) base = `<div class="ci-rule-ex">💡 ${ENRICHED_RULES.homo[key]}</div>`;
  } else if(q.t === 'adj') {
    base = `<div class="ci-rule-ex">💡 ${ENRICHED_RULES.adj}</div>`;
  } else if(q.t === 'genre') {
    base = `<div class="ci-rule-ex">💡 ${ENRICHED_RULES.genre}</div>`;
  } else if(q.t === 'phrase_corr' && q.explication) {
    base = `<div class="ci-rule-ex">📌 ${q.explication}</div>`;
  }
  return base;
}

// ══════════════════════════════════════════════════
// INTÉGRATION — overrides et hooks
// ══════════════════════════════════════════════════

// Hook sur showOnboarding au démarrage (appelé après renderHome)
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(showOnboarding, 800);
});

// Mettre à jour le compteur étoiles dans la carte quand on gagne des étoiles
const _origAddStars = addStars;
// (addStars est déjà définie dans le module boutique, on ajoute juste le refresh carte)

// Filtrer les niveaux selon parentLockedLevels
function getUnlockedLevels() {
  const p = curP();
  if(p && p.parentLockedLevels && p.parentLockedLevels.length > 0) {
    return p.parentLockedLevels;
  }
  return LEVEL_ORDER;
}

// ── Zoom carte ──────────────────────────────────────
(function initCarteZoom(){
  let scale=1, tx=0, ty=0;
  let startDist=0, startScale=1;
  let isDragging=false, lastX=0, lastY=0;
  
  function applyTransform(svg){
    scale=Math.min(Math.max(scale,1),5);
    // Limiter la translation
    const maxTx=(scale-1)*250, maxTy=(scale-1)*260;
    tx=Math.min(Math.max(tx,-maxTx),maxTx);
    ty=Math.min(Math.max(ty,-maxTy),maxTy);
    svg.style.transform=`scale(${scale}) translate(${tx/scale}px,${ty/scale}px)`;
    svg.style.transformOrigin='center center';
    svg.style.transition='';
  }
  
  document.addEventListener('DOMContentLoaded',()=>{
    const wrap=document.querySelector('.carte-svg-wrap');
    const getSvg=()=>document.getElementById('carte-svg');
    if(!wrap)return;
    
    // Boutons zoom
    const btnWrap=document.createElement('div');
    btnWrap.style.cssText='position:absolute;bottom:8px;right:8px;display:flex;flex-direction:column;gap:4px;z-index:10';
    [['＋','in'],['－','out'],['⊙','reset']].forEach(([lbl,act])=>{
      const b=document.createElement('button');
      b.textContent=lbl;
      b.style.cssText='width:32px;height:32px;border-radius:8px;border:1.5px solid var(--bg4);background:var(--bg3);color:var(--txt);font-size:1rem;cursor:pointer;font-weight:700';
      b.onclick=()=>{
        const svg=getSvg();if(!svg)return;
        if(act==='in')scale=Math.min(scale+0.5,5);
        else if(act==='out')scale=Math.max(scale-0.5,1);
        else{scale=1;tx=0;ty=0;}
        applyTransform(svg);
      };
      btnWrap.appendChild(b);
    });
    wrap.style.position='relative';
    wrap.appendChild(btnWrap);
    
    // Pinch zoom (mobile)
    wrap.addEventListener('touchstart',e=>{
      if(e.touches.length===2){
        startDist=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        startScale=scale;
      } else if(e.touches.length===1){
        isDragging=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
      }
    },{passive:true});
    wrap.addEventListener('touchmove',e=>{
      const svg=getSvg();if(!svg)return;
      if(e.touches.length===2&&startDist>0){
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        scale=Math.min(Math.max(startScale*(d/startDist),1),5);
        applyTransform(svg);
      } else if(e.touches.length===1&&isDragging&&scale>1){
        tx+=e.touches[0].clientX-lastX;
        ty+=e.touches[0].clientY-lastY;
        lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
        applyTransform(svg);
      }
    },{passive:true});
    wrap.addEventListener('touchend',()=>{isDragging=false;startDist=0;});
    
    // Réinitialiser zoom à la fermeture
    const origClose=window.closeCarte;
    window.closeCarte=function(){
      const svg=getSvg();
      if(svg){scale=1;tx=0;ty=0;svg.style.transform='';}
      if(origClose)origClose();
    };
  });
})();

