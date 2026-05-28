/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { Category, Subcategory } from '../types';

interface CategoryNavProps {
  categories: Category[];
  subcategories: Subcategory[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
  onSelectSubcategory: (id: string | null) => void;
}

export default function CategoryNav({
  categories,
  subcategories,
  selectedCategoryId,
  selectedSubcategoryId,
  onSelectCategory,
  onSelectSubcategory,
}: CategoryNavProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter subcategories that belong to the currently selected category
  const activeSubcategories = selectedCategoryId
    ? subcategories.filter(sub => sub.categoryId === selectedCategoryId && sub.active)
    : [];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none animate-fade-in">
      {/* Category circle grid with bento spacing */}
      <h3 className="text-center font-display text-sm sm:text-base tracking-tight text-buendia-navy font-semibold mb-6">
        Navegue pelas Coleções Buendía
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {/* All / View everything card */}
        <motion.div
          onClick={() => {
            onSelectCategory(null);
            onSelectSubcategory(null);
          }}
          className={`relative cursor-pointer p-5 rounded-[28px] transition-all border text-center flex flex-col items-center justify-center overflow-hidden h-28 ${
            selectedCategoryId === null
              ? 'bg-buendia-navy text-white border-buendia-navy shadow-md'
              : 'bg-white text-buendia-navy border-gray-100 hover:shadow-sm hover:border-buendia-navy/20'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="font-sans font-semibold text-xs tracking-wide">Todos os Mimos</span>
        </motion.div>

        {/* Dynamic Category loops */}
        {categories.filter(c => c.active).map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          // Assign pastel theme backgrounds based on index or custom styling
          const bgColors = ['bg-[#FDE2E4]/40', 'bg-[#D1E9F6]/40', 'bg-[#FFF1C1]/30', 'bg-sky-50'];
          const categoryColorIdx = cat.name.charCodeAt(0) % bgColors.length;

          return (
            <motion.div
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubcategory(null);
              }}
              className={`relative cursor-pointer p-4 rounded-[28px] transition-all border text-center flex flex-col items-center justify-center h-28 overflow-hidden ${
                isSelected
                  ? 'bg-buendia-navy text-white border-buendia-navy shadow-md'
                  : `bg-white text-buendia-navy border-gray-100 hover:shadow-sm hover:border-buendia-navy/20`
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredId(cat.id)}
              onHoverEnd={() => setHoveredId(null)}
            >
              {/* Soft decorative background circle when not selected */}
              {!isSelected && (
                <div className={`absolute -right-3 -bottom-3 w-16 h-16 rounded-full ${bgColors[categoryColorIdx]} -z-0 blur-xs transition-transform duration-500 ${
                  hoveredId === cat.id ? 'scale-125' : ''
                }`} />
              )}

              <div className="relative z-10">
                <span className="block font-sans font-semibold text-xs tracking-wide">{cat.name}</span>
                {cat.description && (
                  <span className={`block text-[8px] mt-1 line-clamp-2 ${isSelected ? 'text-white/70' : 'text-[#7E8B99]'}`}>
                    {cat.description}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Subcategory Pill menus with spring animation */}
      {selectedCategoryId && activeSubcategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-2xl mx-auto py-3 px-4 bg-[#F9F9F9] rounded-2xl border border-gray-100"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7E8B99] px-2 border-r border-gray-200 mr-1.5 matches">
            Coleção:
          </span>

          {/* All Subcategory option */}
          <button
            onClick={() => onSelectSubcategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              selectedSubcategoryId === null
                ? 'bg-buendia-navy text-white font-semibold'
                : 'text-buendia-navy hover:bg-white'
            }`}
          >
            Todos
          </button>

          {activeSubcategories.map((sub) => {
            const isSubSelected = selectedSubcategoryId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSubSelected
                    ? 'bg-[#D1E9F6] text-buendia-navy border border-gray-100 font-semibold'
                    : 'text-[#7E8B99] hover:text-buendia-navy hover:bg-white'
                }`}
              >
                {sub.name}
              </button>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
