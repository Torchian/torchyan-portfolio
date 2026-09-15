# ADR-0001: Sound system

**Status:** Accepted
**Date:** 2026-09-14
**Deciders:** Stepan Torchyan

## Context

The site is getting sound effects for four kinds of moment:
- hover
- focus and active states
- fade-in and fade-out animations
- random motion

The first one is the header link pill: its green glow slides to the hovered link.

What shapes the design:

- **Frequency.** Hover sounds can fire several times a second, on pages that already have a tight frame budget (scroll-driven reveals, backdrop filters).
- **Latency.** A hover sound that starts 50–100ms late feels broken.
- **Autoplay policy.** Browsers keep audio locked until the visitor presses, taps or types.
- **Choice.** Some visitors don't want sound, so it needs a visible on/off control that remembers the choice.
- **Existing code.** The repo had an unused scaffold: a React context, a Zustand flag and no audio files. The flag was never read back on load, and sound was switched off by reduced motion.

## Decision

A small Web Audio engine in `src/lib/sound`: a module singleton, no dependency, and no React state on the play path.

| File | Role |
|---|---|
| `sounds.ts` | Cue registry: each moment's file, channel, level, cooldown, voice cap, pitch and level variation, and whether it pans. Also the channel levels (hover, interaction, transition, ambient) under a master. |
| `engine.ts` | Unlocking, loading, the mix graph, `playSound`, and the on/off preference. |
| `triggers.ts` | `soundTriggers({ hover, focus, press, animation })` data attributes, served by delegated document listeners. |
| `provider.tsx` | `<SoundProvider />`, mounted once in the root layout. It renders nothing. |
| `hooks.ts` | `useSoundEnabled()`, which reads the preference through `useSyncExternalStore`. |

How it behaves:

- **Two ways to fire a sound:**
  - `playSound(cue, { origin })` from code, for JS-driven motion such as the nav glow.
  - Attributes on an element, for CSS states and animations. These also work in server components.
- **Loading is lazy:**
  - Files download when the browser is idle, and only while sound is on.
  - The AudioContext is created on the first press or key with sound on.
  - Plays before then are dropped, not queued.
- **Playback is low-latency:**
  - Each file is decoded once.
  - Its leading silence is measured once (up to 100ms below −40 dBFS) and skipped on every play.
- **Cost stays bounded:**
  - A per-cue cooldown and a voice cap stop fast sweeps from stacking; the oldest voice fades out in 30ms.
  - The context suspends while the tab is hidden or sound is off.
- **The preference** is off by default and stored in `localStorage` under `sound` (`on` / `off`). Browsers block audio until a gesture anyway, so an "on" default would show an on icon over a silent page; the visitor's first tap on the toggle both turns sound on and unlocks audio. It isn't tied to reduced motion, because sound isn't motion; cues attached to animations that reduced motion disables never fire anyway.

## Options considered

### A: Custom Web Audio engine (chosen)

| Dimension | Assessment |
|---|---|
| Complexity | Medium: a few hundred lines |
| Cost | No dependency |
| Performance | Sample-accurate starts; a play creates 2–3 short-lived nodes; no re-renders |
| Scalability | A new sound is one registry entry plus an attribute or a call |

**Pros:** lowest latency, and full control over panning, detune, voice stealing and suspending.
**Cons:** we own the browser quirks (unlocking, iOS interruptions).

### B: Howler.js

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | About 10 KB gzipped |
| Performance | Good on Web Audio, with an HTML5 Audio fallback |
| Scalability | Needs our own cue, cooldown and channel layer on top |

**Pros:** mature, and handles unlocking.
**Cons:** its main extras (sprites, HTML5 fallback, format negotiation) aren't needed here, and it has no mix buses without extra wiring.

### C: An `HTMLAudioElement` per sound

| Dimension | Assessment |
|---|---|
| Complexity | Low |
| Cost | No dependency |
| Performance | Tens to hundreds of ms start latency, no overlap control, no panning |
| Scalability | Poor at hover rates |

**Cons:** fails the latency requirement.

### D: Keep the React context and store scaffold

**Cons:**
- A context value change re-renders the provider's whole subtree.
- The stored preference was never read back.
- Sound was coupled to reduced motion.

The scaffold was removed.

## Trade-off analysis

Howler would save the unlocking code, but it adds weight and we would still write the cue, cooldown and channel layer ourselves. HTML audio fails on latency. The job is small (short one-shot cues, no music or streaming), so a custom engine stays small too and keeps the play path free of dependencies and React.

## Consequences

- Adding a sound means a registry entry plus an attribute or a `playSound` call. Components never reference files.
- The mix is tuned in one place, `sounds.ts`.
- Hover sounds stay silent until the visitor first clicks, taps or presses a key. This is the browser's rule, not a bug.
- Hover cues never fire on touch devices.
- We maintain the Safari and iOS handling. The unlock listeners stay attached so an interrupted context can restart.

## Action items

1. [x] Engine, cue registry, delegated triggers, provider and `useSoundEnabled`.
2. [x] Sound toggle: before Contact Me above 1024px, and a row in the menu panel at 1024px and below. It's provisional until it's designed in Figma.
3. [x] First cue: `navLine`, a swoosh as the header glow moves on hover.
4. [ ] Cues for focus, press, fade-in/out and random motion, once the assets arrive.
5. [x] Toggle rebuilt to the Figma Sound CTA (3690:10694). Its place in the header is still to be designed.
