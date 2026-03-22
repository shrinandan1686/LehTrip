// ─────────────────────────────────────────────
// DATA MODEL
// ─────────────────────────────────────────────

const DAYS = [
  // Phase 1: Solo BLR→CHD
  { id:'d1',  label:'Day 1',  title:'Bangalore → Nagpur',          date:'Fri May 15',  phase:'solo',  budget:{ fuel:6550, food:600, stay:2000, act:0, misc:0 } },
  { id:'d2',  label:'Day 2',  title:'Nagpur → Jaipur',             date:'Sat May 16',  phase:'solo',  budget:{ fuel:7654, food:600, stay:2000, act:0, misc:0 } },
  { id:'d3',  label:'Day 3',  title:'Jaipur → Chandigarh',         date:'Sun May 17',  phase:'solo',  budget:{ fuel:3000, food:600, stay:0,    act:0, misc:0 } },
  // Phase 2: WFH CHD
  { id:'d4',  label:'WFH 1-5',title:'Chandigarh WFH & Prep',       date:'May 18-22',   phase:'wfh',   budget:{ fuel:0,    food:3000,stay:12500, act:0, misc:31900 } },
  // Phase 3: Group
  { id:'g1',  label:'G1',     title:'Chandigarh → Srinagar',       date:'Sat May 23',  phase:'group', budget:{ fuel:5104, food:1200,stay:3500, act:350, misc:0 } },
  { id:'g2',  label:'G2',     title:'Srinagar → Kargil',           date:'Sun May 24',  phase:'group', budget:{ fuel:1580, food:800, stay:2500, act:0, misc:0 } },
  { id:'g3',  label:'G3',     title:'Kargil → Leh',                date:'Mon May 25',  phase:'group', budget:{ fuel:1817, food:800, stay:4000, act:0, misc:0 } },
  { id:'g4',  label:'G4',     title:'Leh Acclimatization',         date:'Tue May 26',  phase:'group', budget:{ fuel:0,    food:1200,stay:4000, act:0, misc:0 } },
  { id:'g5',  label:'G5',     title:'Leh → Pangong → Leh',         date:'Wed May 27',  phase:'group', budget:{ fuel:2370, food:800, stay:4000, act:0, misc:0 } },
  { id:'g6',  label:'G6',     title:'Leh → Diskit → Turtuk',       date:'Thu May 28',  phase:'group', budget:{ fuel:1600, food:1000,stay:2500, act:800, misc:0 } },
  { id:'g7',  label:'G7',     title:'Thang → Panamik → Leh',       date:'Fri May 29',  phase:'group', budget:{ fuel:1800, food:800, stay:4000, act:0, misc:0 } },
  { id:'g8',  label:'G8',     title:'Leh → Tsomoriri + Puga',      date:'Sat May 30',  phase:'group', budget:{ fuel:2000, food:800, stay:3500, act:0, misc:0 } },
  { id:'g9',  label:'G9',     title:'Tsomoriri → Hanle',           date:'Sun May 31',  phase:'group', budget:{ fuel:670,  food:800, stay:3500, act:0, misc:0 } },
  { id:'g10', label:'G10',    title:'Hanle → Umling La → Hanle',   date:'Mon Jun 1',   phase:'group', budget:{ fuel:1180, food:800, stay:3500, act:0, misc:0 } },
  { id:'g11', label:'G11',    title:'Hanle → Manali (Drop-off)',   date:'Tue Jun 2',   phase:'group', budget:{ fuel:3400, food:1000,stay:4000, act:0, misc:0 } },
  // Phase 4: Solo return
  { id:'s1',  label:'P4-1',   title:'Manali Rest Day',             date:'Wed Jun 3',   phase:'wfh',   budget:{ fuel:0,    food:800, stay:2500, act:0, misc:0 } },
  { id:'s2',  label:'P4-2',   title:'Manali WFH Base',             date:'Jun 4-11',    phase:'wfh',   budget:{ fuel:1000, food:8000,stay:22500,act:200, misc:0 } },
  { id:'s3',  label:'P4-3',   title:'Manali → Chandigarh',         date:'Fri Jun 12',  phase:'solo',  budget:{ fuel:2449, food:600, stay:2000, act:0, misc:0 } },
  { id:'s4',  label:'P4-4',   title:'Chandigarh → Nagpur',         date:'Sat Jun 13',  phase:'solo',  budget:{ fuel:8216, food:600, stay:2000, act:0, misc:0 } },
  { id:'s5',  label:'P4-5',   title:'Nagpur → Bangalore',          date:'Sun Jun 14',  phase:'solo',  budget:{ fuel:6952, food:600, stay:0,    act:0, misc:0 } },
];

const CATS = {
  fuel:  { label:'Fuel',          color:'var(--fuel-c)' },
  food:  { label:'Food & Drinks', color:'var(--food-c)' },
  stay:  { label:'Stay',          color:'var(--stay-c)' },
  act:   { label:'Activities',    color:'var(--act-c)'  },
  toll:  { label:'Toll / Tax',    color:'#60a5fa'       },
  misc:  { label:'Misc / Prep',   color:'var(--misc-c)' },
};

const WHO_OPTS = {
  ss:   { label:'S&S',     badge:'b-ss' },
  fr:   { label:'Friends', badge:'b-fr' },
  '50': { label:'50-50',   badge:'b-50' },
};

const SS_BUDGET  = 182932;
const FR_BUDGET  = 57595;

// ─────────────────────────────────────────────
// CORE CALCULATION LOGIC
// ─────────────────────────────────────────────

function calcDayTotals(dayId, stateEntries) {
  const entries = stateEntries[dayId] || [];
  let ssTotal = 0, frTotal = 0, total = 0;
  entries.forEach(e => {
    const amt = parseFloat(e.amount) || 0;
    total += amt;
    if (e.who === 'ss') ssTotal += amt;
    else if (e.who === 'fr') frTotal += amt;
    else if (e.who === '50') { ssTotal += amt/2; frTotal += amt/2; }
  });
  return { ssTotal: Math.round(ssTotal), frTotal: Math.round(frTotal), total: Math.round(total) };
}

function calcGlobalTotals(stateEntries) {
  let ssTotal = 0, frTotal = 0, grandTotal = 0, sharedTotal = 0;
  const byCat = {};
  const byWho = { ss:0, fr:0, '50':0 };
  const allEntries = [];
  Object.keys(CATS).forEach(k => byCat[k] = 0);

  DAYS.forEach(day => {
    (stateEntries[day.id] || []).forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      if (!amt) return;
      grandTotal += amt;
      byCat[e.cat] = (byCat[e.cat] || 0) + amt;
      if (e.who === 'ss') { ssTotal += amt; byWho.ss += amt; }
      else if (e.who === 'fr') { frTotal += amt; byWho.fr += amt; }
      else if (e.who === '50') { ssTotal += amt/2; frTotal += amt/2; sharedTotal += amt; byWho['50'] += amt; }
      allEntries.push({...e, dayTitle: day.title, dayId: day.id, amtNum: amt});
    });
  });

  return {
    ssTotal: Math.round(ssTotal),
    frTotal: Math.round(frTotal),
    grandTotal: Math.round(grandTotal),
    sharedTotal: Math.round(sharedTotal),
    byCat,
    byWho,
    allEntries: allEntries.sort((a,b) => b.amtNum - a.amtNum),
    count: allEntries.length
  };
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

function fmtNum(n) {
  if (!n && n !== 0) return '0';
  return Math.round(n).toLocaleString('en-IN');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Export for commonJS/Module testing environments if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DAYS, CATS, WHO_OPTS, SS_BUDGET, FR_BUDGET, calcDayTotals, calcGlobalTotals, fmtNum };
}
