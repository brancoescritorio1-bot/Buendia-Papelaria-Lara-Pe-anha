/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MessageSquare, Sparkles } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
}

export default function WhatsAppButton({ phoneNumber }: WhatsAppButtonProps) {
  const cleanWpp = phoneNumber.replace(/\D/g, '');
  const introMsg = encodeURIComponent('Olá, Lara! Estive navegando na Buendía e gostaria de tirar algumas dúvidas sobre os produtos de papelaria.');
  const wppUrl = `https://wa.me/55${cleanWpp}?text=${introMsg}`;

  return (
    <a
      href={wppUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 bg-[#FCFBF7] text-buendia-navy hover:text-amber-700 p-3 sm:p-4 rounded-full shadow-lg border border-buendia-navy/10 hover:border-amber-200 transition-all hover:scale-105 select-none animate-fade-in no-print"
      title="Falar com Lara no WhatsApp"
    >
      {/* Decorative pulse ring */}
      <span className="absolute -inset-1 rounded-full bg-[#FFF89A]/30 group-hover:bg-[#FFF89A]/50 animate-ping -z-10" />

      {/* Floating icon */}
      <div className="relative">
        <MessageSquare className="h-5.5 w-5.5 text-buendia-navy group-hover:rotate-6 transition-transform" />
        <span className="absolute -top-1.5 -right-1 bg-amber-400 h-2.5 w-2.5 rounded-full border border-white animate-pulse" />
      </div>

      <span className="font-display font-semibold text-xs pr-1 hidden sm:inline-block">
        Falar com Lara
      </span>
    </a>
  );
}
