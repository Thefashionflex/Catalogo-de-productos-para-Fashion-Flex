import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProductImage } from '../types';

const ACCENT_COLOR = 'var(--accent-color-primary)';

interface ProductSpinViewerProps {
  images: ProductImage[];
  productName: string;
  onClose: () => void;
}

const ProductSpinViewer: React.FC<ProductSpinViewerProps> = ({ images, productName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [draggedDistance, setDraggedDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sensitivity = 20; // Pixels to drag to change image

  const totalImages = images.length;

  const handleInteractionStart = useCallback((clientX: number) => {
    if (totalImages <= 1) return;
    setIsDragging(true);
    setStartX(clientX);
    setDraggedDistance(0);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grabbing';
    }
  }, [totalImages]);

  const handleInteractionMove = useCallback((clientX: number) => {
    if (!isDragging || totalImages <= 1) return;

    const currentX = clientX;
    const dx = currentX - startX;
    setDraggedDistance(dx);

    const imageChanges = Math.floor(dx / sensitivity) * -1; // Invert for natural drag direction

    if (imageChanges !== 0) {
      let newIndex = (currentIndex + imageChanges) % totalImages;
      if (newIndex < 0) {
        newIndex = totalImages + newIndex;
      }
      setCurrentIndex(newIndex);
      setStartX(currentX); // Reset startX to prevent rapid cycling from a single large drag
    }
  }, [isDragging, startX, currentIndex, totalImages, sensitivity]);

  const handleInteractionEnd = useCallback(() => {
    if (totalImages <= 1) return;
    setIsDragging(false);
    setDraggedDistance(0);
    if (containerRef.current) {
      containerRef.current.style.cursor = 'grab';
    }
  }, [totalImages]);

  // Mouse events
  useEffect(() => {
    const currentContainerRef = containerRef.current;
    if (!currentContainerRef || totalImages <= 1) return;

    const onMouseDown = (e: MouseEvent) => handleInteractionStart(e.clientX);
    const onMouseMove = (e: MouseEvent) => handleInteractionMove(e.clientX);
    const onMouseUp = () => handleInteractionEnd();
    const onMouseLeave = () => handleInteractionEnd(); // Stop dragging if mouse leaves container

    currentContainerRef.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove); // Listen on window for smoother dragging
    window.addEventListener('mouseup', onMouseUp);
    currentContainerRef.addEventListener('mouseleave', onMouseLeave);

    return () => {
      currentContainerRef.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      currentContainerRef.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [handleInteractionStart, handleInteractionMove, handleInteractionEnd, totalImages]);

  // Touch events
  useEffect(() => {
    const currentContainerRef = containerRef.current;
    if (!currentContainerRef || totalImages <= 1) return;

    const onTouchStart = (e: TouchEvent) => handleInteractionStart(e.touches[0].clientX);
    const onTouchMove = (e: TouchEvent) => handleInteractionMove(e.touches[0].clientX);
    const onTouchEnd = () => handleInteractionEnd();

    currentContainerRef.addEventListener('touchstart', onTouchStart, { passive: false });
    currentContainerRef.addEventListener('touchmove', onTouchMove, { passive: false });
    currentContainerRef.addEventListener('touchend', onTouchEnd);
    currentContainerRef.addEventListener('touchcancel', onTouchEnd);

    return () => {
      currentContainerRef.removeEventListener('touchstart', onTouchStart);
      currentContainerRef.removeEventListener('touchmove', onTouchMove);
      currentContainerRef.removeEventListener('touchend', onTouchEnd);
      currentContainerRef.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [handleInteractionStart, handleInteractionMove, handleInteractionEnd, totalImages]);
  
  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (totalImages > 1) {
        if (event.key === 'ArrowLeft') {
          setCurrentIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
        } else if (event.key === 'ArrowRight') {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, totalImages]);


  if (totalImages === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[70]">
        <div className="bg-[var(--light-bg-alt)] p-6 rounded-lg shadow-xl text-center">
          <p className="text-[var(--text-dark-primary)] mb-4 uppercase">No hay imágenes de 360° para este producto.</p>
          <button
            onClick={onClose}
            className={`py-2 px-5 bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-semibold rounded-md shadow-sm uppercase`}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center p-4 z-[70]" role="dialog" aria-modal="true" aria-labelledby="spin-viewer-title">
      <div className="bg-[var(--light-bg-alt)] p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-xl relative">
        <h2 id="spin-viewer-title" className={`text-xl sm:text-2xl font-semibold text-[${ACCENT_COLOR}] mb-4 text-center truncate uppercase`}>{productName} - Vista 360°</h2>
        
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-2 rounded-full text-[var(--text-dark-secondary)] hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/50`}
          aria-label="Cerrar vista 360°"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div 
          ref={containerRef} 
          className="relative aspect-video w-full overflow-hidden rounded border border-gray-300/80 bg-gray-100 select-none"
          style={{ cursor: totalImages > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          tabIndex={0} // Make it focusable for keyboard events
          aria-roledescription="Visor de imagen giratoria"
          aria-label={`Imagen ${currentIndex + 1} de ${totalImages}. Arrastra o usa las flechas del teclado para rotar.`}
        >
          {images.map((image, index) => (
             <img
                key={image.id || `spin-${index}`}
                src={image.url}
                alt={`${productName} - Vista ${index + 1}`}
                className={`absolute top-0 left-0 w-full h-full object-contain transition-opacity duration-100 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                draggable="false"
             />
          ))}
           {totalImages > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-2 p-1.5 bg-black/40 rounded-full text-white text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M15.293 8.293a1 1 0 011.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L10 12.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(90 10 10)" />
                </svg>
                <span>{currentIndex + 1} / {totalImages}</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M4.707 11.707a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 7.414l-4.293 4.293a1 1 0 01-1.414 0z" clipRule="evenodd" transform="rotate(-90 10 10)" />
                </svg>
            </div>
          )}
        </div>
        
        {totalImages > 1 && (
          <p className="text-center text-xs text-[var(--text-dark-secondary)] mt-3 uppercase">
            Arrastra sobre la imagen o usa las flechas ← → para rotar.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductSpinViewer;