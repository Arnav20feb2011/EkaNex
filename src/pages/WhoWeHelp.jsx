import { GraduationCap, Briefcase, School, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import Section from '../components/Section';
import Reveal from '../components/Reveal';
import Card from '../components/Card';
import CheckList from '../components/CheckList';
import CTAButton from '../components/CTAButton';

function AudienceHeader({ icon: Icon, eyebrow, title, subtitle }) {
  return (
    <Reveal className="max-w-3xl">
      <span className="mb-5 inline-grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy">
        <Icon className="h-6 w-6" />
      </span>
      <p className="eyebrow mb-3 text-electric">{eyebrow}</p>
      <h2 className="text-section font-bold text-navy">{title}</h2>
      <p className="mt-4 text-lg leading-relaxed text-muted">{subtitle}</p>
    </Reveal>
  );
}

function ProblemBlock({ children }) {
  return (
    <Reveal>
      <p className="eyebrow mb-4 text-accent-dark">The problem you face</p>
      <div className="space-y-4 text-[17px] leading-relaxed text-ink/75">{children}</div>
    </Reveal>
  );
}

function ListCard({ title, items }) {
  return (
    <Card hover={false} className="h-full p-7 sm:p-8">
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      <CheckList items={items} className="mt-5" />
    </Card>
  );
}

function FeatureGridCard({ title, items }) {
  return (
    <Reveal>
      <Card hover={false} className="p-7 sm:p-8">
        <h3 className="text-lg font-bold text-navy">{title}</h3>
        <CheckList
          items={items}
          className="mt-5 sm:grid sm:grid-cols-2 sm:gap-x-8 sm:gap-y-3 sm:space-y-0"
        />
      </Card>
    </Reveal>
  );
}

const problemTypes = [
  'Social media and digital strategy',
  'Market research and competitor analysis',
  'Brand identity refresh',
  'Website content and SEO',
  'Go-to-market planning',
  'Process and operations documentation',
  'CSR and community strategy',
  'Digitalisation and process improvement',
];

export default function WhoWeHelp() {
  return (
    <PageTransition>
      <SEO
        title="Who We Help — Students, Organizations & Schools | EkaNex"
        description="EkaNex is built for Grade 11–12 students seeking real work experience, Delhi NCR businesses with real challenges, and schools that want a safeguarded work experience programme with zero admin burden."
        path="/who-we-help"
      />

      {/* SECTION 1 — STUDENTS */}
      <Section id="students" bg="canvas">
        <AudienceHeader
          icon={GraduationCap}
          eyebrow="For students"
          title="You are more capable than the system gives you credit for."
          subtitle="EkaNex is built for Grade 11 and 12 students who want their first real work experience — not a certificate from a workshop, not a mock business competition, but actual work on an actual problem that a real business is trying to solve."
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <ProblemBlock>
            <p>
              Quality internships for school students in India are nearly non-existent. Most
              programmes are restricted to university students. The ones that do accept school
              students rarely involve real work. You show up, sit in meetings, and leave with a
              certificate that nobody takes seriously.
            </p>
            <p>
              Meanwhile, every university application you will ever fill out asks for work experience.
              Every job interview you will ever walk into will ask what you have done. And right now,
              the honest answer is: nothing yet. Not because you haven’t tried. Because the
              opportunity hasn’t existed.
            </p>
            <p className="text-xl font-bold text-navy">Until now.</p>
          </ProblemBlock>

          <Reveal delay={0.1}>
            <ListCard
              title="What you walk away with"
              items={[
                'A completed real-world project that you researched, analysed, and presented',
                'A professional reference from the organization whose problem you solved',
                'A certificate of completion from EkaNex',
                'A 1-page portfolio case study written for your CV and university applications',
                'Guidance from a working professional at the organization who will challenge and support you throughout',
                'Skills that no classroom teaches: client communication, research methodology, presenting under pressure',
              ]}
            />
          </Reveal>
        </div>

        <div className="mt-8">
          <FeatureGridCard
            title="What we ask of you"
            items={[
              '5 to 6 hours per week for 5 to 7 weeks',
              'A commitment to show up, meet deadlines, and communicate professionally',
              'Knowledge of problem-related domain and a deep passion to solve the problem',
              'No prior experience required — just motivation and curiosity',
            ]}
          />
        </div>

        <Reveal className="mt-8">
          <CTAButton
            to="/apply"
            state={{ role: 'Student' }}
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
          >
            Apply as a Student →
          </CTAButton>
        </Reveal>
      </Section>

      {/* SECTION 2 — ORGANIZATIONS */}
      <Section id="organizations" bg="surface">
        <AudienceHeader
          icon={Briefcase}
          eyebrow="For organizations"
          title="Your backlog deserves more than next quarter."
          subtitle="EkaNex gives you a supervised, professionally managed student team working on one of your real business challenges for 7 weeks — at zero cost during our initial cohort. You define the problem. We manage everything else."
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <ProblemBlock>
            <p>
              Most organizations we speak to have the same story. There are business problems that
              have been sitting on the to-do list for months. Market research that would take a week
              to do properly but never gets prioritised. A social media presence that everyone knows
              needs work but nobody has the bandwidth to fix. A process that lives in the founder’s
              head and has never been written down.
            </p>
            <p>
              Hiring a consultant costs money you may not want to spend on a scoped project. Hiring a
              full-time employee isn’t justified for 7 weeks of work. So the problems stay unsolved.
            </p>
          </ProblemBlock>

          <Reveal delay={0.1}>
            <ListCard
              title="What you walk away with"
              items={[
                'A final written report with your problem fully analysed and specific recommendations you can act on',
                'A live presentation from the student team delivered to your team in Week 7',
                'All research data, competitor analysis, strategy documents, and assets — owned entirely by you',
                'Zero cost and a total time commitment of approximately 3 hours across the full 7 weeks',
              ]}
            />
          </Reveal>
        </div>

        <Reveal className="mt-10">
          <h3 className="text-lg font-bold text-navy">The types of problems we work on</h3>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {problemTypes.map((t) => (
              <li
                key={t}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-[15px] font-medium text-navy shadow-sm transition-colors hover:border-navy/30"
              >
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="mt-10">
          <FeatureGridCard
            title="How we protect you"
            items={[
              'You write the brief. You define the problem and own everything produced.',
              'Students sign a confidentiality agreement before accessing any information about your business.',
              'You receive structured weekly updates so there are never any surprises.',
            ]}
          />
        </div>

        <Reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CTAButton to="/apply" state={{ role: 'Organization' }} variant="primary" size="lg">
            Post a Project →
          </CTAButton>
          <CTAButton to="/contact" state={{ role: 'Organization' }} variant="outline" size="lg">
            Book a 20-minute Discovery Call →
          </CTAButton>
        </Reveal>
      </Section>

      {/* SECTION 3 — SCHOOLS */}
      <Section id="schools" bg="white">
        <AudienceHeader
          icon={School}
          eyebrow="For schools"
          title="Your students deserve real experience. You deserve zero extra work."
          subtitle="EkaNex is a fully managed, safeguarded work experience programme that your students can join and your school can endorse — without adding a single hour of administrative work to your team."
        />

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <ProblemBlock>
            <p>
              Schools across Delhi NCR want to offer meaningful work experience to their students.
              But every attempt runs into the same obstacles: safeguarding concerns, administrative
              burden, legal complexity, and the difficulty of finding industry partners who will
              commit to a structured engagement.
            </p>
            <p>
              The result is that most schools rely on informal, unstructured internship arrangements
              that students arrange themselves — with no supervision, no learning framework, and no
              professional output at the end.
            </p>
            <p className="text-xl font-bold text-navy">EkaNex solves all of this at once.</p>
          </ProblemBlock>

          <Reveal delay={0.1}>
            <ListCard
              title="What your school receives"
              items={[
                'A credible, structured work experience programme with no administrative burden',
                'Student outcomes that genuinely strengthen university applications',
                'School branding on student certificates and at the EkaNex showcase event',
                'A named school liaison process — you stay informed without being responsible for operations',
                'A formal School Partnership Agreement that clearly defines our respective roles',
              ]}
            />
          </Reveal>
        </div>

        <div className="mt-8">
          <FeatureGridCard
            title="What we ask of you"
            items={[
              'A named school liaison contact (a counsellor or teacher)',
              'Permission to present EkaNex to your students',
              'Sharing our sign-up link with interested students',
              'That is all. We manage everything else.',
            ]}
          />
        </div>

        {/* Safeguarding summary */}
        <Reveal className="mt-8">
          <div className="rounded-card bg-navy p-7 text-white sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10 text-accent">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold">Safeguarding summary</h3>
            </div>
            <p className="mt-5 text-[17px] leading-relaxed text-white/85">
              Parental consent is collected before any student joins a project. All communication
              between students and businesses happens through official, logged channels — no personal
              contact details are ever shared. No in-person visits without prior written parental
              consent and a supervisor present throughout. A named EkaNex coordinator is available for
              any escalation.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
          <CTAButton to="/contact" state={{ role: 'School' }} variant="primary" size="lg">
            Download the School Partnership Pack →
          </CTAButton>
          <CTAButton to="/contact" state={{ role: 'School' }} variant="outline" size="lg">
            Book a call with our partnerships team →
          </CTAButton>
        </Reveal>
      </Section>
    </PageTransition>
  );
}
