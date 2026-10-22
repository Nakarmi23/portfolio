# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A mixed audience landing on the personal site of Ankit Nakarmi (name taken from the git author; confirm spelling before shipping):

- **Peers, hiring managers and recruiters** looking at the work and background.
- **Prospective freelance clients** (secondary). The site mentions freelance work once, quietly, beside the contact links; it does not pitch.

Visitors are usually short on time and arrive from a link (LinkedIn, GitHub, a résumé, a referral). Their job is to see what Ankit has built and how he thinks.

## Product Purpose

A personal portfolio, not a sales page, for a **Software Engineer and Solutions Architect**. It shows shipped work through case studies and a credible work history. A visit succeeds when the visitor understands what Ankit builds and how he thinks; contact links are there for anyone who wants them.

## Positioning

Ankit works across both levels: hands-on full-stack engineering and solutions architecture (system design, technical decisions, trade-offs). The case studies should show both the shipped product and the architectural reasoning behind it.

**Angle (revised 2026-10-22):** a portfolio, not a freelance sales page. The earlier freelance-first angle (2026-10-20) read as a pitch and was dropped. No calls to action, no engagement process, no availability status, no "what are you building?" prompts. The hero states who Ankit is and his current role plainly; freelance work gets one quiet line in the contact section. Claims about scale (numbers, uptime, traffic) still need real evidence from Ankit.

**Tone guardrails:** not a generic SaaS hero, not playful, not corporate or consultancy-speak.

**Brand commitment (pinned 2026-10-20):** technical and immersive. The landing page is built around an interactive WebGL centrepiece, a living system architecture the visitor can explore, with everything around it dark, precise and understated. Craft bar: it should sit alongside linear.app and Awwwards-level developer portfolios. Metaphor-led worlds (transit maps, surveys, industrial objects, crafts) were tried and rejected as unsuitable for a solutions architect.

## Operating Context

- Visitors often arrive from LinkedIn, GitHub, or a shared résumé link, and come back to the site when they're evaluating a candidate.
- Case studies are long-form reading; the overview and the contact links are scanned.

## Capabilities and Constraints

- Stack already in the repo: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, pnpm. This Next.js version has breaking changes, so read `node_modules/next/dist/docs/` before writing framework code (see AGENTS.md).
- Each case study is an **MDX file** in the repo, written long-form.
- Contact is by link only (email, LinkedIn, GitHub). There's no contact form or backend.
- **Open decisions:** deploy target, whether a downloadable résumé PDF ships, and whether a blog/writing section gets added later.

## Evidence on Hand

- Ankit has real case studies/projects and a résumé/work history, but none of it is in the repo yet. Ask for the content; don't write placeholder projects.
- **Absent:** testimonials, client logos, metrics, press, talks, and open-source highlights. Don't fabricate any of them or imply they exist.
- The email address and the LinkedIn and GitHub URLs still need to be provided.

## Product Principles

1. **Proof over claims.** Every capability statement points to a real case study or role.
2. **Show the reasoning.** Case studies explain the architectural decisions and trade-offs, not just the screenshots.
3. **Fast to judge, deep on demand.** A busy visitor gets the picture in seconds, and the case studies reward someone who keeps reading.
4. **Contact is always one step away.** Email, LinkedIn, and GitHub are reachable from every page.
