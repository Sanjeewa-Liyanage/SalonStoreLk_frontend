'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2, MapPin } from 'lucide-react';
import { getByPrority } from '@/lib/salonService';
import { getByPriority as getAdsByPriority } from '@/lib/adsService';

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

function MediaTile({
  item,
  alt,
  heightClass,
  overlay,
}: {
  item: MediaItem;
  alt: string;
  heightClass: string;
  overlay?: React.ReactNode;
}) {
  if (item.type === 'video') {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-black/10 bg-black ${heightClass}`}>
        <video
          src={item.url}
          muted
          loop
          playsInline
          preload="metadata"
          controls
          onClick={(e) => e.stopPropagation()}
          className="h-full w-full object-contain"
        />
        {overlay}
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden rounded-xl border border-black/10 bg-white ${heightClass}`}>
      <BlurredContainImage src={safeImage(item.url)} alt={alt} heightClass="h-full" />
      {overlay}
    </div>
  );
}

function AdMediaLayout({
  images,
  videos,
  title,
}: {
  images: string[];
  videos: string[];
  title: string;
}) {
  // Merge: images first, then videos
  const media: MediaItem[] = [
    ...(images.length ? images : [PLACEHOLDER_IMG]).map(
      (url): MediaItem => ({ type: 'image', url })
    ),
    ...videos.map((url): MediaItem => ({ type: 'video', url })),
  ];

  if (media.length === 1) {
    return (
      <MediaTile item={media[0]} alt={title} heightClass="h-72" />
    );
  }

  if (media.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        {media.slice(0, 2).map((item, idx) => (
          <MediaTile key={`${item.url}-${idx}`} item={item} alt={`${title} ${idx + 1}`} heightClass="h-64" />
        ))}
      </div>
    );
  }

  if (media.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-1.5">
        <MediaTile item={media[0]} alt={`${title} 1`} heightClass="h-96" />
        <div className="flex flex-col gap-1.5">
          {media.slice(1, 3).map((item, idx) => (
            <MediaTile key={`${item.url}-${idx}`} item={item} alt={`${title} ${idx + 2}`} heightClass="h-[188px]" />
          ))}
        </div>
      </div>
    );
  }

  // 4 or more — show first 4, overlay +N on last
  const visible = media.slice(0, 4);
  const remaining = media.length - 4;

  return (
    <div className="grid grid-cols-2 gap-1.5">
      {visible.map((item, idx) => (
        <MediaTile
          key={`${item.url}-${idx}`}
          item={item}
          alt={`${title} ${idx + 1}`}
          heightClass="h-48"
          overlay={
            idx === 3 && remaining > 0 ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-2xl font-bold text-white pointer-events-none">
                +{remaining}
              </div>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}

export default function FindSalonPage({ onSalonSelect, onAdSelect }: FindSalonPageProps) {
  const [salons, setSalons] = useState<SalonDto[]>([]);
  const [ads, setAds] = useState<AdDto[]>([]);
  const [salonPage, setSalonPage] = useState(1);
  const [salonTotalPages, setSalonTotalPages] = useState(1);
  const [adPage, setAdPage] = useState(1);
  const [adTotalPages, setAdTotalPages] = useState(1);
  const [isSalonLoading, setIsSalonLoading] = useState(true);
  const [isAdsLoading, setIsAdsLoading] = useState(true);
  const [salonError, setSalonError] = useState<string | null>(null);
  const [adsError, setAdsError] = useState<string | null>(null);
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
      setIsAdsLoading(true);
      setAdsError(null);

      try {
        const adPayload = (await getAdsByPriority(adPage, ADS_PER_PAGE)) as PagedResponse<AdDto>;

        if (!isMounted) return;

        const nextCurrentPage = Math.max(1, adPayload.pagination?.currentPage ?? adPage);
        const nextTotalPages = Math.max(1, adPayload.pagination?.totalPages ?? 1);

        setAds(Array.isArray(adPayload.data) ? adPayload.data : []);
        setAdTotalPages(nextTotalPages);

        if (nextCurrentPage !== adPage) {
          setAdPage(nextCurrentPage);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setAdsError(err?.response?.data?.message || 'Failed to load featured offers.');
      } finally {
        if (isMounted) setIsAdsLoading(false);
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

  const canGoAdPrev = adPage > 1;
  const canGoAdNext = adPage < adTotalPages;

  const adPageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxWindow = 5;
    const start = Math.max(1, adPage - 2);
    const end = Math.min(adTotalPages, start + maxWindow - 1);
    for (let p = start; p <= end; p += 1) pages.push(p);
    return pages;
  }, [adPage, adTotalPages]);

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
                    className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold ${
                      pageNum === salonPage
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

      <section className="mx-auto mt-10 w-full max-w-screen-2xl px-3 md:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-black">Featured Offers</h2>
            <p className="mt-1 text-sm text-black/55">Scroll to explore amazing deals and services</p>
          </div>
          <p className="text-xs font-medium text-black/55">Page {adPage} of {adTotalPages}</p>
        </div>

        <div className="mt-5 space-y-4">
          {isAdsLoading ? (
            <div className="flex h-40 items-center justify-center rounded-2xl border border-black/10 bg-white">
              <Loader2 className="h-7 w-7 animate-spin text-[#d4a017]" />
            </div>
          ) : adsError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{adsError}</div>
          ) : (
            <>
              {ads.map((ad) => (
                <article
                  key={ad.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onAdSelect?.(ad.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onAdSelect?.(ad.id);
                    }
                  }}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-black">{ad.salonName || 'SalonStore Partner'}</p>
                      <p className="text-xs text-black/45">{formatPostDate(ad.createdAt)}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-[#d4a017]/15 px-2.5 py-1 text-[11px] font-semibold text-[#8a6700]">
                      Sponsored
                    </span>
                  </div>

                  <div className="space-y-3 p-4">
                    <h3 className="text-base font-semibold text-black">{ad.title}</h3>
                    <p className="line-clamp-4 text-sm leading-relaxed text-black/70">{ad.description || 'Exclusive promotion from our salon partner.'}</p>
                    <AdImageLayout images={Array.isArray(ad.imageUrl) ? ad.imageUrl : []} title={ad.title} />
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 px-4 py-3">
                    <div className="inline-flex items-center gap-1 text-xs text-black/50">
                      <MapPin className="h-3.5 w-3.5" />
                      Available islandwide
                    </div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onAdSelect?.(ad.id);
                      }}
                      className="rounded-md bg-[#d4a017] px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-[#c79614]"
                    >
                      Learn More
                    </button>
                  </div>
                </article>
              ))}

              {ads.length === 0 && (
                <div className="rounded-2xl border border-black/10 bg-white p-6 text-center text-sm text-black/60">
                  No active offers available at the moment.
                </div>

              <div className="space-y-3 p-4">
                <h3 className="text-base font-semibold text-black">{ad.title}</h3>
                <p className="line-clamp-4 text-sm leading-relaxed text-black/70">{ad.description || 'Exclusive promotion from our salon partner.'}</p>
                <AdMediaLayout
                  images={Array.isArray(ad.imageUrl) ? ad.imageUrl : []}
                  videos={Array.isArray(ad.videoUrl) ? ad.videoUrl : []}
                  title={ad.title}
                />
              </div>

              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => canGoAdPrev && setAdPage((p) => p - 1)}
                  disabled={!canGoAdPrev}
                  aria-label="Previous offers page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {adPageNumbers.map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`h-7 min-w-7 rounded-md px-2 text-xs font-semibold ${
                      pageNum === adPage
                        ? 'bg-[#1f5eff] text-white'
                        : 'border border-black/20 bg-white text-black/70 hover:bg-black/5'
                    }`}
                    type="button"
                    onClick={() => setAdPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-black/20 text-black/70 disabled:cursor-not-allowed disabled:opacity-45"
                  onClick={() => canGoAdNext && setAdPage((p) => p + 1)}
                  disabled={!canGoAdNext}
                  aria-label="Next offers page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
