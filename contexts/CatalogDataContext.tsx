import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { CatalogCategory, ProductItem, CatalogDataContextType } from '../types';
import { INITIAL_CATALOG_DATA, saveCatalogToLocalStorage, loadCatalogFromLocalStorage } from '../constants'; // Will modify constants.ts

const CatalogContext = createContext<CatalogDataContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [catalog, setCatalog] = useState<CatalogCategory[]>(() => {
    return loadCatalogFromLocalStorage();
  });

  useEffect(() => {
    saveCatalogToLocalStorage(catalog);
  }, [catalog]);

  const getProductById = useCallback((productId: string): ProductItem | undefined => {
    for (const category of catalog) {
      const product = category.items.find(item => item.id === productId);
      if (product) return product;
    }
    return undefined;
  }, [catalog]);
  
  const getCategoryById = useCallback((categoryId: string): CatalogCategory | undefined => {
    return catalog.find(category => category.id === categoryId);
  }, [catalog]);


  const decrementStock = useCallback((productId: string, quantityToDecrement: number, selectedSize?: string, selectedVolume?: number) => {
    setCatalog(prevCatalog => {
      const newCatalog = prevCatalog.map(category => {
        return {
          ...category,
          items: category.items.map(item => {
            if (item.id === productId) {
              // For this simulation, we'll simplify and decrement the main stock.
              // A real system would need granular stock for variants (size/volume).
              const newStock = Math.max(0, item.stock - quantityToDecrement);
              console.log(`Stock Update: Product ${item.name} (${item.id}), Old Stock: ${item.stock}, Decrement: ${quantityToDecrement}, New Stock: ${newStock}`);
              return { ...item, stock: newStock, updatedAt: new Date().toISOString() };
            }
            return item;
          }),
        };
      });
      return newCatalog;
    });
  }, []);

  const updateProduct = useCallback((updatedProduct: ProductItem) => {
    setCatalog(prevCatalog => {
      let productFoundAndUpdated = false;
      const newCatalog = prevCatalog.map(category => {
        if (category.id === updatedProduct.categoryId) {
          const itemIndex = category.items.findIndex(item => item.id === updatedProduct.id);
          if (itemIndex !== -1) {
            const updatedItems = [...category.items];
            updatedItems[itemIndex] = { ...updatedProduct, updatedAt: new Date().toISOString() };
            productFoundAndUpdated = true;
            return { ...category, items: updatedItems };
          }
        }
        return category;
      });

      // If product category changed or it's a new product not found in its original category listing (edge case)
      if (!productFoundAndUpdated) {
        // Remove from old category if it exists there
        let catalogWithOldRemoved = newCatalog.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.id !== updatedProduct.id)
        }));
        // Add to new category
        return catalogWithOldRemoved.map(cat => {
          if (cat.id === updatedProduct.categoryId) {
            return { ...cat, items: [...cat.items, { ...updatedProduct, updatedAt: new Date().toISOString() }] };
          }
          return cat;
        });
      }
      return newCatalog;
    });
  }, []);
  
  const addProduct = useCallback((newProduct: ProductItem) => {
     setCatalog(prevCatalog => {
        const targetCategoryIndex = prevCatalog.findIndex(cat => cat.id === newProduct.categoryId);
        if (targetCategoryIndex !== -1) {
            const newCatalog = [...prevCatalog];
            const targetCategory = { ...newCatalog[targetCategoryIndex] };
            targetCategory.items = [{ ...newProduct, updatedAt: new Date().toISOString() }, ...targetCategory.items];
            newCatalog[targetCategoryIndex] = targetCategory;
            return newCatalog;
        } else {
            // If category somehow doesn't exist, create it (less ideal, but robust)
            const newCategory: CatalogCategory = {
                id: newProduct.categoryId,
                name: newProduct.categoryName || 'Nueva Categoría',
                description: '',
                items: [{ ...newProduct, updatedAt: new Date().toISOString() }]
            };
            return [...prevCatalog, newCategory];
        }
     });
  }, []);

  const deleteProductFromCatalog = useCallback((productId: string) => {
    setCatalog(prevCatalog => 
        prevCatalog.map(category => ({
            ...category,
            items: category.items.filter(item => item.id !== productId)
        }))
    );
  }, []);


  return (
    <CatalogContext.Provider value={{ catalog, getProductById, decrementStock, updateProduct, addProduct, deleteProductFromCatalog, getCategoryById }}>
      {children}
    </CatalogContext.Provider>
  );
};

export const useCatalog = (): CatalogDataContextType => {
  const context = useContext(CatalogContext);
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
};