/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useDeferredValue, useMemo } from 'react';
import { Product, subscribeToProducts, addProduct, deleteProduct } from './db';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import AdminPanel from './components/AdminPanel';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  HelpCircle, 
  Store, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Load products via Realtime Subscription on mount
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToProducts((data) => {
      setProducts(data);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddProduct = async (newProduct: Product) => {
    try {
      await addProduct(newProduct);
      // State is updated automatically by subscribeToProducts!
    } catch (err) {
      console.error("Error al guardar producto:", err);
      alert("Hubo un error al guardar el producto en la nube.");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("¿Está seguro de que desea eliminar este producto del catálogo?")) {
      try {
        await deleteProduct(id);
        // State is updated automatically by subscribeToProducts!
      } catch (err) {
        console.error("Error al eliminar producto:", err);
        alert("Hubo un error al eliminar el producto de la nube.");
      }
    }
  };

  // Extract all unique categories present in the products list
  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category || 'Sin Categoría')))];

  // Filtering Logic with Debounce (Deferred Value) and Memoization for Performance
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = (deferredSearchQuery || '').toLowerCase();
      const matchesSearch = 
        (p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q);
      
      const matchesCategory = selectedCategory === 'Todos' || (p.category || 'Sin Categoría') === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, deferredSearchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-600/10 selection:text-blue-700">
      {/* Header */}
      <Header 
        isAdminMode={isAdminMode} 
        onToggleAdminMode={() => setIsAdminMode(!isAdminMode)} 
        productCount={products.length} 
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
        
        {isLoading ? (
          /* Loading State */
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-slate-500 font-semibold text-sm">Cargando base de datos offline...</p>
          </div>
        ) : isAdminMode ? (
          /* Admin / Management Panel */
          <AdminPanel 
            products={products} 
            onDeleteProduct={handleDeleteProduct} 
            onAddProduct={handleAddProduct} 
          />
        ) : (
          /* Main Catalog / Sellers View with Geometric Balance Split Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Sidebar - Search, Categories & DB Sync Status card */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              {/* Search Widget */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Buscar Producto</h2>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escriba código o nombre..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-slate-800 font-semibold"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Selector Menu */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Líneas de Pintura</h2>
                
                <div className="flex flex-col gap-1.5">
                  {categories.map((cat) => {
                    const count = cat === 'Todos' 
                      ? products.length 
                      : products.filter(p => p.category === cat).length;
                    const isSelected = selectedCategory === cat;

                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none border text-left ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {/* Dot decoration */}
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isSelected ? 'bg-blue-400' : 'bg-slate-300'
                          }`} />
                          <span className="truncate">{cat}</span>
                        </div>
                        
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black min-w-[1.5rem] text-center ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Database sync status & Offline disclaimer card (Geometric Balance Bottom Card) */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md border border-slate-700/30">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
                    Sincronización Cloud OK
                  </h3>
                </div>
                
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  Catálogo conectado en tiempo real. Los cambios se reflejarán instantáneamente en todos los dispositivos. 100% disponible sin conexión.
                </p>

                <div className="mt-4 pt-3 border-t border-slate-700/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Modo Firebase</span>
                  <span className="text-emerald-400">Conectado</span>
                </div>
              </div>
            </aside>

            {/* Right Main Canvas - Grid and filtering feedback */}
            <section className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Filter outcomes header banner */}
              <div className="flex items-center justify-between bg-white border border-slate-200 px-5 py-3.5 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="text-slate-800">Línea seleccionada:</span>
                  <span className="text-blue-600 uppercase tracking-wider">{selectedCategory}</span>
                </div>
                <div className="text-xs font-bold text-slate-400">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'} encontrados
                </div>
              </div>

              {/* Catalog Grid */}
              {filteredProducts.length === 0 ? (
                /* Catalog Empty State */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs py-20 px-6 flex flex-col items-center justify-center text-center gap-4">
                  <div className="p-4 bg-amber-50 rounded-full text-amber-500">
                    <Store className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">No se encontraron productos</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      No hay resultados que coincidan con &quot;{searchQuery}&quot; en esta categoría. Intente limpiar su búsqueda.
                    </p>
                  </div>
                  {(searchQuery || selectedCategory !== 'Todos') && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('Todos');
                      }}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-800 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Ver Todo el Catálogo
                    </button>
                  )}
                </div>
              ) : (
                /* Product Cards Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onClick={(p) => setSelectedProduct(p)} 
                    />
                  ))}
                </div>
              )}

            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-500 py-6 border-t border-slate-800 text-center text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pinturas Tecnicolor. Todos los derechos reservados.</p>
          <p className="font-mono text-[10px] text-slate-600">Base de datos Cloud & Offline (Firebase) • Version 2.0.0</p>
        </div>
      </footer>

      {/* Detail Modal Overlay */}
      <ProductDetailModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </div>
  );
}
