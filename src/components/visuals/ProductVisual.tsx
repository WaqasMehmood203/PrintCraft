import { memo, useState, type ImgHTMLAttributes } from 'react';
import { VISUAL_KEYS } from '@shared/constants';
import { cn } from '@/lib/utils';

const KNOWN = new Set<string>(VISUAL_KEYS);
const base = (name: string) => `/stock/photos/${KNOWN.has(name) ? name : 'swatches'}`;

/** srcset for a stock photo key (self-hosted WebP at 800 and 1600 px). */
export const photoSrc = (name: string, width: 800 | 1600 = 1600) => `${base(name)}-${width}.webp`;

interface PhotoProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  name: string;
  alt: string;
  /** Uploaded image URL; takes precedence over the stock photo. */
  imageUrl?: string | null;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  sizes?: string;
  className?: string;
  imgClassName?: string;
}

/**
 * Responsive, lazy-loaded photograph with a blurred placeholder that fades out once loaded.
 * Wrap in a sized container; the image covers it.
 */
export const Photo = memo(function Photo({ name, alt, imageUrl, priority, sizes = '(min-width: 1024px) 50vw, 100vw', className, imgClassName, ...rest }: PhotoProps) {
  const [loaded, setLoaded] = useState(false);
  const b = base(name);
  return (
    <div className={cn('relative h-full w-full overflow-hidden bg-ink-200', className)} style={imageUrl ? undefined : { backgroundImage: `url(${b}-lqip.webp)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <img
        src={imageUrl ?? `${b}-1600.webp`}
        srcSet={imageUrl ? undefined : `${b}-800.webp 800w, ${b}-1600.webp 1600w`}
        sizes={imageUrl ? undefined : sizes}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // @ts-expect-error fetchpriority is valid HTML, not yet in React's types
        fetchpriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        className={cn('h-full w-full object-cover transition-opacity duration-700', loaded ? 'opacity-100' : 'opacity-0', imgClassName)}
        {...rest}
      />
    </div>
  );
});

/** Back-compat wrapper used by catalogue components (`visual` is now a photo key). */
export function ProductVisual({ visual, imageUrl, alt, className, sizes }: { visual: string; imageUrl?: string | null; alt: string; className?: string; sizes?: string }) {
  return <Photo name={visual} imageUrl={imageUrl} alt={alt} className={className} sizes={sizes} />;
}
