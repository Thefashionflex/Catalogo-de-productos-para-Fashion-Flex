export interface ProductImage {
  id: string; // Identificador único para la imagen (ej. UUID o nombre de archivo)
  url: string; // URL de la imagen (puede ser base64 para nuevas subidas)
  isMain: boolean; // True si es la imagen principal del producto
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string; // URL de la imagen principal (para compatibilidad con catálogo)
  images: ProductImage[]; // Array de todas las imágenes del producto
  spinImages?: ProductImage[]; // Array de imágenes para la vista 360° (opcional)
  price: string; // Precio de venta base.
  costPrice: number;
  stock: number;
  sku: string;
  categoryId: string; // ID de la categoría a la que pertenece
  categoryName?: string; // Nombre de la categoría (opcional, para UI)
  updatedAt: string; // Fecha de última actualización en formato ISO (e.g., new Date().toISOString())
  
  // Fields for variations
  sizes?: string[]; // Tallas disponibles para calzado (ej. ["24 MX", "24.5 MX"]) o ropa (ej. ["CH", "M", "G"])
  sizePrices?: { size: string; price: string }[]; // Precios específicos para diferentes tallas (Calzado, Ropa)
  volumeMl?: number; // Volumen principal/por defecto en mililitros para perfumes
  availableVolumesMl?: number[]; // Array de volúmenes disponibles para un perfume
  volumePrices?: { volume: number; price: string }[]; // Precios específicos para diferentes volúmenes de un perfume

  // New fields from detailed product form
  subcategoryId?: string;
  barcodeType?: 'EAN/GTIN' | 'UPC' | 'ISBN' | 'Otro' | '';
  eanGtin?: string;
  autoSku?: boolean; // For "Generar automáticamente SKU" toggle

  productCondition?: 'Nuevo' | 'Usado' | 'Reacondicionado' | '';
  unitType?: 'Paquete' | 'Par' | 'Pieza' | 'Set'; // Updated unit types
  brand?: string;
  // isUnbrandedOrKit?: boolean; // Removed this field

  hasVariations?: boolean; // Controls UI for variation setup (future)
  reservedStock?: number; // For display: Stock - Reserved = Disponible
  lowStockNotificationThreshold?: number;
}

export interface CatalogCategory {
  id: string;
  name: string;
  description: string; // Descripción de la categoría
  items: ProductItem[]; // Productos dentro de esta categoría
}

export interface CartItem extends ProductItem {
  cartItemId: string; // Identificador único para este item en el carrito (producto.id + variante)
  quantity: number;
  selectedSize?: string;
  selectedVolume?: number;
  selectedPrice: string; // Precio al momento de añadir al carrito
}

// New types for Order Management
export interface OrderItemDetails {
  productId: string;
  productName: string;
  imageUrl: string;
  quantity: number;
  priceAtPurchase: string; // Price per unit at time of purchase, e.g., "$50.00"
  selectedSize?: string;
  selectedVolume?: number;
}

export type OrderStatus = 'Enviado' | 'En espera de pago' | 'En espera de envío' | 'Cancelado' | 'Entregado';

export interface Order {
  id: string; // Unique order ID (e.g., "6578-4753")
  orderDate: string; // ISO date string
  customerName: string;
  items: OrderItemDetails[];
  status: OrderStatus;
  totalAmount: number; // Calculated total amount as a number
  shippingAddress?: string; 
  paymentMethod?: string; 
}