import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FindSalonRouteClient from '@/components/FindSalonRouteClient';
//todo need to replace actual domain before deployment
export const metadata: Metadata = {
  title: 'Find Salons | Browse Salons Near You',
  description:
    'Search and discover beauty salons by location, services, and ratings in Sri Lanka.',
  alternates: {
    canonical: 'https://yourdomain.com/find-salon',
  },
};

export default function FindSalonPageRoute() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f3]">
      <Header currentPage="find" />

      <main className="grow">
        <section className="mx-auto w-full max-w-screen-2xl px-4 pt-6 pb-2 md:px-6 md:pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">
            Find Beauty Salons Across Sri Lanka
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-black/70 md:text-base">
            Browse verified salons by city, compare services, and explore the latest featured offers from trusted
            beauty professionals.
          </p>
          <p className="mt-2 text-sm text-black/70">
            Looking for the homepage?
            {' '}
            <Link href="/" className="font-semibold text-[#1f5eff] hover:underline">
              Go to SalonStoreLK Home
            </Link>
            .
          </p>
        </section>

        <FindSalonRouteClient />
      </main>

      <Footer />
    </div>
  );
}