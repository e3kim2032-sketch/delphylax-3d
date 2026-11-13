# Floodscout Delphylax: Project Overview

Nov 13, 2026 · Eddie. Source of truth for `src/data/research.ts`.

## Summary

Delphylax is a rescue boat robot about 94 cm long, built for street floods, and its parts cost about 535,000 won (estimate). It is a catamaran: two plastic pipe hulls under a flat deck, so it is hard to flip. Two underwater thrusters push it, and a sealed box on the deck keeps the electronics dry.

In a flood, rescuers often can't see what is under muddy water. Delphylax searches the water with sonar and a heat sensor, then drops a glowing marker to show rescuers exactly where to look. A small computer (an ESP32) runs everything and stops the motors if the boat tips over or water gets into the box.

The name comes from the Greek words for "dolphin" and "guardian". It was inspired by the Amazon river dolphin, which finds its way through muddy river water without being able to see.

## From Floodscout to Delphylax

Floodscout began as a small 3D-printed robot with wheel-legs that drove on land and paddled in shallow water. Its small body and toy motors were too weak for real flood water, so in early November it became a bigger, stronger rescue boat.

| Date (2026) | Version | What changed |
|---|---|---|
| Nov 5 | Delphylax build | Building started, one small step at a time |
| Nov 4 | Delphylax | Renamed after the Greek words for dolphin + guardian |
| Nov 2 | Mudsight, Level 1 | Brushless underwater thrusters added to fight current; budget raised to about 500,000 won |
| Nov 2 | Mudsight | Switched to a street-flood rescue boat: an 80 cm PVC-pipe catamaran that searches muddy water and drops glowing markers |
| Oct 29 to Nov 1 | Floodscout Kit | Tried a home flood guardian for semi-basement homes, with a door sensor box; dropped for the street-flood boat |
| Oct 28 | Floodscout rebuild | Breadboards replaced with a screw-terminal ESP32 board and Wago connectors |
| Oct 25 | Floodscout V7 | Leak test passed; phone app and live camera working |
| Oct 20 to 24 | Floodscout V7 | Water jets replaced by two built-in propeller tunnels; works with no internet |
| Oct 19 | Floodscout V4 to V7 | 3D-printed hull with wheel-legs, small DC motors and propellers |

## How it works

- **Hulls:** two 76 cm PVC pipes (114 mm wide), 42 cm apart. 3D-printed nose and tail cones are glued on, and foam inside means a leak can't sink it.
- **Deck and cabin:** an 8 mm foam PVC deck sits on four printed saddles strapped to the pipes. An airtight box on the deck holds the electronics, under a coral 3D-printed shell with a dolphin fin.
- **Power:** a 3-cell lithium battery (11.1 V) feeds a 20 A fuse, then the thrusters. A converter turns 12 V into 5 V for the computer and the servo.
- **Movement:** two brushless underwater thrusters, one spinning each way, sit under the back of the hulls. Running one faster than the other steers the boat.
- **Senses:** sonar sees under muddy water, a heat sensor finds body warmth, and GPS and a compass know where the boat is. A tilt sensor and a leak sensor watch for danger.
- **Markers:** a servo turns a disc under a rack of four tubes and drops one glowing marker at a time where something is found.

The ESP32 is the brain. It reads every sensor and drives the thrusters, and it cuts the motors if the boat tips past a safe angle or the leak sensor gets wet.

## Specifications

Values marked "estimate" are calculated, not yet measured.

| Spec | Value | How we know |
|---|---|---|
| Length, nose tip to tail | about 940 mm | From the design (760 mm pipes + cones) |
| Width | 534 mm | Pipes 420 mm apart, 114 mm each |
| Height, thruster to fin top | about 470 mm | From the design |
| Weight | about 5 kg | Estimate, to be weighed |
| Floating capacity | about 15 kg | Two sealed pipes hold about 7.8 L each |
| Thrust | 0.4 to 1.0 kgf per thruster | Estimate; the maker lists no number, so we will measure it with a scale |
| Water drag at 1 m/s | about 0.18 kgf | Estimate from hull size |
| Top speed | about 1.2 m/s | Hull-speed limit for a 0.9 m hull, estimate |
| Battery | 3S lithium, 11.1 V | Bought |
| Brain | ESP32, 30-pin screw-terminal board | Bought and tested |

## Costs

- 32 bought parts: **461,900 won** (thrusters + sonar = 43%). Planning estimates, not receipts. Owned parts (ESP32, camera, speaker, mic) not counted. Full list in `src/data/research.ts` (`PARTS`).
- 3D printing: **73,610 won** (57,000 estimate for plates 1–12 + 16,610 reprint incl. 3,700 shipping; PETG/PLA, 4 walls, 15–20% infill, supports off).
- **Total ≈ 535,510 won ≈ $380** at 1,400 won/$. EMILY robotic lifeguard ≈ $10,000 (Military.com, 2016), ~25× more; EMILY reaches 25 mph, so this compares price, not ability.

## Build status

Hulls, deck, cabin box and power harness done; waiting on reprinted saddles, the second ESC and two sensors before the first water test.

Done: leak sensor wired + tested · marker servo wired + fitted · pipes cut to 76 cm, cones test-fitted · 5 V converter, fuse holder, four Wago bars · deck drilled (16 holes, paper template) · electronics box bolted to the deck · thrusters (CW + CCW), battery, one ESC arrived.

To do: pay for / receive reprinted saddles + thruster mounts · foam pipe ends, glue cones (epoxy + screws) · fit parts in the box, seal holes with silicone · second ESC, tilt sensor, compass (on the way) · wire thrusters, battery, fuse; write the brain code · first water test (float, drive, thrust on a scale) · add GPS, heat sensor, sonar.

## Limits and next steps

Hull shape caps speed near 1.2 m/s: slow street floods, not fast rivers. We will state only what we measure.

- Thrust is unmeasured — tie each thruster to a scale and record its pull.
- Current limit — test the fastest current the boat holds position against.
- Upgrade path (Level 2) — bigger thrusters (3 to 3.5 kgf each) on a 4-cell battery if needed.
- Costs are estimates — receipts will replace planning prices.

## Sources

- EMILY robotic lifeguard price and speed, Military.com (2016)
- Part prices: the project shopping list (estimates, November 2026)
- Reprint price: print shop checkout total (November 2026)
