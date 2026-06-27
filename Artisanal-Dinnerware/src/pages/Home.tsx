import HeroBanner from "@/components/home/HeroBanner";
import CategoryGrid from "@/components/home/CategoryGrid";
import BundleSection from "@/components/home/BundleSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import StoryBanner from "@/components/home/StoryBanner";
import Testimonials from "@/components/home/Testimonials";
import MarqueeStrip from "@/components/home/MarqueeStrip";

export default function Home() {
  return (
    <main data-testid="page-home">
      <HeroBanner />
      <MarqueeStrip variant="light" speed="normal" />
      <CategoryGrid />
      <BundleSection />
      <MarqueeStrip variant="dark" speed="slow" reverse />
      <FeaturedSection />
      <WhyChooseUs />
      <StoryBanner />
      <MarqueeStrip variant="light" speed="fast" />
      <Testimonials />
    </main>
  );
}
