/**
 * DELPHYLAX data layer.
 *
 * Source of truth: "Floodscout Delphylax: Project Overview" (Eddie, 13 Nov 2026),
 * mirrored in delphylax-overview.md, plus the KSEF 2027 deck for the problem
 * statistics (ksef-research.md) and published Inia geoffrensis bioacoustics for
 * the biomimicry inspiration. Values the overview marks as estimates are flagged
 * `estimate: true` so the UI never presents them as measured.
 */

export const IDENTITY = {
  name: 'DELPHYLAX',
  model: 'DLX-0',
  unit: 'RESCUE UNIT 01',
  greek: 'δελφίς + φύλαξ · dolphin + guardian',
  latin: 'Dolphin Guardian',
  former: 'Floodscout',
  tagline: 'Guardian of Zero-Visibility Waters',
  oneLiner:
    'A 94 cm catamaran rescue scout for street floods. Sonar finds objects under the water and a heat sensor spots people at the surface, then it drops a glowing marker so rescuers know exactly where to look — without sending a person in.',
  competitions: ['Conrad Challenge', 'KSEF 2027'],
  inspiration:
    'Inspired by the Amazon river dolphin, which finds its way through muddy river water without being able to see.',
} as const

export const CRISIS = {
  event: 'Seoul, August 2022',
  recordYears: 115,
  recordLabel: 'Heaviest rainfall since Seoul began keeping weather records',
  livesLost: 3,
  livesLabel: 'Lost when water trapped a family inside their semi-basement home',
  summary: 'The water rose faster than the family could escape, and no one outside could see what was happening inside.',
  summaryNote: 'Paraphrased from news reports',
  monsoonWindow: 'Late June – early August',
  sources: [
    'AFP / The Journal (2023)',
    'Al Jazeera (2023), citing the Korean government',
    'Korea JoongAng Daily (2024)',
    'Korea Herald (2023)',
  ],
  whyDeadly: [
    { title: 'Water rises in minutes', body: 'Streets and underpasses fill faster than people can get out.' },
    { title: 'Total darkness', body: 'Power is usually cut, so there is no light.' },
    { title: 'Hidden dangers', body: 'Muddy water hides debris, open manholes, and live electricity.' },
    { title: 'Rescuers go in blind', body: 'No one can tell what, or who, is under the water.' },
  ],
  question: 'How can rescuers see what is under muddy flood water, quickly, without sending a person in?',
} as const

/** Inia geoffrensis echolocation — the biomimetic inspiration (not a Delphylax measurement). */
export const BIOACOUSTICS = {
  species: 'Inia geoffrensis',
  common: 'Amazon river dolphin (boto)',
  clickDurationUs: 14,
  clicksPerSecond: 30,
  centroidFrequencyKHz: 95,
  reference: 'Ladegaard et al. (2015), J. Exp. Biol. 218: 3091–3101',
  principle:
    'River dolphins trade range for resolution: short, quiet, high-frequency clicks fired at a high rate let them navigate root-choked, sediment-filled water with no visibility at all. Delphylax borrows the idea — listen, don’t look — with a fish-finder sonar under the water and an AMG8833 heat sensor for people at the surface.',
} as const

export const SONAR = {
  lockThreshold: 0.85,
  sparsityK: 8,
  sonarUnit: 'LUCKY FF718LiC-W wireless fish finder',
  thermalUnit: 'AMG8833 8×8 thermal camera',
  /** what each sensor can and cannot do — used wherever sensing is described */
  roles: 'Sonar finds objects under the water; the AMG8833 heat sensor spots people at the surface.',
  integration: 'Sonar readings are shown on the fish finder’s screen for now; linking them to the ESP32 is planned.',
} as const

/** How the boat is steered. One sentence, shown in the Engineering section. */
export const CONTROL_MODE =
  'A rescuer steers Delphylax by remote control from the bank; the ESP32 on board only takes over to cut the motors if the boat tips or leaks. Self-driving search is planned, not built.'

export const SPECS = [
  { spec: 'Length, nose tip to tail', value: 'about 940 mm', how: 'From the design (760 mm pipes + cones)', estimate: false },
  { spec: 'Width', value: '534 mm', how: 'Pipes 420 mm apart, 114 mm each', estimate: false },
  { spec: 'Height, thruster to fin top', value: 'about 470 mm', how: 'From the design', estimate: false },
  { spec: 'Weight', value: 'about 5 kg', how: 'Estimate, to be weighed', estimate: true },
  { spec: 'Floating capacity', value: 'about 15 kg', how: 'Two sealed pipes hold about 7.8 L each', estimate: false },
  { spec: 'Thrust', value: '0.4 to 1.0 kgf per thruster', how: 'Estimate; the maker lists no number, so we will measure it with a scale', estimate: true },
  { spec: 'Water drag at 1 m/s', value: 'about 0.18 kgf', how: 'Estimate from hull size', estimate: true },
  { spec: 'Top speed', value: 'about 1.2 m/s', how: 'Hull-speed limit for a 0.9 m hull, estimate', estimate: true },
  { spec: 'Battery', value: '3S lithium, 11.1 V', how: 'Bought', estimate: false },
  { spec: 'Brain', value: 'ESP32, 30-pin screw-terminal board', how: 'Bought and tested', estimate: false },
] as const

export const HULL = {
  lengthMm: 940,
  widthMm: 534,
  heightMm: 470,
  pipeLengthMm: 760,
  pipeDiameterMm: 114,
  pipeSpacingMm: 420,
  pipeVolumeL: 7.8,
  capacityKg: 15,
  weightKg: 5,
  dragKgfAt1ms: 0.18,
  topSpeedMs: 1.2,
  waterlineLengthM: 0.9,
  deckMm: 8,
  batteryV: 11.1,
  fuseA: 20,
  thrustKgf: [0.4, 1.0] as const,
} as const

/** Hull-speed limit for a displacement hull: v ≈ 1.25·√L (m/s, L in m). */
export function hullSpeed(lengthM: number) {
  return 1.25 * Math.sqrt(lengthM)
}
/** Buoyancy model: fraction of the two pipes' capacity used by a given total mass. */
export function buoyancy(payloadKg: number) {
  const mass = HULL.weightKg + payloadKg
  const used = mass / HULL.capacityKg
  return { mass, used, reserveKg: HULL.capacityKg - mass }
}

export const HOW_IT_WORKS = [
  {
    id: 'hulls',
    name: 'Catamaran hulls',
    short: 'Two 76 cm PVC pipes',
    body: 'Two 76 cm PVC pipes (114 mm wide), 42 cm apart. 3D-printed nose and tail cones are glued on, and foam inside means a leak can’t sink it.',
    color: '#f8fafc',
  },
  {
    id: 'cabin',
    name: 'Deck & cabin',
    short: 'Airtight box, coral shell, fin',
    body: 'An 8 mm foam PVC deck sits on four printed saddles strapped to the pipes. An airtight box on the deck holds the electronics, under a coral 3D-printed shell with a dolphin fin.',
    color: '#ff7f66',
  },
  {
    id: 'thrusters',
    name: 'Brushless thrusters',
    short: '2 × QC2221, CW + CCW',
    body: 'Two brushless underwater thrusters, one spinning each way, sit under the back of the hulls. Running one faster than the other steers the boat.',
    color: '#3b82f6',
  },
  {
    id: 'senses',
    name: 'Sonar + thermal senses',
    short: 'Fish-finder sonar · AMG8833 · compass · GPS (planned)',
    body: 'Sonar finds objects under the water; the AMG8833 heat sensor spots people at the surface. A compass knows which way the boat points, and GPS is planned. A tilt sensor and a leak sensor watch for danger. Sonar readings are shown on the fish finder’s screen for now; linking them to the ESP32 is planned.',
    color: '#ec4899',
  },
  {
    id: 'markers',
    name: 'Glow-marker dropper',
    short: 'Servo disc, 4 tubes',
    body: 'A servo turns a disc under a rack of four tubes and drops one glowing marker at a time where something is found. Tagging each drop with a GPS position is planned.',
    color: '#e11d48',
  },
  {
    id: 'brain',
    name: 'ESP32 safety brain',
    short: 'Tilt + leak cut-off',
    body: 'The ESP32 reads every sensor and drives the thrusters, and it cuts the motors if the boat tips past a safe angle or the leak sensor gets wet. A 3-cell 11.1 V battery feeds a 20 A fuse, then the thrusters; a converter makes 5 V for the computer and the servo.',
    color: '#38bdf8',
  },
] as const

export type SubsystemId = (typeof HOW_IT_WORKS)[number]['id']

export const TIMELINE = [
  { date: 'Nov 5', version: 'Delphylax build', change: 'Building started, one small step at a time', state: 'active' },
  { date: 'Nov 4', version: 'Delphylax', change: 'Renamed after the Greek words for dolphin + guardian', state: 'done' },
  { date: 'Nov 2', version: 'Mudsight, Level 1', change: 'Brushless underwater thrusters added to fight current; budget raised to about 500,000 won', state: 'done' },
  { date: 'Nov 2', version: 'Mudsight', change: 'Switched to a street-flood rescue boat: an 80 cm PVC-pipe catamaran that searches muddy water and drops glowing markers', state: 'done' },
  { date: 'Oct 29 – Nov 1', version: 'Floodscout Kit', change: 'Tried a home flood guardian for semi-basement homes, with a door sensor box; dropped for the street-flood boat', state: 'dropped' },
  { date: 'Oct 28', version: 'Floodscout rebuild', change: 'Breadboards replaced with a screw-terminal ESP32 board and Wago connectors', state: 'done' },
  { date: 'Oct 25', version: 'Floodscout V7', change: 'Leak test passed; phone app and live camera working', state: 'done' },
  { date: 'Oct 20 – 24', version: 'Floodscout V7', change: 'Water jets replaced by two built-in propeller tunnels; works with no internet', state: 'done' },
  { date: 'Oct 19', version: 'Floodscout V4 → V7', change: '3D-printed hull with wheel-legs, small DC motors and propellers', state: 'done' },
] as const

export const PIVOT_REASON =
  'Floodscout began as a small 3D-printed robot with wheel-legs that drove on land and paddled in shallow water. Its small body and toy motors were too weak for real flood water, so in early November it became a bigger, stronger rescue boat.'

export interface Part {
  group: string
  part: string
  spec: string
  qty: number
  unit: number
}

export const PARTS: Part[] = [
  { group: 'Power', part: 'Underwater thrusters', spec: 'QX-MOTOR QC2221 380KV with propeller, 1 CW + 1 CCW', qty: 2, unit: 50000 },
  { group: 'Sensors', part: 'Sonar', spec: 'LUCKY wireless fish finder FF718LiC-W', qty: 1, unit: 100000 },
  { group: 'Sensors', part: 'Thermal sensor', spec: 'AMG8833 8x8 heat camera', qty: 1, unit: 35000 },
  { group: 'Power', part: 'Speed controllers (ESC)', spec: '30 A, forward and reverse', qty: 2, unit: 15000 },
  { group: 'Power', part: 'Battery', spec: '3S 18650 pack, 11.1 V, about 5000 mAh', qty: 1, unit: 30000 },
  { group: 'Body', part: 'PVC pipe', spec: 'KS 100A, 114 mm, cut to 76 cm', qty: 2, unit: 8000 },
  { group: 'Body', part: 'Deck sheet', spec: '8 mm black foam PVC, 500 x 500 mm', qty: 1, unit: 15000 },
  { group: 'Sensors', part: 'GPS', spec: 'NEO-M8N with antenna', qty: 1, unit: 15000 },
  { group: 'Markers', part: 'Rescue ring', spec: 'About 20 cm', qty: 1, unit: 10000 },
  { group: 'Hardware', part: 'M4 bolt kit', spec: 'Stainless bolts, nuts, washers', qty: 1, unit: 9000 },
  { group: 'Power', part: 'Charger', spec: '12.6 V 2 A for 3S lithium', qty: 1, unit: 8000 },
  { group: 'Power', part: 'Wires + fuse', spec: '14 AWG silicone wire, connectors, fuse', qty: 1, unit: 8000 },
  { group: 'Body', part: 'Spray foam', spec: 'Urethane foam for the pipes', qty: 1, unit: 6000 },
  { group: 'Body', part: 'Epoxy', spec: '2-part, for the cones', qty: 1, unit: 6000 },
  { group: 'Hardware', part: 'Hose clamps (pipe)', spec: 'Stainless, 110 to 125 mm', qty: 6, unit: 1000 },
  { group: 'Wiring', part: 'Wago connectors', spec: '221 lever connectors', qty: 1, unit: 6000 },
  { group: 'Body', part: 'Cabin box', spec: 'Airtight food box, up to 250 x 150 x 100 mm', qty: 1, unit: 5000 },
  { group: 'Wiring', part: 'ESP32 terminal board', spec: 'Screw-terminal expansion board', qty: 1, unit: 5000 },
  { group: 'Sound + light', part: 'Amplifier', spec: 'PAM8610, 12 V', qty: 1, unit: 5000 },
  { group: 'Sound + light', part: 'Searchlights', spec: '12 V waterproof LED, 23 mm', qty: 2, unit: 2500 },
  { group: 'Markers', part: 'Glow markers', spec: 'Mini lights, about 5 mm', qty: 10, unit: 500 },
  { group: 'Markers', part: 'Sinkers + line', spec: '30 to 50 g, 3 m line each', qty: 1, unit: 5000 },
  { group: 'Safety', part: 'Reflective tape', spec: 'Waterproof, for the pipe bottoms', qty: 1, unit: 5000 },
  { group: 'Hardware', part: 'Cable glands', spec: 'PG7 waterproof', qty: 6, unit: 700 },
  { group: 'Body', part: 'Silicone sealant', spec: 'Clear, for holes and seams', qty: 1, unit: 4000 },
  { group: 'Hardware', part: 'Hose clamps (thruster)', spec: 'Stainless, 40 to 64 mm', qty: 4, unit: 800 },
  { group: 'Body', part: 'Velcro strips', spec: 'Holds the shell on the box', qty: 1, unit: 3000 },
  { group: 'Power', part: '5 V converter', spec: '12 V to 5 V, 3 A', qty: 1, unit: 3000 },
  { group: 'Sensors', part: 'Compass', spec: 'GY-271 / GY-273', qty: 1, unit: 3000 },
  { group: 'Sensors', part: 'Tilt sensor', spec: 'MPU6050 (GY-521)', qty: 1, unit: 3000 },
  { group: 'Markers', part: 'Servo', spec: 'SG90 micro servo', qty: 1, unit: 2500 },
  { group: 'Sensors', part: 'Leak sensor', spec: 'Water level sensor module', qty: 1, unit: 1000 },
]

export const PARTS_TOTAL = PARTS.reduce((s, p) => s + p.qty * p.unit, 0) // 461,900

export const PRINTING = {
  plates: [
    { plate: '1 and 2', parts: 'Nose cones (coral), 1 each', job: 'Pointed front of each hull', cost: 18000 },
    { plate: '3 and 4', parts: 'Tail cone, 2 saddles, 1 thruster mount each', job: 'Back of each hull; saddles hold the deck; mount holds a thruster', cost: 14000 },
    { plate: '5', parts: 'Marker rack, 4 tubes', job: 'Holds the glowing markers over the water', cost: 4000 },
    { plate: '6', parts: 'Marker disc', job: 'Turns to drop one marker at a time', cost: 1500 },
    { plate: '7', parts: 'Fin, sensor bezel, sensor bracket', job: 'Fin hides the GPS; bezel holds camera, heat sensor and lights', cost: 4000 },
    { plate: '8', parts: 'Sonar holder', job: 'Holds the sonar float at the front', cost: 1000 },
    { plate: '9', parts: 'Marker shroud', job: 'Low cover over the tubes and servo', cost: 2500 },
    { plate: '10 to 12', parts: 'Cabin shell, front, middle, back (coral)', job: 'The dolphin-shaped cover over the box', cost: 12000 },
    { plate: 'Reprint', parts: '4 saddles + 2 thruster mounts, one plate', job: 'Fixed version, no supports inside', cost: 16610 },
  ],
  firstRunEstimate: 57000,
  reprint: 16610,
  total: 73610,
  settings: 'PETG (or PLA), 4 walls, 15 to 20% infill, supports off',
  note: 'The reprint is needed because the first saddles and thruster mounts came with print supports stuck inside their slots. The new design prints standing up, with no supports.',
} as const

export const COST = {
  parts: PARTS_TOTAL,
  printing: PRINTING.total,
  total: PARTS_TOTAL + PRINTING.total, // 535,510
  topTwoShare: 0.43,
  usdRate: 1400,
  /** one rounded set of headline numbers, used everywhere */
  usdApprox: 380,
  ratio: 26,
  line: 'about $380 (535,510 won, estimate)',
  emilyUsd: 10000,
  emilySource: 'Military.com (2016)',
  emilySpeedMph: 25,
} as const

export const COST_BY_GROUP = Object.entries(
  PARTS.reduce<Record<string, number>>((acc, p) => {
    acc[p.group] = (acc[p.group] ?? 0) + p.qty * p.unit
    return acc
  }, {}),
)
  .map(([group, won]) => ({ group, won }))
  .sort((a, b) => b.won - a.won)

export const BUILD_STATUS = {
  summary:
    'The hulls, deck, cabin box and power harness are done; the boat is waiting on the reprinted saddles, the second speed controller and two sensors before its first water test.',
  done: [
    'Leak sensor wired to the ESP32 and tested',
    'Marker servo wired and tested; servo fitted in the marker rack',
    'Hull pipes cut to 76 cm; nose and tail cones test-fitted',
    'Power wiring: 5 V converter, fuse holder and four Wago bars',
    'Deck drilled with all 16 holes from a full-size paper template',
    'Electronics box drilled and bolted to the deck',
    'Thrusters (CW + CCW), battery and one speed controller arrived',
  ],
  todo: [
    'Pay for and receive the reprinted saddles and thruster mounts',
    'Foam in both ends of each pipe, then glue the cones with epoxy and screws',
    'Fit the parts inside the box; seal every hole with silicone',
    'Second speed controller, tilt sensor and compass (on the way)',
    'Wire thrusters, battery and fuse; write the full brain code',
    'First water test: float, drive, and measure thrust with a scale',
    'Add GPS, heat sensor and sonar',
  ],
} as const

export const WATER_TEST = [
  { test: 'Float', measure: 'Waterline and trim with the full payload', status: 'pending' },
  { test: 'Drive & steer', measure: 'Differential thrust turning, straight-line speed', status: 'pending' },
  { test: 'Thrust', measure: 'Each thruster tied to a scale; pull in kgf', status: 'pending' },
  { test: 'Current hold', measure: 'Fastest current the boat holds position against', status: 'pending' },
] as const

export const LIMITS = {
  headline: 'The biggest limit is speed: the hull shape caps Delphylax at about 1.2 m/s, so it can work in slow street floods but not against a fast river current. We will state only what we measure.',
  items: [
    { title: 'Thrust is unmeasured', body: 'The thruster maker lists no thrust figure. We will tie each thruster to a scale and record its pull.' },
    { title: 'Current limit', body: 'We will test how fast a current the boat can hold its position against, and report that number.' },
    { title: 'Upgrade path (Level 2)', body: 'Bigger thrusters (about 3 to 3.5 kgf each) on a 4-cell battery would push harder, if testing shows we need it.' },
    { title: 'Costs are estimates', body: 'Receipts will replace the planning prices once every part is bought.' },
  ],
} as const

export const COMPETITORS = [
  {
    name: 'Delphylax',
    kind: 'Flood-rescue scout catamaran',
    cost: 'About $380 (535,510 won, estimate)',
    deployment: 'Carried by one person, placed in the water',
    sensing: 'Sonar finds objects under the water; heat sensor spots people at the surface',
    marking: 'Drops a glowing marker (GPS tag planned)',
    maturity: 'Prototype — first water test pending',
    scores: { cost: 5, deployment: 4, sensing: 4, marking: 5, maturity: 2 },
    highlight: true,
  },
  {
    name: 'EMILY robotic lifeguard',
    kind: 'Proven product, navies & lifeguards',
    cost: 'About $10,000 (Military.com, 2016)',
    deployment: 'Thrown in; reaches 25 mph',
    sensing: 'Uses a camera, which struggles in muddy water',
    marking: 'Carries flotation to a visible victim',
    maturity: 'Finished product',
    scores: { cost: 2, deployment: 5, sensing: 2, marking: 3, maturity: 5 },
    highlight: false,
  },
  {
    name: 'Tethered ROV',
    kind: 'e.g. Blueye, Deep Trekker',
    cost: 'Varies by model; price not sourced here',
    deployment: 'Needs a tether and an operator',
    sensing: 'Uses a camera, which struggles in muddy water',
    marking: 'None — operator reads a screen',
    maturity: 'Finished product',
    scores: { cost: 2, deployment: 3, sensing: 2, marking: 1, maturity: 5 },
    highlight: false,
  },
] as const

export const MATRIX_COLUMNS = [
  { key: 'cost', label: 'Unit Cost' },
  { key: 'deployment', label: 'Deployment' },
  { key: 'sensing', label: 'Muddy-Water Search' },
  { key: 'marking', label: 'Marks the Spot' },
  { key: 'maturity', label: 'Maturity' },
] as const

export const ROADMAP = [
  { phase: 'Now', date: 'Nov 2026', title: 'Delphylax build', body: 'Hulls, deck, cabin box and power harness done. Waiting on reprinted saddles, second ESC, tilt sensor and compass.', state: 'active' as const },
  { phase: 'Next', date: 'Nov–Dec 2026', title: 'First water test', body: 'Float, drive, measure thrust with a scale, and test the current the boat can hold against.', state: 'planned' as const },
  { phase: 'Then', date: 'KSEF 2027', title: 'Sonar + thermal search', body: 'Add GPS, heat sensor and sonar; measure detection in a muddy test tank; replace estimates with receipts and measurements.', state: 'planned' as const },
  { phase: 'Level 2', date: 'Conrad Challenge', title: 'Stronger push', body: 'Bigger thrusters (3 to 3.5 kgf each) on a 4-cell battery, if testing shows slow street floods are not enough.', state: 'planned' as const },
] as const

export const BUSINESS = {
  customers: [
    { who: '119 Fire & Rescue stations', why: 'A scout per truck: see what is under the water before anyone wades in.' },
    { who: 'Municipal flood-response units', why: 'Street-by-street sweeps of flooded underpasses and low-lying districts.' },
    { who: 'Towns without rescue-robot budgets', why: 'At about 1/26 the price of EMILY, a basic scout becomes affordable.' },
  ],
  team: [{ name: 'Eddie' }, { name: 'Minnie' }, { name: 'Luna' }],
  sources: [
    {
      label: 'EMILY robotic lifeguard price and speed, Military.com (2016)',
      href: 'https://www.military.com/daily-news/2016/05/18/meet-the-us-navys-robotic-lifeguard-named-emily.html',
    },
    {
      label: 'Part prices: the project shopping list (estimates, November 2026)',
      href: 'https://github.com/e3kim2032-sketch/delphylax-3d/blob/main/delphylax-overview.md#costs',
    },
    {
      label: 'Reprint price: print shop checkout total (November 2026)',
      href: 'https://github.com/e3kim2032-sketch/delphylax-3d/blob/main/delphylax-overview.md#costs',
    },
  ],
} as const

/**
 * Build log photos. Drop a JPG into `public/build/` named `<id>.jpg` and it
 * replaces the placeholder slot; until then the slot shows the caption only.
 */
export const BUILD_LOG = [
  { id: '01-hull-pipes', date: 'Nov 5', caption: 'Hull pipes cut to 76 cm, nose and tail cones test-fitted' },
  { id: '02-deck-template', date: 'Nov 6', caption: 'Deck drilled from a full-size paper template, 16 holes' },
  { id: '03-cabin-box', date: 'Nov 7', caption: 'Electronics box drilled and bolted to the deck' },
  { id: '04-power-harness', date: 'Nov 8', caption: 'Power wiring: 5 V converter, fuse holder and four Wago bars' },
  { id: '05-leak-sensor', date: 'Nov 9', caption: 'Leak sensor wired to the ESP32 and tested' },
  { id: '06-marker-servo', date: 'Nov 10', caption: 'Marker servo wired, tested and fitted in the rack' },
  { id: '07-thrusters', date: 'Nov 11', caption: 'Thrusters (CW + CCW), battery and the first speed controller' },
  { id: '08-first-float', date: 'Soon', caption: 'First water test: float, drive, thrust on a scale' },
] as const

export const SECTIONS = [
  { id: 'hero', index: '01', label: 'Guardian', depth: 0 },
  { id: 'crisis', index: '02', label: 'The Crisis', depth: -0.6 },
  { id: 'engineering', index: '03', label: 'Engineering', depth: -1.4 },
  { id: 'buildlog', index: '04', label: 'Build Log', depth: -1.6 },
  { id: 'sandbox', index: '05', label: 'Field Test', depth: -2.2 },
  { id: 'matrix', index: '06', label: 'Comparison', depth: -2.7 },
  { id: 'business', index: '07', label: 'Business', depth: -3.0 },
] as const

/** Street-flood depth for the HUD gauge (m). */
export const MAX_DEPTH_M = 3.0

export const won = (n: number) => `₩${n.toLocaleString('en-US')}`
export const usd = (wonAmount: number) => `$${Math.round(wonAmount / COST.usdRate).toLocaleString('en-US')}`
