// Favicon Management Utilities
// Comprehensive favicon generation, validation, and optimization utilities

export interface FaviconSize {
  name: string;
  width: number;
  height: number;
  format: 'png' | 'ico' | 'svg';
  purpose: 'favicon' | 'apple-touch-icon' | 'android-chrome' | 'mstile' | 'safari-pinned-tab';
  description: string;
}

export interface FaviconSet {
  [key: string]: string; // dataURL for each favicon size/format
}

export interface FaviconValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

export interface PWAManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export interface PWAManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: PWAManifestIcon[];
}

// Standard favicon sizes and specifications
export const FAVICON_SIZES: Record<string, FaviconSize> = {
  'favicon-16x16': {
    name: 'favicon-16x16',
    width: 16,
    height: 16,
    format: 'png',
    purpose: 'favicon',
    description: 'Browser favicon (small)'
  },
  'favicon-32x32': {
    name: 'favicon-32x32',
    width: 32,
    height: 32,
    format: 'png',
    purpose: 'favicon',
    description: 'Browser favicon (standard)'
  },
  'favicon-48x48': {
    name: 'favicon-48x48',
    width: 48,
    height: 48,
    format: 'png',
    purpose: 'favicon',
    description: 'Browser favicon (large)'
  },
  'favicon-ico': {
    name: 'favicon-ico',
    width: 32,
    height: 32,
    format: 'ico',
    purpose: 'favicon',
    description: 'Classic ICO favicon'
  },
  'apple-touch-icon-57x57': {
    name: 'apple-touch-icon-57x57',
    width: 57,
    height: 57,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPhone 3G/3GS)'
  },
  'apple-touch-icon-60x60': {
    name: 'apple-touch-icon-60x60',
    width: 60,
    height: 60,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPhone)'
  },
  'apple-touch-icon-72x72': {
    name: 'apple-touch-icon-72x72',
    width: 72,
    height: 72,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPad 1-2)'
  },
  'apple-touch-icon-76x76': {
    name: 'apple-touch-icon-76x76',
    width: 76,
    height: 76,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPad)'
  },
  'apple-touch-icon-114x114': {
    name: 'apple-touch-icon-114x114',
    width: 114,
    height: 114,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPhone 4 Retina)'
  },
  'apple-touch-icon-120x120': {
    name: 'apple-touch-icon-120x120',
    width: 120,
    height: 120,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPhone Retina)'
  },
  'apple-touch-icon-144x144': {
    name: 'apple-touch-icon-144x144',
    width: 144,
    height: 144,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPad Retina)'
  },
  'apple-touch-icon-152x152': {
    name: 'apple-touch-icon-152x152',
    width: 152,
    height: 152,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPad Retina)'
  },
  'apple-touch-icon-180x180': {
    name: 'apple-touch-icon-180x180',
    width: 180,
    height: 180,
    format: 'png',
    purpose: 'apple-touch-icon',
    description: 'iOS home screen icon (iPhone 6 Plus)'
  },
  'android-chrome-36x36': {
    name: 'android-chrome-36x36',
    width: 36,
    height: 36,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (LDPI)'
  },
  'android-chrome-48x48': {
    name: 'android-chrome-48x48',
    width: 48,
    height: 48,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (MDPI)'
  },
  'android-chrome-72x72': {
    name: 'android-chrome-72x72',
    width: 72,
    height: 72,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (HDPI)'
  },
  'android-chrome-96x96': {
    name: 'android-chrome-96x96',
    width: 96,
    height: 96,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (XHDPI)'
  },
  'android-chrome-144x144': {
    name: 'android-chrome-144x144',
    width: 144,
    height: 144,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (XXHDPI)'
  },
  'android-chrome-192x192': {
    name: 'android-chrome-192x192',
    width: 192,
    height: 192,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (XXXHDPI)'
  },
  'android-chrome-256x256': {
    name: 'android-chrome-256x256',
    width: 256,
    height: 256,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (large)'
  },
  'android-chrome-384x384': {
    name: 'android-chrome-384x384',
    width: 384,
    height: 384,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (extra large)'
  },
  'android-chrome-512x512': {
    name: 'android-chrome-512x512',
    width: 512,
    height: 512,
    format: 'png',
    purpose: 'android-chrome',
    description: 'Android Chrome icon (PWA)'
  },
  'mstile-70x70': {
    name: 'mstile-70x70',
    width: 70,
    height: 70,
    format: 'png',
    purpose: 'mstile',
    description: 'Windows Metro tile (small)'
  },
  'mstile-144x144': {
    name: 'mstile-144x144',
    width: 144,
    height: 144,
    format: 'png',
    purpose: 'mstile',
    description: 'Windows Metro tile (medium)'
  },
  'mstile-150x150': {
    name: 'mstile-150x150',
    width: 150,
    height: 150,
    format: 'png',
    purpose: 'mstile',
    description: 'Windows Metro tile (wide)'
  },
  'mstile-310x150': {
    name: 'mstile-310x150',
    width: 310,
    height: 150,
    format: 'png',
    purpose: 'mstile',
    description: 'Windows Metro tile (wide)'
  },
  'mstile-310x310': {
    name: 'mstile-310x310',
    width: 310,
    height: 310,
    format: 'png',
    purpose: 'mstile',
    description: 'Windows Metro tile (large)'
  }
};

// Generate favicon from source image
export const generateFaviconSizes = async (sourceFile: File): Promise<FaviconSet> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const faviconSet: FaviconSet = {};
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    img.onload = async () => {
      try {
        const sizeEntries = Object.entries(FAVICON_SIZES);
        const total = sizeEntries.length;
        let completed = 0;

        for (const [name, config] of sizeEntries) {
          canvas.width = config.width;
          canvas.height = config.height;
          
          // High-quality image scaling
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // Clear canvas
          ctx.clearRect(0, 0, config.width, config.height);
          
          // Draw scaled image
          ctx.drawImage(img, 0, 0, config.width, config.height);
          
          // Convert to data URL
          const quality = config.width <= 48 ? 1.0 : 0.95; // Higher quality for small icons
          const mimeType = config.format === 'ico' ? 'image/png' : `image/${config.format}`;
          const dataUrl = canvas.toDataURL(mimeType, quality);
          
          faviconSet[name] = dataUrl;
          completed++;
        }
        
        resolve(faviconSet);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load source image'));
    };

    // Create object URL from file
    const objectUrl = URL.createObjectURL(sourceFile);
    img.src = objectUrl;
    
    // Cleanup object URL after loading
    img.onload = (originalOnLoad => {
      return function(this: HTMLImageElement, ev: Event) {
        URL.revokeObjectURL(objectUrl);
        return originalOnLoad?.call(this, ev);
      };
    })(img.onload);
  });
};

// Convert PNG data URL to ICO format (simplified implementation)
export const convertToIco = async (pngDataUrls: string[]): Promise<string> => {
  // This is a simplified implementation
  // In production, you would use a proper ICO encoding library
  // For now, we'll return the largest PNG as a placeholder
  
  const sortedBySize = pngDataUrls
    .map(url => ({ url, size: extractSizeFromDataUrl(url) }))
    .sort((a, b) => b.size - a.size);
    
  return sortedBySize[0]?.url || pngDataUrls[0];
};

// Extract image size from data URL (placeholder implementation)
const extractSizeFromDataUrl = (dataUrl: string): number => {
  // This would need proper implementation to read image dimensions
  // For now, estimate based on data length
  return dataUrl.length;
};

// Validate favicon requirements
export const validateFavicon = (faviconSet: FaviconSet): FaviconValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check for essential sizes
  const essentialSizes = ['favicon-16x16', 'favicon-32x32', 'apple-touch-icon-180x180', 'android-chrome-192x192'];
  
  essentialSizes.forEach(size => {
    if (!faviconSet[size]) {
      errors.push(`Missing essential favicon size: ${FAVICON_SIZES[size]?.description}`);
    }
  });

  // Check for recommended sizes
  const recommendedSizes = ['android-chrome-512x512', 'apple-touch-icon-152x152'];
  
  recommendedSizes.forEach(size => {
    if (!faviconSet[size]) {
      warnings.push(`Missing recommended favicon size: ${FAVICON_SIZES[size]?.description}`);
    }
  });

  // Validate data URLs
  Object.entries(faviconSet).forEach(([name, dataUrl]) => {
    if (!dataUrl.startsWith('data:image/')) {
      errors.push(`Invalid data URL format for ${name}`);
    }
    
    // Check file size (rough estimate)
    const sizeEstimate = dataUrl.length * 0.75; // Base64 overhead
    if (sizeEstimate > 100000) { // 100KB
      warnings.push(`Large file size for ${name} (${Math.round(sizeEstimate/1024)}KB)`);
    }
  });

  // Generate recommendations
  if (Object.keys(faviconSet).length < 10) {
    recommendations.push('Consider generating more favicon sizes for better device coverage');
  }

  if (!faviconSet['android-chrome-512x512']) {
    recommendations.push('Add 512x512 icon for PWA compatibility');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    recommendations
  };
};

// Generate PWA manifest icons from favicon set
export const generatePWAManifestIcons = (faviconSet: FaviconSet): PWAManifestIcon[] => {
  const pwaIconSizes = ['android-chrome-192x192', 'android-chrome-512x512'];
  
  return pwaIconSizes
    .filter(size => faviconSet[size])
    .map(size => {
      const config = FAVICON_SIZES[size];
      return {
        src: faviconSet[size],
        sizes: `${config.width}x${config.height}`,
        type: 'image/png',
        purpose: 'any maskable'
      };
    });
};

// Generate HTML meta tags for favicons
export const generateFaviconMetaTags = (faviconSet: FaviconSet, baseUrl: string = ''): string[] => {
  const metaTags: string[] = [];

  // Standard favicon
  if (faviconSet['favicon-32x32']) {
    metaTags.push(`<link rel="icon" type="image/png" sizes="32x32" href="${baseUrl}/favicon-32x32.png">`);
  }
  
  if (faviconSet['favicon-16x16']) {
    metaTags.push(`<link rel="icon" type="image/png" sizes="16x16" href="${baseUrl}/favicon-16x16.png">`);
  }

  // Apple touch icons
  Object.entries(FAVICON_SIZES)
    .filter(([_, config]) => config.purpose === 'apple-touch-icon')
    .forEach(([name, config]) => {
      if (faviconSet[name]) {
        metaTags.push(`<link rel="apple-touch-icon" sizes="${config.width}x${config.height}" href="${baseUrl}/${name}.png">`);
      }
    });

  // Android Chrome icons
  if (faviconSet['android-chrome-192x192']) {
    metaTags.push(`<link rel="icon" type="image/png" sizes="192x192" href="${baseUrl}/android-chrome-192x192.png">`);
  }

  // Microsoft tiles
  if (faviconSet['mstile-150x150']) {
    metaTags.push(`<meta name="msapplication-TileImage" content="${baseUrl}/mstile-150x150.png">`);
    metaTags.push(`<meta name="msapplication-TileColor" content="#ffffff">`);
  }

  // Theme colors
  metaTags.push(`<meta name="theme-color" content="#ffffff">`);

  return metaTags;
};

// Optimize favicon for web delivery
export const optimizeFaviconDataUrl = (dataUrl: string, maxQuality: number = 0.9): string => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      // Try different quality levels to find optimal size
      let quality = maxQuality;
      let optimizedDataUrl = canvas.toDataURL('image/png', quality);
      
      while (optimizedDataUrl.length > dataUrl.length * 0.8 && quality > 0.5) {
        quality -= 0.1;
        optimizedDataUrl = canvas.toDataURL('image/png', quality);
      }
      
      resolve(optimizedDataUrl);
    };

    img.src = dataUrl;
  }) as unknown as string;
};

// Extract dominant color from favicon for theme color
export const extractDominantColor = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      if (!ctx) {
        resolve('#ffffff');
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      
      const colorCount: Record<string, number> = {};
      
      // Sample every 10th pixel for performance
      for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];
        
        // Skip transparent pixels
        if (alpha < 128) continue;
        
        // Round colors to reduce variations
        const color = `rgb(${Math.round(r/32)*32}, ${Math.round(g/32)*32}, ${Math.round(b/32)*32})`;
        colorCount[color] = (colorCount[color] || 0) + 1;
      }
      
      // Find most common color
      const dominantColor = Object.entries(colorCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || '#ffffff';
        
      // Convert to hex
      const hex = dominantColor.match(/\d+/g);
      if (hex && hex.length === 3) {
        const hexColor = '#' + hex.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        resolve(hexColor);
      } else {
        resolve('#ffffff');
      }
    };

    img.src = dataUrl;
  });
};

// Check favicon accessibility (contrast ratio)
export const checkFaviconAccessibility = async (dataUrl: string): Promise<{
  hasGoodContrast: boolean;
  contrastRatio: number;
  recommendations: string[];
}> => {
  const dominantColor = await extractDominantColor(dataUrl);
  
  // Calculate contrast ratio with common backgrounds
  const whiteContrast = calculateContrastRatio(dominantColor, '#ffffff');
  const blackContrast = calculateContrastRatio(dominantColor, '#000000');
  
  const recommendations: string[] = [];
  const minContrast = Math.max(whiteContrast, blackContrast);
  
  if (minContrast < 3) {
    recommendations.push('Consider increasing contrast for better visibility');
  }
  
  if (whiteContrast < 2) {
    recommendations.push('Favicon may not be visible on white backgrounds');
  }
  
  if (blackContrast < 2) {
    recommendations.push('Favicon may not be visible on dark backgrounds');
  }

  return {
    hasGoodContrast: minContrast >= 3,
    contrastRatio: minContrast,
    recommendations
  };
};

// Calculate color contrast ratio
const calculateContrastRatio = (color1: string, color2: string): number => {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

// Get color luminance
const getLuminance = (hex: string): number => {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Convert hex color to RGB
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};
