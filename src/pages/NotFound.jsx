import { Helmet } from 'react-helmet-async';
import PageTransition from '../components/PageTransition';
import CTAButton from '../components/CTAButton';

export default function NotFound() {
  return (
    <PageTransition>
      <Helmet>
        <title>Page not found — EkaNex</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <section className="grid min-h-[70vh] place-items-center bg-canvas">
        <div className="container-px text-center">
          <p className="eyebrow text-electric">404</p>
          <h1 className="mt-3 text-section font-bold text-navy">We couldn’t find that page.</h1>
          <p className="mx-auto mt-4 max-w-md text-lg text-muted">
            The page you are looking for may have moved. Let’s get you back on track.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <CTAButton to="/" variant="primary">
              Back to Home →
            </CTAButton>
            <CTAButton to="/contact" variant="outline">
              Get in Touch →
            </CTAButton>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
