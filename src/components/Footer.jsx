import { Link } from 'react-router-dom';
import { Mail, Phone, Instagram, Linkedin, MapPin } from 'lucide-react';
import { SITE, FOOTER_LINKS } from '../data/site';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="container-px py-14 lg:py-16">
        <div className="grid gap-10 md:grid-cols-3 lg:gap-12">
          {/* Brand */}
          <div>
            <Logo onDark />
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-white/70">{SITE.tagline}</p>
          </div>

          {/* Explore links */}
          <nav aria-label="Footer">
            <h3 className="eyebrow mb-4 text-white/50">Explore</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1 sm:gap-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.hash ? { pathname: l.to, hash: `#${l.hash}` } : l.to}
                    className="text-[15px] text-white/75 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="eyebrow mb-4 text-white/50">Get in touch</h3>
            <ul className="space-y-3 text-[15px]">
              <li>
                <a
                  href={`mailto:${SITE.email}`}
                  className="inline-flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Mail className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
                  <span className="break-all">{SITE.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.phoneHref}
                  className="inline-flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Phone className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
                  <span>{SITE.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Instagram className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
                  <span>{SITE.instagram}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-white/75 transition-colors hover:text-white"
                >
                  <Linkedin className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
                  <span>{SITE.linkedin}</span>
                </a>
              </li>
              <li className="inline-flex items-center gap-3 text-white/75">
                <MapPin className="h-[18px] w-[18px] shrink-0 text-accent" aria-hidden="true" />
                <span>{SITE.location}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px py-6 text-sm text-white/60">
          © 2026 EkaNex. Delhi NCR, India. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
