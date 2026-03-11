// ══════════════════════════════════════════════════
// FRANÇAIS POSÉ — data.js
// Toutes les données pédagogiques. Modifiez ce fichier
// pour ajouter des verbes, mots, phrases, etc.
// ══════════════════════════════════════════════════

// ── Verbes ── [infinitif, groupe, auxiliaire, participe_passé, niveau_min]
// groupe : 1=er, 2=ir régulier, 3=irrégulier
// auxiliaire : 'av'=avoir, 'et'=être
const VERB_LIST=[
  // CP — être / avoir
  ['être',3,'et','été','CP'],['avoir',3,'av','eu','CP'],
  // CE1 — verbes courants du quotidien
  ['aimer',1,'av','aimé','CE1'],['parler',1,'av','parlé','CE1'],
  ['chanter',1,'av','chanté','CE1'],['danser',1,'av','dansé','CE1'],
  ['jouer',1,'av','joué','CE1'],['regarder',1,'av','regardé','CE1'],
  ['écouter',1,'av','écouté','CE1'],['travailler',1,'av','travaillé','CE1'],
  ['chercher',1,'av','cherché','CE1'],['trouver',1,'av','trouvé','CE1'],
  ['donner',1,'av','donné','CE1'],['penser',1,'av','pensé','CE1'],
  ['rester',1,'et','resté','CE1'],['arriver',1,'et','arrivé','CE1'],
  ['montrer',1,'av','montré','CE1'],['tourner',1,'av','tourné','CE1'],
  ['porter',1,'av','porté','CE1'],['manger',1,'av','mangé','CE1'],
  ['dessiner',1,'av','dessiné','CE1'],['entrer',1,'et','entré','CE1'],
  ['tomber',1,'et','tombé','CE1'],['monter',1,'et','monté','CE1'],
  ['marcher',1,'av','marché','CE1'],['sauter',1,'av','sauté','CE1'],
  ['crier',1,'av','crié','CE1'],['pleurer',1,'av','pleuré','CE1'],
  ['couper',1,'av','coupé','CE1'],['poser',1,'av','posé','CE1'],
  ['laver',1,'av','lavé','CE1'],['fermer',1,'av','fermé','CE1'],
  ['oublier',1,'av','oublié','CE1'],['décider',1,'av','décidé','CE1'],
  // CE2 — verbes plus variés
  ['commencer',1,'av','commencé','CE2'],['bouger',1,'av','bougé','CE2'],
  ['nager',1,'av','nagé','CE2'],['rentrer',1,'et','rentré','CE2'],
  ['passer',1,'av','passé','CE2'],['lever',1,'av','levé','CE2'],
  ['appeler',1,'av','appelé','CE2'],['acheter',1,'av','acheté','CE2'],
  ['ranger',1,'av','rangé','CE2'],['choisir',2,'av','choisi','CE2'],
  ['finir',2,'av','fini','CE2'],['grandir',2,'et','grandi','CE2'],
  ['préparer',1,'av','préparé','CE2'],['expliquer',1,'av','expliqué','CE2'],
  ['traverser',1,'av','traversé','CE2'],['rencontrer',1,'av','rencontré','CE2'],
  // CM1 — verbes irréguliers et nuancés
  ['espérer',1,'av','espéré','CM1'],['répéter',1,'av','répété','CM1'],
  ['voyager',1,'av','voyagé','CM1'],['rougir',2,'av','rougi','CM1'],
  ['réfléchir',2,'av','réfléchi','CM1'],['réussir',2,'av','réussi','CM1'],
  ['obéir',2,'av','obéi','CM1'],['nourrir',2,'av','nourri','CM1'],
  ['punir',2,'av','puni','CM1'],['faire',3,'av','fait','CM1'],
  ['dire',3,'av','dit','CM1'],['prendre',3,'av','pris','CM1'],
  ['venir',3,'et','venu','CM1'],['voir',3,'av','vu','CM1'],
  ['savoir',3,'av','su','CM1'],['pouvoir',3,'av','pu','CM1'],
  ['vouloir',3,'av','voulu','CM1'],['devoir',3,'av','dû','CM1'],
  ['mettre',3,'av','mis','CM1'],['partir',3,'et','parti','CM1'],
  ['sortir',3,'et','sorti','CM1'],['aller',3,'et','allé','CM1'],
  ['rappeler',1,'av','rappelé','CM1'],['améliorer',1,'av','amélioré','CM1'],
  ['utiliser',1,'av','utilisé','CM1'],['produire',3,'av','produit','CM1'],
  // CM2 — verbes du 3e groupe
  ['agir',2,'av','agi','CM2'],['établir',2,'av','établi','CM2'],
  ['tenir',3,'av','tenu','CM2'],['recevoir',3,'av','reçu','CM2'],
  ['boire',3,'av','bu','CM2'],['croire',3,'av','cru','CM2'],
  ['écrire',3,'av','écrit','CM2'],['lire',3,'av','lu','CM2'],
  ['descendre',3,'et','descendu','CM2'],
  ['résoudre',3,'av','résolu','CM2'],
  // 6e — verbes complexes
  ['connaître',3,'av','connu','6e'],['suivre',3,'av','suivi','6e'],
  ['vivre',3,'av','vécu','6e'],['courir',3,'av','couru','6e'],
  ['ouvrir',3,'av','ouvert','6e'],['offrir',3,'av','offert','6e'],
  ['sentir',3,'av','senti','6e'],['dormir',3,'av','dormi','6e'],
  ['servir',3,'av','servi','6e'],['rire',3,'av','ri','6e'],
  ['plaire',3,'av','plu','6e'],['taire',3,'et','tu','6e'],
  ['cueillir',3,'av','cueilli','6e'],
  // 5e
  ['conduire',3,'av','conduit','5e'],['construire',3,'av','construit','5e'],
  ['naître',3,'et','né','5e'],['mourir',3,'et','mort','5e'],
  ['valoir',3,'av','valu','5e'],['craindre',3,'av','craint','5e'],
  ['peindre',3,'av','peint','5e'],['rejoindre',3,'av','rejoint','5e'],
  ['suffire',3,'av','suffi','5e'],
  // 4e+
  ['perdre',3,'av','perdu','4e'],['vendre',3,'av','vendu','4e'],
  ['attendre',3,'av','attendu','4e'],['entendre',3,'av','entendu','4e'],
  ['répondre',3,'av','répondu','4e'],['répandre',3,'av','répandu','4e'],
  ['défendre',3,'av','défendu','4e'],['dépendre',3,'av','dépendu','4e'],
  ['conclure',3,'av','conclu','3e'],['inclure',3,'av','inclus','3e'],
  ['abstraire',3,'av','abstrait','2de'],['distraire',3,'av','distrait','2de'],
];

// ── Conjugaisons irrégulières ──
// [pres, imp, fut, cond, subj] → chaque entrée est un tableau de 6 formes
const CONJ_IRREG={
  'être':{pres:['suis','es','est','sommes','êtes','sont'],imp:['étais','étais','était','étions','étiez','étaient'],fut:['serai','seras','sera','serons','serez','seront'],cond:['serais','serais','serait','serions','seriez','seraient'],subj:['sois','sois','soit','soyons','soyez','soient']},
  'avoir':{pres:['ai','as','a','avons','avez','ont'],imp:['avais','avais','avait','avions','aviez','avaient'],fut:['aurai','auras','aura','aurons','aurez','auront'],cond:['aurais','aurais','aurait','aurions','auriez','auraient'],subj:['aie','aies','ait','ayons','ayez','aient']},
  'aller':{pres:['vais','vas','va','allons','allez','vont'],imp:['allais','allais','allait','allions','alliez','allaient'],fut:['irai','iras','ira','irons','irez','iront'],cond:['irais','irais','irait','irions','iriez','iraient'],subj:['aille','ailles','aille','allions','alliez','aillent']},
  'faire':{pres:['fais','fais','fait','faisons','faites','font'],imp:['faisais','faisais','faisait','faisions','faisiez','faisaient'],fut:['ferai','feras','fera','ferons','ferez','feront'],cond:['ferais','ferais','ferait','ferions','feriez','feraient'],subj:['fasse','fasses','fasse','fassions','fassiez','fassent']},
  'dire':{pres:['dis','dis','dit','disons','dites','disent'],imp:['disais','disais','disait','disions','disiez','disaient'],fut:['dirai','diras','dira','dirons','direz','diront'],cond:['dirais','dirais','dirait','dirions','diriez','diraient'],subj:['dise','dises','dise','disions','disiez','disent']},
  'prendre':{pres:['prends','prends','prend','prenons','prenez','prennent'],imp:['prenais','prenais','prenait','prenions','preniez','prenaient'],fut:['prendrai','prendras','prendra','prendrons','prendrez','prendront'],cond:['prendrais','prendrais','prendrait','prendrions','prendriez','prendraient'],subj:['prenne','prennes','prenne','prenions','preniez','prennent']},
  'venir':{pres:['viens','viens','vient','venons','venez','viennent'],imp:['venais','venais','venait','venions','veniez','venaient'],fut:['viendrai','viendras','viendra','viendrons','viendrez','viendront'],cond:['viendrais','viendrais','viendrait','viendrions','viendriez','viendraient'],subj:['vienne','viennes','vienne','venions','veniez','viennent']},
  'voir':{pres:['vois','vois','voit','voyons','voyez','voient'],imp:['voyais','voyais','voyait','voyions','voyiez','voyaient'],fut:['verrai','verras','verra','verrons','verrez','verront'],cond:['verrais','verrais','verrait','verrions','verriez','verraient'],subj:['voie','voies','voie','voyions','voyiez','voient']},
  'savoir':{pres:['sais','sais','sait','savons','savez','savent'],imp:['savais','savais','savait','savions','saviez','savaient'],fut:['saurai','sauras','saura','saurons','saurez','sauront'],cond:['saurais','saurais','saurait','saurions','sauriez','sauraient'],subj:['sache','saches','sache','sachions','sachiez','sachent']},
  'pouvoir':{pres:['peux','peux','peut','pouvons','pouvez','peuvent'],imp:['pouvais','pouvais','pouvait','pouvions','pouviez','pouvaient'],fut:['pourrai','pourras','pourra','pourrons','pourrez','pourront'],cond:['pourrais','pourrais','pourrait','pourrions','pourriez','pourraient'],subj:['puisse','puisses','puisse','puissions','puissiez','puissent']},
  'vouloir':{pres:['veux','veux','veut','voulons','voulez','veulent'],imp:['voulais','voulais','voulait','voulions','vouliez','voulaient'],fut:['voudrai','voudras','voudra','voudrons','voudrez','voudront'],cond:['voudrais','voudrais','voudrait','voudrions','voudriez','voudraient'],subj:['veuille','veuilles','veuille','voulions','vouliez','veuillent']},
  'devoir':{pres:['dois','dois','doit','devons','devez','doivent'],imp:['devais','devais','devait','devions','deviez','devaient'],fut:['devrai','devras','devra','devrons','devrez','devront'],cond:['devrais','devrais','devrait','devrions','devriez','devraient'],subj:['doive','doives','doive','devions','deviez','doivent']},
  'mettre':{pres:['mets','mets','met','mettons','mettez','mettent'],imp:['mettais','mettais','mettait','mettions','mettiez','mettaient'],fut:['mettrai','mettras','mettra','mettrons','mettrez','mettront'],cond:['mettrais','mettrais','mettrait','mettrions','mettriez','mettraient'],subj:['mette','mettes','mette','mettions','mettiez','mettent']},
  'partir':{pres:['pars','pars','part','partons','partez','partent'],imp:['partais','partais','partait','partions','partiez','partaient'],fut:['partirai','partiras','partira','partirons','partirez','partiront'],cond:['partirais','partirais','partirait','partirions','partiriez','partiraient'],subj:['parte','partes','parte','partions','partiez','partent']},
  'sortir':{pres:['sors','sors','sort','sortons','sortez','sortent'],imp:['sortais','sortais','sortait','sortions','sortiez','sortaient'],fut:['sortirai','sortiras','sortira','sortirons','sortirez','sortiront'],cond:['sortirais','sortirais','sortirait','sortirions','sortiriez','sortiraient'],subj:['sorte','sortes','sorte','sortions','sortiez','sortent']},
  'tenir':{pres:['tiens','tiens','tient','tenons','tenez','tiennent'],imp:['tenais','tenais','tenait','tenions','teniez','tenaient'],fut:['tiendrai','tiendras','tiendra','tiendrons','tiendrez','tiendront'],cond:['tiendrais','tiendrais','tiendrait','tiendrions','tiendriez','tiendraient'],subj:['tienne','tiennes','tienne','tenions','teniez','tiennent']},
  'recevoir':{pres:['reçois','reçois','reçoit','recevons','recevez','reçoivent'],imp:['recevais','recevais','recevait','recevions','receviez','recevaient'],fut:['recevrai','recevras','recevra','recevrons','recevrez','recevront'],cond:['recevrais','recevrais','recevrait','recevrions','recevriez','recevraient'],subj:['reçoive','reçoives','reçoive','recevions','receviez','reçoivent']},
  'boire':{pres:['bois','bois','boit','buvons','buvez','boivent'],imp:['buvais','buvais','buvait','buvions','buviez','buvaient'],fut:['boirai','boiras','boira','boirons','boirez','boiront'],cond:['boirais','boirais','boirait','boirions','boiriez','boiraient'],subj:['boive','boives','boive','buvions','buviez','boivent']},
  'croire':{pres:['crois','crois','croit','croyons','croyez','croient'],imp:['croyais','croyais','croyait','croyions','croyiez','croyaient'],fut:['croirai','croiras','croira','croirons','croirez','croiront'],cond:['croirais','croirais','croirait','croirions','croiriez','croiraient'],subj:['croie','croies','croie','croyions','croyiez','croient']},
  'écrire':{pres:['écris','écris','écrit','écrivons','écrivez','écrivent'],imp:['écrivais','écrivais','écrivait','écrivions','écriviez','écrivaient'],fut:['écrirai','écriras','écrira','écrirons','écrirez','écriront'],cond:['écrirais','écrirais','écrirait','écririons','écririez','écriraient'],subj:['écrive','écrives','écrive','écrivions','écriviez','écrivent']},
  'lire':{pres:['lis','lis','lit','lisons','lisez','lisent'],imp:['lisais','lisais','lisait','lisions','lisiez','lisaient'],fut:['lirai','liras','lira','lirons','lirez','liront'],cond:['lirais','lirais','lirait','lirions','liriez','liraient'],subj:['lise','lises','lise','lisions','lisiez','lisent']},
  'connaître':{pres:['connais','connais','connaît','connaissons','connaissez','connaissent'],imp:['connaissais','connaissais','connaissait','connaissions','connaissiez','connaissaient'],fut:['connaîtrai','connaîtras','connaîtra','connaîtrons','connaîtrez','connaîtront'],cond:['connaîtrais','connaîtrais','connaîtrait','connaîtrions','connaîtriez','connaîtraient'],subj:['connaisse','connaisses','connaisse','connaissions','connaissiez','connaissent']},
  'suivre':{pres:['suis','suis','suit','suivons','suivez','suivent'],imp:['suivais','suivais','suivait','suivions','suiviez','suivaient'],fut:['suivrai','suivras','suivra','suivrons','suivrez','suivront'],cond:['suivrais','suivrais','suivrait','suivrions','suivriez','suivraient'],subj:['suive','suives','suive','suivions','suiviez','suivent']},
  'vivre':{pres:['vis','vis','vit','vivons','vivez','vivent'],imp:['vivais','vivais','vivait','vivions','viviez','vivaient'],fut:['vivrai','vivras','vivra','vivrons','vivrez','vivront'],cond:['vivrais','vivrais','vivrait','vivrions','vivriez','vivraient'],subj:['vive','vives','vive','vivions','viviez','vivent']},
  'courir':{pres:['cours','cours','court','courons','courez','courent'],imp:['courais','courais','courait','courions','couriez','couraient'],fut:['courrai','courras','courra','courrons','courrez','courront'],cond:['courrais','courrais','courrait','courrions','courriez','courraient'],subj:['coure','coures','coure','courions','couriez','courent']},
  'ouvrir':{pres:['ouvre','ouvres','ouvre','ouvrons','ouvrez','ouvrent'],imp:['ouvrais','ouvrais','ouvrait','ouvrions','ouvriez','ouvraient'],fut:['ouvrirai','ouvriras','ouvrira','ouvrirons','ouvrirez','ouvriront'],cond:['ouvrirais','ouvrirais','ouvrirait','ouvririons','ouvririez','ouvriraient'],subj:['ouvre','ouvres','ouvre','ouvrions','ouvriez','ouvrent']},
  'mourir':{pres:['meurs','meurs','meurt','mourons','mourez','meurent'],imp:['mourais','mourais','mourait','mourions','mouriez','mouraient'],fut:['mourrai','mourras','mourra','mourrons','mourrez','mourront'],cond:['mourrais','mourrais','mourrait','mourrions','mourriez','mourraient'],subj:['meure','meures','meure','mourions','mouriez','meurent']},
  'valoir':{pres:['vaux','vaux','vaut','valons','valez','valent'],imp:['valais','valais','valait','valions','valiez','valaient'],fut:['vaudrai','vaudras','vaudra','vaudrons','vaudrez','vaudront'],cond:['vaudrais','vaudrais','vaudrait','vaudrions','vaudriez','vaudraient'],subj:['vaille','vailles','vaille','valions','valiez','vaillent']},
  'craindre':{pres:['crains','crains','craint','craignons','craignez','craignent'],imp:['craignais','craignais','craignait','craignions','craigniez','craignaient'],fut:['craindrai','craindras','craindra','craindrons','craindrez','craindront'],cond:['craindrais','craindrais','craindrait','craindrions','craindriez','craindraient'],subj:['craigne','craignes','craigne','craignions','craigniez','craignent']},
  'perdre':{pres:['perds','perds','perd','perdons','perdez','perdent'],imp:['perdais','perdais','perdait','perdions','perdiez','perdaient'],fut:['perdrai','perdras','perdra','perdrons','perdrez','perdront'],cond:['perdrais','perdrais','perdrait','perdrions','perdriez','perdraient'],subj:['perde','perdes','perde','perdions','perdiez','perdent']},
  'vendre':{pres:['vends','vends','vend','vendons','vendez','vendent'],imp:['vendais','vendais','vendait','vendions','vendiez','vendaient'],fut:['vendrai','vendras','vendra','vendrons','vendrez','vendront'],cond:['vendrais','vendrais','vendrait','vendrions','vendriez','vendraient'],subj:['vende','vendes','vende','vendions','vendiez','vendent']},
  'attendre':{pres:['attends','attends','attend','attendons','attendez','attendent'],imp:['attendais','attendais','attendait','attendions','attendiez','attendaient'],fut:['attendrai','attendras','attendra','attendrons','attendrez','attendront'],cond:['attendrais','attendrais','attendrait','attendrions','attendriez','attendraient'],subj:['attende','attendes','attende','attendions','attendiez','attendent']},
  'répondre':{pres:['réponds','réponds','répond','répondons','répondez','répondent'],imp:['répondais','répondais','répondait','répondions','répondiez','répondaient'],fut:['répondrai','répondras','répondra','répondrons','répondrez','répondront'],cond:['répondrais','répondrais','répondrait','répondrions','répondriez','répondraient'],subj:['réponde','répondes','réponde','répondions','répondiez','répondent']},
  'appeler':{pres:['appelle','appelles','appelle','appelons','appelez','appellent'],imp:['appelais','appelais','appelait','appelions','appeliez','appelaient'],fut:['appellerai','appelleras','appellera','appellerons','appellerez','appelleront'],cond:['appellerais','appellerais','appellerait','appellerions','appelleriez','appelleraient'],subj:['appelle','appelles','appelle','appelions','appeliez','appellent']},
  'lever':{pres:['lève','lèves','lève','levons','levez','lèvent'],imp:['levais','levais','levait','levions','leviez','levaient'],fut:['lèverai','lèveras','lèvera','lèverons','lèverez','lèveront'],cond:['lèverais','lèverais','lèverait','lèverions','lèveriez','lèveraient'],subj:['lève','lèves','lève','levions','leviez','lèvent']},
  'produire':{pres:['produis','produis','produit','produisons','produisez','produisent'],imp:['produisais','produisais','produisait','produisions','produisiez','produisaient'],fut:['produirai','produiras','produira','produirons','produirez','produiront'],cond:['produirais','produirais','produirait','produirions','produiriez','produiraient'],subj:['produise','produises','produise','produisions','produisiez','produisent']},
  'résoudre':{pres:['résous','résous','résout','résolvons','résolvez','résolvent'],imp:['résolvais','résolvais','résolvait','résolvions','résolviez','résolvaient'],fut:['résoudrai','résoudras','résoudra','résoudrons','résoudrez','résoudront'],cond:['résoudrais','résoudrais','résoudrait','résoudrions','résoudriez','résoudraient'],subj:['résolve','résolves','résolve','résolvions','résolviez','résolvent']},
  'plaire':{pres:['plais','plais','plaît','plaisons','plaisez','plaisent'],imp:['plaisais','plaisais','plaisait','plaisions','plaisiez','plaisaient'],fut:['plairai','plairas','plaira','plairons','plairez','plairont'],cond:['plairais','plairais','plairait','plairions','plairiez','plairaient'],subj:['plaise','plaises','plaise','plaisions','plaisiez','plaisent']},
};

// ── Niveaux ──
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
];

// ── Homophones ── [phrase_avec_trou, correct, [faux], minLvl]
const HOMO=[
  // CE2 — a/à, on/ont, est/et, son/sont, ou/où
  ['Le chat ___ faim.','a',['à'],'CE2'],
  ['Il va ___ l\'école.','à',['a'],'CE2'],
  ['___ joue dans le jardin.','On',['Ont'],'CE2'],
  ['Les enfants ___ mangé.','ont',['on'],'CE2'],
  ['Le soleil ___ beau aujourd\'hui.','est',['et'],'CE2'],
  ['Il lit ___ écrit.','et',['est'],'CE2'],
  ['C\'___ mon stylo.','est',['et'],'CE2'],
  ['___ chat dort.','Son',['Sont'],'CE2'],
  ['Les livres ___ sur la table.','sont',['son'],'CE2'],
  ['Tu viens ___ tu restes ?','ou',['où'],'CE2'],
  ['___ es-tu ?','Où',['Ou'],'CE2'],
  // CM1
  ['Il ___ parti tôt.','est',['et','a'],'CM1'],
  ['___ beau livre !','Quel',['Quelle','Quels'],'CM1'],
  ['Elle ___ arrivée.','est',['a'],'CM1'],
  ['Nous ___ contents.','sommes',['avons'],'CM1'],
  ['___ courage !','Quel',['Quelle'],'CM1'],
  ['La maison ___ grande.','est',['et'],'CM1'],
  // CM2 — se/ce, ma/m\'a, la/là/l\'a, leur/leurs
  ['___ livre est à moi.','Ce',['Se'],'CM2'],
  ['Il ___ lave les mains.','se',['ce'],'CM2'],
  ['___ sœur est venue.','Ma',["M'a"],'CM2'],
  ['Elle ___ appelé.','m\'a',['ma'],'CM2'],
  ['Pose-le ___.','là',['la','l\'a'],'CM2'],
  ['Je prends ___ valise.','la',['là','l\'a'],'CM2'],
  // 5e — davantage / d'avantage, quoique / quoi que
  ['Il travaille ___ que toi.','davantage',["d'avantage"],'5e'],
  ['___ fatigué, il continua.','Quoique',['Quoi que'],'5e'],
  // 4e+
  ['Il part, ___ que sa mère soit inquiète.','bien que',['bien qu\''],'4e'],
  ['___ ils se regardèrent.','Lors',['L\'or'],'4e'],
];

// ── Adjectifs ── [ms, fs, mp, fp, minLvl]
const ADJ=[
  // CE2 — réguliers
  ['grand','grande','grands','grandes','CE2'],
  ['petit','petite','petits','petites','CE2'],
  ['fort','forte','forts','fortes','CE2'],
  ['long','longue','longs','longues','CE2'],
  ['chaud','chaude','chauds','chaudes','CE2'],
  ['froid','froide','froids','froides','CE2'],
  ['blanc','blanche','blancs','blanches','CE2'],
  ['beau','belle','beaux','belles','CE2'],
  ['nouveau','nouvelle','nouveaux','nouvelles','CE2'],
  ['vieux','vieille','vieux','vieilles','CE2'],
  // CM1
  ['heureux','heureuse','heureux','heureuses','CM1'],
  ['gros','grosse','gros','grosses','CM1'],
  ['doux','douce','doux','douces','CM1'],
  ['faux','fausse','faux','fausses','CM1'],
  ['épais','épaisse','épais','épaisses','CM1'],
  ['bas','basse','bas','basses','CM1'],
  ['léger','légère','légers','légères','CM1'],
  ['dernier','dernière','derniers','dernières','CM1'],
  // CM2
  ['gentil','gentille','gentils','gentilles','CM2'],
  ['pareil','pareille','pareils','pareilles','CM2'],
  ['cruel','cruelle','cruels','cruelles','CM2'],
  ['naturel','naturelle','naturels','naturelles','CM2'],
  ['actif','active','actifs','actives','CM2'],
  ['vif','vive','vifs','vives','CM2'],
  ['neuf','neuve','neufs','neuves','CM2'],
  ['bref','brève','brefs','brèves','CM2'],
  // 6e+
  ['jaloux','jalouse','jaloux','jalouses','6e'],
  ['roux','rousse','roux','rousses','6e'],
  ['amoureux','amoureuse','amoureux','amoureuses','6e'],
  ['cher','chère','chers','chères','6e'],
  ['premier','première','premiers','premières','6e'],
];

// ── Noms (accord) ── [ms, fs, mp, fp, minLvl]
const NOUNS=[
  ['chanteur','chanteuse','chanteurs','chanteuses','CM1'],
  ['acteur','actrice','acteurs','actrices','CM2'],
  ['directeur','directrice','directeurs','directrices','CM2'],
  ['serveur','serveuse','serveurs','serveuses','CM2'],
  ['lion','lionne','lions','lionnes','CM2'],
  ['chat','chatte','chats','chattes','CM2'],
  ['cheval','jument','chevaux','juments','6e'],
  ['roi','reine','rois','reines','6e'],
  ['homme','femme','hommes','femmes','CE1'],
  ['garçon','fille','garçons','filles','CE1'],
  ['professeur','professeure','professeurs','professeures','6e'],
  ['boulanger','boulangère','boulangers','boulangères','CM1'],
];

// ── Groupes nominaux ── [déterminant, nom, adj_ms, genre, nombre, minLvl]
const GN=[
  ['un','chat','noir','m','s','CE2'],
  ['une','fleur','rouge','f','s','CE2'],
  ['le','jardin','vert','m','s','CE2'],
  ['la','maison','blanche','f','s','CE2'],
  ['les','oiseaux','bleu','m','p','CE2'],
  ['les','filles','grand','f','p','CE2'],
  ['un','livre','intéressant','m','s','CM1'],
  ['une','histoire','beau','f','s','CM1'],
  ['des','garçons','gentil','m','p','CM1'],
  ['des','fenêtres','ouvert','f','p','CM1'],
  ['le','vieux','château','m','s','CM1'],
  ['un','animal','léger','m','s','CM2'],
  ['une','leçon','difficile','f','s','CM2'],
  ['des','solutions','rapide','f','p','CM2'],
  ['un','élève','sérieux','m','s','6e'],
  ['une','chanson','doux','f','s','6e'],
  ['des','problèmes','complexe','m','p','6e'],
  ['une','idée','nouveau','f','s','6e'],
  ['un','regard','vif','m','s','6e'],
  ['des','routes','long','f','p','5e'],
];

// ── Nature des mots ── [phrase, mot_cible, correct, [faux], minLvl]
const NATURE=[
  ['Le __chat__ dort.','chat','nom',['verbe','adjectif','adverbe'],'CE1'],
  ['Il __court__ vite.','court','verbe',['nom','adjectif','adverbe'],'CE1'],
  ['La __grande__ maison.','grande','adjectif',['nom','verbe','adverbe'],'CE1'],
  ['Elle chante __bien__.','bien','adverbe',['nom','verbe','adjectif'],'CE1'],
  ['__Le__ chat dort.','Le','déterminant',['nom','verbe','préposition'],'CE2'],
  ['Il parle __à__ Marie.','à','préposition',['déterminant','verbe','adjectif'],'CE2'],
  ['__Elle__ joue.','Elle','pronom',['nom','verbe','adjectif'],'CE2'],
  ['__Mais__ il est tard.','Mais','conjonction',['déterminant','adjectif','adverbe'],'CM1'],
  ['Il court __très__ vite.','très','adverbe',['nom','verbe','adjectif'],'CM1'],
  ['__Hélas__!','Hélas','interjection',['nom','verbe','adverbe'],'CM1'],
  ['La maison __de__ mon ami.','de','préposition',['déterminant','conjonction','adverbe'],'CM1'],
  ['Je vais __chez__ le médecin.','chez','préposition',['déterminant','adverbe','conjonction'],'CM2'],
  ['__Nous__ travaillons.','Nous','pronom',['nom','verbe','adjectif'],'CM2'],
  ['Il est venu __car__ il avait faim.','car','conjonction',['préposition','adverbe','pronom'],'CM2'],
  ['__Bravo__ !','Bravo','interjection',['adjectif','adverbe','nom'],'CM2'],
  ['Elle est __souvent__ absente.','souvent','adverbe',['adjectif','nom','conjonction'],'6e'],
  ['__Quoique__ fatigué, il travailla.','Quoique','conjonction',['préposition','adverbe','pronom'],'5e'],
  ['La __beauté__ du paysage.','beauté','nom',['verbe','adjectif','adverbe'],'CM1'],
  ['__Pourquoi__ pleures-tu ?','Pourquoi','adverbe',['conjonction','préposition','déterminant'],'CM2'],
  ['Il habite __là-bas__.','là-bas','adverbe',['préposition','nom','adjectif'],'CM1'],
  ['__Leur__ maison est belle.','Leur','déterminant',['pronom','adjectif','adverbe'],'CM2'],
  ['Il chante __et__ danse.','et','conjonction',['préposition','adverbe','déterminant'],'CE2'],
];

// ── Orthographe ── [correct, faux1, faux2, faux3, faux4, minLvl]
const ORTHO=[
  ['maison','maisson','maisont','mazon','maizont','CP'],
  ['école','ecole','ekole','éscole','echôle','CP'],
  ['chat','cha','chatt','ca','sha','CP'],
  ['pomme','pome','pomme','pome','pomem','CE1'],
  ['cahier','caier','cahié','kaier','cahiaire','CE1'],
  ['tableau','tableo','tablau','tablo','tablaux','CE1'],
  ['cerise','serise','cherise','cerice','cerlise','CE1'],
  ['grenouille','grenouile','grenouille','grenouylle','grenouile','CE2'],
  ['papillon','papilion','pappillon','papillion','papilyon','CE2'],
  ['château','chateau','châtaud','chatôt','châtaux','CE2'],
  ['médecin','médecain','médesin','médeçin','médcin','CM1'],
  ['printemps','preintemps','printant','printamps','printemps','CM1'],
  ['automne','autone','automone','automme','automne','CM1'],
  ['famille','famile','famiye','failme','famile','CM1'],
  ['cœur','coeur','queur','choeur','kœur','CM2'],
  ['œil','eil','oeuil','oeill','oueil','CM2'],
  ['bœuf','bouf','beuf','bouef','boeuffe','CM2'],
  ['chrysanthème','crysanthème','chrysantème','chrisanthème','chrysanntème','CM2'],
  ['développer','developper','développper','developpez','développé','6e'],
  ['appartement','appartament','appartement','apartemant','appartment','6e'],
  ['exceptionnel','exseptionnel','exceptionel','exzeptionnel','exceptionnel','6e'],
  ['conscient','consient','consciant','conssiants','consiant','5e'],
  ['rythme','ritme','rythme','rhytme','rythme','5e'],
  ['gymnasique','gymnazique','gymnastiqu','gymnàstique','gymnastique','CM2'],
  ['nénuphar','nenuphar','nénupar','nénufar','nénuphar','4e'],
  ['yacht','yatsh','yach','yatcht','iatsh','4e'],
  ['oignon','oingnon','ognion','oignion','oignon','5e'],
  ['abîme','abime','abîmme','abymes','abimme','6e'],
];

// ── Synonymes ── [mot, synonyme_correct, [faux], minLvl]
const SYNO=[
  ['content','heureux',['triste','fâché','peureux'],'CE1'],
  ['ami','camarade',['ennemi','inconnu','rival'],'CE1'],
  ['maison','demeure',['forêt','école','jardin'],'CE2'],
  ['beau','magnifique',['laid','étrange','petit'],'CE2'],
  ['chaud','brûlant',['froid','humide','doux'],'CE2'],
  ['rapide','vite',['lent','lourd','faible'],'CE2'],
  ['courageux','brave',['peureux','lâche','timide'],'CM1'],
  ['fatigué','épuisé',['reposé','vigoureux','actif'],'CM1'],
  ['bizarre','étrange',['normal','beau','rapide'],'CM2'],
  ['triste','mélancolique',['joyeux','gai','riant'],'CM2'],
  ['peur','crainte',['courage','joie','fierté'],'CM2'],
  ['commencer','débuter',['finir','terminer','cesser'],'CM2'],
  ['grand','immense',['petit','minuscule','bas'],'CM1'],
  ['difficile','ardu',['facile','simple','aisé'],'6e'],
  ['gentil','aimable',['méchant','rude','dur'],'CM1'],
  ['parler','discourir',['écouter','taire','entendre'],'6e'],
  ['finir','achever',['commencer','débuter','entamer'],'CM2'],
  ['regarder','observer',['ignorer','éviter','fuir'],'CM1'],
  ['aide','secours',['obstacle','problème','danger'],'CM1'],
  ['vieux','antique',['neuf','récent','jeune'],'5e'],
  ['penser','réfléchir',['agir','parler','bouger'],'CM2'],
  ['fort','robuste',['faible','fragile','mou'],'CM1'],
  ['chercher','quêter',['trouver','donner','laisser'],'5e'],
  ['colère','fureur',['joie','calme','sérénité'],'6e'],
  ['lumineux','éclatant',['sombre','obscur','terne'],'6e'],
  ['mystérieux','énigmatique',['clair','évident','simple'],'5e'],
];

// ── Antonymes ── [mot, antonyme_correct, [faux], minLvl]
const ANTO=[
  ['grand','petit',['moyen','joli','fort'],'CE1'],
  ['vrai','faux',['certain','possible','normal'],'CE1'],
  ['jour','nuit',['matin','soir','midi'],'CE1'],
  ['chaud','froid',['tiède','doux','frais'],'CE1'],
  ['rapide','lent',['fort','lourd','mou'],'CE2'],
  ['fort','faible',['petit','bas','mou'],'CE2'],
  ['beau','laid',['bizarre','vieux','banal'],'CE2'],
  ['content','triste',['calme','fatigué','nerveux'],'CE2'],
  ['ami','ennemi',['voisin','camarade','rival'],'CE2'],
  ['allumer','éteindre',['fermer','ouvrir','bouger'],'CM1'],
  ['monter','descendre',['rester','tomber','glisser'],'CM1'],
  ['commencer','finir',['continuer','poursuivre','reprendre'],'CM1'],
  ['rire','pleurer',['crier','murmurer','chanter'],'CM1'],
  ['ouvrir','fermer',['tourner','pousser','casser'],'CM1'],
  ['intérieur','extérieur',['partiel','global','central'],'CM2'],
  ['positif','négatif',['neutre','partiel','limité'],'6e'],
  ['clair','sombre',['vague','flou','terne'],'6e'],
  ['courageux','lâche',['timide','sage','doux'],'6e'],
  ['doux','rude',['sec','chaud','lourd'],'6e'],
  ['ancien','moderne',['rare','commun','unique'],'5e'],
  ['construire','démolir',['réparer','agrandir','changer'],'5e'],
  ['réussir','échouer',['essayer','tenter','oser'],'CM2'],
  ['souvenir','oublier',['perdre','trouver','chercher'],'CM2'],
  ['paix','guerre',['bruit','calme','silence'],'5e'],
  ['optimiste','pessimiste',['réaliste','sage','prudent'],'5e'],
];

// ── Dictée ── [phrase, minLvl]
// Les phrases sont lues par la synthèse vocale — éviter les mots trop rares
const DICTEE_DATA=[
  // CP — phrases très simples
  ['Le chat dort.','CP'],
  ['La balle est rouge.','CP'],
  ['Mon ami joue.','CP'],
  ['Le soleil brille.','CP'],
  // CE1 — phrases courtes
  ['Le chien court dans le jardin.','CE1'],
  ['Ma mère prépare le repas.','CE1'],
  ['Les enfants jouent au ballon.','CE1'],
  ['Il fait beau aujourd\'hui.','CE1'],
  ['Le lapin mange des carottes.','CE1'],
  ['Elle lit un livre intéressant.','CE1'],
  // CE2 — phrases avec article et adjectif
  ['Le petit chat blanc dort sur le canapé.','CE2'],
  ['Les grandes fleurs rouges poussent dans le jardin.','CE2'],
  ['Mon frère aime beaucoup le chocolat.','CE2'],
  ['Les enfants sont partis à l\'école.','CE2'],
  ['Notre maison est à côté de la forêt.','CE2'],
  // CM1 — phrases avec complément
  ['Le vieux château se dresse au sommet de la colline.','CM1'],
  ['La maîtresse corrige les cahiers de ses élèves.','CM1'],
  ['Pendant les vacances, nous allons à la montagne.','CM1'],
  ['Les élèves ont travaillé toute la journée avec sérieux.','CM1'],
  // CM2 — phrases complexes
  ['Les beaux oiseaux blancs s\'envolaient au-dessus du lac.','CM2'],
  ['La cuisinière préparait un délicieux gâteau au chocolat.','CM2'],
  ['Malgré le froid, les enfants jouaient dehors avec enthousiasme.','CM2'],
  // 6e — imparfait, subjonctif simple, ponctuation
  ['Il était une fois une vieille sorcière qui vivait seule.','6e'],
  ['Les explorateurs parcouraient les forêts à la recherche de trésors.','6e'],
  ['Bien qu\'il fît froid, les enfants jouaient dehors avec enthousiasme.','6e'],
  ['La rivière coulait doucement entre les rochers recouverts de mousse.','6e'],
  // 5e — construction complexe
  ["Lorsqu'elle arriva, tout le monde s'était déjà réuni autour de la table.",'5e'],
  ["Les scientifiques ont découvert une nouvelle espèce d'insecte en Amazonie.",'5e'],
  ["C'est en forgeant qu'on devient forgeron, dit le vieux proverbe.",'5e'],
  // 4e+
  ["Malgré ses efforts considérables, il n'avait pas réussi à convaincre ses adversaires.",'4e'],
  ["La beauté de ce paysage m'a profondément ému lors de mon premier voyage.",'4e'],
];

// ── Phrases à corriger ── [phrase_erreur, mot_faux, correction, explication, minLvl]
const PHRASE_CORR=[
  // Accord sujet-verbe
  ['Les enfants joue dans le jardin.','joue','jouent','Le sujet "les enfants" est pluriel.','CE2'],
  ['Le chat et le chien mange ensemble.','mange','mangent','Deux sujets → verbe au pluriel.','CM1'],
  ['Vous doit travailler plus sérieusement.','doit','devez','Avec "vous", on utilise -ez.','CM1'],
  // Homophones
  ['Il a mit son manteau avant de sortir.','mit','mis','Le participe passé de "mettre" est "mis".','CM2'],
  ["Elle c'est trompée de chemin.",'c\'est','s\'est','Passé composé pronominal : s\'est.','CM2'],
  ['On a beaucoup de choses a faire.','a','à','Préposition "à" sans accent = "a" (verbe avoir).','CE2'],
  ['Le chat et la chienne sont belle.','belle','beaux','Accord avec deux sujets dont un masculin.','CM2'],
  ['Nous sommes aller au cinéma hier.','aller','allés','Avec "être", le participe s\'accorde.','5e'],
  // Accord adjectif
  ['Elle a acheté des roses rouge.','rouge','rouges','Accord de l\'adjectif au pluriel.','CE2'],
  ['Les garçons semblaient très content.','content','contents','Accord de l\'adjectif attribut avec le sujet pluriel.','CM1'],
  // Orthographe
  ['Il travaille beaucoup mais il est toujours fatigé.','fatigé','fatigué','Le mot "fatigué" prend un accent sur le u.','CE2'],
  ['La maitresse a expliqué la leçon.','maitresse','maîtresse','"Maîtresse" prend un accent circonflexe sur le î.','CM2'],
  ['Il pleut dehors, prenez vos paraluies.','paraluies','parapluies','"Parapluie" s\'écrit avec un p au milieu.','CM1'],
  // Conjugaison
  ['Demain, nous partons en vacances hier.','hier','demain','"Demain" est futur, "hier" est passé : contradiction.','CE2'],
  ['Si tu venais, je serais contente.','serais','serais','Correct ! (La concordance est bien respectée)','5e'],
  ['Elle avait fini quand il arriva.','avait fini','avait fini','Correct ! Le plus-que-parfait est bien utilisé.','5e'],
  // Participe passé
  ['Les lettres que j\'ai écrit.','écrit','écrites','"Lettres" est COD féminin pluriel placé avant.','5e'],
  ['La chanson qu\'il a composé est belle.','composé','composée','Le COD "chanson" féminin précède : accord requis.','5e'],
  ['Les élèves sont arrivé en retard.','arrivé','arrivés','Avec "être", le participe s\'accorde avec le sujet pluriel.','CM2'],
];

// ── Genre des noms ── [mot, genre_correct, [faux], minLvl]
const GENRE_DATA=[
  // CP/CE1 — noms courants
  ['soleil','masculin',['féminin'],'CP'],
  ['lune','féminin',['masculin'],'CP'],
  ['chien','masculin',['féminin'],'CP'],
  ['chatte','féminin',['masculin'],'CP'],
  ['livre','masculin',['féminin'],'CE1'],
  ['table','féminin',['masculin'],'CE1'],
  ['fleur','féminin',['masculin'],'CE1'],
  ['arbre','masculin',['féminin'],'CE1'],
  // CE2/CM1 — noms moins évidents
  ['tomate','féminin',['masculin'],'CE2'],
  ['nuage','masculin',['féminin'],'CE2'],
  ['plage','féminin',['masculin'],'CE2'],
  ['silence','masculin',['féminin'],'CE2'],
  ['image','féminin',['masculin'],'CM1'],
  ['problème','masculin',['féminin'],'CM1'],
  ['musique','féminin',['masculin'],'CM1'],
  ['sourire','masculin',['féminin'],'CM1'],
  ['courage','masculin',['féminin'],'CM1'],
  ['amour','masculin',['féminin'],'CM1'],
  // CM2/6e — pièges
  ['oasis','féminin',['masculin'],'CM2'],
  ['tentacule','masculin',['féminin'],'CM2'],
  ['pétale','masculin',['féminin'],'CM2'],
  ['ivoire','masculin',['féminin'],'6e'],
  ['amalgame','masculin',['féminin'],'6e'],
  ['écarlate','féminin',['masculin'],'5e'],
  ['effluve','masculin',['féminin'],'5e'],
  ['astérisque','masculin',['féminin'],'5e'],
  ['alvéole','féminin',['masculin'],'4e'],
  ['azalée','féminin',['masculin'],'4e'],
  ['hydre','féminin',['masculin'],'3e'],
  ['obélisque','masculin',['féminin'],'3e'],
];

// ── Constantes de jeu ──
const TENSE_LBL={pres:'présent',imp:'imparfait',fut:'futur simple',pc:'passé composé',pqp:'plus-que-parfait',cond:'conditionnel présent',subj:'subjonctif présent'};
const SUBJECTS=['je','tu','il/elle','nous','vous','ils/elles'];
const SUBJ_S=['je','tu','il','nous','vous','ils'];
const AVATS=['🧒','👦','👧','🧑','👨','👩','🧔','👴','👵','🎓','🦊','🐼','🐸','🦁','🐧','🤖','👾','🧸','🌟','🏆'];

// ── Badges ── [id, ic, nm, condition_fn(profil)]
const BADGES=[
  {id:'first',ic:'🎯',nm:'Premier pas',cond:p=>p.totalQ>=1},
  {id:'x10',ic:'🔟',nm:'10 questions',cond:p=>p.totalQ>=10},
  {id:'x100',ic:'💯',nm:'Centurion',cond:p=>p.totalQ>=100},
  {id:'x500',ic:'🏅',nm:'Marathonien',cond:p=>p.totalQ>=500},
  {id:'perfect',ic:'⭐',nm:'Sans faute',cond:p=>p.perfectRounds>=1},
  {id:'p5',ic:'🌟',nm:'5 sessions parfaites',cond:p=>p.perfectRounds>=5},
  {id:'combo5',ic:'🔥',nm:'Combo x5',cond:p=>p.maxCombo>=5},
  {id:'combo10',ic:'💥',nm:'Combo x10',cond:p=>p.maxCombo>=10},
  {id:'xp500',ic:'⚡',nm:'500 XP',cond:p=>p.xp>=500},
  {id:'xp2000',ic:'💎',nm:'2000 XP',cond:p=>p.xp>=2000},
  {id:'conj30',ic:'📝',nm:'30 conjugaisons',cond:p=>(p.conjOk||0)>=30},
  {id:'homo20',ic:'🔊',nm:'20 homophones',cond:p=>(p.homoOk||0)>=20},
  {id:'ortho20',ic:'✏️',nm:'20 orthos',cond:p=>(p.orthoOk||0)>=20},
  {id:'syno20',ic:'🔗',nm:'20 synonymes',cond:p=>(p.synoOk||0)>=20},
  {id:'revision',ic:'🔁',nm:'Réviseur',cond:p=>(p.revisionDone||0)>=1},
  {id:'all_types',ic:'🎓',nm:'Touche-à-tout',cond:p=>Object.keys(p.typeStats||{}).length>=8},
];
