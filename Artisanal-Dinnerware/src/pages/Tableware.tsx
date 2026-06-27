import CategoryPage from "./CategoryPage";
import { useCategoryProducts } from "@/hooks/useCatalog";
import { tablewareProducts } from "@/data/products";

const FALLBACK = {
  title: "Tableware",
  subtitle: "Lane of Ceramic",
  h2: "How to Choose the Best Ceramic Dinnerware Sets for Modern Dining",
  heroImage: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1400&auto=format&fit=crop&q=80",
};

export default function Tableware() {
  const { data, isLoading } = useCategoryProducts("tableware");
  
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
