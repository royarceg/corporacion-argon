import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import CollectionBanners from "@/components/home/CollectionBanners";
import ProductRow from "@/components/home/ProductRow";
import TwoColumnBanners from "@/components/home/TwoColumnBanners";
import QuoteSection from "@/components/home/QuoteSection";
import ImageGallery from "@/components/home/ImageGallery";
import Footer from "@/components/layout/Footer";
import Reveal from "@/components/ui/Reveal";

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <AnnouncementBar />
      <Header />
      <Reveal variant="fadeIn" duration={900}>
        <Hero />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="fadeUp" duration={700}>
        <CollectionBanners />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="fadeUp" duration={700} delay={100}>
        <ProductRow />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="fadeUp" duration={700}>
        <TwoColumnBanners />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="scaleIn" duration={800}>
        <QuoteSection />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="fadeUp" duration={700}>
        <ImageGallery />
      </Reveal>
      <div style={{ height: "48px" }} />
      <Reveal variant="fadeIn" duration={600}>
        <Footer />
      </Reveal>
    </div>
  );
}
