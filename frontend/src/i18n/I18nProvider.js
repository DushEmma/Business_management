import React, { createContext, useContext, useMemo, useState } from 'react';

const translations = {
  en: {
    // Navbar
    nav_features: 'Features',
    nav_pricing: 'Pricing',
    nav_about: 'About',
    nav_contact: 'Contact',
    nav_login: 'Login',
    nav_get_started: 'Get Started',

    // Footer
    footer_about: 'Empowering businesses across Africa with smart, all-in-one management tools built for growth.',
    footer_product: 'Product',
    footer_security: 'Security',
    footer_roadmap: 'Roadmap',
    footer_company: 'Company',
    footer_about_us: 'About Us',
    footer_careers: 'Careers',
    footer_blog: 'Blog',
    footer_contact: 'Contact',

    // General
    search_suppliers: 'Search suppliers...',
  },
};

function humanize(key) {
  if (typeof key !== 'string') return String(key);
  const spaced = key.replace(/[_-]+/g, ' ').trim();
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

const I18nContext = createContext({
  t: (key) => (typeof key === 'string' ? key : String(key)),
  locale: 'en',
  setLocale: () => {},
});

export const useI18n = () => useContext(I18nContext);

export default function I18nProvider({ children }) {
  const [locale, setLocale] = useState('en');

  const value = useMemo(
    () => ({
      t: (key) => {
        const dict = translations[locale] || translations['en'];
        return dict[key] ?? humanize(key);
      },
      locale,
      setLocale,
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
