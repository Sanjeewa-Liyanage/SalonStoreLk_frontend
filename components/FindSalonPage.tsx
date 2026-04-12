'use client';

import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MapPin, X, Play, Image as ImageIcon } from 'lucide-react';
import { getByPrority } from '@/lib/salonService';
import { getByPriority as getAdsByPriority } from '@/lib/adsService';
import useEmblaCarousel from 'embla-carousel-react';

type TimestampDto = {
  _seconds?: number;
  _nanoseconds?: number;
};

type SalonDto = {
  id: string;
  salonName: string;
  city?: string;
  address?: string;
  description?: string;
  images?: string[];
  services?: Array<{ name: string }>;
  adCount?: number;
};

type AdDto = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string[];
  videoUrl?: string[];
  salonName?: string;
  createdAt?: TimestampDto;
};

type GenericPagination = {
  page?: number;
  currentPage?: number;
  limit?: number;
  totalPages?: number;
  totalItems?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
};

type PagedResponse<T> = {
  data?: T[];
  pagination?: GenericPagination;
};

interface FindSalonPageProps {
  onSalonSelect?: (salonId: string) => void;
  onAdSelect?: (adId: string) => void;
}

const SALONS_PER_PAGE = 10;
const ADS_PER_PAGE = 10;

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=70';

function safeImage(url?: string) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_IMG;
  return url;
}

function formatPostDate(timestamp?: TimestampDto) {
  if (!timestamp?._seconds) return 'Recently posted';
  const date = new Date(timestamp._seconds * 1000);
  if (Number.isNaN(date.getTime())) return 'Recently posted';
  return date.toLocaleDateString();
}

function BlurredContainImage({
  src,
  alt,
  heightClass,
}: {
  src: string;
  alt: string;
  heightClass: string;
}) {
  return (
    <div className={`relative w-full overflow-hidden bg-gray-100 ${heightClass}`}>
      <div
        className="absolute inset-0 scale-110 bg-center bg-cover blur-2xl"
        style={{ backgroundImage: `url(${src})` }}
        aria-hidden="true"
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 h-full w-full object-contain"
        loading="lazy"
      />
    </div>
  );
}

type MediaItem = { type: 'image'; url: string } | { type: 'video'; url: string };

function AdMediaPreview({
  media,
  title,
}: {
  media: MediaItem[];
  title: string;
}) {
  const extraCount = media.length - 1;
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (media.length <= 1) return;

    // Randomize the start so cards on the page don't cycle synchronously
    const randomDelay = Math.random() * 2000;

    let interval: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % media.length);
      }, 3500);
    }, randomDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [media.length]);

  if (media.length === 0) return null;

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
      {media.map((item, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={`${item.url}-${index}`}
            className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'z-10 opacity-100' : 'z-0 opacity-0'
              }`}
            aria-hidden={!isActive}
          >
            {item.type === 'video' ? (
              <div className="relative h-full w-full bg-black">
                <video
                  src={item.url}
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white shadow-sm">
                  <Play className="h-3.5 w-3.5 fill-white" />
                  Video
                </div>
              </div>
            ) : (
              <img
                src={safeImage(item.url)}
                alt={`${title} preview ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            )}
          </div>
        );
      })}

      {/* Gradient overlay at bottom for better text visibility */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/60 to-transparent" />

      <div className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-black shadow-sm">
        <ImageIcon className="h-3.5 w-3.5 text-black/70" />
        {media.length} media
      </div>

      {extraCount > 0 && (
        <div className="absolute right-3 top-3 z-30 inline-flex items-center justify-center rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
          +{extraCount}
        </div>
      )}
    </div>
  );
}

function AdGalleryModal({
  ad,
  open,
  onClose,
}: {
  ad: AdDto | null;
  open: boolean;
  onClose: () => void;
}) {
  const media = useMemo(() => {
    if (!ad) return [];
    const images = Array.isArray(ad.imageUrl) ? ad.imageUrl : [];
    const videos = Array.isArray(ad.videoUrl) ? ad.videoUrl : [];
    return [
      ...images.map((url): MediaItem => ({ type: 'image', url })),
      ...videos.map((url): MediaItem => ({ type: 'video', url }))
    ];
  }, [ad]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    setActiveIndex(0);
  }, [open, ad]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
      }
      if (event.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, media.length, onClose]);

  if (!open || !ad || media.length === 0) return null;

  const active = media[activeIndex];

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-2 md:p-6 backdrop-blur-sm">
      <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-black md:flex-row md:bg-zinc-950 shadow-2xl ring-1 ring-white/10">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-white hover:text-black"
          aria-label="Close gallery"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative flex flex-1 items-center justify-center bg-black">
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black"
                aria-label="Previous media"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={goNext}
                className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white hover:text-black"
                aria-label="Next media"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {active.type === 'video' ? (
            <video
              key={`vid-${activeIndex}`}
              src={active.url}
              controls
              autoPlay
              playsInline
              className="h-full max-h-[70vh] w-full object-contain md:max-h-[85vh]"
            />
          ) : (
            <img
              key={`img-${activeIndex}`}
              src={safeImage(active.url)}
              alt={`${ad.title} ${activeIndex + 1}`}
              className="h-full max-h-[70vh] w-full object-contain md:max-h-[85vh]"
            />
          )}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {activeIndex + 1} / {media.length}
          </div>
        </div>

        <div className="flex max-h-[40vh] w-full flex-col border-white/10 bg-white md:max-h-none md:w-[380px] md:border-l">
          <div className="flex-1 overflow-y-auto p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-black">
                  {ad.salonName || 'SalonStore Partner'}
                </p>
                <p className="text-xs text-black/50">
                  {formatPostDate(ad.createdAt)}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#d4a017]/15 px-2.5 py-1 text-[11px] font-semibold text-[#8a6700]">
                Sponsored
              </span>
            </div>

            <h3 className="text-xl font-bold leading-tight text-black">{ad.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-black/70">
              {ad.description || 'Exclusive promotion from our salon partner.'}
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-black/60">
              <MapPin className="h-4 w-4" />
              Available islandwide
            </div>

            <div className="mt-6 border-t border-black/10 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-black/40">
                Gallery
              </p>
              <div className="grid grid-cols-4 gap-2">
                {media.map((item, index) => (
                  <button
                    key={`${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-lg border-2 transition ${activeIndex === index
                        ? 'border-[#d4a017]'
                        : 'border-transparent hover:border-black/20'
                      }`}
                  >
                    {item.type === 'video' ? (
                      <div className="relative h-full w-full bg-black">
                        <video
                          src={item.url}
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="h-4 w-4 fill-white text-white drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={safeImage(item.url)}
                        alt={`Thumb ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdCard({
  ad,
  onOpen,
  onLearnMore,
}: {
  ad: AdDto;
  onOpen: (ad: AdDto) => void;
  onLearnMore?: (adId: string) => void;
}) {
  const media = useMemo(() => {
    const images = Array.isArray(ad.imageUrl) ? ad.imageUrl : [];
    const videos = Array.isArray(ad.videoUrl) ? ad.videoUrl : [];
    const out: MediaItem[] = [
      ...images.map((url): MediaItem => ({ type: 'image', url })),
      ...videos.map((url): MediaItem => ({ type: 'video', url }))
    ];
    if (out.length === 0) {
      out.push({ type: 'image', url: PLACEHOLDER_IMG });
    }
    return out;
  }, [ad]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <button
        type="button"
        onClick={() => onOpen(ad)}
        className="relative block w-full text-left"
      >
        <AdMediaPreview media={media} title={ad.title} />
      </button>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-1 text-sm font-semibold text-black">
              {ad.salonName || 'SalonStore Partner'}
            </p>
            <p className="text-xs text-black/50">{formatPostDate(ad.createdAt)}</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#d4a017]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#d4a017]">
            Sponsored
          </span>
        </div>

        <button
          type="button"
          onClick={() => onOpen(ad)}
          className="block text-left"
        >
          <h3 className="line-clamp-2 text-lg font-bold leading-tight text-black transition group-hover:text-[#d4a017]">
            {ad.title}
          </h3>
        </button>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-black/60">
          {ad.description || 'Exclusive promotion from our salon partner.'}
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-black/50">
              <MapPin className="h-3.5 w-3.5" />
              Available islandwide
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpen(ad)}
                className="rounded-xl border border-black/10 px-3 py-2 text-xs font-bold text-black transition hover:bg-black/5"
              >
                Preview
              </button>

              <button
                type="button"
                onClick={() => onLearnMore?.(ad.id)}
                className="rounded-xl bg-[#d4a017] px-3 py-2 text-xs font-bold text-black transition hover:bg-[#c79614]"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FeaturedAdsSection({
  ads,
  onAdSelect,
  isLoading,
  error,
  page,
  totalPages,
  onPageChange,
}: {
  ads: AdDto[];
  onAdSelect?: (adId: string) => void;
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}) {
  const [selectedAd, setSelectedAd] = useState<AdDto | null>(null);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + 4);
    if (end - start < 4 && totalPages >= 5) {
      start = Math.max(1, end - 4);
    }
    for (let p = start; p <= end; p += 1) {
      pages.push(p);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <>
      <section className="mx-auto mt-10 w-full max-w-screen-2xl px-3 md:px-5">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Featured Offers
            </h2>
            <p className="mt-1.5 text-sm text-black/60">
              Explore amazing deals and services from top salons
            </p>
          </div>
        </div>

        {!isLoading && !error && ads.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 text-center text-sm text-black/60">
            No active offers available at the moment.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  onOpen={setSelectedAd}
                  onLearnMore={onAdSelect}
                />
              ))}
            </div>

            <div className="mt-8 flex items-center justify-center gap-1.5">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                type="button"
                onClick={() => page > 1 && onPageChange(page - 1)}
                disabled={page <= 1}
                aria-label="Previous ads page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold ${pageNum === page
                      ? 'bg-[#1f5eff] text-white'
                      : 'border border-black/20 bg-white text-black/70 hover:bg-black/5'
                    }`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </button>
              ))}

              <button
                className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                type="button"
                onClick={() => page < totalPages && onPageChange(page + 1)}
                disabled={page >= totalPages}
                aria-label="Next ads page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </section>

      <AdGalleryModal
        ad={selectedAd}
        open={!!selectedAd}
        onClose={() => setSelectedAd(null)}
      />
    </>
  );
}



export default function FindSalonPage({ onSalonSelect, onAdSelect }: FindSalonPageProps) {
  const [salons, setSalons] = useState<SalonDto[]>([]);
  const [salonPage, setSalonPage] = useState(1);
  const [salonTotalPages, setSalonTotalPages] = useState(1);
  const [isSalonLoading, setIsSalonLoading] = useState(true);
  const [salonError, setSalonError] = useState<string | null>(null);

  const [ads, setAds] = useState<AdDto[]>([]);
  const [adPage, setAdPage] = useState(1);
  const [adTotalPages, setAdTotalPages] = useState(1);
  const [isAdLoading, setIsAdLoading] = useState(true);
  const [adError, setAdError] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSalons() {
      setIsSalonLoading(true);
      setSalonError(null);

      try {
        const salonRes = await getByPrority(salonPage, SALONS_PER_PAGE);
        if (!isMounted) return;

        const salonPayload = (salonRes.data ?? {}) as PagedResponse<SalonDto>;
        setSalons(Array.isArray(salonPayload.data) ? salonPayload.data : []);
        setSalonTotalPages(Math.max(1, salonPayload.pagination?.totalPages ?? 1));
      } catch (err: any) {
        if (!isMounted) return;
        setSalonError(err?.response?.data?.message || 'Failed to load salon data.');
      } finally {
        if (isMounted) setIsSalonLoading(false);
      }
    }

    loadSalons();

    return () => {
      isMounted = false;
    };
  }, [salonPage]);

  useEffect(() => {
    let isMounted = true;

    async function loadAds() {
      setIsAdLoading(true);
      setAdError(null);

      try {
        const adsRes = await getAdsByPriority(adPage, ADS_PER_PAGE || 10);
        if (!isMounted) return;

        const adPayload = (adsRes.data ?? {}) as PagedResponse<AdDto>;

        const nextCurrentPage = Math.max(1, adPayload.pagination?.currentPage ?? adPage);
        const nextTotalPages = Math.max(1, adPayload.pagination?.totalPages ?? 1);

        setAds(Array.isArray(adPayload.data) ? adPayload.data : []);
        setAdTotalPages(nextTotalPages);

        if (nextCurrentPage !== adPage) {
          setAdPage(nextCurrentPage);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setAdError(err?.response?.data?.message || 'Failed to load ad data.');
      } finally {
        if (isMounted) setIsAdLoading(false);
      }
    }

    loadAds();

    return () => {
      isMounted = false;
    };
  }, [adPage]);

  const showingLabel = useMemo(() => {
    const from = (salonPage - 1) * SALONS_PER_PAGE + 1;
    const to = (salonPage - 1) * SALONS_PER_PAGE + salons.length;
    return `Showing ${from}-${to} results`;
  }, [salonPage, salons.length]);

  const canGoPrev = salonPage > 1;
  const canGoNext = salonPage < salonTotalPages;

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxWindow = 5;
    const start = Math.max(1, salonPage - 2);
    const end = Math.min(salonTotalPages, start + maxWindow - 1);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [salonPage, salonTotalPages]);



  const scrollCarousel = (direction: 'left' | 'right') => {
    const node = carouselRef.current;
    if (!node) return;
    const amount = Math.max(280, Math.floor(node.clientWidth * 0.8));
    node.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [salonPage]);

  return (
    <main className="min-h-screen bg-[#f3f3f3] pb-10">
      <section className="mx-auto w-full max-w-screen-2xl px-3 pt-6 md:px-5 md:pt-8">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-medium text-black/55">{showingLabel}</p>
          <select
            className="h-9 w-44 rounded-md border border-black/20 bg-white px-3 text-xs text-black shadow-sm outline-none"
            defaultValue="rating"
          >
            <option value="rating">Sort by average rating</option>
            <option value="name">Sort by salon name</option>
          </select>
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          {isSalonLoading ? (
            <div className="flex h-56 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#d4a017]" />
            </div>
          ) : salonError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{salonError}</div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-medium text-black/60">Top salons</p>
                <div className="flex items-center gap-1.5">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-black/20 text-black/70 hover:bg-black/5"
                    type="button"
                    onClick={() => scrollCarousel('left')}
                    aria-label="Scroll salons left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-black/20 text-black/70 hover:bg-black/5"
                    type="button"
                    onClick={() => scrollCarousel('right')}
                    aria-label="Scroll salons right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div
                ref={carouselRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {salons.map((salon) => {
                  const image = safeImage(salon.images?.[0]);
                  return (
                    <article
                      key={salon.id}
                      className="group w-56 shrink-0 snap-start overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm transition hover:shadow-md"
                    >
                      <button
                        className="w-full text-left"
                        onClick={() => onSalonSelect?.(salon.id)}
                        type="button"
                      >
                        <BlurredContainImage src={image} alt={salon.salonName} heightClass="h-40" />

                        <div className="space-y-1 p-3">
                          <p className="line-clamp-1 text-[11px] text-black/50">{salon.city || 'Sri Lanka'}</p>
                          <h3 className="line-clamp-2 min-h-9 text-sm font-semibold text-black">{salon.salonName}</h3>
                          <p className="line-clamp-1 text-[11px] text-black/60">{salon.address || salon.description || 'Premium beauty services'}</p>
                          <div className="pt-1">
                            <span className="inline-flex h-7 items-center rounded-md bg-[#1f5eff] px-3 text-xs font-semibold text-white">
                              Read more
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5">
                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                  onClick={() => canGoPrev && setSalonPage((p) => p - 1)}
                  disabled={!canGoPrev}
                  aria-label="Previous salons page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold ${pageNum === salonPage
                      ? 'bg-[#1f5eff] text-white'
                      : 'border border-black/20 bg-white text-black/70 hover:bg-black/5'
                      }`}
                    type="button"
                    onClick={() => setSalonPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                  type="button"
                  onClick={() => canGoNext && setSalonPage((p) => p + 1)}
                  disabled={!canGoNext}
                  aria-label="Next salons page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      <FeaturedAdsSection
        ads={ads}
        onAdSelect={onAdSelect}
        isLoading={isAdLoading}
        error={adError}
        page={adPage}
        totalPages={adTotalPages}
        onPageChange={setAdPage}
      />
    </main>
  );
}
