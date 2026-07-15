import { Helmet } from "react-helmet-async";

/**
 * Reusable SEO component. Drop it inside any page to set that page's
 * <title>, meta description, and Open Graph tags for search engines
 * and social sharing previews.
 *
 * Usage:
 *   <Seo title="Page Title" description="Page description" />
 */
export function Seo({ title, description }) {
  const cleanDescription = description
    ? description.trim().replace(/\s+/g, " ")
    : undefined;

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {title && <meta property="og:title" content={title} />}
      {cleanDescription && (
        <meta name="description" content={cleanDescription} />
      )}
      {cleanDescription && (
        <meta property="og:description" content={cleanDescription} />
      )}
    </Helmet>
  );
}