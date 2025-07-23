"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

interface MetaTagsProps {
  title: string;
  description: string;
  image?: string;
  type?: string;
  url?: string;
}

export function MetaTags({ title, description, image, type = "website", url }: MetaTagsProps) {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prepforall.com";
  const siteUrl = url || `${baseUrl}${pathname}`;
  const imageUrl = image || `${baseUrl}/images/og-image.jpg`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={siteUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Head>
  );
}