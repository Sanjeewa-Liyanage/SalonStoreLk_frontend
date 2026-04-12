'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Megaphone,
  Store,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { getAdDetails } from '@/lib/adsService';
import useEmblaCarousel from 'embla-carousel-react';

type FirestoreTimestamp = {
  _seconds?: number;
  _nanoseconds?: number;
};

type AdDetails = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string[] | string;
  videoUrl?: string[] | string;
  salonName?: string;
  startDate?: FirestoreTimestamp;
};

type AdDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const MUSTARD = '#d4a32b';
const FALLBACK_AD_IMAGE =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80';

function toDateString(value?: FirestoreTimestamp) {
  if (!value?._seconds) return '-';
  const date = new Date(value._seconds * 1000);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString();
}

function splitDescription(rawDescription: string) {
  const lines = rawDescription
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const paragraphs: string[] = [];
  const bulletItems: string[] = [];

  lines.forEach((line) => {
    const cleanLine = line.replace(/^[•*\-]\s*/, '');
    const isHeading = cleanLine.endsWith(':');
    const isSentence = /[.!?]$/.test(cleanLine);
    const isShort = cleanLine.length <= 95;

    if (!isHeading && !isSentence && isShort) {
      bulletItems.push(cleanLine);
      return;
    }

    paragraphs.push(cleanLine);
  });

  if (!paragraphs.length && !bulletItems.length) {
    paragraphs.push('No description available.');
  }

  return { paragraphs, bulletItems };
}

type GalleryItem = { type: 'image'; url: string } | { type: 'video'; url: string };

type AdGalleryProps = {
  images: string[];
  videos: string[];
  adTitle: string;
};

function AdGallery({ images, videos, adTitle }: AdGalleryProps) {
  const media: GalleryItem[] = [
    ...images.map((url): GalleryItem => ({ type: 'image', url })),
    ...videos.map((url): GalleryItem => ({ type: 'video', url })),
  ];

  const hasMultiple = media.length > 1;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [mainRef, mainApi] = useEmblaCarousel({ loop: true, duration: 25 });
  const [thumbRef, thumbApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi || !thumbApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi, thumbApi]
  );

  const onSelect = useCallback(() => {
    if (!mainApi || !thumbApi) return;
    const snap = mainApi.selectedScrollSnap();
    setSelectedIndex(snap);
    thumbApi.scrollTo(snap);
  }, [mainApi, thumbApi]);

  useEffect(() => {
    if (!mainApi) return;
    onSelect();
    mainApi.on('select', onSelect);
    mainApi.on('reInit', onSelect);
    return () => {
      mainApi.off('select', onSelect);
      mainApi.off('reInit', onSelect);
    };
  }, [mainApi, onSelect]);

  const showPrevious = useCallback(() => {
    if (mainApi) mainApi.scrollPrev();
  }, [mainApi]);

  const showNext = useCallback(() => {
    if (mainApi) mainApi.scrollNext();
  }, [mainApi]);

  useEffect(() => {
    if (!hasMultiple) return;
    if (media[selectedIndex]?.type === 'video') return;

    const timerId = window.setInterval(() => {
      if (mainApi) mainApi.scrollNext();
    }, 4500);

    return () => window.clearInterval(timerId);
  }, [hasMultiple, media, selectedIndex, mainApi]);

  const handleKeyNavigation = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPrevious(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showNext(); }
  };

  if (media.length === 0) return null;

  return (
    <section className="space-y-3" tabIndex={0} onKeyDown={handleKeyNavigation} aria-label="Ad media gallery">
      {/* Main Embla Carousel */}
      <div className="relative overflow-hidden rounded-xl border border-[#d4a32b]/40 bg-zinc-900 p-2">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex touch-pan-y" style={{ backfaceVisibility: 'hidden' }}>
            {media.map((item, index) => (
              <div
                key={`${item.url}-${index}`}
                className="relative flex h-[clamp(300px,56vh,640px)] min-w-0 flex-[0_0_100%] items-center justify-center p-2"
              >
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    controlsList="nodownload"
                    preload="metadata"
                    className="max-h-full w-full rounded-lg object-contain"
                    ref={(el) => {
                      if (el) {
                        el.defaultMuted = true;
                        el.muted = true;
                        el.play().catch(() => {});
                      }
                    }}
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={`${adTitle} ${index + 1}`}
                    className="max-h-full w-full rounded-lg object-contain select-none"
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src !== FALLBACK_AD_IMAGE) target.src = FALLBACK_AD_IMAGE;
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-white/90 text-black shadow-sm transition hover:bg-white disabled:opacity-50"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-white/90 text-black shadow-sm transition hover:bg-white disabled:opacity-50"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Embla Carousel */}
      <div className="overflow-hidden pb-1" ref={thumbRef}>
        <div className="flex gap-2">
          {media.map((item, index) => (
            <button
              key={`${item.url}-thumb-${index}`}
              type="button"
              onClick={() => onThumbClick(index)}
              aria-label={`View ${item.type} ${index + 1}`}
              className={`relative h-20 w-28 shrink-0 min-w-0 overflow-hidden rounded-md border transition sm:h-24 sm:w-36 ${
                selectedIndex === index
                  ? 'border-[#d4a32b] ring-2 ring-[#d4a32b]'
                  : 'border-black/15 hover:border-[#d4a32b]/60 hover:opacity-100 opacity-60'
              }`}
            >
              {item.type === 'video' ? (
                <>
                  <video
                    src={item.url}
                    muted
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <svg viewBox="0 0 24 24" fill="white" className="h-8 w-8 drop-shadow-md">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </>
              ) : (
                <img
                  src={item.url}
                  alt={`Thumb ${index + 1}`}
                  className="h-full w-full object-cover select-none"
                  onError={(e) => {
                    const t = e.currentTarget;
                    if (t.src !== FALLBACK_AD_IMAGE) t.src = FALLBACK_AD_IMAGE;
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

type AdInfoPanelProps = {
  ad: AdDetails;
};

function AdInfoPanel({ ad }: AdInfoPanelProps) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a32b]/40 bg-[#d4a32b]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
          <Megaphone className="h-3.5 w-3.5 text-[#d4a32b]" />
          Featured Offer
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">{ad.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-black/75">
          <div className="inline-flex items-center gap-1.5">
            <Store className="h-4 w-4 text-[#d4a32b]" />
            <span>{ad.salonName || 'SalonStore Partner'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-[#d4a32b]" />
            <span>Starts on {toDateString(ad.startDate)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-black/80">{ad.description || 'No description provided for this offer yet.'}</p>

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="border-[#d4a32b]/40 bg-[#d4a32b]/10 text-black">
          <BadgeCheck className="mr-1 h-3.5 w-3.5 text-[#d4a32b]" />
          Public Ad
        </Badge>

        <Badge variant="outline" className="border-black/20 bg-black/5 text-black/80">
          ID: {ad.id}
        </Badge>
      </div>
    </section>
  );
}

type AdMetaPanelProps = {
  ad: AdDetails;
};

function AdMetaPanel({ ad }: AdMetaPanelProps) {
  return (
    <section className="space-y-4 border-t border-[#d4a32b]/25 pt-4">
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2.5">
          <Clock3 className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
          <div>
            <p className="font-semibold text-black">Start Date</p>
            <p className="text-black/75">{toDateString(ad.startDate)}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Store className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
          <div>
            <p className="font-semibold text-black">Salon Name</p>
            <p className="text-black/75">{ad.salonName || '-'}</p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <CalendarDays className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
          <div>
            <p className="font-semibold text-black">Ad ID</p>
            <p className="text-black/75 break-all">{ad.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2.5">
        <Link
          href="/find-salon"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4a32b]/50 bg-[#d4a32b]/12 px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#d4a32b]/20"
        >
          <ArrowLeft className="h-4 w-4 text-[#d4a32b]" />
          Back to Find Salons
        </Link>
      </div>
    </section>
  );
}

type AdDescriptionProps = {
  description: string;
};

function AdDescription({ description }: AdDescriptionProps) {
  const parsed = useMemo(() => splitDescription(description), [description]);

  return (
    <article className="space-y-4 border-t border-black/10 pt-6">
      <h2 className="text-2xl font-bold tracking-tight text-black">Offer Details</h2>

      <div className="space-y-3 text-sm leading-7 text-black/80">
        {parsed.paragraphs.map((paragraph, index) => (
          <p key={`${paragraph}-${index}`}>{paragraph}</p>
        ))}

        {parsed.bulletItems.length > 0 && (
          <ul className="space-y-1.5 pl-5">
            {parsed.bulletItems.map((item, index) => (
              <li key={`${item}-${index}`} className="list-disc marker:text-[#d4a32b]">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function AdDetailRoutePage({ params }: AdDetailPageProps) {
  const resolvedParams = use(params);
  const adId = String(resolvedParams?.id || '').trim();

  const [ad, setAd] = useState<AdDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAd = async () => {
      if (!adId) {
        setAd(null);
        setError('Ad ID is missing from the route.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const detail = await getAdDetails(adId);
        const adPayload = (detail?.data ?? detail) as AdDetails;
        if (!mounted) return;
        setAd(adPayload);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Failed to load ad details.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadAd();

    return () => {
      mounted = false;
    };
  }, [adId]);

  const galleryImages = useMemo(() => {
    const rawImages = ad?.imageUrl;
    const imageList = Array.isArray(rawImages)
      ? rawImages
      : typeof rawImages === 'string' && rawImages.trim()
        ? [rawImages]
        : [];
    const cleaned = imageList.map((image) => String(image || '').trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    return unique.length ? unique : [FALLBACK_AD_IMAGE];
  }, [ad]);

  const galleryVideos = useMemo(() => {
    const rawVideos = ad?.videoUrl;
    const videoList = Array.isArray(rawVideos)
      ? rawVideos
      : typeof rawVideos === 'string' && rawVideos.trim()
        ? [rawVideos]
        : [];
    return videoList.map((v) => String(v || '').trim()).filter(Boolean);
  }, [ad]);

  const description = ad?.description?.trim() || 'No offer description available.';

  return (
    <div className="min-h-screen bg-white text-black">
      <Header currentPage="find" />

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-black/65">
          <Link
            href="/find-salon"
            className="inline-flex items-center gap-2 rounded-full border border-[#d4a32b]/35 px-4 py-1.5 font-semibold text-black transition hover:bg-[#d4a32b]/10"
          >
            <ArrowLeft className="h-4 w-4 text-[#d4a32b]" />
            Back to Find Salons
          </Link>
          {ad && (
            <>
              <span className="text-black/35">/</span>
              <span>{ad.salonName || 'Featured Offer'}</span>
              <span className="text-black/35">/</span>
              <span className="font-medium text-black/80">{ad.title}</span>
            </>
          )}
        </div>

        {isLoading && (
          <div className="border border-[#d4a32b]/20 bg-[#fffaf0] p-10 text-center">
            <p className="text-sm font-medium text-black/70">Loading ad details...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-xl font-bold text-black">Unable to Load Ad</h1>
            <p className="mt-2 text-sm text-black/70">{error}</p>
          </div>
        )}

        {!isLoading && !error && ad && (
          <div className="space-y-8">
            <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div className="space-y-8">
                <AdGallery images={galleryImages} videos={galleryVideos} adTitle={ad.title} />
                <AdDescription description={description} />
              </div>

              <aside className="self-start lg:sticky lg:top-24">
                <div className="space-y-6">
                  <AdInfoPanel ad={ad} />
                  <AdMetaPanel ad={ad} />
                </div>
              </aside>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
