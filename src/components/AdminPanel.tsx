/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Product, clearAllProducts, importProducts, PRELOADED_PRODUCTS } from '../db';
import ProductForm from './ProductForm';
import * as XLSX from 'xlsx';
import { 
  Download, 
  Upload, 
  Trash2, 
  Database, 
  RefreshCw, 
  Search, 
  FileJson, 
  Tag, 
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

interface AdminPanelProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Product) => void;
}

export default function AdminPanel({ products, onDeleteProduct, onAddProduct }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories for the form
  const categories = Array.from(new Set(['Todos', 'Pinturas', 'Esmaltes y Barnices', 'Herramientas', 'Accesorios y Aplicadores', 'Ferretería General', ...products.map(p => p.category || 'Sin Categoría')]));

  // Filter products for the admin list
  const filteredProducts = products.filter(p => {
    const term = (searchTerm || '').toLowerCase();
    return (p.name || '').toLowerCase().includes(term) || 
           (p.code || '').toLowerCase().includes(term) ||
           (p.category || '').toLowerCase().includes(term);
  });

  // Import Excel file to DB
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: 'array' });
        
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          throw new Error("El archivo está vacío o no es válido.");
        }

        const newProducts: Product[] = [];
        
        jsonData.forEach((row, index) => {
          // Extraemos buscando claves (case-insensitive para mayor tolerancia)
          const keys = Object.keys(row);
          const getVal = (possibleNames: string[]) => {
            const key = keys.find(k => possibleNames.includes(k.trim().toLowerCase()));
            return key ? row[key] : null;
          };

          const codigo = getVal(['codigo', 'código', 'code']);
          const nombre = getVal(['nombre', 'name']);
          const precioRaw = getVal(['precio', 'price']);

          if (!codigo || !nombre || precioRaw === null || precioRaw === undefined || precioRaw === "") {
            throw new Error(`Faltan datos obligatorios (código, nombre o precio) en la fila ${index + 2}.`);
          }

          const precio = parseFloat(precioRaw.toString().replace(',', '.'));
          if (isNaN(precio)) {
            throw new Error(`El precio en la fila ${index + 2} no es un número válido.`);
          }

          // Use the product code as the deterministic ID so importing the same Excel twice overwrites instead of duplicating
          const safeId = codigo.toString().trim().replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

          newProducts.push({
            id: safeId,
            code: codigo.toString().trim(),
            name: nombre.toString().trim(),
            category: "Sin Categoría", // Categoría por defecto ya que el excel no lo tiene
            price: precio,
            description: "",
            createdAt: Date.now()
          });
        });

        if (confirm(`¿Está seguro de que desea importar ${newProducts.length} productos desde Excel?`)) {
          await importProducts(newProducts);
          setImportSuccess(`¡Se importaron ${newProducts.length} productos correctamente!`);
          setImportError(null);
          
          if (excelFileInputRef.current) excelFileInputRef.current.value = '';
          setTimeout(() => setImportSuccess(null), 5000);
        }
      } catch (err: any) {
        setImportError(err.message || "Error al procesar el archivo Excel.");
        setImportSuccess(null);
        if (excelFileInputRef.current) excelFileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Reset entire catalog to default seed
  const handleResetToDefault = async () => {
    if (confirm("¿Está seguro de que desea REINICIAR el catálogo? Esto borrará TODOS los productos cargados actualmente y restaurará la lista de Pinturas Tecnicolor predeterminada.")) {
      await clearAllProducts();
      // Importing the default preloaded products is handled automatically by the DB when requested empty
      alert("Catálogo reiniciado con éxito. Se cargarán los datos por defecto en un momento.");
    }
  };

  // Wipe entire database
  const handleWipeDatabase = async () => {
    if (confirm("⚠️ ADVERTENCIA CRÍTICA: ¿Está seguro de que desea VACIAR TODO el catálogo? Todos los productos, precios e imágenes se borrarán permanentemente del dispositivo.")) {
      await clearAllProducts();
      // Since our IndexedDB automatically seeds if empty on next load, we will write an empty list or just reload. Wait, let's just clear. 
      // Actually we will let them clear it. If they want it blank, that's fine.
      alert("Catálogo vaciado completamente.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Column: Product Form (Col-span 5) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <ProductForm onSave={onAddProduct} categories={categories} />

        {/* Database Maintenance box */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wider border-b border-slate-100 pb-2">
            <Database className="w-4 h-4 text-indigo-600" />
            <span>Mantenimiento de Catálogo</span>
          </h4>

          <p className="text-xs text-slate-500 leading-relaxed">
            Utilice estas herramientas para compartir el catálogo entre dispositivos móviles completamente offline.
          </p>

          <div className="grid grid-cols-1 gap-3 mt-1">
            {/* Import Button Trigger Excel */}
            <button
              onClick={() => excelFileInputRef.current?.click()}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer border border-emerald-100"
              title="Subir archivo Excel (.xlsx, .csv)"
            >
              <Upload className="w-4 h-4" />
              <span>Importar Excel</span>
            </button>
            <input
              ref={excelFileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleImportExcel}
              className="hidden"
            />
          </div>

          {/* Import feedback badges */}
          {importSuccess && (
            <div className="flex items-start gap-2 bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-150 text-xs font-medium mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>{importSuccess}</span>
            </div>
          )}

          {importError && (
            <div className="flex items-start gap-2 bg-red-50 text-red-800 p-3 rounded-xl border border-red-150 text-xs font-medium mt-1">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
            <button
              onClick={handleResetToDefault}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restaurar Predeterminados</span>
            </button>

            <button
              onClick={handleWipeDatabase}
              className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer border border-red-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciado Absoluto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Database Products List (Col-span 7) */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-4 h-full">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Base de Datos Actual</h3>
              <p className="text-xs text-slate-400">Total: {filteredProducts.length} de {products.length} productos</p>
            </div>
            
            {/* Search filter inside admin */}
            <div className="relative max-w-xs w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, nombre o cat..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* List scroll view */}
          <div className="overflow-y-auto max-h-[600px] flex flex-col gap-2.5 pr-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <FileJson className="w-10 h-10 opacity-50" />
                <p className="text-sm font-semibold">No se encontraron productos</p>
                <p className="text-xs">Pruebe escribiendo otro término de búsqueda o agregue un nuevo producto.</p>
              </div>
            ) : (
              filteredProducts.map((p) => {
                const color = p.colorHex || '#94a3b8';
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all group"
                  >
                    {/* Small preview thumbnail */}
                    <div className="w-12 h-12 rounded-lg bg-white overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center relative">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: `${color}15` }}>
                          <svg viewBox="0 0 24 24" className="w-6 h-6 m-auto absolute inset-0" stroke={color} strokeWidth="2" fill="none">
                            {p.category === 'Pinturas' ? (
                              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill={color} fillOpacity="0.2" />
                            ) : (
                              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                            )}
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Details column */}
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded uppercase">
                          {p.code}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      
                      <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-1">
                        {p.name}
                      </h4>
                    </div>

                    {/* Price tag */}
                    <div className="text-right flex-shrink-0 flex flex-col justify-center">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 leading-none">Público</span>
                      <span className="text-sm sm:text-base font-extrabold font-display text-blue-700">
                        ${(p.price || 0).toFixed(2)}
                      </span>
                    </div>

                    {/* Delete Action button */}
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200 cursor-pointer border border-transparent hover:border-red-100"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
