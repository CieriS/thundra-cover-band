import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { BookingForm } from "@/components/sections/BookingForm";
import { Hero } from "@/components/sections/Hero";
import { Setlist } from "@/components/sections/Setlist";
import { TechRider } from "@/components/sections/TechRider";
import { TourDates } from "@/components/sections/TourDates";

export function App() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:text-accent-foreground"
      >
        Salta al contenuto
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <TourDates />
        <Setlist />
        <TechRider />
        <BookingForm />
      </main>
      <Footer />
    </>
  );
}
