# Ankit Nakarmi — portfolio

The personal portfolio of Ankit Nakarmi, a software engineer who thinks the system through before building it.

The landing page is built around a live WebGL scene: a small system architecture (clients, app servers, a queue and workers) running under simulated load. Visitors can change the load and watch the system scale, while the page walks the request path step by step.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4
- [three.js](https://threejs.org) for the system scene
- pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # run ESLint
```

## Project layout

```
app/          page, layout and global styles
components/   system scene, scroll story and small UI pieces
content/      site copy: profile, capabilities, case studies, work history
```

Most text on the site lives in `content/site.ts`, so copy changes don't touch the components.

## Design notes

- `PRODUCT.md`: who the site is for and what it has to do
- `DESIGN.md`: the design system (colours, type, motion)
