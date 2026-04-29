import React from "react";
import { Helmet } from "react-helmet";

const SEO = ({
  title = "Default Title",
  description = "Default description",
  keywords = "react, seo, website",
  image = "/logo.png",
  url = "https://yourdomain.com",
  author = "Your Name",
}) => {
  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Open Graph (Facebook, WhatsApp) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
