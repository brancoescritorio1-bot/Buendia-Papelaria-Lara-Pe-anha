/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  ShoppingBag, ClipboardList, PenTool, FolderSync, Percent, Settings, Plus, Trash2, 
  Check, Save, Printer, ArrowUp, ArrowDown, Sparkles, AlertCircle, RefreshCw, Layers, Calendar, ChevronRight, Share2, 
  Database, Copy, ExternalLink, HelpCircle, Edit, Upload 
} from 'lucide-react';
import { Category, Subcategory, Product, Order, Coupon, StoreSettings, OrderStatus, OrderItem } from '../types';
import { db, isSupabaseConfigured } from '../lib/db';
import ImageUploader from './ImageUploader';

interface AdminPanelProps {
  categories: Category[];
  subcategories: Subcategory[];
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
  onRefreshData: () => void;
}

export default function AdminPanel({
  categories,
  subcategories,
  products,
  orders,
  coupons,
  settings,
  onRefreshData,
}: AdminPanelProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'coupons' | 'settings'>('orders');
  const [showSupabaseGuide, setShowSupabaseGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- ORDERS TAB STATES ---
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('todos');
  const [statusUpdateNote, setStatusUpdateNote] = useState('');

  // --- ORDER EDITING STATES ---
  const [isEditingOrder, setIsEditingOrder] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editCustomerPhone, setEditCustomerPhone] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'Pix' | 'cartão' | 'dinheiro' | 'transferência' | 'pendente'>('Pix');
  const [editOrderItems, setEditOrderItems] = useState<OrderItem[]>([]);
  const [editSearchProduct, setEditSearchProduct] = useState('');
  const [showAddProductSelector, setShowAddProductSelector] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | null>(null);
  const [selectedColorToAdd, setSelectedColorToAdd] = useState('');
  const [selectedSizeToAdd, setSelectedSizeToAdd] = useState('');

  // --- PRODUCTS TAB STATES ---
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('0');
  const [prodPromotionalPrice, setProdPromotionalPrice] = useState('');
  const [prodStock, setProdStock] = useState('5');
  const [prodSku, setProdSku] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodSubcategoryId, setProdSubcategoryId] = useState('');
  const [prodImages, setProdImages] = useState<string[]>([]);
  const [prodColors, setProdColors] = useState('');
  const [prodSizes, setProdSizes] = useState('');
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsWeeklyNew, setProdIsWeeklyNew] = useState(false);
  const [prodIsGift, setProdIsGift] = useState(false);
  const [prodIsBestSeller, setProdIsBestSeller] = useState(false);
  const [prodIsKit, setProdIsKit] = useState(false);

  // --- CATEGORIES TAB STATES ---
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catIcon, setCatIcon] = useState('');
  const [catBanner, setCatBanner] = useState('');
  const [catImage, setCatImage] = useState('');

  const [subName, setSubName] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');

  // --- COUPONS TAB STATES ---
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percent' | 'fixed'>('percent');
  const [newCouponVal, setNewCouponVal] = useState('');
  const [newCouponLimit, setNewCouponLimit] = useState('100');
  const [newCouponMin, setNewCouponMin] = useState('0');
  const [newCouponExpiry, setNewCouponExpiry] = useState('');

  // --- SETTINGS TAB STATES ---
  const [logo, setLogo] = useState(settings.logo);
  const [logoImageUrl, setLogoImageUrl] = useState(settings.logoImageUrl || '');
  const [wpp, setWpp] = useState(settings.whatsappNumber);
  const [insta, setInsta] = useState(settings.instagramHandle);
  const [phone, setPhone] = useState(settings.phoneNumber);
  const [address, setAddress] = useState(settings.address);
  const [banner1, setBanner1] = useState(settings.banners[0]?.imageUrl || '');
  const [bannerTitle1, setBannerTitle1] = useState(settings.banners[0]?.title || '');
  const [bannerSubtitle1, setBannerSubtitle1] = useState(settings.banners[0]?.subtitle || '');

  const [banner2, setBanner2] = useState(settings.banners[1]?.imageUrl || '');
  const [bannerTitle2, setBannerTitle2] = useState(settings.banners[1]?.title || '');
  const [bannerSubtitle2, setBannerSubtitle2] = useState(settings.banners[1]?.subtitle || '');

  const [banner3, setBanner3] = useState(settings.banners[2]?.imageUrl || '');
  const [bannerTitle3, setBannerTitle3] = useState(settings.banners[2]?.title || '');
  const [bannerSubtitle3, setBannerSubtitle3] = useState(settings.banners[2]?.subtitle || '');

  const [secOrder, setSecOrder] = useState(settings.homeSections);

  const [topBarText, setTopBarText] = useState(settings.topAnnouncementText || 'Produtos Únicos & Papelaria Criativa 🌼 Use o Cupom');
  const [topBarCoupon, setTopBarCoupon] = useState(settings.topAnnouncementCoupon || 'BEMVINDA');
  const [topBarSuffix, setTopBarSuffix] = useState(settings.topAnnouncementSuffix || 'para R$ 15,00 OFF!');

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionSourceType, setNewSectionSourceType] = useState('novidades');

  // --- HELPER HANDLERS ---

  // Order Transition Trigger
  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    await db.updateOrderStatus(orderId, status, statusUpdateNote || undefined);
    setStatusUpdateNote('');
    onRefreshData();
    // Update active visual invoice object if printing detail
    if (selectedOrder && selectedOrder.id === orderId) {
      const refreshed = orders.find(o => o.id === orderId);
      if (refreshed) {
        setSelectedOrder({
          ...refreshed,
          status,
          history: [
            ...refreshed.history,
            { status, timestamp: new Date().toISOString(), note: statusUpdateNote || undefined }
          ]
        });
      }
    }
  };

  // --- ORDER MANUAL EDITING FUNCTIONS ---
  const startEditingOrder = () => {
    if (!selectedOrder) return;
    setEditCustomerName(selectedOrder.customerName);
    setEditCustomerPhone(selectedOrder.customerPhone);
    setEditPaymentMethod(selectedOrder.paymentMethod);
    setEditOrderItems([...selectedOrder.items]);
    setEditSearchProduct('');
    setShowAddProductSelector(false);
    setSelectedProductToAdd(null);
    setSelectedColorToAdd('');
    setSelectedSizeToAdd('');
    setIsEditingOrder(true);
  };

  const cancelEditingOrder = () => {
    setIsEditingOrder(false);
  };

  const handleSaveEditedOrder = async () => {
    if (!selectedOrder) return;
    if (editOrderItems.length === 0) {
      alert("O pedido precisa conter pelo menos um item!");
      return;
    }

    // Recalculate total
    const newTotal = editOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updated: Order = {
      ...selectedOrder,
      customerName: editCustomerName,
      customerPhone: editCustomerPhone,
      paymentMethod: editPaymentMethod,
      items: editOrderItems,
      total: newTotal,
      history: [
        ...selectedOrder.history,
        {
          status: selectedOrder.status,
          timestamp: new Date().toISOString(),
          note: 'Pedido alterado manualmente no painel administrativo'
        }
      ]
    };

    const result = await db.updateOrder(updated);
    if (result) {
      setSelectedOrder(result);
      setIsEditingOrder(false);
      onRefreshData();
    }
  };

  const handleUpdateItemQuantity = (index: number, delta: number) => {
    const next = [...editOrderItems];
    next[index].quantity = Math.max(1, next[index].quantity + delta);
    setEditOrderItems(next);
  };

  const handleRemoveOrderItem = (index: number) => {
    const next = editOrderItems.filter((_, i) => i !== index);
    setEditOrderItems(next);
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductToAdd) return;

    const existingIndex = editOrderItems.findIndex(item => 
      item.productId === selectedProductToAdd.id &&
      (item.selectedColor || '') === selectedColorToAdd &&
      (item.selectedSize || '') === selectedSizeToAdd
    );

    if (existingIndex >= 0) {
      const next = [...editOrderItems];
      next[existingIndex].quantity += 1;
      setEditOrderItems(next);
    } else {
      const newItem: OrderItem = {
        productId: selectedProductToAdd.id,
        productName: selectedProductToAdd.name,
        price: selectedProductToAdd.promotionalPrice || selectedProductToAdd.price,
        quantity: 1,
        selectedColor: selectedColorToAdd || undefined,
        selectedSize: selectedSizeToAdd || undefined
      };
      setEditOrderItems([...editOrderItems, newItem]);
    }

    // Reset selectors
    setSelectedProductToAdd(null);
    setSelectedColorToAdd('');
    setSelectedSizeToAdd('');
    setShowAddProductSelector(false);
  };

  // Create or Update Product
  const openProductForm = (prod: Product | null = null) => {
    if (prod) {
      setEditingProduct(prod);
      setProdName(prod.name);
      setProdDesc(prod.description);
      setProdPrice(prod.price.toString());
      setProdPromotionalPrice(prod.promotionalPrice?.toString() || '');
      setProdStock(prod.stock.toString());
      setProdSku(prod.sku || '');
      setProdCategoryId(prod.categoryId);
      setProdSubcategoryId(prod.subcategoryId || '');
      setProdImages(prod.images);
      
      const colorVar = prod.variations.find(v => v.name === 'Cor');
      setProdColors(colorVar ? colorVar.options.join(', ') : '');

      const sizeVar = prod.variations.find(v => v.name === 'Tamanho' || v.name === 'Atributo');
      setProdSizes(sizeVar ? sizeVar.options.join(', ') : '');

      setProdIsFeatured(prod.isFeatured);
      setProdIsWeeklyNew(prod.isWeeklyNew);
      setProdIsGift(prod.isGift);
      setProdIsBestSeller(prod.isBestSeller);
      setProdIsKit(prod.isKit);
    } else {
      setEditingProduct(null);
      setProdName('');
      setProdDesc('');
      setProdPrice('0');
      setProdPromotionalPrice('');
      setProdStock('5');
      setProdSku('');
      setProdCategoryId(categories[0]?.id || '');
      setProdSubcategoryId('');
      setProdImages([]);
      setProdColors('Rosa, Azul Pastel, Creme');
      setProdSizes('A5 Standard, Mini Slim');
      setProdIsFeatured(false);
      setProdIsWeeklyNew(true);
      setProdIsGift(false);
      setProdIsBestSeller(false);
      setProdIsKit(false);
    }
    setProductFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCategoryId) return;

    const priceNum = parseFloat(prodPrice) || 0;
    const promoNum = parseFloat(prodPromotionalPrice) || undefined;
    const discount = promoNum ? Math.round(((priceNum - promoNum) / priceNum) * 100) : undefined;

    // Package Variations
    const variationsArray = [];
    if (prodColors.trim()) {
      variationsArray.push({
        name: 'Cor',
        options: prodColors.split(',').map(s => s.trim()).filter(Boolean)
      });
    }
    if (prodSizes.trim()) {
      variationsArray.push({
        name: 'Tamanho',
        options: prodSizes.split(',').map(s => s.trim()).filter(Boolean)
      });
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Math.random().toString(36).substring(2, 9)}`,
      name: prodName,
      description: prodDesc,
      images: prodImages.length > 0 ? prodImages : ['https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=600'],
      categoryId: prodCategoryId,
      subcategoryId: prodSubcategoryId || undefined,
      price: priceNum,
      promotionalPrice: promoNum,
      discountPercent: discount,
      stock: parseInt(prodStock) || 0,
      sku: prodSku || undefined,
      variations: variationsArray,
      isOutOfStock: (parseInt(prodStock) || 0) <= 0,
      isFeatured: prodIsFeatured,
      isWeeklyNew: prodIsWeeklyNew,
      isGift: prodIsGift,
      isBestSeller: prodIsBestSeller,
      isKit: prodIsKit,
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString()
    };

    await db.saveProduct(payload);
    setProductFormOpen(false);
    onRefreshData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await db.deleteProduct(id);
      onRefreshData();
    }
  };

  // Categories Save / Setup
  const openCategoryForm = (cat: Category | null = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatDesc(cat.description || '');
      setCatIcon(cat.icon || '');
      setCatBanner(cat.banner || '');
      setCatImage(cat.image || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatDesc('');
      setCatIcon('');
      setCatBanner('');
      setCatImage('');
    }
    setCatFormOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const payload: Category = {
      id: editingCategory ? editingCategory.id : `cat-${Math.random().toString(36).substring(2, 9)}`,
      name: catName,
      description: catDesc,
      icon: catIcon,
      active: editingCategory ? editingCategory.active : true,
      position: editingCategory ? editingCategory.position : categories.length + 1,
      banner: catBanner || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200',
      image: catImage || 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=400'
    };

    await db.saveCategory(payload);
    setCatFormOpen(false);
    onRefreshData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Atenção: Excluir esta categoria removerá todas as suas subcategorias integradas! Confirmar?')) {
      await db.deleteCategory(id);
      onRefreshData();
    }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName || !subCategoryId) return;

    const payload: Subcategory = {
      id: `sub-${Math.random().toString(36).substring(2, 9)}`,
      categoryId: subCategoryId,
      name: subName,
      active: true,
      position: subcategories.filter(s => s.categoryId === subCategoryId).length + 1
    };

    await db.saveSubcategory(payload);
    setSubName('');
    onRefreshData();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (confirm('Deseja realmente remover esta subcategoria?')) {
      await db.deleteSubcategory(id);
      onRefreshData();
    }
  };

  // Positional sorting rules
  const handleMoveCategory = async (idx: number, direction: 'up' | 'down') => {
    const list = [...categories].sort((a,b)=>a.position-b.position);
    if (direction === 'up' && idx > 0) {
      const temp = list[idx].position;
      list[idx].position = list[idx-1].position;
      list[idx-1].position = temp;
    } else if (direction === 'down' && idx < list.length - 1) {
      const temp = list[idx].position;
      list[idx].position = list[idx+1].position;
      list[idx+1].position = temp;
    }

    for (const cat of list) {
      await db.saveCategory(cat);
    }
    onRefreshData();
  };

  // Coupons triggers
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;

    const valNum = parseFloat(newCouponVal) || 0;
    const limitNum = parseInt(newCouponLimit) || 100;
    const minNum = parseFloat(newCouponMin) || 0;

    const payload: Coupon = {
      code: newCouponCode.substring(0, 15).toUpperCase().trim(),
      type: newCouponType,
      value: valNum,
      expiresAt: newCouponExpiry || '2026-12-31',
      usageLimit: limitNum,
      timesUsed: 0,
      minPurchase: minNum,
      active: true
    };

    await db.saveCoupon(payload);
    setNewCouponCode('');
    setNewCouponVal('');
    setCouponFormOpen(false);
    onRefreshData();
  };

  const handleDeleteCoupon = async (code: string) => {
    if (confirm('Deseja inativar e excluir este cupom de desconto?')) {
      await db.deleteCoupon(code);
      onRefreshData();
    }
  };

  // Settings Save trigger
  const handleSaveGlobalSettings = async () => {
    const payload: StoreSettings = {
      logo,
      logoImageUrl,
      whatsappNumber: wpp,
      instagramHandle: insta,
      phoneNumber: phone,
      address,
      colors: settings.colors,
      homeSections: secOrder,
      topAnnouncementText: topBarText,
      topAnnouncementCoupon: topBarCoupon,
      topAnnouncementSuffix: topBarSuffix,
      banners: [
        { id: 'banner-1', imageUrl: banner1 || settings.banners[0].imageUrl, title: bannerTitle1, subtitle: bannerSubtitle1, active: true },
        { id: 'banner-2', imageUrl: banner2 || settings.banners[1].imageUrl, title: bannerTitle2, subtitle: bannerSubtitle2, active: true },
        { id: 'banner-3', imageUrl: banner3 || settings.banners[2].imageUrl, title: bannerTitle3, subtitle: bannerSubtitle3, active: true }
      ]
    };

    await db.saveSettings(payload);
    alert('Configurações salvas com sucesso!');
    onRefreshData();
  };

  // Banner file uploads
  const uploadBannerImage = async (file: File, setter: (url: string) => void) => {
    try {
      const url = await db.uploadProductImage(file);
      setter(url);
    } catch (err) {
      alert('Falha ao enviar imagem do banner!');
    }
  };

  // Sales Section Manager actions
  const handleDeleteSection = (id: string) => {
    if (confirm('Deseja realmente excluir esta seção de vendas? Isso apenas a removerá da visualização da página principal.')) {
      const next = secOrder.filter(s => s.id !== id);
      setSecOrder(next);
    }
  };

  const handleAddSection = () => {
    if (!newSectionTitle.trim()) {
      alert('Favor preencher o título da nova seção!');
      return;
    }
    const newId = 'custom-sec-' + Date.now();
    const newSection = {
      id: newId,
      title: newSectionTitle,
      enabled: true,
      order: secOrder.length + 1,
      sourceType: newSectionSourceType
    };
    setSecOrder([...secOrder, newSection]);
    setNewSectionTitle('');
    alert(`Seção "${newSectionTitle}" adicionada! Lembre-se de clicar em "Salvar Configurações" no painel esquerdo para persistir as alterações.`);
  };

  const handleUpdateSectionTitle = (id: string, newTitle: string) => {
    const next = secOrder.map(s => {
      if (s.id === id) return { ...s, title: newTitle };
      return s;
    });
    setSecOrder(next);
  };

  // Section visibility controller inside Home Dinâmica
  const toggleSection = (id: string) => {
    const next = secOrder.map(s => {
      if (s.id === id) return { ...s, enabled: !s.enabled };
      return s;
    });
    setSecOrder(next);
  };

  const moveSection = (idx: number, dir: 'up' | 'down') => {
    const list = [...secOrder];
    if (dir === 'up' && idx > 0) {
      const temp = list[idx];
      list[idx] = list[idx-1];
      list[idx-1] = temp;
    } else if (dir === 'down' && idx < list.length - 1) {
      const temp = list[idx];
      list[idx] = list[idx+1];
      list[idx+1] = temp;
    }
    setSecOrder(list.map((item, i) => ({ ...item, order: i + 1 })));
  };

  // Browser print triggered seamlessly
  const triggerBrowserInvoicePrint = () => {
    window.print();
  };

  const filteredOrders = orders.filter(o => 
    orderStatusFilter === 'todos' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 select-none no-print">
      
      {/* Upper info ribbon with bento spacing */}
      <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#7E8B99] flex items-center gap-1">
            Proprietária / Gerenciamento
          </span>
          <h2 className="font-display font-semibold text-2xl text-buendia-navy mt-1">
            Painel Buendía Lara Peçanha
          </h2>
          <p className="text-xs text-[#7E8B99] mt-1">
            Controle estoque, configure cupons, reorganize seções e acompanhe pedidos dos seus clientes de forma prática.
          </p>
        </div>

        <button
          onClick={onRefreshData}
          className="flex items-center gap-2 p-3 bg-[#FCFBF7] hover:bg-[#E5F3FD] text-buendia-navy rounded-2xl text-xs font-bold border border-buendia-navy/10 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4 text-[#7E8B99]" />
          Sincronizar Supabase
        </button>
      </div>

      {/* Supabase Connectivity Widget */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${isSupabaseConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-[#FFF1C1] text-amber-700'}`}>
              <Database className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#7E8B99]">Mapeamento de Banco de Dados</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider ${
                  isSupabaseConfigured 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {isSupabaseConfigured ? '● Conectado ao Supabase' : '○ Armazenamento Local LocalStorage'}
                </span>
              </div>
              <h3 className="font-display font-medium text-base text-buendia-navy mt-0.5">
                {isSupabaseConfigured 
                  ? 'Conexão Supabase Estabelecida com Sucesso!' 
                  : 'Sincronizar sua Loja ao Banco de Dados Supabase'}
              </h3>
              <p className="text-xs text-[#7E8B99] mt-1 max-w-2xl leading-relaxed">
                {isSupabaseConfigured 
                  ? 'Seus produtos, pedidos, coleções, cupons e preferências estéticas estão sendo salvos e sincronizados em tempo real no seu banco de dados na nuvem.' 
                  : 'Atualmente a loja está operando em modo offline de alta fidelidade persistido no navegador. Conecte ao seu Supabase na nuvem para compartilhar os dados de forma permanente.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSupabaseGuide(!showSupabaseGuide)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F9F9F9] hover:bg-[#D1E9F6]/30 text-buendia-navy text-xs font-semibold rounded-full border border-gray-100 transition-all cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-[#7E8B99]" />
              {showSupabaseGuide ? 'Ocultar Guia Técnico' : 'Como Conectar? (Guia)'}
            </button>
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-buendia-navy hover:bg-opacity-90 text-white text-xs font-semibold rounded-full transition-all cursor-pointer shadow-xs"
            >
              <span>Ir para o Supabase</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Interactive Guide Block */}
        {showSupabaseGuide && (
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-6 animate-fade-in text-buendia-navy">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Step instructions */}
              <div className="space-y-4">
                <h4 className="font-display font-medium text-sm text-buendia-navy flex items-center gap-1.5">
                  <span className="text-[#D1E9F6] text-lg font-bold">1.</span> Passos para Ativação da Conexão
                </h4>
                <ul className="space-y-3 text-xs text-[#7E8B99] list-none pl-0">
                  <li className="flex items-start gap-2 leading-relaxed">
                    <span className="bg-[#D1E9F6] text-buendia-navy w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">1</span>
                    <div>
                      <strong>Crie uma conta e projeto:</strong> Cadastre-se em <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-buendia-navy underline">supabase.com</a> e crie um novo projeto gratuitamente.
                    </div>
                  </li>
                  <li className="flex items-start gap-2 leading-relaxed">
                    <span className="bg-[#FFF1C1] text-amber-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">2</span>
                    <div>
                      <strong>Configurar no AI Studio:</strong> No painel de controle do AI Studio, abra o menu lateral de <strong>Configurações (Painel de Secrets)</strong> e adicione estas duas chaves de ambiente:
                      <div className="mt-1.5 space-y-1 bg-[#F9F9F9] p-2.5 rounded-xl text-[10px] font-mono border border-gray-100 text-buendia-navy">
                        <p>VITE_SUPABASE_URL = "https://seu-projeto.supabase.co"</p>
                        <p>VITE_SUPABASE_ANON_KEY = "sua-chave-anonima"</p>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 leading-relaxed">
                    <span className="bg-[#FDE2E4] text-rose-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 shrink-0">3</span>
                    <div>
                      <strong>Execute o SQL de Estrutura:</strong> Acesse o <strong>SQL Editor</strong> do seu painel Supabase, copie o script de criação à direita, cole e clique em <strong>Run</strong>. Suas tabelas serão criadas imediatamente!
                    </div>
                  </li>
                </ul>

                <div className="p-4 bg-[#F9F9F9]/80 rounded-[24px] border border-gray-100 text-xs">
                  <span className="font-semibold text-buendia-navy">Modo Híbrido:</span>
                  <p className="text-[#7E8B99] mt-1 leading-relaxed">
                    Caso as chaves do Supabase não estejam configuradas, nosso banco de dados opera com fallback automático e transparente em <strong>LocalStorage</strong> no navegador do cliente, garantindo que o visual do site de Lara funcione perfeitamente com zero configurações adicionais obrigatórias!
                  </p>
                </div>
              </div>

              {/* SQL box */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-display font-medium text-sm text-buendia-navy flex items-center gap-1.5">
                    <span className="text-[#FFF1C1] text-lg font-bold">2.</span> Script SQL (Criar Tabelas)
                  </h4>
                  <button
                    onClick={() => {
                      const sqlText = `-- TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 1,
    image TEXT,
    icon TEXT,
    banner TEXT
);

-- TABELA DE SUBCATEGORIAS
CREATE TABLE IF NOT EXISTS public.subcategories (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 1
);

-- TABELA DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    price DOUBLE PRECISION NOT NULL,
    "promotionalPrice" DOUBLE PRECISION,
    "discountPercent" INTEGER,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    variations JSONB DEFAULT '[]'::jsonb,
    "isOutOfStock" BOOLEAN DEFAULT FALSE,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "isWeeklyNew" BOOLEAN DEFAULT FALSE,
    "isGift" BOOLEAN DEFAULT FALSE,
    "isBestSeller" BOOLEAN DEFAULT FALSE,
    "isKit" BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT
);

-- TABELA DE CUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    "expiresAt" TEXT,
    "usageLimit" INTEGER DEFAULT 100,
    "timesUsed" INTEGER DEFAULT 0,
    "minPurchase" DOUBLE PRECISION DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- TABELA DE CONFIGURACAO
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'singleton-settings',
    logo TEXT NOT NULL,
    banners JSONB DEFAULT '[]'::jsonb,
    "whatsappNumber" TEXT,
    "instagramHandle" TEXT,
    "phoneNumber" TEXT,
    address TEXT,
    colors JSONB DEFAULT '{}'::jsonb,
    "homeSections" JSONB DEFAULT '[]'::jsonb
);

-- TABELA DE PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "createdAt" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    history JSONB DEFAULT '[]'::jsonb
);

-- ATIVAR POLITICAS RLS PARA ACESSO TOTAL PUBLICO DA LOJA
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY policy_select_categories ON public.categories FOR SELECT USING (true);
CREATE POLICY policy_insert_categories ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_categories ON public.categories FOR UPDATE USING (true);
CREATE POLICY policy_delete_categories ON public.categories FOR DELETE USING (true);

CREATE POLICY policy_select_subcategories ON public.subcategories FOR SELECT USING (true);
CREATE POLICY policy_insert_subcategories ON public.subcategories FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_subcategories ON public.subcategories FOR UPDATE USING (true);
CREATE POLICY policy_delete_subcategories ON public.subcategories FOR DELETE USING (true);

CREATE POLICY policy_select_products ON public.products FOR SELECT USING (true);
CREATE POLICY policy_insert_products ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_products ON public.products FOR UPDATE USING (true);
CREATE POLICY policy_delete_products ON public.products FOR DELETE USING (true);

CREATE POLICY policy_select_coupons ON public.coupons FOR SELECT USING (true);
CREATE POLICY policy_insert_coupons ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_coupons ON public.coupons FOR UPDATE USING (true);
CREATE POLICY policy_delete_coupons ON public.coupons FOR DELETE USING (true);

CREATE POLICY policy_select_settings ON public.settings FOR SELECT USING (true);
CREATE POLICY policy_insert_settings ON public.settings FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_settings ON public.settings FOR UPDATE USING (true);
CREATE POLICY policy_delete_settings ON public.settings FOR DELETE USING (true);

CREATE POLICY policy_select_orders ON public.orders FOR SELECT USING (true);
CREATE POLICY policy_insert_orders ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY policy_update_orders ON public.orders FOR UPDATE USING (true);
CREATE POLICY policy_delete_orders ON public.orders FOR DELETE USING (true);`;
                      navigator.clipboard.writeText(sqlText);
                      setCopiedSql(true);
                      setTimeout(() => setCopiedSql(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-buendia-navy text-white text-[11px] font-semibold rounded-lg hover:bg-opacity-95 transition-all cursor-pointer shadow-xs"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedSql ? 'Copiado!' : 'Copiar Script SQL'}
                  </button>
                </div>

                <div className="relative flex-grow">
                  <pre className="text-[10px] font-mono text-[#7E8B99] bg-[#F9F9F9] border border-gray-100 rounded-2xl p-4 overflow-y-auto max-h-[220px] leading-relaxed select-text">
{`-- Execute no SQL Editor do Supabase para criar as tabelas:

CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 1,
    image TEXT, icon TEXT, banner TEXT
);

CREATE TABLE public.subcategories (
    id TEXT PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    position INTEGER DEFAULT 1
);

CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    "categoryId" TEXT NOT NULL,
    "subcategoryId" TEXT,
    price DOUBLE PRECISION NOT NULL,
    "promotionalPrice" DOUBLE PRECISION,
    "discountPercent" INTEGER,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    variations JSONB DEFAULT '[]'::jsonb,
    "isOutOfStock" BOOLEAN DEFAULT FALSE,
    "isFeatured" BOOLEAN DEFAULT FALSE,
    "isWeeklyNew" BOOLEAN DEFAULT FALSE,
    "isGift" BOOLEAN DEFAULT FALSE,
    "isBestSeller" BOOLEAN DEFAULT FALSE,
    "isKit" BOOLEAN DEFAULT FALSE,
    "createdAt" TEXT
);

CREATE TABLE public.coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    "expiresAt" TEXT,
    "usageLimit" INTEGER DEFAULT 100,
    "timesUsed" INTEGER DEFAULT 0,
    "minPurchase" DOUBLE PRECISION DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE public.settings (
    id TEXT PRIMARY KEY DEFAULT 'singleton-settings',
    logo TEXT NOT NULL,
    banners JSONB DEFAULT '[]'::jsonb,
    "whatsappNumber" TEXT,
    "instagramHandle" TEXT,
    "phoneNumber" TEXT,
    address TEXT,
    colors JSONB DEFAULT '{}'::jsonb,
    "homeSections" JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE public.orders (
    id TEXT PRIMARY KEY,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "createdAt" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb,
    total DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    history JSONB DEFAULT '[]'::jsonb
);`}
                  </pre>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Main Tab bar */}
      <div className="flex flex-wrap gap-2 border-b border-buendia-navy/10 pb-4 mb-8 overflow-x-auto">
        {[
          { id: 'orders', label: 'Lista de Pedidos', icon: ClipboardList, color: 'text-amber-500' },
          { id: 'products', label: 'Catálogo de Produtos', icon: PenTool, color: 'text-emerald-500' },
          { id: 'categories', label: 'Categorias e Linhas', icon: layers => <Layers className="h-4 w-4" />, color: 'text-sky-500' },
          { id: 'coupons', label: 'Cupons', icon: Percent, color: 'text-[#FFDEFA]' },
          { id: 'settings', label: 'Estética & Configurações', icon: Settings, color: 'text-amber-600' }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-buendia-navy text-white shadow-md'
                  : 'bg-white text-buendia-navy border border-buendia-navy/5 hover:border-buendia-navy/15 shadow-2xs'
              }`}
            >
              {typeof IconComp === 'function' ? IconComp(null) : <IconComp className="h-4 w-4" />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}

      {/* 1. ORDERS MONITOR TAB */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Order selection sidebar tree */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Status filtering selection row */}
            <div className="flex flex-wrap gap-2">
              {['todos', 'pendente', 'aguardando_whatsapp', 'separado', 'enviado', 'entregue', 'cancelado'].map((status) => (
                <button
                  key={status}
                  onClick={() => setOrderStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    orderStatusFilter === status
                      ? 'bg-buendia-navy text-white'
                      : 'bg-white border text-buendia-navy border-buendia-navy/5 hover:bg-[#FCFBF7]'
                  }`}
                >
                  {status === 'todos' ? 'Ver Todos' : status.replace('_', ' ')}
                </button>
              ))}
            </div>

            {/* List block */}
            <div className="bg-white rounded-3xl border border-buendia-navy/5 shadow-2xs overflow-hidden">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-xs text-[#7E8B99]">
                  Nenhum pedido cadastrado nesta categoria.
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {filteredOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order.id;
                    const statusColorMap: Record<OrderStatus, string> = {
                      pendente: 'bg-[#FCFBF7] text-[#7E8B99] border-neutral-300',
                      aguardando_whatsapp: 'bg-amber-50 text-amber-900 border-amber-200',
                      separado: 'bg-sky-50 text-sky-800 border-sky-100',
                      enviado: 'bg-blue-50 text-blue-800 border-blue-200',
                      entregue: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                      cancelado: 'bg-rose-50 text-rose-800 border-rose-200'
                    };

                    return (
                      <div
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#FCFBF7]' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-semibold text-sm text-buendia-navy">{order.orderNumber}</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColorMap[order.status]}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="text-xs text-buendia-navy font-bold">{order.customerName} · <span className="text-[#7E8B99] font-normal">{order.customerPhone}</span></div>
                          <div className="text-[10px] text-[#7E8B99] flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Order price details */}
                        <div className="flex items-center gap-3 justify-between sm:justify-end">
                          <div className="text-right">
                            <span className="text-[9px] uppercase tracking-wider text-[#7E8B99] block font-semibold">{order.items.length} itens no total</span>
                            <span className="text-xs font-bold text-buendia-navy">R$ {order.total.toFixed(2)}</span>
                          </div>
                          <ChevronRight className={`h-4 w-4 text-[#7E8B99] transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Order view / Status updating / Printing Panel */}
          <div className="space-y-6">
            {selectedOrder ? (
              isEditingOrder ? (
                <div className="bg-white rounded-3xl p-6 border border-[#FFDEFA] shadow-md space-y-6 animate-fade-in text-buendia-navy font-sans">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-display font-bold text-sm text-buendia-navy flex items-center gap-1">
                      Editando Pedido: {selectedOrder.orderNumber}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEditingOrder}
                        className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-buendia-navy rounded-xl text-[10px] font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveEditedOrder}
                        className="px-2.5 py-1.5 bg-buendia-navy text-white hover:bg-opacity-90 rounded-xl text-[10px] font-bold cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                  {/* Customer details edit */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B99] block font-sans">Dados da Cliente:</span>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-bold text-buendia-navy/70 uppercase mb-1">Nome da Cliente</label>
                        <input
                          type="text"
                          value={editCustomerName}
                          onChange={(e) => setEditCustomerName(e.target.value)}
                          className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-2.5 focus:outline-hidden font-sans"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-buendia-navy/70 uppercase mb-1">Telefone / Celular</label>
                        <input
                          type="text"
                          value={editCustomerPhone}
                          onChange={(e) => setEditCustomerPhone(e.target.value)}
                          className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-2.5 focus:outline-hidden font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-buendia-navy/70 uppercase mb-1">Forma de Pagamento</label>
                      <select
                        value={editPaymentMethod}
                        onChange={(e) => setEditPaymentMethod(e.target.value as any)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-2.5 focus:outline-hidden font-sans"
                      >
                        <option value="Pix">Pix</option>
                        <option value="cartão">Cartão de Crédito/Débito</option>
                        <option value="dinheiro">Dinheiro físico</option>
                        <option value="transferência">Transferência Bancária</option>
                        <option value="pendente">A combinar / Pendente</option>
                      </select>
                    </div>
                  </div>

                  {/* Order items editing list */}
                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B99] block font-sans">Itens do Cupom:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddProductSelector(!showAddProductSelector);
                          setSelectedProductToAdd(null);
                        }}
                        className="text-[10px] text-amber-600 hover:underline font-bold flex items-center gap-1 cursor-pointer font-sans"
                      >
                        {showAddProductSelector ? "Fechar Busca" : "Adicionar Item"}
                      </button>
                    </div>

                    {/* SELECTOR SCREEN TO ADD ITEMS */}
                    {showAddProductSelector && (
                      <div className="bg-[#FFF89A]/10 border border-[#FFF89A]/40 rounded-2xl p-3 space-y-3 animate-fade-in font-sans">
                        <label className="block text-[9px] font-bold text-buendia-navy/70 uppercase">Filtrar Produto para Adicionar</label>
                        <input
                          type="text"
                          placeholder="Digite o nome do produto..."
                          value={editSearchProduct}
                          onChange={(e) => setEditSearchProduct(e.target.value)}
                          className="w-full bg-white text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-2 focus:outline-hidden"
                        />
                        
                        {/* List search results */}
                        <div className="max-h-40 overflow-y-auto divide-y border rounded-xl bg-white text-xs text-buendia-navy font-sans">
                          {products
                            .filter(p => p.name.toLowerCase().includes(editSearchProduct.toLowerCase()))
                            .map(prod => (
                              <div
                                key={prod.id}
                                onClick={() => {
                                  setSelectedProductToAdd(prod);
                                  // Auto select first variation option if any
                                  const colorOpt = prod.variations.find(v => v.name === 'Cor')?.options[0] || '';
                                  const sizeOpt = prod.variations.find(v => v.name === 'Tamanho' || v.name === 'Atributo')?.options[0] || '';
                                  setSelectedColorToAdd(colorOpt);
                                  setSelectedSizeToAdd(sizeOpt);
                                }}
                                className={`p-2 hover:bg-neutral-50 cursor-pointer flex justify-between items-center ${
                                  selectedProductToAdd?.id === prod.id ? 'bg-[#FCFBF7]' : ''
                                }`}
                              >
                                <span>{prod.name} (Estoque: {prod.stock})</span>
                                <span className="font-bold text-[#7E8B99]">R$ {(prod.promotionalPrice || prod.price).toFixed(2)}</span>
                              </div>
                            ))}
                        </div>

                        {/* Selected product configurations */}
                        {selectedProductToAdd && (
                          <div className="pt-2 border-t space-y-2.5 text-xs text-buendia-navy font-sans">
                            <div className="bg-neutral-50 p-2.5 rounded-xl font-medium text-buendia-navy">
                              Marcado: <strong>{selectedProductToAdd.name}</strong>
                            </div>
                            
                            {/* Color variation */}
                            {selectedProductToAdd.variations.find(v => v.name === 'Cor') && (
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-[#7E8B99] mb-1">Selecione a Cor</label>
                                <div className="flex flex-wrap gap-1">
                                  {selectedProductToAdd.variations.find(v => v.name === 'Cor')?.options.map(color => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setSelectedColorToAdd(color)}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                        selectedColorToAdd === color
                                          ? 'bg-buendia-navy text-white'
                                          : 'bg-white border text-buendia-navy hover:bg-gray-100'
                                      }`}
                                    >
                                      {color}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Size/Attribute variation */}
                            {selectedProductToAdd.variations.find(v => v.name === 'Tamanho' || v.name === 'Atributo') && (
                              <div>
                                <label className="block text-[9px] uppercase font-bold text-[#7E8B99] mb-1">Atributo/Modelo</label>
                                <div className="flex flex-wrap gap-1">
                                  {selectedProductToAdd.variations.find(v => v.name === 'Tamanho' || v.name === 'Atributo')?.options.map(att => (
                                    <button
                                      key={att}
                                      type="button"
                                      onClick={() => setSelectedSizeToAdd(att)}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer ${
                                        selectedSizeToAdd === att
                                          ? 'bg-buendia-navy text-white'
                                          : 'bg-white border text-buendia-navy hover:bg-gray-100'
                                      }`}
                                    >
                                      {att}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={handleAddProductToOrder}
                              className="w-full py-2 bg-buendia-navy text-white hover:bg-opacity-95 font-bold rounded-xl text-xs cursor-pointer"
                            >
                              Confirmar Adição de Item
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edit list table items */}
                    <div className="space-y-2 bg-[#FCFBF7] rounded-2xl p-3 border font-sans text-buendia-navy">
                      {editOrderItems.length === 0 ? (
                        <p className="text-center text-[#7E8B99] py-4 text-xs">Insira pelo menos um produto no pedido acima</p>
                      ) : (
                        editOrderItems.map((item, idx) => (
                          <div key={idx} className="flex flex-col gap-1.5 py-2 border-b border-dashed border-gray-100 last:border-0 text-xs">
                            <div className="flex justify-between font-semibold">
                              <span>
                                {item.productName}
                                {(item.selectedColor || item.selectedSize) && (
                                  <span className="text-[10px] text-amber-700 ml-1 font-normal">
                                    ({[item.selectedColor, item.selectedSize].filter(Boolean).join(', ')})
                                  </span>
                                )}
                              </span>
                              <span className="text-[#7E8B99]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              {/* Quantity manipulators */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(idx, -1)}
                                  className="w-6 h-6 rounded-full bg-white border hover:bg-neutral-100 flex items-center justify-center font-bold text-buendia-navy text-xs cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-bold font-mono text-xs w-6 text-center">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemQuantity(idx, 1)}
                                  className="w-6 h-6 rounded-full bg-white border hover:bg-neutral-100 flex items-center justify-center font-bold text-buendia-navy text-xs cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveOrderItem(idx)}
                                className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                              >
                                Remover Item
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Display new reactive totals */}
                      <div className="flex justify-between pt-2 border-t text-xs font-bold text-buendia-navy">
                        <span>Total Calculado:</span>
                        <span>R$ {editOrderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 pt-2 border-t">
                    <button
                      type="button"
                      onClick={cancelEditingOrder}
                      className="flex-1 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-buendia-navy font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                    >
                      Descartar Alterações
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedOrder}
                      className="flex-1 py-2.5 bg-buendia-navy text-white hover:bg-opacity-90 font-bold rounded-xl text-xs transition-transform cursor-pointer text-center"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-6 animate-fade-in font-sans">
                  <div className="flex items-center justify-between border-b pb-4">
                    <h3 className="font-display font-bold text-sm text-buendia-navy">Detalhes: {selectedOrder.orderNumber}</h3>
                    <div className="flex gap-1.5">
                      <button
                        onClick={startEditingOrder}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FCFBF7] hover:bg-neutral-100 text-buendia-navy rounded-xl text-[10px] font-extrabold border cursor-pointer"
                        title="Alterar dados e itens do pedido"
                      >
                        <Edit className="h-3.5 w-3.5 text-[#7E8B99]" /> Alterar
                      </button>
                      <button
                        onClick={triggerBrowserInvoicePrint}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#FCFBF7] hover:bg-neutral-100 text-buendia-navy rounded-xl text-[10px] font-bold border cursor-pointer"
                        title="Imprimir Recibo Profissional"
                      >
                        <Printer className="h-3.5 w-3.5 text-[#7E8B99]" /> Imprimir
                      </button>
                    </div>
                  </div>

                  {/* Cliente / Status indicators block */}
                  <div className="text-xs text-buendia-navy space-y-1">
                    <div><strong>Cliente:</strong> {selectedOrder.customerName}</div>
                    <div><strong>Telefone:</strong> {selectedOrder.customerPhone}</div>
                    <div><strong>Pagamento:</strong> <span className="underline font-bold">{selectedOrder.paymentMethod}</span></div>
                    {selectedOrder.stockDeducted !== undefined && (
                      <div>
                        <strong>Controle de Estoque:</strong>{' '}
                        <span className={`font-bold px-1.5 py-0.5 rounded-md text-[9px] uppercase ${
                          selectedOrder.stockDeducted 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {selectedOrder.stockDeducted ? 'Estoque Oficial Baixado' : 'Estoque Pendente (Não Baixado)'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Internal order items row */}
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B99] mb-2">Produtos no Pedido:</h4>
                    <div className="space-y-2 bg-[#FCFBF7] rounded-2xl p-3 border">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs py-1 border-b border-dashed last:border-0 text-buendia-navy">
                          <div>
                            <span className="font-semibold">{item.quantity}x {item.productName}</span>
                            {(item.selectedColor || item.selectedSize) && (
                              <span className="text-[10px] text-amber-700 block font-normal">
                                Matiz/Atributo: {[item.selectedColor, item.selectedSize].filter(Boolean).join(', ')}
                              </span>
                            )}
                          </div>
                          <span className="text-[#7E8B99]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 text-xs font-bold text-buendia-navy border-t border-dashed">
                        <span>Total estimado:</span>
                        <span>R$ {selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Transition State trigger */}
                  <div className="space-y-3 pt-3 border-t font-sans">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy block">Alterar Status do Pedido:</span>
                    
                    {/* Status buttons stack */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { s: 'separado', label: 'Separado' },
                        { s: 'enviado', label: 'Enviado' },
                        { s: 'entregue', label: 'Entregue' },
                        { s: 'cancelado', label: 'Cancelar' }
                      ].map((statusObj) => (
                        <button
                          key={statusObj.s}
                          onClick={() => handleUpdateStatus(selectedOrder.id, statusObj.s as OrderStatus)}
                          className={`py-2 px-3 text-[10px] font-extrabold text-center rounded-xl border transition-all cursor-pointer ${
                            selectedOrder.status === statusObj.s
                              ? 'bg-buendia-navy text-white border-buendia-navy'
                              : 'bg-white border-neutral-200 hover:border-neutral-300 text-buendia-navy'
                          }`}
                        >
                          {statusObj.label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Nota opcional do histórico (ex: Rastreio)..."
                        value={statusUpdateNote}
                        onChange={(e) => setStatusUpdateNote(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-xl p-2.5 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Audit trail sequence logs */}
                  <div className="pt-4 border-t font-sans">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B99] block mb-2">Linha do tempo:</span>
                    <div className="space-y-3.5 relative pl-4 border-l border-neutral-100">
                      {selectedOrder.history.map((hist, index) => (
                        <div key={index} className="relative text-[10px] leading-relaxed">
                          <span className="absolute -left-5 top-1 h-2 w-2 rounded-full bg-buendia-navy inline-block" />
                          <span className="font-bold text-buendia-navy block capitalize">{hist.status.replace('_', ' ')}</span>
                          <span className="text-buendia-gray block">{new Date(hist.timestamp).toLocaleDateString('pt-BR')} - {new Date(hist.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          {hist.note && <span className="font-semibold block text-amber-700 font-sans">Nota: _"{hist.note}"_</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-buendia-navy/5 shadow-2xs text-center text-xs text-[#7E8B99]">
                Selecione um pedido ao lado para visualizar faturas, atualizar o status de estoque, ou imprimir recibos de envio
              </div>
            )}
          </div>

        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT CATALOG TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border shadow-3xs">
            <span className="text-xs text-[#7E8B99] font-bold">{products.length} produtos cadastrados no total</span>
            <button
              onClick={() => openProductForm()}
              className="flex items-center gap-2 px-4 py-2.5 bg-buendia-navy hover:bg-opacity-95 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Cadastrar Novo Mimo
            </button>
          </div>

          {/* Form setup overlay conditionally rendered */}
          {productFormOpen && (
            <form onSubmit={handleSaveProduct} className="bg-white rounded-3xl p-6 sm:p-8 border border-buendia-navy/10 shadow-lg space-y-6">
              <h3 className="font-display font-semibold text-base text-buendia-navy">
                {editingProduct ? `Editar Produto: ${editingProduct.name}` : 'Cadastrar Novo Produto'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b">
                
                {/* Product primary core fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Título do Produto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Caneta Dreams Lavanda 0.38mm"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Descrição do Produto *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Insira os detalhes e descrição do produto..."
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Preço Real R$</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={prodPrice}
                        onChange={(e) => setProdPrice(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Preço Promo R$</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Vazio p/ normal"
                        value={prodPromotionalPrice}
                        onChange={(e) => setProdPromotionalPrice(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Estoque un.*</label>
                      <input
                        type="number"
                        required
                        value={prodStock}
                        onChange={(e) => setProdStock(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">SKU Opcional</label>
                      <input
                        type="text"
                        placeholder="Ex: PL-DREAMS-05"
                        value={prodSku}
                        onChange={(e) => setProdSku(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Categoria Mãe *</label>
                      <select
                        value={prodCategoryId}
                        onChange={(e) => {
                          setProdCategoryId(e.target.value);
                          setProdSubcategoryId('');
                        }}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {prodCategoryId && subcategories.filter(s => s.categoryId === prodCategoryId).length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Subcategoria</label>
                      <select
                        value={prodSubcategoryId}
                        onChange={(e) => setProdSubcategoryId(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3"
                      >
                        <option value="">Nenhuma subcategoria (apenas principal)</option>
                        {subcategories.filter(s => s.categoryId === prodCategoryId).map(sc => (
                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Variation tags */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1">Cores (Separe por vírgula)</label>
                      <input
                        type="text"
                        placeholder="Ex: Rosa, Azul, Creme"
                        value={prodColors}
                        onChange={(e) => setProdColors(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1">Tamanhos / Atributos</label>
                      <input
                        type="text"
                        placeholder="Ex: A5, A6, Espiral"
                        value={prodSizes}
                        onChange={(e) => setProdSizes(e.target.value)}
                        className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3"
                      />
                    </div>
                  </div>

                </div>

                {/* Right side: Image uploader & special flags */}
                <div className="space-y-6">
                  
                  {/* Pinterest Multi-image uploader */}
                  <ImageUploader 
                    images={prodImages} 
                    onChange={setProdImages} 
                    maxImages={5} 
                  />

                  {/* Flags checklist */}
                  <div className="bg-[#FCFBF7] p-5 rounded-3xl border border-buendia-navy/5 space-y-3">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1">Etiquetas e Posicionamento:</span>
                    
                    {[
                      { checked: prodIsFeatured, setChecked: setProdIsFeatured, label: 'Produto Destaque da Loja 💎' },
                      { checked: prodIsWeeklyNew, setChecked: setProdIsWeeklyNew, label: 'Novidade da Semana 🌟' },
                      { checked: prodIsGift, setChecked: setProdIsGift, label: 'Adequado para Sugestão de Presentes 🎁' },
                      { checked: prodIsBestSeller, setChecked: setProdIsBestSeller, label: 'Campeão de Vendas (Mais vendidos) 🔥' },
                      { checked: prodIsKit, setChecked: setProdIsKit, label: 'Kit Especial Montado com Carinho 💝' }
                    ].map((item, idx) => (
                      <label key={idx} className="flex items-center gap-2 text-xs text-buendia-navy font-semibold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={(e) => item.setChecked(e.target.checked)}
                          className="rounded-sm text-buendia-navy border-buendia-navy/10"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                </div>

              </div>

              {/* Botões do Formulário de Produto */}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setProductFormOpen(false)}
                  className="px-5 py-2.5 border border-buendia-navy/10 text-buendia-navy text-xs font-bold rounded-full hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-buendia-navy text-white text-xs font-bold rounded-full hover:bg-opacity-95"
                >
                  Salvar Produto no Supabase
                </button>
              </div>

            </form>
          )}

          {/* Core Table Grid layout */}
          <div className="bg-white rounded-3xl border border-buendia-navy/5 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF7] text-[10px] uppercase tracking-wider text-buendia-navy font-bold border-b border-buendia-navy/5">
                    <th className="p-4 sm:p-5">Mimo</th>
                    <th className="p-4 sm:p-5">Preço</th>
                    <th className="p-4 sm:p-5">Estoque</th>
                    <th className="p-4 sm:p-5">Atributos / Coleções</th>
                    <th className="p-4 sm:p-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-buendia-navy">
                  {products.map((prod) => {
                    const hasPromo = prod.promotionalPrice && prod.promotionalPrice < prod.price;
                    return (
                      <tr key={prod.id} className="hover:bg-[#FCFBF7]/50 transition-colors">
                        <td className="p-4 sm:p-5 flex items-center gap-3">
                          <img src={prod.images[0]} alt="" className="w-10 h-10 object-cover rounded-xl" />
                          <div>
                            <span className="font-bold block text-buendia-navy">{prod.name}</span>
                            <span className="text-[10px] text-[#7E8B99] block italic">{prod.sku || 'Sem Código'}</span>
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 font-bold">
                          {hasPromo ? (
                            <div>
                              <span className="text-[10px] block line-through text-[#7E8B99]">R$ {prod.price.toFixed(2)}</span>
                              <span className="block text-amber-700 font-extrabold">R$ {prod.promotionalPrice!.toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>R$ {prod.price.toFixed(2)}</span>
                          )}
                        </td>
                        <td className="p-4 sm:p-5">
                          {prod.stock > 0 ? (
                            <span className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                              {prod.stock} unidades
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-800 font-bold px-2.5 py-1 rounded-md text-[10px]">
                              Esgotado!
                            </span>
                          )}
                        </td>
                        <td className="p-4 sm:p-5 space-y-1">
                          {/* Lists tags */}
                          <div className="flex flex-wrap gap-1">
                            {prod.isFeatured && <span className="bg-amber-100 text-[9px] font-bold px-1.5 rounded-sm">Destaque</span>}
                            {prod.isWeeklyNew && <span className="bg-[#FFDEFA] text-[9px] font-bold px-1.5 rounded-sm">Novidade</span>}
                            {prod.isGift && <span className="bg-[#E0F4FF] text-[9px] font-bold px-1.5 rounded-sm">Presente</span>}
                            {prod.isKit && <span className="bg-[#FFF89A] text-[9px] font-bold px-1.5 rounded-sm">Kit</span>}
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-right space-x-1.5">
                          <button
                            onClick={() => openProductForm(prod)}
                            className="p-2 hover:bg-neutral-100 rounded-lg text-buendia-navy"
                            title="Editar especificações"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 hover:bg-rose-50 rounded-lg text-rose-500"
                            title="Remover produto do Supabase"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. CATEGORIES & SUB-CATEGORIES SECTION TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left panel: Category managers with sorting positioning */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#FCFBF7] p-4 rounded-2xl border">
              <span className="text-xs font-bold text-buendia-navy">Organização de Linhas Principais</span>
              <button
                onClick={() => openCategoryForm()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-buendia-navy text-white text-xs font-bold rounded-full"
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar Categoria
              </button>
            </div>

            {/* Category Form Setup */}
            {catFormOpen && (
              <form onSubmit={handleSaveCategory} className="bg-white rounded-3xl p-5 border border-buendia-navy/10 space-y-4 shadow-md">
                <h4 className="font-display font-semibold text-xs text-buendia-navy uppercase tracking-wider">
                  {editingCategory ? `Editar Linha: ${editingCategory.name}` : 'Criar Nova Categoria Principal'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-buendia-navy mb-1.5">Nome Lindo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Scrapbook"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-buendia-navy mb-1.5">Ícone Emoji *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 🎨"
                      value={catIcon}
                      onChange={(e) => setCatIcon(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-buendia-navy mb-1.5">Texto de Apoio (Descrição)</label>
                  <input
                    type="text"
                    placeholder="Ex: Fitas washi tapes e colecionáveis..."
                    value={catDesc}
                    onChange={(e) => setCatDesc(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-buendia-navy mb-1.5">Imagem Unsplash/Mídia URL</label>
                    <input
                      type="text"
                      placeholder="Em branco para sugestão automática"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-buendia-navy mb-1.5">Banner Gigante opcional</label>
                    <input
                      type="text"
                      placeholder="Em branco para sugestão automática"
                      value={catBanner}
                      onChange={(e) => setCatBanner(e.target.value)}
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setCatFormOpen(false)}
                    className="py-1.5 px-3 hover:bg-neutral-50 text-xs text-[#7E8B99] font-bold"
                  >
                    Recusar
                  </button>
                  <button
                    type="submit"
                    className="py-1.5 px-4 bg-buendia-navy text-white text-xs font-bold rounded-xl"
                  >
                    Salvar no Sistema
                  </button>
                </div>
              </form>
            )}

            {/* List with Up & Down ordering controllers */}
            <div className="bg-white rounded-3xl border border-buendia-navy/5 shadow-2xs divide-y divide-neutral-100">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 flex items-center justify-between text-xs text-buendia-navy">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <strong className="block">{cat.name}</strong>
                      <span className="text-[10px] text-[#7E8B99] block font-medium">{cat.description || 'Sem descrição específica'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Reordering indicators */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveCategory(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 hover:bg-neutral-100 text-[#7E8B99] disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1 hover:bg-neutral-100 text-[#7E8B99] disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => openCategoryForm(cat)}
                      className="p-2 hover:bg-neutral-50 rounded-md"
                      title="Especificações"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-md"
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right panel: Subcategories list (can configure unlimited and link to categories) */}
          <div className="space-y-6">
            
            <form onSubmit={handleSaveSubcategory} className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-buendia-navy">Cadastrar Subcategoria Ilimitada</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Categoria Vinculada *</label>
                  <select
                    required
                    value={subCategoryId}
                    onChange={(e) => setSubCategoryId(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5 text-buendia-navy focus:outline-hidden"
                  >
                    <option value="">Escolha...</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Nome da Subcategoria *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tape Grid Pastel"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5 text-buendia-navy focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-buendia-navy text-white text-xs font-bold rounded-xl hover:bg-opacity-95"
              >
                Vincular Subcategoria
              </button>
            </form>

            {/* List subcategories tree */}
            <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#7E8B99]">Subcategorias Vinculadas</h4>
              
              <div className="divide-y divide-neutral-100 max-h-80 overflow-y-auto">
                {subcategories.map((sub) => {
                  const parent = categories.find(c => c.id === sub.categoryId);
                  return (
                    <div key={sub.id} className="py-2.5 flex justify-between items-center text-xs text-buendia-navy">
                      <div>
                        <strong className="block text-[#7E8B99] font-medium">{parent?.name || 'Não atribuída'}</strong>
                        <span className="block font-bold">{sub.name}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="text-rose-500 hover:text-rose-700 p-1.5"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 4. COUPONS MANAGEMENT */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <form onSubmit={handleSaveCoupon} className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4 h-fit">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-buendia-navy">Fabricar Cupom de Desconto</h4>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Código Único *</label>
              <input
                type="text"
                required
                placeholder="Ex: QUEROLEVEZA"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5 uppercase text-buendia-navy"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Formato Desconto</label>
                <select
                  value={newCouponType}
                  onChange={(e) => setNewCouponType(e.target.value as any)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                >
                  <option value="percent">Porcentagem %</option>
                  <option value="fixed">Reais Fixo R$</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Valor desconto *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 10 ou 15.00"
                  value={newCouponVal}
                  onChange={(e) => setNewCouponVal(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Compra Mínima R$</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Limite de Usos Totais</label>
                <input
                  type="number"
                  required
                  value={newCouponLimit}
                  onChange={(e) => setNewCouponLimit(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Data de Expiração</label>
              <input
                type="date"
                value={newCouponExpiry}
                onChange={(e) => setNewCouponExpiry(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5 text-buendia-navy"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-buendia-navy text-white text-xs font-bold rounded-xl"
            >
              Lançar Cupom no Sistema
            </button>
          </form>

          {/* List of active Coupons */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#7E8B99] mb-4">Cupons Ativos na Loja</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.code}
                  className="bg-[#FCFBF7] p-5 rounded-2xl border border-dashed flex flex-col justify-between"
                >
                  <div className="space-y-1.5 text-xs text-buendia-navy">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-sm bg-amber-100 px-2.5 py-0.5 rounded-sm">{coupon.code}</span>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.code)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="font-bold">
                      Desconto:{' '}
                      <span className="text-amber-700">
                        {coupon.type === 'percent' ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#7E8B99]">
                      Compra mínima necessária: R$ {coupon.minPurchase.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-[#7E8B99]">
                      Limitação de uso: {coupon.timesUsed} / {coupon.usageLimit}
                    </div>
                    <div className="text-[10px] text-[#7E8B99]">
                      Válido até: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 5. GLOBL SETTINGS / BRAND EDITOR / HOME DINÂMICA */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Config links & numbers */}
          <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4 h-fit">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-buendia-navy">Dados de Atendimento e Redes</h4>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Nome Oficial / Logo texto</label>
              <input
                type="text"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
              />
            </div>

            {/* Logo Image Uploader */}
            <div className="border border-buendia-navy/5 bg-[#FCFBF7] p-4 rounded-2xl relative space-y-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy">Logo Oficial (Fazer Upload da Imagem)</label>
              
              {logoImageUrl ? (
                <div className="relative w-32 h-32 mx-auto rounded-xl overflow-hidden border border-neutral-200 bg-white group shadow-xs">
                  <img src={logoImageUrl} alt="Logo Oficial" className="w-full h-full object-contain p-2" />
                  <button
                    type="button"
                    onClick={() => setLogoImageUrl('')}
                    className="absolute inset-0 bg-black/60 text-white text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer"
                  >
                    Remover Logo
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="border-2 border-dashed border-buendia-navy/10 hover:border-buendia-navy/30 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white flex flex-col items-center justify-center gap-1.5"
                >
                  <FolderSync className="h-6 w-6 text-[#7E8B99]" />
                  <span className="text-xs font-semibold text-buendia-navy text-center">Selecionar imagem de Logo</span>
                  <span className="text-[9px] text-[#7E8B99] text-center">PNG ou JPEG (fundo transparente é ideal)</span>
                </div>
              )}
              
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      const url = await db.uploadProductImage(e.target.files[0]);
                      setLogoImageUrl(url);
                    } catch (err) {
                      alert('Falha ao enviar imagem da logo!');
                    }
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">WhatsApp oficial (Apenas números com DDD)</label>
              <input
                type="text"
                value={wpp}
                onChange={(e) => setWpp(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5 flex items-center justify-between">
                <span>Instagram username (sem @)</span>
                <span className="text-[9px] lowercase italic text-sky-600">instagram_handle</span>
              </label>
              <input
                type="text"
                value={insta}
                onChange={(e) => setInsta(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Telefone de Contato (Exibição)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Endereço da Loja (Para Impressão e Contato)</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
              />
            </div>

            {/* Faixa do Topo (Cupom de Boas-vindas) */}
            <div className="pt-4 border-t border-dashed border-neutral-200/60 space-y-3">
              <strong className="block font-display text-[10px] text-buendia-navy uppercase tracking-wider">Faixa do Topo (Promoção)</strong>
              
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#7E8B99] mb-1 font-sans">Texto Principal</label>
                <input
                  type="text"
                  value={topBarText}
                  onChange={(e) => setTopBarText(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                  placeholder="ex: Produtos Únicos & Papelaria Criativa 🌼 Use o Cupom"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-[#7E8B99] mb-1 font-sans font-sans">Cupom (Destaque)</label>
                <input
                  type="text"
                  value={topBarCoupon}
                  onChange={(e) => setTopBarCoupon(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs font-mono font-bold border rounded-xl p-2.5"
                  placeholder="ex: BEMVINDA"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-[#7E8B99] mb-1 font-sans">Sufixo do Texto</label>
                <input
                  type="text"
                  value={topBarSuffix}
                  onChange={(e) => setTopBarSuffix(e.target.value)}
                  className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                  placeholder="ex: para R$ 15,00 OFF!"
                />
              </div>
            </div>

            <button
              onClick={handleSaveGlobalSettings}
              className="w-full py-3 bg-buendia-navy hover:bg-opacity-95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1"
            >
              <Save className="h-4 w-4" /> Salvar Configurações
            </button>
          </div>

          {/* Right panel: Home Dinêmica / Section reordering & Banner setups */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Carousel editor */}
            <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#7E8B99]">Editor Visual dos Banners Rotativos (Carrossel)</h4>
              
              <div className="space-y-4 divide-y divide-neutral-100">
                {/* Banner 1 */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy block mb-2 font-sans">Banner 1: Papelaria Coreana</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 flex gap-1.5 items-center">
                      <input 
                        type="text" 
                        placeholder="URL da imagem..." 
                        value={banner1} 
                        onChange={e => setBanner1(e.target.value)} 
                        className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2 flex-grow" 
                      />
                      <label className="bg-buendia-navy hover:bg-opacity-90 text-white text-[10px] font-bold px-2.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0" title="Fazer Upload de Arquivo">
                        <Upload className="h-3.5 w-3.5" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => { if (e.target.files && e.target.files[0]) uploadBannerImage(e.target.files[0], setBanner1); }} 
                        />
                      </label>
                    </div>
                    <input type="text" placeholder="Título..." value={bannerTitle1} onChange={e => setBannerTitle1(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                    <input type="text" placeholder="Subtítulo..." value={bannerSubtitle1} onChange={e => setBannerSubtitle1(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                  </div>
                </div>

                {/* Banner 2 */}
                <div className="pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy block mb-2 font-sans">Banner 2: Planejadores Notion</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 flex gap-1.5 items-center">
                      <input 
                        type="text" 
                        placeholder="URL da imagem..." 
                        value={banner2} 
                        onChange={e => setBanner2(e.target.value)} 
                        className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2 flex-grow" 
                      />
                      <label className="bg-buendia-navy hover:bg-opacity-90 text-white text-[10px] font-bold px-2.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0" title="Fazer Upload de Arquivo">
                        <Upload className="h-3.5 w-3.5" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => { if (e.target.files && e.target.files[0]) uploadBannerImage(e.target.files[0], setBanner2); }} 
                        />
                      </label>
                    </div>
                    <input type="text" placeholder="Título..." value={bannerTitle2} onChange={e => setBannerTitle2(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                    <input type="text" placeholder="Subtítulo..." value={bannerSubtitle2} onChange={e => setBannerSubtitle2(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                  </div>
                </div>

                {/* Banner 3 */}
                <div className="pt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-buendia-navy block mb-2 font-sans">Banner 3: Kits e Afeto</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 flex gap-1.5 items-center">
                      <input 
                        type="text" 
                        placeholder="URL da imagem..." 
                        value={banner3} 
                        onChange={e => setBanner3(e.target.value)} 
                        className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2 flex-grow" 
                      />
                      <label className="bg-buendia-navy hover:bg-opacity-90 text-white text-[10px] font-bold px-2.5 py-2.5 rounded-xl cursor-pointer flex items-center justify-center shrink-0" title="Fazer Upload de Arquivo">
                        <Upload className="h-3.5 w-3.5" />
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={e => { if (e.target.files && e.target.files[0]) uploadBannerImage(e.target.files[0], setBanner3); }} 
                        />
                      </label>
                    </div>
                    <input type="text" placeholder="Título..." value={bannerTitle3} onChange={e => setBannerTitle3(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                    <input type="text" placeholder="Subtítulo..." value={bannerSubtitle3} onChange={e => setBannerSubtitle3(e.target.value)} className="bg-[#FCFBF7] text-[10px] border rounded-xl p-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Home Dinâmica blocks reordering */}
            <div className="bg-white rounded-3xl p-6 border border-buendia-navy/5 shadow-2xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-[#7E8B99] flex items-center justify-between">
                <span>Editor Home Dinâmica: Organizar Seções de Venda</span>
                <span className="text-[9px] lowercase italic text-amber-700">edite o texto diretamente no input</span>
              </h4>

              <div className="space-y-2.5">
                {secOrder.map((section, idx) => (
                  <div
                    key={section.id}
                    className="p-3 bg-[#FCFBF7] rounded-xl border flex items-center justify-between text-xs text-buendia-navy"
                  >
                    <div className="flex items-center gap-2.5 flex-grow max-w-sm mr-2">
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 h-5 w-5 rounded-full flex items-center justify-center border border-amber-200 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-grow flex flex-col gap-1">
                        <input
                          type="text"
                          value={section.title}
                          onChange={e => handleUpdateSectionTitle(section.id, e.target.value)}
                          className="bg-white border border-neutral-200 hover:border-neutral-300 focus:border-buendia-navy rounded-lg px-2 py-1 text-xs text-buendia-navy w-full font-bold focus:outline-hidden"
                          placeholder="Título da Seção..."
                        />
                        {section.sourceType && (
                          <div className="text-[8px] bg-sky-50 text-sky-700 border border-sky-100 px-1.5 py-0.5 rounded-sm w-fit uppercase font-mono tracking-wider font-extrabold select-none">
                            Filtro: {section.sourceType}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`px-3 py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-full border cursor-pointer select-none ${
                          section.enabled
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {section.enabled ? 'Ativa ●' : 'Inativa ✕'}
                      </button>

                      <div className="flex gap-1 items-center">
                        <button
                          onClick={() => moveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 hover:bg-neutral-100 disabled:opacity-30 text-[#7E8B99]"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveSection(idx, 'down')}
                          disabled={idx === secOrder.length - 1}
                          className="p-1 hover:bg-neutral-100 disabled:opacity-30 text-[#7E8B99]"
                        >
                          ▼
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          className="p-1 hover:bg-rose-50 text-rose-500 hover:text-rose-700 ml-1 rounded-md"
                          title="Excluir Seção de Venda"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to Register New Section */}
              <div className="mt-6 pt-5 border-t border-dashed border-neutral-200 space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#7E8B99] block font-display">Cadastrar Nova Seção de Vendas</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold uppercase text-buendia-navy mb-1">Título da Seção</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Ofertas Especiais, Coleção Escritório..." 
                      value={newSectionTitle} 
                      onChange={e => setNewSectionTitle(e.target.value)} 
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5" 
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold uppercase text-buendia-navy mb-1">Origem dos Mimos (Status ou Categoria)</label>
                    <select 
                      value={newSectionSourceType} 
                      onChange={e => setNewSectionSourceType(e.target.value)} 
                      className="w-full bg-[#FCFBF7] text-xs border rounded-xl p-2.5"
                    >
                      <option value="novidades">Novidades da Semana</option>
                      <option value="destaques">Destaques com Amor</option>
                      <option value="presentes">Opções de Presentes</option>
                      <option value="kits">Kits Exclusivos</option>
                      <option value="mais_vendidos">Mais Vendidos</option>
                      
                      <optgroup label="Filtrar por Categorias Ativas">
                        {categories.filter(c => c.active).map(cat => (
                          <option key={cat.id} value={cat.id}>Categoria: {cat.name}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                >
                  <Plus className="h-4 w-4" /> Cadastrar Seção de Vendas
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 🧾 HIDDEN INVOICE SECTION (USED SEAMLESSLY VIA STANDARD WINDOW.PRINT IN COOPERATION WITH BROWSER INTERACTIVE PDF PROCESSORS) */}
      {selectedOrder && (
        <div className="hidden print:block fixed inset-0 bg-white z-50 p-12 text-black leading-relaxed font-sans text-xs">
          {/* Invoice header logo */}
          <div className="border-b-2 border-neutral-300 pb-6 mb-6 flex justify-between items-start">
            <div className="flex items-center gap-4">
              {settings?.logoImageUrl && (
                <img src={settings.logoImageUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl border p-1 bg-white" />
              )}
              <div>
                <h1 className="font-sans font-black text-2xl text-buendia-navy tracking-tight">🌼 {settings?.logo || 'Buendía Papelaria'}</h1>
                <p className="text-neutral-600 text-[10px] max-w-sm mt-1 leading-normal font-sans">
                  {settings?.address || 'Rua Buendia, nº 100 - Papelaria Criativa'} <br />
                  WhatsApp: {settings?.whatsappNumber || settings?.phoneNumber || '(11) 99999-9999'} | Instagram: @{settings?.instagramHandle || 'buendia.papelaria'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="font-sans font-extrabold text-base text-neutral-800 tracking-wider">CUPOM DE RECONHECIMENTO DE PEDIDO</h2>
              <span className="font-mono font-bold text-sm text-[#7E8B99]">Código: {selectedOrder.orderNumber}</span> <br />
              <span className="text-[10px] text-[#7E8B99] font-sans">Data Emissão: {new Date(selectedOrder.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedOrder.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</span>
            </div>
          </div>

          {/* Client summary */}
          <div className="grid grid-cols-2 gap-8 bg-neutral-50 p-5 rounded-2xl border mb-6 text-neutral-800 font-sans">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#7E8B99] block font-bold mb-1">DADOS DA CLIENTE AMADA</span>
              <div className="font-extrabold text-neutral-900">{selectedOrder.customerName}</div>
              <div className="text-[10px]">Celular/WhatsApp: {selectedOrder.customerPhone || 'Não informado'}</div>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-[#7E8B99] block font-bold mb-1">TRANSAÇÃO E ENVIO</span>
              <div className="text-[10px]">Forma de Pagamento: <strong className="font-extrabold underline">{selectedOrder.paymentMethod}</strong></div>
              <div className="text-[10px]">Status do Pedido: <span className="font-bold px-1 rounded-sm bg-neutral-200 capitalize text-neutral-800 text-[9px]">{selectedOrder.status.replace('_', ' ')}</span></div>
            </div>
          </div>

          {/* Table list items */}
          <table className="w-full text-left border-collapse mb-8 text-neutral-00 font-sans">
            <thead>
              <tr className="border-b-2 border-neutral-300 text-[#7E8B99] uppercase text-[9px] tracking-wider font-bold">
                <th className="py-2.5 font-bold">Mimo / Caneta / Item Descrição</th>
                <th className="py-2.5 text-center font-bold">Quant.</th>
                <th className="py-2.5 text-right font-bold">Preço Unitário</th>
                <th className="py-2.5 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-neutral-800">
              {selectedOrder.items.map((item, index) => (
                <tr key={index} className="py-3">
                  <td className="py-3">
                    <strong className="block text-neutral-900 font-bold">{item.productName}</strong>
                    {(item.selectedColor || item.selectedSize) && (
                      <span className="text-[9px] text-amber-700 font-medium">
                        Opção selecionada: {[item.selectedColor, item.selectedSize].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {item.observation && <p className="text-[9px] italic text-[#7E8B99] font-normal mt-0.5">- Obs: "{item.observation}"</p>}
                  </td>
                  <td className="py-3 text-center font-mono font-bold text-neutral-900">{item.quantity}</td>
                  <td className="py-3 text-right font-mono text-neutral-700">R$ {item.price.toFixed(2)}</td>
                  <td className="py-3 text-right font-mono font-bold text-neutral-900">R$ {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Total display */}
          <div className="w-1/2 ml-auto text-right space-y-2 border-t-2 border-neutral-300 pt-4 text-xs font-bold text-neutral-800 font-sans">
            <div className="flex justify-between font-normal text-neutral-500">
              <span>Soma dos itens:</span>
              <span className="font-mono">R$ {selectedOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-neutral-900 pt-2 border-t border-dashed">
              <span>VALOR LÍQUIDO TOTAL:</span>
              <span className="font-mono">R$ {selectedOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer message of love */}
          <div className="absolute bottom-12 inset-x-12 border-t border-neutral-300 pt-6 text-center text-[10px] text-neutral-500 leading-relaxed font-sans">
            <p className="font-extrabold text-neutral-800 text-[11px] mb-1">Obrigada pela sua preferência! Buendía - Papelaria</p>
            <p className="font-medium text-neutral-600">Este cupom foi gerado com as informações oficiais para conferência e empacotamento dos seus produtos. Esperamos que goste de cada detalhe da sua encomenda!</p>
          </div>
        </div>
      )}

    </div>
  );
}
