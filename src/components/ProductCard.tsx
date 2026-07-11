/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../db';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  onClick: (product: Product) => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
  const isPaint = 
    product.category === 'Pinturas' || 
    product.category === 'Esmaltes y Barnices' || 
    product.iconType === 'paint';
  
  const color = product.colorHex || '#3b82f6';

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onClick(product)}
      className="group bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer flex flex-col items-center text-center h-full"
    >
      {/* Product Image / Visual Area (Geometric container) */}
      <div className="w-full aspect-square bg-slate-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-slate-100 relative flex-shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* Dynamic visual placeholder tailored to Pinturas Tecnicolor */
          isPaint ? (
            <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden transition-colors" style={{ backgroundColor: `${color}08` }}>
              {/* Geometric paint bucket representation resembling the theme mock */}
              <div 
                className="w-20 h-24 rounded-sm shadow-inner relative transition-transform duration-500 group-hover:scale-105" 
                style={{ backgroundColor: color }}
              >
                {/* Can cap / highlights representing high quality lacquer paint */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/20 rounded-xs" />
                {/* Label detail */}
                <div className="absolute bottom-4 left-0 right-0 h-4 bg-white/80 flex items-center justify-center">
                  <span className="text-[7px] font-bold text-slate-800 tracking-wider">TECNICOLOR</span>
                </div>
              </div>

              {/* Color Hex Tag */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                <span className="text-[9px] font-mono tracking-wider font-semibold uppercase px-2 py-0.5 rounded-sm bg-white text-slate-700 shadow-xs border border-slate-150" style={{ borderLeftColor: color, borderLeftWidth: '3px' }}>
                  {color}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-50 p-4">
              <div className="p-4 rounded-xl bg-white shadow-xs border border-slate-100 transition-transform duration-500 group-hover:scale-110">
                {product.iconType === 'brush' ? (
                  <svg viewBox="0 0 24 24" className="w-10 h-10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m14 6-4.5 4.5" />
                    <path d="M11 15h3.5" />
                    <path d="M12 11h3.5" />
                    <path d="M14.5 14h2.5" />
                    <path d="M15 18h2.5" />
                    <path d="M18 10h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1" />
                    <path d="M18 6h1a2 2 0 0 1 2 2v2" />
                    <path d="M3.5 19.5a1.5 1.5 0 0 0 2 0l7.5-7.5-2-2-7.5 7.5a1.5 1.5 0 0 0 0 2z" />
                  </svg>
                ) : product.iconType === 'roller' ? (
                  <svg viewBox="0 0 24 24" className="w-10 h-10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="16" height="6" rx="1" />
                    <path d="M6 10v7a2 2 0 0 0 2 2h3" />
                    <path d="M18 7v2" />
                    <path d="M11 17h11" />
                  </svg>
                ) : product.iconType === 'tape' ? (
                  <svg viewBox="0 0 24 24" className="w-10 h-10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-10 h-10" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                )}
              </div>
            </div>
          )
        )}
        
        {/* Category Tag overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2 py-0.5 text-[9px] font-bold tracking-widest bg-slate-900/80 backdrop-blur-xs text-white rounded-md uppercase">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Titles & Specifications */}
      <div className="flex flex-col items-center flex-grow w-full">
        <h3 className="font-bold text-slate-800 text-sm leading-snug mb-1 uppercase tracking-tight line-clamp-2 h-10 flex items-center justify-center text-center group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        
        <p className="text-[10px] text-slate-400 font-bold mb-3 uppercase tracking-wider font-mono">
          Ref: {product.code}
        </p>

        {/* Pricing Zone */}
        <div className="mt-auto pt-3 border-t border-slate-100 w-full flex flex-col items-center">
          <span className="text-2xl font-black text-blue-700 font-display">
            ${(product.price || 0).toFixed(2)}
          </span>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            Precio Unitario Público
          </p>
        </div>
      </div>
    </div>
  );
}
