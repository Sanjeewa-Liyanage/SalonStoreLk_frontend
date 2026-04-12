'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState, useCallback, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Facebook,
  Globe,
  Instagram,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  Phone,
  Star,
  Youtube,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSalonById } from '@/lib/salonService';
import type { Salon } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

type SalonDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

const MUSTARD = '#d4a32b';
const FALLBACK_SALON_IMAGE =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80';

function getWhatsappHref(value?: string) {
  const cleaned = String(value || '').replace(/\D/g, '');
  return cleaned ? `https://wa.me/${cleaned}` : null;
}

function normalizeExternalUrl(rawUrl?: string) {
  const value = String(rawUrl || '').trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

function buildDirectionsHref(salon: Salon) {
  if (salon.coordinates) {
    const { latitude, longitude } = salon.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    salon.contact.address
  )}`;
}

function buildMapEmbedHref(salon: Salon) {
  if (salon.coordinates) {
    const { latitude, longitude } = salon.coordinates;
    return `https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;
  }
  return `https://www.google.com/maps?q=${encodeURIComponent(salon.contact.address)}&output=embed`;
}

function formatOpeningHours(salon: Salon) {
  if (salon.openingTime && salon.closingTime) {
    return `${salon.openingTime} - ${salon.closingTime}`;
  }
  if (salon.openingTime) return `Opens at ${salon.openingTime}`;
  if (salon.closingTime) return `Closes at ${salon.closingTime}`;
  return 'Opening hours not available';
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

type SalonGalleryProps = {
  images: string[];
  salonName: string;
};

function SalonGallery({ images, salonName }: SalonGalleryProps) {
  const hasMultiple = images.length > 1;
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

    const timerId = window.setInterval(() => {
      if (mainApi) mainApi.scrollNext();
    }, 4500);

    return () => window.clearInterval(timerId);
  }, [hasMultiple, mainApi]);

  const handleKeyNavigation = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!hasMultiple) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPrevious(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showNext(); }
  };

  if (images.length === 0) return null;

  return (
    <section className="space-y-3" tabIndex={0} onKeyDown={handleKeyNavigation} aria-label="Salon image gallery">
      <div className="relative overflow-hidden rounded-xl border border-[#d4a32b]/40 bg-zinc-900 p-2">
        <div className="overflow-hidden" ref={mainRef}>
          <div className="flex touch-pan-y" style={{ backfaceVisibility: 'hidden' }}>
            {images.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className="relative flex h-[clamp(300px,56vh,640px)] min-w-0 flex-[0_0_100%] items-center justify-center p-2"
              >
                <img
                  src={image}
                  alt={`${salonName} ${index + 1}`}
                  className="max-h-full w-full rounded-lg object-contain select-none"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.src !== FALLBACK_SALON_IMAGE) target.src = FALLBACK_SALON_IMAGE;
                  }}
                />
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
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-4 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/20 bg-white/90 text-black shadow-sm transition hover:bg-white disabled:opacity-50"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <div className="overflow-hidden pb-1" ref={thumbRef}>
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-thumb-${index}`}
              type="button"
              onClick={() => onThumbClick(index)}
              aria-label={`View image ${index + 1}`}
              className={`relative h-20 w-28 shrink-0 min-w-0 overflow-hidden rounded-md border transition sm:h-24 sm:w-36 ${
                selectedIndex === index
                  ? 'border-[#d4a32b] ring-2 ring-[#d4a32b]'
                  : 'border-black/15 hover:border-[#d4a32b]/60 hover:opacity-100 opacity-60'
              }`}
            >
              <img
                src={image}
                alt={`Thumb ${index + 1}`}
                className="h-full w-full object-cover select-none"
                onError={(e) => {
                  const t = e.currentTarget;
                  if (t.src !== FALLBACK_SALON_IMAGE) t.src = FALLBACK_SALON_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

type SalonInfoPanelProps = {
  salon: Salon;
};

function SalonInfoPanel({ salon }: SalonInfoPanelProps) {
  const overviewText = salon.overview?.trim() || salon.description;
  const socialLinks = [
    {
      href: normalizeExternalUrl(salon.socialMedia?.facebook),
      label: 'Facebook',
      icon: <Facebook className="h-4 w-4" />,
    },
    {
      href: normalizeExternalUrl(salon.socialMedia?.instagram),
      label: 'Instagram',
      icon: <Instagram className="h-4 w-4" />,
    },
    {
      href: normalizeExternalUrl(salon.socialMedia?.tiktok),
      label: 'TikTok',
      icon: <Music2 className="h-4 w-4" />,
    },
    {
      href: normalizeExternalUrl(salon.socialMedia?.youtube),
      label: 'YouTube',
      icon: <Youtube className="h-4 w-4" />,
    },
  ].filter((item) => !!item.href);

  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4a32b]/40 bg-[#d4a32b]/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
          <BadgeCheck className="h-3.5 w-3.5 text-[#d4a32b]" />
          Verified Salon
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-black md:text-4xl">{salon.name}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-black/75">
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-[#d4a32b]" />
            <span>{salon.contact.address}</span>
          </div>

          <div className="inline-flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-[#d4a32b] text-[#d4a32b]" />
            <span>{(salon.rating || 0).toFixed(1)} rating</span>
          </div>
        </div>
      </div>

      <p className="text-sm leading-7 text-black/80">{overviewText}</p>

      {socialLinks.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-black/60">Get in touch with this salon</p>
          <div className="flex flex-wrap gap-2">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-black/20 bg-white px-3 py-1.5 text-xs font-medium text-black transition hover:border-[#d4a32b]/80"
              >
                {link.icon}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

type SalonContactActionsProps = {
  salon: Salon;
};

function SalonContactActions({ salon }: SalonContactActionsProps) {
  const whatsappHref = getWhatsappHref(salon.contact.whatsapp);
  const directionsHref = buildDirectionsHref(salon);

  return (
    <section className="space-y-4 border-t border-[#d4a32b]/25 pt-4">
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-2.5">
          <Phone className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
          <div>
            <p className="font-semibold text-black">Phone</p>
            <a href={`tel:${salon.contact.phone}`} className="text-black/75 hover:text-black hover:underline">
              {salon.contact.phone}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Clock3 className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
          <div>
            <p className="font-semibold text-black">Opening Hours</p>
            <p className="text-black/75">{formatOpeningHours(salon)}</p>
          </div>
        </div>

        {salon.salonCode && (
          <div className="flex items-start gap-2.5">
            <Globe className="mt-0.5 h-4 w-4 text-[#d4a32b]" />
            <div>
              <p className="font-semibold text-black">Salon Code</p>
              <p className="text-black/75">{salon.salonCode}</p>
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-black/10">
        <iframe
          title="Salon location"
          src={buildMapEmbedHref(salon)}
          className="h-52 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="grid gap-2.5">
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-[#d4a32b] transition hover:bg-black/90"
        >
          <Navigation className="h-4 w-4" />
          Get Directions
        </a>

        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-black px-4 py-3 text-sm font-semibold text-black transition hover:bg-black/5"
          >
            <MessageCircle className="h-4 w-4 text-[#d4a32b]" />
            WhatsApp
          </a>
        )}

        <a
          href={`tel:${salon.contact.phone}`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d4a32b]/50 bg-[#d4a32b]/12 px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#d4a32b]/20"
        >
          <Phone className="h-4 w-4 text-[#d4a32b]" />
          Book Now
        </a>
      </div>
    </section>
  );
}

type SalonDescriptionProps = {
  description: string;
};

function SalonDescription({ description }: SalonDescriptionProps) {
  const parsed = useMemo(() => splitDescription(description), [description]);

  return (
    <article className="space-y-4 border-t border-black/10 pt-6">
      <h2 className="text-2xl font-bold tracking-tight text-black">Description</h2>

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

type SalonServicesProps = {
  services: Salon['services'];
};

function SalonServices({ services }: SalonServicesProps) {
  const groupedServices = useMemo(() => {
    if (!services.length) return [] as Array<[string, string[]]>;

    const buckets = services.reduce<Record<string, string[]>>((acc, service) => {
      const key = service.category || 'Services';
      if (!acc[key]) acc[key] = [];
      acc[key].push(service.name);
      return acc;
    }, {});

    return Object.entries(buckets);
  }, [services]);

  return (
    <article className="space-y-4 border-t border-black/10 pt-6">
      <h2 className="text-2xl font-bold tracking-tight text-black">Services</h2>

      {groupedServices.length > 0 ? (
        <Accordion type="single" collapsible className="w-full">
          {groupedServices.map(([category, items]) => (
            <AccordionItem key={category} value={category} className="border-black/10">
              <AccordionTrigger className="font-semibold text-black hover:no-underline">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: MUSTARD }} />
                  {category}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-wrap gap-2">
                  {items.map((name) => (
                    <Badge
                      key={`${category}-${name}`}
                      variant="outline"
                      className="border-[#d4a32b]/40 bg-[#d4a32b]/10 px-3 py-1 text-xs font-medium text-black"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-sm text-black/70">No services listed yet.</p>
      )}
    </article>
  );
}

export default function SalonDetailRoutePage({ params }: SalonDetailPageProps) {
  const resolvedParams = use(params);
  const salonId = String(resolvedParams?.id || '').trim();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSalon = async () => {
      if (!salonId) {
        setSalon(null);
        setError('Salon ID is missing from the route.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const detail = await getSalonById(salonId);
        if (!mounted) return;
        setSalon(detail);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.response?.data?.message || 'Failed to load salon details.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadSalon();

    return () => {
      mounted = false;
    };
  }, [salonId]);

  const galleryImages = useMemo(() => {
    const rawGallery = salon?.gallery?.length ? salon.gallery : salon?.image ? [salon.image] : [];
    const cleaned = rawGallery
      .map((image) => String(image || '').trim())
      .filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    return unique.length ? unique : [FALLBACK_SALON_IMAGE];
  }, [salon]);

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
          {salon && (
            <>
              <span className="text-black/35">/</span>
              <span>{salon.city || salon.district || 'Salon Details'}</span>
              <span className="text-black/35">/</span>
              <span className="font-medium text-black/80">{salon.name}</span>
            </>
          )}
        </div>

        {isLoading && (
          <div className="border border-[#d4a32b]/20 bg-[#fffaf0] p-10 text-center">
            <p className="text-sm font-medium text-black/70">Loading salon details...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="border border-red-200 bg-red-50 p-6 text-center">
            <h1 className="text-xl font-bold text-black">Unable to Load Salon</h1>
            <p className="mt-2 text-sm text-black/70">{error}</p>
          </div>
        )}

        {!isLoading && !error && salon && (
          <div className="space-y-8">
            <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
              <div className="space-y-8">
                <SalonGallery images={galleryImages} salonName={salon.name} />
                <SalonServices services={salon.services} />
                <SalonDescription description={salon.description} />
              </div>

              <aside className="self-start lg:sticky lg:top-24">
                <div className="space-y-6">
                  <SalonInfoPanel salon={salon} />
                  <SalonContactActions salon={salon} />
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
