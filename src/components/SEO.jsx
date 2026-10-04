import { Helmet } from 'react-helmet-async';

const DEFAULT_DESCRIPTION =
  'EkaNex connects Grade 11–12 students in Delhi NCR with real businesses to solve real problems through structured 5–7 week project sprints. Free for students. Zero cost for organizations.';

/**
 * Per-page SEO. Sets the document title, description and social tags.
 */
export default function SEO({ title, description = DEFAULT_DESCRIPTION, path = '' }) {
  const fullTitle = title || 'EkaNex — Your First Real Project. Before You Finish School.';
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {path ? <link rel="canonical" href={`https://ekanex.in${path}`} /> : null}
    </Helmet>
  );
}
