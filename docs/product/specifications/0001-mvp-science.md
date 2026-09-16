# 0001 — Quick-cook science, environment and validation

> **Expanded exploration bounds:** [0003](0003-mobile-interaction.md) extends elevation to 8850 m, pressure down to 300 hPa and inversion down to 330 K. Baseline equations/fixtures below remain unchanged; expanded kitchen validation is tracked as backlog work.

**Status:** Mathematical/provenance record for [accepted 0001](0001-mvp.md); not a kitchen-validated recipe.
**Reviewed:** 2026-09-16

This is the canonical mathematical/provenance record. The parent specification owns UI, API sequencing/failure behavior and acceptance criteria. All equations run locally; no source document is fetched to calculate a cook. Environmental APIs supply input data only.

## Evidence chain and its limits

```text
browser coordinates → terrain elevation → weather surface pressure
                              ↓ fallback if weather fails
                        standard-atmosphere pressure
                                      ↓
                         water saturation temperature
                                      ↓
                 egg heating baseline → doneness estimate
                                      ↓
                         timer + illustrated milestones
```

Pressure improves an environmental assumption. It does not validate egg texture, determine actual egg temperature, measure heat transfer at the stove or make the animation a sensor. Keep these confidence levels separate.

### Provider and browser evidence

| Source, inspected 2026-09-15                                                                             | Evidence                                                                                                                                                                                                                                                                                                  | Consequence                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Open-Meteo elevation documentation](https://open-meteo.com/en/docs/elevation-api)                       | `/v1/elevation` returns terrain height using Copernicus GLO-90; documentation requires attribution to Open-Meteo and Copernicus.                                                                                                                                                                          | Use terrain elevation, acknowledge resolution/building/position uncertainty; do not call it measured kitchen altitude.                                                                                |
| [Open-Meteo forecast documentation](https://open-meteo.com/en/docs)                                      | Explicit elevation supports downscaling; `current.surface_pressure` is hPa at the surface, distinct from mean-sea-level pressure. Current conditions are weather-model estimates.                                                                                                                         | Pass elevation into the forecast request; consume surface pressure directly, without another altitude correction. Returned grid coordinates need not equal requested coordinates.                     |
| [MDN browser altitude](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/altitude) | Browser altitude may be null and references the WGS84 ellipsoid.                                                                                                                                                                                                                                          | Use browser latitude/longitude plus the terrain API; do not mix height datums or require GPS altitude.                                                                                                |
| [Open-Meteo terms/privacy](https://open-meteo.com/en/terms)                                              | Free service is for non-commercial use; published limits include 600/minute, 5,000/hour, 10,000/day and 300,000/month. Educational content is listed as an allowed example. Data are CC BY 4.0; API logs may contain coordinates and are retained up to 90 days. Availability/accuracy is not guaranteed. | Suitable for this non-commercial teaching project. Provide attribution, disclose coordinate sharing, request only on demand. Terms rechecked 2026-09-16; no paid account, key or proxy is authorized. |

Research feasibility probe: on 2026-09-15, plain HTTPS GETs with synthetic public example coordinates **52.52, 13.41**, using an `Origin: https://example.github.io` header, returned HTTP 200 and `Access-Control-Allow-Origin: *` for both elevation and current-pressure endpoints. Elevation was 38 m; the pressure response included the requested hPa field and Unix timestamp. No user location was requested or transmitted. This is evidence of endpoint/CORS feasibility **at research time**, not a browser/application/deployed-site test or availability guarantee. Recheck actual browser origin, terms, response fields and device permission behavior before claiming integration works.

Attribution: **Open-Meteo · Copernicus** source/data-license links in About, including [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and [Copernicus DEM provenance](https://doi.org/10.5270/ESA-c5d3d65). Keep attribution available for altitude-derived results too. Describe the app's pressure-to-time transformation. Source code remains under the repository license; external data terms are separate.

## Inputs and environmental conversion

Supported computation bounds: integer mass **40–90 g**, integer starting temperature **2–30 °C**, finite pressure **300–1100 hPa**. Terrain fallback accepts **−500…8850 m**. These are bounded product inputs, not an experimentally proven kitchen envelope. UI presets and EU mass classes are specified in 0001; 8 °C is the selected fridge preset, 20 °C room. An egg's actual initial temperature may differ, even when the surrounding air matches.

### Altitude-only fallback

Use the lower-atmosphere relation from the [U.S. Standard Atmosphere 1976, equation 33a](https://www.ngdc.noaa.gov/stp/space-weather/online-publications/miscellaneous/us-standard-atmosphere-1976/us-standard-atmosphere_st76-1562_noaa.pdf):

```text
p_hPa(h) = 1013.25 × (1 - 0.0065 × h / 288.15)^5.25588
```

`h` is meters, 288.15 K standard sea-level temperature, 0.0065 K/m lapse rate; the exponent is the rounded standard dry-air exponent. Treating terrain height as geopotential altitude is an engineering approximation at these bounds. This is **standard weather**, not current weather. When neither API provides usable location-derived conditions, use 1013.25 hPa explicitly labeled Standard; never silently label it local. With valid weather surface pressure, this fallback equation must not be applied at all.

### Pressure to boiling temperature

Use the saturation-pressure correlation in [IAPWS SR1-86(1992)](https://iapws.org/technical-guidance/release/Supp-sat), also reproduced with constants in the [NIST-hosted water-properties review, equation 3 and Tables 1–2](https://tsapps.nist.gov/publication/get_pdf.cfm?pub_id=935265):

```text
Tc = 647.096 K          pc = 22.064 MPa
u = 1 - T/Tc
ln(p/pc) = (Tc/T) × (
  a1 u + a2 u^1.5 + a3 u^3 + a4 u^3.5 + a5 u^4 + a6 u^7.5
)
a1 = -7.85951783        a2 = 1.84408259
a3 = -11.7866497        a4 = 22.6807411
a5 = -15.9618719        a6 = 1.80122502
p_MPa = p_hPa × 0.0001
Tw_C = T_K - 273.15
```

Invert this monotone relation by 48 bisection iterations on **330…380 K** for the supported pressures. If computed saturation pressure is below requested pressure, increase the lower bound; otherwise decrease the upper. Return the bracket midpoint. Check finite inputs and sign bracket; never clamp unsupported pressure or silently substitute 100 °C. These iteration/bracket choices are engineering convergence controls. Require inversion error below 0.00001 °C against a tighter reference solve. Keep full computed `Tw` in the egg formula, round only display values.

The correlation applies to pure water along the liquid-vapor saturation boundary; the MVP uses a narrow part around atmospheric boiling. An unpressurized saturated-steam environment has that same saturation temperature, but this does **not** establish the same surface heat-transfer rate as immersion. No dry-steam, air-rich poorly heated enclosure, sealed pressure vessel or cold-start prediction.

Why not just Antoine: the inspected [NIST Antoine table](https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=4&Type=ANTOINE&Plot=on) gives fit-specific validity intervals, several ending at 373 K. The selected pressure range includes boiling above that. The six-coefficient saturation relation avoids silently extrapolating those fits or stitching incompatible ranges. It adds arithmetic, not a service/library dependency.

## Egg heating model

Retain the homogeneous-sphere solution in Williams's [Boiling an Egg derivation, equations 7 and 11–16](https://www.newton.ex.ac.uk/teaching/CDHW/egg/CW061201-1.pdf). Assumptions: uniform initial temperature, constant material properties, instantly imposed constant surface temperature. The modeled yolk boundary is at fractional radius `x=0.69`.

```text
M = shell-on mass in grams      Ti = initial egg °C
Tw = pressure-derived boiling °C
Tb = 63 °C, soft-baseline boundary endpoint
c = 3.7 J/(g·K)                ρ = 1.038 g/cm³
K = 0.0054 W/(cm·K)            x = 0.69

a = (3M/(4πρ))^(1/3)           [cm]
τ = cρa²/K                    [seconds]
q = t/τ
S(q) = 2/(πx) × Σ[n=1…∞] {(-1)^(n-1) × sin(nπx)/n × exp(-n²π²q)}
Solve S(q) = (Tw-Tb)/(Tw-Ti); tSoft = τq.
```

The material constants are Williams's approximate white properties, attributed there to Polley, Snyder and Kotnour (1980). Those original measurements were not independently inspected. Applying white properties to the whole shell-on egg is a homogenization assumption; shape, shell, air cell, separate yolk properties and changing material state are omitted. Confidence is high in transcription, limited in egg fidelity.

Use 32 series terms, 40 bisection iterations on `q ∈ [0.01,1]`; if `S(q)` exceeds the target ratio, raise the lower bound, otherwise lower the upper. Return the midpoint; reject missing bracket/non-finite results. Require under 0.001 s difference from 64 terms and a tighter solve over mass/temperature boundaries and pressure samples. Tests establish numerical convergence, not cooking accuracy. No general thermal simulator UI is needed.

The previous research retained the full series because Williams's one-term logarithmic approximation applies later than these soft endpoints. At the previous fixed-100 °C cases, its result was about 8.5% shorter at 4 °C and 16.1% shorter at 20 °C. Those historical comparisons explain the decision; 4 °C is no longer the fridge preset. Full-series arithmetic avoids that truncation error without repairing physical model omissions.

## Doneness mapping and animation meaning

| Choice | Seconds before rounding | Intended result                           | Evidence/confidence                                                                                                                                                                        |
| ------ | ----------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Soft   | `tSoft`                 | Tender white, flowing yolk                | Williams's [soft-boil explanation](https://newton.ex.ac.uk/teaching/CDHW/egg/) uses the boundary endpoint near 63 °C, with a tender rather than fully firm white. Kitchen fit unvalidated. |
| Jammy  | `1.5 × tSoft`           | Set white, creamy yolk with softer center | Explicit engineering interpolation; 1.5 is not an experimentally sourced texture constant. Low confidence until trials.                                                                    |
| Firm   | `2 × tSoft`             | Set white/yolk, no flowing center         | Adaptation of Williams's informal double-soft-time hard-boiling rule to this baseline. Low confidence until trials.                                                                        |

Round each result once via `floor(seconds + 0.5)`, after multiplication, not after rounding the baseline. The timer and illustration use those same integer-second S/J/F anchors. There is no claimed Jammy/Firm internal temperature. The matte/opaque shapes are designed illustrations, not solved protein fractions. No correction may be hidden in UI code.

[Ho et al., Foods 2022, section 3.3](https://pmc.ncbi.nlm.nih.gov/articles/PMC9141538/) studied separated yolk with varying temperature/holding times; [Di Lorenzo et al., Periodic cooking of eggs, 2025](https://www.nature.com/articles/s44172-024-00334-w) combine heat transfer, kinetics and cooking trials. These support distinguishing heating from texture, not the app's particular multipliers or steam equivalence. “Scientific” here means traceable assumptions and testable calculations, not an empirically validated outcome already established.

### Cooking conditions, cooling and safety

Quick cook has no quantity/method setup. The calculation describes **one representative egg under a maintained boiling boundary**; a larger batch can cool the pot and has no quantity correction/guarantee. Steam and immersion use the same surface-temperature approximation with zero empirical offset, pending side-by-side validation. The user starts once the egg enters the hot environment; starting after reheating would shift the prediction. Prolonged loss of boiling invalidates the assumed boundary; there is no stove sensor.

No removal-delay or carryover correction. Prompt removal and cold-water cooling remain the reference validation procedure, but the quick UI does not guide them through additional screens. Confirmation is user input, not measured cessation of heating. No post-removal thermal simulation.

Doneness is not food-safety assurance. [FDA guidance](https://www.fda.gov/food/buy-store-serve-safe-food/what-you-need-know-about-egg-safety) recommends firm white/yolk and identifies higher-risk groups. Put concise safety guidance in local info, including that Soft/Jammy are not fully cooked and Firm's estimate is no pasteurization guarantee. The main screen needs the estimate marker, not a permanent explanatory paragraph. Do not claim “safe”, “perfect” or “validated” as completion copy.

## Proposed regression scenarios

Calculated independently with Python standard-library arithmetic during this revision. **Product execution matches these fixtures in automated tests; these are not measured cooks.** Tolerances: boiling temperature ±0.00001 °C; unrounded soft time ±0.001 s; rounded durations exact. These replace the former fixed-100 °C, 4/20 °C default fixtures.

| Mass g | Initial °C | Pressure hPa | Boiling °C | Unrounded Soft s | Soft / Jammy / Firm seconds |
| ------ | ---------- | ------------ | ---------- | ---------------- | --------------------------- |
| 60     | 8          | 1013.25      | 99.974296  | 292.912422       | 293 / 439 / 586             |
| 60     | 20         | 1013.25      | 99.974296  | 245.663600       | 246 / 368 / 491             |
| 60     | 8          | 900          | 96.687039  | 312.851779       | 313 / 469 / 626             |
| 60     | 8          | 700          | 89.931389  | 365.437922       | 365 / 548 / 731             |
| 40     | 30         | 1100         | 102.292241 | 148.599305       | 149 / 223 / 297             |
| 90     | 2          | 600          | 85.925513  | 570.997941       | 571 / 856 / 1142            |

Altitude-only pressure fixtures (±0.001 hPa): −500 m → 1074.775114; 0 m → 1013.25; 1000 m → 898.745625; 4000 m → 616.402126. Weather fixtures must be synthetic and time-controlled, not yesterday's live response.

Under equal conditions, unrounded time scales as `M^(2/3)`. Increasing initial temperature shortens time; decreasing pressure lowers boiling temperature and lengthens time; Soft < Jammy < Firm by the proposal's multipliers. The image must take correspondingly longer/shorter to reach each stage. These are mathematical relationships, not evidence of achieved texture. Ambient weather temperature must never overwrite the user's egg starting temperature.

## Kitchen validation plan — Backlog

The maintainer owns real-world acceptance. Kitchen validation remains separate from solver tests, API probes and visual reviews. Experimental releases may expose the model only while clearly stating that texture is uncalibrated and not food-safety assurance; validated cooking claims require the evidence below.

1. Record egg batch/date, shell-on mass, measured representative starting condition, pot/stove, water volume, lid/steam setup, observed boiling stability, altitude and an independent pressure/boiling-temperature reference where available. Record whether pressure came from weather, altitude fallback or standard. Forecast output alone is not independent validation.
2. For a central 60 g egg, cook all three choices at 8 and 20 °C in immersion and in covered atmospheric steam; repeat each on a second occasion (24 single-egg cooks). Match batch/input conditions across methods. Record insertion, alert, actual removal, approximately one-minute cold-water cooling and opening times. Consistent cut-face photographs classify white as flowing/tender/set and yolk as flowing/creamy/set.
3. Check available small/large eggs near 40/90 g and cold/warm ends 2/30 °C, prioritizing Soft for warm/small eggs and Firm for cold/large. Exact unsupported kitchen endpoints remain Pending; adjacent eggs do not certify them. Test reduced-pressure/high-altitude conditions in a real suitable kitchen before claiming validated accuracy there. Do not propose a home pressure-vessel experiment to manufacture pressure endpoints.
4. Add Jammy removal delayed by +30/+60 seconds, documenting changes and the limits of the post-alert illustration. No automatic personal calibration follows from these trials.
5. Acceptance: repeated central scenarios match intended categories, whites are not flowing, outcomes are useful to the intended user, and no consistent material steam/immersion discrepancy is hidden by the common mapping. If one method or input region fails, revise the mapping, restrict claims or schedule method calibration before claiming validation; do not assert “no difference” or invent an offset. API-adjusted cooking times remain model estimates outside actually tested environments.
6. Store dated results, measurement limits, actual tested bounds and photo provenance in delivery evidence; retain missing evidence as Pending. A small kitchen study cannot establish a statistical success rate or food-safety certification. No tasting is needed to assess cut-face texture.

Highest uncertainties remain the doneness multipliers, varying heat transfer/boiling recovery, actual starting temperature, carryover and texture expectations. Pressure accuracy cannot compensate for those. The [guided mode draft](0002-guided-cooking.md) preserves the earlier proposed detailed water/removal/cooling instructions for later validation and refinement.

## Boiling temperature and texture limits — 2026-09-16

The temperature displayed on Start is `Tw`, the water saturation/boiling boundary from the existing IAPWS inversion, rounded to one decimal; it is not an internal target or sensor reading. Around Everest the standard-atmosphere model gives roughly 314 hPa and 70.2 °C (weather varies). An egg cannot heat above its surrounding water in this model. Reaching a higher internal target would therefore be impossible; approaching the same boundary takes asymptotically long. However, our texture controls are time multipliers, not validated internal-temperature targets.

The primary study [Periodic cooking of eggs, Communications Engineering (2025)](https://doi.org/10.1038/s44172-024-00334-w) models separate yolk/albumen heating and time-dependent protein conversion; it discusses roughly 65 °C for yolk and 85 °C for albumen as different preferred cooking temperatures. This contradicts a simple universal rule that yolk always needs more heat than white. At about 70 °C an egg can cook, but ordinary hard-boiled texture, especially firm whites, is not assured. Protein composition, duration and desired texture matter; this research does not validate the app's high-altitude multipliers or an exact per-preset altitude cutoff.

Product decision: retain exploratory timing and show a short note below 85 °C; explain the limits in About. Do not disable Firm at an invented boundary, label a timer as proof of texture, or call 85 °C a safety threshold. No new physical equation or conversion from texture factor to internal temperature is introduced. Texture now spans 0.75–2.25; anchors 1/1.5/2 stay identical. Above 2 extends cooking time with the category and image clamped at Firm; the UI does not claim additional firmness. Category highlights switch at the anchor midpoints, 1.25 and 1.75; this presentation rule does not change the physics.

### Optional place-name provider

[BigDataCloud's client-side endpoint](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api), [fair-use policy](https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api) and [privacy policy](https://www.bigdatacloud.com/privacy-and-cookie-policy) inspected 2026-09-16. Browser-only, keyless reverse geocoding requires the calling device's current permission-derived coordinates. It supplies a city, with locality fallback; a name is approximate context, never a scientific input. The provider uses coordinate/IP pairings to improve IP location. Requests use the app's rounded coordinates, bounded fetch/abort and no credentials/referrer; never silently fall back to IP geolocation. Name failures must not delay or invalidate elevation/weather. No package, backend or account is added.

Do not send synthetic coordinates to this live client endpoint: its policy excludes third-party coordinates. Automated tests intercept it; the existing synthetic Open-Meteo smoke now blocks this endpoint. Actual browser/device locality lookup remains a separate live acceptance check with the maintainer's real permitted location, without logging or capturing it.
