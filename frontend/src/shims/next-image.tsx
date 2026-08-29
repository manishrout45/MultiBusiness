import type { ImgHTMLAttributes } from 'react';

type StaticImport = { src: string } | string;

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: StaticImport;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  unoptimized?: boolean;
  loader?: unknown;
  onLoadingComplete?: unknown;
}

function resolveSrc(src: StaticImport): string {
  return typeof src === 'string' ? src : src.src;
}

export default function Image({
  src,
  alt,
  fill,
  width,
  height,
  className,
  style,
  sizes: _sizes,
  priority,
  quality: _quality,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  unoptimized: _unoptimized,
  loader: _loader,
  onLoadingComplete: _onLoadingComplete,
  ...rest
}: ImageProps) {
  const fillStyle = fill
    ? {
        position: 'absolute' as const,
        inset: 0,
        width: '100%',
        height: '100%',
      }
    : undefined;

  return (
    <img
      src={resolveSrc(src)}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={{ ...fillStyle, ...style }}
      loading={priority ? 'eager' : 'lazy'}
      {...rest}
    />
  );
}
