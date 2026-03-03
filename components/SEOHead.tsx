import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  price?: number;
  currency?: string;
  availability?: string;
  category?: string;
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title = 'TOUCHEEGLOW — Luxury Skincare — Canada',
  description = 'Premium luxury skincare products. Based in Canada.',
  keywords = [],
  ogImage,
  ogType = 'website',
  price,
  currency = 'CAD',
  availability,
  category,
  publishedTime,
  author,
  noindex = false
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toucheeglow.com';
  const defaultOgImage = `${siteUrl}/touchee-logo.png`;
  const resolvedOgImage = ogImage || defaultOgImage;
  const siteName = 'TOUCHEEGLOW';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const defaultKeywords = [
    'online shopping canada',
    'luxury skincare canada',
    'premium beauty shop',
    'ecommerce canada',
    'fast delivery canada',
    'secure shopping'
  ];

  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: allKeywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description,
      images: [{ url: resolvedOgImage, width: 1200, height: 630, alt: title }],
      type: ogType as any,
      siteName,
      locale: 'en_CA'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedOgImage]
    },
    robots: noindex ? {
      index: false,
      follow: false
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical: siteUrl
    }
  };

  if (ogType === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime
    };
  }

  return metadata;
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  brand?: string;
  category?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'PremiumShop'
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'CAD',
      availability: product.availability === 'in_stock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  if (product.rating && product.reviewCount) {
    (schema as any).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (product.category) {
    (schema as any).category = product.category;
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateOrganizationSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toucheeglow.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TOUCHEEGLOW',
    url: siteUrl,
    logo: `${siteUrl}/touchee-logo.png`,
    image: `${siteUrl}/touchee-logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      areaServed: 'CA',
      availableLanguage: ['English']
    }
  };
}

export function generateWebsiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://toucheeglow.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TOUCHEEGLOW',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}