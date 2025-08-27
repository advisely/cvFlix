'use client';

import { useEffect, useState } from 'react';
import { Layout } from 'antd';
import Image from 'next/image';

const { Footer } = Layout;

interface FooterConfig {
  id: string;
  logoText: string;
  logoImageUrl?: string;
  useImageLogo: boolean;
  copyrightText: string;
  linkedinUrl?: string;
  showLinkedin: boolean;
  backgroundColor: string;
  textColor: string;
}

export default function AdminFooter() {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterConfig = async () => {
      try {
        const response = await fetch('/api/footer-config');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('Error fetching footer config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterConfig();
  }, []);

  if (loading) {
    return (
      <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: '#f0f2f5', 
        borderTop: '1px solid #d9d9d9',
        padding: '16px 24px',
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <div className="flex justify-between items-center">
          <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
          <div className="animate-pulse bg-gray-300 h-4 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-300 h-4 w-4 rounded"></div>
        </div>
      </Footer>
    );
  }

  if (!config) {
    return (
      <Footer style={{ 
        textAlign: 'center', 
        backgroundColor: '#f0f2f5', 
        borderTop: '1px solid #d9d9d9',
        padding: '16px 24px',
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">resumeflex</span>
          <span className="text-gray-500 text-sm">© 2025 resumeflex. All rights reserved.</span>
          <div className="flex items-center space-x-2">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </Footer>
    );
  }

  return (
    <Footer
      style={{
        textAlign: 'center',
        backgroundColor: '#f0f2f5',
        borderTop: '1px solid #d9d9d9',
        padding: '16px 24px',
        flexShrink: 0,
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        {/* Logo */}
        <div className="flex items-center">
          {config.useImageLogo && config.logoImageUrl ? (
            <Image
              src={config.logoImageUrl}
              alt={config.logoText}
              width={80}
              height={24}
              className="h-6 w-auto"
            />
          ) : (
            <span className="font-semibold text-gray-700">
              {config.logoText}
            </span>
          )}
        </div>

        {/* Copyright */}
        <div className="text-gray-500 text-sm">
          {config.copyrightText}
        </div>

        {/* Social Links */}
        <div className="flex items-center space-x-2">
          {config.showLinkedin && config.linkedinUrl && (
            <a
              href={config.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </Footer>
  );
}
