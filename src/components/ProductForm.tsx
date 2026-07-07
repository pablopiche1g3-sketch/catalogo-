/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '../db';
import { Plus, Upload, X, Trash2, CheckCircle2, Paintbrush, Sliders } from 'lucide-react';

interface ProductFormProps {
  onSave: (product: Product) => void;
  categories: string[];
}

export default function ProductForm({ onSave, categories }: ProductFormProps) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Pinturas');
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [colorHex, setColorHex] = useState('#2563EB');
  const [iconType, setIconType] = useState<'paint' | 'brush' | 'tool' | 'hardware' | 'tape' | 'roller'>('paint');
  
  const [dragActive, setDragActive] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect icon type based on category
  useEffect(() => {
    const catLower = (isCustomCategory ? customCategory : category).toLowerCase();
    if (catLower.includes('pintura') || catLower.includes('esmalte') || catLower.includes('barniz')) {
      setIconType('paint');
    } else if (catLower.includes('brocha') || catLower.includes('pincel')) {
      setIconType('brush');
    } else if (catLower.includes('rodillo')) {
      setIconType('roller');
    } else if (catLower.includes('cinta') || catLower.includes('tape')) {
      setIconType('tape');
    } else if (catLower.includes('herramienta') || catLower.includes('llave') || catLower.includes('martillo') || catLower.includes('destornillador')) {
      setIconType('tool');
    } else {
      setIconType('hardware');
    }
  }, [category, customCategory, isCustomCategory]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen excede el límite de 2MB. Por favor elija una imagen más pequeña.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim() || !name.trim() || !price || isNaN(parseFloat(price))) {
      alert("Por favor rellene todos los campos obligatorios con valores válidos.");
      return;
    }

    const finalCategory = isCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      alert("Por favor ingrese o seleccione una categoría.");
      return;
    }

    const newProduct: Product = {
      id: 'prod_' + Math.random().toString(36).substring(2, 11),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category: finalCategory,
      price: parseFloat(price),
      description: description.trim(),
      image,
      colorHex: (iconType === 'paint') ? colorHex : undefined,
      iconType,
      createdAt: Date.now()
    };

    onSave(newProduct);

    // Reset Form
    setCode('');
    setName('');
    setPrice('');
    setDescription('');
    setImage(undefined);
    setCustomCategory('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Show Success Badge
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const isPaintCategory = category === 'Pinturas' || category === 'Esmaltes y Barnices' || (isCustomCategory && (customCategory.toLowerCase().includes('pintura') || customCategory.toLowerCase().includes('esmalte') || customCategory.toLowerCase().includes('barniz')));

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          <span>Agregar Nuevo Producto</span>
        </h3>
        
        {success && (
          <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>¡Producto Guardado!</span>
          </div>
        )}
      </div>

      {/* Field: Product Code */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Código del Producto <span className="text-red-500">*</span></span>
          <span className="text-[10px] text-slate-400 lowercase font-normal">ej: PNT-LTE-004</span>
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ej: PNT-LTE-004 o FER-HER-101"
          required
          className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-mono font-semibold"
        />
      </div>

      {/* Field: Product Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Nombre del Producto <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Pintura Látex Lavable Coral"
          required
          className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
        />
      </div>

      {/* Field: Category Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Categoría <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsCustomCategory(!isCustomCategory)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            {isCustomCategory ? "Elegir de lista" : "+ Crear nueva"}
          </button>
        </div>

        {isCustomCategory ? (
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Escriba nueva categoría..."
            required={isCustomCategory}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        ) : (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"
          >
            {categories.filter(cat => cat !== 'Todos').map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Row: Price & Colors */}
      <div className="grid grid-cols-2 gap-4">
        {/* Field: Public Price */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Precio Público ($) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">$</span>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>

        {/* Dynamic: Paint Color Picker or Generic Icon Selector */}
        {isPaintCategory ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Paintbrush className="w-3.5 h-3.5" />
              <span>Color Muestra</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 outline-none p-0"
                title="Elegir color muestra"
              />
              <input
                type="text"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                placeholder="#000000"
                className="w-full px-2.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Tipo de Ícono</span>
            </label>
            <select
              value={iconType}
              onChange={(e) => setIconType(e.target.value as any)}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none cursor-pointer"
            >
              <option value="tool">Herramienta (Martillo, etc.)</option>
              <option value="brush">Brocha</option>
              <option value="roller">Rodillo</option>
              <option value="tape">Cinta adhesiva</option>
              <option value="hardware">Ferretería General</option>
              <option value="paint">Bote de Pintura</option>
            </select>
          </div>
        )}
      </div>

      {/* Field: Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Descripción del Producto
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escriba especificaciones técnicas, rendimiento, secado, etc."
          rows={3}
          className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
        />
      </div>

      {/* Field: Image Upload Area */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Imagen del Producto (Opcional)
        </label>
        
        {image ? (
          <div className="relative rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden h-36 flex items-center justify-center">
            <img
              src={image}
              alt="Preview"
              className="max-h-full max-w-full object-contain"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 active:scale-95 transition-all shadow-md"
              title="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/50' 
                : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
            }`}
          >
            <div className="p-3 bg-white rounded-full shadow-xs text-slate-400">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Arrastra una imagen aquí o búscala</p>
              <p className="text-xs text-slate-400 mt-1">Soporta JPG, PNG (Max 2MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* Direct Camera Button for Mobile reps */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.setAttribute('capture', 'environment');
                fileInputRef.current?.click();
                fileInputRef.current?.removeAttribute('capture');
              }}
              className="mt-2 px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Usar Cámara Móvil</span>
            </button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
      >
        <Plus className="w-4 h-4" />
        <span>Agregar al Catálogo</span>
      </button>
    </form>
  );
}
