/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image?: string; // base64 representation of the uploaded image
  colorHex?: string; // Optional hex color for paint products to draw custom visual
  iconType?: 'paint' | 'brush' | 'tool' | 'hardware' | 'tape' | 'roller'; // Optional icon category
  createdAt: number;
}

const DB_NAME = 'TecnicolorCatalogDB';
const DB_VERSION = 1;
const STORE_NAME = 'products';

// Preloaded default catalog of Pinturas Tecnicolor
export const PRELOADED_PRODUCTS: Product[] = [
  {
    id: 'p1',
    code: 'PNT-LTE-001',
    name: 'Pintura Látex Premium - Blanco Puro',
    category: 'Pinturas',
    price: 28.50,
    description: 'Pintura de látex de alta calidad con excelente cubrimiento y acabado mate. Lavable y resistente a la intemperie.',
    colorHex: '#FFFFFF',
    iconType: 'paint',
    createdAt: Date.now()
  },
  {
    id: 'p2',
    code: 'PNT-LTE-002',
    name: 'Pintura Látex Premium - Azul Naval',
    category: 'Pinturas',
    price: 32.00,
    description: 'Tono azul profundo sofisticado, ideal para acentos en interiores y exteriores. Gran durabilidad y resistencia al sol.',
    colorHex: '#1B4D3E',
    iconType: 'paint',
    createdAt: Date.now() - 1000
  },
  {
    id: 'p3',
    code: 'PNT-LTE-003',
    name: 'Pintura Látex Premium - Amarillo Trópico',
    category: 'Pinturas',
    price: 29.90,
    description: 'Color amarillo vibrante y alegre. Excelente adherencia y rendimiento. Ideal para espacios activos y fachadas.',
    colorHex: '#FFCC00',
    iconType: 'paint',
    createdAt: Date.now() - 2000
  },
  {
    id: 'p4',
    code: 'PNT-ESM-001',
    name: 'Esmalte Anticorrosivo - Negro Mate',
    category: 'Esmaltes y Barnices',
    price: 14.50,
    description: 'Protección superior de doble acción: anticorrosivo y esmalte de acabado. Para estructuras metálicas expuestas.',
    colorHex: '#212121',
    iconType: 'paint',
    createdAt: Date.now() - 3000
  },
  {
    id: 'p5',
    code: 'PNT-ESM-002',
    name: 'Barniz Poliuretano Brillante - Caoba',
    category: 'Esmaltes y Barnices',
    price: 18.25,
    description: 'Protege y embellece la madera con un acabado brillante de alta resistencia al rayado y humedad. Tono caoba natural.',
    colorHex: '#8B0000',
    iconType: 'paint',
    createdAt: Date.now() - 4000
  },
  {
    id: 'f1',
    code: 'FER-HER-001',
    name: 'Martillo de Uña de Acero Templado 16oz',
    category: 'Herramientas',
    price: 15.75,
    description: 'Martillo forjado en una sola pieza de acero de alto carbono. Mango ergonómico de goma antideslizante para menor vibración.',
    iconType: 'tool',
    colorHex: '#E06666',
    createdAt: Date.now() - 5000
  },
  {
    id: 'f2',
    code: 'FER-HER-002',
    name: 'Juego de Destornilladores Pro (8 piezas)',
    category: 'Herramientas',
    price: 24.90,
    description: 'Puntas imantadas de acero cromo-vanadio. Incluye planos y Phillips con estuche organizador de alta resistencia.',
    iconType: 'tool',
    colorHex: '#4A90E2',
    createdAt: Date.now() - 6000
  },
  {
    id: 'f3',
    code: 'FER-ACC-001',
    name: 'Brocha de Cerdas Naturales 3"',
    category: 'Accesorios y Aplicadores',
    price: 3.50,
    description: 'Brocha premium con cerdas naturales firmemente sujetas. Retención excelente de pintura para acabados parejos.',
    iconType: 'brush',
    colorHex: '#F5B041',
    createdAt: Date.now() - 7000
  },
  {
    id: 'f4',
    code: 'FER-ACC-002',
    name: 'Rodillo Microfibra Profesional 9"',
    category: 'Accesorios y Aplicadores',
    price: 7.80,
    description: 'Rodillo antigoteo de alta absorción. Para superficies lisas y semirugosas. Incluye maneral de acero reforzado.',
    iconType: 'roller',
    colorHex: '#5DADE2',
    createdAt: Date.now() - 8000
  },
  {
    id: 'f5',
    code: 'FER-CNT-001',
    name: 'Cinta de Enmascarar (Masking Tape) 2"',
    category: 'Accesorios y Aplicadores',
    price: 2.95,
    description: 'Cinta de papel crepé de excelente adhesión. Se remueve limpiamente sin dejar residuos ni dañar las superficies pintadas.',
    iconType: 'tape',
    colorHex: '#F9E79F',
    createdAt: Date.now() - 9000
  },
  {
    id: 'f6',
    code: 'FER-TCN-001',
    name: 'Caja de Tornillos para Drywall 1-1/4" (100u)',
    category: 'Ferretería General',
    price: 4.80,
    description: 'Tornillos fosfatados negros autoperforantes de alta calidad. Cabeza trompeta y punta aguja.',
    iconType: 'hardware',
    colorHex: '#A6ACAF',
    createdAt: Date.now() - 10000
  }
];

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export function getAllProducts(): Promise<Product[]> {
  return initDB().then((db) => {
    return new Promise<Product[]>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const list = request.result || [];
        if (list.length === 0) {
          // If completely empty, we seed the default products to make the catalog instant!
          seedDefaultProducts(db)
            .then((seeded) => resolve(seeded))
            .catch(() => resolve([]));
        } else {
          resolve(list);
        }
      };
    });
  });
}

function seedDefaultProducts(db: IDBDatabase): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    PRELOADED_PRODUCTS.forEach((product) => {
      store.put(product);
    });

    transaction.oncomplete = () => {
      resolve(PRELOADED_PRODUCTS);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export function addProduct(product: Product): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(product);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  });
}

export function deleteProduct(id: string): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  });
}

export function clearAllProducts(): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  });
}

export function importProducts(products: Product[]): Promise<void> {
  return initDB().then((db) => {
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      products.forEach((product) => {
        store.put(product);
      });

      transaction.oncomplete = () => {
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  });
}
