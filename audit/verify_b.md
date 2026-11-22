# Verification B: speed, freeway, alcohol, conditions, crash, points

Source: audit/handbook-2026.txt (REV 3.2026). Corrections: src/patch4b.js. New questions: src/q6_b.js.
Build edit: build.js now evals q5*/q6* (regex /^q[56].*\.js$/) and patch files like patch4b.js (regex /^patch\d+[a-z]?\.js$/). Other agents' patch4a/4c are picked up by the same glob.

## Counts (existing rows checked)
| Chapter | Rows | VERIFIED | CONFLICT | NOT-IN-HANDBOOK | AMBIGUOUS |
|---|---|---|---|---|---|
| speed | 37 | 35 | 0 | 0 | 2 |
| freeway | 28 | 27 | 0 | 0 | 1 (distractor) |
| alcohol | 34 | 29 | 2 | 3 | 0 |
| conditions | 41 | 41 | 0 | 0 | 0 |
| crash | 29 | 29 | 0 | 0 | 0 |
| points | 24 | 24 | 0 | 0 | 0 |
| Total | 193 | 185 | 2 | 3 | 3 |

(NOT-IN-HANDBOOK counts: 1 fixed, 1 kept, 1 reworded why only. Row 3 below.)

## Fixes (patch4b.js, 9 rows)
1. Speed, ice speed (AMBIGUOUS: 10/25/35/45 all "may be too fast"). Reworded to 10 mph vs "always safe" etc. Section 9E: "icy road at 10 miles per hour ... may be too fast".
2. Speed, "time to slow down" had two near-duplicate wrong options. Replaced one. Section 9E slow-down list.
3. Speed, school zone why line said "when children are present". Now matches "recess, opening or closing hours, or flashing lights".
4. Alcohol, DUI suspension start (CONFLICT, partial). Handbook: "beginning on the 45th-60th day after the date of arrest". Question now asks for 45th to 60th.
5. Alcohol, interdicted card (CONFLICT). Said law starts Jan 1, 2026 and a red NO ALCOHOL SALE banner; handbook says HB 59 effective May 6, 2026 and has no banner. Replaced with "court may require surrender of license" (Section 10H, New 2026 Laws).
6. Alcohol, asleep in driver's seat (risky, NOT-IN-HANDBOOK detail "engine off"). Replaced with handbook wording: "driving or in actual physical control" (Sections 10C, 13E).
7. Alcohol, under-21 first DUI interlock: why cited "handbook's sample question"; now cites Section 10F (3 years if under 21).
8. Alcohol, 0.05 limit: removed unsourced "lower than most states" from why.
9. Freeway, lane change distractor "avoid a slow truck" arguably a reason to pass. Replaced with "check your phone".

## Kept, standard law but not in the handbook text
- Alcohol: "A first DUI in Utah is usually a Class B misdemeanor." Handbook never states DUI class. True under Utah law, kept.
- Freeway: "Missed exit: never back up on the shoulder / U-turn across the median." U-turn ban is sourced (Section 9B); backing up is common law, kept.
- Alcohol: "Medication may make driving unsafe, ask your doctor": handbook only says check medicine labels, some cause sleepiness (Section 11D). Kept.

## Checked and fine (examples)
Speeds 20/25/55/65-80 (9E); 500 ft and 300 ft dimming, 1,000 ft lights, no sunglasses, +2 seconds (11J); hydroplane over 35 mph, black ice (11L); studs Oct 15 to Mar 31, all four tires, bridges freeze first, bleeding tar (11O); work zone double fine (11G); 0.05/0.04 BAC, 120 days / 2 years, 18/36 month refusal, Not-a-Drop 6 months / 2 years, IID 18 months / 2 years / 3 years, 60 day service, 1 year revocation (10B to 10F); $2,500, third-degree felony, 200 to 300 ft flares, SR22 3 years, 30 days registration (12); points 35 to 75 / 80 / 60 / 50 / 40, 200 and 70 thresholds, half after one year, all after two, 50 point course once per 3 years, four hour Move Over class within 90 days (13F, 14).

## New questions: 177 in src/q6_b.js
speed 31, freeway 20, alcohol 27, conditions 44, crash 31, points 24. Each why line names the handbook section. Distractors were rebalanced so the correct option is longest-or-tied in about half the rows.

## Coverage gaps found (now filled)
Speed/night/rural: slow-down list items (intersection, railroad, narrow road, cannot see, loss of control), night scanning, rural limited view, narrow roads, gratings, uncontrolled intersections, gravel, mountain safe-speed sign and gears, work zone color, flagger, barriers, following distance, winter prep (clear windows, snow tires before snow, slippery spots).
Freeway: flex lane signals and lines, C decals ($10, windshield), express pass and toll basis, entrance yielding, exit technique, ramp meter details, white line rule between lanes.
Alcohol: effects (judgment, vision, reaction), drug types, mixing, friend driving, under 21 rules and zero tolerance, no-license Not-a-Drop, Prime For Life, later DUI and refusal penalties, test types, alcohol-restricted duration and lifetime, felony DUI and homicide interlock, interlock violation, impound fees and sale, interdicted card 30 days.
Conditions: drowsiness signs and prevention, flooding, submerged vehicle, hands-free and GPS, distraction prevention, pets, road rage definition, animals, desert, hot and cold weather detail, brakes in freezing weather, skids and hydroplaning, lightning.
Crash: brake failure steps, power failure, blowouts, breakdown steps, steering, ABS, defensive driving stats, crash report release, insurance coverages, SR22 fee.
Points: more point values, hearing outcome range, course vs traffic school, careless and reckless, revocation and suspension reasons, suspended driving penalties, record retention.

## Not added (covered by other chapters)
Continuous flow, diverging diamond, thru U-turn, and single-point interchange already exist in q5_b (signals/rightway). Roundabouts, school bus rules, and pavement markings left to the owners of those chapters.
