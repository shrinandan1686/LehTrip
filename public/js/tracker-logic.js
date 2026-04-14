// ─────────────────────────────────────────────
// DATA MODEL
// ─────────────────────────────────────────────

const DAYS = [
  // Day 0: Pre-trip costs (checklist + packing)
  { id:'p0',  label:'Day 0',  title:'Preparation & Shopping',      date:'Before May 15', phase:'prep',  budget:{ fuel:0,    food:0,    stay:0,    act:0, misc:31900 } },
  // Phase 1: Solo BLR→Shimla
  { id:'d1',  label:'Day 1',  title:'Bangalore → Nagpur',          date:'Fri May 15',  phase:'solo',  budget:{ fuel:6550, food:600, stay:2000, act:0, misc:0 } },
  { id:'d2',  label:'Day 2',  title:'Nagpur → Jaipur',             date:'Sat May 16',  phase:'solo',  budget:{ fuel:7654, food:600, stay:2000, act:0, misc:0 } },
  { id:'d3',  label:'Day 3',  title:'Jaipur → Shimla',             date:'Sun May 17',  phase:'solo',  budget:{ fuel:3000, food:600, stay:0,    act:0, misc:0 } },
  // Phase 2: WFH Shimla + Chandigarh transition
  { id:'d4',  label:'WFH',    title:'Shimla WFH (May 17-22) + Chandigarh (May 22-23)', date:'May 17-23', phase:'wfh', budget:{ fuel:0, food:3000,stay:12500, act:0, misc:31900 } },
  // Phase 3: Group (updated route + dates)
  { id:'g1',  label:'G1',     title:'Srinagar Acclimatization + Exploration', date:'Sun May 24', phase:'group', budget:{ fuel:5104, food:1200,stay:3500, act:350, misc:0 } },
  { id:'g2',  label:'G2',     title:'Srinagar → Kargil',             date:'Mon May 25',  phase:'group', budget:{ fuel:1580, food:800, stay:2500, act:0, misc:0 } },
  { id:'g3',  label:'G3',     title:'Kargil → Leh',                  date:'Tue May 26',  phase:'group', budget:{ fuel:1817, food:800, stay:4000, act:0, misc:0 } },
  { id:'g4',  label:'G4',     title:'Leh Acclimatization',           date:'Wed May 27',  phase:'group', budget:{ fuel:0,    food:1200,stay:4000, act:0, misc:0 } },
  { id:'g5',  label:'G5',     title:'Leh → Diskit / Hunder',         date:'Thu May 28',  phase:'group', budget:{ fuel:2370, food:800, stay:4000, act:0, misc:0 } },
  { id:'g6',  label:'G6',     title:'Hunder → Pangong Tso',          date:'Fri May 29',  phase:'group', budget:{ fuel:1600, food:1000,stay:2500, act:800, misc:0 } },
  { id:'g7',  label:'G7',     title:'Pangong Tso → Hanle',           date:'Sat May 30',  phase:'group', budget:{ fuel:1800, food:800, stay:4000, act:0, misc:0 } },
  { id:'g8',  label:'G8',     title:'Hanle → Umling La → Hanle',     date:'Sun May 31',  phase:'group', budget:{ fuel:2000, food:800, stay:3500, act:0, misc:0 } },
  { id:'g9',  label:'G9',     title:'Hanle → Tso Moriri',            date:'Mon Jun 1',   phase:'group', budget:{ fuel:670,  food:800, stay:3500, act:0, misc:0 } },
  { id:'g10', label:'G10',    title:'Tso Moriri → Sarchu',           date:'Tue Jun 2',   phase:'group', budget:{ fuel:1180, food:800, stay:3500, act:0, misc:0 } },
  { id:'g11', label:'G11',    title:'Sarchu → Manali',               date:'Wed Jun 3',   phase:'group', budget:{ fuel:3400, food:1000,stay:4000, act:0, misc:0 } },
  // Phase 4: Solo return (shifted by 1 day after updated Phase 3)
  { id:'s1',  label:'P4-1',   title:'Manali Rest Day',               date:'Thu Jun 4',   phase:'wfh',   budget:{ fuel:0,    food:800, stay:2500, act:0, misc:0 } },
  { id:'s2',  label:'P4-2',   title:'Manali WFH Base',               date:'Jun 5-12',    phase:'wfh',   budget:{ fuel:1000, food:8000,stay:22500,act:200, misc:0 } },
  { id:'s3',  label:'P4-3',   title:'Manali → Chandigarh',           date:'Sat Jun 13',  phase:'solo',  budget:{ fuel:2449, food:600, stay:2000, act:0, misc:0 } },
  { id:'s4',  label:'P4-4',   title:'Chandigarh → Nagpur',           date:'Sun Jun 14',  phase:'solo',  budget:{ fuel:8216, food:600, stay:2000, act:0, misc:0 } },
  { id:'s5',  label:'P4-5',   title:'Nagpur → Bangalore',            date:'Mon Jun 15',  phase:'solo',  budget:{ fuel:6952, food:600, stay:0,    act:0, misc:0 } },
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
  ss: { label:'S&S', badge:'b-ss' },
};

const SS_BUDGET = 195577; // S&S total: Fuel+Stay+Food+Tolls+Sightseeing+CarPrep (excl. ₹15k emergency buffer)

const PREP_EXPENSE_TEMPLATES = [
  // Checklist: Documents
  { desc:'[Documents] Vehicle RC Book', cat:'misc', who:'ss' },
  { desc:'[Documents] Vehicle Insurance', cat:'misc', who:'ss' },
  { desc:'[Documents] Shrinandan Driving License', cat:'misc', who:'ss' },
  { desc:'[Documents] Both Aadhar Cards (x6 copies each)', cat:'misc', who:'ss' },
  { desc:'[Documents] Ladakh Environment Fee paid (lahdclehpermit.in)', cat:'misc', who:'ss' },
  { desc:'[Documents] EDF receipt printed x2 (one per person)', cat:'misc', who:'ss' },
  { desc:'[Documents] Travel Insurance for S&S (both)', cat:'misc', who:'ss' },
  { desc:'[Documents] All hotel bookings confirmed and printed', cat:'misc', who:'ss' },
  { desc:'[Documents] Emergency contacts list (both phones)', cat:'misc', who:'ss' },

  // Checklist: Medical kit
  { desc:'[Medical] Diamox (acetazolamide) doctor prescription', cat:'misc', who:'ss' },
  { desc:'[Medical] ORS sachets (x20 min)', cat:'misc', who:'ss' },
  { desc:'[Medical] Ibuprofen / Paracetamol', cat:'misc', who:'ss' },
  { desc:'[Medical] Antacids (Digene / Gelusil)', cat:'misc', who:'ss' },
  { desc:'[Medical] Antiemetic (Domperidone)', cat:'misc', who:'ss' },
  { desc:'[Medical] Antiseptic cream + bandages', cat:'misc', who:'ss' },
  { desc:'[Medical] Sunscreen SPF 50+ (UV extreme at altitude)', cat:'misc', who:'ss' },
  { desc:'[Medical] Lip balm with SPF', cat:'misc', who:'ss' },
  { desc:'[Medical] Eye drops (dry eyes at altitude)', cat:'misc', who:'ss' },
  { desc:'[Medical] Pulse oximeter (AMS early detection)', cat:'misc', who:'ss' },

  // Checklist: Car prep
  { desc:'[Car Prep] Full service at Mahindra service center (Chandigarh)', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Engine oil changed', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Brake pads checked', cat:'misc', who:'ss' },
  { desc:'[Car Prep] All tyre pressure checked (incl. spare)', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Coolant level full', cat:'misc', who:'ss' },
  { desc:'[Car Prep] 10L diesel jerry can packed', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Tow rope', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Jumper cables', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Puncture repair kit', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Windshield washer fluid (mountain dust)', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Phone mount for dashboard', cat:'misc', who:'ss' },
  { desc:'[Car Prep] Power bank (x2 for S&S)', cat:'misc', who:'ss' },

  // Checklist: Food supply
  { desc:'[Food Supply] MTR/Haldiram instant food pouches (x20)', cat:'food', who:'ss' },
  { desc:'[Food Supply] Maggi noodles (x20 packets)', cat:'food', who:'ss' },
  { desc:'[Food Supply] Mixed dry fruits and nuts (2 kg)', cat:'food', who:'ss' },
  { desc:'[Food Supply] Energy/protein bars (x30)', cat:'food', who:'ss' },
  { desc:'[Food Supply] Glucose biscuits / Marie biscuits', cat:'food', who:'ss' },
  { desc:'[Food Supply] Electrolyte powder / Glucon-D', cat:'food', who:'ss' },
  { desc:'[Food Supply] Steel thermos flask x2', cat:'food', who:'ss' },
  { desc:'[Food Supply] 2L water bottles per person (minimum)', cat:'food', who:'ss' },
  { desc:'[Food Supply] Pickle sachets / chutney packets', cat:'food', who:'ss' },

  // Checklist: Tech and connectivity
  { desc:'[Tech] Download Google Maps offline: Entire route', cat:'misc', who:'ss' },
  { desc:'[Tech] Download Maps.me offline (better for remote areas)', cat:'misc', who:'ss' },
  { desc:'[Tech] Jio SIM (best coverage in J&K and Ladakh)', cat:'misc', who:'ss' },
  { desc:'[Tech] BSNL SIM (fallback for remote areas)', cat:'misc', who:'ss' },
  { desc:'[Tech] Car charger (dual USB + Type C)', cat:'misc', who:'ss' },
  { desc:'[Tech] Power banks x2 (20,000 mAh each)', cat:'misc', who:'ss' },
  { desc:'[Tech] WFH laptop + portable WiFi hotspot', cat:'misc', who:'ss' },
  { desc:'[Tech] Walkie talkie (optional, useful at passes)', cat:'misc', who:'ss' },

  // Packing: Clothing
  { desc:'[Packing: Clothing] Thermal base layer (top + bottom x2)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Fleece mid-layer jacket', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Windproof/waterproof outer jacket', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] T-shirts (x4 light)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Trek pants / cargo pants (x2)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Warm socks (x5 pairs, wool preferred)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Gloves (windproof)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Woolen cap / beanie', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Neck gaiter / balaclava', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] UV-protective sunglasses (must)', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Comfortable shoes / trail runners', cat:'misc', who:'ss' },
  { desc:'[Packing: Clothing] Flip flops / sandals (for hotels)', cat:'misc', who:'ss' },

  // Packing: Accessories and gear
  { desc:'[Packing: Gear] Headlamp + spare batteries', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Day pack / small backpack', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Waterproof stuff sacks', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Travel towel (quick dry)', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Toilet paper + wet wipes (xlots)', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Hand sanitizer x4', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Swiss army knife / multi-tool', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Duct tape (fixes everything)', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Ziplock bags (various sizes)', cat:'misc', who:'ss' },
  { desc:'[Packing: Gear] Torch / flashlight', cat:'misc', who:'ss' },

  // Packing: Photography
  { desc:'[Packing: Photography] Camera + extra batteries', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] Extra memory cards (x4 min)', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] Tripod / flexible gorilla pod', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] UV filter (extreme UV at altitude)', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] Lens cleaning kit', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] Phone full storage cleared', cat:'misc', who:'ss' },
  { desc:'[Packing: Photography] Drone (if experienced pilot)', cat:'misc', who:'ss' },

  // Packing: Toiletries
  { desc:'[Packing: Toiletries] Toothbrush + toothpaste', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Soap / body wash (travel size)', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Shampoo (travel size)', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Moisturizer (skin gets very dry at altitude)', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Sunscreen SPF 50+ (large tube)', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Lip balm with SPF (pack x3)', cat:'misc', who:'ss' },
  { desc:'[Packing: Toiletries] Feminine hygiene supplies as needed', cat:'misc', who:'ss' },
];

// ─────────────────────────────────────────────
// CORE CALCULATION LOGIC
// ─────────────────────────────────────────────

function calcDayTotals(dayId, stateEntries) {
  const entries = stateEntries[dayId] || [];
  let total = 0;
  entries.forEach(e => {
    const amt = parseFloat(e.amount) || 0;
    total += amt;
  });
  return { ssTotal: Math.round(total), total: Math.round(total) };
}

function calcGlobalTotals(stateEntries) {
  let grandTotal = 0;
  const byCat = {};
  const allEntries = [];
  Object.keys(CATS).forEach(k => byCat[k] = 0);

  DAYS.forEach(day => {
    (stateEntries[day.id] || []).forEach(e => {
      const amt = parseFloat(e.amount) || 0;
      if (!amt) return;
      grandTotal += amt;
      byCat[e.cat] = (byCat[e.cat] || 0) + amt;
      allEntries.push({...e, dayTitle: day.title, dayId: day.id, amtNum: amt});
    });
  });

  return {
    ssTotal: Math.round(grandTotal),
    grandTotal: Math.round(grandTotal),
    byCat,
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
  module.exports = { DAYS, CATS, WHO_OPTS, SS_BUDGET, PREP_EXPENSE_TEMPLATES, calcDayTotals, calcGlobalTotals, fmtNum };
}
