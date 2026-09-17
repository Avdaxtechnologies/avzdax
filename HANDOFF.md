# AVZDAX homepage — remaining work

**Repo:** `index.html` at project root. Single file — all CSS in a `<style>` block in `<head>`, all JS in a `<script>` before `</body>`. No build step, no framework. Match this.

**Build 3 new sections. Nothing else.** The CEO brief lists 15; 7 are already done and 5 were cut as padding (see bottom).

## Constraints

- **95% of traffic is mobile.** The page is already 17.3 mobile screens. Each new section must fit ~1 mobile screen. If it doesn't fit, cut copy — don't shrink type.
- Mobile-first CSS. One breakpoint: `@media (min-width: 1024px)`.
- Short declarative sentences. Use the copy below verbatim.
- Commit messages: 2-4 plain words, e.g. `applications section`. Never add AI attribution, `Co-Authored-By`, or "Generated with" lines.

## Design tokens — match exactly

```
Section background     #020202
Heading text           #ffffff
Muted heading line     rgba(255,255,255,0.28)
Body copy              rgba(255,255,255,0.55)
Accent (sparingly)     #00ff41
Card background        rgba(255,255,255,0.022)
Card border            1px solid rgba(255,255,255,0.08)

Headings   'Inter', weight 900, uppercase, letter-spacing -0.02em,
           font-size clamp(27px, 7.2vw, 64px), line-height 1.02
Labels     'JetBrains Mono', weight 700, uppercase, 13px mobile / 15px desktop,
           letter-spacing 0.3em, color rgba(255,255,255,0.82)
Body       'Inter', 17px mobile / 19px desktop, line-height 1.55

Card radius       12px
Button radius     8px   (never pill, never square, never clip-path)
Section padding   104px 22px 92px    mobile
                  172px 64px 150px   desktop
```

Headings use a two-line pattern: line 1 white, line 2 wrapped in `<span>` at 0.28 opacity.

Reveal animation — reuse the existing pattern, don't invent one:

```js
// IntersectionObserver, threshold 0.12, adds .is-visible, then disconnect()
// children: opacity 0 -> 1, translateY(22px) -> none
// transition: .8s cubic-bezier(.16,1,.3,1), stagger .09s
// wrap in @media (prefers-reduced-motion: reduce) { animation: none; opacity: 1; transform: none }
```

---

## Section 1 — Applications

**Place immediately after the existing `<section id="platform">`.**

Heading: `The hour before an incident` / `<span>is where we work.</span>`

Four cards, each a label plus one scenario:

- **Perimeter** — A vehicle circles a facility three times over two days. Individually, three ordinary passes. Correlated, it is reconnaissance — flagged before the approach.
- **Cargo in motion** — A truck stops 4km off its cleared route at 02:40. Speed, geofence and driver behaviour combine into a hijack alert while the load is still recoverable.
- **Facility access** — One credential is used at two doors 900m apart within 90 seconds. The badge is cloned, and the system knows before the second door opens.
- **Power continuity** — The grid drops at a remote site. Arclight holds the chain live, so the blind window attackers rely on never opens.

## Section 2 — Why AVZDAX

**Place after the existing industries/sectors block, before the closing CTA.**

Heading: `Others sell you hardware.` / `<span>We own the whole chain.</span>`

Four cards:

- **Built here, for here** — Engineered in Nigeria for Nigerian conditions: unstable power, dust, heat, thin bandwidth. Not imported kit adapted after the fact.
- **One vendor, one chain** — Sensing, prediction, verification and response are all ours. No integration project, and no suppliers blaming each other when something fails.
- **Sovereign by design** — Critical infrastructure data stays under national control. No foreign dependency on the systems that protect the country.
- **Humans in the loop** — Every prediction is confirmed by our own analysts before it escalates. Machine speed, human judgement.

## Section 3 — The Africa Vision

**Place directly after Why AVZDAX.**

Heading: `Africa should not import` / `<span>its own security.</span>`

Two paragraphs:

> The continent's critical infrastructure — ports, grids, pipelines, banks — increasingly runs on predictive systems built elsewhere, tuned for elsewhere, and dependent on elsewhere.

> AVZDAX is the alternative. Predictive intelligence designed for African operating conditions, owned and maintained on the continent, with the engineering capability kept here.

Closing line, larger type, centred: **Predict. Prevent. Protect.**

---

## Deploy — read carefully, this has already caused a 55-hour outage

Two git remotes exist. They are not interchangeable.

```
deploy  ->  Avdaxtechnologies/avzdax    <- Vercel builds THIS. Production.
origin  ->  ayobamizenthos/avzdax       <- personal copy. Deploys nothing.
```

`main` now tracks `deploy`, and `deploy` pushes to both repos, so a plain `git push` is correct. **Do not push to `origin` only** — it reports success while production stays unchanged.

## Verify before calling it done

- Test on **`https://www.avzdax.com`** only. Never `avzdax.vercel.app`.
- `avzdax.com` returns **307 -> `www.avzdax.com`**. Use `curl -sL`; without `-L` you get a 15-byte redirect body and every grep gives a false pass.
- Check 390x844 and 1440x900: zero console errors, zero horizontal overflow (`scrollWidth === clientWidth`), reveal animations fire, all buttons 8px radius.

---

## Deliberately cut — do not build

| Brief item | Why |
|---|---|
| What Predictive Intelligence means | Already demonstrated by the chain section. A definition would restate it. |
| The 9 Intelligence Layers | Invented taxonomy mapping to no real product. Replaced by the actual architecture. |
| Predict -> Prevent -> Protect | A tagline, not a section. Now the closing line of Africa Vision. |
| Intelligence / Research | The whitepaper and newsroom pages already cover this. Link to them. |
| Sectors expanded to 13 | 13 cards is a wall on mobile. Keep the current set and deepen it. |

Net result: ~17 -> ~20 mobile screens, instead of the 30+ the full brief would produce.
