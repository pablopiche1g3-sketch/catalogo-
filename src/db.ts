/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, deleteDoc, writeBatch, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db as firestoreDb } from './firebase';

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

const COLLECTION_NAME = 'products';

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

// Subscribe to real-time updates
export function subscribeToProducts(callback: (products: Product[]) => void): () => void {
  const q = query(collection(firestoreDb, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push(doc.data() as Product);
    });
    
    // Si la base de datos está completamente vacía (y no solo cargando cache), poblamos por defecto
    if (products.length === 0 && !snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
      seedDefaultProducts().catch(console.error);
    }
    
    callback(products);
  }, (error) => {
    console.error("Error suscribiendose a productos:", error);
  });
}

// Fallback promise function if needed
export async function getAllProducts(): Promise<Product[]> {
  const q = query(collection(firestoreDb, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  const products: Product[] = [];
  snapshot.forEach((doc) => products.push(doc.data() as Product));
  return products;
}

export async function seedDefaultProducts(): Promise<void> {
  const batch = writeBatch(firestoreDb);
  PRELOADED_PRODUCTS.forEach((product) => {
    const docRef = doc(collection(firestoreDb, COLLECTION_NAME), product.id);
    batch.set(docRef, product);
  });
  await batch.commit();
}

export async function addProduct(product: Product): Promise<void> {
  const docRef = doc(collection(firestoreDb, COLLECTION_NAME), product.id);
  await setDoc(docRef, product);
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(collection(firestoreDb, COLLECTION_NAME), id);
  await deleteDoc(docRef);
}

export async function clearAllProducts(): Promise<void> {
  const snapshot = await getDocs(collection(firestoreDb, COLLECTION_NAME));
  const batch = writeBatch(firestoreDb);
  snapshot.forEach((docSnapshot) => {
    batch.delete(docSnapshot.ref);
  });
  await batch.commit();
}

export async function importProducts(products: Product[]): Promise<void> {
  // Firestore limit is 500 operations per batch
  const chunks = [];
  for (let i = 0; i < products.length; i += 500) {
    chunks.push(products.slice(i, i + 500));
  }
  
  for (const chunk of chunks) {
    const batch = writeBatch(firestoreDb);
    chunk.forEach((product) => {
      const docRef = doc(collection(firestoreDb, COLLECTION_NAME), product.id);
      batch.set(docRef, product);
    });
    await batch.commit();
  }
}
