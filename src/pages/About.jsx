import { Quote, Target, ListChecks, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Card from '../components/Card';
import CTAButton from '../components/CTAButton';
import TiltCard from '../components/TiltCard';

const principles = [
  {
    icon: Target,
    title: 'Real over simulated.',
    body: 'Every project is a real business challenge, not a case study.',
  },
  {
    icon: ListChecks,
    title: 'Structured over ad hoc.',
    body: 'Every engagement follows a defined framework with clear deliverables.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe before everything.',
    body: 'No student engages with a business without proper safeguards in place.',
  },
];

export default function About() {
  return (
    <PageTransition>
      <SEO
        title="About EkaNex — Our Vision, Story & Mission"
        description="EkaNex was founded by a high school student in Delhi NCR to give capable Grade 11–12 students real, supervised work experience — and to help businesses solve real problems. This is our story."
        path="/about"
      />

      {/* SECTION 1 — OUR VISION */}
      <PageHero
        eyebrow="Our vision"
        title="A Delhi NCR where no capable student graduates without real work experience and young people are solving real business problems."
        subtitle="Our vision is to help high school students access meaningful, supervised, real-world work experience — and for businesses of all sizes to benefit from the talent that is sitting in classrooms right now, waiting for an opportunity. EkaNex is that opportunity."
      />

      {/* SECTION 2 — OUR STORY */}
      <Section bg="canvas">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <Reveal className="lg:sticky lg:top-28">
              <p className="eyebrow mb-4 text-electric">Our story</p>
              <Quote className="mb-4 h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="text-section font-bold italic text-navy">
                EkaNex started with a simple observation that wouldn’t go away.
              </h2>
              <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-muted">
                Founder, EkaNex · Pathways School, Gurugram
              </p>
            </Reveal>
          </div>

          <div className="space-y-5 text-lg leading-relaxed text-ink/75 lg:col-span-7">
            <Reveal as="p">
              I am a high school student at Pathways School, Gurugram. Like a lot of students my age,
              I spent months trying to find a meaningful internship — something real, something that
              would actually teach me how business works and give me something that guides my future
              decisions as well as my university applications.
            </Reveal>
            <Reveal as="p" delay={0.06}>
              What I found instead was a wall. Most internships require you to already be in
              university. The few that existed for school students were unpaid, unstructured, and
              largely a waste of time. You showed up, made tea, sat in meetings you didn’t
              understand, and left with a certificate that said you had ‘work experience’ but could
              not actually describe what you learned.
            </Reveal>
            <Reveal as="p" delay={0.12}>
              At the same time, I noticed that the small businesses around me — in Delhi NCR, the
              city I grew up in — were dealing with real, unresolved problems. Social media
              strategies that nobody had time to build. Market research that sat on a to-do list for
              months. Business processes that only existed in the founder’s head. These companies
              needed help, but they couldn’t afford consultants and didn’t have the headcount for a
              new hire.
            </Reveal>
            <Reveal as="p" delay={0.18}>
              I kept thinking: these two problems are the same problem. Students need work
              experience. Businesses need workers to solve their modern day problems. The only thing
              missing was a structure that made it safe, supervised, and worth the effort for both
              sides.
            </Reveal>
            <Reveal as="p" delay={0.24} className="text-2xl font-bold text-navy">
              That structure is EkaNex.
            </Reveal>
          </div>
        </div>
      </Section>

      {/* SECTION 3 — THE PROBLEM WE ARE SOLVING */}
      <Section bg="surface">
        <SectionHeading
          eyebrow="The problem we are solving"
          title="The gap between education and industry has never been wider — or more unnecessary."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <Reveal className="h-full">
            <Card hover={false} className="h-full p-7 sm:p-8">
              <p className="eyebrow mb-4 text-electric">For students</p>
              <div className="space-y-4 text-[17px] leading-relaxed text-ink/75">
                <p>
                  India produces millions of school graduates every year. Almost none of them have
                  had a single day of real professional experience before they enter university or
                  the job market. This is not because they are not capable. It is because there is no
                  system that connects them to real work in a safe, structured, and meaningful way.
                </p>
                <p>
                  The impact is real. University applications that look identical. First jobs that
                  take years longer to find. Young people who are academically brilliant but
                  professionally lost — because nobody gave them an opportunity to figure out what
                  they are actually good at and what career pathway matches their interest.
                </p>
              </div>
            </Card>
          </Reveal>

          <Reveal delay={0.1} className="h-full">
            <Card hover={false} className="h-full p-7 sm:p-8">
              <p className="eyebrow mb-4 text-accent-dark">For organizations</p>
              <div className="space-y-4 text-[17px] leading-relaxed text-ink/75">
                <p>
                  At the same time, small and medium businesses — the backbone of the Indian economy
                  — are operating with lean teams and stretched leadership. Important work keeps
                  getting pushed to next quarter. Research never gets done. Strategies stay
                  half-built. The talent exists. The budget does not.
                </p>
                <p>
                  The result is a massive, completely unnecessary mismatch. Capable students with
                  time and motivation. Businesses with real problems and no one to solve them.
                  EkaNex exists to close that gap.
                </p>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* SECTION 4 — OUR APPROACH */}
      <Section bg="white">
        <SectionHeading eyebrow="Our approach" title="Structured. Supervised. Real." />
        <div className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed text-ink/75">
          <Reveal as="p">
            EkaNex is not a training programme. It is not a workshop. It is not a simulation. It is a
            managed process that puts real students on real business problems with real supervision
            and produces real outputs.
          </Reveal>
          <Reveal as="p" delay={0.08}>
            Every engagement follows a structured 7-week sprint framework. Students are not left to
            figure it out alone — a dedicated supervisor from the organization guides them throughout.
            Organizations are not
            burdened with finding students — we handle everything by matching students to their
            problems. Schools and parents are not asked to trust blindly — our safeguarding framework
            is built in from day one.
          </Reveal>
          <Reveal as="p" delay={0.16}>
            We believe that the best way to learn professional skills is to do professional work. And
            we believe that doing professional work well requires structure, supervision, and
            accountability — which is exactly what we provide.
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {principles.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={i * 0.08} className="h-full">
                <TiltCard className="h-full">
                  <Card
                    hover={false}
                    className="h-full p-7 transition-shadow duration-300 group-hover:shadow-cardHover"
                  >
                    <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy transition-colors duration-300 group-hover:bg-electric group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-bold text-navy">{p.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink/75">{p.body}</p>
                  </Card>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* SECTION 5 — OUR VISION FOR THE FUTURE */}
      <Section bg="navy">
        <SectionHeading
          onDark
          eyebrow="Our vision for the future"
          title="We are building the infrastructure that should have always existed."
        />
        <div className="mt-6 max-w-3xl space-y-5 text-lg leading-relaxed text-white/80">
          <Reveal as="p">
            Right now, we are focused on Delhi NCR. One city. One cohort. Getting it right before we
            grow.
          </Reveal>
          <Reveal as="p" delay={0.08}>
            But the vision is bigger. We want to build a platform that eventually reaches every
            corner of India — where any motivated Grade 11 or 12 student, regardless of which city
            they live in or which school they go to, can access a structured, supervised, meaningful
            work experience before they graduate.
          </Reveal>
          <Reveal as="p" delay={0.16}>
            And on the other side of that platform: thousands of organizations across India getting
            real business problems solved by the most underutilised talent pool in the country —
            students who are capable, motivated, and just waiting for someone to give them a chance.
          </Reveal>
          <Reveal as="p" delay={0.24} className="text-xl font-semibold text-white">
            EkaNex is the beginning of that infrastructure. And we are building it right now.
          </Reveal>
        </div>

        <Reveal className="mt-10 flex flex-col gap-3 sm:flex-row">
          <CTAButton to="/apply" state={{ role: 'Student' }} variant="amber" size="lg">
            Apply as a Student →
          </CTAButton>
          <CTAButton to="/apply" state={{ role: 'Organization' }} variant="whiteOutline" size="lg">
            Partner as an Organization →
          </CTAButton>
        </Reveal>
      </Section>
    </PageTransition>
  );
}
