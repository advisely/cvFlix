'use client'

// Performance monitoring utility for floating cards
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Track card animation performance
  trackCardAnimation(cardId: string, startTime: number) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    if (!this.metrics.has('cardAnimations')) {
      this.metrics.set('cardAnimations', []);
    }
    
    this.metrics.get('cardAnimations')!.push(duration);
    
    // Log if animation takes longer than 16.67ms (60fps threshold)
    if (duration > 16.67) {
      console.warn('Card animation performance issue detected:', cardId, duration);
    }
  }

  // Track media loading performance
  trackMediaLoad(mediaType: 'image' | 'video', url: string, loadTime: number) {
    const key = mediaType + 'Load';
    
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    this.metrics.get(key)!.push(loadTime);
    
    // Log slow media loading (>2 seconds)
    if (loadTime > 2000) {
      console.warn('Slow media loading detected:', mediaType, loadTime);
    }
  }

  // Track frame rate during animations
  trackFrameRate(callback?: (fps: number) => void) {
    let frames = 0;
    let lastTime = performance.now();

    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        
        if (!this.metrics.has('frameRate')) {
          this.metrics.set('frameRate', []);
        }
        
        this.metrics.get('frameRate')!.push(fps);
        
        if (callback) {
          callback(fps);
        }
        
        // Log low frame rates
        if (fps < 55) {
          console.warn('Low frame rate detected:', fps);
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  // Get performance report
  getPerformanceReport() {
    const recommendations: string[] = [];
    
    const cardAnimations = this.metrics.get('cardAnimations') || [];
    const imageLoad = this.metrics.get('imageLoad') || [];
    const videoLoad = this.metrics.get('videoLoad') || [];
    const frameRate = this.metrics.get('frameRate') || [];

    const avgCardAnimation = cardAnimations.length > 0 
      ? cardAnimations.reduce((a, b) => a + b, 0) / cardAnimations.length 
      : 0;
    
    const avgImageLoad = imageLoad.length > 0 
      ? imageLoad.reduce((a, b) => a + b, 0) / imageLoad.length 
      : 0;
    
    const avgVideoLoad = videoLoad.length > 0 
      ? videoLoad.reduce((a, b) => a + b, 0) / videoLoad.length 
      : 0;
    
    const avgFrameRate = frameRate.length > 0 
      ? frameRate.reduce((a, b) => a + b, 0) / frameRate.length 
      : 0;

    // Generate recommendations
    if (avgCardAnimation > 16.67) {
      recommendations.push('Card animations are dropping below 60fps. Consider optimizing CSS transitions.');
    }
    
    if (avgImageLoad > 2000) {
      recommendations.push('Image loading is slow. Consider implementing better lazy loading or image optimization.');
    }
    
    if (avgVideoLoad > 3000) {
      recommendations.push('Video loading is slow. Consider preloading or using lower quality previews.');
    }
    
    if (avgFrameRate < 55) {
      recommendations.push('Frame rate is below optimal. Reduce animation complexity or enable hardware acceleration.');
    }

    return {
      cardAnimations: {
        avg: Math.round(avgCardAnimation * 100) / 100,
        max: cardAnimations.length > 0 ? Math.max(...cardAnimations) : 0,
        count: cardAnimations.length
      },
      imageLoad: {
        avg: Math.round(avgImageLoad * 100) / 100,
        max: imageLoad.length > 0 ? Math.max(...imageLoad) : 0,
        count: imageLoad.length
      },
      videoLoad: {
        avg: Math.round(avgVideoLoad * 100) / 100,
        max: videoLoad.length > 0 ? Math.max(...videoLoad) : 0,
        count: videoLoad.length
      },
      frameRate: {
        avg: Math.round(avgFrameRate * 10) / 10,
        min: frameRate.length > 0 ? Math.min(...frameRate) : 0,
        count: frameRate.length
      },
      recommendations
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics.clear();
  }
}

// Hook for React components
export const usePerformanceMonitor = () => {
  return PerformanceMonitor.getInstance();
};
