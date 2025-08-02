import { useEffect } from 'react';
import { useCarousel } from '@/components/ui/carousel';

export function useCarouselAutoplay(enabled: boolean = true, interval: number = 3000) {
  const carousel = useCarousel();

  useEffect(() => {
    if (!enabled || !carousel) return;

    const timer = setInterval(() => {
      if (document.hidden) return;
      carousel.scrollNext();
    }, interval);

    return () => clearInterval(timer);
  }, [carousel, enabled, interval]);
}
