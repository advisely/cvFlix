'use client';

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { SEOMetaTag, SEOMetaTagCreateRequest, SEOMetaTagUpdateRequest } from '@/types/seo';

interface UseSEOMetaTagsReturn {
  metaTags: SEOMetaTag[];
  loading: boolean;
  error: string | null;
  fetchMetaTags: () => Promise<void>;
  createMetaTag: (data: SEOMetaTagCreateRequest) => Promise<boolean>;
  updateMetaTag: (id: string, updates: SEOMetaTagUpdateRequest) => Promise<boolean>;
  deleteMetaTag: (id: string) => Promise<boolean>;
  getMetaTagByPage: (page: string) => SEOMetaTag | undefined;
}

export const useSEOMetaTags = (): UseSEOMetaTagsReturn => {
  const [metaTags, setMetaTags] = useState<SEOMetaTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetaTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/seo/meta-tags', {
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch meta tags: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMetaTags(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load meta tags';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMetaTag = useCallback(async (data: SEOMetaTagCreateRequest): Promise<boolean> => {
    try {
      const response = await fetch('/api/seo/meta-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meta tag');
      }

      await fetchMetaTags(); // Refresh the list
      message.success('Meta tag created successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create meta tag';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    }
  }, [fetchMetaTags]);

  const updateMetaTag = useCallback(async (id: string, updates: SEOMetaTagUpdateRequest): Promise<boolean> => {
    try {
      const response = await fetch(`/api/seo/meta-tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update meta tag');
      }

      await fetchMetaTags(); // Refresh the list
      message.success('Meta tag updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update meta tag';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    }
  }, [fetchMetaTags]);

  const deleteMetaTag = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/seo/meta-tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete meta tag');
      }

      await fetchMetaTags(); // Refresh the list
      message.success('Meta tag deleted successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete meta tag';
      setError(errorMessage);
      message.error(errorMessage);
      return false;
    }
  }, [fetchMetaTags]);

  const getMetaTagByPage = useCallback((page: string) => {
    return metaTags.find(tag => tag.page === page);
  }, [metaTags]);

  // Auto-fetch meta tags on mount
  useEffect(() => {
    fetchMetaTags();
  }, [fetchMetaTags]);

  return {
    metaTags,
    loading,
    error,
    fetchMetaTags,
    createMetaTag,
    updateMetaTag,
    deleteMetaTag,
    getMetaTagByPage
  };
};