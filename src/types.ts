/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  position: number;
  image?: string;
  icon?: string;
  banner?: string;
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  active: boolean;
  position: number;
}

export interface ProductVariation {
  name: string; // e.g., "Cor", "Tamanho"
  options: string[]; // e.g., ["Rosa", "Azul Pastel", "Amarelo Pastel"]
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  price: number;
  promotionalPrice?: number;
  discountPercent?: number; // Automatic discount % display
  stock: number;
  sku?: string;
  variations: ProductVariation[];
  isOutOfStock: boolean;
  isFeatured: boolean;    // Destaque
  isWeeklyNew: boolean;   // Novidades da semana
  isGift: boolean;        // Presente
  isBestSeller: boolean;  // Mais vendidos
  isKit: boolean;         // Kit personalizado
  createdAt: string;
}

export interface CartItem {
  id: string; // unique item id in cart (product_id + variation choices)
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  observation?: string;
}

export type OrderStatus = 'Aguardando WhatsApp' | 'Em preparação' | 'Em transporte' | 'Entregue' | 'Cancelado' | 'Fechado';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number; // preco unitario podendo ser alterado manualmente
  discount?: number; // desconto individual
  selectedColor?: string;
  selectedSize?: string;
  observation?: string;
}

export interface OrderHistoryEntry {
  id?: string;
  orderId?: string;
  timestamp: string;
  action: string;      // tipo de alteração realizada
  itemChanged?: string; // item alterado
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // auto-increment sequence
  createdAt: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  couponCode?: string;
  couponDiscount?: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Pix' | 'cartão' | 'dinheiro' | 'transferência' | 'pendente';
  history: OrderHistoryEntry[];
  stockDeducted?: boolean;
}

export interface Coupon {
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  expiresAt: string;
  usageLimit: number;
  timesUsed: number;
  minPurchase: number;
  active: boolean;
}

export interface CarouselBanner {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkTo?: string;
  active: boolean;
}

export interface StoreSettings {
  logo: string;
  logoImageUrl?: string;
  banners: CarouselBanner[];
  whatsappNumber: string;
  instagramHandle: string;
  phoneNumber: string;
  address: string;
  colors: {
    primary: string; // e.g., "#0F2A4A" (azul marinho sofisticado)
    secondary: string; // e.g., "#FFF89A" (amarelo pastel)
    accent1: string; // e.g., "#FFDEFA" (rosa pastel)
    accent2: string; // e.g., "#E0F4FF" (azul claro pastel)
  };
  homeSections: {
    id: string;
    title: string;
    enabled: boolean;
    order: number;
    sourceType?: string; // Type or category filter source for custom sections
  }[];
  topAnnouncementText?: string;
  topAnnouncementCoupon?: string;
  topAnnouncementSuffix?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'admin' | 'customer';
}
