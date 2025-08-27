'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RobotsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to technical page since robots.txt is managed there
    router.replace('/boss/seo/technical');
  }, [router]);

  return null;
};

export default RobotsPage;
