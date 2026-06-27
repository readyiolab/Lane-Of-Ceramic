import { Link } from "wouter";
import { useCategories } from "@/hooks/useCatalog";

const CATEGORIES = [
  {
    title: "Drinkware",
    subtitle: "Coffee mugs, tea cups & more",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
    path: "/drinkware",
  },
  {
    title: "Tableware",
    subtitle: "Dinner sets, plates & bowls",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&auto=format&fit=crop&q=80",
    path: "/tableware",
  },
  {
    title: "Serveware",
    subtitle: "Platters, bowls & serving pieces",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    path: "/serveware",
  },
  {
    title: "Kitchenware",
    subtitle: "Jars, canisters & kitchen tools",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80",
    path: "/kitchenware",
  },
];

export default function CategoryGrid() {
  const { data: apiCategories, isLoading } = useCategories();

  const displayCategories = apiCategories && apiCategories.length > 0 
    ? apiCategories.map(c => ({
        title: c.name,
        subtitle: c.subtitle || "",
        image: c.image || "",
        path: `/${c.slug}`
      }))
    : CATEGORIES;

  return (
    <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto" data-testid="section-categories">
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest uppercase text-[#6B6A2A] font-medium mb-2">Browse by Category</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Shop Your Favourites
        </h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-2 lg:col-span-4 py-12 text-center text-[#6E6E6E]">
            Loading categories...
          </div>
        ) : (
          displayCategories.map((cat) => (
            <Link
              key={cat.path}
              href={cat.path}
            className="group relative overflow-hidden aspect-[3/4] block"
            data-testid={`link-category-${cat.title.toLowerCase()}`}
          >
            <img
              src={cat.image}
              alt={cat.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h3 className="text-lg font-semibold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                {cat.title}
              </h3>
              <p className="text-xs text-white/70 mt-1">{cat.subtitle}</p>
              <span className="inline-block mt-3 text-xs font-medium text-[#D6CBB7] border-b border-[#D6CBB7]/60 pb-0.5 group-hover:border-[#D6CBB7] transition-colors">
                Shop Now
              </span>
            </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
