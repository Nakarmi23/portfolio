---
name: Ankit Nakarmi
description: Freelance solutions architect who builds what he designs, shown as a live system running under simulated load.
colors:
  ground: "#0a0c10"
  raised: "#11141a"
  ink: "#e9ecf1"
  ink-soft: "#9aa3b2"
  ink-faint: "#7c8596"
  rule: "rgba(233, 236, 241, 0.09)"
  rule-strong: "rgba(233, 236, 241, 0.18)"
  steel: "#7d8899"
  signal: "#ffb547"
  signal-ink: "#1a1203"
typography:
  display:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.75rem, 5.6vw, 5.25rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.045em"
    fontVariation: "'wdth' 112"
  headline:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2.25rem, 4.4vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
    fontVariation: "'wdth' 112"
  title:
    fontFamily: "Archivo, sans-serif"
    fontSize: "clamp(2rem, 3vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
    fontVariation: "'wdth' 112"
  subtitle:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.556
  lead:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Archivo, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    fontFeature: "'tnum' 1"
  label:
    fontFamily: "Archivo, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  caption:
    fontFamily: "Archivo, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
  readout:
    fontFamily: "Geist Mono, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.33
  readout-value:
    fontFamily: "Geist Mono, monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  none: "0px"
spacing:
  gutter-sm: "16px"
  gutter-md: "32px"
  gutter-lg: "56px"
  gutter-xl: "80px"
  header: "64px"
  section: "176px"
  section-first: "144px"
components:
  button-primary:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.lead}"
    rounded: "{rounded.none}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.signal-ink}"
  button-primary-compact:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.signal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "10px 16px"
  chip-stack:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.caption}"
    rounded: "{rounded.none}"
    padding: "4px 10px"
  panel-overlay:
    backgroundColor: "rgba(10, 12, 16, 0.85)"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  nav-header:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    height: "64px"
---

# Design System: Ankit Nakarmi

## Overview

**Creative North Star: "The Running System"**

The page shows the architect's real material instead of a metaphor for it: a live three-dimensional architecture taking simulated traffic in the dark. Everything else is the console around that system. A near-black blue ground, off-white type and cool steel greys carry the structure; fine steel linework draws it; one warm sodium-amber signal marks where traffic flows and where the visitor acts. The register is technical and immersive, in the line of linear.app and the stronger developer portfolios, but the immersion is earned by a system that genuinely responds to load, not by atmosphere.

Density is low and deliberate. Large expanded Archivo headlines sit on generous section spacing; long-form reading (decision records, the experience register) runs at 18px with relaxed leading. Geist Mono appears only where a machine is speaking: live readouts and diagram labels. Surfaces are flat, corners are square, divisions are 1px low-contrast rules, and the only light in the world comes from the scene.

The rejected alternatives are on record: the centred SaaS hero and the metaphor-themed portfolio (an earlier transit-map world was discarded for this one).

**Key Characteristics:**
- Near-black blue ground (#0a0c10) with off-white ink and three steps of cool grey.
- One warm signal colour, amber, for traffic and the primary action only.
- Archivo bold at expanded width (wdth 112) for every heading; regular width for body.
- Geist Mono only for live readouts and 3D diagram labels.
- Square corners, 1px low-contrast rules, no shadows, no gradients outside the scene.
- Every simulated number is labelled as simulated.

## Colors

A cold, nearly monochrome blue-black palette with a single warm signal that reads as sodium light on a night grid.

### Primary
- **Sodium Amber** (signal): traffic and the primary action. The particles flowing through the scene, the point light over the services tier, a node label while its part of the system is in focus, the active step's rule in the scroll tour, the "Start a project" buttons, and the load control's fill, thumb and live multiplier. As interaction feedback it also carries the focus ring, text selection, caret and the underline of a hovered link.
- **Amber Ink** (signal-ink): text on amber. Near-black with a warm cast so the button label never reads as cold grey on gold (10.6:1).

### Neutral
- **Night Ground** (ground): the page and the 3D scene's fog. Also the opaque header.
- **Raised Ground** (raised): the one step of tonal lift: the contact section band, table-row hover, the still diagram's node fill.
- **Signal White** (ink): headings, primary text, live readout values, the primary button's hover fill.
- **Soft Steel Ink** (ink-soft): body copy, lead paragraphs, navigation, scene labels at rest (7.7:1 on ground).
- **Faint Steel Ink** (ink-faint): small secondary text: readout labels, table headers, node-role footnotes in the tour, replica counts. Set so 13px text still clears 4.5:1 (5.3:1 on ground, 5.0:1 on raised).
- **Steel** (steel): structure. The edge linework of every node in the scene, hollow markers on decision records and the route, the availability square.
- **Hairline** (rule): the default 1px divider between sections, rows and articles.
- **Strong Hairline** (rule-strong): dividers that must read as an edge: chip outlines, the overlay panel border, the inactive tour rule, the slider track, table header underline, link underlines at rest.

### Named Rules
**The One Signal Rule.** Amber marks traffic and the primary action, nothing else. There is no second accent: status, availability and decoration use steel or ink. If a new element wants colour, it is either part of the flow or it is grey.

**The Faint Floor Rule.** Ink-faint is the lightest text allowed (#7c8596). Never step below it for small text; 13px copy on ground or raised must hold 4.5:1.

## Typography

**Display Font:** Archivo (variable, wdth axis), with sans-serif fallback
**Body Font:** Archivo at normal width
**Label/Mono Font:** Geist Mono, with monospace fallback

**Character:** Archivo stretched to 112% width at bold weight gives headlines a wide, engineered stance, tracked tight so they stay dense; the same family at normal width reads plainly for long copy. Geist Mono is the instrument voice and only appears where the system reports on itself. Body text uses tabular numerals throughout.

### Hierarchy
- **Display** (700, clamp 2.75rem to 5.25rem, 0.94, -0.045em, wdth 112): the hero headline and the contact headline (which runs up to 5.75rem). Balanced wrapping.
- **Headline** (700, clamp 2.25rem to 3.75rem, 1.0, -0.035em, wdth 112): section headings.
- **Title** (700, clamp 2rem to 2.75rem, 1.05, -0.03em, wdth 112): case-study names; scroll-tour steps use a slightly smaller clamp (1.75rem to 2.5rem).
- **Subtitle** (600, 18px): decision-record stations, route stops, register roles, small section heads.
- **Lead** (400, 20px, 1.375): the paragraph under each headline, max 34 to 36rem, in ink-soft.
- **Body** (400, 18px, 1.625): decision-record and tour prose, max 60ch.
- **Label** (400, 15px): navigation, footer, register years, route-stop copy, availability line.
- **Caption** (400, 13px): stack chips, table headers, the load panel's guidance line.
- **Readout** (Geist Mono 400, 12px labels / 15px values): the load panel's live figures. Scene node labels run 11px on small screens, 12px from md up; the still fallback uses 13px.

### Named Rules
**The Machine Voice Rule.** Geist Mono is used only for live readouts and 3D diagram labels. Headings, navigation, buttons, chips, tables and captions are Archivo. Mono on a human sentence is a defect.

**The Wide Heading Rule.** Every heading from title up is Archivo bold at wdth 112 with negative tracking. Body text is never stretched.

**The No Kicker Rule.** No eyebrow or kicker labels above headings. A heading stands on its own; context goes in the lead paragraph below it.

## Layout

A 12-column grid inside responsive gutters (16px, 32px from sm, 56px from lg, 80px from xl). Section intros split headline (columns 1 to 5) from lead paragraph (columns 7 to 12) on large screens and stack below. Case studies keep their summary sticky in the left five columns while the decision record scrolls in the right six.

The first viewport is the full-bleed scene, pinned (sticky, 100svh) while the hero and the scroll tour pass over it. The hero sits bottom-left (max 52rem); the load panel sits bottom-right at 22rem from lg, and below the hero on smaller screens. Tour steps are 80svh tall so the camera has time to frame each part of the system.

Rhythm is generous: 64px fixed header, 144px before the first section after the scene, 176px between later sections, 112px between case studies, 128px above the contact headline. The approach route is a six-up strip at xl, three-up at md, a single column below.

## Elevation & Depth

The interface is flat. Depth belongs to the scene alone: the WebGL camera, fog into the ground colour, a cool ambient light, one white key light and the amber point light over the services. Interface surfaces separate by tone (ground to raised) and by 1px rules, never by shadow. Overlays on the scene (load panel, tour steps) use the ground colour at 85% opacity with no blur.

### Named Rules
**The Recognisable Part Rule.** Every node in the scene is drawn as the object an architecture diagram would use for it, built from simple solids with steel outlines: a fanned crowd of devices for clients, a CDN rack, a cabinet of three regional servers labelled EU, US and AP, for the edge, a router whose screen shows its routing table (GET /orders, POST /auth, GET /search) for the API gateway, 1U rack servers with status lights for services, twin RAM sticks in their slots for the cache, a clear tube of amber messages for the queue, turning gears for workers, and stacked discs for the database. Parts respond to the real simulated traffic, never to a timer: the region server that serves a request lights its status light, the gateway's routing-table row for the route a request takes highlights, a cache read blinks a RAM chip white and a write (a miss filled from the database) blinks it amber, ports blink, messages fill the queue, gears turn faster. The share of arrivals that light up grows with load, so the amount of light reads as how busy the system is. New parts follow the same vocabulary: a recognisable silhouette, no textures, no imported models.

**The Scene Light Rule.** Light comes only from the scene. No box shadows, glows, gradients or blurred glass on interface elements.

**The Opaque Header Rule.** The header is solid ground with a 1px hairline below. It never goes translucent over the scene.

## Shapes

Square corners everywhere (0px), including buttons, chips, panels, the slider thumb and markers. Markers are 11px squares: hollow with a steel 1px border for steps along a path, solid amber for the path's final stop. Lines are 1px: hairlines between rows and sections, a 1px spine down each decision record that extends as it scrolls in, a 1px left rule on tour steps. The slider is a 2px track with a 16px square thumb.

## Components

### Buttons
Direct and solid, one kind only.
- **Shape:** square (0px).
- **Primary:** amber fill with amber-ink text, semibold. Three sizes by context: header (15px, 10px by 16px), hero (18px, 14px by 24px), contact (20px, 16px by 28px).
- **Hover / Focus:** fill turns to signal white over 200ms; pressing nudges it down 1px. Focus shows the global 2px amber outline at 3px offset.
- **Secondary:** there is no secondary button. The alternative action is the email address as an underlined text link (ink-soft, rule-strong underline at 1px, 0.22em offset; ink text and amber underline on hover).

### Chips
- **Style:** stack tags under each case study: transparent, 1px rule-strong outline, ink-soft 13px Archivo, 4px by 10px. Static, never interactive.

### Cards / Containers
- **Corner Style:** square.
- **Background:** ground at 85% over the scene; raised for the contact band.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px rule-strong for the load panel; a single 1px left rule for tour steps (amber when active, rule-strong and 40% opacity when not).
- **Internal Padding:** 20px panel; 20px by 24px tour step.

### Inputs / Fields
- **Load slider:** the only input. 2px track in rule-strong filled with amber to the current value, 16px square amber thumb that scales to 1.25 while dragged, ew-resize cursor.

### Navigation
- Opaque 64px header on ground with a bottom hairline. Name at left (17px bold, wdth 112), section links centred (15px ink-soft, ink on hover, hidden below md), compact primary button at right.

### Load Panel (signature)
The visitor's hand on the system. Title "Simulated load" in Archivo semibold, the live multiplier in amber mono, the slider, then a four-column readout grid (req/s, services, queue, workers) in Geist Mono with ink-faint labels and ink values. A polite live region below explains the control, or names the hovered node and its role. It is only offered when the scene is running.

### System Scene (signature)
Nodes are dark metallic bodies outlined in steel linework on a faint ground grid; amber particles carry requests edge to gateway to services to queue/cache to data. Replicated tiers fan out on damped springs as load rises. Node labels float in Geist Mono, ink-soft at rest and amber while that part is in focus, with replica counts in ink-faint. The world orbits slowly with pointer parallax. Under reduced motion it renders a still frame; without WebGL an SVG of the same graph replaces it (raised squares, steel strokes, rule-strong links) and the load panel is withdrawn.

### Decision Record
Each case study's stations hang on a 1px rule-strong spine that extends as it scrolls in, each marked by an 11px hollow steel square; the final station's square is solid amber. The same marker language runs across the horizontal approach route.

## Do's and Don'ts

### Do:
- **Do** keep amber (#ffb547) to traffic and the primary action; use steel (#7d8899) for status, structure and the availability square.
- **Do** set every heading in Archivo bold at wdth 112 with negative tracking.
- **Do** keep Geist Mono to live readouts and 3D diagram labels.
- **Do** label every simulated figure as simulated, in the control's own title or adjacent copy.
- **Do** divide with 1px rules (rule, or rule-strong where the edge must read) and keep every corner square.
- **Do** reveal section parts once on entry (24px rise, 0.8s, cubic-bezier(0.16, 1, 0.3, 1), 75ms stagger) and leave content visible without script or under reduced motion.
- **Do** keep small text at ink-faint (#7c8596) or brighter.

### Don't:
- **Don't** add a second accent colour, including a green "available" dot.
- **Don't** put eyebrow or kicker labels above headings.
- **Don't** use Unicode glyphs as icons (arrows, checkmarks, stars, bullets as decoration). Use inline SVG or nothing.
- **Don't** make the header translucent or blurred.
- **Don't** round corners.
- **Don't** add box shadows, glows, glass blur or decorative gradients; light comes only from the scene.
- **Don't** show an unlabelled metric. Numbers on this site are simulated unless they come from real, cited work.
- **Don't** use mono for headings, navigation, buttons or body copy.
