# Verification C: share, rail, equip, moto, towing, health (2026 handbook)

Sources: Section 5 (health), Section 14 (share, rail, moto), Section 15 (equip), Section 16 (towing), Appendices A to D, Section 9 (school bus), Section 1 definitions.

## Counts (original rows)
| Chapter | Rows | Verified | Conflict | Not in handbook | Ambiguous | Fixed |
|---|---|---|---|---|---|---|
| share | 59 | 54 | 0 | 2 (#28, #50) | 0 | 4 (2 wrong "why" text, 1 replaced, 1 reworded answer) |
| rail | 23 | 21 | 0 | 0 | 2 (#6, #19 distractor arguably true) | 2 |
| equip | 22 | 21 | 0 | 0 | 1 (#21 overgeneralized) | 1 |
| moto | 20 | 17 | 1 (#13) | 2 (#3, #11) | 0 | 3 |
| towing | 15 | 14 | 0 | 0 | 1 (#12 omitted "single-axle") | 1 |
| health | 15 | 11 | 0 | 0 | 4 (#0, #1, #3, #4 wording/why overreach) | 4 |

Fixes live in src/patch4c.js. New questions (35) in src/q6_c.js. Build passes (664 total with other agents' additions). No build.js edit needed; globs already cover q6* and patch4c.

## Fixes
- share, bicyclist rolling through a stop sign: not in handbook; replaced with "bicycle cannot have a siren or whistle" ("You cannot have a siren or whistle on your bicycle.").
- share, pedestrian death hours: why had wrong order; now "9 p.m. (51), 6 p.m. and 7 p.m. (45)".
- share, driver factor: why cited "improper turning"; handbook says "Disregard traffic signals".
- share, school bus go: "stop arm" not mentioned; now "Do not proceed until the flashing red light... has stopped."
- rail, flashing train logo: distractor "train is approaching" was arguably true ("a train is approaching the area"); replaced.
- rail, stalled car run: distractor "toward the train" clashes with handbook's odd "run toward the approaching train at an angle"; replaced.
- equip, 80 inches: handbook limits clearance lights to "Buses, RVs, and trailers 80 inches or more"; reworded.
- moto, under 18 parent signature: not in handbook; replaced with "same requirements except tests different".
- moto, HB 234 fine waiver: not in handbook; replaced with motorcycle definition ("saddle... not more than three wheels").
- moto, scooter speed: CONFLICT, handbook "posted speed limit greater than 15 mph", not 25.
- towing, 750 lb trailer: Appendix C applies to "single-axle trailer"; question reworded.
- health, vision fail: handbook says CVE form completed by ophthalmologist; reworded.
- health, 65+: handbook says "older than 65", not "every application"; reworded.
- health, doctor/MAB whys: removed claims not in handbook ("cannot restrict", "not just impairments").

## Kept but unsourced
- share#50 flashing yellow school bus lights mean it will stop (true Utah rule; handbook text only covers red lights and snowplow yellow).
- moto#12 under-15 scooter: handbook also allows a course certificate; answer still correct, left as is.

## Added questions (35)
share 6 (Move Over class, Class 3 e-bike age 16, white cane, crosswalk passing, fire block, vulnerable user), rail 5 (one mile sight line, 50 ft parking, RR marking, crossbuck, rusty track), equip 6 (skills test bans parking assist and cruise control, ABS, 600 ft flares, three flares, no flares with explosives, pollution devices), moto 4 (endorsement fee $18.00, scooter 16+, ATV one lane each way, ATV over 50 mph), towing 5 (14 ft height, 65 ft combo, 6 inch right overhang, urban parking exemption, center of lane), health 7 (20/40 vision, FAE, review non-completion, cooling off, cold idling, $1 Out and About, DMV).

## Notes for other agents
- src/patch3.js comment and FIX replaced the "no parking assist or cruise control on the skills test" question claiming the handbook lacks it. The 2026 handbook (Section 15) DOES say it. Replacement still valid; I added the verified question in equip.
- Section 3/4/13 fee tables (chapters outside this scope) are at handbook lines ~650-672; I only used the motorcycle endorsement fee ($18.00).
