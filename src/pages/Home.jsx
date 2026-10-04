import { motion } from 'framer-motion';
import {
  ClipboardList,
  Users,
  UserCheck,
  Rocket,
  CalendarCheck,
  Presentation,
  GraduationCap,
  Briefcase,
  School,
  MapPin,
  ShieldCheck,
  Award,
  Info,
  Check,
  BadgeCheck,
} from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import Section from '../components/Section';
import SectionHeading from '../components/SectionHeading';
import Reveal from '../components/Reveal';
import Card from '../components/Card';
import CTAButton from '../components/CTAButton';
import ArrowLink from '../components/ArrowLink';
import BenefitTabs from '../components/BenefitTabs';
import TiltCard from '../components/TiltCard';
import HeroFloaters from '../components/HeroFloaters';

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Honest, mission-based value points (no unverified metrics).
const trustItems = [
  { icon: Briefcase, label: 'Real business projects' },
  { icon: ShieldCheck, label: 'Professionally supervised' },
  { icon: Award, label: 'Certificate + reference' },
  { icon: BadgeCheck, label: 'Free for students, always' },
];

const processSteps = [
  { icon: ClipboardList, label: 'A Company submits a real business challenge' },
  { icon: Users, label: 'Students apply and are matched to the project' },
  {
    icon: UserCheck,
    label: 'The organization assigns a supervisor to guide and support the student team',
  },
  { icon: Rocket, label: 'The 7-week structured sprint begins with targets and milestones set up' },
  { icon: CalendarCheck, label: 'Weekly check-ins, deliverables, and progress updates' },
  {
    icon: Presentation,
    label: 'Students present their final report and recommendations to the organization',
  },
];

const audienceCards = [
  {
    icon: GraduationCap,
    title: 'Students',
    body:
      'Grade 11 and 12 students who want real work experience before university — not a workshop certificate, not a mock project, but actual work on an actual business problem.',
    cta: { label: 'Apply as a Student', to: '/apply', state: { role: 'Student' } },
  },
  {
    icon: Briefcase,
    title: 'Organizations',
    body:
      'Small and medium businesses in Delhi NCR with real challenges that need solutions at zero cost, with zero administrative burden, and with a professional deliverable at the end.',
    cta: { label: 'Post a Project', to: '/apply', state: { role: 'Organization' } },
  },
  {
    icon: School,
    title: 'Schools',
    body:
      'Schools and educational institutions that want to offer meaningful, structured, safeguarded work experience to their students without adding a single hour of administrative work to their plate.',
    cta: { label: 'Partner with Us', to: '/apply', state: { role: 'School' } },
  },
];

const benefitGroups = [
  {
    key: 'students',
    tabLabel: 'Students',
    title: 'For Students',
    icon: <GraduationCap className="h-6 w-6" />,
    items: [
      'A completed real-world project for their portfolio',
      'A real-world work experience',
      'A reference from a professional network',
      'A certificate of completion',
      'A 1-page portfolio case study for university applications',
      'Guidance from working professionals at the organization',
      'Cross-functional skills: problem-solving, research, analysis, communication, and presenting',
    ],
  },
  {
    key: 'organizations',
    tabLabel: 'Organizations',
    title: 'For Organizations',
    icon: <Briefcase className="h-6 w-6" />,
    items: [
      'A final written report with findings and actionable recommendations',
      'A live presentation from the student team',
      'All research assets, data, and materials — owned entirely by the Organization',
      'Zero cost. Zero administrative burden.',
      'Employer branding in Delhi NCR schools',
      'A real community service and CSR impact',
    ],
  },
  {
    key: 'schools',
    tabLabel: 'Schools',
    title: 'For Schools',
    icon: <School className="h-6 w-6" />,
    items: [
      'A structured, credible work experience programme with no admin burden',
      'Student outcomes that strengthen university applications',
      'School name featured at the showcase and certificate event',
      'Association with a pioneering Delhi NCR education-industry initiative',
    ],
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    audience: 'For small businesses',
    features: ['1 project per cohort', '1 student team', 'Final report and presentation'],
    popular: false,
  },
  {
    name: 'Growth',
    audience: 'For growing organizations',
    features: ['Up to 3 projects per cohort', 'Priority student matching', 'Showcase feature'],
    popular: true,
  },
  {
    name: 'Partner',
    audience: 'For established companies',
    features: ['Unlimited projects', 'Dedicated coordinator', 'Branded certificates'],
    popular: false,
  },
];

export default function Home() {
  return (
    <PageTransition>
      <SEO path="/" />

      {/* SECTION 1 — HERO */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
              maskImage: 'radial-gradient(ellipse 75% 70% at 72% 18%, black 35%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(ellipse 75% 70% at 72% 18%, black 35%, transparent 100%)',
            }}
          />
          <div className="absolute -top-40 right-0 h-[34rem] w-[34rem] rounded-full bg-electric/25 blur-[130px]" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-electric/10 blur-3xl" />
        </div>

        <HeroFloaters />

        <div className="container-px relative z-10 pb-20 pt-32 lg:pb-28 lg:pt-40">
          <motion.div className="max-w-4xl" variants={heroContainer} initial="hidden" animate="show">
            <motion.p
              variants={heroItem}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
            >
              <MapPin className="h-3.5 w-3.5 text-electric" aria-hidden="true" />
              Delhi NCR · Launching 2026
            </motion.p>

            <motion.h1
              variants={heroItem}
              className="text-[clamp(2.75rem,6.5vw,5rem)] font-extrabold leading-[1.02] tracking-tight"
            >
              Your first real project.
              <br />
              <span className="text-[#5C9DF5]">Before you finish school.</span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="mt-7 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
            >
              We connect ambitious Grade 11 and 12 students in Delhi NCR with real businesses to
              solve real problems — supervised, structured, and completely free.
            </motion.p>

            <motion.p
              variants={heroItem}
              className="mt-4 max-w-2xl text-base leading-relaxed text-white/55"
            >
              No prior experience required. No fees. Just 7 weeks of real work that your university
              application will thank you for.
            </motion.p>

            <motion.div variants={heroItem} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <CTAButton to="/apply" state={{ role: 'Student' }} variant="electric" size="lg">
                Apply as a Student →
              </CTAButton>
              <CTAButton to="/apply" state={{ role: 'Organization' }} variant="whiteOutline" size="lg">
                Partner as an Organization →
              </CTAButton>
            </motion.div>

            {/* Value pills — honest, mission-based (no unverified metrics) */}
            <motion.ul variants={heroItem} className="mt-12 flex flex-wrap items-center gap-2.5">
              {trustItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-sm text-white/80 backdrop-blur-sm transition-colors hover:border-white/30 hover:text-white"
                  >
                    <Icon className="h-4 w-4 text-electric" aria-hidden="true" />
                    {item.label}
                  </li>
                );
              })}
            </motion.ul>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — WHAT IS EkaNex */}
      <Section bg="surface">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="eyebrow mb-3 text-electric">What is EkaNex</p>
              <h2 className="text-section font-bold italic text-navy">
                EkaNex is where school ends and the real world begins.
              </h2>
            </Reveal>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-ink/75 lg:col-span-7">
            <Reveal as="p">
              EkaNex is a student-to-organizational experiential learning platform. We take real
              business problems from small and medium-sized companies in Delhi NCR and put motivated,
              supervised Grade 11–12 student teams to work on solving them.
            </Reveal>
            <Reveal as="p" delay={0.08}>
              Every engagement runs for 7 weeks. Every student team is guided by a supervisor from
              the organization. Every project ends with a final report and live presentation that
              the business can actually use.
            </Reveal>
            <Reveal as="p" delay={0.16}>
              Students graduate from the programme with their first portfolio project, a professional
              reference, a certificate, and something concrete to say in every university application
              and job interview they ever walk into.
            </Reveal>
          </div>
        </div>
      </Section>

      {/* SECTION 3 — WHY EkaNex EXISTS */}
      <Section bg="white">
        <SectionHeading
          eyebrow="Why EkaNex exists"
          title="Because capable students shouldn’t have empty CVs. Every young student deserves a chance."
        />
        <div className="mt-8 max-w-3xl space-y-5 border-l-2 border-accent/40 pl-6 text-lg leading-relaxed text-ink/75">
          <Reveal as="p">
            Every year, thousands of Grade 11 and 12 students across Delhi NCR apply to universities
            with almost nothing to show beyond their grades. Not because they aren’t capable, but
            because there has never been a structured, safe, accessible pathway for them to get real
            work experience before they turn 18.
          </Reveal>
          <Reveal as="p" delay={0.08}>
            At the same time, hundreds of small and medium businesses in Delhi NCR are sitting on
            unresolved problems — market research that never gets done, social media strategies that
            stay half-built, competitor analyses that live on a to-do list. Hiring a consultant is
            expensive. Hiring a full-time employee isn’t justified for a focused 7-week project. So
            the work doesn’t get done.
          </Reveal>
          <Reveal as="p" delay={0.16}>
            EkaNex was built to fix both problems at the same time. One platform. Two groups of
            people who genuinely need each other.
          </Reveal>
        </div>
      </Section>

      {/* SECTION 4 — HOW IT WORKS (SUMMARY) */}
      <Section bg="navy">
        <SectionHeading
          onDark
          align="center"
          eyebrow="How it works"
          title="Seven weeks. One real problem. One professional output."
          subtitle="Here is exactly what happens from the moment a company submits a project brief to the moment a student team presents their final recommendations."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {processSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.label}
                delay={i * 0.07}
                className="relative overflow-hidden rounded-card border border-white/10 bg-white/5 p-6 transition-colors duration-300 hover:bg-white/10"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-accent">
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-3xl font-extrabold text-white/15">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-white/85">{step.label}</p>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-10 flex justify-center">
          <ArrowLink to="/how-it-works" tone="amber">
            See the full process
          </ArrowLink>
        </Reveal>
      </Section>

      {/* SECTION 5 — WHO WE HELP */}
      <Section bg="canvas">
        <SectionHeading
          align="center"
          eyebrow="Who we help"
          title="We built this for three groups of people. All of them matter equally."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audienceCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.title} delay={i * 0.08} className="h-full">
                <TiltCard className="h-full">
                  <Card
                    hover={false}
                    className="flex h-full flex-col p-7 transition-shadow duration-300 group-hover:shadow-cardHover"
                  >
                    <span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy transition-colors duration-300 group-hover:bg-electric group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="text-xl font-bold text-navy">{card.title}</h3>
                    <p className="mt-3 flex-1 leading-relaxed text-ink/75">{card.body}</p>
                    <div className="mt-6">
                      <ArrowLink to={card.cta.to} state={card.cta.state}>
                        {card.cta.label}
                      </ArrowLink>
                    </div>
                  </Card>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </Section>

      {/* SECTION 6 — WHAT YOU GET */}
      <Section bg="surface">
        <SectionHeading
          align="center"
          eyebrow="What you get working with us"
          title="Everyone leaves with something real."
        />
        <div className="mt-12">
          <BenefitTabs groups={benefitGroups} />
        </div>
      </Section>

      {/* SECTION 7 — PRICING */}
      <Section bg="white" id="pricing">
        <SectionHeading align="center" eyebrow="Pricing" title="Simple, transparent pricing." />

        <Reveal className="mx-auto mt-8 max-w-3xl">
          <div className="flex items-start gap-3 rounded-card border border-accent/40 bg-accent/5 p-5 sm:p-6">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <p className="text-[15px] leading-relaxed text-ink/80">
              EkaNex is currently complimentary for all participants during our initial cohort
              (2026). Pricing will be introduced following the completion of our first batch. Early
              partners will be notified in advance.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {pricingTiers.map((tier, i) => (
            <Reveal
              key={tier.name}
              delay={i * 0.08}
              className={`relative flex flex-col rounded-card border bg-canvas p-7 ${
                tier.popular ? 'border-navy/30 ring-1 ring-navy/15' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded-full bg-slate-200/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Coming Soon
                </span>
                {tier.popular ? (
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-dark">
                    Most Popular
                  </span>
                ) : null}
              </div>

              <h3 className="mt-5 text-xl font-bold text-slate-500">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{tier.audience}</p>

              <div className="mt-5 flex items-baseline gap-2 text-slate-400">
                <span className="text-3xl font-extrabold line-through decoration-slate-300">
                  ₹ 00,000
                </span>
                <span className="text-sm">/ cohort</span>
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                Pricing to be announced
              </p>

              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-3 text-[15px] text-slate-500">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 flex items-center justify-center gap-2 text-center">
          <BadgeCheck className="h-5 w-5 text-forest" aria-hidden="true" />
          <p className="text-lg font-semibold text-navy">
            For students: EkaNex is free to join. Always.
          </p>
        </Reveal>
      </Section>

      {/* SECTION 8 — CONTACT CTA */}
      <Section bg="navy">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading align="center" onDark title="Ready to get involved?" />
          <Reveal as="p" delay={0.05} className="mt-5 text-lg leading-relaxed text-white/80">
            Whether you are a student looking to apply, a business with a challenge to solve, or a
            school exploring partnerships — we want to hear from you.
          </Reveal>
          <Reveal className="mt-8 flex flex-col flex-wrap justify-center gap-3 sm:flex-row">
            <CTAButton to="/apply" state={{ role: 'Student' }} variant="amber" size="lg">
              Apply as a Student →
            </CTAButton>
            <CTAButton to="/apply" state={{ role: 'Organization' }} variant="whiteOutline" size="lg">
              Post a Project →
            </CTAButton>
            <CTAButton to="/contact" variant="whiteOutline" size="lg">
              Get in Touch →
            </CTAButton>
          </Reveal>
        </div>
      </Section>
    </PageTransition>
  );
}
