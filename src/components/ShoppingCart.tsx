/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, Trash2, ArrowRight, Tag, HelpCircle, Check, AlertCircle } from 'lucide-react';
import { CartItem, Coupon, Order, OrderItem } from '../types';
import { useAuth } from '../lib/auth';
import { db } from '../lib/db';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  coupons: Coupon[];
  whatsappNumber: string;
}

export default function ShoppingCart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  coupons,
  whatsappNumber,
}: ShoppingCartProps) {
  const { user } = useAuth();
  
  // Local checkout fields for seamless purchase without strict login
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Pix' | 'cartão' | 'dinheiro' | 'transferência'>('Pix');
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'details' | 'success'>('cart');

  // Coupon application state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Generated Order store
  const [generatedOrder, setGeneratedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  // Pricing math calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.product.promotionalPrice || item.product.price;
    return acc + (price * item.quantity);
  }, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.value / 100);
    } else {
      discount = Math.min(subtotal, appliedCoupon.value);
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Por favor, digite o código do cupom.');
      return;
    }

    const matched = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim());

    if (!matched) {
      setCouponError('Cupom não encontrado.');
      return;
    }

    if (!matched.active) {
      setCouponError('Este cupom não está mais ativo.');
      return;
    }

    // Expiration date checks
    if (matched.expiresAt && new Date(matched.expiresAt).getTime() < new Date().getTime()) {
      setCouponError('Este cupom já expirou.');
      return;
    }

    // Minimum subtotal check
    if (matched.minPurchase && subtotal < matched.minPurchase) {
      setCouponError(`Compra mínima necessária de R$ ${matched.minPurchase.toFixed(2)}.`);
      return;
    }

    // Limit usage checks
    if (matched.usageLimit && matched.timesUsed >= matched.usageLimit) {
      setCouponError('Este cupom atingiu o limite de usos.');
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(`Cupom ${matched.code} aplicado: ` + 
      (matched.type === 'percent' ? `${matched.value}% de desconto!` : `R$ ${matched.value.toFixed(2)} de desconto!`));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const validateAndProceed = () => {
    if (cartItems.length === 0) return;
    
    if (user) {
      // If user is already logged in with Clerk simulation, skip detail filling step
      handleFinalizeCheckout(user.fullName, user.phone, user.email);
    } else {
      setCheckoutStep('details');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone) return;
    handleFinalizeCheckout(guestName, guestPhone, guestEmail);
  };

  const handleFinalizeCheckout = async (name: string, phone: string, email?: string) => {
    try {
      // 1. Build order items
      const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.promotionalPrice || item.product.price,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        observation: item.observation,
      }));

      // 2. Generate custom Order Structure
      const orderPayload: Omit<Order, 'orderNumber'> = {
        id: `ord-${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date().toISOString(),
        customerName: name,
        customerPhone: phone,
        items: orderItems,
        total: finalTotal,
        status: 'aguardando_whatsapp',
        paymentMethod: paymentMethod as any,
        history: [
          { status: 'pendente', timestamp: new Date().toISOString(), note: 'Pedido rascunhado no carrinho' },
          { status: 'aguardando_whatsapp', timestamp: new Date().toISOString(), note: 'Aguardando contato pelo WhatsApp da proprietária' }
        ]
      };

      // 3. Save Order inside Supabase fallbacked db schema
      const created = await db.createOrder(orderPayload);
      setGeneratedOrder(created);

      // 4. If coupon was applied, increment coupon counter
      if (appliedCoupon) {
        await db.incrementCouponUsage(appliedCoupon.code);
      }

      // 5. Generate formatted WhatsApp text message
      let msg = `Olá, Buendía - Lara Peçanha\nGostaria de finalizar meu pedido:\n\nNÚMERO DO PEDIDO: ${created.orderNumber}\n\nITENS DO CARRINHO:\n`;
      
      created.items.forEach((item, index) => {
        msg += `• *${item.productName}*\n`;
        if (item.selectedColor) msg += `  Cor: ${item.selectedColor}\n`;
        if (item.selectedSize) msg += `  Atributo: ${item.selectedSize}\n`;
        if (item.observation) msg += `  Obs: _"${item.observation}"_\n`;
        msg += `  Qtd: ${item.quantity} x R$ ${item.price.toFixed(2)}\n\n`;
      });

      if (appliedCoupon) {
        msg += `Cupom: ${appliedCoupon.code} (-R$ ${discount.toFixed(2)})\n`;
      }
      
      msg += `Total estimado: R$ ${created.total.toFixed(2)}\n`;
      msg += `Forma de pagamento desejada: ${paymentMethod}\n\n`;
      msg += `Cliente: *${name}*\n`;
      msg += `Telefone: *${phone}*\n`;
      if (email) msg += `Email: ${email}\n`;
      msg += `\nAguardo atendimento`;

      // 6. Deep link redirect
      const cleanWpp = whatsappNumber.replace(/\D/g, '');
      const encodedMsg = encodeURIComponent(msg);
      const wppUrl = `https://wa.me/55${cleanWpp}?text=${encodedMsg}`;

      setCheckoutStep('success');
      
      // Delay to allow success layout state to animate, then open new tab
      setTimeout(() => {
        window.open(wppUrl, '_blank');
      }, 1500);

    } catch (err) {
      console.error(err);
    }
  };

  const resetAfterSuccess = () => {
    onClearCart();
    setCheckoutStep('cart');
    setGuestName('');
    setGuestPhone('');
    setGuestEmail('');
    setAppliedCoupon(null);
    setCouponCode('');
    setGeneratedOrder(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop visual layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (checkoutStep !== 'success') onClose();
          }}
          className="absolute inset-0 bg-black/45 backdrop-blur-xs"
        />

        {/* Sidebar container */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-buendia-navy/5"
        >
          {/* Header area of drawer */}
          <div className="p-6 border-b border-buendia-navy/5 flex items-center justify-between bg-[#FCFBF7]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-buendia-navy" />
              <h3 className="font-display font-semibold text-base text-buendia-navy">Seu Carrinho</h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-[#7E8B99] transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Core Body switcher (Cart -> Details Form -> Success) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {checkoutStep === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="h-80 flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-xs text-[#7E8B99] max-w-[200px] leading-relaxed">
                      Seu carrinho está vazio. Adicione alguns produtos para começar seu dia!
                    </p>
                    <button
                      onClick={onClose}
                      className="text-xs font-bold text-buendia-navy hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Voltar a navegar <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const itemPrice = item.product.promotionalPrice || item.product.price;
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 p-4 rounded-2xl bg-[#FCFBF7] border border-buendia-navy/5 hover:border-buendia-navy/15 transition-all"
                        >
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover bg-white"
                          />

                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-buendia-navy truncate">{item.product.name}</h4>
                            
                            {/* Attributes display */}
                            {(item.selectedColor || item.selectedSize) && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {item.selectedColor && (
                                  <span className="bg-[#FFDEFA] text-buendia-navy text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase">
                                    Cor: {item.selectedColor}
                                  </span>
                                )}
                                {item.selectedSize && (
                                  <span className="bg-[#E0F4FF] text-buendia-navy text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase">
                                    Atributo: {item.selectedSize}
                                  </span>
                                )}
                              </div>
                            )}

                            {item.observation && (
                              <p className="text-[10px] text-amber-700 font-medium italic truncate mt-1">
                                Obs: "{item.observation}"
                              </p>
                            )}

                            {/* Counter and deletes row */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-buendia-navy/5 rounded-full p-0.5 bg-white">
                                <button
                                  onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="px-2 text-xs hover:text-amber-700"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-buendia-navy w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => onUpdateQuantity(item.id, Math.min(item.product.stock || 99, item.quantity + 1))}
                                  className="px-2 text-xs hover:text-amber-700"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => onRemoveItem(item.id)}
                                className="text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Remover item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <span className="text-xs font-bold text-buendia-navy">
                            R$ {(itemPrice * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}

                    {/* Coupons Box */}
                    <div className="pt-4 border-t border-neutral-100">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-2">Cupom de Desconto</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Ex: BUENDIA10"
                            disabled={!!appliedCoupon}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 pl-9 focus:ring-1 focus:ring-buendia-navy/30 focus:outline-hidden disabled:opacity-50"
                          />
                          <Tag className="absolute left-3 top-3.5 h-3.5 w-3.5 text-[#7E8B99]" />
                        </div>
                        {appliedCoupon ? (
                          <button
                            onClick={handleRemoveCoupon}
                            className="bg-neutral-100 hover:bg-neutral-200 text-buendia-navy text-xs font-bold px-4 rounded-2xl transition-colors cursor-pointer"
                          >
                            Remover
                          </button>
                        ) : (
                          <button
                            onClick={handleApplyCoupon}
                            className="bg-buendia-navy text-white text-xs font-bold px-4 rounded-2xl hover:bg-opacity-95 transition-colors cursor-pointer"
                          >
                            Aplicar
                          </button>
                        )}
                      </div>

                      {couponError && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {couponError}
                        </p>
                      )}
                      {couponSuccess && (
                        <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1 animate-fade-in">
                          <Check className="h-3 w-3" /> {couponSuccess}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {checkoutStep === 'details' && (
              <form onSubmit={handleDetailsSubmit} className="space-y-4 animate-fade-in">
                <div className="bg-[#E0F4FF]/50 border border-buendia-blue/30 rounded-2xl p-4 text-xs text-buendia-navy leading-relaxed">
                  <strong>Não precisa de senha!</strong>
                  <p className="mt-1">
                    Preencha estes dados simples para organizar seu pedido e formatar sua mensagem de checkout para o WhatsApp de Lara!
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Seu Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Amanda Silva"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">WhatsApp / Celular com DDD *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: (38) 99999-0449"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Seu Email</label>
                  <input
                    type="email"
                    placeholder="Ex: amanda@gmail.com (opcional)"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full bg-[#FCFBF7] text-xs text-buendia-navy border border-buendia-navy/10 rounded-2xl p-3 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy mb-1.5">Forma de pagamento sugerida</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Pix', 'cartão', 'dinheiro', 'transferência'].map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method as any)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                          paymentMethod === method
                            ? 'bg-buendia-navy text-white'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 py-3 px-4 border border-buendia-navy/10 rounded-xl text-xs font-bold text-buendia-navy hover:bg-neutral-50"
                  >
                    Voltar ao carrinho
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-buendia-navy text-white rounded-xl text-xs font-bold hover:bg-opacity-95"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </form>
            )}

            {checkoutStep === 'success' && (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <h4 className="font-display font-semibold text-lg text-buendia-navy">
                  Transações Prontas!
                </h4>
                <p className="text-xs text-[#7E8B99] px-6 leading-relaxed">
                  O pedido <strong>{generatedOrder?.orderNumber}</strong> foi gerado com sucesso no nosso estoque. Uma nova guia está se abrindo com sua mensagem integrada!
                </p>

                <div className="bg-[#FCFBF7] rounded-3xl p-5 border border-buendia-navy/5 text-left text-xs text-buendia-navy space-y-2 mt-4 max-w-xs mx-auto">
                  <div><strong>NÚMERO DO PEDIDO:</strong> {generatedOrder?.orderNumber}</div>
                  <div><strong>CLIENTE:</strong> {generatedOrder?.customerName}</div>
                  <div><strong>TOTAL ESTIMADO:</strong> R$ {generatedOrder?.total.toFixed(2)}</div>
                  <div><strong>STATUS ATUAL:</strong> <span className="bg-amber-100 px-2 py-0.5 rounded-sm text-amber-700 font-semibold">{generatedOrder?.status}</span></div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={resetAfterSuccess}
                    className="inline-flex items-center gap-2 font-display font-semibold text-xs text-buendia-navy border-b border-buendia-navy pb-0.5 hover:text-amber-700 hover:border-amber-700 transition-colors"
                  >
                    Concluir & Seguir Comprando
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Fixed bottom footer with subtotals */}
          {cartItems.length > 0 && checkoutStep === 'cart' && (
            <div className="p-6 border-t border-buendia-navy/5 bg-[#FCFBF7] space-y-4 shadow-3xs">
              <div className="space-y-1.5 text-xs text-buendia-navy">
                <div className="flex justify-between">
                  <span className="text-buendia-gray">Subtotal os produtos:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Desconto aplicado:</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-buendia-navy pt-2 border-t border-buendia-navy/5">
                  <span>Total estimado:</span>
                  <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Purchase completion triggers */}
              <div className="space-y-2 pt-2">
                
                {/* Checkout step toggle conditional pricing and customer setup */}
                {!user && (
                  <div className="flex items-center justify-between gap-1 pb-1">
                    <span className="text-[10px] text-[#7E8B99]">Adorei, mas deseja pagar com o Pix ou cartão?</span>
                    <button
                      onClick={() => setCheckoutStep('details')}
                      className="text-[10px] font-bold text-buendia-navy hover:underline"
                    >
                      Preencher dados
                    </button>
                  </div>
                )}

                <button
                  onClick={validateAndProceed}
                  className="w-full bg-buendia-navy text-white hover:bg-opacity-95 text-xs font-bold uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <span>Chamar Lara no WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-[9px] text-center text-[#7E8B99] leading-relaxed select-none">
                  Lara Peçanha retornará no WhatsApp logo em seguida para concluir seu pedido e opções de frete.
                </p>
              </div>
            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
