# Permit Quest coverage matrix

Handbook used: Utah Driver Handbook, current file on dld.utah.gov/handbooks is `Driver-Handbook-2026.pdf` (lists SB 22, HB 128, HB 381, HB 59 effective May 6, 2026). The text of `Driver-Handbook-REV-3.2026.pdf` (cover edition 2025-2026) was used for most section-by-section facts. No "2026-2027" edition exists on dld.utah.gov as of 2026-11-22.

Counts: existing = q1..q4 (241), new = src/q5_*.js. Corrected = rewritten in src/patch3.js.

## Totals by chapter

| Chapter id | Name | Before | New | After |
|---|---|---|---|---|
| permit | Permits & Licensing | 16 | 31 | 47 |
| tests | Tests & Paperwork | 14 | 20 | 34 |
| ready | Get Ready to Drive | 13 | 23 | 36 |
| basic | Basic Driving | 20 | 42 | 62 |
| signs | Road Signs | 19 | 19 | 38 |
| signals | Signals & Markings | 18 | 21 | 39 |
| rightway | Right-of-Way | 13 | 15 | 28 |
| speed | Speed & Visibility | 14 | 23 | 37 |
| freeway | Freeways & Merging | 14 | 14 | 28 |
| alcohol | Alcohol & Drugs | 14 | 20 | 34 |
| conditions | Distractions & Weather | 15 | 26 | 41 |
| crash | Crashes & Insurance | 14 | 15 | 29 |
| points | Points & Penalties | 9 | 15 | 24 |
| share | Sharing the Road | 23 | 36 | 59 |
| rail | Railroads & Light Rail | 13 | 10 | 23 |
| equip | Equipment & Towing | 12 | 10 | 22 |
| moto (new) | Motorcycles & Small Vehicles | 0 | 20 | 20 |
| towing (new) | Towing & Warning Devices | 0 | 15 | 15 |
| health (new) | Health, Vision & Appendices | 0 | 15 | 15 |
| **Total** | | **241** | **390** | **631** |

## Handbook section to questions

| Handbook section / topic | Existing chapter (count) | New questions | Notes |
|---|---|---|---|
| 1 Definitions (provisional, CDL, roundabout, blind spot, head check, careless driving) | permit, basic, conditions | 5 | Bicycle wheel size, careless driving, CDL weight, blind spot, head check |
| 2 Licensing requirements (residency, visitors, who may not be licensed) | permit (1) | 5 | Residency, 6-month visitors, out-of-state permit, suspended elsewhere |
| 3 Driver ed hours, permit, supervision, GDL limits | permit (12) | 14 | Classroom hours by school type, 18-month permit, front-seat rules by age, midnight to 5 a.m., passenger limit, SB 22 and HB 308 (existing + new) |
| 4 License types, documents, renewal, address, DPC | permit (3) | 12 | Residency proofs, birth certificate, name change, 8 and 5 year terms, renew 6 months early, endorsements, DPC |
| 5 Vision and health | tests (1) | 9 (health) | Doctor statement, 65+, reporting, review exam, stress, medications |
| 6 Examinations (written, skills, auto-fail, checklist) | tests (14) | 20 | Two per day, retests, Trends exam, ages, vehicle checklist, auto-fail items, appointment rules |
| 7 Preparing your vehicle (belts, child seats, mirrors, air bags) | ready (13) | 23 | Car seat heights, crash force, ejection, mirrors, air bag speed, belt course, fire/water myth |
| 8 Basic driving (backing, lanes, parking, passing, steering, turns, U-turns) | basic (20) | 42 | Backing, merges, parking distances, passing, plows, steering, turns, U-turns |
| 9A Flex lanes | signals (1), freeway (1) | 2 | |
| 9B Freeways, express lanes, ramps, SPUI, CFI, DDI | freeway (14) | 14 + 5 (signals) | Access points, express pass, exit one early, ramp meters, SPUI, CFI, DDI, thru-U-turn |
| 9C Intersections | rightway (4) | 8 | Four-way stop variants, cyclists, pedestrians |
| 9D Pavement markings, crosswalks, center turn lane | signals (7) | 8 | Dashed/solid combos, unmarked crosswalk, stop locations |
| 9E Speed | speed (14) | 23 | Icy road, 55 mph, 65-80 rural, transition zones, school zone, following gap, crash facts, work zone |
| 9F Roundabouts | rightway (4) | 3 | HB 128 question (existing) kept |
| 9H Signals and officers | signals (11) | 8 | Horizontal order, officer override, left-turn types, red arrow |
| 9I Signs and work zones | signs (19) | 19 | Shapes and colors, flagger, END ROAD WORK, number of tracks, bicycle crossing |
| 9J Yielding | rightway (3) | 7 | |
| 10 Alcohol and drugs | alcohol (14) | 20 | 0.02, 0.04 CDL, 45th day, interlock lengths and 60-day service, interdicted, actual physical control, prescription DUI |
| 11 Distractions and challenges | conditions (15) | 26 | Fatigue, floods, sinking car, cold stranded, mountains, gravel, engine failure, stress, trip check |
| 12 Crashes and insurance | crash (14) | 15 | Leaving scene penalty, SR22, 60-day judgment, 30-day uninsured, coverage types |
| 13 Suspensions and record | points (9) | 15 | Point values, point clearing, hearing outcomes, mandatory revocations, NRVC, alcohol-related driving on suspension |
| 14A Bicycles and e-bikes | share (4) | 15 | Bike lane marking, 100 ft rule, hand signals, stop sign rule, e-bike class 1, brake, night gear |
| 14B Emergency vehicles, Move Over | share (4) | 4 | HOV lane stop, belt on, amber in HOV |
| 14C Large trucks and buses | share (3) | 9 | No-zones, stopping distance, wind blasts, NHTSA 71% |
| 14 Motorcycles and mopeds, scooters, ATVs | share (4) | 21 (moto + share) | Endorsement, helmet, lane filtering, 90 second rule, scooters, street-legal ATVs |
| 14 Pedestrians | share (1) | 5 | Shoulder, crossing guards, stats |
| 14 Trains and light rail | rail (13) | 10 | Radio, TRAX speed, second train, stalled car |
| 14 School buses | share (3) | 4 | Yellow lights, five-lane rule, when to go |
| 14 Slow vehicles, farm, horses, golf carts | share (3) | 2 | |
| 15 Vehicle equipment | equip (12) | 10 | Headlights, plate light, signals, wipers, reflectors, ADAS |
| 16 Towing and warning devices | equip (2) | 15 (towing) | 10 minute rule, 100 ft, 200 ft one-way, 1,000 ft, flares, fires, loads |
| Appendix A organ donation | none | 3 | 8 lives, 75 people, no cost |
| Appendix B identity fraud | none | 2 | |
| Appendix C registration | none | 1 | Trailer under 750 lb (in towing) |
| Appendix D clean air | none | 1 | Idling 30 seconds |

## Known gaps (left out on purpose)

- Fees and dollar amounts (may change yearly).
- CDL material beyond endorsements and weights.
- Details not confirmed in two places: light-rail malfunction one mile sight rule, 75 ft fire station signs, e-bike Class 2 speed wording.
- Hand signals for drivers (the handbook shows only bicycle hand signals as illustrations).
- Express lane C decal (HB 481 repeals the Clean Vehicle Program, handbook text may be stale).
