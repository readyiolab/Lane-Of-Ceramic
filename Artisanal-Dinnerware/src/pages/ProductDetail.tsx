import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ChevronLeft, ShoppingCart, Check, Star, StarHalf, Shield, Truck, RotateCcw, Package, Minus, Plus } from "lucide-react";
import { useProduct } from "@/hooks/useCatalog";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/product/ProductCard";
import { optimizeImage } from "@/lib/utils";

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>
          {i < full ? (
            <Star size={16} className="fill-[#6B6A2A] text-[#6B6A2A]" />
          ) : i === full && half ? (
            <StarHalf size={16} className="fill-[#6B6A2A] text-[#6B6A2A]" />
          ) : (
            <Star size={16} className="text-[#6B6A2A]/25" />
          )}
        </span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { data, isLoading } = useProduct(id ?? "");
  const product = data?.product;
  const related = data?.related ?? [];
  const { addItem } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (isLoading && !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#D6CBB7]">
        <p className="text-[#3E3A06]">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[#D6CBB7]">
        <p className="text-[#6E6E6E] text-lg">Product not found.</p>
        <button
          onClick={() => setLocation("/")}
          className="px-6 py-2.5 bg-[#3E3A06] text-[#D6CBB7] text-sm font-medium hover:bg-[#6B6A2A] transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const images = product.images ?? [product.image];
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  function handleAddToCart() {
    for (let i = 0; i < quantity; i++) {
      addItem(product!);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const categoryPath = `/${product.category}`;
  const categoryLabel =
    product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <main className="bg-[#D6CBB7] min-h-screen" data-testid="page-product-detail">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <nav className="flex items-center gap-2 text-xs text-[#6E6E6E] mb-8" data-testid="breadcrumb">
          <button onClick={() => setLocation("/")} className="hover:text-[#3E3A06] transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => setLocation(categoryPath)} className="hover:text-[#3E3A06] transition-colors">{categoryLabel}</button>
          <span>/</span>
          <span className="text-[#3E3A06] font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
          <div className="flex flex-col gap-4">
            <div className="aspect-square overflow-hidden bg-[#E8E0D0]">
              <img
                src={optimizeImage(images[selectedImage], 800)}
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="img-product-main"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 flex-shrink-0 overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? "border-[#3E3A06]" : "border-transparent hover:border-[#6B6A2A]/50"
                    }`}
                    data-testid={`button-thumbnail-${i}`}
                  >
                    <img src={optimizeImage(img, 150)} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            {product.tag && (
              <span className="inline-block w-fit px-3 py-1 bg-[#3E3A06] text-[#D6CBB7] text-xs font-medium tracking-wide">
                {product.tag}
              </span>
            )}

            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
                data-testid="text-product-name"
              >
                {product.name}
              </h1>
              <p className="text-sm text-[#6E6E6E] mt-1 capitalize">{product.category}</p>
            </div>

            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm font-medium text-[#3E3A06]">{product.rating}</span>
              <span className="text-sm text-[#6E6E6E]">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl font-bold text-[#3E3A06]"
                data-testid="text-product-price"
              >
                &#8377;{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-[#6E6E6E] line-through">
                    &#8377;{product.originalPrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <p className="text-sm text-[#6E6E6E] leading-relaxed" data-testid="text-product-description">
              {product.longDescription || product.description}
            </p>

            {product.material && (
              <div className="border-t border-[#6B6A2A]/20 pt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-[#6E6E6E] uppercase tracking-wide mb-1">Material</p>
                  <p className="text-[#1A1A1A] font-medium">{product.material}</p>
                </div>
                {product.dimensions && (
                  <div>
                    <p className="text-xs text-[#6E6E6E] uppercase tracking-wide mb-1">Dimensions</p>
                    <p className="text-[#1A1A1A] font-medium">{product.dimensions}</p>
                  </div>
                )}
                {product.weight && (
                  <div>
                    <p className="text-xs text-[#6E6E6E] uppercase tracking-wide mb-1">Weight</p>
                    <p className="text-[#1A1A1A] font-medium">{product.weight}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-[#6E6E6E] uppercase tracking-wide mb-1">Availability</p>
                  <p className={`font-medium ${product.inStock ? "text-green-700" : "text-red-600"}`}>
                    {product.inStock ? `In Stock (${product.stockCount} left)` : "Out of Stock"}
                  </p>
                </div>
              </div>
            )}

            {product.inStock && (
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center border border-[#6B6A2A]/40">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#3E3A06] hover:bg-[#3E3A06]/5 transition-colors"
                    data-testid="button-quantity-decrease"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-[#1A1A1A]" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount ?? 10, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#3E3A06] hover:bg-[#3E3A06]/5 transition-colors"
                    data-testid="button-quantity-increase"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-xs text-[#6E6E6E]">Only {product.stockCount} left</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`flex-1 py-3.5 font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 ${
                  added
                    ? "bg-[#6B6A2A] text-[#D6CBB7]"
                    : product.inStock
                    ? "bg-[#3E3A06] text-[#D6CBB7] hover:bg-[#6B6A2A]"
                    : "bg-[#6E6E6E]/30 text-[#6E6E6E] cursor-not-allowed"
                }`}
                data-testid="button-add-to-cart"
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? "Added to Cart" : product.inStock ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { icon: Truck, text: "Free Shipping on ₹999+" },
                { icon: Shield, text: "Quality Guaranteed" },
                { icon: RotateCcw, text: "Easy Returns" },
                { icon: Package, text: "Secure Packaging" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 text-center p-3 bg-[#E8E0D0]" data-testid={`trust-badge-${i}`}>
                  <Icon size={18} className="text-[#3E3A06]" />
                  <span className="text-xs text-[#6E6E6E] leading-tight">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-2 gap-8">
          {product.features && product.features.length > 0 && (
            <div className="bg-[#E8E0D0] p-6" data-testid="section-features">
              <h2 className="text-base font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Product Features
              </h2>
              <ul className="space-y-2.5">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6E6E6E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3E3A06] mt-1.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.careInstructions && product.careInstructions.length > 0 && (
            <div className="bg-[#E8E0D0] p-6" data-testid="section-care">
              <h2 className="text-base font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Care Instructions
              </h2>
              <ul className="space-y-2.5">
                {product.careInstructions.map((c, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#6E6E6E]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B6A2A] mt-1.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mt-16" data-testid="section-related">
            <h2
              className="text-2xl font-bold text-[#1A1A1A] mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
