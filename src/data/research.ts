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

/** A site-relative path (e.g. cost-notes.html) or an absolute URL, resolved for links. */
export const resolveHref = (href: string) => (/^https?:/.test(href) ? href : `${import.meta.env.BASE_URL}${href}`)

/** The 10-second test: three plain-language lines under the hero one-liner. */
export const HERO_FACTS = [
  { label: 'What it is', text: 'A small robot boat that searches flooded streets.' },
  { label: 'Who it helps', text: 'People trapped in floods, and the rescuers looking for them.' },
  { label: 'Why it matters', text: 'Rescuers can see where people are without wading into dangerous, muddy water.' },
] as const

export const CRISIS = {
  event: 'Seoul, August 2022',
  recordYears: 115,
  recordLabel: 'the heaviest daily rain since Seoul began keeping weather records',
  livesLost: 3,
  livesLabel: 'lost when water trapped a family inside their semi-basement home',
  summary: 'The water rose faster than the family could escape, and no one outside could see what was happening inside.',
  summaryNote: 'Paraphrased from news reports',
  monsoonWindow: 'Late June – early August',
  sources: [
    { label: 'NPR (9 Aug 2022)', href: 'https://www.npr.org/2022/08/09/1116455746/historic-rainfall-turns-seouls-roads-into-rivers-and-leaves-8-dead' },
    { label: 'The Kyunghyang Shinmun (10 Aug 2022)', href: 'https://www.khan.co.kr/en/article/202208101342347' },
  ],
  /** the 115-year record: daily rain at the Dongjak station, highest since modern records began in 1907 */
  recordSource: {
    label: 'The Watchers (9 Aug 2022)',
    href: 'https://watchers.news/2022/08/09/heaviest-rainfall-in-115-years-hits-seoul-leaving-8-people-dead-and-7-others-missing-south-korea/',
  },
  whyDeadly: [
    { title: 'Water rises in minutes', body: 'Streets and underpasses fill faster than people can get out.' },
    { title: 'Total darkness', body: 'Power is usually cut, so there is no light.' },
    { title: 'Hidden dangers', body: 'Muddy water hides debris, open manholes, and live electricity.' },
    { title: 'Rescuers go in blind', body: 'No one can tell what, or who, is under the water.' },
  ],
  question: 'How can rescuers see what is under muddy flood water, quickly, without sending a person in?',
} as const

/**
 * Real Korean urban floods where the water itself hid or blocked the people inside.
 * Every entry is checked against the linked reports; nothing here is estimated.
 */
export const INCIDENTS = [
  {
    date: '8 August 2022',
    place: 'Seoul · semi-basement home, Sillim-dong',
    what: 'Record rain flooded a semi-basement home in Gwanak District. A family of three could not get out, and died.',
    why: 'Water came in through the window and the stairs. The family called for help, but rescuers could not reach them in time.',
    sources: [
      { label: 'NPR', href: 'https://www.npr.org/2022/08/09/1116455746/historic-rainfall-turns-seouls-roads-into-rivers-and-leaves-8-dead' },
      { label: 'Kyunghyang Shinmun', href: 'https://www.khan.co.kr/en/article/202208101342347' },
    ],
  },
  {
    date: '6 September 2022',
    place: 'Pohang · apartment underground car park',
    what: 'As Typhoon Hinnamnor flooded the city, residents went down to move their cars and were trapped. Seven people died; two were rescued alive.',
    why: 'The car park was under water, and rescuers had to drain it before they could search for the people inside.',
    sources: [{ label: 'Al Jazeera', href: 'https://www.aljazeera.com/news/2022/9/7/death-toll-rises-to-10-after-typhoon-hinnamnor-hits-south-korea' }],
  },
  {
    date: '15 July 2023',
    place: 'Cheongju · Osong road underpass',
    what: 'A river bank gave way and the underpass filled in as little as two or three minutes, trapping vehicles including a bus. Fourteen people died.',
    why: 'Divers searched from rubber boats while crews pumped the brown water out, and water mixed with mud slowed the search for the missing.',
    sources: [
      { label: 'Al Jazeera', href: 'https://www.aljazeera.com/news/2023/7/16/many-dead-in-s-korea-as-flash-floods-trap-15-vehicles-in-tunnel' },
      { label: 'The Korea Times', href: 'https://www.koreatimes.co.kr/southkorea/society/20230717/49-dead-or-missing-in-downpours-after-4-more-bodies-recovered-from-underground-road' },
      { label: 'Asia Economy', href: 'https://www.asiae.co.kr/en/article/2024071515472983456' },
    ],
  },
] as const

export const INCIDENTS_NOTE =
  'In each flood, people outside could not see into the water or get through it in time. Delphylax is built for flooded streets, so it would not have fitted every one of these spaces, but the problem it works on is the same one.'

/**
 * Flood Vulnerability Index (FVI): Luna's program for choosing where to search first.
 *
 * Only the general, published idea of an FVI is described on the page for now.
 * TODO (Luna): add the real details here, then show them in the FVI card:
 *   - the exact inputs (indicators) the index uses, and the public dataset each one comes from
 *   - the formula or weights that turn the inputs into one score, and the score's scale
 *   - the map unit it scores (for example dong, district, or grid cell) and the area covered
 *   - one worked example: a real neighbourhood, its inputs, and its score
 *   - how the ranking was checked against past floods, if it has been
 */
export const FVI = {
  what: 'A Flood Vulnerability Index is a score that ranks places by how badly a flood would hurt the people who live there. Luna is developing the team’s FVI program.',
  inputs:
    'Published indexes combine three kinds of information: exposure (how likely water is to reach a place), susceptibility (how easily the people and buildings there are harmed), and resilience (how well the place can cope and recover).',
  use: 'The program ranks neighbourhoods by score. In a flood, the highest-scoring neighbourhoods are searched first, so a single Delphylax goes where people are most at risk.',
  source: { label: 'Balica, Wright & van der Meulen (2012), Natural Hazards 64: 73–105', href: 'https://doi.org/10.1007/s11069-012-0234-1' },
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
    'River dolphins trade range for resolution: short, quiet, high-frequency clicks fired at a high rate let them navigate root-choked, sediment-filled water with no visibility at all. Delphylax borrows the idea — listen, don’t look — with a sonar sensor under the water, a LiDAR scanner above it, and an AMG8833 heat sensor for people at the surface.',
} as const

export const SONAR = {
  lockThreshold: 0.85,
  sparsityK: 8,
  sonarUnit: 'DFRobot SEN0599 underwater sonar sensor',
  backupSonarUnit: 'LUCKY FF718LiC-W wireless fish finder',
  lidarUnit: 'RPLIDAR C1 360-degree laser scanner',
  thermalUnit: 'AMG8833 8×8 thermal camera',
  /** what each sensor can and cannot do — used wherever sensing is described */
  roles: 'Sonar finds objects under the water; the AMG8833 heat sensor spots people at the surface.',
  /** what the LiDAR adds: it works above the water only */
  lidar: 'A 360-degree LiDAR scanner on top maps obstacles above the water.',
  integration: 'The sonar sensor sends its distance readings straight to the ESP32. A fish-finder sonar is carried as a backup.',
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

/**
 * Numbered parts legend. The numbers match the pins on the exploded 3D model.
 * Everything here comes from the parts list, the specs and delphylax-overview.md.
 */
export const PARTS_LEGEND = [
  {
    id: 'hulls',
    name: 'Hulls',
    does: 'Two sealed pipes keep the boat afloat and hard to flip.',
    material: 'KS 100A PVC pipe, 114 mm wide, cut to 76 cm; 3D-printed nose and tail cones; urethane foam inside',
    more: 'The pipes sit 42 cm apart. Foam inside means a leak can’t sink the boat, and together the two pipes float about 15 kg.',
    color: '#f8fafc',
  },
  {
    id: 'deck',
    name: 'Deck',
    does: 'A flat platform that joins the hulls and carries everything else.',
    material: '8 mm black foam PVC sheet on four 3D-printed saddles strapped to the pipes',
    more: '',
    color: '#aab8c2',
  },
  {
    id: 'box',
    name: 'Electronics box',
    does: 'Keeps the electronics dry, under the coral shell with the dolphin fin.',
    material: 'Airtight food box, 250 × 150 × 100 mm, with PG7 cable glands and silicone sealant; 3D-printed shell held on with Velcro',
    more: '',
    color: '#ff7f66',
  },
  {
    id: 'esp32',
    name: 'ESP32',
    does: 'The brain: reads the sensors, drives the thrusters, and cuts the motors if the boat tips or leaks.',
    material: 'ESP32 on a 30-pin screw-terminal board',
    more: 'A rescuer steers by remote control from the bank. Self-driving search is planned, not built.',
    color: '#38bdf8',
  },
  {
    id: 'battery',
    name: 'Battery',
    does: 'Powers the thrusters, and the electronics through the converter.',
    material: '3-cell lithium pack, 11.1 V, about 5000 mAh',
    more: 'Run time has not been measured yet.',
    color: '#94a3b8',
  },
  {
    id: 'fuse',
    name: 'Fuse',
    does: 'Sits right after the battery and cuts the power if a wire shorts.',
    material: '20 A fuse in a holder, on 14 AWG silicone wire',
    more: '',
    color: '#facc15',
  },
  {
    id: 'converter',
    name: '12 V-to-5 V converter',
    does: 'Steps battery power down to 5 V for the ESP32 and the servo.',
    material: '12 V to 5 V, 3 A converter; Wago 221 lever connectors join the wires',
    more: '',
    color: '#4ade80',
  },
  {
    id: 'escs',
    name: 'ESCs (speed controllers)',
    does: 'One per thruster: each sets how fast its thruster spins, forward or reverse.',
    material: 'Two 30 A brushless speed controllers',
    more: '',
    color: '#c084fc',
  },
  {
    id: 'thrusters',
    name: 'Thrusters',
    does: 'Push the boat. Running one faster than the other steers it.',
    material: 'Two QX-MOTOR QC2221 380KV brushless underwater thrusters, one spinning each way, on 3D-printed mounts with stainless hose clamps',
    more: 'Thrust is estimated at 0.4 to 1.0 kgf per thruster. The maker lists no number, so it is not measured yet.',
    color: '#3b82f6',
  },
  {
    id: 'markers',
    name: 'Marker dropper',
    does: 'Drops one glowing marker at a time where something is found.',
    material: 'SG90 micro servo turning a 3D-printed disc under a rack of four tubes; mini glow lights with sinkers and 3 m lines',
    more: 'Tagging each drop with a GPS position is planned.',
    color: '#ff6b57',
  },
  {
    id: 'sensors',
    name: 'Sensors',
    does: 'Sonar finds objects under the water; the AMG8833 heat sensor spots people at the surface; LiDAR maps obstacles above the water.',
    material: 'DFRobot SEN0599 underwater sonar sensor on a bow float; RPLIDAR C1 360-degree laser scanner on top; AMG8833 8×8 heat sensor in the bow bezel; MPU6050 tilt sensor; leak sensor; GY-271 compass',
    more: 'The sonar sensor sends its distance readings straight to the ESP32. A fish-finder sonar (LUCKY FF718LiC-W) is carried as a backup. A NEO-M8N GPS is also planned.',
    color: '#ec4899',
  },
  {
    id: 'grablines',
    name: 'Grab lines',
    does: 'Orange rope loops along both hulls so a person in the water can hold on until rescuers arrive.',
    material: 'About 6 mm orange rope in three shallow loops between four attachment points on each hull',
    more: '',
    color: '#ff9a3c',
  },
  {
    id: 'pod',
    name: 'Delphylax Pod',
    does: 'A dolphin-shaped float the robot drops next to a person. It glows when it touches water.',
    material: '',
    more: 'About 372 mm long, 169 mm wide and 217 mm tall, with a dorsal fin, a tail and raised DELPHYLAX lettering. After the drop the robot backs away, so a panicking person grabs the Pod and not the boat.',
    color: '#e8654f',
  },
] as const

export type PartId = (typeof PARTS_LEGEND)[number]['id']

/**
 * "How a rescue would work": the labelled steps under the concept animation.
 * It is a concept: today the boat is steered by remote control, and the automatic sweep is planned.
 */
export const RESCUE_STEPS = [
  { title: 'Truck stops', body: 'The rescue truck stops at the edge of the flood.' },
  { title: 'Delphylax launches', body: 'One person carries Delphylax to the water and sets it down.' },
  { title: 'It sweeps the street', body: 'It crosses the flooded street back and forth, like mowing a lawn, while sonar looks for objects under the water.' },
  { title: 'It marks the spot', body: 'The heat sensor spots a person at the surface beside a semi-basement window, and Delphylax drops a glowing marker there.' },
  { title: 'It drops the Pod', body: 'Delphylax drops the Delphylax Pod, a dolphin-shaped float that glows when it touches water, then backs away so a panicking person grabs the Pod and not the boat.' },
  { title: 'Rescuers go straight there', body: 'The crew heads directly to the marker instead of searching every street.' },
] as const

/**
 * The Delphylax Pod. The wording is the team's own, from the funding pitch:
 * what firefighters said in the interviews, and what the team designed in answer.
 */
export const POD = {
  quote: 'A person who is drowning panics and pushes down with far more strength than normal. Your robot needs a float.',
  quoteBy: 'What firefighters told us',
  intro: 'So we designed the Delphylax Pod',
  lines: [
    'A dolphin-shaped float the robot drops next to a person.',
    'It glows when it touches water so rescuers can see it from far away.',
    'The robot then backs away, so a panicking person grabs the Pod and not the boat.',
  ],
} as const

export const RESCUE_NOTE =
  'This shows the idea, not a real mission. Today a rescuer steers Delphylax by remote control; the automatic sweep is planned, not built.'

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
  emilySource: 'Military.com, 2016',
  emilySpeedMph: 25,
} as const

/** Hero impact counters. Every value comes from this file and carries its own source link. */
export const IMPACT = [
  {
    prefix: '$',
    value: COST.usdApprox,
    suffix: '',
    label: `Build cost, estimate (${(PARTS_TOTAL + PRINTING.total).toLocaleString('en-US')} won)`,
    source: { label: 'Cost notes', href: 'cost-notes.html' },
  },
  {
    prefix: '1/',
    value: COST.ratio,
    suffix: '',
    label: 'of the price of EMILY, a proven rescue robot (about)',
    source: { label: 'Military.com, 2016', href: 'https://www.military.com/daily-news/2016/05/18/meet-the-us-navys-robotic-lifeguard-named-emily.html' },
  },
  {
    prefix: '',
    value: CRISIS.recordYears,
    suffix: ' yrs',
    label: 'Seoul, August 2022: heaviest daily rain since records began',
    source: CRISIS.recordSource,
  },
] as const

export const COST_BY_GROUP = Object.entries(
  PARTS.reduce<Record<string, number>>((acc, p) => {
    acc[p.group] = (acc[p.group] ?? 0) + p.qty * p.unit
    return acc
  }, {}),
)
  .map(([group, won]) => ({ group, won }))
  .sort((a, b) => b.won - a.won)

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

export const MISSION = 'Let rescuers see what is under flood water before anyone wades in.'
export const VISION = 'A flood scout on every rescue truck, in every town that floods.'

/**
 * How we make money. Every price is an estimate worked out from the build cost above
 * with the planning assumptions below. They are not quotes.
 * TODO (team): confirm or replace these three assumptions.
 */
const PRICING = { saleMultiple: 2, serviceShare: 0.2, trainingShare: 0.5 } as const
const roundTo5 = (n: number) => Math.round(n / 5) * 5

export const REVENUE = [
  {
    title: 'Sell boats to fire stations',
    price: `about $${roundTo5(COST.usdApprox * PRICING.saleMultiple)} per boat`,
    basis: `Estimate: ${PRICING.saleMultiple} × the $${COST.usdApprox} build cost, to cover assembly, testing and spares.`,
    body: 'One boat per rescue truck, bought by the fire headquarters that equips the station.',
  },
  {
    title: 'Yearly parts and service plan',
    price: `about $${roundTo5(COST.usdApprox * PRICING.serviceShare)} a year per boat`,
    basis: `Estimate: ${PRICING.serviceShare * 100}% of the build cost each year.`,
    body: 'Replacement glow markers and wear parts, and a check before each monsoon season.',
  },
  {
    title: 'Operator training',
    price: `about $${roundTo5(COST.usdApprox * PRICING.trainingShare)} per station`,
    basis: `Estimate: ${PRICING.trainingShare * 100}% of the build cost for one session.`,
    body: 'A hands-on session so a crew can launch, steer and recover the boat.',
  },
] as const

/** UN Sustainable Development Goal targets. Wording checked against sdgs.un.org (linked). */
export const SDGS = [
  {
    goal: 'SDG 11',
    name: 'Sustainable cities and communities',
    target: 'Target 11.5',
    text: 'By 2030, significantly reduce deaths, the number of people affected and economic losses caused by disasters, including water-related disasters.',
    help: 'Delphylax helps rescuers find people in a flooded street sooner, without sending another person into the water.',
    href: 'https://sdgs.un.org/goals/goal11#targets_and_indicators',
  },
  {
    goal: 'SDG 13',
    name: 'Climate action',
    target: 'Target 13.1',
    text: 'Strengthen resilience and adaptive capacity to climate-related hazards and natural disasters in all countries.',
    help: 'A scout cheap enough to ride on every rescue truck makes a city better prepared for the next flood.',
    href: 'https://sdgs.un.org/goals/goal13#targets_and_indicators',
  },
  {
    goal: 'SDG 9',
    name: 'Industry, innovation and infrastructure',
    target: 'Target 9.1',
    text: 'Develop quality, reliable, sustainable and resilient infrastructure, with affordable and equitable access for all.',
    help: `Built from PVC pipe and off-the-shelf parts for about $${COST.usdApprox} (estimate), it puts rescue equipment within reach of towns with small budgets.`,
    href: 'https://sdgs.un.org/goals/goal9#targets_and_indicators',
  },
] as const

/** Policy & adoption (Minnie). Sourced facts only; the pilot is a proposal and has no numbers. */
export const POLICY = {
  buyers:
    'In Korea, rescue equipment is bought by the metropolitan and provincial fire headquarters that run the 119 fire and rescue stations. They buy through the Public Procurement Service’s online shopping mall or by competitive bidding.',
  source: { label: 'The Kyunghyang Shinmun (7 Oct 2026)', href: 'https://www.khan.co.kr/en/article/202610071558017' },
  pilotTitle: 'What a pilot would look like',
  pilot: [
    'Lend one Delphylax to a single fire station for a monsoon season.',
    'Train the crew to launch, steer and recover it.',
    'Log every launch: where it went, what it found, and what went wrong.',
    'Review the log with the station and decide together whether it has earned a place on the truck.',
  ],
} as const

export const BUSINESS = {
  customers: [
    { who: '119 Fire & Rescue stations', why: 'A scout per truck: see what is under the water before anyone wades in.' },
    { who: 'Municipal flood-response units', why: 'Street-by-street sweeps of flooded underpasses and low-lying districts.' },
    { who: 'Towns without rescue-robot budgets', why: 'At about 1/26 the price of EMILY, a basic scout becomes affordable.' },
  ],
  team: [
    { name: 'Eddie', role: 'Project lead · design, build and electronics' },
    { name: 'Minnie', role: 'Communications director and policy researcher' },
    { name: 'Luna', role: 'Researcher and FVI (Flood Vulnerability Index) program developer' },
  ],
  sources: [
    {
      label: 'EMILY robotic lifeguard price and speed, Military.com (2016)',
      href: 'https://www.military.com/daily-news/2016/05/18/meet-the-us-navys-robotic-lifeguard-named-emily.html',
    },
    {
      label: 'Part prices: the project shopping list (estimates, November 2026)',
      href: 'cost-notes.html',
    },
    {
      label: 'Reprint price: print shop checkout total (November 2026)',
      href: 'cost-notes.html',
    },
  ],
} as const

/**
 * Judge FAQ. Every answer is built from the values in this file. Where something
 * is unknown or untested, the answer says so.
 */
export const FAQ = [
  {
    q: 'How fast is it?',
    a: `About ${HULL.topSpeedMs} m/s at most. That is an estimate from the hull-speed limit for a ${HULL.waterlineLengthM} m hull, not a measurement. The first water test will give the real number.`,
  },
  {
    q: 'How long does the battery last?',
    a: `We don’t know yet. The battery is a 3-cell lithium pack (${HULL.batteryV} V, about 5000 mAh). Run time depends on how much current the thrusters draw, and that has not been measured.`,
  },
  {
    q: 'What if the water is too fast?',
    a: `Then Delphylax is the wrong tool. It is built for slow street floods: with a top speed near ${HULL.topSpeedMs} m/s (estimate) it cannot work against a fast river current, and the fastest current it can hold against is untested. If the boat tips past a safe angle or the leak sensor gets wet, the ESP32 cuts the motors, and foam in the hulls keeps it afloat.`,
  },
  {
    q: 'How does it find a person in muddy water?',
    a: `${SONAR.roles} ${SONAR.lidar} It then drops a glowing marker so rescuers know where to look. The heat sensor cannot see under the water. ${SONAR.integration} The sonar and heat readouts on this site are simulated.`,
  },
  {
    q: 'What does it cost?',
    a: `About $${COST.usdApprox} to build (${COST.total.toLocaleString('en-US')} won): ${COST.parts.toLocaleString('en-US')} won of parts and ${COST.printing.toLocaleString('en-US')} won of 3D printing. These are planning estimates, not receipts. That is about 1/${COST.ratio} of the price of EMILY (about $${COST.emilyUsd.toLocaleString('en-US')}), a finished rescue robot, so it compares price, not ability.`,
  },
  {
    q: 'What has been tested so far?',
    a: 'On the bench: the ESP32 control board. In the water: nothing yet. Delphylax has not had its first water test, so floating, speed, thrust and holding against a current are all unmeasured. The sonar and heat readouts on this site are simulated, not test data.',
  },
  {
    q: 'Does it drive itself?',
    a: CONTROL_MODE,
  },
  {
    q: 'What are its limits?',
    a: `${LIMITS.headline} The heat sensor only sees people at the surface. Tagging each marker with a GPS position is planned, not built. Every cost and performance figure marked “estimate” still has to be measured.`,
  },
] as const

export const SECTIONS = [
  { id: 'hero', index: '01', label: 'Guardian', depth: 0 },
  { id: 'crisis', index: '02', label: 'The Crisis', depth: -0.6 },
  { id: 'engineering', index: '03', label: 'Engineering', depth: -1.4 },
  { id: 'pod', index: '04', label: 'The Pod', depth: -0.3 },
  { id: 'sandbox', index: '05', label: 'Field Test', depth: -2.2 },
  { id: 'matrix', index: '06', label: 'Comparison', depth: -2.7 },
  { id: 'business', index: '07', label: 'Business', depth: -3.0 },
] as const

/** Street-flood depth for the HUD gauge (m). */
export const MAX_DEPTH_M = 3.0

export const won = (n: number) => `₩${n.toLocaleString('en-US')}`
export const usd = (wonAmount: number) => `$${Math.round(wonAmount / COST.usdRate).toLocaleString('en-US')}`
