// ══════════════════════════════════════════════════
// FRANÇAIS POSÉ — app.js
// Logique principale : DB, moteur de conjugaison,
// générateur de questions, interface, IA.
// NE PAS MODIFIER sauf pour ajuster les règles de jeu.
// ══════════════════════════════════════════════════

let DB={p:[]};
const DB_KEY='frDB4';
function saveDB(){try{localStorage.setItem(DB_KEY,JSON.stringify(DB));}catch(e){}}
function loadDB(){try{const d=localStorage.getItem(DB_KEY);if(d)DB=JSON.parse(d);}catch(e){}}
function mkProf(name,av){return{name,av,xp:0,totalQ:0,perfectRounds:0,maxCombo:0,
  conjOk:0,homoOk:0,orthoOk:0,synoOk:0,revisionDone:0,
  badges:[],history:[],errors:[],typeStats:{}};}
function curP(){return DB.p[cur]||null;}

// ══════════════════════════════════════════════════
// STATE
let cur=0,curOp='conj_pres',isMix=false,isRev=false;
let selLvls=['CP'],qCount=5,chronoMode='libre';
let ctmLeft=0,ctmID=null;
let qs=[],qi=0,ans=[],combo=0,sessXP=0;
let blocked=false,triesLeft=2;
let qStartTime=0,curQ=null;
const MAX_TRIES=2;

// ══════════════════════════════════════════════════
// UTILS
function pick(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffle(arr){const a=[...arr];for(let i=a.length-1;i>0;i--){const j=0|Math.random()*(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function maxLvlI(){return Math.max(...selLvls.map(lvlIdx));}
function compatVerbs(){const m=maxLvlI();return VERB_LIST.filter(v=>lvlIdx(v[4])<=m);}

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
function genQ(opId){
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

    // ── 2. Terminaisons fausses mais plausibles : même verbe, même personne,
    //    même temps mais avec une terminaison erronée typique.
    //    Ex: "je dansais" → "je dansait", "je dancerais" → "je dancera"
    const form=correct; // forme correcte comme base
    // Fautes de terminaison sur la forme correcte
    const termFautes=[];
    if(tense==='pres'&&v[1]===1){
      // Groupe 1 présent : confusions -e/-es/-ent pour je/tu/il
      if(pi===0)termFautes.push(inf.replace(/er$/,'es'),inf.replace(/er$/,'ait'));
      if(pi===1)termFautes.push(inf.replace(/er$/,'e'),inf.replace(/er$/,'ait'));
      if(pi===2)termFautes.push(inf.replace(/er$/,'e'),inf.replace(/er$/,'es'));
      if(pi===3)termFautes.push(inf.replace(/er$/,'on'),inf.replace(/er$/,'ont'));
      if(pi===4)termFautes.push(inf.replace(/er$/,'és'),inf.replace(/er$/,'ais'));
      if(pi===5)termFautes.push(inf.replace(/er$/,'en'),inf.replace(/er$/,'aient'));
    }
    if(tense==='imp'){
      // Confusion imparfait/présent : -ais → -e ou -a
      const s=form.replace(/ /g,'');
      if(form.endsWith('ais'))termFautes.push(form.replace(/ais$/,'e'),form.replace(/ais$/,'a'));
      if(form.endsWith('ait'))termFautes.push(form.replace(/ait$/,'a'),form.replace(/ait$/,'e'));
      if(form.endsWith('ions'))termFautes.push(form.replace(/ions$/,'ons'),form.replace(/ions$/,'iont'));
      if(form.endsWith('aient'))termFautes.push(form.replace(/aient$/,'ont'),form.replace(/aient$/,'ent'));
    }
    if(tense==='fut'){
      if(form.endsWith('ai'))termFautes.push(form.replace(/ai$/,'ait'),form.replace(/ai$/,'ais'));
      if(form.endsWith('ons'))termFautes.push(form.replace(/ons$/,'ont'),form.replace(/ons$/,'ions'));
      if(form.endsWith('ont'))termFautes.push(form.replace(/ont$/,'aient'),form.replace(/ont$/,'ons'));
    }
    if(tense==='cond'){
      if(form.endsWith('ais'))termFautes.push(form.replace(/ais$/,'a'),form.replace(/ais$/,'e'));
      if(form.endsWith('ait'))termFautes.push(form.replace(/ait$/,'a'),form.replace(/ait$/,'ais'));
      if(form.endsWith('aient'))termFautes.push(form.replace(/aient$/,'ont'),form.replace(/aient$/,'ent'));
    }
    if(tense==='subj'){
      if(pi===3)termFautes.push(form.replace(/ions$/,'ons'),form.replace(/ions$/,'iont'));
      if(pi===4)termFautes.push(form.replace(/iez$/,'ez'),form.replace(/iez$/,'ier'));
    }
    termFautes.forEach(f=>add(f));

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

    return{t:'conj',verb:inf,tense,pi,subj:SUBJECTS[pi],correct,
      choices:shuffle([correct,...wrongs.slice(0,3)]),opId};
  }

  const m=maxLvlI();

  // ── HOMOPHONES ─────────────────────────────────
  if(opId==='homo'){
    const pool=HOMO.filter(h=>lvlIdx(h[3])<=m);if(!pool.length)return null;
    const[phrase,correct,wrongs]=pick(pool);
    // Compléter avec des homophones d'autres entrées si besoin
    const extra=shuffle(pool.filter(e=>e[1]!==correct)).flatMap(e=>[e[1],...e[2]]);
    const allWrongs=[...wrongs,...extra].filter((f,i,a)=>f!==correct&&a.indexOf(f)===i);
    return{t:'homo',phrase,correct,choices:shuffle([correct,...allWrongs].slice(0,4)),opId};
  }

  // ── ACCORD D'ADJECTIF ──────────────────────────
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
    const ca=adj[ai];const nf=noun[ni];
    // Distracteurs : les 3 autres formes du même adjectif
    // + formes issues d'adjectifs proches (même terminaison/famille)
    const sameAdj=[adj[0],adj[1],adj[2],adj[3]].filter(f=>f!==ca);
    // Piocher dans 2-3 autres adjectifs pour des formes supplémentaires
    const others=shuffle(ap.filter(a=>a!==adj));
    const extraForms=others.slice(0,3).flatMap(a=>[a[ai]]).filter(f=>f!==ca);
    const wf=[...new Set([...sameAdj,...extraForms])];
    const det=g==='m'?(nb==='s'?'un':'des'):(nb==='s'?'une':'des');
    return{t:'adj',noun:nf,det,g,nb,adjBase:adj[0],correct:ca,
      choices:shuffle([ca,...shuffle(wf).slice(0,3)]),opId};
  }

  // ── ACCORD GROUPE NOMINAL ──────────────────────
  if(opId==='gn_accord'){
    const pool=GN.filter(g=>lvlIdx(g[5])<=m);if(!pool.length)return null;
    const[det,nom,adjMs,genre,nb]=pick(pool);
    const ae=ADJ.find(a=>a[0]===adjMs)||ADJ[0];
    const ai=(genre==='f'?1:0)+(nb==='p'?2:0);
    const correct=ae[ai];
    // Mêmes 4 formes de l'adjectif + forme du même index dans d'autres adjectifs
    const sameAdj=[ae[0],ae[1],ae[2],ae[3]].filter(f=>f!==correct);
    const otherAdj=shuffle(ADJ.filter(a=>a!==ae)).slice(0,2).map(a=>a[ai]).filter(f=>f!==correct);
    const wf=[...new Set([...sameAdj,...otherAdj])];
    return{t:'gn',det,nom,genre,nb,adjMs,correct,
      choices:shuffle([correct,...shuffle(wf).slice(0,3)]),opId};
  }

  // ── NATURE DES MOTS ────────────────────────────
  if(opId==='nature'){
    const pool=NATURE.filter(n=>lvlIdx(n[4])<=m);if(!pool.length)return null;
    const[phrase,mot,correct,wrongs]=pick(pool);
    return{t:'nature',phrase,mot,correct,choices:shuffle([correct,...wrongs].slice(0,4)),opId};
  }

  // ── ORTHOGRAPHE ────────────────────────────────
  if(opId==='ortho'){
    const pool=ORTHO.filter(o=>lvlIdx(o[5])<=m);if(!pool.length)return null;
    const entry=pick(pool);
    const correct=entry[0];
    // Prendre les formes fausses de cette entrée
    const ownWrongs=entry.slice(1,5).filter(f=>f&&f!==correct);
    // Compléter éventuellement avec des mots corrects d'autres entrées (vraie orthographe,
    // mais pas la bonne réponse ici) — crée un distracteur plus subtil
    const extra=shuffle(pool.filter(e=>e!==entry)).map(e=>e[0]).filter(f=>f!==correct);
    const allW=[...ownWrongs,...extra].filter((f,i,a)=>a.indexOf(f)===i);
    return{t:'ortho',correct,choices:shuffle([correct,...allW.slice(0,3)]),opId};
  }

  // ── SYNONYMES ──────────────────────────────────
  if(opId==='synonyme'){
    const pool=SYNO.filter(s=>lvlIdx(s[3])<=m);if(!pool.length)return null;
    const[mot,correct,wrongs]=pick(pool);
    // Distracteurs : faux de l'entrée + vrais synonymes d'AUTRES mots (pièges réalistes)
    const realSynonyms=pool.filter(e=>e[1]!==correct).map(e=>e[1]);
    const allW=[...wrongs,...shuffle(realSynonyms)].filter((f,i,a)=>f!==correct&&a.indexOf(f)===i);
    return{t:'syno',mot,correct,choices:shuffle([correct,...allW.slice(0,3)]),opId};
  }

  // ── ANTONYMES ──────────────────────────────────
  if(opId==='antonyme'){
    const pool=ANTO.filter(a=>lvlIdx(a[3])<=m);if(!pool.length)return null;
    const[mot,correct,wrongs]=pick(pool);
    // Distracteurs : faux de l'entrée + vrais antonymes d'AUTRES mots (pièges réalistes)
    const realAnto=pool.filter(e=>e[1]!==correct).map(e=>e[1]);
    const allW=[...wrongs,...shuffle(realAnto)].filter((f,i,a)=>f!==correct&&a.indexOf(f)===i);
    return{t:'anto',mot,correct,choices:shuffle([correct,...allW.slice(0,3)]),opId};
  }

  // ── DICTÉE ─────────────────────────────────────
  if(opId==='dictee'){
    const pool=DICTEE_DATA.filter(d=>lvlIdx(d[1])<=maxLvlI());
    if(!pool.length)return null;
    const[phrase]=pick(pool);
    return{t:'dictee',phrase,opId};
  }

  // ── CORRIGER LA PHRASE ─────────────────────────
  if(opId==='phrase_corr'){
    const pool=PHRASE_CORR.filter(d=>lvlIdx(d[4])<=maxLvlI());
    if(!pool.length)return null;
    const[phrase,erreur,correction,explication]=pick(pool);
    // Distracteurs : corrections de d'autres phrases de la même catégorie grammaticale
    const distractors=shuffle(pool.filter(p=>p[2]!==correction)).slice(0,3).map(p=>p[2]);
    return{t:'phrase_corr',phrase,erreur,correction,explication,
      choices:shuffle([correction,...distractors]),opId};
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
function renderHome(){renderProfiles();renderLevels();renderOps();}

function renderProfiles(){
  const w=document.getElementById('profiles-wrap');w.innerHTML='';
  if(!DB.p.length){
    // Pas encore de profil : afficher un CTA centré
    const msg=document.createElement('div');
    msg.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px 16px;';
    msg.innerHTML='<div style="font-size:2.2rem">👤</div>'+
      '<div style="font-size:.85rem;font-weight:700;color:var(--txt)">Bienvenue !</div>'+
      '<div style="font-size:.72rem;color:var(--txt2);text-align:center">Crée un profil pour commencer<br>et suivre ta progression.</div>'+
      '<button class="btn-go" style="margin-top:6px;padding:10px 22px;font-size:.82rem" onclick="openProfModal()">➕ Créer un profil</button>';
    w.appendChild(msg);
    renderRevBanner();return;
  }
  DB.p.forEach((p,i)=>{
    const lv=getXPLevel(p.xp);
    const errN=(p.errors||[]).length;
    const d=document.createElement('div');
    d.className='prof-card'+(i===cur?' active':'');
    d.innerHTML=`<div class="av">${p.av}</div>`+
      `<div class="pname">${p.name}</div>`+
      `<div class="plvl">${lv.ic} ${lv.lbl}</div>`+
      (errN?`<div class="perr">⚠ ${errN} erreur${errN>1?'s':''}</div>`:'');
    d.onclick=()=>{cur=i;renderProfiles();renderRevBanner();};
    w.appendChild(d);
  });
  const add=document.createElement('div');add.className='prof-card add-prof';
  add.innerHTML='<div class="av">➕</div><div class="pname">Nouveau</div>';
  add.onclick=openProfModal;w.appendChild(add);
  renderRevBanner();
}
function renderRevBanner(){
  const p=curP();const ban=document.getElementById('rev-banner');
  if(!p||!p.errors||!p.errors.length){ban.classList.remove('show');return;}
  const n=p.errors.length;
  document.getElementById('rev-title').textContent=`Réviser ${n} erreur${n>1?'s':''}`;
  document.getElementById('rev-sub').textContent='Tes points faibles à retravailler';
  ban.classList.add('show');
}
function renderLevels(){
  const sc=document.getElementById('lvl-row');sc.innerHTML='';
  LEVELS.forEach(l=>{
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
  const mix=document.createElement('div');
  mix.className='ex-card ex-mix'+(isMix?' selected':'');
  mix.innerHTML='<div class="eicon">🎲</div><div class="elabel">Méli-mélo</div><div class="esub">Tout mélangé !</div>';
  mix.onclick=()=>{isMix=true;startGame('mix');};g.appendChild(mix);
  OPS.forEach(op=>{
    const avail=maxLvlI()>=lvlIdx(op.min);
    const d=document.createElement('div');
    d.className='ex-card'+(!avail?' off':'')+((!isMix&&curOp===op.id)?' selected':'');
    d.innerHTML=`<div class="eicon">${op.ic}</div><div class="elabel">${op.lbl}</div>`+
      `<div class="esub">${op.sub}</div><div class="ebadge">${op.min}+</div>`;
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

// ══════════════════════════════════════════════════
// PROFILE MODAL
let selAv=AVATS[0];
function openProfModal(){
  const g=document.getElementById('av-grid');g.innerHTML='';
  AVATS.forEach(a=>{
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
  curOp=opId;isRev=false;qs=[];qi=0;ans=[];combo=0;sessXP=0;blocked=false;
  if(qCount===0){const q=genQ(opId);if(!q){toast('Aucune question disponible');return;}qs=[q];}
  else{for(let i=0;i<qCount;i++){const q=genQ(opId);if(q)qs.push(q);}if(!qs.length){toast('Niveau indisponible pour cet exercice');return;}}
  document.getElementById('stop-btn').style.display=qCount===0?'block':'none';
  showScreen('game');showQ();
}
function startRevision(){
  const p=curP();
  if(!p||!p.errors||!p.errors.length){toast('Aucune erreur à réviser !');return;}
  isRev=true;curOp='mix';
  qs=shuffle([...p.errors]).slice(0,Math.min(10,p.errors.length));
  qi=0;ans=[];combo=0;sessXP=0;blocked=false;
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
    ortho:'Orthographe',syno:'Synonymes',anto:'Antonymes'
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
  choices.forEach(c=>{
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
    pts=Math.round(10*(triesLeft===MAX_TRIES?1:.5)*(combo>=3?2:combo>=2?1.5:1));
    if(elapsed<5&&triesLeft===MAX_TRIES)pts=Math.round(pts*1.2); // speed bonus
    sessXP+=pts;showFb(true,getExpl(q,true),true);
  }else{
    combo=0;showFb(false,getExpl(q,false),true);storeErr(q);
  }
  document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
  if(ok&&pts>0)flyPts('+'+pts);
  // In revision, remove correctly answered errors
  if(ok&&isRev){
    const p=curP();
    if(p){const k=JSON.stringify({t:q.t,verb:q.verb,tense:q.tense,pi:q.pi,phrase:q.phrase,mot:q.mot,correct:q.correct});
      p.errors=p.errors.filter(e=>JSON.stringify({t:e.t,verb:e.verb,tense:e.tense,pi:e.pi,phrase:e.phrase,mot:e.mot,correct:e.correct})!==k);
      saveDB();}
  }
  setTimeout(()=>{qi++;showQ();},ok?1500:4000);
}

function storeErr(q){
  const p=curP();if(!p)return;
  if(!p.errors)p.errors=[];
  const copy={...q};delete copy.choices; // recompute choices fresh next time
  copy.choices=q.choices; // keep choices for revision
  // dedup by type + key fields
  const key=q.t+(q.verb||'')+(q.tense||'')+(q.pi||0)+(q.phrase||'')+(q.mot||'')+(q.correct||'');
  p.errors=p.errors.filter(e=>{
    const ek=e.t+(e.verb||'')+(e.tense||'')+(e.pi||0)+(e.phrase||'')+(e.mot||'')+(e.correct||'');
    return ek!==key;
  });
  p.errors.unshift({...q});
  if(p.errors.length>30)p.errors.length=30;
  saveDB();
}

function getExpl(q,ok){
  const T=(ok?'✅ ':'');
  if(q.t==='conj'){const f=fullForm(q.verb,q.tense,q.pi);return ok?`✅ ${f} — ${TENSE_LBL[q.tense]}`:`Réponse : <strong>${f}</strong>`;}
  if(q.t==='homo')return ok?`✅ "${q.correct}"`:`Bonne réponse : <strong>${q.correct}</strong>`;
  if(q.t==='adj')return ok?`✅ "${q.correct}" — accord correct`:`Accord correct : <strong>${q.correct}</strong>`;
  if(q.t==='gn')return ok?`✅ "${q.correct}" — GN accordé`:`Forme correcte : <strong>${q.correct}</strong>`;
  if(q.t==='nature')return ok?`✅ "${q.mot}" → ${q.correct}`:`"${q.mot}" est un(e) <strong>${q.correct}</strong>`;
  if(q.t==='ortho')return ok?`✅ "${q.correct}"`:`Bonne orthographe : <strong>${q.correct}</strong>`;
  if(q.t==='syno')return ok?`✅ Synonyme de "${q.mot}"`:`Synonyme de "${q.mot}" : <strong>${q.correct}</strong>`;
  if(q.t==='phrase_corr')return ok?`✅ "${q.correction}" — bonne correction !`:`Correction : <strong>${q.correction}</strong> — ${q.explication}`;
  if(q.t==='genre')return ok?`✅ "${q.mot}" est bien ${q.correct}`:`"${q.mot}" est <strong>${q.correct}</strong>`;
  if(q.t==='anto')return ok?`✅ Contraire de "${q.mot}"`:`Contraire de "${q.mot}" : <strong>${q.correct}</strong>`;
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
    const newBdg=[];
    BADGES.forEach(b=>{if(!p.badges.includes(b.id)&&b.cond(p)){p.badges.push(b.id);newBdg.push(b);}});
    saveDB();newBdg.forEach((b,i)=>setTimeout(()=>badgePopup(b),600+i*2000));
  }
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
    const aiBtn=!ok?`<button class="ci-why" onclick="askAIForQ(${i})">💡 Pourquoi ?</button>`:'';
    d.innerHTML=`<div class="ci-icon">${ok?'✅':'❌'}</div>`+
      `<div class="ci-body"><div class="ci-q">${qa}</div>`+
      `<div class="ci-a">→ <span>${qb}</span></div>${aiBtn}</div>`;
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

  // Build diff display
  const diff=document.createElement('div');diff.className='diff-wrap';
  const maxL=Math.max(tw.length,cw.length);
  for(let i=0;i<maxL;i++){
    if(i>0)diff.appendChild(document.createTextNode(' '));
    const t=tw[i]||'';const c=cw[i]||'';
    const sp=document.createElement('span');
    if(t===c){sp.className='diff-ok';sp.textContent=t;}
    else if(!t){errCount++;sp.className='diff-miss';sp.textContent='['+c+']';}
    else{errCount++;sp.className='diff-err';sp.title='Attendu : '+c;sp.textContent=t;}
    diff.appendChild(sp);
  }
  const zone=document.getElementById('dictee-zone');
  zone.querySelectorAll('.diff-wrap,.diff-corr').forEach(el=>el.remove());
  inp.insertAdjacentElement('afterend',diff);

  if(errCount>0){
    const corr=document.createElement('div');corr.className='diff-corr';
    corr.innerHTML='<span style="color:var(--acc2);font-weight:700">Phrase correcte :</span> '+dicteePhrase;
    diff.insertAdjacentElement('afterend',corr);
  }

  const ok=errCount===0;
  const frac=errCount===0?1:errCount<=2?0.5:0;
  const pts=Math.round(10*frac*(combo>=3?2:combo>=2?1.5:1));
  if(ok)combo++;else{combo=0;storeErr(qs[qi]);}
  ans.push(ok);
  sessXP+=pts;
  document.getElementById('xp-pill').textContent='+'+sessXP+' XP';
  if(pts>0)flyPts('+'+pts);

  showFb(ok,
    ok?'✅ Parfait ! Aucune erreur.':
    errCount<=2?`⚠️ ${errCount} erreur${errCount>1?'s':''}. Regarde les mots soulignés.`:
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
  if(e.key==='Enter'&&document.getElementById('prof-modal').classList.contains('open'))saveProfModal();
  if(e.key==='Escape'){
    closeProfModal();closeSettings();closeAI();
  }
  // 1-4 for choices during game
  if(['1','2','3','4'].includes(e.key)&&document.getElementById('game').classList.contains('active')){
    const idx=parseInt(e.key)-1;
    const btns=document.querySelectorAll('.ch');
    if(btns[idx]&&!blocked)btns[idx].click();
  }
});

// ══════════════════════════════════════════════════
// INIT
loadDB();
// Migrate old data
DB.p.forEach(p=>{
  if(!p.errors)p.errors=[];
  if(!p.typeStats)p.typeStats={};
  if(p.synoOk===undefined)p.synoOk=0;
  if(p.revisionDone===undefined)p.revisionDone=0;
});
saveDB();
if(!DB.p.length){openProfModal();}
renderHome();
