---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: []
---

# Landing page (/)

Mode: Experience (changed from Persuade on 2026-10-22: the page is a portfolio, not a sales page). Primary visitor: peers, hiring managers and recruiters arriving from LinkedIn, GitHub or a résumé. Job: see what Ankit has built and how he thinks. Freelance clients are secondary and get one quiet line beside the contact links; there is no call-to-action button.

Proof: case studies (placeholders until Ankit supplies content), work history, contact links. No metrics, logos or testimonials exist. Anything the hero simulates is labelled as a simulation.

Unresolved: real case-study content, email/LinkedIn/GitHub URLs, availability wording, résumé PDF.

History: the Network Map world shipped first and was rejected as too simple. Three direction rounds of metaphor-led worlds were all re-rolled. The user then pinned the direction below.

## Direction contract

THESIS: Show the architect's real material, a running system, instead of a metaphor for it. The hero is a live 3D architecture under simulated load that the visitor can explore and stress. It refuses both the centred SaaS hero and the metaphor-themed portfolio.

OWN-WORLD: A near-black blue ground (#0A0C10) with off-white type and cool steel greys. Structure is drawn in fine steel linework. One warm signal colour (sodium amber) is reserved for traffic. Archivo in an expanded width for display; Geist Mono only for live readouts and diagram labels. 1px low-contrast rules, square corners, light comes only from the scene.

STORY: The visitor sees a system take traffic and scale out under their hand, reads that the person behind it designs and ships such systems, walks the case-study decision records and work history, and finds the contact links at the end.

FIRST VIEWPORT: The full-bleed WebGL scene, slowly orbiting with pointer parallax. Requests (amber particles) flow edge → gateway → services → queue/cache → data. Bottom-left overlay: Ankit's name as the headline (about 88px expanded), one plain sentence on who he is and his current role, then the email (copyable), LinkedIn and GitHub as text links. Bottom-right: a 'Simulated load' control (1×–50×) with live replica and queue readouts in mono, labelled as a simulation. A thin header strip sits on top.

FORM: User-pinned direction "Technical & immersive" (references: linear.app, Awwwards developer portfolios). It overrides the roll; seed:9097a9121d686438. Signature interaction: dragging the load control makes services autoscale (replicas fan out with damped motion), the queue absorbs bursts, and hovering a node names its role and the capability behind it. Motion grammar: continuous slow particle flow; damped spring scaling; section parts reveal once on scroll; reduced motion or no WebGL shows a still render of the same graph.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
