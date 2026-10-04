import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  GraduationCap,
  Sparkles,
  Briefcase,
  Link2,
  Target,
  CalendarClock,
  Users,
  Heart,
  Lightbulb,
  ShieldCheck,
  FileCheck,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Plus,
  Trash2,
  Upload,
  Clock,
} from 'lucide-react';

const ease = [0.22, 1, 0.36, 1];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SKILLS = [
  'Research', 'Business analysis', 'Finance', 'Marketing', 'Sales', 'Entrepreneurship',
  'Coding', 'AI & machine learning', 'Graphic design', 'UI/UX', 'Content writing',
  'Social media', 'Video editing', 'Public speaking', 'Data analysis', 'Presentation',
  'Project management',
];
const PROJECT_TYPES = [
  'Finance', 'Marketing', 'Market research', 'Business strategy', 'Technology', 'AI',
  'Operations', 'Sales', 'Product development', 'Sustainability', 'Entrepreneurship',
];
const CURRICULA = ['IB', 'CBSE', 'ICSE', 'IGCSE / Cambridge', 'A-Levels', 'State board', 'Other'];
const GRADES = ['Grade 11', 'Grade 12', 'First-year undergraduate', 'Other'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS_WEEK = ['Under 5 hours', '5–6 hours', '6–8 hours', '8–10 hours', '10+ hours'];
const WORK_HOURS = ['Mornings', 'Afternoons', 'Evenings', 'Weekends', 'Flexible'];
const DURATIONS = ['5 weeks', '6 weeks', '7 weeks', 'Flexible'];
const TEAM_MODE = ['Individually', 'In a team', 'Either works'];
const TEAM_ROLES = [
  'Leader / coordinator', 'Researcher / analyst', 'Creative / designer',
  'Communicator / presenter', 'Builder / doer', 'I adapt to what’s needed',
];
const TEAM_SIZES = ['2', '3', '4'];
const YES_NO = ['Yes', 'No'];
const HEAR_ABOUT = ['School / teacher', 'Friend', 'Instagram', 'LinkedIn', 'A partner company', 'Event / workshop', 'Other'];
const RELATIONSHIPS = ['Mother', 'Father', 'Guardian', 'Other'];

/* ------------------------------- primitives ------------------------------ */

const inp =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30';

function Shell({ label, required, optional, hint, error, children }) {
  return (
    <div>
      {label ? (
        <label className="mb-1.5 block text-sm font-semibold text-ink">
          {label} {required ? <span className="text-red-500">*</span> : null}
          {optional ? <span className="font-normal text-muted"> (optional)</span> : null}
        </label>
      ) : null}
      {hint ? <p className="-mt-0.5 mb-2 text-xs leading-relaxed text-muted">{hint}</p> : null}
      {children}
      {error ? <p role="alert" className="mt-1.5 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

const Text = (p) => (
  <Shell {...p}>
    <input
      type={p.type || 'text'}
      value={p.value || ''}
      onChange={(e) => p.onChange(e.target.value)}
      placeholder={p.placeholder}
      className={`${inp} ${p.error ? 'border-red-400' : ''}`}
    />
  </Shell>
);

const Area = (p) => (
  <Shell {...p}>
    <textarea
      rows={p.rows || 4}
      value={p.value || ''}
      onChange={(e) => p.onChange(e.target.value)}
      placeholder={p.placeholder}
      className={`${inp} resize-y ${p.error ? 'border-red-400' : ''}`}
    />
  </Shell>
);

const Pick = (p) => (
  <Shell {...p}>
    <select
      value={p.value || ''}
      onChange={(e) => p.onChange(e.target.value)}
      className={`${inp} ${p.value ? 'text-ink' : 'text-slate-400'} ${p.error ? 'border-red-400' : ''}`}
    >
      <option value="" disabled>Select…</option>
      {p.options.map((o) => <option key={o} value={o} className="text-ink">{o}</option>)}
    </select>
  </Shell>
);

function Chips({ label, required, optional, hint, error, options, value = [], onChange }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <Shell label={label} required={required} optional={optional} hint={hint} error={error}>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                on ? 'border-electric bg-electric text-white' : 'border-slate-200 bg-white text-navy hover:border-electric/50'
              }`}
            >
              {on ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
              {o}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Choice({ label, required, optional, hint, error, options, value, onChange, cols = 2 }) {
  return (
    <Shell label={label} required={required} optional={optional} hint={hint} error={error}>
      <div className={`grid gap-2 ${cols === 1 ? '' : 'sm:grid-cols-2'}`}>
        {options.map((o) => {
          const on = value === o;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                on ? 'border-electric text-navy ring-2 ring-electric/15' : 'border-slate-200 text-ink/80 hover:border-electric/50'
              }`}
            >
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-electric' : 'border-slate-300'}`}>
                {on ? <span className="h-2 w-2 rounded-full bg-electric" /> : null}
              </span>
              {o}
            </button>
          );
        })}
      </div>
    </Shell>
  );
}

function Scale({ label, optional, hint, value, onChange, lowLabel, highLabel }) {
  return (
    <Shell label={label} optional={optional} hint={hint}>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-10 w-10 rounded-xl border text-sm font-bold transition-colors ${
              value === n ? 'border-electric bg-electric text-white' : 'border-slate-200 text-navy hover:border-electric/50'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </Shell>
  );
}

function CheckRow({ label, checked, onChange, error }) {
  return (
    <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${checked ? 'border-electric/40 bg-electric/5' : error ? 'border-red-300' : 'border-slate-200 hover:border-electric/40'}`}>
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-slate-300 text-electric focus:ring-electric"
      />
      <span className="text-sm leading-relaxed text-ink/85">{label}</span>
    </label>
  );
}

/* --------------------------- experience repeater -------------------------- */

function Experiences({ value = [], onChange }) {
  const add = () => onChange([...value, { org: '', role: '', duration: '', work: '', outcome: '' }]);
  const upd = (i, k, v) => onChange(value.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  const del = (i) => onChange(value.filter((_, j) => j !== i));
  return (
    <div className="space-y-4">
      {value.map((e, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-navy">Experience {i + 1}</p>
            <button type="button" onClick={() => del(i)} className="inline-flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Text label="Organization / project" value={e.org} onChange={(v) => upd(i, 'org', v)} placeholder="e.g. School robotics club" />
            <Text label="Your role" value={e.role} onChange={(v) => upd(i, 'role', v)} placeholder="e.g. Team lead" />
            <Text label="Duration" value={e.duration} onChange={(v) => upd(i, 'duration', v)} placeholder="e.g. 6 months" />
            <Text label="What you worked on" value={e.work} onChange={(v) => upd(i, 'work', v)} placeholder="Briefly" />
          </div>
          <div className="mt-3">
            <Text label="Key outcome or achievement" value={e.outcome} onChange={(v) => upd(i, 'outcome', v)} placeholder="e.g. Won regional finals" />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:border-electric hover:text-electric"
      >
        <Plus className="h-4 w-4" /> {value.length ? 'Add another experience' : 'Add an experience'}
      </button>
    </div>
  );
}

function FileField({ label, optional, hint, value, onChange }) {
  return (
    <Shell label={label} optional={optional} hint={hint}>
      <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-muted transition-colors hover:border-electric">
        <Upload className="h-5 w-5 text-electric" />
        <span>{value?.name ? <span className="font-semibold text-navy">{value.name}</span> : 'Choose a PDF or Word file…'}</span>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            onChange(f ? { name: f.name, size: f.size } : null);
          }}
        />
      </label>
    </Shell>
  );
}

/* --------------------------------- steps --------------------------------- */

function buildSteps(f, set, errors) {
  const e = errors || {};
  return [
    {
      key: 'basic', title: 'Basic information', icon: User,
      subtitle: 'Let’s start with the essentials.',
      body: (
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Full name" required value={f.fullName} onChange={(v) => set('fullName', v)} error={e.fullName} placeholder="Your full name" />
          <Text label="Preferred name" optional value={f.preferredName} onChange={(v) => set('preferredName', v)} placeholder="What we should call you" />
          <Text label="Age" required type="number" value={f.age} onChange={(v) => set('age', v)} error={e.age} placeholder="e.g. 16" />
          <Text label="Date of birth" required type="date" value={f.dob} onChange={(v) => set('dob', v)} error={e.dob} />
          <Text label="Email" required type="email" value={f.email} onChange={(v) => set('email', v)} error={e.email} placeholder="you@example.com" />
          <Text label="Phone number" required value={f.phone} onChange={(v) => set('phone', v)} error={e.phone} placeholder="+91…" />
          <Text label="City" required value={f.city} onChange={(v) => set('city', v)} error={e.city} placeholder="e.g. Gurugram" />
          <Text label="School" required value={f.school} onChange={(v) => set('school', v)} error={e.school} placeholder="Your school" />
          <Pick label="Current grade" required options={GRADES} value={f.grade} onChange={(v) => set('grade', v)} error={e.grade} />
          <Text label="Graduation year" required type="number" value={f.gradYear} onChange={(v) => set('gradYear', v)} error={e.gradYear} placeholder="e.g. 2027" />
        </div>
      ),
      validate: (x) => {
        const er = {};
        ['fullName', 'age', 'dob', 'email', 'phone', 'city', 'school', 'grade', 'gradYear'].forEach((k) => {
          if (!String(x[k] || '').trim()) er[k] = 'Required';
        });
        if (x.email && !emailRe.test(x.email)) er.email = 'Enter a valid email.';
        if (x.age && (Number(x.age) < 12 || Number(x.age) > 25)) er.age = 'Enter a valid age.';
        return er;
      },
    },
    {
      key: 'academic', title: 'Academic profile', icon: GraduationCap,
      subtitle: 'Tell us how you’re doing and what you love studying.',
      body: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Pick label="Curriculum" required options={CURRICULA} value={f.curriculum} onChange={(v) => set('curriculum', v)} error={e.curriculum} />
            <Text label="Latest overall academic performance" required value={f.performance} onChange={(v) => set('performance', v)} error={e.performance} placeholder="e.g. 92% / 3.8 GPA / 38 IB" />
          </div>
          <Text label="Strongest subjects" required value={f.strongestSubjects} onChange={(v) => set('strongestSubjects', v)} error={e.strongestSubjects} placeholder="e.g. Economics, Maths, English" />
          <Text label="Subjects of interest" required value={f.interestSubjects} onChange={(v) => set('interestSubjects', v)} error={e.interestSubjects} placeholder="What you enjoy most" />
          <Area label="Academic achievements" optional rows={3} value={f.achievements} onChange={(v) => set('achievements', v)} placeholder="Olympiads, honours, scholarships…" />
          <Area label="Relevant courses or certifications" optional rows={3} value={f.certifications} onChange={(v) => set('certifications', v)} placeholder="Online courses, workshops, certificates…" />
        </div>
      ),
      validate: (x) => {
        const er = {};
        ['curriculum', 'performance', 'strongestSubjects', 'interestSubjects'].forEach((k) => {
          if (!String(x[k] || '').trim()) er[k] = 'Required';
        });
        return er;
      },
    },
    {
      key: 'skills', title: 'Skills', icon: Sparkles,
      subtitle: 'Pick everything you can bring to a project.',
      body: (
        <div className="space-y-5">
          <Chips label="Select your skills" required hint="Choose all that apply — there are no wrong answers." options={SKILLS} value={f.skills} onChange={(v) => set('skills', v)} error={e.skills} />
          <Area
            label="What are your top 3 skills? Briefly explain your experience with each."
            required rows={5}
            hint="List three, and for each give a sentence on where you’ve used it."
            value={f.topSkills}
            onChange={(v) => set('topSkills', v)}
            error={e.topSkills}
            placeholder="e.g. Research — I ran a market survey for our school fundraiser…"
          />
        </div>
      ),
      validate: (x) => {
        const er = {};
        if (!x.skills || x.skills.length < 1) er.skills = 'Select at least one skill.';
        if (!String(x.topSkills || '').trim() || x.topSkills.trim().length < 30) er.topSkills = 'Please explain your top 3 skills (a few sentences).';
        return er;
      },
    },
    {
      key: 'experience', title: 'Experience', icon: Briefcase,
      subtitle: 'Internships, projects, competitions, leadership, clubs — whatever you’ve done. New to this? That’s completely fine — you can skip.',
      body: (
        <Shell label="Your experiences" optional hint="Add as many as you like. Include projects, competitions, entrepreneurship, leadership, volunteering or extracurriculars.">
          <Experiences value={f.experiences} onChange={(v) => set('experiences', v)} />
        </Shell>
      ),
      validate: () => ({}),
    },
    {
      key: 'portfolio', title: 'Portfolio', icon: Link2,
      subtitle: 'Share anything that shows your work. All optional.',
      body: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="LinkedIn profile" optional value={f.linkedin} onChange={(v) => set('linkedin', v)} placeholder="linkedin.com/in/…" />
            <Text label="Personal portfolio / website" optional value={f.website} onChange={(v) => set('website', v)} placeholder="https://…" />
            <Text label="GitHub" optional value={f.github} onChange={(v) => set('github', v)} placeholder="github.com/…" />
            <Text label="Previous project links" optional value={f.projectLinks} onChange={(v) => set('projectLinks', v)} placeholder="Drive, Behance, YouTube…" />
          </div>
          <FileField label="Resume / CV" optional hint="PDF or Word, up to a few pages." value={f.resume} onChange={(v) => set('resume', v)} />
          <Area label="Optional work samples" optional rows={3} value={f.workSamples} onChange={(v) => set('workSamples', v)} placeholder="Describe or link any work you’re proud of." />
        </div>
      ),
      validate: () => ({}),
    },
    {
      key: 'prefs', title: 'Project preferences', icon: Target,
      subtitle: 'What kind of business problems excite you?',
      body: (
        <div className="space-y-5">
          <Chips label="Types of problems you want to work on" required options={PROJECT_TYPES} value={f.projectTypes} onChange={(v) => set('projectTypes', v)} error={e.projectTypes} />
          <Area
            label="What type of real-world business project would you be most interested in working on?"
            required rows={4}
            value={f.projectInterest}
            onChange={(v) => set('projectInterest', v)}
            error={e.projectInterest}
            placeholder="Describe the kind of challenge you’d love to take on."
          />
        </div>
      ),
      validate: (x) => {
        const er = {};
        if (!x.projectTypes || x.projectTypes.length < 1) er.projectTypes = 'Select at least one.';
        if (!String(x.projectInterest || '').trim() || x.projectInterest.trim().length < 20) er.projectInterest = 'Tell us a little more.';
        return er;
      },
    },
    {
      key: 'availability', title: 'Availability', icon: CalendarClock,
      subtitle: 'Projects run for 5–7 weeks. Help us plan around your school.',
      body: (
        <div className="space-y-5">
          <Pick label="Hours available per week" required options={HOURS_WEEK} value={f.hoursWeek} onChange={(v) => set('hoursWeek', v)} error={e.hoursWeek} />
          <Chips label="Preferred working days" required options={DAYS} value={f.workingDays} onChange={(v) => set('workingDays', v)} error={e.workingDays} />
          <Chips label="Preferred working hours" optional options={WORK_HOURS} value={f.workingHours} onChange={(v) => set('workingHours', v)} />
          <Choice label="Available during school holidays?" required options={YES_NO} value={f.holidays} onChange={(v) => set('holidays', v)} error={e.holidays} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Earliest start date" required type="date" value={f.startDate} onChange={(v) => set('startDate', v)} error={e.startDate} />
            <Pick label="Expected project duration" optional options={DURATIONS} value={f.duration} onChange={(v) => set('duration', v)} />
          </div>
        </div>
      ),
      validate: (x) => {
        const er = {};
        if (!x.hoursWeek) er.hoursWeek = 'Required';
        if (!x.workingDays || x.workingDays.length < 1) er.workingDays = 'Pick at least one day.';
        if (!x.holidays) er.holidays = 'Required';
        if (!x.startDate) er.startDate = 'Required';
        return er;
      },
    },
    {
      key: 'team', title: 'Team preferences', icon: Users,
      subtitle: 'Most projects run in small teams of 2–3.',
      body: (
        <div className="space-y-5">
          <Choice label="Do you prefer working individually or in a team?" required options={TEAM_MODE} value={f.teamMode} onChange={(v) => set('teamMode', v)} error={e.teamMode} />
          <Choice label="What role do you usually take in a team?" required cols={1} options={TEAM_ROLES} value={f.teamRole} onChange={(v) => set('teamRole', v)} error={e.teamRole} />
          <Choice label="Preferred team size" required options={TEAM_SIZES} value={f.teamSize} onChange={(v) => set('teamSize', v)} error={e.teamSize} />
          <Choice label="Comfortable working with students from other schools?" required options={YES_NO} value={f.otherSchools} onChange={(v) => set('otherSchools', v)} error={e.otherSchools} />
        </div>
      ),
      validate: (x) => {
        const er = {};
        ['teamMode', 'teamRole', 'teamSize', 'otherSchools'].forEach((k) => {
          if (!x[k]) er[k] = 'Required';
        });
        return er;
      },
    },
    {
      key: 'motivation', title: 'Motivation', icon: Heart,
      subtitle: 'This is your chance to stand out — be honest and specific.',
      body: (
        <div className="space-y-4">
          <Area label="What motivates you to participate in this program?" required rows={4} value={f.motivation} onChange={(v) => set('motivation', v)} error={e.motivation} />
          <Area label="What do you hope to learn from working with a real business?" required rows={4} value={f.learn} onChange={(v) => set('learn', v)} error={e.learn} />
          <Area label="Why should we select you for this opportunity?" required rows={4} value={f.whyYou} onChange={(v) => set('whyYou', v)} error={e.whyYou} />
          <Scale label="How confident are you working directly with a business?" optional value={f.confidence} onChange={(v) => set('confidence', v)} lowLabel="A little nervous" highLabel="Very confident" />
        </div>
      ),
      validate: (x) => {
        const er = {};
        [['motivation', 'motivation'], ['learn', 'learn'], ['whyYou', 'whyYou']].forEach(([k]) => {
          if (!String(x[k] || '').trim() || x[k].trim().length < 20) er[k] = 'Please write a couple of sentences.';
        });
        return er;
      },
    },
    {
      key: 'case', title: 'Problem-solving', icon: Lightbulb,
      subtitle: 'A short business case — there’s no single right answer. We want to see how you think.',
      body: (
        <div className="space-y-4">
          <div className="rounded-xl border border-electric/20 bg-electric/5 p-4 text-[15px] leading-relaxed text-ink/85">
            “A local business has strong products but receives very few customers through Instagram. What would you do during your <strong>first week</strong> to understand the problem and develop a solution?”
          </div>
          <Area label="Your response" required rows={7} value={f.caseResponse} onChange={(v) => set('caseResponse', v)} error={e.caseResponse} placeholder="Walk us through your approach — what you’d look at, who you’d talk to, and what you’d do first." />
        </div>
      ),
      validate: (x) => {
        const er = {};
        if (!String(x.caseResponse || '').trim() || x.caseResponse.trim().length < 60) er.caseResponse = 'Give this a proper go — a short paragraph at least.';
        return er;
      },
    },
    {
      key: 'guardian', title: 'Parent / guardian', icon: ShieldCheck,
      subtitle: 'Because applicants are under 18, we need a parent or guardian’s details and consent.',
      body: (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Text label="Parent / guardian name" required value={f.pgName} onChange={(v) => set('pgName', v)} error={e.pgName} />
            <Pick label="Relationship to student" required options={RELATIONSHIPS} value={f.pgRelation} onChange={(v) => set('pgRelation', v)} error={e.pgRelation} />
            <Text label="Parent / guardian email" required type="email" value={f.pgEmail} onChange={(v) => set('pgEmail', v)} error={e.pgEmail} />
            <Text label="Parent / guardian phone" required value={f.pgPhone} onChange={(v) => set('pgPhone', v)} error={e.pgPhone} />
          </div>
          <div className="space-y-2.5 pt-1">
            <CheckRow label="I, the parent/guardian, consent to my child participating in the EkaNex programme." checked={f.pgConsentParticipate} onChange={(v) => set('pgConsentParticipate', v)} error={e.pgConsentParticipate} />
            <CheckRow label="I consent to being contacted by EkaNex regarding the programme." checked={f.pgConsentContact} onChange={(v) => set('pgConsentContact', v)} error={e.pgConsentContact} />
          </div>
        </div>
      ),
      validate: (x) => {
        const er = {};
        ['pgName', 'pgRelation', 'pgEmail', 'pgPhone'].forEach((k) => {
          if (!String(x[k] || '').trim()) er[k] = 'Required';
        });
        if (x.pgEmail && !emailRe.test(x.pgEmail)) er.pgEmail = 'Enter a valid email.';
        if (!x.pgConsentParticipate) er.pgConsentParticipate = 'Parental consent is required.';
        if (!x.pgConsentContact) er.pgConsentContact = 'This consent is required.';
        return er;
      },
    },
    {
      key: 'declarations', title: 'Declarations', icon: FileCheck,
      subtitle: 'Please confirm the following before you submit.',
      body: (
        <div className="space-y-2.5">
          <CheckRow label="The information I have provided is accurate and truthful." checked={f.declAccurate} onChange={(v) => set('declAccurate', v)} error={e.declAccurate} />
          <CheckRow label="I understand the expected commitment (around 5–6 hours a week for 5–7 weeks)." checked={f.declCommitment} onChange={(v) => set('declCommitment', v)} error={e.declCommitment} />
          <CheckRow label="I agree to follow the programme’s code of conduct." checked={f.declConduct} onChange={(v) => set('declConduct', v)} error={e.declConduct} />
          <CheckRow label="My parent/guardian has approved my participation." checked={f.declParent} onChange={(v) => set('declParent', v)} error={e.declParent} />
        </div>
      ),
      validate: (x) => {
        const er = {};
        ['declAccurate', 'declCommitment', 'declConduct', 'declParent'].forEach((k) => {
          if (!x[k]) er[k] = 'Please confirm to continue.';
        });
        return er;
      },
    },
    {
      key: 'final', title: 'Final questions', icon: HelpCircle,
      subtitle: 'Almost done — a few last things.',
      body: (
        <div className="space-y-4">
          <Pick label="How did you hear about us?" optional options={HEAR_ABOUT} value={f.hearAbout} onChange={(v) => set('hearAbout', v)} />
          <Text label="Referral code" optional value={f.referral} onChange={(v) => set('referral', v)} placeholder="If someone referred you" />
          <Area label="Anything else you’d like us to know?" optional rows={4} value={f.anythingElse} onChange={(v) => set('anythingElse', v)} />
        </div>
      ),
      validate: () => ({}),
    },
  ];
}

/* ----------------------------- autosave helpers --------------------------- */
function agoShort(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 5) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function SaveStatus({ save }) {
  if (save.status === 'saving') {
    return <span className="inline-flex items-center gap-1.5 text-slate-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" /> Saving…</span>;
  }
  if (save.status === 'saved' || save.status === 'restored') {
    return <span className="inline-flex items-center gap-1 text-forest"><Check className="h-3.5 w-3.5" strokeWidth={3} /> Saved{save.at ? ` · ${agoShort(save.at)}` : ''}</span>;
  }
  return null;
}

/* -------------------------------- component ------------------------------- */

export default function ApplicationForm({ opp, prefill = {}, onBack, onSubmit }) {
  // Autosave: progress is persisted per role + student so nothing is lost on
  // refresh / navigate-away / close. The draft is cleared on successful submit.
  const draftKey = `ekanex.draft.${opp?.id || 'app'}.${(prefill.email || 'anon').toLowerCase()}`;
  const loadDraft = () => { try { return JSON.parse(localStorage.getItem(draftKey) || 'null'); } catch { return null; } };
  const savedRef = useRef(loadDraft());
  const saved0 = savedRef.current;

  const defaults = {
    fullName: prefill.name || '',
    email: prefill.email || '',
    school: prefill.school || '',
    grade: prefill.year || '',
    skills: [], projectTypes: [], workingDays: [], workingHours: [], experiences: [],
  };

  const [started, setStarted] = useState(!!saved0);          // resume straight into the form if a draft exists
  const [i, setI] = useState(saved0?.i || 0);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [form, setForm] = useState(() => ({ ...defaults, ...(saved0?.form || {}) }));
  const [save, setSave] = useState({ status: saved0 ? 'restored' : 'idle', at: saved0?.at || null });
  const [restoredNote, setRestoredNote] = useState(!!saved0);
  const [, forceTick] = useState(0);

  const set = (k, v) => {
    setForm((s) => ({ ...s, [k]: v }));
    // Clear a field's validation error as soon as the student fixes it.
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e));
  };

  // Debounced autosave once the student has started.
  const saveTimer = useRef();
  useEffect(() => {
    if (!started) return undefined;
    setSave((s) => ({ ...s, status: 'saving' }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem(draftKey, JSON.stringify({ form, i, at: Date.now() })); } catch {}
      setSave({ status: 'saved', at: Date.now() });
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [form, i, started]);

  // Keep the "saved X ago" label fresh.
  useEffect(() => { const id = setInterval(() => forceTick((t) => t + 1), 15000); return () => clearInterval(id); }, []);

  const clearDraft = () => { try { localStorage.removeItem(draftKey); } catch {} };
  const steps = buildSteps(form, set, errors);
  const total = steps.length;
  const step = steps[i];
  const isLast = i === total - 1;
  const pct = Math.round(((i + 1) / total) * 100);

  const goNext = () => {
    const er = step.validate(form);
    setErrors(er);
    if (Object.keys(er).length) return;
    setI((n) => n + 1);
    window.scrollTo({ top: 0 });
  };
  const goBack = () => {
    setErrors({});
    if (i === 0) onBack();
    else {
      setI((n) => n - 1);
      window.scrollTo({ top: 0 });
    }
  };
  const doSubmit = async () => {
    const er = step.validate(form);
    setErrors(er);
    if (Object.keys(er).length) return;
    setSubmitting(true);
    setSubmitError('');
    const res = await onSubmit(form);
    setSubmitting(false);
    if (res && res.ok === false) setSubmitError(res.error || 'Something went wrong. Please try again.');
    else clearDraft(); // application submitted — the draft is no longer needed
  };

  /* ------- intro ------- */
  if (!started) {
    return (
      <div className="container-px flex flex-1 items-center justify-center py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="w-full max-w-2xl"
        >
          <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted transition-colors hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Back to role
          </button>
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-card sm:p-9">
            <p className="eyebrow text-electric">Application</p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">
              {opp ? <>Apply for {opp.roleTitle} at {opp.company}</> : 'Student application'}
            </h1>
            <p className="mt-4 leading-relaxed text-ink/75">
              This is a real, selective application — it helps us understand who you are and match you to the right project and team. Take your time and be honest; there are no trick questions.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Clock, t: '12–15 minutes', s: 'You can’t save mid-way yet, so set aside a little time.' },
                { icon: FileCheck, t: '13 short sections', s: 'A progress bar keeps you on track throughout.' },
                { icon: ShieldCheck, t: 'Safe & private', s: 'Parental consent is built in for under-18s.' },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.t} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <Icon className="h-5 w-5 text-electric" />
                    <p className="mt-2 text-sm font-bold text-navy">{c.t}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{c.s}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-relaxed text-muted">
              <strong className="text-ink/80">Privacy (under 18):</strong> EkaNex collects this information only to review your application and, if selected, to run your placement. A parent or guardian must consent before you can take part. We never share your personal contact details with businesses — all communication runs through EkaNex. You can ask us to delete your data at any time.
            </div>
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-6 py-3.5 font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark hover:-translate-y-0.5 hover:shadow-cardHover active:scale-[0.98] sm:w-auto"
            >
              Start application <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ------- form ------- */
  const Icon = step.icon;
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 pb-28 pt-6 sm:px-6">
      {/* Applying-to banner */}
      {opp ? (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-bold text-white" style={{ backgroundImage: `linear-gradient(135deg, ${opp.logoFrom}, ${opp.logoTo})` }}>
            {opp.initials}
          </span>
          <p className="text-sm text-muted">
            Applying for <span className="font-semibold text-navy">{opp.roleTitle}</span> at <span className="font-semibold text-navy">{opp.company}</span>
          </p>
        </div>
      ) : null}

      {/* Draft restored note */}
      {restoredNote ? (
        <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-forest/25 bg-forest/5 px-3 py-2 text-sm text-forest">
          <span className="inline-flex items-center gap-2"><Check className="h-4 w-4" strokeWidth={3} /> Draft restored — your previous answers are here.</span>
          <button type="button" onClick={() => setRestoredNote(false)} className="rounded-lg p-1 text-forest/70 hover:bg-forest/10" aria-label="Dismiss"><X className="h-4 w-4" /></button>
        </div>
      ) : null}

      {/* Progress */}
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-semibold text-navy">
          Step {i + 1} of {total} · {step.title}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-xs"><SaveStatus save={save} /></span>
          <span className="text-muted">{pct}%</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div className="h-full rounded-full bg-electric" animate={{ width: `${pct}%` }} transition={{ duration: 0.35, ease }} />
      </div>

      {/* Step body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.28, ease }}
          className="mt-7"
        >
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric/10 text-electric">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-navy">{step.title}</h2>
              <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.subtitle}</p>
            </div>
          </div>
          <div className="mt-6">{step.body}</div>
          {submitError ? <p role="alert" className="mt-4 text-sm text-red-600">{submitError}</p> : null}
        </motion.div>
      </AnimatePresence>

      {/* Sticky footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-5 py-3 sm:px-6">
          <button type="button" onClick={goBack} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> {i === 0 ? 'Back' : 'Previous'}
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={doSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:brightness-105 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-80"
            >
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>) : (<>Submit application <Check className="h-4 w-4" strokeWidth={3} /></>)}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-electric px-6 py-2.5 text-sm font-semibold text-white shadow-card ring-1 ring-inset ring-white/15 transition-all hover:bg-electric-dark hover:-translate-y-0.5 active:scale-[0.98]"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
