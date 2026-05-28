/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, ShoppingBag, Heart, User, Sparkles, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { Product, StoreSettings } from '../types';

interface HeaderProps {
  onOpenCart: () => void;
  cartCount: number;
  onSearch: (term: string) => void;
  searchTerm: string;
  onOpenAdmin: () => void;
  isAdminView: boolean;
  onOpenFavorites: () => void;
  favoritesCount: number;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  settings?: StoreSettings;
}

export default function Header({
  onOpenCart,
  cartCount,
  onSearch,
  searchTerm,
  onOpenAdmin,
  isAdminView,
  onOpenFavorites,
  favoritesCount,
  products,
  onSelectProduct,
  settings,
}: HeaderProps) {
  const { user, loginGoogle, logout, signUpWithPhone } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // States for simplified manual registration in Clerk Simulation
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  // Search autocomplete list based on product names/subcategories
  const searchSuggestions = searchTerm.trim()
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerName || !registerPhone) return;
    await signUpWithPhone(registerName, registerPhone);
    setShowAuthModal(false);
    setRegisterName('');
    setRegisterPhone('');
  };

  const selectSpecialAdmin = async () => {
    await signUpWithPhone('Lara Peçanha (Admin)', '(38) 99999-0449');
    setShowAuthModal(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-100 px-4 sm:px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand typography with custom elegant look */}
        <div 
          onClick={() => {
            onSearch('');
            if (isAdminView) onOpenAdmin(); // return to shop
          }}
          className="cursor-pointer group flex items-center space-x-3 select-none"
        >
          {settings?.logoImageUrl ? (
            <img 
              src={settings.logoImageUrl} 
              alt="Logo" 
              className="h-20 sm:h-28 w-auto max-w-[260px] sm:max-w-[340px] object-contain" 
            />
          ) : (
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-buendia-navy font-display transition-colors group-hover:text-[#7E8B99] flex items-center gap-2">
              BUENDÍA 
              <span className="font-light text-neutral-300">|</span> 
              <span className="text-xs font-normal text-[#7E8B99] tracking-widest uppercase font-sans">Lara Peçanha</span>
            </span>
          )}
        </div>

        {/* Center: Search intelligently styled inspired by Pinterest & Apple */}
        <div className="hidden md:block flex-1 max-w-md relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar produtos, planners, fitas..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 250)}
              className="w-full bg-[#F9F9F9] text-buendia-navy placeholder-[#7E8B99] border border-gray-100 rounded-full py-2.5 pl-11 pr-4 text-xs focus:outline-hidden focus:border-buendia-navy/20 focus:bg-white focus:ring-1 focus:ring-buendia-navy/10 transition-all"
            />
            <Search className="absolute left-4 top-3 h-4 w-4 text-[#7E8B99]" />
          </div>

          {/* Real-time search predictions drop container */}
          {searchFocused && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-buendia-navy/5 shadow-xl p-2 z-50 animate-fade-in">
              <div className="text-[10px] uppercase tracking-wider text-[#7E8B99] p-2 font-semibold">Sugestões de papelaria</div>
              {searchSuggestions.map(product => (
                <div
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="flex items-center gap-3 p-2 hover:bg-[#FCFBF7] rounded-xl cursor-pointer transition-colors"
                >
                  <img src={product.images[0]} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-buendia-navy line-clamp-1">{product.name}</div>
                    <div className="text-[10px] text-amber-700 font-bold">R$ {product.price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Action panel */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Quick Access search trigger (Mobile-only) */}
          <div className="md:hidden relative max-w-[150px] sm:max-w-[200px]">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-[#F9F9F9] text-buendia-navy border border-gray-100 rounded-full py-1.5 pl-8 pr-3 text-xs focus:ring-1 focus:ring-buendia-navy/10 focus:outline-hidden"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7E8B99]" />
          </div>

          {/* Quick toggle: Admin Panel (only visible when already in AdminView route to permit return) */}
          {isAdminView && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all bg-[#F9F9F9] text-[#7E8B99] border border-gray-100"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Ver Loja 🛍️</span>
            </button>
          )}

          {/* Favorites List icon icon */}
          <button
            onClick={onOpenFavorites}
            className="relative p-2.5 text-buendia-navy hover:text-[#7E8B99] transition-colors rounded-full hover:bg-neutral-100"
            title="Meus Favoritos"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#FFDEFA] border border-white text-buendia-navy text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-2xs">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart Icon Widget with bounce */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 bg-[#E0F4FF] hover:bg-opacity-90 text-buendia-navy transition-all rounded-full border border-buendia-blue/20"
            title="Carrinho de Compras"
          >
            <ShoppingBag className="h-5 w-5 text-buendia-navy" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-buendia-navy text-[10px] font-extrabold h-5 w-5 rounded-full flex items-center justify-center animate-bounce border-2 border-white shadow-2xs">
                {cartCount}
              </span>
            )}
          </button>

          {/* Clerk Auth Profile Status */}
          <div className="relative">
            {user ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1 p-1 hover:bg-[#FCFBF7] rounded-full transition-colors border border-buendia-navy/5"
                  title="Minha Conta (Clerk)"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-200 to-amber-200 flex items-center justify-center text-xs font-bold text-buendia-navy border-2 border-[#FFDEFA] shadow-sm">
                    {user.fullName.substring(0, 2).toUpperCase()}
                  </div>
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-buendia-navy/5 shadow-xl p-2 z-50 animate-fade-in text-left">
                    <div className="p-3 border-b border-gray-100">
                      <div className="text-xs font-bold text-buendia-navy truncate">{user.fullName}</div>
                      <div className="text-[10px] text-[#7E8B99] mt-0.5">{user.phone}</div>
                      <div className="inline-flex mt-1.5 items-center gap-1 bg-[#E0F4FF] text-buendia-navy text-[9px] font-semibold px-2 py-0.5 rounded-md">
                        {user.role === 'admin' ? '🛡️ Proprietária' : '💛 Cliente Estrela'}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 p-2 hover:bg-neutral-50 text-xs text-rose-500 rounded-lg mt-1 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair da Conta
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-[#FCFBF7] hover:bg-[#FFDEFA]/40 text-buendia-navy text-xs font-semibold rounded-full border border-buendia-navy/5 transition-colors cursor-pointer"
              >
                <User className="h-3.5 w-3.5" />
                <span>Entrar</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* CLERK SIMULATION AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-slide-up border border-buendia-navy/10">
            {/* Header branding */}
            <div className="bg-[#FCFBF7] px-6 py-8 text-center relative border-b border-neutral-100">
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-[#7E8B99] hover:text-buendia-navy text-sm font-semibold p-1.5 hover:bg-neutral-100 rounded-full h-8 w-8 flex items-center justify-center"
              >
                ✕
              </button>
              <h3 className="font-display font-bold text-lg text-buendia-navy">Buendía - Lara Peçanha</h3>
              <p className="text-xs text-[#7E8B99] mt-1">Conecte-se com segurança via Clerk Auth</p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Google Social flow emulation */}
              <button
                onClick={() => {
                  loginGoogle();
                  setShowAuthModal(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-buendia-navy/10 rounded-full hover:bg-neutral-50 transition-colors text-xs font-bold text-buendia-navy focus:outline-hidden mb-6 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.74 0 3.3.6 4.53 1.77l3.39-3.39C17.85 1.54 15.11 1 12 1 7.35 1 3.4 3.65 1.54 7.5l3.86 3C6.31 7.37 8.94 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.12 2.73-2.38 3.58l3.71 2.88c2.16-1.99 3.42-4.93 3.42-8.61z" />
                  <path fill="#FBBC05" d="M5.4 14.5c-.25-.75-.4-1.55-.4-2.38s.15-1.63.4-2.38L1.54 6.74C.56 8.71 0 10.9 0 13.22c0 2.32.56 4.51 1.54 6.48l3.86-3.2z" />
                  <path fill="#34A853" d="M12 23c3.21 0 5.91-1.06 7.88-2.88l-3.71-2.88c-1.1.74-2.51 1.18-4.17 1.18-3.06 0-5.69-2.33-6.6-5.46l-3.86 3C3.4 19.35 7.35 23 12 23z" />
                </svg>
                Continuar com o Google
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-neutral-100"></div>
                <span className="flex-shrink mx-4 text-[10px] text-[#7E8B99] font-bold uppercase tracking-wider">Ou cadastre-se</span>
                <div className="flex-grow border-t border-neutral-100"></div>
              </div>

              {/* Form Manual Setup */}
              <form onSubmit={handleManualSignUp} className="space-y-4 mt-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Seu Nome</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Ana Souza"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:ring-2 focus:ring-buendia-blue/40 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">WhatsApp / Celular</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (38) 99999-0449"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:ring-2 focus:ring-buendia-blue/40 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-buendia-navy text-white text-xs font-bold py-3 px-4 rounded-full hover:bg-opacity-95 transition-all shadow-md cursor-pointer"
                >
                  Criar Conta
                </button>
              </form>


            </div>
          </div>
        </div>
      )}
    </header>
  );
}
