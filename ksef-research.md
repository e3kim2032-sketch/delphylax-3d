# KSEF Research — Delphylax (formerly Floodscout)

> Extracted on 2026-11-12 from `~/Downloads/Floodscout_KSEF.pptx` (13 slides) and
> `~/Downloads/delphylax_brain/delphylax_brain.ino`. This file is the single source
> of truth for every number on the website (`src/data/research.ts`).

## Team & competition

- **Eddie Kim** · Chadwick International · KSEF 2027 (also entered in the Conrad Challenge)
- Project rename: Floodscout → **Delphylax** (Latin: *Dolphin Guardian*)
- One-liner: an insect-inspired amphibious robot that finds survivors in flooded underground spaces

## Problem statistics

- **Seoul, August 2022** — heaviest rainfall in **115 years** (since Seoul began keeping weather records)
- **3 lives** lost when water trapped a family inside their semi-basement home
- “The water came in faster than they could get out, and no one outside could see in.”
- Monsoon rains flood Korea every summer from **late June to early August**
- Sources: AFP / The Journal (2023); Al Jazeera (2023) citing the Korean government; Korea JoongAng Daily (2024); Korea Herald (2023)

### Why flooded underground spaces are so deadly

1. Water rises in minutes — underground spaces fill from above, faster than people can climb out
2. Total darkness — power is usually cut
3. Hidden dangers — murky water hides debris, holes and live electricity
4. Rescuers go in blind — no one can tell who is inside, or if it is safe to enter

### The gap

| Option | Pros | Cons |
|---|---|---|
| Send a rescuer in | — | Puts another life at risk; can't see in dark, muddy water; slow to search safely |
| Professional robots | Keep people out of danger | Expensive, so few teams have them |
| Delphylax | Goes in first, no one at risk; walks **and** swims | About **₩100,000** to build |

## Hardware

- **Insect-inspired whegs** — 5 curved legs walk over rubble and paddle through water
- **Sealed floating hull** — fully 3D printed and waterproofed
- **Thermal camera** — finds people by body heat, even in darkness
- **Light + live video** — streams to a rescuer's phone
- **Drives itself** — avoids obstacles; switches walk/swim automatically (water sensor)
- Firmware (`delphylax_brain.ino`): steering servo on **GPIO 18**, pulses of **1000 / 1500 / 2000 µs**, 20 ms period (ESP32-class controller)
- Build cost ≈ **₩100,000** (≈ $70)

## Design iterations

| Version | Change | Problem it fixed |
|---|---|---|
| V1 | Catamaran | Rear skid dragged on land |
| V2 | Sleek hull + whegs | Hull would scrape between steps |
| V3 | 5 longer legs | Hull stays off the ground |
| V4 | Thermal + lights | Ready for dark, real-world rescues |

### The math that changed the design

```
lowest lift = leg length × cos(180° / legs)
```

- The axle sits **46 mm** above the hull bottom, so the lift must exceed 46 mm
- V2: **−21 mm** (hull drags) · V3: **+6.6 mm** (hull clears)
- Calculated before printing, which saved a failed **20-hour** print

## Test protocol — mock flooded room (results due December 2026)

Setup: murky water + floating debris · lights off · a warm “victim” hidden inside · obstacles and a step out of the water

| Test | Measure |
|---|---|
| Obstacle avoidance | Successes out of 20 runs |
| Land to water | Mode switch success rate |
| Finding a person | Detection distance in the dark |
| 4 vs 5 vs 6 legs | Speed and step-climbing height |

## How a rescue would work

1. Placed at the edge — a rescuer sets it down at the entrance
2. Walks in — whegs climb over debris on land
3. Senses water — water sensor triggers swim mode
4. Scans for heat — thermal camera looks for people
5. Rescuers decide — live view shows who is inside and where

## Next steps

- Tether for signal through concrete and easy retrieval
- Self-righting hull and tougher waterproofing
- Feedback from firefighters (119) on real needs

## Biomimetic sonar template (Delphylax extension)

*Inia geoffrensis* (Amazon river dolphin) echolocation, from Ladegaard et al. (2015), *J. Exp. Biol.* 218: 3091–3101:
click duration ≈ **14 µs**, inter-click interval ≈ 35 ms (**30+ clicks/s**), centroid frequency ≈ **95 kHz**,
−10 dB bandwidth ≈ 44 kHz, source level ≈ 190 dB re 1 µPa pp (vs ≈ 220 dB for oceanic delphinids).
Range resolution at 1480 m/s ≈ c·τ/2 ≈ **1 cm**. Design range target: **15 m+** in turbid water (optical cameras ≈ 0.2 m).
