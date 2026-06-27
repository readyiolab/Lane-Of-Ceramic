import CategoryPage from "./CategoryPage";
import { useCategoryProducts } from "@/hooks/useCatalog";
import { drinkwareProducts } from "@/data/products";

const FALLBACK = {
  title: "Drinkware",
  subtitle: "Lane of Ceramic",
  h2: "Ergonomic and Stylish Ceramic Coffee Cups for the Perfect Brew",
  heroImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1400&auto=format&fit=crop&q=80",
};

export default function Drinkware() {
  const { data, isLoading } = useCategoryProducts("drinkware");
  
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
