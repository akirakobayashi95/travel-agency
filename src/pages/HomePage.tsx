import HeroSection from "@/components/home/HeroSection";
import TourSearch from "@/components/home/TourSearch";
import PopularDestinations from "@/components/home/PopularDestinations";
import TravelPackages from "@/components/home/TravelPackages";
import PhotoGallery from "@/components/home/PhotoGallery";
import Testimonials from "@/components/home/Testimonials";
import TravelNews from "@/components/home/TravelNews";
import FAQSection from "@/components/home/FAQSection";
import CallToAction from "@/components/home/CallToAction";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <TourSearch />
      <PopularDestinations />
      <TravelPackages />
      <PhotoGallery />
      <Testimonials />
      <TravelNews />
      <FAQSection />
      <CallToAction />
    </main>
  );
}