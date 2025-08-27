'use client';

import React, { useRef, useEffect } from 'react';
import { StyleProvider } from '@ant-design/cssinjs';

interface AntdStyleProviderProps {
  children: React.ReactNode;
}

const AntdStyleProvider: React.FC<AntdStyleProviderProps> = ({ children }) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // In development, use minimal configuration to prevent cleanup warnings
  if (process.env.NODE_ENV === 'development') {
    return (
      <StyleProvider 
        hashPriority="high"
        transformers={[]}
        linters={[]}
        // Disable some features that can cause cleanup issues in development
      >
        {children}
      </StyleProvider>
    );
  }

  // In production, use default configuration for better performance
  return (
    <StyleProvider hashPriority="high">
      {children}
    </StyleProvider>
  );
};

export default AntdStyleProvider;