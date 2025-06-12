
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProductItem, ProductImage } from '../types';
import { useCart } from '../contexts/CartContext'; 
import { useCatalog } from '../contexts/CatalogDataContext'; // Import useCatalog

const ACCENT_COLOR = 'var(--accent-color-primary)';

interface ProductDetailModalProps {
  product: ProductItem; // Initial product data (might be slightly stale)
  onClose: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product: initialProduct, onClose }) => {
  const { addToCart, openCart } = useCart();
  const { getProductById } = useCatalog(); // Get live product data
  
  // Use live product data from context, fallback to initialProduct if not found (should always be found)
  const product = getProductById(initialProduct.id) || initialProduct;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  const galleryImages = product.images || [];
  const mainImage = galleryImages.find(img => img.isMain) || galleryImages[0];

  const [selectedSizeInModal, setSelectedSizeInModal] = useState<string | undefined>(() => {
    if ((product.categoryId === 'calzado' || product.categoryId === 'ropa') && product.sizes && product.sizes.length > 0) {
      return product.sizes[0];
    }
    return undefined;
  });

  const [selectedVolumeInModal, setSelectedVolumeInModal] = useState<number | undefined>(() => {
    if (product.categoryId === 'perfumes') {
      return product.volumeMl || (product.availableVolumesMl && product.availableVolumesMl.length > 0 ? product.availableVolumesMl[0] : undefined);
    }
    return undefined;
  });

  const [displayPrice, setDisplayPrice] = useState<string>(product.price);

  useEffect(() => {
    const mainImgIdx = galleryImages.findIndex(img => img.id === mainImage?.id);
    setCurrentImageIndex(mainImgIdx !== -1 ? mainImgIdx : 0);
  }, [product, galleryImages, mainImage]);

  useEffect(() => {
    let newPrice = product.price;
    if (product.categoryId === 'perfumes' && selectedVolumeInModal) {
        const volumePriceEntry = product.volumePrices?.find(vp => vp.volume === selectedVolumeInModal);
        if (volumePriceEntry) {
            newPrice = volumePriceEntry.price;
        } else if (product.volumeMl === selectedVolumeInModal) {
            newPrice = product.price;
        }
    }
    setDisplayPrice(newPrice);
  }, [product, selectedVolumeInModal]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (galleryImages.length > 1) {
      if (event.key === 'ArrowLeft') {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + galleryImages.length) % galleryImages.length);
      } else if (event.key === 'ArrowRight') {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % galleryImages.length);
      }
    }
  }, [onClose, galleryImages.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    modalContentRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const handleAddToCartClick = () => {
    if (product.stock <= 0) {
        alert(`${product.name} está agotado.`);
        return;
    }
    addToCart(product, 1, selectedSizeInModal, selectedVolumeInModal, displayPrice);
    openCart();
    onClose(); 
  };

  const isAddToCartDisabled = () => {
    if (product.stock <= 0) return true;
    if (product.categoryId === 'calzado' && product.sizes && product.sizes.length > 0 && !selectedSizeInModal) {
      return true;
    }
    if (product.categoryId === 'ropa' && product.sizes && product.sizes.length > 0 && !selectedSizeInModal) {
      return true;
    }
    if (product.categoryId === 'perfumes' && product.availableVolumesMl && product.availableVolumesMl.length > 0 && !selectedVolumeInModal) {
      return true;
    }
    return false;
  };

  if (!product) return null;
  const isOutOfStock = product.stock <= 0;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[70]" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="product-detail-title"
        onClick={onClose} 
    >
      <div 
        ref={modalContentRef}
        tabIndex={-1} 
        className={`bg-[var(--light-bg-alt)] p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col sm:flex-row gap-6 relative overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--accent-color-primary)] scrollbar-track-gray-100 ${isOutOfStock ? 'opacity-90' : ''}`}
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-2 rounded-full text-[var(--text-dark-secondary)] hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/50 z-10`}
          aria-label="Cerrar detalles del producto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full sm:w-1/2 flex flex-col items-center">
          <div className="relative w-full aspect-square mb-3 border border-gray-200/80 rounded-md overflow-hidden bg-gray-50">
            {galleryImages.length > 0 && (
              <img
                src={galleryImages[currentImageIndex]?.url || product.imageUrl}
                alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
            )}
            {galleryImages.length === 0 && (
                 <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain"
                />
            )}
            {isOutOfStock && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white text-sm font-bold uppercase px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg">
                    AGOTADO
                </span>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-1">
              {galleryImages.map((img, index) => (
                <button
                  key={img.id || `thumb-${index}`}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-14 h-14 rounded border-2 p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/70
                              ${index === currentImageIndex ? `border-[${ACCENT_COLOR}]` : 'border-gray-300 hover:border-gray-400'}`}
                  aria-label={`Ver imagen ${index + 1} de ${product.name}`}
                  disabled={isOutOfStock}
                >
                  <img src={img.url} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover rounded-sm" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full sm:w-1/2 flex flex-col">
          <h2 id="product-detail-title" className={`text-2xl lg:text-3xl font-bold text-[${ACCENT_COLOR}] mb-1 uppercase`}>
            {product.name}
          </h2>
          <p className="text-sm text-gray-500 mb-2">Disponible: {product.stock}</p>
          
          <div className="text-lg font-semibold text-[var(--text-dark-primary)] mb-3">
            {displayPrice}
          </div>

          <div className="mb-4 text-sm text-[var(--text-dark-secondary)] leading-relaxed overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-2 text-justify hyphens-auto">
            <h4 className="font-semibold text-[var(--text-dark-primary)] mb-1 uppercase">Descripción:</h4>
            {product.description || "No hay descripción disponible para este producto."}
          </div>
          
           <div className="mt-auto space-y-4 pt-4 border-t border-gray-200/80">
            {product.categoryId === 'calzado' && product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mr-2 uppercase font-medium">Selecciona Talla MX:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                {product.sizes.map(size => (
                    <button 
                        key={size}
                        onClick={() => setSelectedSizeInModal(size)}
                        className={`text-sm font-medium py-1.5 px-3 rounded-md transition-colors border
                                    ${selectedSizeInModal === size 
                                        ? 'bg-[var(--accent-color-primary)] text-white border-[var(--accent-color-primary)] ring-2 ring-offset-1 ring-[var(--accent-color-primary)]/50' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        aria-pressed={selectedSizeInModal === size}
                        aria-label={`Seleccionar talla ${size.replace(' MX','')}`}
                        disabled={isOutOfStock}
                    >
                        {size.replace(/\s*MX/i, '')}
                    </button>
                ))}
                </div>
              </div>
            )}
            {product.categoryId === 'ropa' && product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-sm text-gray-600 mr-2 uppercase font-medium">Selecciona Talla:</span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                {product.sizes.map(size => (
                    <button 
                        key={size}
                        onClick={() => setSelectedSizeInModal(size)}
                         className={`text-sm font-medium py-1.5 px-3 rounded-md transition-colors border
                                    ${selectedSizeInModal === size 
                                        ? 'bg-[var(--accent-color-primary)] text-white border-[var(--accent-color-primary)] ring-2 ring-offset-1 ring-[var(--accent-color-primary)]/50' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'}`}
                        aria-pressed={selectedSizeInModal === size}
                        aria-label={`Seleccionar talla ${size}`}
                        disabled={isOutOfStock}
                    >
                        {size}
                    </button>
                ))}
                </div>
              </div>
            )}
            {product.categoryId === 'perfumes' && product.availableVolumesMl && product.availableVolumesMl.length > 0 && (
                <div>
                    <span className="text-sm text-gray-600 mr-2 uppercase font-medium">Selecciona Volumen (ML):</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                    {product.availableVolumesMl.map(volume => (
                        <button
                            key={volume}
                            onClick={() => setSelectedVolumeInModal(volume)}
                            className={`text-sm font-medium py-1.5 px-3 rounded-md transition-colors border
                                    ${selectedVolumeInModal === volume 
                                        ? 'bg-[var(--accent-color-primary)] text-white border-[var(--accent-color-primary)] ring-2 ring-offset-1 ring-[var(--accent-color-primary)]/50' 
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 hover:border-gray-400'}`}
                            aria-pressed={selectedVolumeInModal === volume}
                            aria-label={`Seleccionar volumen ${volume}ML`}
                            disabled={isOutOfStock}
                        >
                            {volume}
                        </button>
                    ))}
                    </div>
                </div>
            )}

            <button
                onClick={handleAddToCartClick}
                disabled={isAddToCartDisabled()}
                className={`w-full border-2 border-[var(--accent-color-primary)] 
                        font-semibold py-2.5 px-4 rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] 
                        text-sm tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-[var(--accent-color-primary)]/70 
                        focus:ring-offset-1 focus:ring-offset-[var(--light-bg-alt)]
                        ${isAddToCartDisabled() 
                            ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed hover:bg-gray-300 hover:text-gray-500' 
                            : 'text-[var(--accent-color-primary)] hover:bg-[var(--accent-color-primary)] hover:text-white'}`}
                aria-label={isOutOfStock ? `${product.name} agotado` : `Añadir ${product.name} al carrito ${selectedSizeInModal ? `talla ${selectedSizeInModal}` : ''} ${selectedVolumeInModal ? `volumen ${selectedVolumeInModal}ML` : ''}`}
            >
                {isOutOfStock ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;