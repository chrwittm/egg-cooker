# Egg Cooker

Choose **S / M / L / XL** (50/60/70/80 g), then fine-tune the grams if needed. Choose **Fridge (8 °C)** or **Room (20 °C)** and adjust the temperature slider to the egg's actual starting temperature. Tap **Soft / Jammy / Firm**, or drag within the same rail for very soft or an in-between texture. Soft, Jammy or Firm stays highlighted while you drag, switching halfway between the preset anchors. Beyond the Firm anchor, time extends while Firm remains selected. Size and texture anchors align directly above the thumb. Fresh defaults are **M / Fridge / Soft**. Fridge stays highlighted at 4–8 °C, Room at 20–24 °C. Start shows the estimated time and water boiling temperature; the egg below the inputs previews your target and grows with its mass. The layout stays one phone-width column on desktop too.

Put the egg in boiling water or saturated steam in an ordinary covered, unpressurized pot, switch off **Options → Demo** for a real timer, then tap **Start**. Maintain the boiling environment. Watch the countdown and illustrated egg; at **Ready**, take the egg out and tap **Stop timer**. The result stays on screen; **Cook another egg** returns to configuration. The illustration continues toward Firm while the timer is overdue. It is not a measurement of the egg or a food-safety guarantee.

**Back** immediately ends a cook and keeps the input settings. The egg keeps heating if it remains in the pot. Back at Ready returns directly to configuration. Stop timer freezes the overdue time and illustration and silences reminders. It ends the timer; it is not a pause. There is no preparation checklist or cooling screen in quick cook.

## Location data

Tap **Use location** once to request terrain elevation and current weather surface pressure. About explains that rounded coordinates go to Open-Meteo for conditions and BigDataCloud for an optional city/locality name, and that automatic refresh is remembered. There is no app confirmation dialog; the browser may still ask permission. On later visits, lookup runs once automatically only if the saved preference is on and the browser reports permission already granted. Otherwise use the **Refresh** action. During refresh, the current values and estimate stay visible until the lookup completes. Progress appears only after 800 ms. Failed or timed-out requests show the standard/altitude fallback and an explanation; cancelling a lookup keeps the current values. Sliders never request location. Turn off **Refresh location automatically on visits** in About to remove the preference. If preference storage or permission inspection is unavailable, the manual action still works.

- **Standard · 1013 hPa:** unadjusted standard pressure.
- **Altitude estimate:** pressure estimated from the selected elevation or a location fallback.
- **Local:** weather-model surface pressure, not a kitchen sensor. When available, the city/locality replaces “Local” on the same line as pressure; it is approximate and never saved. A slow or unavailable name does not delay the weather result.
- **Adjusted pressure:** your manual surface-pressure value.

Slide **Elevation** (−500–8850 m) to set estimated local pressure, then fine-tune **Air pressure** (300–1100 hPa) if desired. Changing elevation resets the pressure estimate; location fills both using current conditions. The calculation uses local surface pressure once, without an additional altitude correction. Extreme-altitude estimates are exploratory and unvalidated. Below 85 °C the app flags uncertainty about texture. Near Everest, water boils around 70 °C: an egg can cook, but the normal firm result is not assured. The temperature on Start refers to the water, not the inside of the egg; there is no validated altitude cutoff for each texture. Source/time details, data sharing and Open-Meteo/Copernicus/BigDataCloud credits remain under About. In Safari on Mac, **Settings → Websites → Location → Allow** for this site can retain access; on iPhone, use this site's Website Settings. Permission lifetime and operating-system prompts belong to Safari; the app cannot override them. See [Apple's site settings guide](https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac).

Lookup failures leave a clearly labeled fallback. Manual edits cancel a pending lookup. Starting during lookup uses the displayed conditions and stops the lookup. If weather expires at Start, **Conditions updated** appears; review the revised estimate and tap Start again.

## Sound, recovery and demo

The bell requests sound by default. Start plays a quiet activation cue. The final ten seconds tick once per countdown second. At Ready, a clearer three-tone alarm repeats every two real seconds until Stop timer, Cook another egg, Back or mute. Demo skips ticks as needed to avoid rapid bursts; missed sounds are never replayed. The bell mutes immediately or re-enables/tests sound. **Sound unavailable** does not stop the timer.

Keep the page visible and the device awake for the best chance of hearing it. Browsers can suspend execution and audio; background/locked-device alarms are not guaranteed. On returning, the clock catches up to elapsed time.

A real active timer is saved only in this tab's `sessionStorage`. Reload shows **Recovered · Still cooking?**, the current countdown/overdue time, and sound off. **Yes** continues; **Done** finishes. Invalid records require **Discard**, timers at least 24 hours old show **Old timer**, and a backward/invalid clock shows **Time uncertain** without guessing a new target. **Recovery unavailable** means storage failed; an older timer may reappear after reload if deletion also failed. Stop timer, Cook another egg and Back remove the active record without erasing unrelated data. A stopped result remains only in memory and is not recovered after reload.

**The experimental release defaults Demo on**, starting at **1×**. During cooking, choose **1× / 10× / 20× / 50× / To end**. The clock automatically returns to 1× at Ready; you can accelerate again to explore overdue cooking. Demo is never saved. Your selected mode remains for the next egg; a fresh page without a recovered real timer defaults to demo. Switch off **Options → Demo** for a real timer, which cannot accelerate. Restored real timers always remain real.

## Access and limits

Use Tab for controls, arrows/Home/End on sliders, including the texture rail. Preset labels are buttons; Enter or Space selects them. Dialogs retain keyboard focus; Escape dismisses them. A dismissed invalid-record dialog leaves a Discard action and keeps Start disabled. Reduced motion displays the latest reached illustration stage without transitions. The countdown is readable but never announced every second.

The fully loaded timer works without a network connection. Offline reopening, installation, accounts, history and cross-device recovery are not implemented. Units are grams/Celsius and sizes use EU categories. English UI only.

The model's doneness mapping and shared steam/immersion approximation are not kitchen-calibrated. Soft/Jammy are not fully cooked; Firm is no pasteurization guarantee. Detailed assumptions, safety limitations and credits are under **About this timer**. Version 0.1.0 is an experimental release without broad actual-device certification; kitchen validation and additional device evidence remain [backlog](planning/backlog.md) work.
