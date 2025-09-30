'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';
import type { ReactNode } from 'react';

interface SessionProviderWrapperProps {
  children: ReactNode;
  session?: Session | null;
}

const SessionProviderWrapper = ({ children, session }: SessionProviderWrapperProps) => {
  return <SessionProvider session={session}>{children}</SessionProvider>;
};

export default SessionProviderWrapper;
