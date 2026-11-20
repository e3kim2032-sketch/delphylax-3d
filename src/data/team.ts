/**
 * Team page content. First names only: no last names, school, ages, emails or photos of people.
 * Every line here restates something the site or the funding pitch already says.
 */

export const TEAM_INTRO = 'Three students building a flood-rescue scout for the Conrad Challenge and KSEF 2027.'

export const MEMBERS = [
  {
    name: 'Eddie',
    role: 'Project lead',
    focus: 'Design, build and electronics.',
    work: [
      'The hulls and deck: two sealed PVC pipes joined into a catamaran',
      'The two brushless thrusters and their speed controllers',
      'ESP32 wiring: the sensors, the power, and the cut-off that stops the motors if the boat tips or leaks',
    ],
  },
  {
    name: 'Minnie',
    role: 'Communications director and policy researcher',
    focus: '',
    work: [
      'Policy and adoption research: who buys rescue equipment in Korea, and how',
      'The pilot proposal: lend one Delphylax to a fire station for a monsoon season',
      'Communications for the team',
    ],
  },
  {
    name: 'Luna',
    role: 'Researcher and FVI (Flood Vulnerability Index) program developer',
    focus: '',
    work: [
      'The FVI program: a score that ranks places by how badly a flood would hurt the people who live there',
      'Ranking neighbourhoods, so the highest-scoring ones are searched first',
      'Fire station interviews',
    ],
  },
] as const

export const DESIGN_CYCLE = ['Research', 'Design', 'Build', 'Test', 'Improve'] as const

/** Who we talked to. The wording follows the funding pitch; the researcher is not named here. */
export const INTERVIEWS = [
  { who: 'Fire Department', detail: 'Incheon Headquarters + Jemulpo Fire Station' },
  { who: 'Incheon Research Institute', detail: 'A researcher for the Climate Change Index' },
] as const
