import Image from "next/image";
import Link from "next/link";
import MovementSection from "@/components/MovementSection";
import MobileNav from "@/components/MobileNav";
import ScrollReveal from "@/components/ScrollReveal";

// Play button component for hero video
function PlayButton() {
  return (
    <button
      type="button"
      aria-label="Play hero video"
      className="group relative w-[140px] h-[140px] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-full"
    >
      {/* Outer circle */}
      <div className="absolute inset-0 rounded-full border-[3px] border-white/80 group-hover:border-white transition-colors" />
      {/* Play triangle */}
      <div className="ml-3 w-0 h-0 border-t-[24px] border-t-transparent border-l-[42px] border-l-white border-b-[24px] border-b-transparent" />
    </button>
  );
}

// Reusable button component - tighter padding to match mockup
function LearnMoreButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const baseClasses = "rounded-full px-7 py-2 text-[17px] font-normal tracking-[-0.3px] transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variantClasses = variant === "light"
    ? "border-2 border-white text-white hover:bg-white hover:text-black hover:shadow-lg focus-visible:ring-white focus-visible:ring-offset-black/50"
    : "border-2 border-gray-muted text-gray-muted hover:bg-gray-muted hover:text-white hover:shadow-md focus-visible:ring-gray-muted";

  return (
    <button type="button" className={`${baseClasses} ${variantClasses}`}>
      learn more
    </button>
  );
}

// Event card button - smaller variant for cards
function EventButton() {
  return (
    <button
      type="button"
      className="mt-4 self-start rounded-full px-5 py-2 text-[13px] font-normal border border-gray-300 text-gray-600 bg-white hover:border-gray-600 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-600 focus-visible:ring-offset-2"
    >
      learn more
    </button>
  );
}

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-white overflow-x-hidden">
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="w-full px-4 md:px-8 lg:px-16 xl:px-24 py-4 md:py-5">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between">
            <Link href="/" className="text-[32px] font-black tracking-[-1px]">
              BAPTIZE
            </Link>
            <MobileNav />
          </div>

          {/* Desktop Header */}
          <nav className="hidden md:grid grid-cols-3 items-center">
            {/* Left nav */}
            <div className="flex items-center gap-8 lg:gap-14">
              <Link href="/get-baptized" className="text-[17px] lg:text-[19px] tracking-[-0.5px] hover:opacity-70 transition-opacity whitespace-nowrap">
                GET BAPTIZED
              </Link>
              <Link href="/host" className="text-[17px] lg:text-[19px] tracking-[-0.5px] hover:opacity-70 transition-opacity whitespace-nowrap">
                HOST AT YOUR CHURCH
              </Link>
            </div>

            {/* Center logo */}
            <Link href="/" className="text-[42px] lg:text-[52px] font-black tracking-[-1px] justify-self-center">
              BAPTIZE
            </Link>

            {/* Right nav */}
            <div className="flex items-center justify-end gap-10 lg:gap-16">
              <Link href="/shop" className="text-[17px] lg:text-[19px] tracking-[-0.5px] hover:opacity-70 transition-opacity">
                SHOP
              </Link>
              <Link href="/give" className="text-[17px] lg:text-[19px] tracking-[-0.5px] hover:opacity-70 transition-opacity">
                GIVE
              </Link>
              <Link href="/more" className="text-[17px] lg:text-[19px] tracking-[-0.5px] hover:opacity-70 transition-opacity">
                MORE
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative h-[55vh] mt-[85px]">
        {/* Hero background image */}
        <div className="absolute inset-0">
          <Image
            src="/images/hero-baptism.jpg"
            alt="People being baptized in water"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <PlayButton />
        </div>
      </section>

      {/* ========== HERO HEADLINE ========== */}
      <section className="bg-white py-8 px-6 lg:px-16">
        <ScrollReveal className="max-w-[1400px] mx-auto">
          <h1 className="text-[42px] sm:text-[56px] md:text-[80px] lg:text-[100px] xl:text-[116px] font-extrabold leading-[0.9] tracking-[-2px]">
            UNITING<br />
            THE CHURCH TO<br />
            <span className="sm:whitespace-nowrap">BAPTIZE ALL NATIONS</span>
          </h1>
        </ScrollReveal>
      </section>

      {/* ========== CTA CARDS SECTION ========== */}
      <section className="max-w-[1400px] mx-auto grid md:grid-cols-2">
        {/* Sign Up Card */}
        <div className="relative min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center py-12 px-8">
          <Image
            src="/images/cta-signup-bg.jpg"
            alt="Serene ocean setting representing spiritual renewal through baptism"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Gradient overlay for depth and text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <ScrollReveal className="relative z-10 text-center flex flex-col items-center">
            <h2 className="text-[48px] md:text-[56px] lg:text-[61px] font-semibold text-white leading-[1.05] tracking-[-1px] mb-10 drop-shadow-lg">
              SIGN UP TO<br />BE BAPTIZED
            </h2>
            <LearnMoreButton variant="light" />
          </ScrollReveal>
        </div>

        {/* Host Church Card */}
        <div className="relative min-h-[400px] md:min-h-[500px] flex flex-col items-center justify-center py-12 px-8">
          <Image
            src="/images/cta-host-bg.jpg"
            alt="Church community gathering for baptism celebration"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Gradient overlay for depth and text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <ScrollReveal className="relative z-10 text-center flex flex-col items-center" delay={100}>
            <h2 className="text-[48px] md:text-[56px] lg:text-[61px] font-semibold text-white leading-[1.05] tracking-[-1px] mb-10 drop-shadow-lg">
              HOST AT<br />YOUR CHURCH
            </h2>
            <LearnMoreButton variant="light" />
          </ScrollReveal>
        </div>
      </section>

      {/* ========== WHITE DIVIDER SECTION ========== */}
      <section className="bg-white py-16 md:py-20" />

      {/* ========== PENTECOST SUNDAY SECTION ========== */}
      <section className="relative min-h-[600px] flex flex-col">
        {/* Background image - ocean/cliff scene */}
        <Image
          src="/images/pentecost-ocean.jpg"
          alt="Coastal landscape for Pentecost Sunday baptism celebration"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Content overlay */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-20">
          <ScrollReveal>
            <h2 className="text-[100px] md:text-[140px] lg:text-[160px] font-black text-white leading-[0.95] text-center tracking-[-3px]">
              PENTECOST<br />SUNDAY
            </h2>
          </ScrollReveal>
        </div>

      </section>

      {/* ========== PENTECOST DESCRIPTION (White divider) ========== */}
      <section className="bg-white py-10 px-6">
        <ScrollReveal className="max-w-4xl mx-auto">
          <p className="text-[20px] md:text-[24px] text-black leading-relaxed text-center">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Quis ipsum suspendisse ultrices
            gravida. Risus commodo viverra maecenas accumsan lacus vel facilisis.
          </p>
        </ScrollReveal>
      </section>

      {/* ========== MAKING DISCIPLES SECTION ========== */}
      <section className="flex flex-col">
        {/* Blue-gray strip with heading */}
        <div className="bg-gray-muted py-10 px-6">
          <ScrollReveal>
            <h2 className="text-[48px] md:text-[64px] lg:text-[72px] font-black text-white leading-[1.1] tracking-[-2px] text-center">
              MAKING DISCIPLES<br />
              OF <em className="font-serif italic font-normal">ALL</em> NATIONS
            </h2>
          </ScrollReveal>
        </div>

        {/* Quote section on white background */}
        <div className="bg-white py-10 px-6">
          <ScrollReveal className="max-w-4xl mx-auto text-center">
            <blockquote className="text-[22px] md:text-[28px] text-black leading-[1.6] mb-3">
              &ldquo;Go therefore and make disciples of all the nations, baptizing them
              in the name of the Father and of the Son and of the Holy Spirit&rdquo;
            </blockquote>
            <cite className="text-[22px] md:text-[28px] text-black font-normal not-italic">
              Matthew 28:19
            </cite>
          </ScrollReveal>
        </div>
      </section>

      {/* ========== THE MOVEMENT + TIMELINE + GLOBE ========== */}
      <MovementSection />

      {/* ========== MORE EVENTS SECTION ========== */}
      <section className="bg-white py-10 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <h2 className="text-[48px] md:text-[55px] font-medium text-center tracking-[-2.75px] mb-10">
              MORE EVENTS
            </h2>
          </ScrollReveal>

          {/* Events cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Event Card 1 - Baptize Gala */}
            <div className="flex flex-col">
              {/* Image card */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/images/BaptizeGalaEvent.png"
                  alt="Baptize Gala 2026 fundraising event"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Button OUTSIDE the card */}
              <EventButton />
            </div>

            {/* Event Card 2 - Baptize California */}
            <div className="flex flex-col">
              {/* Image card */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/images/BAPTIZEEVENT.png"
                  alt="Baptize California regional baptism event"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Button OUTSIDE the card */}
              <EventButton />
            </div>

            {/* Event Card 3 - Baptize America */}
            <div className="flex flex-col">
              {/* Image card */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-md hover:shadow-2xl transition-shadow duration-300">
                <Image
                  src="/images/BAPTIZEAMericaEVENT.png"
                  alt="Baptize America national event in Washington, DC"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
              {/* Button OUTSIDE the card */}
              <EventButton />
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-white pt-8 pb-6 px-6 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Tagline */}
          <p className="text-[17px] text-black text-center leading-relaxed mb-12">
            Baptize is a movement by Cover the Earth Ministries. Together we&apos;ve seen over 50,000 baptisms across 1,600+ churches.
          </p>

          {/* Footer navigation */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[14px] text-gray-600 mb-6">
              <Link href="/privacy" className="hover:text-black transition-colors">PRIVACY POLICY</Link>
              <Link href="/terms" className="hover:text-black transition-colors">TERMS OF SERVICE</Link>
              <Link href="/shipping" className="hover:text-black transition-colors">SHIPPING POLICY</Link>
              <Link href="/cookie" className="hover:text-black transition-colors">COOKIE POLICY</Link>
              <Link href="/accessibility" className="hover:text-black transition-colors">ACCESSIBILITY STATEMENT</Link>
            </div>

            {/* Copyright and social */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[14px] text-gray-500">
              <p>© {new Date().getFullYear()} Cover the Earth Ministries. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Instagram
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  Facebook
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
