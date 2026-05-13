// SeoHead.tsx - Per-route head tags (title, description, canonical, og:*, twitter:*)
// using react-helmet-async. Provides unique social previews and absolute image URLs.

import { Helmet } from "react-helmet-async";

const SITE_URL = "https://housemove.co";
const DEFAULT_IMAGE = `${SITE_URL}/housemove-logo.png`;

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
}

export function SeoHead({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_IMAGE,
}: SeoHeadProps) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="HouseMove" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}
