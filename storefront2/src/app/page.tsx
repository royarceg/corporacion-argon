import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import CollectionBanners from "@/components/home/CollectionBanners";
import ProductRow from "@/components/home/ProductRow";
import TwoColumnBanners from "@/components/home/TwoColumnBanners";
import QuoteSection from "@/components/home/QuoteSection";
import ImageGallery from "@/components/home/ImageGallery";
import Footer from "@/components/layout/Footer";

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
      <Hero />
      <div style={{ height: "48px" }} />
      <CollectionBanners />
      <div style={{ height: "48px" }} />
      <ProductRow />
      <div style={{ height: "48px" }} />
      <TwoColumnBanners />
      <div style={{ height: "48px" }} />
      <QuoteSection />
      <div style={{ height: "48px" }} />
      <ImageGallery />
      <div style={{ height: "48px" }} />
      <Footer />
    </div>
  );
}
