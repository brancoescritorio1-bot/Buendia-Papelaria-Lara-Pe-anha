/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Category, Subcategory, Product, Order, Coupon, StoreSettings, OrderStatus } from '../types';

// Detect and safely load Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Initial mock data to ensure the app is gorgeous on first launch
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Papelaria Criativa',
    description: 'Washi tapes, adesivos delicados, carimbos e canetas colecionáveis.',
    active: true,
    position: 1,
    image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400',
    icon: '✨',
    banner: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-2',
    name: 'Escritório & Planner',
    description: 'Planners elegantes, cadernos inteligentes e blocos de organização minimalista.',
    active: true,
    position: 2,
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=400',
    icon: '📅',
    banner: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-3',
    name: 'Presentes & Amor',
    description: 'Kits montados com carinho, caixas decoradas e mensagens floridas.',
    active: true,
    position: 3,
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=400',
    icon: '💛',
    banner: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'cat-4',
    name: 'Mimos & Detalhes',
    description: 'Acessórios que encantam: broches, chaveiros fofos e estojos premium.',
    active: true,
    position: 4,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=400',
    icon: '🌸',
    banner: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200'
  }
];

const INITIAL_SUBCATEGORIES: Subcategory[] = [
  { id: 'sub-1', categoryId: 'cat-1', name: 'Washi Tapes', position: 1, active: true },
  { id: 'sub-2', categoryId: 'cat-1', name: 'Canetas Pastel', position: 2, active: true },
  { id: 'sub-3', categoryId: 'cat-1', name: 'Adesivos Coreanos', position: 3, active: true },
  { id: 'sub-4', categoryId: 'cat-2', name: 'Planners Mensais', position: 1, active: true },
  { id: 'sub-5', categoryId: 'cat-2', name: 'Cadernos de Disco', position: 2, active: true },
  { id: 'sub-6', categoryId: 'cat-3', name: 'Kits Prontos', position: 1, active: true },
  { id: 'sub-7', categoryId: 'cat-3', name: 'Caixas de Chá', position: 2, active: true }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Kit Washi Tape Florália Pastel',
    description: 'Conjunto premium com 4 fitas washi tape inspiradas na papelaria coreana. Padrões florais delicados com detalhes em dourado metalizado. Perfeitas para dar um toque acolhedor ao seu bujo (bullet journal) ou planners.',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    price: 32.90,
    promotionalPrice: 24.90,
    discountPercent: 24,
    stock: 12,
    sku: 'WASHI-FLOR-01',
    variations: [
      { name: 'Cor', options: ['Rosa Pétala', 'Azul Nuvem', 'Amarelo Mimosa'] }
    ],
    isOutOfStock: false,
    isFeatured: true,
    isWeeklyNew: true,
    isGift: false,
    isBestSeller: true,
    isKit: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    name: 'Planners Semanais Notion Minimal',
    description: 'Planejador de mesa com folhas destacáveis de gramatura premium 120g/m² que não transferem a tinta da caneta. Visual inspirado no design limpo do Notion, ideal para focar nas metas semanais.',
    images: [
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-2',
    subcategoryId: 'sub-4',
    price: 49.90,
    promotionalPrice: 39.90,
    discountPercent: 20,
    stock: 25,
    sku: 'PLN-NOT-01',
    variations: [
      { name: 'Tamanho', options: ['A5 Slim', 'Mesa Integral'] }
    ],
    isOutOfStock: false,
    isFeatured: true,
    isWeeklyNew: false,
    isGift: false,
    isBestSeller: true,
    isKit: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    name: 'Caneta Gel Buendía Dreams 0.38mm',
    description: 'Caneta de tinta gel preta ultra fina, fluxo contínuo sem borrões. Corpo em toque aveludado fosco com cores pastel lindíssimas. A sensação de escrever em nuvens!',
    images: [
      'https://images.unsplash.com/photo-1585336139080-b019d072d51e?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-1',
    subcategoryId: 'sub-2',
    price: 12.50,
    stock: 50,
    sku: 'CAN-GEL-038',
    variations: [
      { name: 'Cor do Corpo', options: ['Lavanda', 'Rosa Suave', 'Amarelo Creme', 'Verde Menta'] }
    ],
    isOutOfStock: false,
    isFeatured: false,
    isWeeklyNew: true,
    isGift: false,
    isBestSeller: true,
    isKit: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    name: 'Cartela de Adesivos Cozy Room',
    description: 'Cartela com adesivos pré-cortados em PVC fosco transparente de estética coreana. Ilustrações calmas de xícaras de café, livros, plantas e gatinhos fofos para aquecer qualquer anotação.',
    images: [
      'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-1',
    subcategoryId: 'sub-3',
    price: 14.90,
    stock: 0, // Esgotado para demonstrar badge de esgotado
    sku: 'AD-COZY-01',
    variations: [],
    isOutOfStock: true,
    isFeatured: false,
    isWeeklyNew: false,
    isGift: false,
    isBestSeller: false,
    isKit: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    name: 'Kit Presente Abraço de Flor',
    description: 'Um presente pronto para encantar e confortar. Contém: 1 Caderno de Disco Jardim, 2 cartelas de adesivos Cozy, 1 Caneta Gel Dream Lavanda e uma embalagem kraft premium perfumada com pétalas secas de lavanda.',
    images: [
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-3',
    subcategoryId: 'sub-6',
    price: 139.90,
    promotionalPrice: 119.90,
    discountPercent: 14,
    stock: 8,
    sku: 'KIT-ABR-V05',
    variations: [
      { name: 'Aroma', options: ['Lavanda Francesa', 'Cerejeiras do Oriente'] }
    ],
    isOutOfStock: false,
    isFeatured: true,
    isWeeklyNew: true,
    isGift: true, // Presente
    isBestSeller: true,
    isKit: true, // Kit
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    name: 'Caderno Inteligente Disco Florido A5',
    description: 'O famoso caderno modular de disco que permite tirar e colocar folhas quando você quiser. Capa dura com laminação fosca de flores silvestres e discos dourados metálicos de altíssima qualidade.',
    images: [
      'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=600'
    ],
    categoryId: 'cat-2',
    subcategoryId: 'sub-5',
    price: 98.00,
    stock: 15,
    sku: 'CAD-DIS-FLOR',
    variations: [
      { name: 'Miolo', options: ['Pautado (Gramatura 90g)', 'Pontilhado (Gramatura 90g)', 'Liso (Gramatura 120g)'] }
    ],
    isOutOfStock: false,
    isFeatured: true,
    isWeeklyNew: false,
    isGift: true,
    isBestSeller: false,
    isKit: false,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'BUENDIA10',
    type: 'percent',
    value: 10,
    expiresAt: '2026-12-31',
    usageLimit: 100,
    timesUsed: 12,
    minPurchase: 50.00,
    active: true
  },
  {
    code: 'BEMVINDA',
    type: 'fixed',
    value: 15.00,
    expiresAt: '2026-12-31',
    usageLimit: 300,
    timesUsed: 42,
    minPurchase: 80.00,
    active: true
  },
  {
    code: 'LARAAMADA',
    type: 'percent',
    value: 15,
    expiresAt: '2026-12-31',
    usageLimit: 50,
    timesUsed: 5,
    minPurchase: 100.00,
    active: true
  }
];

const INITIAL_SETTINGS: StoreSettings = {
  logo: '🌼 Buendía - Lara Peçanha',
  whatsappNumber: '38999990449', // Sem símbolos para o deep-linking
  instagramHandle: 'buendia_laracanha',
  phoneNumber: '(38) 99999-0449',
  address: 'Rua das Flores, 120, Centro - Montes Claros / MG',
  topAnnouncementText: 'Produtos Únicos & Papelaria Criativa 🌼 Use o Cupom',
  topAnnouncementCoupon: 'BEMVINDA',
  topAnnouncementSuffix: 'para R$ 15,00 OFF!',
  colors: {
    primary: '#0F2A4A',
    secondary: '#FFF89A',
    accent1: '#FFDEFA',
    accent2: '#E0F4FF'
  },
  homeSections: [
    { id: 'banners', title: 'Banner Rotativo', enabled: true, order: 1 },
    { id: 'categories', title: 'Categorias de Charme', enabled: true, order: 2 },
    { id: 'novidades', title: 'Novidades da Semana 🌸', enabled: true, order: 3 },
    { id: 'destaques', title: 'Destaques com Amor', enabled: true, order: 4 },
    { id: 'presentes', title: 'Opções de Presentes 🎁', enabled: true, order: 5 },
    { id: 'kits', title: 'Kits Especiais e Exclusivos', enabled: true, order: 6 },
    { id: 'mais_vendidos', title: 'Mais Amados (Mais Vendidos)', enabled: true, order: 7 }
  ],
  banners: [
    {
      id: 'banner-1',
      imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200',
      title: 'Mundos de Delicateza',
      subtitle: 'Papelaria criativa inspirada na leveza oriental e na organização minimalista.',
      linkTo: '/categoria/cat-1',
      active: true
    },
    {
      id: 'banner-2',
      imageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=1200',
      title: 'Espaços Inspiradores',
      subtitle: 'Planners e cadernos modulares pensados para deixar sua rotina fluida e colorida.',
      linkTo: '/categoria/cat-2',
      active: true
    },
    {
      id: 'banner-3',
      imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=1200',
      title: 'Kits de Presente com Afeto',
      subtitle: 'Surpreenda quem você ama com itens montados à mão e perfumados.',
      linkTo: '/categoria/cat-3',
      active: true
    }
  ]
};

// Help helper to get data with dynamic local structure
function getLocal<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(`buendia_${key}`);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
}

function setLocal<T>(key: string, value: T): void {
  localStorage.setItem(`buendia_${key}`, JSON.stringify(value));
}

// Global local persistence loaders
const loadCategories = () => getLocal<Category[]>('categories', INITIAL_CATEGORIES);
const saveCategories = (cats: Category[]) => setLocal('categories', cats);

const loadSubcategories = () => getLocal<Subcategory[]>('subcategories', INITIAL_SUBCATEGORIES);
const saveSubcategories = (subs: Subcategory[]) => setLocal('subcategories', subs);

const loadProducts = () => getLocal<Product[]>('products', INITIAL_PRODUCTS);
const saveProducts = (prods: Product[]) => setLocal('products', prods);

const loadCoupons = () => getLocal<Coupon[]>('coupons', INITIAL_COUPONS);
const saveCoupons = (coupons: Coupon[]) => setLocal('coupons', coupons);

const loadSettings = () => getLocal<StoreSettings>('settings', INITIAL_SETTINGS);
const saveSettings = (settings: StoreSettings) => setLocal('settings', settings);

const loadOrders = () => getLocal<Order[]>('orders', []);
const saveOrders = (orders: Order[]) => setLocal('orders', orders);

const loadFavorites = () => getLocal<string[]>('favorites', []);
const saveFavorites = (favs: string[]) => setLocal('favorites', favs);

// DB API offering full support for Supabase dynamically or fallback to state
export const db = {
  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*').order('position');
      if (!error && data) return data;
    }
    return loadCategories().sort((a, b) => a.position - b.position);
  },

  async saveCategory(category: Category): Promise<Category> {
    const list = loadCategories();
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      list[idx] = category;
    } else {
      list.push(category);
    }
    saveCategories(list);

    if (supabase) {
      await supabase.from('categories').upsert(category);
    }
    return category;
  },

  async deleteCategory(id: string): Promise<void> {
    const list = loadCategories().filter(c => c.id !== id);
    saveCategories(list);

    const subList = loadSubcategories().filter(sc => sc.categoryId !== id);
    saveSubcategories(subList);

    if (supabase) {
      await supabase.from('categories').delete().eq('id', id);
      await supabase.from('subcategories').delete().eq('categoryId', id);
    }
  },

  // --- SUBCATEGORIES ---
  async getSubcategories(): Promise<Subcategory[]> {
    if (supabase) {
      const { data, error } = await supabase.from('subcategories').select('*').order('position');
      if (!error && data) return data;
    }
    return loadSubcategories().sort((a, b) => a.position - b.position);
  },

  async saveSubcategory(sub: Subcategory): Promise<Subcategory> {
    const list = loadSubcategories();
    const idx = list.findIndex(s => s.id === sub.id);
    if (idx >= 0) {
      list[idx] = sub;
    } else {
      list.push(sub);
    }
    saveSubcategories(list);

    if (supabase) {
      await supabase.from('subcategories').upsert(sub);
    }
    return sub;
  },

  async deleteSubcategory(id: string): Promise<void> {
    const list = loadSubcategories().filter(s => s.id !== id);
    saveSubcategories(list);

    if (supabase) {
      await supabase.from('subcategories').delete().eq('id', id);
    }
  },

  // --- PRODUCTS ---
  async getProducts(): Promise<Product[]> {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data) return data;
    }
    return loadProducts();
  },

  async saveProduct(product: Product): Promise<Product> {
    const list = loadProducts();
    const idx = list.findIndex(p => p.id === product.id);
    if (idx >= 0) {
      list[idx] = product;
    } else {
      list.push(product);
    }
    saveProducts(list);

    if (supabase) {
      await supabase.from('products').upsert(product);
    }
    return product;
  },

  async deleteProduct(id: string): Promise<void> {
    const list = loadProducts().filter(p => p.id !== id);
    saveProducts(list);

    if (supabase) {
      await supabase.from('products').delete().eq('id', id);
    }
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    let list: Order[] = [];
    if (supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      if (!error && data) list = data as Order[];
      else list = loadOrders();
    } else {
      list = loadOrders();
    }

    // Auto-expire "Aguardando WhatsApp" after 24h
    let updatedAny = false;
    const now = new Date().getTime();
    for (let i = 0; i < list.length; i++) {
      const order = list[i];
      if (order.status === 'Aguardando WhatsApp') {
        const orderTime = new Date(order.createdAt).getTime();
        const hrs24 = 24 * 60 * 60 * 1000;
        if (now - orderTime > hrs24) {
          order.status = 'Cancelado';
          const historyEntry = {
            id: `hist-${Math.random().toString(36).substring(2, 9)}`,
            orderId: order.id,
            action: 'Status alterado para Cancelado automáticamente (expirado após 24h)',
            timestamp: new Date().toISOString(),
            note: 'Pedido expirado.',
            itemChanged: 'status'
          };
          order.history = order.history || [];
          order.history.push(historyEntry);
          updatedAny = true;
          
          if (supabase) {
            supabase.from('orders').upsert(order).then();
            supabase.from('order_history').insert(historyEntry).then();
          }
        }
      }
    }
    
    if (updatedAny) {
      saveOrders(list);
    }
    
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createOrder(order: Omit<Order, 'orderNumber'>): Promise<Order> {
    const list = loadOrders();
    // Calculate a sequential auto-increment code
    const nextNum = list.length + 1001;
    const orderNumber = `BD-${nextNum}`;

    const newOrder: Order = {
      ...order,
      orderNumber,
      stockDeducted: false, // Initial state is false. Official stock is deducted when finalized.
    };

    list.push(newOrder);
    saveOrders(list);

    if (supabase) {
      await supabase.from('orders').insert(newOrder);
    }

    return newOrder;
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order | null> {
    const list = loadOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx >= 0) {
      const order = list[idx];
      const previousStatus = order.status;
      const wasDeducted = !!order.stockDeducted;
      
      order.status = status;
      const historyEntry = {
        id: `hist-${Math.random().toString(36).substring(2, 9)}`,
        orderId: id,
        action: `Status alterado para ${status}`,
        timestamp: new Date().toISOString(),
        note: note || `De ${previousStatus} para ${status}`,
        itemChanged: 'status'
      };
      
      order.history = order.history || [];
      order.history.push(historyEntry);

      // Statuses that are considered "finalized / confirmed" and deduct from official stock
      const isFinalStatus = ['Em preparação', 'Em transporte', 'Entregue'].includes(status);
      
      // If we are now finalized and weren't deducted before -> Deduct from official stock!
      if (isFinalStatus && !wasDeducted) {
        const products = loadProducts();
        for (const item of order.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
            if (prod.stock === 0) prod.isOutOfStock = true;
          }
        }
        order.stockDeducted = true;
        saveProducts(products);
        if (supabase) {
          for (const item of order.items) {
            const p = products.find(pr => pr.id === item.productId);
            if (p) await supabase.from('products').upsert(p);
          }
        }
      }
      
      // If we go to non-finalized states (like Cancelado) but were deducted before -> Return to stock!
      const isReturnStatus = ['Cancelado', 'Aguardando WhatsApp'].includes(status);
      if (isReturnStatus && wasDeducted) {
        const products = loadProducts();
        for (const item of order.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            prod.isOutOfStock = false;
          }
        }
        order.stockDeducted = false;
        saveProducts(products);
        if (supabase) {
          for (const item of order.items) {
            const p = products.find(pr => pr.id === item.productId);
            if (p) await supabase.from('products').upsert(p);
          }
        }
      }

      list[idx] = order;
      saveOrders(list);

      if (supabase) {
        try {
          await supabase.from('orders').upsert(order);
          // Explicitly insert into order_history table as requested
          await supabase.from('order_history').insert(historyEntry);
        } catch (e) {
          console.warn('Supabase sync failed (offline or unconfigured), saved locally.');
        }
      }
      return order;
    }
    return null;
  },

  async updateOrder(updatedOrder: Order): Promise<Order | null> {
    const list = loadOrders();
    const idx = list.findIndex(o => o.id === updatedOrder.id);
    if (idx >= 0) {
      const originalOrder = list[idx];
      const isFinalStatus = ['separado', 'enviado', 'entregue'].includes(updatedOrder.status);
      const products = loadProducts();
      let inventoryChanged = false;

      // 1. If original order had already deducted its stock, temporarily return its items to catalog stock.
      if (originalOrder.stockDeducted) {
        for (const item of originalOrder.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            prod.isOutOfStock = false;
            inventoryChanged = true;
          }
        }
      }

      // 2. If the updated order is in a finalized status now, deduct its new items from catalog stock.
      if (isFinalStatus) {
        for (const item of updatedOrder.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock = Math.max(0, prod.stock - item.quantity);
            if (prod.stock === 0) prod.isOutOfStock = true;
            inventoryChanged = true;
          }
        }
        updatedOrder.stockDeducted = true;
      } else {
        updatedOrder.stockDeducted = false;
      }

      // Save updated products list
      if (inventoryChanged) {
        saveProducts(products);
        if (supabase) {
          const allProductIds = new Set([
            ...originalOrder.items.map(i => i.productId),
            ...updatedOrder.items.map(i => i.productId)
          ]);
          for (const pid of allProductIds) {
            const p = products.find(pr => pr.id === pid);
            if (p) await supabase.from('products').upsert(p);
          }
        }
      }

      // Save order
      list[idx] = updatedOrder;
      saveOrders(list);

      if (supabase) {
        await supabase.from('orders').upsert(updatedOrder);
        // Sync any history elements that might not be in order_history (naive approach insert latest one)
        if (updatedOrder.history && updatedOrder.history.length > 0) {
          const latestHistory = updatedOrder.history[updatedOrder.history.length - 1];
          if (latestHistory && latestHistory.id) {
            try {
              await supabase.from('order_history').insert(latestHistory);
            } catch(e) {
              // ignore duplicate key error
            }
          }
        }
      }
      return updatedOrder;
    }
    return null;
  },

  async deleteOrder(id: string): Promise<boolean> {
    const list = loadOrders();
    const idx = list.findIndex(o => o.id === id);
    if (idx >= 0) {
      const order = list[idx];
      
      // If stock was deducted, return it to products list
      if (order.stockDeducted) {
        const products = loadProducts();
        for (const item of order.items) {
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            prod.stock += item.quantity;
            prod.isOutOfStock = false;
          }
        }
        saveProducts(products);
        if (supabase) {
          for (const item of order.items) {
            const p = products.find(pr => pr.id === item.productId);
            if (p) await supabase.from('products').upsert(p);
          }
        }
      }

      list.splice(idx, 1);
      saveOrders(list);

      if (supabase) {
        try {
          await supabase.from('orders').delete().eq('id', id);
        } catch (e) {
          console.warn('Supabase delete failed, processed locally.');
        }
      }
      return true;
    }
    return false;
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    if (supabase) {
      const { data, error } = await supabase.from('coupons').select('*');
      if (!error && data) return data;
    }
    return loadCoupons();
  },

  async saveCoupon(coupon: Coupon): Promise<Coupon> {
    const list = loadCoupons();
    const idx = list.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    saveCoupons(list);

    if (supabase) {
      await supabase.from('coupons').upsert(coupon);
    }
    return coupon;
  },

  async deleteCoupon(code: string): Promise<void> {
    const list = loadCoupons().filter(c => c.code.toUpperCase() !== code.toUpperCase());
    saveCoupons(list);

    if (supabase) {
      await supabase.from('coupons').delete().eq('code', code.toUpperCase());
    }
  },

  async incrementCouponUsage(code: string): Promise<void> {
    const list = loadCoupons();
    const idx = list.findIndex(c => c.code.toUpperCase() === code.toUpperCase());
    if (idx >= 0) {
      list[idx].timesUsed += 1;
      saveCoupons(list);
      if (supabase) {
        await supabase.from('coupons').upsert(list[idx]);
      }
    }
  },

  // --- FAVORITES ---
  async getFavorites(): Promise<string[]> {
    return loadFavorites();
  },

  async toggleFavorite(productId: string): Promise<string[]> {
    const list = loadFavorites();
    const idx = list.indexOf(productId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
    }
    saveFavorites(list);
    return list;
  },

  // --- SETTINGS ---
  async getSettings(): Promise<StoreSettings> {
    if (supabase) {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      if (!error && data) return data;
    }
    return loadSettings();
  },

  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    saveSettings(settings);
    if (supabase) {
      await supabase.from('settings').upsert({ id: 'singleton-settings', ...settings });
    }
    return settings;
  },

  // --- STORAGE / FILE UPLAD SIMULATION ---
  // The system allows directly uploading file/dragging, compressed automatic and saved in storage.
  // We return a high-fidelity mock URL (or actual bucket public URL if supabase configured)
  async uploadProductImage(file: File): Promise<string> {
    if (supabase && isSupabaseConfigured) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { data, error } = await supabase.storage
        .from('buendia-images')
        .upload(filePath, file);

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from('buendia-images')
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    }

    // High fidelity fallback - convert file object to Local ObjectURL or elegant base64 with compression simulation
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (!base64Url) {
          resolve('');
          return;
        }

        // Scale down and compress using HTML5 Canvas to protect localStorage limits
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 800;
            const MAX_HEIGHT = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              // High quality JPEG compression (0.75 ratio) keeps file sizes tiny (around 30-60KB) while preserving real details perfectly!
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              resolve(dataUrl);
            } else {
              resolve(base64Url);
            }
          } catch (e) {
            console.error('Fallra na compressão Canvas:', e);
            resolve(base64Url);
          }
        };
        img.onerror = () => {
          resolve(base64Url);
        };
        img.src = base64Url;
      };
      reader.readAsDataURL(file);
    });
  }
};
