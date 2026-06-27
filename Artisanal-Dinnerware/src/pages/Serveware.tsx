import CategoryPage from "./CategoryPage";
import { useCategoryProducts } from "@/hooks/useCatalog";
import { servewareProducts } from "@/data/products";

const FALLBACK = {
  title: "Serveware",
  subtitle: "Lane of Ceramic",
  h2: "Elegant Ceramic Serving Bowls & Platters for Every Occasion",
  heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1400&auto=format&fit=crop&q=80",
};

export default function Serveware() {
  const { data, isLoading } = useCategoryProducts("serveware");
  
  return (
    <CategoryPage
      title={data?.category.name ?? FALLBACK.title}
      subtitle={data?.category.subtitle ?? FALLBACK.subtitle}
      h2={data?.category.heroTitle ?? FALLBACK.h2}
      products={data?.products ?? []}
      heroImage={data?.category.heroImage ?? FALLBACK.heroImage}
      isLoading={isLoading}
    />
  );
}
