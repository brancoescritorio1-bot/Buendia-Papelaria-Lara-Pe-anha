/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, CircleAlert, ChevronLeft, ChevronRight, MessageSquare, 
  Instagram, Phone, MapPin, Calendar, Compass, ArrowRight, HelpCircle 
} from 'lucide-react';

import { AuthProvider, useAuth } from './lib/auth';
import { db } from './lib/db';
import { Category, Subcategory, Product, Order, Coupon, StoreSettings, CartItem } from './types';

import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import ShoppingCart from './components/ShoppingCart';
import AdminPanel from './components/AdminPanel';
import WhatsAppButton from './components/WhatsAppButton';

function MainAppContent() {
  // Global Database state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout navigation states
  const [isAdminView, setIsAdminView] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // Auth
  const { user, loading: authLoading, loginEmailPassword } = useAuth() as any;

  // Cart operations state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Automatic Carousel Slides
  const [activeSlide, setActiveSlide] = useState(0);

  // Fetch all initial data on mount
  const handleFetchAllData = async () => {
    try {
      const [cats, subs, prods, ords, coups, setts, favs] = await Promise.all([
        db.getCategories(),
        db.getSubcategories(),
        db.getProducts(),
        db.getOrders(),
        db.getCoupons(),
        db.getSettings(),
        db.getFavorites()
      ]);

      setCategories(cats);
      setSubcategories(subs);
      setProducts(prods);
      setOrders(ords);
      setCoupons(coups);
      setSettings(setts);
      setFavorites(favs);
    } catch (err) {
      console.error('Falha ao sincronizar dados do Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAllData();
  }, []);

  // Synchronize isAdminView with URL/Hash for access using /admin, /admin/, #/admin, or #admin
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      
      const isRouteAdmin = 
        path === '/admin' || 
        path.endsWith('/admin') || 
        path.endsWith('/admin/') || 
        hash === '#/admin' || 
        hash === '#admin' || 
        search === '?admin' ||
        search.includes('admin=true');
        
      setIsAdminView(isRouteAdmin);
    };

    checkAdminRoute();

    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);
    
    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, []);

  const handleOpenAdminToggle = () => {
    if (isAdminView) {
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.location.hash = '';
      }
      const path = window.location.pathname.toLowerCase();
      if (path.endsWith('/admin') || path.endsWith('/admin/')) {
        window.history.pushState({}, '', '/');
      }
      setIsAdminView(false);
    } else {
      window.location.hash = '#/admin';
      setIsAdminView(true);
    }
  };

  // Automatic timer for dynamic banners
  useEffect(() => {
    if (!settings || !settings.banners || settings.banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % settings.banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [settings]);

  // Load cart list stored in browser on entry
  useEffect(() => {
    const savedCart = localStorage.getItem('buendia_cart_raw');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch {
        setCartItems([]);
      }
    }
  }, []);

  // Update localStorage when cart items shift
  const saveCartToLocalStorage = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('buendia_cart_raw', JSON.stringify(items));
  };

  // --- CART MANAGEMENT HANDLERS ---
  const handleAddToCart = (
    product: Product,
    quantity: number,
    color?: string,
    size?: string,
    observation?: string
  ) => {
    // Generate a unique identifier key for this specific variation configuration
    const variantId = `${product.id}-${color || ''}-${size || ''}`;
    
    // Check if matching item exists already inside
    const existingIdx = cartItems.findIndex(item => item.id === variantId);

    if (existingIdx >= 0) {
      const nextCart = [...cartItems];
      nextCart[existingIdx].quantity += quantity;
      
      // Update with new observation if provided
      if (observation) {
        nextCart[existingIdx].observation = observation;
      }
      saveCartToLocalStorage(nextCart);
    } else {
      const newItem: CartItem = {
        id: variantId,
        product,
        quantity,
        selectedColor: color,
        selectedSize: size,
        observation: observation
      };
      saveCartToLocalStorage([...cartItems, newItem]);
    }
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    const nextCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCartToLocalStorage(nextCart);
  };

  const handleRemoveFromCart = (id: string) => {
    const nextCart = cartItems.filter(item => item.id !== id);
    saveCartToLocalStorage(nextCart);
  };

  const handleClearCart = () => {
    saveCartToLocalStorage([]);
  };

  // --- FAVORITE TRIGGERS ---
  const handleToggleFavorite = async (productId: string) => {
    const nextList = await db.toggleFavorite(productId);
    setFavorites(nextList);
  };

  // --- SEARCH AND FILTER FILTERING ENGINE ---
  const handleCategorySelect = (id: string | null) => {
    setSelectedCategoryId(id);
    setSelectedSubcategoryId(null);
    setSearchTerm('');
  };

  const handleSubcategorySelect = (id: string | null) => {
    setSelectedSubcategoryId(id);
    setSearchTerm('');
  };

  // Main filter function
  const getFilteredProducts = () => {
    return products.filter(product => {
      // 1. Search term match
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(term);
        const matchesDesc = product.description.toLowerCase().includes(term);
        const matchesSku = product.sku?.toLowerCase().includes(term);
        
        // Match parents category name as well
        const categoryMatch = categories.find(c => c.id === product.categoryId)?.name.toLowerCase().includes(term);
        const subcategoryMatch = subcategories.find(s => s.id === product.subcategoryId)?.name.toLowerCase().includes(term);

        if (!matchesName && !matchesDesc && !matchesSku && !categoryMatch && !subcategoryMatch) {
          return false;
        }
      }

      // 2. Category match
      if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
        return false;
      }

      // 3. Subcategory match
      if (selectedSubcategoryId && product.subcategoryId !== selectedSubcategoryId) {
        return false;
      }

      return true;
    });
  };

  const filteredProductsList = getFilteredProducts();

  // Helper arrays for dynamic home feeds
  const weeklyNewProducts = products.filter(p => p.isWeeklyNew);
  const featuredProducts = products.filter(p => p.isFeatured);
  const giftProducts = products.filter(p => p.isGift);
  const kitsProducts = products.filter(p => p.isKit);
  const bestSellersProducts = products.filter(p => p.isBestSeller);

  const cartTotalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-[#FCFBF7] flex flex-col items-center justify-center space-y-4 select-none">
        <Sparkles className="h-10 w-10 text-amber-500 animate-spin" />
        <h2 className="font-display font-semibold text-sm text-buendia-navy tracking-widest uppercase">
          Carregando Universo Buendía
        </h2>
        <span className="text-[10px] text-[#7E8B99] animate-pulse">Organizando washi tapes e planners com amor...</span>
      </div>
    );
  }

  // Active color variables
  const primaryColorHex = settings.colors.primary;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      
      {/* Upper promo sticker line */}
      {(() => {
        const text = settings.topAnnouncementText ?? 'Produtos Únicos & Papelaria Criativa 🌼 Use o Cupom';
        const coupon = settings.topAnnouncementCoupon ?? 'BEMVINDA';
        const suffix = settings.topAnnouncementSuffix ?? 'para R$ 15,00 OFF!';
        
        if (!text && !coupon) return null;

        return (
          <div className="bg-buendia-pink text-buendia-navy text-[10px] font-display uppercase tracking-widest py-2 text-center font-semibold select-none flex items-center justify-center gap-1.5 px-4 min-h-[30px] print:hidden">
            {text && <span>{text}</span>}
            {coupon && coupon.trim() !== '' && (
              <>
                <strong className="bg-white text-buendia-navy px-1.5 py-0.5 rounded-sm font-bold">
                  {coupon}
                </strong>
                {suffix && suffix.trim() !== '' && <span>{suffix}</span>}
              </>
            )}
          </div>
        );
      })()}

      {/* Header bar */}
      <div className="print:hidden">
        <Header
          onOpenCart={() => setCartOpen(true)}
          cartCount={cartTotalQuantity}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onOpenAdmin={handleOpenAdminToggle}
          isAdminView={isAdminView}
          onOpenFavorites={() => setFavoritesOpen(true)}
          favoritesCount={favorites.length}
          products={products}
          onSelectProduct={(p) => setSelectedProduct(p)}
          settings={settings}
        />
      </div>

      {/* CORE BODY OF APPLICATION (SWITCH ACTION SHOP vs MERCHANT DIALOG) */}
      <main className="flex-grow pb-16">
        
        {isAdminView ? (
          (!authLoading && !user) || (user && user.role !== 'admin') ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 space-y-6 animate-fade-in">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full border border-buendia-navy/5 shadow-2xs">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Compass className="h-6 w-6 text-buendia-navy" />
                  </div>
                  <h2 className="font-display font-semibold text-xl text-buendia-navy">Acesso Administrativo</h2>
                  <p className="text-xs text-[#7E8B99] mt-1">Insira suas credenciais para gerenciar a loja.</p>
                </div>

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                  const pass = (form.elements.namedItem('password') as HTMLInputElement).value;
                  
                  const { success, error } = await loginEmailPassword(email, pass);
                  if (!success && error) {
                     alert(`Erro ao tentar login: ${error}`);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">E-mail</label>
                    <input name="email" type="email" required className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-3 focus:outline-hidden" placeholder="nome@papelaria.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Senha secreta</label>
                    <input name="password" type="password" required className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-3 focus:outline-hidden" placeholder="••••••••" />
                  </div>
                  <button type="submit" className="w-full bg-buendia-navy text-white text-xs font-bold rounded-xl py-3 mt-2 hover:bg-opacity-95 transition-all">
                    Entrar no Painel
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <AdminPanel
              categories={categories}
              subcategories={subcategories}
              products={products}
              orders={orders}
              coupons={coupons}
              settings={settings}
              onRefreshData={handleFetchAllData}
            />
          )
        ) : (
          // Customer E-commerce store
          <div className="space-y-12">
            
            {/* If there's an active search term or filter selection, render result header instead of original Home sections block */}
            {(searchTerm.trim() || selectedCategoryId) ? (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                
                {/* Search result header breadcrumb */}
                <div className="flex items-center justify-between border-b pb-4 mb-8">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#7E8B99] font-bold uppercase tracking-wider">Resultados de Seleção</span>
                    <h2 className="font-display font-semibold text-lg sm:text-xl text-buendia-navy">
                      {searchTerm.trim() 
                        ? `Pesquisa: "${searchTerm}"` 
                        : selectedCategoryId 
                        ? `${categories.find(c => c.id === selectedCategoryId)?.name}`
                        : 'Explore Mimos'}
                      {selectedSubcategoryId && ` · ${subcategories.find(s => s.id === selectedSubcategoryId)?.name}`}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategoryId(null);
                      setSelectedSubcategoryId(null);
                    }}
                    className="text-xs font-bold text-[#7E8B99] hover:text-buendia-navy underline font-display"
                  >
                    Ver Tudo (Limpar Filtros)
                  </button>
                </div>

                {/* Subcategory strip navigation if category is picked */}
                {selectedCategoryId && (
                  <div className="mb-6 -mt-2">
                    <CategoryNav
                      categories={categories}
                      subcategories={subcategories}
                      selectedCategoryId={selectedCategoryId}
                      selectedSubcategoryId={selectedSubcategoryId}
                      onSelectCategory={handleCategorySelect}
                      onSelectSubcategory={handleSubcategorySelect}
                    />
                  </div>
                )}

                {/* Search results list bento columns */}
                {filteredProductsList.length === 0 ? (
                  <div className="text-center py-24 bg-[#FCFBF7] rounded-3xl p-6 border border-dashed text-neutral-500 max-w-xl mx-auto">
                    <HelpCircle className="h-10 w-10 text-[#7E8B99]/40 mx-auto mb-2" />
                    <h4 className="font-display font-semibold text-sm text-buendia-navy">Mimo não encontrado</h4>
                    <p className="text-xs text-[#7E8B99] mt-1.5">
                      Não encontramos produtos correspondentes ao filtro atual. Tente alterar sua pesquisa ou navegue pelas coleções!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProductsList.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isFavorite={favorites.includes(product.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onSelect={(p) => setSelectedProduct(p)}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}

              </div>
            ) : (
              // ORIGINAL HOME SECTIONS (DYNAMIC RENDERING ACCORDING TO HOME DINÂMICA CRITERIA SET IN STORE SETTINGS)
              <div className="space-y-16">
                
                {settings.homeSections.sort((a,b) => a.order - b.order).map((section) => {
                  if (!section.enabled) return null;

                  switch (section.id) {
                    case 'banners':
                      return (
                        <div key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
                          <div className="relative w-[100%] overflow-hidden h-[340px] sm:h-[400px] bg-[#D1E9F6] rounded-[40px] shadow-xs">
                            {/* Banner Sliding Content with Fade Animation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              {settings.banners.map((item, idx) => {
                                const isActive = idx === activeSlide;
                                if (!item.active) return null;
                                return (
                                  <div
                                    key={item.id}
                                    className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
                                      isActive ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-102 z-0 pointer-events-none'
                                    }`}
                                  >
                                    {/* Blurred color wash background */}
                                    <div className="absolute inset-x-0 w-full h-full bg-cover bg-center filter saturate-110 pointer-events-none opacity-40 blur-xs" style={{ backgroundImage: `url(${item.imageUrl})` }}>
                                      <div className="absolute inset-0 bg-white/20" />
                                    </div>

                                    {/* Center core layout flex */}
                                    <div className="max-w-7xl mx-auto h-full px-6 sm:px-16 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 py-6">
                                      <div className="flex-1 text-center md:text-left space-y-3 sm:space-y-4 max-w-xl">
                                        <div className="inline-block px-3 py-1 bg-white/40 backdrop-blur-md rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-buendia-navy">
                                          Coleção Exclusiva
                                        </div>
                                        <h1 className="font-display font-bold text-2xl sm:text-4xl text-buendia-navy leading-[1.1] tracking-tight">
                                          {item.title}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-buendia-navy/80 leading-relaxed font-sans font-light max-w-sm">
                                          {item.subtitle}
                                        </p>
                                        
                                        <div className="pt-2">
                                          <button
                                            onClick={() => {
                                              if (item.linkTo) {
                                                const catId = item.linkTo.split('/').pop();
                                                if (catId) handleCategorySelect(catId);
                                              }
                                            }}
                                            className="bg-buendia-blue text-buendia-navy text-[10px] sm:text-xs font-bold uppercase tracking-widest py-3 px-8 rounded-full hover:bg-opacity-95 transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer border border-buendia-navy/10"
                                          >
                                            <span>Ver Novidades</span>
                                            <ArrowRight className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Large premium picture card */}
                                      <div className="hidden md:block flex-1 max-w-[280px] aspect-square rounded-[32px] overflow-hidden border-4 border-white shadow-md select-none pointer-events-none">
                                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Decorative pill sequences element from template and slide control indicators */}
                          {settings.banners.length > 1 && (
                            <div className="flex justify-center space-x-3 mt-6">
                              {settings.banners.map((_, i) => (
                                <button
                                  key={i}
                                  onClick={() => setActiveSlide(i)}
                                  className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                                    activeSlide === i 
                                      ? 'w-12 bg-buendia-navy' 
                                      : i === 0 ? 'w-4 bg-buendia-blue' : i === 1 ? 'w-4 bg-buendia-yellow' : 'w-4 bg-buendia-pink'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );

                    case 'categories':
                      return (
                        <div key={section.id} className="pt-6">
                          <CategoryNav
                            categories={categories}
                            subcategories={subcategories}
                            selectedCategoryId={selectedCategoryId}
                            selectedSubcategoryId={selectedSubcategoryId}
                            onSelectCategory={handleCategorySelect}
                            onSelectSubcategory={handleSubcategorySelect}
                          />
                        </div>
                      );

                    case 'novidades':
                      if (weeklyNewProducts.length === 0) return null;
                      return (
                        <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Novidades de papelaria</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {weeklyNewProducts.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
 
                     case 'destaques':
                       if (featuredProducts.length === 0) return null;
                       return (
                         <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Com amor</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {featuredProducts.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
 
                     case 'presentes':
                       if (giftProducts.length === 0) return null;
                       return (
                         <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Surpreenda com doçura</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {giftProducts.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
 
                     case 'kits':
                       if (kitsProducts.length === 0) return null;
                       return (
                         <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Exclusivos Buendía</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {kitsProducts.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
 
                     case 'mais_vendidos':
                       if (bestSellersProducts.length === 0) return null;
                       return (
                         <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Produtos em Destaque</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {bestSellersProducts.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
 
                     default: {
                       // Custom added / created sale sections or unknown cases
                       let productsForSection: Product[] = [];
                       const source = section.sourceType || 'novidades';
                       
                       if (source === 'novidades') {
                         productsForSection = weeklyNewProducts;
                       } else if (source === 'destaques') {
                         productsForSection = featuredProducts;
                       } else if (source === 'presentes') {
                         productsForSection = giftProducts;
                       } else if (source === 'kits') {
                         productsForSection = kitsProducts;
                       } else if (source === 'mais_vendidos') {
                         productsForSection = bestSellersProducts;
                       } else if (source.startsWith('cat-') || source.length > 0) {
                         productsForSection = products.filter(p => p.categoryId === source);
                       } else {
                         productsForSection = featuredProducts;
                       }

                       if (productsForSection.length === 0) return null;

                       return (
                         <section key={section.id} className="max-w-7xl mx-auto px-4 sm:px-6">
                           <div className="border-b border-gray-100 pb-3 mb-6 flex justify-between items-end">
                             <div>
                               <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#7E8B99]">Seção Especial de Vendas</span>
                               <h3 className="font-display font-semibold text-lg text-buendia-navy mt-1">{section.title}</h3>
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {productsForSection.slice(0, 4).map((p) => (
                               <ProductCard
                                 key={p.id}
                                 product={p}
                                 isFavorite={favorites.includes(p.id)}
                                 onToggleFavorite={handleToggleFavorite}
                                 onSelect={(p) => setSelectedProduct(p)}
                                 onAddToCart={handleAddToCart}
                               />
                             ))}
                           </div>
                         </section>
                       );
                     }
                  }
                })}



              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER WIDGET */}
      <footer className="bg-buendia-blue text-buendia-navy py-12 px-4 sm:px-6 border-t-4 border-buendia-yellow/50 print:hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-xs items-center md:items-start">
          
          {/* Logo / Brand slogan text */}
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            {settings.logoImageUrl ? (
              <img 
                src={settings.logoImageUrl} 
                alt="Logo" 
                className="h-28 sm:h-32 w-auto max-w-[300px] sm:max-w-[360px] object-contain rounded-xl" 
              />
            ) : (
              <span className="font-display text-lg font-black tracking-tight block">Buendía - Lara Peçanha</span>
            )}
            <p className="text-buendia-navy/70 leading-relaxed max-w-sm">
              Papelaria criativa e presentes personalizados que transformam pequenas anotações e dias em instantes de beleza e cor.
            </p>
          </div>

          {/* Location and Contacts */}
          <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
            <strong className="block font-display text-sm tracking-wider uppercase text-buendia-navy font-bold">Atendimento</strong>
            <div className="space-y-3 text-buendia-navy/80 font-medium">
              <div className="flex items-start gap-2 justify-center md:justify-start">
                <MapPin className="h-4 w-4 text-buendia-navy/40 mt-0.5 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="h-4 w-4 text-buendia-navy/40 shrink-0" />
                <span>{settings.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <Instagram className="h-4 w-4 text-buendia-navy/40 shrink-0" />
                <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank" rel="noopener" className="hover:underline">
                  @{settings.instagramHandle}
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* FLOAT WHATSAPP */}
      <WhatsAppButton phoneNumber={settings.whatsappNumber} />

      {/* SIDEBARS OVERLAYS (CART / FAVORITES / DETAILS OVERLAYS) */}
      
      {/* 1. SHOPPING CART OVERLAY */}
      <ShoppingCart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        coupons={coupons}
        whatsappNumber={settings.whatsappNumber}
      />

      {/* 2. FAVORITES MODAL SIDEBAR */}
      {favoritesOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs" onClick={() => setFavoritesOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l p-6 animate-fade-in text-buendia-navy">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-1.5">
                <Heart className="h-4.5 w-4.5 fill-rose-500 text-rose-500" />
                <h3 className="font-display font-semibold text-sm">Seus Favoritinhos ({favorites.length})</h3>
              </div>
              <button onClick={() => setFavoritesOpen(false)} className="text-xs font-semibold text-[#7E8B99]">✕</button>
            </div>

            {/* Favorites item list */}
            <div className="flex-grow overflow-y-auto space-y-4">
              {favorites.length === 0 ? (
                <div className="h-60 flex flex-col items-center justify-center text-center text-xs text-[#7E8B99]">
                  Nenhum produto salvo ainda. Toque no coraçãozinho dos produtos para salvar aqui!
                </div>
              ) : (
                products.filter(p => favorites.includes(p.id)).map(fav => {
                  const currentPrice = fav.promotionalPrice || fav.price;
                  return (
                    <div
                      key={fav.id}
                      onClick={() => {
                        setSelectedProduct(fav);
                        setFavoritesOpen(false);
                      }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-[#FCFBF7] hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      <img src={fav.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <strong className="block text-xs truncate">{fav.name}</strong>
                        <span className="text-[10px] text-amber-700 font-bold">R$ {currentPrice.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(fav.id);
                        }}
                        className="text-rose-500 text-xs font-semibold p-2"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => setFavoritesOpen(false)}
                className="w-full py-3 bg-buendia-navy text-white rounded-xl text-xs font-bold"
              >
                Voltar à Navegação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PRODUCT POPUP DETAILS CONFIGURATORS */}
      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
