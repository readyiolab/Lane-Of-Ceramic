import CategoryPage from "./CategoryPage";
import { useCategoryProducts } from "@/hooks/useCatalog";
import { kitchenwareProducts } from "@/data/products";

const FALLBACK = {
  title: "Kitchenware",
  subtitle: "Lane of Ceramic",
  h2: "Functional Ceramic Kitchen Essentials for the Modern Home",
  heroImage: "https://images.unsplash.com/photo-1493894473891-0f6e7b36b73e?w=1400&auto=format&fit=crop&q=80",
};

export default function Kitchenware() {
  const { data, isLoading } = useCategoryProducts("kitchenware");
  
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
