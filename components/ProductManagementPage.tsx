
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ProductItem, CatalogCategory, ProductImage } from '../types';
// import { CATALOG_DATA } from '../constants'; // Replaced by useCatalog
import { useCatalog } from '../contexts/CatalogDataContext'; // Import useCatalog
import ProductForm from './ProductForm';
import { Link } from 'react-router-dom';

const ACCENT_COLOR = 'var(--accent-color-primary)';
const LOW_STOCK_THRESHOLD = 5;

// const generateId = () => `prod_${Math.random().toString(36).substr(2, 9)}`; // Will use ID from form or let context handle it

const IconWarning = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>;
const IconNoPhoto = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18 10.5h.008v.008H18V10.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>;
const IconTrendingUp = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const IconNoGood = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" /></svg>;
const IconNoPrice = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>;
const IconTrendingDown = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-500"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" /></svg>;

const ProductManagementPage: React.FC = () => {
  const { catalog, updateProduct, addProduct, deleteProductFromCatalog, getCategoryById } = useCatalog();
  
  const allProductsFromCatalog = useMemo(() => {
    return catalog.flatMap(category =>
      category.items.map(item => ({
        ...item,
        categoryName: category.name, // Ensure categoryName is fresh
      }))
    );
  }, [catalog]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cursorDotRef.current = document.querySelector('.cursor-dot');
    const mainDot = cursorDotRef.current;
    if (!mainDot) return;
    const updateCursor = (e: MouseEvent) => {
      if (mainDot) {
        mainDot.style.left = `${e.clientX}px`;
        mainDot.style.top = `${e.clientY}px`;
      }
    };
    document.addEventListener('mousemove', updateCursor);
    return () => document.removeEventListener('mousemove', updateCursor);
  }, []);

  const productStats = useMemo(() => {
    const totalProducts = allProductsFromCatalog.length;
    const lowStock = allProductsFromCatalog.filter(p => p.stock > 0 && p.stock <= (p.lowStockNotificationThreshold || LOW_STOCK_THRESHOLD)).length;
    const noPhoto = allProductsFromCatalog.filter(p => p.imageUrl.includes('picsum.photos') || (p.images && p.images.every(img => img.url.includes('picsum.photos')))).length;
    const soldOut = allProductsFromCatalog.filter(p => p.stock === 0).length;
    const noPrice = allProductsFromCatalog.filter(p => !p.price || p.price === '$0.00' || parseFloat(p.price.replace('$', '')) === 0).length;
    // Sales data not available, so placeholders
    const withSales = 0; 
    const noSales = totalProducts;

    return { totalProducts, lowStock, noPhoto, soldOut, noPrice, withSales, noSales };
  }, [allProductsFromCatalog]);


  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: ProductItem) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      deleteProductFromCatalog(productId);
    }
  };

  const handleSaveProduct = (productToSave: ProductItem) => {
    const mainImage = productToSave.images.find(img => img.isMain);
    const categoryOfProduct = getCategoryById(productToSave.categoryId);

    const productWithFullData: ProductItem = {
      ...productToSave,
      imageUrl: mainImage ? mainImage.url : productToSave.images.length > 0 ? productToSave.images[0].url : 'https://picsum.photos/seed/default/300/200',
      categoryName: categoryOfProduct?.name || 'Sin Categoría',
      updatedAt: new Date().toISOString(),
      availableVolumesMl: productToSave.categoryId === 'perfumes' 
        ? (productToSave.availableVolumesMl && productToSave.availableVolumesMl.length > 0 ? productToSave.availableVolumesMl : (productToSave.volumeMl ? [productToSave.volumeMl] : []))
        : undefined,
      volumePrices: productToSave.categoryId === 'perfumes'
        ? (productToSave.volumePrices && productToSave.volumePrices.length > 0 ? productToSave.volumePrices : (productToSave.volumeMl && productToSave.price ? [{volume: productToSave.volumeMl, price: productToSave.price}] : []))
        : undefined,
      spinImages: productToSave.spinImages || [], 
    };
    
    if (editingProduct) {
      updateProduct(productWithFullData);
    } else {
      addProduct({ ...productWithFullData, id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }); // Ensure new ID
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };
  
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProductsFromCatalog;
    return allProductsFromCatalog.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProductsFromCatalog, searchTerm]);


  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white`}>
      <div className="grainy-overlay"></div>
      
      <header className={`bg-[var(--light-bg-alt)]/80 backdrop-blur-lg py-6 shadow-lg border-b border-[${ACCENT_COLOR}]/30 sticky top-0 z-30`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className={`text-2xl font-['Anton'] tracking-wider text-[${ACCENT_COLOR}] uppercase`}>
            Gestión de Productos
          </h1>
          <div className="flex items-center space-x-4">
            <Link to="/admin"
                className={`text-sm text-[${ACCENT_COLOR}] hover:underline uppercase`}
            >
                &larr; Volver al Dashboard
            </Link>
            <button
              onClick={handleAddNewProduct}
              className={`bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-semibold py-2 px-4 rounded-md
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-sm tracking-wide uppercase`}
            >
              + Agregar Producto
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-[var(--light-bg-alt)]/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/80 flex flex-col justify-center items-center text-center">
            <p className={`text-6xl font-bold text-[${ACCENT_COLOR}]`}>{productStats.totalProducts}</p>
            <p className="text-sm font-medium text-[var(--text-dark-secondary)] uppercase mt-1">Productos</p>
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { title: 'Existencias mínimas', value: productStats.lowStock, icon: <IconWarning /> },
              { title: 'Sin foto', value: productStats.noPhoto, icon: <IconNoPhoto /> },
              { title: 'Con ventas', value: productStats.withSales, icon: <IconTrendingUp />, note: "N/A" },
              { title: 'Agotado', value: productStats.soldOut, icon: <IconNoGood /> },
              { title: 'Sin precio', value: productStats.noPrice, icon: <IconNoPrice /> },
              { title: 'Sin ventas', value: productStats.noSales, icon: <IconTrendingDown />, note: "N/A" },
            ].map((stat, idx) => (
              <div key={idx} className="bg-[var(--light-bg-alt)]/70 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-200/80">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-medium text-[var(--text-dark-secondary)] uppercase">{stat.title}</p>
                  {stat.icon}
                </div>
                <p className={`text-3xl font-bold text-[${ACCENT_COLOR}]`}>{stat.note || stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
            <input 
                type="text"
                placeholder="BUSCAR POR NOMBRE, SKU O CATEGORÍA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full p-3 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-2
                           focus:ring-[${ACCENT_COLOR}]/80 focus:border-[${ACCENT_COLOR}] bg-[var(--light-bg)]/70 uppercase placeholder:normal-case`}
            />
        </div>
        <div className="bg-[var(--light-bg-alt)]/70 backdrop-blur-sm p-4 sm:p-6 md:p-8 rounded-lg shadow-xl border border-gray-200/80 overflow-x-auto">
          {filteredProducts.length > 0 ? (
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className={`border-b-2 border-[${ACCENT_COLOR}]/50`}>
                <tr>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Imagen</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Nombre</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">SKU</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Categoría</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] text-right uppercase">Precio Venta</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] text-right uppercase">Stock</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Detalles Adic.</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Actualizado</th>
                  <th className="py-3 px-4 font-semibold tracking-wider text-[var(--text-dark-primary)] text-center uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id} className="border-b border-gray-200/70 hover:bg-[var(--light-bg)]/50 transition-colors">
                    <td className="py-3 px-4">
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md border border-gray-200" />
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text-dark-primary)] max-w-xs truncate uppercase" title={product.name.toUpperCase()}>{product.name.toUpperCase()}</td>
                    <td className="py-3 px-4 text-[var(--text-dark-secondary)]">{product.sku}</td>
                    <td className="py-3 px-4 text-[var(--text-dark-secondary)] uppercase">{product.categoryName?.toUpperCase()}</td>
                    <td className="py-3 px-4 text-[var(--text-dark-secondary)] text-right">{product.price}</td>
                    <td className={`py-3 px-4 text-right ${product.stock <= (product.lowStockNotificationThreshold || LOW_STOCK_THRESHOLD) ? (product.stock === 0 ? 'text-red-600 font-bold' : 'text-orange-600 font-semibold') : 'text-[var(--text-dark-secondary)]'}`}>{product.stock}</td>
                    <td className="py-3 px-4 text-[var(--text-dark-secondary)] text-xs uppercase">
                      {product.categoryId === 'perfumes' && product.availableVolumesMl && product.availableVolumesMl.length > 0 
                        ? `Vol: ${product.availableVolumesMl.join('ml, ')}ml` 
                        : (product.categoryId === 'perfumes' && product.volumeMl ? `${product.volumeMl}ml` : '')}
                      {(product.categoryId === 'calzado' || product.categoryId === 'ropa') && product.sizes && product.sizes.length > 0 ?
                        `Tallas: ${product.sizes.join(', ')}` : ''}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-dark-secondary)]">{new Date(product.updatedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className={`text-[${ACCENT_COLOR}] hover:underline text-xs px-2 py-1 mr-1 uppercase`}
                        aria-label={`Editar ${product.name}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:underline text-xs px-2 py-1 uppercase"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-[var(--text-dark-secondary)] py-8 uppercase">
              {searchTerm ? "No se encontraron productos con ese criterio." : "No hay productos para mostrar. ¡Agrega el primero!"}
            </p>
          )}
        </div>
      </main>

      {isFormOpen && (
        <ProductForm
          product={editingProduct}
          categories={catalog} // Pass the live catalog categories
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
        />
      )}

      <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[${ACCENT_COLOR}]/30 text-[var(--text-dark-secondary)] py-6 text-center mt-auto`}>
        <div className="container mx-auto px-6">
          <p className="tracking-wider text-xs uppercase">&copy; {new Date().getFullYear()} FASHION FLEX. GESTIÓN DE PRODUCTOS.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductManagementPage;