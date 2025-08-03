'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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

export default function Footer() {
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
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
            <div className="animate-pulse bg-gray-700 h-4 w-48 rounded"></div>
            <div className="animate-pulse bg-gray-700 h-6 w-6 rounded"></div>
          </div>
        </div>
      </footer>
    );
  }

  if (!config) {
    return (
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-white font-bold text-lg">cvFlix</div>
            <div className="text-gray-400 text-sm">© 2025 cvFlix. All rights reserved.</div>
            <div className="flex items-center space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="border-t border-gray-800 py-8"
      style={{
        backgroundColor: config.backgroundColor,
        color: config.textColor
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo */}
          <div className="flex items-center">
            {config.useImageLogo && config.logoImageUrl ? (
              <Image
                src={config.logoImageUrl}
                alt={config.logoText}
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            ) : (
              <span className="font-bold text-lg" style={{ color: config.textColor }}>
                {config.logoText}
              </span>
            )}
          </div>

          {/* Copyright */}
          <div className="text-sm opacity-80" style={{ color: config.textColor }}>
            {config.copyrightText}
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            {config.showLinkedin && config.linkedinUrl && (
              <a
                href={config.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity duration-200"
                style={{ color: config.textColor }}
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
