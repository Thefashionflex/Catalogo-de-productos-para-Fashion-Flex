
import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { CATALOG_DATA } from '../constants'; // Replaced by useCatalog
import { ProductItem } from '../types';
import { useCart } from '../contexts/CartContext';
import { useCatalog } from '../contexts/CatalogDataContext'; // Import useCatalog
import CartIcon from './CartIcon';
import CartSidebar from './CartSidebar';
import WhatsAppButton from './WhatsAppButton';
import ProductSpinViewer from './ProductSpinViewer';
import ProductDetailModal from './ProductDetailModal';
import { Link } from 'react-router-dom';

const CURSOR_MAIN_SIZE = 20;
const CURSOR_TRAIL_BASE_SIZE = 8;

interface CardSelectedVariant {
  size?: string;
  volume?: number;
  price?: string;
}

const CatalogPage: React.FC = () => {
  const { catalog: catalogDataFromContext, getProductById } = useCatalog(); // Use catalog from context
  const [selectedProductForSpin, setSelectedProductForSpin] = useState<ProductItem | null>(null);
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<ProductItem | null>(null);
  const { addToCart, openCart } = useCart();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(catalogDataFromContext[0]?.id || null);
  const categoryRefs = useRef<(HTMLElement | null)[]>([]);
  const categoryHeaderCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const stickyNavRef = useRef<HTMLElement | null>(null); 
  const [navHeight, setNavHeight] = useState(0);

  const [cardSelectedVariants, setCardSelectedVariants] = useState<{ [productId: string]: CardSelectedVariant }>({});

  const cursorRef = useRef<HTMLDivElement | null>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const TRAIL_COUNT = 10;
  const FOLLOW_SPEED = 0.3;
  const cursorScale = useRef(1);
  const targetCursorScale = useRef(1);

  useEffect(() => {
    if (catalogDataFromContext.length > 0 && !activeCategoryId) {
      setActiveCategoryId(catalogDataFromContext[0].id);
    }
  }, [catalogDataFromContext, activeCategoryId]);

  useEffect(() => {
    const mainCursor = document.createElement('div');
    mainCursor.className = 'cursor';
    document.body.appendChild(mainCursor);
    cursorRef.current = mainCursor;

    trailsRef.current = [];
    const trailElements: HTMLDivElement[] = [];
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      document.body.appendChild(trail);
      trailElements.push(trail);
    }
    trailsRef.current = trailElements;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const trailPositions = trailsRef.current.map(() => ({ x: mousePos.current.x, y: mousePos.current.y }));

    const animate = () => {
      cursorScale.current += (targetCursorScale.current - cursorScale.current) * 0.2;

      if (cursorRef.current) {
        cursorRef.current.style.left = `${mousePos.current.x - CURSOR_MAIN_SIZE / 2}px`;
        cursorRef.current.style.top = `${mousePos.current.y - CURSOR_MAIN_SIZE / 2}px`;
        cursorRef.current.style.transform = `scale(${cursorScale.current}) translateZ(0)`;
      }

      trailsRef.current.forEach((trailEl, index) => {
        const targetX = index === 0 ? mousePos.current.x : trailPositions[index - 1].x;
        const targetY = index === 0 ? mousePos.current.y : trailPositions[index - 1].y;

        trailPositions[index].x += (targetX - trailPositions[index].x) * FOLLOW_SPEED;
        trailPositions[index].y += (targetY - trailPositions[index].y) * FOLLOW_SPEED;

        const trailSize = Math.max(2, CURSOR_TRAIL_BASE_SIZE - index * 0.7);
        const trailOpacity = Math.max(0, 0.7 - (index / TRAIL_COUNT) * 0.65);

        trailEl.style.width = `${trailSize}px`;
        trailEl.style.height = `${trailSize}px`;
        trailEl.style.opacity = `${trailOpacity}`;
        trailEl.style.left = `${trailPositions[index].x - trailSize / 2}px`;
        trailEl.style.top = `${trailPositions[index].y - trailSize / 2}px`;
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (cursorRef.current && cursorRef.current.parentNode) {
         cursorRef.current.parentNode.removeChild(cursorRef.current);
      }
      trailsRef.current.forEach(trailEl => {
        if (trailEl.parentNode) {
          trailEl.parentNode.removeChild(trailEl);
        }
      });
    };
  }, []);


  useEffect(() => {
    const mainCursorNode = cursorRef.current;
    if (!mainCursorNode) return;

    const interactiveElements = document.querySelectorAll(
      '.category-nav-link, article[key^="item-"] button:not(:disabled), article[key^="item-"] a, footer a, button:not(:disabled), .product-image-clickable, .category-header-card'
    );

    const onMouseEnter = () => {
      targetCursorScale.current = 1.5;
      mainCursorNode.style.borderColor = 'var(--accent-color-primary)';
    };
    const onMouseLeave = () => {
      targetCursorScale.current = 1;
      mainCursorNode.style.borderColor = 'var(--accent-color-primary)';
    };

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
    });

    return () => {
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter);
        el.removeEventListener('mouseleave', onMouseLeave);
      });
    };
  }, [selectedProductForDetails, selectedProductForSpin, catalogDataFromContext, cardSelectedVariants]); // Added catalogDataFromContext

  useEffect(() => {
    if (stickyNavRef.current) {
      const currentNavHeight = stickyNavRef.current.offsetHeight;
      if (currentNavHeight > 0 && currentNavHeight !== navHeight) { 
        setNavHeight(currentNavHeight);
      }
    }
  }, [navHeight, activeCategoryId]); 


  useEffect(() => {
    categoryRefs.current = categoryRefs.current.slice(0, catalogDataFromContext.length);
    categoryHeaderCardRefs.current = categoryHeaderCardRefs.current.slice(0, catalogDataFromContext.length);

    if (navHeight === 0 && stickyNavRef.current) { 
        const currentNavHeight = stickyNavRef.current.offsetHeight;
        if (currentNavHeight > 0) {
            setNavHeight(currentNavHeight);
            return; 
        }
    }
    if (navHeight === 0 || catalogDataFromContext.length === 0) return;


    const observerOptions = {
      root: null,
      rootMargin: `-${navHeight + 20}px 0px 0px 0px`, 
      threshold: 0.01, 
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const visibleEntries = entries.filter(e => e.isIntersecting);
          if (visibleEntries.length > 0) {
            visibleEntries.sort((a, b) => {
                const topA = a.boundingClientRect.top - navHeight;
                const topB = b.boundingClientRect.top - navHeight;
                return Math.abs(topA) - Math.abs(topB);
            });
            const mostVisible = visibleEntries[0];
            if (mostVisible) setActiveCategoryId(mostVisible.target.id);
          }
        }
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    categoryRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    categoryHeaderCardRefs.current.forEach(card => {
      if (card) {
        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = (y - centerY) / 25;
          const rotateY = (centerX - x) / 25;
          card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
        };

        const handleMouseLeave = () => {
          card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)';
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        const cleanupCardEffect = () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
            card.style.transform = '';
        };
        (card as any)._cleanupEffect = cleanupCardEffect;
      }
    });

    return () => {
      categoryRefs.current.forEach(ref => {
        if (ref) observer.unobserve(ref);
      });
      categoryHeaderCardRefs.current.forEach(card => {
        if (card && (card as any)._cleanupEffect) {
          (card as any)._cleanupEffect();
        }
      });
    };
  }, [catalogDataFromContext, navHeight]); // Added catalogDataFromContext

  useEffect(() => {
    const globalCustomCursor = document.querySelector('.custom-cursor') as HTMLElement | null;
    if (globalCustomCursor) {
      globalCustomCursor.style.display = 'none';
    }
    return () => {
      if (globalCustomCursor) {
        globalCustomCursor.style.display = '';
      }
    };
  }, []);

  const handleCardVariantSelect = (
    product: ProductItem,
    variantType: 'size' | 'volume',
    value: string | number
  ) => {
    setCardSelectedVariants(prev => {
      const newSelectedVariants = { ...prev[product.id] };
      let newPrice = prev[product.id]?.price || product.price;

      if (variantType === 'size') {
        newSelectedVariants.size = value as string;
      } else if (variantType === 'volume' && product.categoryId === 'perfumes') {
        newSelectedVariants.volume = value as number;
      }
      newSelectedVariants.price = newPrice; 
      return { ...prev, [product.id]: newSelectedVariants };
    });
  };


  const handleAddToCartFromCard = (product: ProductItem) => {
    const liveProductData = getProductById(product.id); // Get live data
    if (!liveProductData || liveProductData.stock <= 0) {
      alert(`${product.name} está agotado.`);
      return;
    }

    const selectedVariant = cardSelectedVariants[product.id];
    if (!selectedVariant && (product.sizes?.length || (product.categoryId === 'perfumes' && product.volumeMl))) {
        console.warn("Attempted to add variant product to cart without variant selection from card.");
        // For simplicity, if variants exist but none selected on card, we might allow adding if we want,
        // or enforce selection (current logic implies variants might not be selected on card).
        // Let's assume for now card selection is optional, and modal is for full selection.
        // If stock is an issue, it should be caught above.
    }

    const size = selectedVariant?.size;
    const volume = product.categoryId === 'perfumes' ? product.volumeMl : selectedVariant?.volume; 
    const price = product.price; 

    addToCart(product, 1, size, volume, price);
    openCart();
  };


  const handleOpenSpinViewer = (product: ProductItem) => {
    if (product.spinImages && product.spinImages.length > 0) {
      setSelectedProductForSpin(product);
    }
  };

  const handleOpenProductDetails = (product: ProductItem) => {
    const liveProduct = getProductById(product.id); // Get fresh data for modal
    setSelectedProductForDetails(liveProduct || product);
  };

  const handleCategoryLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, categoryId: string) => {
    e.preventDefault();
    setActiveCategoryId(categoryId);
    const element = document.getElementById(categoryId);
    if (element && stickyNavRef.current) {
      const currentNavHeight = stickyNavRef.current.offsetHeight; 
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - currentNavHeight - 10; 
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else if (element) { 
        element.scrollIntoView({behavior: 'smooth', block: 'start'});
    }
  };
  

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[var(--accent-color-primary)] selection:text-white overflow-x-hidden`}>
      <div className="grainy-overlay"></div>
      
      <nav 
        ref={stickyNavRef} 
        className="fixed top-0 left-0 w-full z-40 bg-[var(--light-bg-alt)]/90 backdrop-blur-md border-b border-[var(--accent-color-primary)]/15 shadow-md"
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-center items-center relative">
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 sm:gap-x-8 md:gap-x-10 lg:gap-x-12">
            {catalogDataFromContext.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                onClick={(e) => handleCategoryLinkClick(e, category.id)}
                className={`category-nav-link text-sm sm:text-base md:text-lg font-bold transition-colors uppercase tracking-wider py-1 relative
                            ${activeCategoryId === category.id ? 'active' : ''}`}
                aria-current={activeCategoryId === category.id ? "page" : undefined}
                aria-label={`Ir a la sección ${category.name}`}
              >
                {category.name}
              </a>
            ))}
          </div>
          <div className="absolute right-4 sm:right-6 top-1/2 transform -translate-y-1/2 flex items-center">
            <CartIcon />
          </div>
        </div>
      </nav>

      <div style={{ paddingTop: navHeight > 0 ? `${navHeight}px` : undefined }}>
        <div className="bg-[var(--light-bg)] pt-10 pb-6 sm:pt-12 sm:pb-8 md:pt-16 md:pb-10 text-center">
          <div className="container mx-auto px-4 sm:px-6">
            <Link to="/" className="inline-block relative group" aria-label="Fashion Flex Home">
              <h1 className="font-['Bungee_Inline'] text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-[var(--accent-color-primary)] uppercase tracking-widest select-none leading-none">
                FASHION FLEX
              </h1>
            </Link>
          </div>
        </div>

        <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
          {catalogDataFromContext.map((category, index) => {
            const itemsWithFreshData = category.items.map(originalItem => getProductById(originalItem.id) || originalItem);
            const inStockProducts = itemsWithFreshData.filter(p => p.stock > 0);
            const outOfStockProducts = itemsWithFreshData.filter(p => p.stock <= 0);
            const sortedLiveItems = [...inStockProducts, ...outOfStockProducts];

            return (
              <section
                key={category.id}
                id={category.id}
                ref={(el: HTMLElement | null) => { categoryRefs.current[index] = el; }}
                className="mb-12 md:mb-16 pt-4"
                aria-labelledby={`category-title-${category.id}`}
              >
                <div
                  ref={(el: HTMLDivElement | null) => { categoryHeaderCardRefs.current[index] = el; }}
                  className="category-header-card text-center p-6 md:p-8 mb-8" 
                >
                  <h2
                    id={`category-title-${category.id}`}
                    className="text-3xl font-semibold tracking-wide inline-block pb-2 uppercase"
                  >
                    {category.name}
                  </h2>
                  <p className="text-md text-[var(--text-dark-secondary)] mt-2 max-w-2xl mx-auto">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mt-8">
                  {sortedLiveItems.map((liveItem) => {
                    const hasVariants =
                      (liveItem.categoryId === 'calzado' && liveItem.sizes && liveItem.sizes.length > 0) ||
                      (liveItem.categoryId === 'ropa' && liveItem.sizes && liveItem.sizes.length > 0) ||
                      (liveItem.categoryId === 'perfumes' && liveItem.volumeMl); 
                    
                    const currentCardSelection = cardSelectedVariants[liveItem.id];
                    let isVariantSelectedOnCard = false;
                    if (hasVariants) {
                        if (liveItem.categoryId === 'calzado' || liveItem.categoryId === 'ropa') {
                            isVariantSelectedOnCard = !!currentCardSelection?.size;
                        } else if (liveItem.categoryId === 'perfumes') {
                            isVariantSelectedOnCard = true; 
                        }
                    }
                    const isOutOfStock = liveItem.stock <= 0;
                    const isMainButtonDisabled = isOutOfStock || (hasVariants && !isVariantSelectedOnCard);
                    const displayPriceOnCard = liveItem.price; 

                    return (
                      <article key={`item-${liveItem.id}`} className={`bg-[var(--light-bg-alt)]/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col border border-[var(--accent-color-primary)]/10 hover:shadow-2xl transition-all duration-300 ease-out group ${isOutOfStock ? 'opacity-70' : ''}`}>
                        <div
                          className="relative aspect-[4/3] overflow-hidden cursor-pointer product-image-clickable"
                          onClick={() => handleOpenProductDetails(liveItem)}
                          aria-label={`Ver detalles de ${liveItem.name}`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenProductDetails(liveItem);}}
                        >
                          <img src={liveItem.imageUrl} alt={liveItem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          {liveItem.spinImages && liveItem.spinImages.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleOpenSpinViewer(liveItem); }} 
                              className="absolute top-2 right-2 bg-[var(--accent-color-primary)]/80 text-white p-2 rounded-full hover:bg-[var(--accent-color-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--light-bg-alt)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
                              aria-label={`Ver ${liveItem.name} en 360°`}
                              title="Vista 360°"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                              </svg>
                            </button>
                          )}
                           {isOutOfStock && (
                              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600/80 text-white text-xs font-bold uppercase px-3 py-1.5 rounded-md backdrop-blur-sm">
                                  Agotado
                              </span>
                          )}
                        </div>

                        <div className="p-5 flex flex-col flex-grow">
                          <h3
                              className="text-base font-semibold text-[var(--text-dark-primary)] mb-1 truncate uppercase product-image-clickable cursor-pointer hover:underline"
                              title={liveItem.name.toUpperCase()}
                              onClick={() => handleOpenProductDetails(liveItem)}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenProductDetails(liveItem);}}
                          >
                              {liveItem.name.toUpperCase()}
                          </h3>
                           <p className="text-xs text-gray-500 mb-1">Disponible: {liveItem.stock}</p>
                           
                           {liveItem.categoryId === 'calzado' && liveItem.sizes && liveItem.sizes.length > 0 && (
                              <div className="mb-2">
                                  <span className="text-xs text-gray-500 mr-1 uppercase">TALLA MX:</span>
                                  {liveItem.sizes.map(size => (
                                      <button
                                          key={size}
                                          onClick={() => handleCardVariantSelect(liveItem, 'size', size)}
                                          className={`text-xs font-medium py-0.5 px-1.5 rounded-md mr-1 mb-1 border transition-colors
                                            ${currentCardSelection?.size === size 
                                                ? 'bg-[var(--accent-color-primary)] text-white border-[var(--accent-color-primary)] ring-1 ring-offset-0 ring-[var(--accent-color-primary)]/50' 
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'}`}
                                          aria-label={`Seleccionar talla ${size.replace(' MX','')}`}
                                          aria-pressed={currentCardSelection?.size === size}
                                          disabled={isOutOfStock}
                                      >
                                          {size.replace(/\s*MX/i, '')}
                                      </button>
                                  ))}
                              </div>
                          )}
                          {liveItem.categoryId === 'ropa' && liveItem.sizes && liveItem.sizes.length > 0 && (
                              <div className="mb-2">
                                  <span className="text-xs text-gray-500 mr-1 uppercase">TALLA:</span>
                                   {liveItem.sizes.map(size => (
                                      <button
                                          key={size}
                                          onClick={() => handleCardVariantSelect(liveItem, 'size', size)}
                                          className={`text-xs font-medium py-0.5 px-1.5 rounded-md mr-1 mb-1 border transition-colors
                                            ${currentCardSelection?.size === size 
                                                ? 'bg-[var(--accent-color-primary)] text-white border-[var(--accent-color-primary)] ring-1 ring-offset-0 ring-[var(--accent-color-primary)]/50' 
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 hover:border-gray-400'}`}
                                          aria-label={`Seleccionar talla ${size}`}
                                          aria-pressed={currentCardSelection?.size === size}
                                          disabled={isOutOfStock}
                                      >
                                          {size}
                                      </button>
                                  ))}
                              </div>
                          )}
                          {liveItem.categoryId === 'perfumes' && liveItem.volumeMl && ( 
                               <div className="mb-2">
                                   <span className="text-xs text-gray-500 mr-1 uppercase">VOL ML:</span>
                                       <button
                                           key={liveItem.volumeMl}
                                           disabled 
                                           className={`text-xs font-medium py-0.5 px-1.5 rounded-md mr-1 mb-1 border bg-gray-100 text-gray-700 border-gray-300 cursor-default`}
                                       >
                                           {liveItem.volumeMl}
                                       </button>
                               </div>
                          )}

                          <div className="mt-auto">
                            <p className={`text-xl font-bold text-[var(--accent-color-primary)] mb-3`}>
                              {displayPriceOnCard}
                            </p>

                            <button
                                onClick={() => {
                                    if (!isMainButtonDisabled) {
                                        handleAddToCartFromCard(liveItem);
                                    }
                                }}
                                disabled={isMainButtonDisabled}
                                className={`w-full border-2 border-[var(--accent-color-primary)] 
                                        font-semibold py-2 px-4 rounded-md transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                                        text-sm tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-[var(--accent-color-primary)]/70
                                        focus:ring-offset-1 focus:ring-offset-[var(--light-bg-alt)]
                                        ${isMainButtonDisabled 
                                            ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed opacity-70' 
                                            : 'text-[var(--accent-color-primary)] hover:bg-[var(--accent-color-primary)] hover:text-white'}`}
                                aria-label={isMainButtonDisabled ? (isOutOfStock ? `${liveItem.name} agotado` : `Selecciona una opción para añadir ${liveItem.name} al carrito`) : `Añadir ${liveItem.name} al carrito`}
                                title={isMainButtonDisabled ? (isOutOfStock ? 'Producto Agotado' : `Selecciona una opción (talla/volumen) para activar.`) : undefined}
                            >
                                {isOutOfStock ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </main>

        <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[var(--accent-color-primary)]/20 text-[var(--text-dark-secondary)] py-8 text-center mt-12 relative z-10`}>
          <div className="container mx-auto px-6">
            <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} FASHION FLEX TODOS LOS DERECHOS RESERVADOS</p>
            <p className="text-xs mt-1 uppercase">TU TIENDA DE MARCAS ORIGINALES Y AUTÉNTICAS</p>
          </div>
        </footer>
      </div>

      <CartSidebar />
      <WhatsAppButton phoneNumber="5212281817771" message="Hola, estoy interesado en sus productos." />

      {selectedProductForSpin && (
        <ProductSpinViewer
          images={selectedProductForSpin.spinImages || []}
          productName={selectedProductForSpin.name}
          onClose={() => setSelectedProductForSpin(null)}
        />
      )}
      {selectedProductForDetails && (
        <ProductDetailModal
          product={selectedProductForDetails}
          onClose={() => setSelectedProductForDetails(null)}
        />
      )}
    </div>
  );
};

export default CatalogPage;
