'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SitemapPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to technical page since sitemap is managed there
    router.replace('/boss/seo/technical');
  }, [router]);

  return null;
};

export default SitemapPage;
