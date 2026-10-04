import { ArrowRight } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Reveal from '../components/Reveal';
import Card from '../components/Card';
import CTAButton from '../components/CTAButton';

function StepNumber({ n }) {
  const padded = String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-4">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-navy text-xl font-extrabold text-white shadow-card">
        {padded}
      </span>
      <span className="eyebrow text-electric">Step {padded}</span>
    </div>
  );
}

function InfoBox({ title, items }) {
  return (
    <Card hover={false} className="p-6 ring-1 ring-slate-100 sm:p-7">
      <h3 className="text-base font-bold text-navy">{title}</h3>
      <ul className="mt-4 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[15px] leading-relaxed text-ink/75">
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

const sprintRows = [
  {
    week: 1,
    activity: 'Project onboarding, business immersion, project planning',
    deliverable: 'Work Plan submitted',
    touchpoint: 'Kick-off call',
  },
  {
    week: 2,
    activity: 'Project execution / data collection',
    deliverable: 'Project Progress',
    touchpoint: '—',
  },
  {
    week: 3,
    activity: 'Ideation, solution development, mid-point review',
    deliverable: 'Solution Summary',
    touchpoint: '—',
  },
  {
    week: 4,
    activity: 'Solution development, implementation',
    deliverable: 'Mid-point progress',
    touchpoint: 'Check-in call',
  },
  {
    week: 5,
    activity: 'Refinement, final report writing / pathway to final solution',
    deliverable: 'Implementation Progress',
    touchpoint: '—',
  },
  {
    week: 6,
    activity: 'Solution and impact/outcome',
    deliverable: 'Final report first draft',
    touchpoint: '—',
  },
  {
    week: 7,
    activity: 'Final presentation preparation and live delivery',
    deliverable: 'Final report + presentation',
    touchpoint: 'Final presentation',
  },
];

export default function HowItWorks() {
  return (
    <PageTransition>
      <SEO
        title="How It Works — The 5–7 Week Sprint | EkaNex"
        description="From company brief to live final presentation: the complete EkaNex process. A structured 5–7 week project sprint with defined steps, clear roles, and agreed deliverables."
        path="/how-it-works"
      />

      {/* SECTION 1 — PAGE INTRODUCTION */}
      <PageHero
        eyebrow="How it works"
        title="No ambiguity. No surprises. Here is exactly how it works."
        subtitle="EkaNex runs on a structured 5–7 week project sprint. Every step is defined. Every role is clear. Every deliverable is agreed upfront. Here is the complete process from brief to final presentation."
      />

      {/* STEP 1 */}
      <Section bg="white">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <StepNumber n={1} />
            <h2 className="mt-5 text-2xl font-bold text-navy sm:text-3xl">
              An organization submits a real business challenge using our project brief template.
            </h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink/75">
              <p>
                The process starts with the business. Our organizational partner in Delhi NCR
                identifies a real business challenge they need support with. This might be a market
                research question, a social media strategy they have never had time to build, a
                competitor analysis, a go-to-market plan, or a process they need documented or any
                support in digitalisation.
              </p>
              <p>
                The company completes our project brief template, which asks them to describe the
                problem, provide context about their business, and explain what a successful outcome
                looks like. Our team reviews the brief with them, helps them scope it appropriately
                for a 5–7 week student engagement, and confirms it before matching begins.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <InfoBox
              title="What a Company provides:"
              items={[
                'A project brief describing the business challenge (discussion with our team)',
                'A named point of contact (supervisor) for the engagement',
                'Approximately 1 hour for an initial scoping conversation with students',
                'Confidentiality agreement signed before any student accesses the brief',
                'A written offer to the students to commence work on the project',
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* STEP 2 */}
      <Section bg="surface">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <StepNumber n={2} />
            <h2 className="mt-5 text-2xl font-bold text-navy sm:text-3xl">
              Students apply through our platform. We select and match a team of 2 to 3 students to
              the project.
            </h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink/75">
              <p>
                Once the project brief is confirmed, we advertise it to our student pool. Students
                who have already registered on the platform can view a summary of open projects and
                submit an expression of interest, explaining why they want to work on that particular
                challenge and the relevant skills or interests they bring.
              </p>
              <p>
                Our team reviews all expressions of interest and selects 2–3 students whose skills,
                interests, and availability best match the project requirements. We aim for diversity
                within each team, bringing together students with different strengths so the final
                output is stronger.
              </p>
              <p>
                Before any student is activated on a project, parental consent is collected. This is
                non-negotiable and happens before any project brief or business information is shared.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <InfoBox
              title="What students need to join:"
              items={[
                'A completed student profile on the EkaNex platform with updated CV/Resume',
                'A submitted expression of interest for a specific project',
                'Written parental consent (collected before project access is granted)',
                'A signed student confidentiality undertaking',
                'Accepting the offer from the company to work on the project',
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* STEP 3 */}
      <Section bg="white">
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal>
            <StepNumber n={3} />
            <h2 className="mt-5 text-2xl font-bold text-navy sm:text-3xl">
              The organization assigns a supervisor to every student team before the sprint begins,
              who guides and supports them throughout their journey.
            </h2>
            <div className="mt-5 space-y-4 text-[17px] leading-relaxed text-ink/75">
              <p>
                Every EkaNex project is supervised by a dedicated point of contact from the
                organization, with relevant experience or familiarity with the problem being
                addressed, who guides the student team throughout the 5–7 week sprint.
              </p>
              <p>
                The supervisor’s role is not to do the work for the students. Their role is to provide
                direction, review deliverables, give professional feedback, and ensure the team stays
                on track and maintains a professional standard. The supervisor is also the first point
                of escalation for any issues that arise during the project.
              </p>
              <p>
                Before the sprint begins, a kick-off call is held with both parties — the supervisor
                from the organization and the student team — to align on the project brief, the
                timeline, the deliverables, and the communication process.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <InfoBox
              title="Supervisor commitment per project:"
              items={[
                '1 x kick-off call with student team — welcome students, explain the problem, familiarise them with the company and communicate milestones (Week 1)',
                '1 x weekly 30–60 minute formal catch-up with student team (Weeks 1–7)',
                'Review and provide written feedback on student progress each week to the company and EkaNex team',
                '1 x mid-point check-in call with the organization (Week 3)',
                '1 x final presentation attendance (Week 6 or 7)',
                'Total commitment: approximately 2–3 hours per week',
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* STEP 4 — THE SPRINT TABLE */}
      <Section bg="surface">
        <Reveal>
          <StepNumber n={4} />
          <h2 className="mt-5 max-w-3xl text-2xl font-bold text-navy sm:text-3xl">
            The structured 5 to 7 week engagement runs with defined deliverables each week.
          </h2>
        </Reveal>

        <p className="mt-6 text-sm text-muted sm:hidden">Scroll horizontally to see the full sprint →</p>

        <Reveal className="mt-6 overflow-hidden rounded-card shadow-card ring-1 ring-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <caption className="sr-only">
                EkaNex 5–7 week sprint: weekly student activity, deliverable, and company touchpoint
              </caption>
              <thead>
                <tr className="bg-navy text-white">
                  <th scope="col" className="px-5 py-4 text-sm font-semibold">
                    Week
                  </th>
                  <th scope="col" className="px-5 py-4 text-sm font-semibold">
                    Student Activity
                  </th>
                  <th scope="col" className="px-5 py-4 text-sm font-semibold">
                    Deliverable
                  </th>
                  <th scope="col" className="px-5 py-4 text-sm font-semibold">
                    Company Touchpoint
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {sprintRows.map((row) => (
                  <tr key={row.week} className="border-t border-slate-100 align-top">
                    <th scope="row" className="px-5 py-4">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-navy/5 text-sm font-bold text-navy">
                        {row.week}
                      </span>
                    </th>
                    <td className="px-5 py-4 text-[15px] text-ink/80">{row.activity}</td>
                    <td className="px-5 py-4 text-[15px] font-medium text-navy">{row.deliverable}</td>
                    <td className="px-5 py-4 text-[15px]">
                      {row.touchpoint === '—' ? (
                        <span className="text-slate-300">—</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-[13px] font-semibold text-accent-dark">
                          {row.touchpoint}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* STEP 5 — FINAL PROJECT DELIVERY */}
      <Section bg="white">
        <Reveal>
          <StepNumber n={5} />
          <h2 className="mt-5 max-w-3xl text-2xl font-bold text-navy sm:text-3xl">
            In Week 6 or 7, the student team presents their final recommendations live to the
            organisation.
          </h2>
          <div className="mt-5 max-w-3xl space-y-4 text-[17px] leading-relaxed text-ink/75">
            <p>
              The final week of the sprint is dedicated to preparation and delivery. The student team
              refines their report based on supervisor feedback, builds their final presentation deck,
              and delivers a live 30 to 45 minute presentation to the organization team.
            </p>
            <p>
              The organization receives a complete deliverable package at the end of the engagement.
              Everything produced — the research, the report, the presentation, and all supporting
              assets — belongs entirely to the organization. Students retain the right to reference
              the project in their portfolio as an anonymised case study, but all commercial content
              is owned by the business.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <InfoBox
              title="What the Organization receives:"
              items={[
                'A written final report (minimum 8 pages): problem framing, research methodology, findings, and specific recommendations',
                'A final presentation deck (10–15 slides) delivered live',
                'All research data, competitor analysis documents, and supporting materials',
                'A portfolio case study or implementation output for the business to reference publicly if they wish',
              ]}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <InfoBox
              title="What students receive:"
              items={[
                'A certificate of completion from EkaNex',
                'A professional reference from the organization',
                'A portfolio case study (anonymised) for their CV and university applications',
              ]}
            />
          </Reveal>
        </div>
      </Section>

      {/* CLOSING CTA */}
      <Section bg="navy">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal as="h2" className="text-section font-bold text-white">
            Ready to get involved?
          </Reveal>
          <Reveal className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <CTAButton to="/apply" state={{ role: 'Student' }} variant="amber" size="lg">
              Apply as a Student →
            </CTAButton>
            <CTAButton to="/apply" state={{ role: 'Organization' }} variant="whiteOutline" size="lg">
              Post a Project →
            </CTAButton>
          </Reveal>
        </div>
      </Section>
    </PageTransition>
  );
}
