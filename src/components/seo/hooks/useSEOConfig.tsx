'use client';

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { SEOConfig, SEOConfigUpdateRequest } from '@/types/seo';

interface UseSEOConfigReturn {
  config: SEOConfig | null;
  loading: boolean;
  error: string | null;
  fetchConfig: () => Promise<void>;
  updateConfig: (updates: SEOConfigUpdateRequest) => Promise<boolean>;
  refreshConfig: () => void;
}

export const useSEOConfig = (): UseSEOConfigReturn => {
  const [config, setConfig] = useState<SEOConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/seo/config', {
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch SEO config: ${response.statusText}`);
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load SEO configuration';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (updates: SEOConfigUpdateRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/seo/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update SEO configuration');
      }

      const updatedConfig = await response.json();
      setConfig(updatedConfig);
      message.success('SEO configuration updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update SEO configuration';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    }
  }, []);

  const refreshConfig = useCallback(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Auto-fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
    refreshConfig
  };
};