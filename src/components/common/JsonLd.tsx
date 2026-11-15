import React, { useEffect } from 'react';
import { Provider } from '../../types';

export const JsonLd: React.FC<{ provider?: Provider }> = ({ provider }) => {
  useEffect(() => {
    let script = document.getElementById('json-ld-schema') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    if (provider) {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'VeterinaryCare',
        name: provider.name,
        image: provider.photos[0] || 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf',
        telephone: provider.phone,
        address: {
          '@type': 'PostalAddress',
          streetAddress: provider.address.line,
          addressLocality: provider.address.area,
          addressRegion: provider.address.city,
          postalCode: provider.address.pincode,
          addressCountry: 'IN',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: provider.address.lat,
          longitude: provider.address.lng,
        },
        priceRange: '₹₹',
        aggregateRating: provider.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: provider.rating.value,
              reviewCount: provider.rating.count,
            }
          : undefined,
      };
      script.text = JSON.stringify(structuredData);
    } else {
      const directoryData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Practo for Animals',
        url: window.location.origin,
        description: 'Verified veterinary clinics, 24x7 animal hospitals, boarding, and rescue NGOs in India.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${window.location.origin}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
      script.text = JSON.stringify(directoryData);
    }

    return () => {
      // clean up on unmount if needed
    };
  }, [provider]);

  return null;
};
