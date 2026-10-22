import { CopyEmail } from "@/components/copy-email";
import { HashSync } from "@/components/hash-sync";
import { Reveal } from "@/components/reveal";
import { SystemStory } from "@/components/system-story";
import { capabilities, emailLabel, lines, person, profileLinks, register, summary } from "@/content/site";

const gutter = "px-4 sm:px-8 lg:px-14 xl:px-20";
const h2 = "text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1] font-bold tracking-[-0.035em] [font-stretch:112%]";
const sections = ["work", "experience", "contact"];
const lead = "text-lg leading-snug text-ink-soft sm:text-xl";
// Widens a small text link's hit area to 44px for touch without moving the layout.
const hit = "-my-3 inline-block py-3";
const link = "underline decoration-rule-strong transition-colors hover:text-ink hover:decoration-signal";

export default function Home() {
  return (
    <>
      <Reveal />
      <HashSync ids={sections} />
      <header className="fixed inset-x-0 top-0 z-30 border-b border-rule bg-ground">
        <div className={`flex h-16 items-center justify-between gap-4 ${gutter}`}>
          <a href="#top" className={`text-[17px] font-bold tracking-tight [font-stretch:112%] ${hit}`}>
            {person.name}
          </a>
          <nav aria-label="Sections" className="flex items-center gap-4 text-sm text-ink-soft sm:gap-6 sm:text-[15px] md:gap-8">
            <a href="#work" className={`transition-colors hover:text-ink ${hit}`}>Work</a>
            <a href="#experience" className={`transition-colors hover:text-ink ${hit}`}>Experience</a>
            <a href="#contact" className={`transition-colors hover:text-ink ${hit}`}>Contact</a>
          </nav>
        </div>
      </header>

      <main id="top" className="flex-1">
        <SystemStory
          steps={capabilities}
          hero={
            <>
              <h1
                id="hero-title"
                data-reveal
                className="text-[clamp(2.25rem,11.3vw,2.75rem)] leading-[0.94] font-bold tracking-[-0.045em] text-balance [font-stretch:112%] sm:text-[clamp(2.75rem,7.6vw,4.25rem)] lg:text-[clamp(2.75rem,5.6vw,5.25rem)]"
              >
                {person.name}
              </h1>
              <p data-reveal className={`mt-6 max-w-[34rem] ${lead}`}>
                {summary}
              </p>
              <ul data-reveal className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-3 text-lg text-ink-soft">
                <li>
                  <CopyEmail email={person.email} label={emailLabel} />
                </li>
                {profileLinks.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className={`${link} ${hit}`}>{l.label}</a>
                  </li>
                ))}
              </ul>
            </>
          }
        />

        <section id="work" aria-labelledby="work-title" className="relative bg-ground pt-24 md:pt-36">
          <div className={`grid gap-6 lg:grid-cols-12 ${gutter}`}>
            <h2 data-reveal id="work-title" className={`${h2} lg:col-span-5`}>
              Selected work
            </h2>
            <p data-reveal className={`max-w-[36rem] lg:col-span-6 lg:col-start-7 ${lead}`}>
              What I built, and the calls that made it hold up: the context, the constraint, the decision, and what
              shipped.
            </p>
          </div>

          {lines.map((line) => (
            <article
              key={line.id}
              id={`work-${line.id}`}
              aria-labelledby={`work-${line.id}-title`}
              className={`mt-20 grid gap-10 border-t border-rule pt-12 md:mt-28 md:gap-12 md:pt-14 lg:grid-cols-12 ${gutter}`}
            >
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <h3 data-reveal id={`work-${line.id}-title`} className="text-[clamp(2rem,3vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.03em] [font-stretch:112%]">
                    {line.name}
                  </h3>
                  <p data-reveal className="mt-2 text-lg text-ink-soft">{line.client}</p>
                  <p data-reveal className="mt-5 max-w-[32rem] text-lg leading-relaxed text-ink-soft">
                    {line.summary}
                  </p>
                  <ul data-reveal className="mt-6 flex flex-wrap gap-2 text-[13px] text-ink-soft">
                    {line.stack.map((t, i) => (
                      <li key={t + i} className="border border-rule-strong px-2.5 py-1">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <ol className="relative lg:col-span-6 lg:col-start-7">
                <span aria-hidden className="extend absolute top-2 bottom-2 left-[5px] w-px bg-rule-strong" />
                {line.stations.map((s, i) => {
                  const last = i === line.stations.length - 1;
                  return (
                    <li data-reveal key={s.label} className={`relative pl-12 ${last ? "" : "pb-11"}`}>
                      <span
                        aria-hidden
                        className={`absolute top-[0.45rem] left-0 size-[11px] ${last ? "bg-signal" : "border border-steel bg-ground"}`}
                      />
                      <h4 className="text-lg font-semibold">{s.label}</h4>
                      <p className="mt-1.5 max-w-[60ch] text-lg leading-relaxed text-ink-soft">{s.body}</p>
                    </li>
                  );
                })}
              </ol>
            </article>
          ))}
        </section>

        <section id="experience" aria-labelledby="experience-title" className={`pt-28 pb-24 md:pt-44 md:pb-32 ${gutter}`}>
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 data-reveal id="experience-title" className={`${h2} lg:col-span-5`}>
              Experience
            </h2>
            <p data-reveal className={`max-w-[36rem] lg:col-span-6 lg:col-start-7 ${lead}`}>
              Where I&rsquo;ve worked, and the role I held at each.
            </p>
          </div>

          <table data-reveal className="mt-12 w-full border-collapse text-left md:mt-16">
            <thead>
              <tr className="border-b border-rule-strong text-[13px] text-ink-faint">
                <th scope="col" className="hidden py-3 pr-6 font-normal sm:table-cell">Years</th>
                <th scope="col" className="py-3 pr-6 font-normal">Role</th>
                <th scope="col" className="hidden py-3 font-normal sm:table-cell">Organisation</th>
              </tr>
            </thead>
            <tbody>
              {register.map((row) => (
                <tr key={row.years + row.role} className="border-b border-rule align-top transition-colors hover:bg-raised">
                  <td className="hidden py-5 pr-6 text-[15px] whitespace-nowrap text-ink-soft sm:table-cell">{row.years}</td>
                  <td className="py-5 sm:pr-6">
                    {/* On phones the years ride above the role instead of taking a column. */}
                    <span className="mb-1 block text-[15px] text-ink-soft sm:hidden">{row.years}</span>
                    <span className="block text-lg font-semibold">{row.role}</span>
                    <span className="block text-ink-soft sm:hidden">{row.org}</span>
                    {row.note && <span className="block text-sm text-ink-faint sm:hidden">{row.note}</span>}
                  </td>
                  <td className="hidden py-5 text-ink-soft sm:table-cell">
                    <span className="block text-lg">{row.org}</span>
                    {row.note && <span className="block text-sm text-ink-faint">{row.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="contact" aria-labelledby="contact-title" className="border-t border-rule bg-raised">
          <div className={`grid gap-12 pt-24 pb-20 md:pt-32 md:pb-28 lg:grid-cols-12 ${gutter}`}>
            <div className="lg:col-span-5">
              <h2 data-reveal id="contact-title" className={h2}>
                Contact
              </h2>
              <p data-reveal className={`mt-6 max-w-[34rem] ${lead}`}>
                Email is the quickest way to reach me. I&rsquo;m also open to freelance projects.
              </p>
            </div>

            <dl data-reveal className="border-t border-rule-strong lg:col-span-6 lg:col-start-7 lg:mt-3">
              <div className="flex flex-col gap-1 border-b border-rule py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <dt className="text-[15px] text-ink-faint">Email</dt>
                <dd className="text-lg text-ink sm:text-xl">
                  <CopyEmail email={person.email} label={emailLabel} />
                </dd>
              </div>
              {/* The whole row is the link, so the target is as wide as the rule it sits on. */}
              {profileLinks.map((l) => (
                <div
                  key={l.label}
                  className="group relative flex flex-col gap-1 border-b border-rule py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                >
                  <dt className="text-[15px] text-ink-faint transition-colors group-hover:text-ink-soft">{l.label}</dt>
                  <dd className="text-lg text-ink sm:text-xl">
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-baseline gap-3 after:absolute after:inset-0"
                    >
                      <span className="underline decoration-rule-strong transition-colors group-hover:decoration-signal">
                        {l.handle}
                      </span>
                      <ArrowOut className="size-3 self-center text-ink-faint transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className={`flex items-center justify-between gap-6 border-t border-rule bg-raised py-6 text-[15px] text-ink-faint ${gutter}`}>
        <p>
          © {new Date().getFullYear()} {person.name}
        </p>
        <a href="#top" className={`group inline-flex items-center gap-2.5 text-ink-soft transition-colors hover:text-ink ${hit}`}>
          Back to top
          <ArrowUp className="size-3 transition-[color,translate] duration-200 group-hover:-translate-y-0.5" />
        </a>
      </footer>
    </>
  );
}

// Drawn arrows on a 12px grid at a 1.25px stroke, matching the hairline weight of the page.
function ArrowOut({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden className={className}>
      <path d="M3 9 9 3M4 3h5v5" />
    </svg>
  );
}

function ArrowUp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.25" aria-hidden className={className}>
      <path d="M6 10.5V1.5M2.5 5 6 1.5 9.5 5" />
    </svg>
  );
}
