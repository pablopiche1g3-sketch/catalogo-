/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from '../db';
import { X, Copy, Check, Tag, Info, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(product.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPaint = 
    product.category === 'Pinturas' || 
    product.category === 'Esmaltes y Barnices' || 
    product.iconType === 'paint';
  
  const color = product.colorHex || '#475569';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100 flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left / Top Side: Visual */}
          <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[250px] md:min-h-full flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              isPaint ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden p-6" style={{ backgroundColor: `${color}10` }}>
                  <svg viewBox="0 0 100 100" className="w-36 h-36" style={{ color: color }}>
                    <path d="M22,38 C22,12 78,12 78,38" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3,3" className="opacity-60" />
                    <path d="M25,40 L75,40 L71,84 C71,87 62,89 50,89 C38,89 29,87 29,84 Z" fill="currentColor" opacity="0.12" stroke="currentColor" strokeWidth="2.5" />
                    <ellipse cx="50" cy="40" rx="25" ry="5" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M30,42 C30,42 34,53 41,53 C47,53 49,42 49,42 C49,42 51,59 58,59 C65,59 70,42 70,42" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                  </svg>
                  
                  <div className="mt-4 flex flex-col items-center">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Color Muestra</span>
                    <span className="text-sm font-mono tracking-wider font-bold uppercase px-3 py-1 mt-1.5 rounded-full bg-white text-slate-700 shadow-sm border border-slate-100" style={{ borderLeftColor: color, borderLeftWidth: '4px' }}>
                      {color}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative bg-slate-50 p-6">
                  <div className="p-6 rounded-3xl bg-white shadow-xs border border-slate-100">
                    {product.iconType === 'brush' ? (
                      <svg viewBox="0 0 24 24" className="w-20 h-20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
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
                      <svg viewBox="0 0 24 24" className="w-20 h-20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="16" height="6" rx="1" />
                        <path d="M6 10v7a2 2 0 0 0 2 2h3" />
                        <path d="M18 7v2" />
                        <path d="M11 17h11" />
                      </svg>
                    ) : product.iconType === 'tape' ? (
                      <svg viewBox="0 0 24 24" className="w-20 h-20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="w-20 h-20" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                      </svg>
                    )}
                  </div>
                  <div className="absolute bottom-4 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    {product.category}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right / Bottom Side: Content */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 rounded-full mb-3 uppercase tracking-wide">
                <span>{product.category}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-display leading-snug mb-3">
                {product.name}
              </h2>

              {/* Code with Copy Option */}
              <div className="flex items-center gap-2 mb-6 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <Tag className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">CÓDIGO:</span>
                <span className="text-sm font-mono font-bold text-slate-800 tracking-wide select-all">{product.code}</span>
                <button
                  onClick={handleCopyCode}
                  className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-200"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Descripción del Producto</span>
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>
            </div>

            {/* Price section & Bottom Close */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Precio de Venta al Público</span>
                <div className="flex items-baseline text-blue-700 font-bold font-display mt-0.5">
                  <span className="text-xl font-medium">$</span>
                  <span className="text-4xl">{(product.price || 0).toFixed(2).split('.')[0]}</span>
                  <span className="text-2xl">.{(product.price || 0).toFixed(2).split('.')[1]}</span>
                  <span className="text-xs font-bold text-slate-400 ml-2 uppercase tracking-wider">USD</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-98 rounded-xl shadow-xs transition-all duration-200 text-center uppercase tracking-wider text-xs"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
