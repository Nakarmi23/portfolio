import { CopyEmail } from "@/components/copy-email";
import { HashSync } from "@/components/hash-sync";
import { Reveal } from "@/components/reveal";
import { SystemStory } from "@/components/system-story";
import { capabilities, emailLabel, firstEmail, lines, person, profileLinks, register, route } from "@/content/site";

const mailto = `mailto:${person.email}?subject=New%20project`;

const gutter = "px-4 sm:px-8 lg:px-14 xl:px-20";
const h2 = "text-[clamp(2.25rem,4.4vw,3.75rem)] leading-[1] font-bold tracking-[-0.035em] [font-stretch:112%]";
const sections = ["work", "approach", "experience", "contact"];

const press = "transition-[background-color,color,transform] duration-200 active:translate-y-[1px]";

export default function Home() {
  return (
    <>
      <Reveal />
      <HashSync ids={sections} />
      <header className="fixed inset-x-0 top-0 z-30 border-b border-rule bg-ground">
        <div className={`flex h-16 items-center justify-between gap-6 ${gutter}`}>
          <a href="#top" className="text-[17px] font-bold tracking-tight [font-stretch:112%]">
            {person.name}
          </a>
          <nav aria-label="Sections" className="hidden items-center gap-8 text-[15px] text-ink-soft md:flex">
            <a href="#work" className="transition-colors hover:text-ink">Work</a>
            <a href="#approach" className="transition-colors hover:text-ink">Approach</a>
            <a href="#experience" className="transition-colors hover:text-ink">Experience</a>
          </nav>
          <a href={mailto} className={`bg-signal px-4 py-2.5 text-[15px] font-semibold text-signal-ink hover:bg-ink ${press}`}>
            Start a project
          </a>
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
                className="text-[clamp(2.75rem,5.6vw,5.25rem)] leading-[0.94] font-bold tracking-[-0.045em] text-balance [font-stretch:112%]"
              >
                I build software that holds up.
              </h1>
              <p data-reveal className="mt-6 max-w-[34rem] text-xl leading-snug text-ink-soft">
                Software engineer with 10+ years of shipping, front end to database. I think the system through
                before I write it, so what you launch keeps working as traffic and features grow.
              </p>
              <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a href={mailto} className={`bg-signal px-6 py-3.5 text-lg font-semibold text-signal-ink hover:bg-ink ${press}`}>
                  Start a project
                </a>
                <CopyEmail email={person.email} label={emailLabel} className="text-lg text-ink-soft" />
              </div>
              <p data-reveal className="mt-6 flex items-center gap-3 text-[15px] text-ink-soft">
                <span aria-hidden className="size-2 bg-steel" />
                {person.availability}
              </p>
            </>
          }
        />

        <section id="work" aria-labelledby="work-title" className="relative bg-ground pt-36">
          <div className={`grid gap-6 lg:grid-cols-12 ${gutter}`}>
            <h2 data-reveal id="work-title" className={`${h2} lg:col-span-5`}>
              Selected work
            </h2>
            <p data-reveal className="max-w-[36rem] text-xl leading-snug text-ink-soft lg:col-span-6 lg:col-start-7">
              What I built, and the calls that made it hold up: the context, the constraint, the decision, and what
              shipped.
            </p>
          </div>

          {lines.map((line) => (
            <article
              key={line.id}
              id={`work-${line.id}`}
              aria-labelledby={`work-${line.id}-title`}
              className={`mt-28 grid gap-12 border-t border-rule pt-14 lg:grid-cols-12 ${gutter}`}
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

        <section id="approach" aria-labelledby="approach-title" className={`pt-44 ${gutter}`}>
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 data-reveal id="approach-title" className={`${h2} lg:col-span-5`}>
              One person, end to end
            </h2>
            <p data-reveal className="max-w-[36rem] text-xl leading-snug text-ink-soft lg:col-span-6 lg:col-start-7">
              You work with one engineer from the first call to the production deploy. I plan just enough to build it
              right, then write the code myself, so nothing is lost in a hand-off.
            </p>
          </div>

          <ol className="mt-20 grid border-t border-rule md:grid-cols-3 xl:grid-cols-6">
            {route.map((stop, i) => (
              <li
                data-reveal
                key={stop.label}
                className="group relative border-b border-rule py-8 pr-6 md:border-r md:pl-6 md:first:pl-0 xl:border-b-0 xl:last:border-r-0"
              >
                <span
                  aria-hidden
                  className={`absolute -top-[6px] left-0 size-[11px] md:left-6 md:group-first:left-0 ${
                    i === route.length - 1 ? "bg-signal" : "border border-steel bg-ground"
                  }`}
                />
                <h3 className="text-lg font-semibold">{stop.label}</h3>
                <p className="mt-2 max-w-[30ch] text-[15px] leading-relaxed text-ink-soft">{stop.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="experience" aria-labelledby="experience-title" className={`pt-44 pb-44 ${gutter}`}>
          <div className="grid gap-6 lg:grid-cols-12">
            <h2 data-reveal id="experience-title" className={`${h2} lg:col-span-5`}>
              Experience
            </h2>
            <p data-reveal className="max-w-[36rem] text-xl leading-snug text-ink-soft lg:col-span-6 lg:col-start-7">
              Where I&rsquo;ve worked, and the role I held at each.
            </p>
          </div>

          <table data-reveal className="mt-16 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule-strong text-[13px] text-ink-faint">
                <th scope="col" className="py-3 pr-6 font-normal">Years</th>
                <th scope="col" className="py-3 pr-6 font-normal">Role</th>
                <th scope="col" className="hidden py-3 font-normal sm:table-cell">Organisation</th>
              </tr>
            </thead>
            <tbody>
              {register.map((row) => (
                <tr key={row.years + row.role} className="border-b border-rule align-top transition-colors hover:bg-raised">
                  <td className="py-5 pr-6 text-[15px] whitespace-nowrap text-ink-soft">{row.years}</td>
                  <td className="py-5 pr-6">
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
          <div className={`grid gap-16 pt-32 pb-28 lg:grid-cols-12 ${gutter}`}>
            <div className="lg:col-span-7">
              <h2
                data-reveal
                id="contact-title"
                className="text-[clamp(2.75rem,6.2vw,5.75rem)] leading-[0.94] font-bold tracking-[-0.045em] text-balance [font-stretch:112%]"
              >
                What are you building?
              </h2>
              <p data-reveal className="mt-6 max-w-[34rem] text-xl leading-snug text-ink-soft">
                Tell me what you need built. I&rsquo;ll reply with how I&rsquo;d approach it.
              </p>
              <a
                data-reveal
                href={mailto}
                className={`mt-10 inline-block bg-signal px-7 py-4 text-xl font-semibold text-signal-ink hover:bg-ink ${press}`}
              >
                Start a project
              </a>
              <p data-reveal className="mt-5 text-lg text-ink-soft">
                or write to <CopyEmail email={person.email} label={emailLabel} className="text-ink" />
              </p>
            </div>

            <div className="lg:col-span-4 lg:col-start-9 lg:pt-4">
              <h3 data-reveal className="text-lg font-semibold">
                What helps in a first email
              </h3>
              <ol className="mt-5 border-t border-rule">
                {firstEmail.map((item) => (
                  <li data-reveal key={item} className="border-b border-rule py-4 text-lg leading-snug">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <footer className={`flex flex-wrap items-center justify-between gap-6 border-t border-rule py-8 text-[15px] text-ink-soft ${gutter}`}>
            <p>© {person.name}</p>
            <ul className="flex gap-8">
              {profileLinks.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a href={link.href} className="transition-colors hover:text-ink">{link.label}</a>
                  ) : (
                    <span>{link.label} [add URL]</span>
                  )}
                </li>
              ))}
            </ul>
          </footer>
        </section>
      </main>
    </>
  );
}
