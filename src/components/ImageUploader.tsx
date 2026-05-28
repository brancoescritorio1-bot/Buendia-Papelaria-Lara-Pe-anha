/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 5,
}: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFiles = async (files: FileList) => {
    if (images.length >= maxImages) return;
    setCompressing(true);

    const uploadedUrls: string[] = [];
    
    // Upload files sequentially with simulated automatic compression
    for (let i = 0; i < files.length; i++) {
      if (images.length + uploadedUrls.length >= maxImages) break;
      const file = files[i];

      // File format guards
      if (!file.type.startsWith('image/')) continue;

      try {
        // High fidelity automatic optimizing & storage upload
        const publicUrl = await db.uploadProductImage(file);
        uploadedUrls.push(publicUrl);
      } catch (err) {
        console.error('Falha no upload da imagem:', err);
      }
    }

    onChange([...images, ...uploadedUrls]);
    setCompressing(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFiles(e.target.files);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(images.filter((_, idx) => idx !== indexToRemove));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4 select-none">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-buendia-navy">
        Gestão de Imagens Estilo Pinterest ({images.length}/{maxImages})
      </label>

      {/* Drag center */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
          dragActive
            ? 'border-buendia-navy bg-[#E0F4FF]/30'
            : 'border-buendia-navy/10 hover:border-buendia-navy/30 bg-[#FCFBF7]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFileInputChange}
        />

        {compressing ? (
          <div className="space-y-2">
            <Sparkles className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs font-semibold text-buendia-navy">Compactando e otimizando com Inteligência...</p>
            <p className="text-[10px] text-[#7E8B99]">Salvando no Supabase Storage de Buendía</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="h-8 w-8 text-[#7E8B99] mx-auto group-hover:text-buendia-navy transition-colors" />
            <p className="text-xs font-semibold text-buendia-navy">Arrastar imagens ou clicar para upload</p>
            <p className="text-[10px] text-[#7E8B99]">Tamanho recomendado: quadrado 1:1, comprimidas automaticamente</p>
          </div>
        )}
      </div>

      {/* Thumbnail Previews Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 p-3 bg-[#FCFBF7] rounded-3xl border border-buendia-navy/5">
          {images.map((img, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-white group shadow-3xs">
              <img src={img} alt="" className="w-full h-full object-cover" />
              
              {/* Overlay with cover text */}
              {idx === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-buendia-navy/80 text-white text-[8px] uppercase tracking-wider font-bold py-1 text-center font-display leading-none">
                  Capa
                </span>
              )}

              {/* Remove bubble */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(idx);
                }}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-rose-500 transition-colors"
                title="Remover imagem"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Graceful tip */}
      {images.length === 0 && (
        <div className="flex items-center gap-1.5 text-[10px] text-[#7E8B99] bg-[#FCFBF7] p-3 rounded-2xl">
          <AlertCircle className="h-3.5 w-3.5 text-[#7E8B99]" />
          <span>Arraste ou selecione suas fotos reais anexadas para cadastrar seu produto diretamente, sem Inteligência Artificial ou alterações automáticas! 💛</span>
        </div>
      )}
    </div>
  );
}
