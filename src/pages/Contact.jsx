import { Building2, GraduationCap, Mail, Phone, MapPin, Clock, Instagram, Linkedin } from 'lucide-react';
import SEO from '../components/SEO';
import PageTransition from '../components/PageTransition';
import PageHero from '../components/PageHero';
import Section from '../components/Section';
import Reveal from '../components/Reveal';
import Card from '../components/Card';
import ContactForm from '../components/ContactForm';
import { SITE, ORG_ENQUIRY_TYPES, STUDENT_ENQUIRY_TYPES } from '../data/site';

const orgTags = [
  'School partnerships',
  'SME collaborations',
  'Business enquiries',
  'Sponsorships',
  'General partnership requests',
];
const studentTags = ['Student registrations', 'Programme enquiries', 'Support', 'General questions'];

function Tags({ items }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((t) => (
        <li
          key={t}
          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function Contact() {
  const infoCards = [
    { icon: Mail, label: 'Email', value: SITE.email, href: `mailto:${SITE.email}` },
    { icon: Phone, label: 'Phone', value: SITE.phone, href: SITE.phoneHref },
    { icon: MapPin, label: 'Based in', value: SITE.location },
    { icon: Clock, label: 'Response time', value: SITE.responseTime },
  ];

  return (
    <PageTransition>
      <SEO
        title="Contact EkaNex — Get in Touch"
        description="Reach out to EkaNex. Organizations can enquire about school partnerships, SME collaborations, sponsorships and more. Students can register interest, ask about the programme, or get support."
        path="/contact"
      />

      {/* SECTION 1 — PAGE INTRODUCTION */}
      <PageHero
        eyebrow="Contact us"
        title="We would love to hear from you."
        subtitle="Choose the path that fits you. Organizations and students each have a dedicated form below — we read and reply to every message within 2 working days."
      />

      {/* SECTION 2 — TWO ENQUIRY PANELS */}
      <Section bg="canvas">
        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
          {/* For Organizations */}
          <Reveal className="h-full">
            <Card
              hover={false}
              className="relative flex h-full flex-col overflow-hidden p-7 sm:p-8"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-electric" />
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-electric/10 text-electric">
                  <Building2 className="h-6 w-6" />
                </span>
                <div>
                  <p className="eyebrow text-electric">For Organizations</p>
                  <h2 className="text-xl font-bold text-navy sm:text-2xl">Partner with EkaNex</h2>
                </div>
              </div>
              <p className="mt-4 leading-relaxed text-ink/75">
                Schools, SMEs, sponsors and partners — start a conversation about working with us.
              </p>
              <Tags items={orgTags} />
              <div className="mt-6 flex-1">
                <ContactForm
                  idPrefix="org"
                  orgLabel="Organisation / School"
                  orgPlaceholder="Your organisation or school name"
                  orgRequired
                  dropdownLabel="Enquiry type"
                  options={ORG_ENQUIRY_TYPES}
                  submitLabel="Send Partnership Enquiry →"
                  submitVariant="primary"
                />
              </div>
            </Card>
          </Reveal>

          {/* For Students */}
          <Reveal delay={0.1} className="h-full">
            <Card
              hover={false}
              className="relative flex h-full flex-col overflow-hidden p-7 sm:p-8"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-accent" />
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent-dark">
                  <GraduationCap className="h-6 w-6" />
                </span>
                <div>
                  <p className="eyebrow text-accent-dark">For Students</p>
                  <h2 className="text-xl font-bold text-navy sm:text-2xl">Join the programme</h2>
                </div>
              </div>
              <p className="mt-4 leading-relaxed text-ink/75">
                Register your interest, ask about the programme, or get support — no experience needed.
              </p>
              <Tags items={studentTags} />
              <div className="mt-6 flex-1">
                <ContactForm
                  idPrefix="student"
                  orgLabel="School"
                  orgPlaceholder="Your school name"
                  dropdownLabel="Enquiry type"
                  options={STUDENT_ENQUIRY_TYPES}
                  submitLabel="Send Student Enquiry →"
                  submitVariant="electric"
                />
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* SECTION 3 — DIRECT CONTACT + SOCIAL */}
      <Section bg="surface">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-section font-bold text-navy">Prefer to reach us directly?</h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            We are a small team and we read every message personally. Reach us at any of the below —
            we reply within 2 working days.
          </p>
        </Reveal>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {infoCards.map((c) => {
            const Icon = c.icon;
            const inner = (
              <Card className="flex h-full flex-col items-center p-6 text-center">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy/5 text-navy">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                  {c.label}
                </p>
                <p className="mt-1 break-words font-semibold text-navy">{c.value}</p>
              </Card>
            );
            return c.href ? (
              <a key={c.label} href={c.href} className="block focus-visible:outline-none">
                {inner}
              </a>
            ) : (
              <div key={c.label}>{inner}</div>
            );
          })}
        </div>

        <Reveal className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={SITE.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <Instagram className="h-5 w-5 text-accent" aria-hidden="true" />
            {SITE.instagram}
          </a>
          <a
            href={SITE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-navy shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-card"
          >
            <Linkedin className="h-5 w-5 text-electric" aria-hidden="true" />
            {SITE.linkedin}
          </a>
        </Reveal>
      </Section>
    </PageTransition>
  );
}
