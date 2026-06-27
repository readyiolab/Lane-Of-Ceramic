import { useState } from "react";
import { ShoppingCart, Check, Star } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [, setLocation] = useLocation();
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div
      className="group bg-[#E8E0D0] overflow-hidden cursor-pointer"
      onClick={() => setLocation(`/product/${product.id}`)}
      data-testid={`card-product-${product.id}`}
    >
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.tag && (
          <span className="absolute top-3 left-3 bg-[#3E3A06] text-[#D6CBB7] text-xs px-2.5 py-1 font-medium tracking-wide z-10">
            {product.tag}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-3 right-3 bg-green-700 text-white text-xs px-2 py-1 font-medium z-10">
            -{discount}%
          </span>
        )}
        <button
          onClick={handleAddToCart}
          className={`absolute bottom-0 left-0 right-0 py-3 text-sm font-medium tracking-wide transition-all duration-300 transform translate-y-full group-hover:translate-y-0 flex items-center justify-center gap-2 z-10 ${
            added
              ? "bg-[#6B6A2A] text-[#D6CBB7]"
              : "bg-[#3E3A06] text-[#D6CBB7] hover:bg-[#6B6A2A]"
          }`}
          data-testid={`button-add-to-cart-${product.id}`}
        >
          {added ? <Check size={15} /> : <ShoppingCart size={15} />}
          {added ? "Added!" : "Add to Cart"}
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-[#1A1A1A] leading-snug group-hover:text-[#3E3A06] transition-colors">{product.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <Star size={11} className="fill-[#6B6A2A] text-[#6B6A2A]" />
          <span className="text-xs text-[#6B6A2A] font-medium">{product.rating}</span>
          <span className="text-xs text-[#6E6E6E]">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-semibold text-[#3E3A06]">
            &#8377;{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-[#6E6E6E] line-through">
              &#8377;{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {!product.inStock && (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
