import * as React from 'react';

type NextImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
};

const NextImage = React.forwardRef<HTMLImageElement, NextImageProps>((props, ref) => {
  const { src, alt, width, height, className, ...rest } = props;
  return <img ref={ref} src={typeof src === 'string' ? src : ''} alt={alt} width={width} height={height} className={className} {...rest} />;
});

NextImage.displayName = 'NextImageMock';

export default NextImage;
