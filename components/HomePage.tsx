import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="relative pb-[350px] sm:pb-[320px] md:pb-[280px] lg:pb-[280px] ">
      {/* Hero Section */}
      <section 
        className="relative min-h-[500px] sm:min-h-[560px] lg:min-h-[620px] flex items-center justify-center"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#decfb0]/60"></div>
        
        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16 text-center">
          {/* Main Heading */}
          <div className="mb-6 sm:mb-8">
            <h1
              className="mb-2 sm:mb-3 block py-2 font-bold text-black whitespace-nowrap overflow-hidden"
              style={{ fontSize: 'clamp(12px, 2.8vw, 42px)' }}
            >
              ALL SRI LANKAN PROFESSIONAL SALON IN ONE PLACE
            </h1>
            <p
              className="block py-2 font-bold text-black whitespace-nowrap overflow-hidden"
              style={{ fontFamily: 'Arial, sans-serif', fontSize: 'clamp(12px, 2.8vw, 42px)' }}
            >
              ලංකාවෙ වෘත්තීය සැලෝන් එකම තැනකින්.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/find-salon"
              className="w-full sm:w-auto bg-black hover:bg-[#e1a816]/80 text-white font-bold px-6 sm:px-8 py-3 uppercase transition text-sm"
            >
              FIND YOUR SALON
            </Link>
            <Link
              href="/auth/register"
              className="w-full sm:w-auto bg-black hover:bg-[#e1a816]/80 text-white font-bold px-6 sm:px-8 py-3 uppercase transition text-sm"
            >
              PUBLISH YOUR SALON
            </Link>
          </div>

          {/* YouTube Video Embed */}
          <div className="flex justify-center">
            <div className="w-full max-w-md sm:max-w-xl lg:max-w-xl aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/HpVI5_nvo2s?si=KIvCU4ytj9Tamc9e" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="rounded-lg shadow-xl"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - Absolute Positioning */}
      <section className="absolute bottom-0 left-0 right-0 bg-black border-t border-zinc-800 mb-2 mx-2">
        <div className="mx-auto max-w-[1850px]">
          {/* Mobile/Tablet Layout */}
          <div className="flex flex-col items-center gap-6 px-4 py-6 md:py-8 lg:hidden">
            <div className="flex w-full max-w-[620px] items-center justify-center gap-3 sm:gap-4 md:gap-6">
              <div className="h-[86px] w-[112px] sm:h-[96px] sm:w-[132px] md:h-[110px] md:w-[160px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=420&h=300&fit=crop"
                  alt="Visit Top Salons"
                  className="h-full w-full object-cover"
                />
              </div>
              <h4
                className="text-center font-extrabold uppercase tracking-wide text-[10px] sm:text-xs md:text-sm leading-snug"
                style={{
                  color: "#d4a017",
                  whiteSpace: "nowrap",
                }}
              >
                VISIT TOP SALONS IN SR LANKA
              </h4>
            </div>

            <div className="h-[96px] w-[96px] sm:h-[112px] sm:w-[112px] md:h-[128px] md:w-[128px] overflow-hidden">
              <img
                src="/logogif.gif"
                alt="SalonStore.lk Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex w-full max-w-[620px] items-center justify-center gap-3 sm:gap-4 md:gap-6">
              <h4
                className="text-center font-extrabold uppercase tracking-wide text-[10px] sm:text-xs md:text-sm leading-snug"
                style={{
                  color: "#d4a017",
                  whiteSpace: "nowrap",
                }}
              >
                CONTACT YOUR TOP BEAUTICIAN
              </h4>
              <div className="h-[86px] w-[112px] sm:h-[96px] sm:w-[132px] md:h-[110px] md:w-[160px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=420&h=300&fit=crop"
                  alt="Contact Top Beautician"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex items-center justify-between py-10 xl:py-12" style={{ minHeight: "250px" }}>
            {/* Left Image */}
            <div className="flex-shrink-0 h-[160px] w-[210px] xl:h-[180px] xl:w-[240px] overflow-hidden relative ml-6 xl:ml-12" >
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=420&h=300&fit=crop"
                alt="Visit Top Salons"
                className="h-full w-full object-cover object-top"
              />
            </div>

            {/* Left Text */}
            <div className="flex items-center justify-center px-2 xl:px-6">
              <h3
                className="text-center font-extrabold uppercase tracking-widest leading-tight"
                style={{
                  color: "#d4a017",
                  fontSize: "clamp(8px, 1vw, 15px)",
                  whiteSpace: "nowrap",
                  textShadow: "0 0 12px rgba(212,160,23,0.3)",
                  fontFamily: "'Georgia', serif",
                  letterSpacing: "0.1em",
                }}
              >
                VISIT TOP SALONS IN SR LANKA
              </h3>
            </div>

            {/* Center Logo */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: "220px" }}
            >
              <div
                className="overflow-hidden"
                style={{ width: "150px", height: "150px" }}
              >
                <img
                  src="/logogif.gif"
                  alt="SalonStore.lk Logo"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Right Text */}
            <div className="flex items-center justify-center px-2 xl:px-6">
              <h3
                className="text-center font-extrabold uppercase tracking-widest leading-tight"
                style={{
                  color: "#d4a017",
                  fontSize: "clamp(8px, 1vw, 15px)",
                  whiteSpace: "nowrap",
                  textShadow: "0 0 12px rgba(212,160,23,0.3)",
                  fontFamily: "'Georgia', serif",
                  letterSpacing: "0.1em",
                }}
              >
                CONTACT YOUR TOP BEAUTICIAN
              </h3>
            </div>

            {/* Right Image */}
            
            <div className="flex-shrink-0 h-[160px] w-[210px] xl:h-[180px] xl:w-[240px] overflow-hidden relative mr-6 xl:mr-12">
              <img
                src="https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=420&h=300&fit=crop"
                alt="Contact Top Beautician"
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
