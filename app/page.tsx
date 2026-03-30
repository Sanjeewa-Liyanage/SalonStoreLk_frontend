import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HomePage from '@/components/HomePage';
//todo: update canonical URL to your actual domain before deployment
export const metadata: Metadata = {
  title: 'SalonStoreLK | Find the Best Salons in Sri Lanka',
  description:
    'Discover trusted salons, beauty services, and beauty professionals across Sri Lanka.',
  alternates: {
    canonical: 'https://yourdomain.com/',
  },
};

export default function Page() {

  return (
    <div 
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: "url('/background.jpg')",
      }}
    >
      <Header currentPage="home" />

      <div className="grow ">
        <HomePage />
      </div>

     <Footer />
    </div>
  );
}
