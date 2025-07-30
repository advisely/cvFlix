
'use client'

import useEmblaCarousel from 'embla-carousel-react'

export const Carousel = ({ children }: { children: React.ReactNode }) => {
  const [emblaRef] = useEmblaCarousel()

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {children}
      </div>
    </div>
  )
}
