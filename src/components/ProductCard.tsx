/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: any;
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => any;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string, observation?: string) => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onAddToCart,
}: ProductCardProps) {
  // Safe helper to calculate automated discounts
  const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const computedDiscount = hasPromo && product.discountPercent
    ? product.discountPercent
    : hasPromo
    ? Math.round(((product.price - product.promotionalPrice!) / product.price) * 100)
    : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.isOutOfStock) return;
    
    // Pick the first option if available
    const firstColor = product.variations.find(v => v.name.toLowerCase() === 'cor' || v.name.toLowerCase().includes('cor'))?.options[0];
    const firstSize = product.variations.find(v => v.name.toLowerCase() === 'tamanho' || v.name.toLowerCase().includes('tam'))?.options[0];
    onAddToCart(product, 1, firstColor, firstSize);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="bg-white rounded-[32px] overflow-hidden border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group flex flex-col h-full relative"
    >
      {/* Favorite Heart trigger */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/85 backdrop-blur-xs shadow-sm text-buendia-navy hover:text-rose-500 transition-colors cursor-pointer"
        title={isFavorite ? 'Remover dos Favoritos' : 'Salvar nos Favoritos'}
      >
        <Heart className={`h-4.5 w-4.5 transition-transform duration-300 ${isFavorite ? 'fill-rose-500 text-rose-500 scale-110' : 'hover:scale-105'}`} />
      </button>

      {/* Elegant labels and badges (OFF, Kits, Novidades) */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-1.5 select-none">
        {hasPromo && (
          <span className="bg-[#FFF1C1] text-buendia-navy text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {computedDiscount}% OFF
          </span>
        )}
        {product.isWeeklyNew && (
          <span className="bg-[#FDE2E4] text-buendia-navy text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Novidade
          </span>
        )}
        {product.isKit && (
          <span className="bg-[#D1E9F6] text-buendia-navy text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Kit Único
          </span>
        )}
      </div>

      {/* Picture Area with subtle zoom and smooth loading overlay */}
      <div 
        onClick={() => onSelect(product)}
        className="relative bg-[#F9F9F9] rounded-[24px] overflow-hidden aspect-square flex items-center justify-center cursor-pointer"
      >
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-104"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Esgotado Layer */}
        {product.isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="bg-buendia-navy text-white text-[10px] uppercase font-bold tracking-widest px-4 py-2 rounded-full shadow-md">
              Esgotado
            </span>
          </div>
        )}

        {/* Hover quick action card overlays */}
        {!product.isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/20 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(product);
              }}
              className="p-2.5 bg-white text-buendia-navy rounded-full shadow-md translate-y-3 group-hover:translate-y-0 transition-transform cursor-pointer"
              title="Espiar detalhes"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="p-2.5 bg-buendia-navy text-white rounded-full shadow-md translate-y-3 group-hover:translate-y-0 transition-transform cursor-pointer"
              title="Adicionar direto"
            >
              <ShoppingBag className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Product Information Detail Card */}
      <div 
        onClick={() => onSelect(product)}
        className="p-4 pt-5 flex-grow flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Subtle category or SKU label */}
          <span className="text-[9px] text-[#7E8B99] uppercase tracking-widest font-bold">
            {product.sku || 'PAPELARIA DE AFETO'}
          </span>
          <h4 className="font-display font-medium text-sm text-buendia-navy mt-1 group-hover:text-[#7E8B99] transition-colors line-clamp-1">
            {product.name}
          </h4>
          <p className="text-xs text-[#7E8B99] mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Prising visualizer */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-end justify-between">
          <div className="flex flex-col">
            {hasPromo ? (
              <>
                <span className="text-[10px] text-[#7E8B99] line-through font-medium">
                  R$ {product.price.toFixed(2)}
                </span>
                <span className="text-sm font-semibold text-buendia-navy tracking-tight mt-0.5">
                  R$ {product.promotionalPrice!.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-buendia-navy tracking-tight">
                R$ {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Inline Stock indicator or Quick buy */}
          {!product.isOutOfStock ? (
            <span className="text-[9px] font-bold text-[#7E8B99] uppercase tracking-wider bg-[#F9F9F9] px-2.5 py-1 rounded-full">
              {product.stock} un.
            </span>
          ) : (
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">
              Sem estoque
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
