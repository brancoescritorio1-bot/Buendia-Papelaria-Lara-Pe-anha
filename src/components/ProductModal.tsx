/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingBag, X, Plus, Minus, Info, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string, observation?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}: ProductModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAroma, setSelectedAroma] = useState('');
  const [observation, setObservation] = useState('');
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Initialize selected variations when product shifts
  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setQuantity(1);
      setObservation('');
      setAddedAnimation(false);

      // Extract colors vs sizes
      const colorVar = product.variations.find(v => v.name.toLowerCase() === 'cor' || v.name.toLowerCase().includes('cor'));
      if (colorVar && colorVar.options.length > 0) {
        setSelectedColor(colorVar.options[0]);
      } else {
        setSelectedColor('');
      }

      const sizeVar = product.variations.find(v => v.name.toLowerCase() === 'tamanho' || v.name.toLowerCase().includes('tam'));
      if (sizeVar && sizeVar.options.length > 0) {
        setSelectedSize(sizeVar.options[0]);
      } else {
        setSelectedSize('');
      }

      const aromaVar = product.variations.find(v => v.name.toLowerCase() === 'aroma' || v.name.toLowerCase().includes('arom'));
      if (aromaVar && aromaVar.options.length > 0) {
        setSelectedAroma(aromaVar.options[0]);
      } else {
        setSelectedAroma('');
      }
    }
  }, [product]);

  if (!product || !isOpen) return null;

  const handleAddToCartClick = () => {
    if (product.isOutOfStock) return;
    
    // Choose selected option based on what variations actually exist
    onAddToCart(
      product,
      quantity,
      selectedColor || selectedAroma || undefined,
      selectedSize || undefined,
      observation
    );

    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
      onClose(); // Auto close on premium success add
    }, 1200);
  };

  const hasPromo = product.promotionalPrice && product.promotionalPrice < product.price;
  const currentPrice = hasPromo ? product.promotionalPrice! : product.price;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border border-buendia-navy/5 flex flex-col md:flex-row relative max-h-[90vh] md:max-h-none"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-xs border border-buendia-navy/5 text-buendia-navy hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Left partition: Product Pictures slider column */}
          <div className="w-full md:w-1/2 bg-[#FCFBF7] p-6 flex flex-col justify-center border-r border-[#7E8B99]/10">
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-3xs bg-white flex items-center justify-center">
              <img
                src={product.images[activeImageIdx] || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              
              {/* Floating Esgotado layer */}
              {product.isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-buendia-navy text-white text-[11px] uppercase tracking-widest font-bold px-5 py-2.5 rounded-full shadow-md">
                    Indisponível no Momento
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 justify-center">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? 'border-buendia-navy shadow-sm' : 'border-transparent hover:border-neutral-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right partition: Product Configurations & Descriptive column */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-[85vh]">
            <div className="space-y-6">
              
              {/* Heading elements */}
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] bg-[#E0F4FF] text-buendia-navy font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                    {product.sku || 'Estética Coreana'}
                  </span>
                  {product.isKit && (
                    <span className="text-[10px] bg-[#FFDEFA] text-buendia-navy font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                      Kit Artesanal 💝
                    </span>
                  )}
                  {product.stock > 0 && product.stock <= 5 && (
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-sm uppercase tracking-wide">
                      Últimas unidades!
                    </span>
                  )}
                </div>

                <h2 className="font-display font-semibold text-xl sm:text-2xl text-buendia-navy leading-snug">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-2">
                  {hasPromo ? (
                    <>
                      <span className="text-lg font-bold text-buendia-navy">
                        R$ {product.promotionalPrice!.toFixed(2)}
                      </span>
                      <span className="text-xs text-buendia-gray line-through">
                        R$ {product.price.toFixed(2)}
                      </span>
                      <span className="bg-[#FFF89A] text-buendia-navy text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                        Selo OFF
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-buendia-navy">
                      R$ {product.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-neutral text-xs text-[#7E8B99] leading-relaxed max-w-none border-t border-neutral-100 pt-4">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>

              {/* Dynamic Variation selections if items are registered */}
              {product.variations.map((variable) => {
                const isColor = variable.name.toLowerCase() === 'cor' || variable.name.toLowerCase().includes('cor');
                const isSize = variable.name.toLowerCase() === 'tamanho' || variable.name.toLowerCase().includes('tam');
                const isAroma = variable.name.toLowerCase() === 'aroma' || variable.name.toLowerCase().includes('arom');

                return (
                  <div key={variable.name} className="space-y-2 pt-3 border-t border-neutral-50">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy flex items-center justify-between">
                      <span>Escolha {variable.name}:</span>
                      <span className="text-amber-700 text-[9px] lowercase font-normal italic">obrigatório</span>
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {variable.options.map((option) => {
                        let isSelected = false;
                        if (isColor) isSelected = selectedColor === option;
                        else if (isSize) isSelected = selectedSize === option;
                        else if (isAroma) isSelected = selectedAroma === option;
                        else isSelected = selectedColor === option; // fallback

                        return (
                          <button
                            key={option}
                            onClick={() => {
                              if (isColor) setSelectedColor(option);
                              else if (isSize) setSelectedSize(option);
                              else if (isAroma) setSelectedAroma(option);
                            }}
                            className={`px-3 py-2 rounded-2xl text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-buendia-navy text-white border-buendia-navy shadow-xs'
                                : 'bg-[#FCFBF7] text-buendia-navy border-buendia-navy/10 hover:border-buendia-navy/30'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Special Personalization notes Box (Fita cores, Letter message) */}
              <div className="space-y-2 pt-3 border-t border-neutral-50">
                <label className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy flex items-center justify-between">
                  <span>Nota de Personalização ou Pedido Especial 🌻</span>
                  <span className="text-buendia-gray text-[9px] capitalize font-medium italic">Opcional</span>
                </label>
                <textarea
                  placeholder="Escreva caso queira um cartão de feliz aniversário, fita combinada de outra cor, ou orientações especiais..."
                  rows={2}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:ring-2 focus:ring-buendia-blue/40 focus:outline-hidden resize-none placeholder-[#7E8B99]/60 leading-relaxed"
                />
              </div>

            </div>

            {/* Bottom Panel: Quantity and primary Adding core controls */}
            <div className="mt-8 pt-6 border-t border-neutral-100 space-y-4">
              
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-semibold text-buendia-navy">Quantidade:</span>
                
                {/* Selector */}
                <div className="flex items-center border border-buendia-navy/10 rounded-full p-1 bg-[#FCFBF7]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.isOutOfStock}
                    className="p-1 px-2.5 hover:text-amber-700 disabled:opacity-30 text-buendia-navy"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold text-buendia-navy w-6 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    disabled={product.isOutOfStock}
                    className="p-1 px-2.5 hover:text-amber-700 disabled:opacity-30 text-buendia-navy"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Main adds triggers */}
              <div className="flex gap-3">
                <button
                  onClick={() => onToggleFavorite(product.id)}
                  className={`p-3 border rounded-2xl transition-colors cursor-pointer flex items-center justify-center ${
                    isFavorite 
                      ? 'bg-[#FFDEFA]/40 border-[#FFDEFA] text-rose-500' 
                      : 'border-buendia-navy/10 hover:border-buendia-navy/30 text-buendia-navy bg-[#FCFBF7]'
                  }`}
                  title={isFavorite ? 'Remover dos salvos' : 'Salvar nos favoritos'}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
                </button>

                <button
                  onClick={handleAddToCartClick}
                  disabled={product.isOutOfStock || addedAnimation}
                  className={`flex-1 relative flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer ${
                    product.isOutOfStock
                      ? 'bg-neutral-100 text-[#7E8B99] cursor-not-allowed shadow-none border'
                      : addedAnimation
                      ? 'bg-amber-100 text-amber-900 shadow-none'
                      : 'bg-buendia-navy text-white hover:bg-opacity-95'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      <span>Adicionado ao carrinho!</span>
                    </>
                  ) : product.isOutOfStock ? (
                    <span>Esgotado</span>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Adicionar ao carrinho · R$ {(currentPrice * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Informative delicate shipping tip */}
              <div className="flex items-center gap-1.5 text-[10px] text-buendia-gray/90 justify-center">
                <Info className="h-3 w-3 text-[#7E8B99]" />
                <span>Pedido finalizado pelo WhatsApp com atendimento de Lara Peçanha</span>
              </div>

            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
