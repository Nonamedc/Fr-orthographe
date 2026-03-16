// Français Posé 📚
// Configuration, niveaux, exercices, constantes
const LEVELS=['CP','CE1','CE2','CM1','CM2','6e','5e','4e','3e','2de','1re','Tle'];
function lvlIdx(l){const i=LEVELS.indexOf(l);return i>=0?i:0;}
const XP_LEVELS=[
  {min:0,lbl:'Novice',ic:'🌱'},{min:80,lbl:'Apprenti',ic:'📖'},
  {min:200,lbl:'Élève',ic:'✏️'},{min:450,lbl:'Confirmé',ic:'🎒'},
  {min:850,lbl:'Expert',ic:'🎓'},{min:1500,lbl:'Érudit',ic:'⭐'},
  {min:3000,lbl:'Maître',ic:'🏆'}
];
function getXPLevel(xp){let l=XP_LEVELS[0];for(const lv of XP_LEVELS)if(xp>=lv.min)l=lv;return l;}

// ── Types d'exercices ──
const OPS=[
  {id:'conj_pres',lbl:'Présent',sub:'Indicatif présent',ic:'📝',min:'CP'},
  {id:'conj_imp',lbl:'Imparfait',sub:'Indicatif imparfait',ic:'📖',min:'CE2'},
  {id:'conj_fut',lbl:'Futur simple',sub:"Futur de l'indicatif",ic:'🚀',min:'CM1'},
  {id:'conj_pc',lbl:'Passé composé',sub:'Auxiliaire + participe',ic:'⏪',min:'CM1'},
  {id:'conj_pqp',lbl:'Plus-que-parfait',sub:'Temps du récit',ic:'⏮',min:'5e'},
  {id:'conj_cond',lbl:'Conditionnel',sub:'Conditionnel présent',ic:'🎭',min:'4e'},
  {id:'conj_subj',lbl:'Subjonctif',sub:'Subjonctif présent',ic:'🔮',min:'3e'},
  {id:'homo',lbl:'Homophones',sub:'a/à · on/ont · est/et',ic:'🔊',min:'CE2'},
  {id:'adj_accord',lbl:'Accord adj.',sub:'Genre & nombre',ic:'🔤',min:'CE2'},
  {id:'gn_accord',lbl:'Groupe nominal',sub:'Accord dans le GN',ic:'📐',min:'CM1'},
  {id:'nature',lbl:'Nature des mots',sub:'Nom · verbe · adj…',ic:'🏷',min:'CE1'},
  {id:'ortho',lbl:'Orthographe',sub:'Bien écrire les mots',ic:'✏️',min:'CE1'},
  {id:'synonyme',lbl:'Synonymes',sub:'Trouver le mot proche',ic:'🔗',min:'CE1'},
  {id:'antonyme',lbl:'Antonymes',sub:'Trouver le contraire',ic:'↔️',min:'CE1'},
  {id:'dictee',lbl:'Dictée',sub:'Écoute et écris la phrase',ic:'🎙',min:'CE1'},
  {id:'phrase_corr',lbl:'Corriger la phrase',sub:"Trouve et corrige l'erreur",ic:'🔍',min:'CE2'},
  {id:'genre',lbl:'Genre des noms',sub:'Masculin ou féminin ?',ic:'⚖️',min:'CP'},
  {id:'accents',lbl:'Accents',sub:'é è ê à â û î…',ic:'✍️',min:'CP'},
];

// ── Homophones ── [phrase_avec_trou, correct, [faux], minLvl]
const TENSE_LBL={pres:'présent',imp:'imparfait',fut:'futur simple',pc:'passé composé',pqp:'plus-que-parfait',cond:'conditionnel présent',subj:'subjonctif présent'};
const SUBJECTS=['je','tu','il/elle','nous','vous','ils/elles'];
const SUBJ_S=['je','tu','il','nous','vous','ils'];
const AVATS=['🧒','👦','👧','🧑','👨','👩','🧔','👴','👵','🎓','🦊','🐼','🐸','🦁','🐧','🤖','👾','🧸','🌟','🏆'];

// ── Badges ──
const BADGES=[
  {id:'first',ic:'🎯',nm:'Premier pas',cond:p=>p.totalQ>=1},
  {id:'x10',ic:'🔟',nm:'10 questions',cond:p=>p.totalQ>=10},
  {id:'x100',ic:'💯',nm:'Centurion',cond:p=>p.totalQ>=100},
  {id:'x500',ic:'🏅',nm:'Marathonien',cond:p=>p.totalQ>=500},
  {id:'x1000',ic:'🏆',nm:'1000 questions',cond:p=>p.totalQ>=1000},
  {id:'perfect',ic:'⭐',nm:'Sans faute',cond:p=>p.perfectRounds>=1},
  {id:'p5',ic:'🌟',nm:'5 sessions parfaites',cond:p=>p.perfectRounds>=5},
  {id:'p20',ic:'✨',nm:'20 sessions parfaites',cond:p=>p.perfectRounds>=20},
  {id:'combo5',ic:'🔥',nm:'Combo x5',cond:p=>p.maxCombo>=5},
  {id:'combo10',ic:'💥',nm:'Combo x10',cond:p=>p.maxCombo>=10},
  {id:'combo20',ic:'🌪️',nm:'Combo x20',cond:p=>p.maxCombo>=20},
  {id:'xp500',ic:'⚡',nm:'500 XP',cond:p=>p.xp>=500},
  {id:'xp2000',ic:'💎',nm:'2000 XP',cond:p=>p.xp>=2000},
  {id:'xp5000',ic:'👑',nm:'5000 XP',cond:p=>p.xp>=5000},
  {id:'conj30',ic:'📝',nm:'30 conjugaisons',cond:p=>(p.conjOk||0)>=30},
  {id:'homo20',ic:'🔊',nm:'20 homophones',cond:p=>(p.homoOk||0)>=20},
  {id:'ortho20',ic:'✏️',nm:'20 orthos',cond:p=>(p.orthoOk||0)>=20},
  {id:'syno20',ic:'🔗',nm:'20 synonymes',cond:p=>(p.synoOk||0)>=20},
  {id:'revision',ic:'🔁',nm:'Réviseur',cond:p=>(p.revisionDone||0)>=1},
  {id:'revision10',ic:'🧠',nm:'10 révisions',cond:p=>(p.revisionDone||0)>=10},
  {id:'all_types',ic:'🎓',nm:'Touche-à-tout',cond:p=>Object.keys(p.typeStats||{}).length>=8},
  // Streak
  {id:'streak3',ic:'🔥',nm:'3 jours de suite',cond:p=>(p.bestStreak||0)>=3},
  {id:'streak7',ic:'📅',nm:'7 jours de suite',cond:p=>(p.bestStreak||0)>=7},
  {id:'streak30',ic:'🗓️',nm:'30 jours de suite',cond:p=>(p.bestStreak||0)>=30},
  // SRS
  {id:'srs_clear',ic:'✅',nm:'Réviseur SRS',cond:p=>(p.srsClearedTotal||0)>=1},
  {id:'srs_master',ic:'🏗️',nm:'Maître SRS',cond:p=>(p.srsClearedTotal||0)>=20},
];
