# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A mixed audience landing on the personal site of Ankit Nakarmi (name taken from the git author; confirm spelling before shipping):

- **Prospective freelance clients** (founders, agencies, product teams): the **primary** audience. They decide whether to bring Ankit in on a project.
- **Hiring managers and recruiters** checking fit for a full-stack or solutions-architect role (secondary).
- **Peers** looking at the work and background (secondary).

Visitors are usually short on time and arrive from a link (LinkedIn, GitHub, a résumé, a referral). Their job is to work out quickly what Ankit builds and how he thinks, then decide whether to get in touch.

## Product Purpose

A personal portfolio for a **Full Stack Software Engineer and Solutions Architect**. It shows shipped work through case studies and gives a credible work history. A visit succeeds when the visitor understands the scope of work Ankit takes on and reaches out by email, LinkedIn, or GitHub.

## Positioning

Ankit works across both levels: hands-on full-stack engineering and solutions architecture (system design, technical decisions, trade-offs). The case studies should show both the shipped product and the architectural reasoning behind it.

**Angle (confirmed 2026-10-20):** the site is mainly for **freelance work**. The thing to remember combines two ideas: *an architect who ships*, meaning one person who designs the system and builds it, and *scale and reliability*, meaning systems built to hold up under load. Copy may state this angle, but specific claims about scale (numbers, uptime, traffic) need real evidence from Ankit.

**Tone guardrails:** not a generic SaaS hero, not playful, not corporate or consultancy-speak.

**Brand commitment (pinned 2026-10-20):** technical and immersive. The landing page is built around an interactive WebGL centrepiece, a living system architecture the visitor can explore, with everything around it dark, precise and understated. Craft bar: it should sit alongside linear.app and Awwwards-level developer portfolios. Metaphor-led worlds (transit maps, surveys, industrial objects, crafts) were tried and rejected as unsuitable for a solutions architect.

## Operating Context

- Visitors often arrive from LinkedIn, GitHub, or a shared résumé link, and come back to the site when they're evaluating a candidate or vendor.
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
