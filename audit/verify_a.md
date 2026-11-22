# Verify A: permit, tests, ready, basic, signs, signals, rightway

Source: audit/handbook-2026.txt (Utah Driver Handbook 2026). All 284 existing rows (old and q5 additions, after patch1-3) were read against the text.

## Counts (existing rows)
| Chapter | Rows | Verified | Conflict | Not in handbook | Ambiguous |
|---|---|---|---|---|---|
| permit | 47 | 47 | 0 | 0 | 0 |
| tests | 34 | 33 | 0 | 1 (fixed) | 0 |
| ready | 36 | 33 | 0 | 2 (fixed) | 1 (fixed) |
| basic | 62 | 59 | 0 | 1 (kept) | 2 (why lines fixed) |
| signs | 38 | 29 | 0 | 8 (kept) | 1 (fixed) |
| signals | 39 | 39 | 0 | 0 | 0 |
| rightway | 28 | 27 | 0 | 1 (kept) | 0 |

No outright conflicts were found. Fixes are in src/patch4a.js (loaded by the existing patchN[a-z] glob).

## Fixes made (src/patch4a.js)
- tests: "About how long does the driving skills test last?" (about 20 minutes) had no support. Replaced with "What may happen if you fail the driving skills test three times?" Handbook 6C: "failure to pass ... in three attempts will result in paying another fee."
- ready: left and right outside mirror rows described a "rest your head on the window / lean right" technique not in the handbook. Left row replaced by the day/night mirror rule (7B: "set for the time of day you drive"). Right row reworded to the handbook rule (7B: "barely see the left and right side of your vehicle").
- ready: "When starting an automatic car" why line said "clutch pushed in". Handbook 8A says only "in P (park) or the clutch is engaged". Why line now cites park only.
- signs: crossbuck row said "yield to any train". Handbook 9I: "train ... is coming and you must stop behind the stop line." Answer now follows the handbook wording.
- basic: left turn and right turn lane rows. Why lines now cite 8C "finish your turn in the lane that corresponds to the one you started from". Note the handbook's left-turn parenthetical ("far-left lane (the lane closest to the curb)") is garbled, so the answer text was left as is.

## Kept but not sourced in the handbook text (standard law or MUTCD)
- basic: "stop before the sidewalk when driving out of an alley, driveway, or building" (standard Utah law; handbook only says yield to public road traffic).
- signs: pentagon shape for school signs; red circle with white bar for Do Not Enter; WRONG WAY sign meaning (handbook mentions the signs only at interchanges); white H on blue for hospital; octagon is STOP and downward triangle is YIELD (shape text is MUTCD; handbook shows pictures only); brown signs for parks and recreation (handbook says only "points of interest"); bicycle crossing action to take (handbook lists the sign only). Visual-backed rows are supported by the sign images in the PDF, which pdftotext cannot show.
- rightway: yielding to traffic when pulling away from a parallel parking space (standard law; handbook 8D says only check traffic and signal).
- signals: yellow vs white centerline meaning rests on the 9D figure captions ("Two direction roadway", "One direction roadway"), which text extraction does show.

## Coverage review and additions (src/q6_a.js)
126 new verified rows (each why line cites its handbook section). permit 33, tests 20, ready 11, basic 34, signs 11, signals 12, rightway 5 (the 126 total; figures computed from the file). Correct answer is strictly the longest in 42 of 126 (33%).

Gaps found and filled:
- permit: 6-month permit test validity (12 months), expired permit retest, limited-term license, DPC expiry and no temporary card, Class D 26,000 lb limit, endorsement codes Z and N, restrictions B, G, 7, Driver License Compact and NRVC, passport and SSN document proof, driving experience proof, out-of-state license surrender, duplicate and replacement rules, good driver program, military 90 days, expired license retesting, CDL 30 day address change, ID card residents only, farm tractor exemption, unsettled warrants, DMV vs DLD, appointments priority, returned check fee, fees ($19, $39).
- tests: vehicle checklist items not yet asked (turn signals, window, windshield, doors, passenger seat, clean vehicle), who may accompany you, appointment only, examiner conduct, lane changes, post-test discussion, practice after failing, scoring items, handbook as test source, eye test, CVE form, third-party tester status, weather, three failed skills tests.
- ready: seating posture, ages 8 to 12 restraint, air bag purpose and child safety, per-passenger citations, under-16 stops, belts at any speed, 500 children statistic, starting procedure, belts and control.
- basic: backing details, lane integrity, gore area, zipper merge use, not stopping in intersections, signal timing, parking prohibitions (sidewalk, 75 ft, 30 ft pedestrian area, colored curbs), hill and parallel and angle parking steps, passing steps, signaling, rolling stops, turn lane exits, two and three-point turns, city U-turn laws.
- signs: regulatory and guide sign roles, barriers, short-term signal, work zone conduct, railroad crossing conduct (train clearing, gates, stop line).
- signals: green light, stranded red left arrow, traffic controls list, pavement markings role, continuous flow intersection details, single-point interchange details, diverging diamond purpose, flex lane signals.
- rightway: pedestrian half-road rule, pedestrians near parked vehicles, backing, bike lane use, 500 ft from fire vehicles.

Not added (belong to other chapters or too trivial): speed limits, freeway and carpool rules, school bus stopping, move over law, alcohol, Section 5 health content beyond vision, top-five crash causes.
