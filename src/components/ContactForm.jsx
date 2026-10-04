import { useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import CTAButton from './CTAButton';
import { submitEnquiry } from '../lib/api';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE = 20;

/**
 * Configurable, frontend-only contact form. Reused for the Organizations and
 * Students panels on the Contact page. `idPrefix` keeps field ids unique when
 * two forms share a page.
 */
export default function ContactForm({
  idPrefix = 'contact',
  orgLabel = 'Organisation / School',
  orgPlaceholder = 'Business name, school name, or leave blank',
  orgRequired = false,
  dropdownLabel = 'Enquiry type',
  dropdownPlaceholder = 'Select one…',
  options = [],
  initialOption = '',
  submitLabel = 'Send Message →',
  submitVariant = 'primary',
}) {
  const emptyValues = { name: '', email: '', org: '', topic: initialOption, message: '' };
  const [values, setValues] = useState(emptyValues);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const id = (f) => `${idPrefix}-${f}`;

  function validate(v) {
    const e = {};
    if (!v.name.trim()) e.name = 'Please enter your full name.';
    if (!v.email.trim()) e.email = 'Please enter your email address.';
    else if (!emailRe.test(v.email.trim())) e.email = 'Please enter a valid email address.';
    if (orgRequired && !v.org.trim()) e.org = `Please enter your ${orgLabel.toLowerCase()}.`;
    if (!v.topic) e.topic = `Please select ${/^[aeiou]/i.test(dropdownLabel) ? 'an' : 'a'} ${dropdownLabel.toLowerCase()}.`;
    if (!v.message.trim()) e.message = 'Please enter a message.';
    else if (v.message.trim().length < MIN_MESSAGE)
      e.message = `Your message should be at least ${MIN_MESSAGE} characters.`;
    return e;
  }

  const update = (field) => (ev) => {
    const next = { ...values, [field]: ev.target.value };
    setValues(next);
    if (attempted) setErrors(validate(next));
  };
  const handleBlur = () => {
    if (attempted) setErrors(validate(values));
  };
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    setAttempted(true);
    if (Object.keys(found).length > 0) return;
    setSubmitting(true);
    setSubmitError('');
    const res = await submitEnquiry({ ...values, audience: idPrefix });
    setSubmitting(false);
    if (res.ok) setSuccess(true);
    else setSubmitError(res.error || 'Something went wrong. Please email us directly.');
  };
  const reset = () => {
    setValues(emptyValues);
    setErrors({});
    setAttempted(false);
    setSuccess(false);
    setSubmitError('');
  };

  const inputBase =
    'w-full rounded-xl border bg-white px-4 py-3 text-ink shadow-sm transition-colors placeholder:text-slate-400 focus:border-electric focus:outline-none focus:ring-2 focus:ring-electric/30';
  const borderFor = (f) => (errors[f] ? 'border-red-400' : 'border-slate-200');

  if (success) {
    return (
      <div
        className="rounded-card border border-forest/30 bg-forest/5 p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="mx-auto h-12 w-12 text-forest" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-navy">Message sent</h3>
        <p className="mx-auto mt-2 max-w-sm leading-relaxed text-ink/75">
          Thank you for reaching out. We will get back to you within 2 working days.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 font-semibold text-electric underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor={id('name')} className="mb-1.5 block text-sm font-semibold text-ink">
          Full Name <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id={id('name')}
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={update('name')}
          onBlur={handleBlur}
          aria-required="true"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? id('name-error') : undefined}
          className={`${inputBase} ${borderFor('name')}`}
          placeholder="Your full name"
        />
        {errors.name ? (
          <p id={id('name-error')} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={id('email')} className="mb-1.5 block text-sm font-semibold text-ink">
          Email Address <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <input
          id={id('email')}
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update('email')}
          onBlur={handleBlur}
          aria-required="true"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? id('email-error') : undefined}
          className={`${inputBase} ${borderFor('email')}`}
          placeholder="you@example.com"
        />
        {errors.email ? (
          <p id={id('email-error')} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={id('org')} className="mb-1.5 block text-sm font-semibold text-ink">
          {orgLabel}{' '}
          {orgRequired ? (
            <span className="text-red-500" aria-hidden="true">*</span>
          ) : (
            <span className="font-normal text-muted">(optional)</span>
          )}
        </label>
        <input
          id={id('org')}
          type="text"
          autoComplete="organization"
          value={values.org}
          onChange={update('org')}
          onBlur={handleBlur}
          aria-required={orgRequired}
          aria-invalid={Boolean(errors.org)}
          aria-describedby={errors.org ? id('org-error') : undefined}
          className={`${inputBase} ${borderFor('org')}`}
          placeholder={orgPlaceholder}
        />
        {errors.org ? (
          <p id={id('org-error')} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.org}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor={id('topic')} className="mb-1.5 block text-sm font-semibold text-ink">
          {dropdownLabel} <span className="text-red-500" aria-hidden="true">*</span>
        </label>
        <select
          id={id('topic')}
          value={values.topic}
          onChange={update('topic')}
          onBlur={handleBlur}
          aria-required="true"
          aria-invalid={Boolean(errors.topic)}
          aria-describedby={errors.topic ? id('topic-error') : undefined}
          className={`${inputBase} ${borderFor('topic')} ${values.topic ? 'text-ink' : 'text-slate-400'}`}
        >
          <option value="" disabled>
            {dropdownPlaceholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-ink">
              {o}
            </option>
          ))}
        </select>
        {errors.topic ? (
          <p id={id('topic-error')} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.topic}
          </p>
        ) : null}
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <label htmlFor={id('message')} className="block text-sm font-semibold text-ink">
            Message <span className="text-red-500" aria-hidden="true">*</span>
          </label>
          <span className="text-xs text-slate-400">
            {values.message.trim().length}/{MIN_MESSAGE} min
          </span>
        </div>
        <textarea
          id={id('message')}
          rows={4}
          value={values.message}
          onChange={update('message')}
          onBlur={handleBlur}
          aria-required="true"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? id('message-error') : undefined}
          className={`${inputBase} ${borderFor('message')} resize-y`}
          placeholder="Tell us what you are looking for..."
        />
        {errors.message ? (
          <p id={id('message-error')} role="alert" className="mt-1.5 text-sm text-red-600">
            {errors.message}
          </p>
        ) : null}
      </div>

      {submitError ? (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      ) : null}

      <CTAButton type="submit" variant={submitVariant} size="lg" fullWidth disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
          </>
        ) : (
          submitLabel
        )}
      </CTAButton>
    </form>
  );
}
