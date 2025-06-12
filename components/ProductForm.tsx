
import React, { useState, useEffect, ChangeEvent, FormEvent, useRef, useMemo } from 'react';
import { ProductItem, CatalogCategory, ProductImage } from '../types';

const ACCENT_COLOR = 'var(--accent-color-primary)';

interface ProductFormProps {
  product: ProductItem | null;
  categories: CatalogCategory[];
  onSave: (product: ProductItem) => void;
  onCancel: () => void;
}

const generateImageId = () => `img_${Math.random().toString(36).substr(2, 9)}`;

type ActiveTab = 'general' | 'stock' | 'photos' | 'pricing';

const predefinedPerfumeVolumes = [3, 7.5, 10, 15, 20, 25, 30, 50, 60, 75, 80, 90, 100, 120, 125, 150, 180, 200, 240, 250].sort((a,b) => a-b);
const predefinedRopaSizes = ["XCH", "CH", "M", "G", "XG"];


const ProductForm: React.FC<ProductFormProps> = ({ product, categories, onSave, onCancel }) => {
  const validUnitTypes: ProductItem['unitType'][] = ['Paquete', 'Par', 'Pieza', 'Set'];

  const initialFormState: Omit<ProductItem, 'id' | 'updatedAt' | 'imageUrl' | 'categoryName'> & { volumePrices?: ProductItem['volumePrices'], spinImages?: ProductImage[], sizePrices?: ProductItem['sizePrices'] } = {
    name: '',
    description: '',
    images: [],
    spinImages: [],
    price: '',
    costPrice: 0,
    stock: 0,
    sku: '',
    categoryId: categories.length > 0 ? categories[0].id : '',
    sizes: [],
    sizePrices: [],
    volumeMl: undefined,
    availableVolumesMl: [],
    volumePrices: [],
    // New fields defaults
    subcategoryId: '',
    barcodeType: '',
    eanGtin: '',
    autoSku: false,
    productCondition: 'Nuevo',
    unitType: 'Pieza',
    brand: '',
    hasVariations: false,
    reservedStock: 0,
    lowStockNotificationThreshold: 5,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formImages, setFormImages] = useState<ProductImage[]>([]);
  const [formSpinImages, setFormSpinImages] = useState<ProductImage[]>([]);

  const [currentSizeCalzadoSelect, setCurrentSizeCalzadoSelect] = useState<string>('2');
  const [currentSizeRopaSelect, setCurrentSizeRopaSelect] = useState<string>(predefinedRopaSizes[0]);
  const [productSizes, setProductSizes] = useState<string[]>([]);

  const sizeCalzadoSelectRef = useRef<HTMLSelectElement>(null);
  const sizeRopaSelectRef = useRef<HTMLSelectElement>(null);


  const [currentVolumeSelect, setCurrentVolumeSelect] = useState<string>(predefinedPerfumeVolumes.length > 0 ? predefinedPerfumeVolumes[0].toString() : '');
  const volumeSelectRef = useRef<HTMLSelectElement>(null);


  const [activeTab, setActiveTab] = useState<ActiveTab>('general');

  // NOTA SOBRE IMÁGENES LOCALES:
  // Para la visualización inicial de productos con imágenes locales (ej. desde `public/images/`),
  // las rutas deben especificarse directamente en `constants.ts` (INITIAL_CATALOG_DATA).
  // Este formulario, al subir NUEVAS imágenes a través de la UI, las convertirá a base64
  // y las guardará así en localStorage. Esto es diferente de referenciar archivos locales existentes.

  useEffect(() => {
    if (product) {
      const initialSizes = product.sizes || [];
      const initialSizePrices = product.sizePrices || [];
      const initialVolumeMl = product.volumeMl;

      let currentUnitType = product.unitType;
      if (currentUnitType && !validUnitTypes.includes(currentUnitType)) {
        currentUnitType = 'Pieza';
      }

      setFormData({
        name: product.name || '',
        description: product.description || '',
        images: product.images || [],
        spinImages: product.spinImages || [],
        price: product.price || '',
        costPrice: product.costPrice || 0,
        stock: product.stock || 0,
        sku: product.sku || '',
        categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : ''),
        sizes: initialSizes,
        sizePrices: initialSizePrices,
        volumeMl: initialVolumeMl,
        availableVolumesMl: initialVolumeMl ? [initialVolumeMl] : [], // Only main volume
        volumePrices: product.volumePrices || (initialVolumeMl ? [{volume: initialVolumeMl, price: product.price}] : []),
        subcategoryId: product.subcategoryId || '',
        barcodeType: product.barcodeType || '',
        eanGtin: product.eanGtin || '',
        autoSku: product.autoSku || false,
        productCondition: product.productCondition || 'Nuevo',
        unitType: currentUnitType || 'Pieza',
        brand: product.brand || '',
        hasVariations: product.hasVariations || false,
        reservedStock: product.reservedStock || 0,
        lowStockNotificationThreshold: product.lowStockNotificationThreshold || 5,
      });
      setFormImages(product.images || []);
      setFormSpinImages(product.spinImages || []);
      setProductSizes(initialSizes);

      if (product.categoryId === 'calzado') {
        setCurrentSizeCalzadoSelect( (initialSizes.length > 0 && initialSizes[0].endsWith(' MX') ? initialSizes[0].replace(' MX', '') : '2') );
      } else if (product.categoryId === 'ropa') {
        setCurrentSizeRopaSelect(initialSizes.length > 0 ? initialSizes[0] : predefinedRopaSizes[0]);
      }

      if (product.categoryId === 'perfumes' && product.volumeMl) {
        setCurrentVolumeSelect(product.volumeMl.toString());
      } else if (predefinedPerfumeVolumes.length > 0) {
        setCurrentVolumeSelect(predefinedPerfumeVolumes[0].toString());
      }


    } else {
       setFormData({
        ...initialFormState,
        categoryId: categories.length > 0 ? categories[0].id : '',
        sizePrices: (initialFormState.categoryId === 'calzado' || initialFormState.categoryId === 'ropa') ? [] : undefined,
        availableVolumesMl: initialFormState.volumeMl ? [initialFormState.volumeMl] : [],
      });
      setFormImages([]);
      setFormSpinImages([]);
      setProductSizes([]);
      setCurrentSizeCalzadoSelect('2');
      setCurrentSizeRopaSelect(predefinedRopaSizes[0]);
      if (predefinedPerfumeVolumes.length > 0) {
        setCurrentVolumeSelect(predefinedPerfumeVolumes[0].toString());
      }
    }
  }, [product, categories]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean | undefined = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (['costPrice', 'stock', 'reservedStock', 'lowStockNotificationThreshold'].includes(name)) {
        processedValue = parseFloat(value);
        if (isNaN(processedValue as number)) {
          processedValue = 0;
        }
    } else if (name === 'volumeMl') {
        const numValue = parseFloat(value);
        processedValue = isNaN(numValue) || numValue <= 0 ? undefined : numValue;
    }

    if (name === 'categoryId') {
        setFormData(prev => ({
            ...prev,
            categoryId: value,
            sizes: (value === 'calzado' || value === 'ropa') ? prev.sizes : [],
            sizePrices: (value === 'calzado' || value === 'ropa') ? prev.sizePrices : [],
            volumeMl: value === 'perfumes' ? (prev.volumeMl || (predefinedPerfumeVolumes.length > 0 ? predefinedPerfumeVolumes[0] : undefined)) : undefined,
            availableVolumesMl: value === 'perfumes' ? [(prev.volumeMl || (predefinedPerfumeVolumes.length > 0 ? predefinedPerfumeVolumes[0] : undefined)) as number].filter(Boolean) as number[] : [],
            volumePrices: value === 'perfumes' ? (prev.volumeMl && prev.price ? [{volume: prev.volumeMl, price: prev.price}] : []) : [],
        }));
         setCurrentSizeCalzadoSelect('2');
         setCurrentSizeRopaSelect(predefinedRopaSizes[0]);
         if (value === 'perfumes' && predefinedPerfumeVolumes.length > 0) {
           const defaultVolume = predefinedPerfumeVolumes[0];
           setCurrentVolumeSelect(defaultVolume.toString());
           if(!product){ // If new product, set default volumeMl
            setFormData(prev => ({...prev, volumeMl: defaultVolume, availableVolumesMl: [defaultVolume], volumePrices: prev.price ? [{volume:defaultVolume, price: prev.price}] : []}));
           }
         }
    } else if (name === 'volumeMl') {
        const selectedVol = parseFloat(value);
        setFormData(prev => ({
            ...prev,
            volumeMl: selectedVol,
            availableVolumesMl: selectedVol > 0 ? [selectedVol] : [],
            volumePrices: selectedVol > 0 && prev.price ? [{volume: selectedVol, price: prev.price}] : []
        }));
    } else {
         setFormData(prev => ({
            ...prev,
            [name]: processedValue,
        }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>, imageType: 'gallery' | 'spin') => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: ProductImage = {
            id: generateImageId(),
            url: reader.result as string, // Esto será base64
            isMain: imageType === 'gallery' ? (formImages.length === 0 && (!product || !product.images || product.images.length ===0)) : false,
          };
          if (imageType === 'gallery') {
            setFormImages(prevImgs => [...prevImgs, newImage]);
          } else {
            setFormSpinImages(prevImgs => [...prevImgs, newImage]);
          }
        };
        reader.readAsDataURL(file);
      });
      e.target.value = '';
    }
  };

  const handleSetMainImage = (imageId: string) => {
    setFormImages(prevImgs =>
      prevImgs.map(img => ({ ...img, isMain: img.id === imageId }))
    );
  };

  const handleDeleteImage = (imageId: string, imageType: 'gallery' | 'spin') => {
    if (imageType === 'gallery') {
      setFormImages(prevImgs => {
          const updatedImgs = prevImgs.filter(img => img.id !== imageId);
          if (updatedImgs.length > 0 && !updatedImgs.some(img => img.isMain)) {
              return updatedImgs.map((img, index) => ({...img, isMain: index === 0}));
          }
          return updatedImgs;
      });
    } else {
      setFormSpinImages(prevImgs => prevImgs.filter(img => img.id !== imageId));
    }
  };

  const handleAddSize = () => {
    let newSize = '';
    if (formData.categoryId === 'calzado') {
        if (!currentSizeCalzadoSelect) {
            alert("POR FAVOR, SELECCIONA UNA TALLA DE CALZADO DE LA LISTA.");
            return;
        }
        newSize = `${currentSizeCalzadoSelect} MX`;
    } else if (formData.categoryId === 'ropa') {
        newSize = currentSizeRopaSelect;
        if (!newSize) {
            alert("POR FAVOR, SELECCIONA UNA TALLA DE ROPA DE LA LISTA.");
            return;
        }
    } else {
        return;
    }

    if (newSize && !productSizes.includes(newSize)) {
      const updatedSizes = [...productSizes, newSize].sort((a, b) => {
        if (formData.categoryId === 'calzado') {
          return parseFloat(a) - parseFloat(b);
        }
        const order = {"XCH":0, "CH":1, "M":2, "G":3, "XG":4 };
        return (order[a as keyof typeof order] || 99) - (order[b as keyof typeof order] || 99);
      });
      setProductSizes(updatedSizes);
      setFormData(prev => ({ ...prev, sizes: updatedSizes }));
      if(formData.categoryId === 'calzado') setCurrentSizeCalzadoSelect('2');
      else if(formData.categoryId === 'ropa') setCurrentSizeRopaSelect(predefinedRopaSizes[0]);
    } else if (productSizes.includes(newSize)){
        alert("ESTA TALLA YA HA SIDO AÑADIDA.");
    }
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    const updatedSizes = productSizes.filter(s => s !== sizeToRemove);
    setProductSizes(updatedSizes);
    setFormData(prev => ({ ...prev, sizes: updatedSizes }));
  };

  const handleSizePriceChange = (size: string, priceValue: string) => {
    setFormData(prev => {
      const currentSizePrices = prev.sizePrices || [];
      let updatedSizePrices = [...currentSizePrices];
      const existingPriceIndex = updatedSizePrices.findIndex(sp => sp.size === size);

      const numericPrice = parseFloat(priceValue.replace('$', '').replace(',', ''));

      if (priceValue.trim() === '' || isNaN(numericPrice) || numericPrice <= 0) {
        updatedSizePrices = updatedSizePrices.filter(sp => sp.size !== size);
      } else {
        if (existingPriceIndex > -1) {
          updatedSizePrices[existingPriceIndex] = { ...updatedSizePrices[existingPriceIndex], price: `$${numericPrice.toFixed(2)}` };
        } else {
          updatedSizePrices.push({ size, price: `$${numericPrice.toFixed(2)}` });
        }
      }
      return { ...prev, sizePrices: updatedSizePrices };
    });
  };


  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formImages.length === 0) {
        alert("POR FAVOR, SUBE AL MENOS UNA IMAGEN PARA LA GALERÍA DEL PRODUCTO.");
        return;
    }
    if (!formImages.some(img => img.isMain)) {
        alert("POR FAVOR, MARCA UNA IMAGEN DE GALERÍA COMO PRINCIPAL.");
        return;
    }
    if ((formData.categoryId === 'calzado' || formData.categoryId === 'ropa') && productSizes.length === 0) {
      alert(`PARA LA CATEGORÍA '${categories.find(c=>c.id === formData.categoryId)?.name?.toUpperCase()}', POR FAVOR AÑADE AL MENOS UNA TALLA.`);
      return;
    }
    if (formData.categoryId === 'perfumes' && (!formData.volumeMl || formData.volumeMl <= 0)) {
        alert("PARA 'PERFUMES', SELECCIONA UN VOLUMEN ML VÁLIDO.");
        return;
    }

    const finalSizePrices = (formData.categoryId === 'calzado' || formData.categoryId === 'ropa')
        ? (formData.sizePrices || []).filter(sp => sp.price.trim() !== '' && parseFloat(sp.price.replace('$', '')) > 0)
        : undefined;

    const productToSave: ProductItem = {
      ...formData,
      id: product ? product.id : generateImageId(),
      images: formImages,
      spinImages: formSpinImages,
      sizes: (formData.categoryId === 'calzado' || formData.categoryId === 'ropa') ? productSizes : [],
      sizePrices: finalSizePrices,
      volumeMl: formData.categoryId === 'perfumes' ? formData.volumeMl : undefined,
      availableVolumesMl: formData.categoryId === 'perfumes' && formData.volumeMl ? [formData.volumeMl] : undefined,
      volumePrices: formData.categoryId === 'perfumes' && formData.volumeMl && formData.price ? [{volume: formData.volumeMl, price: formData.price}] : undefined,
    } as ProductItem;
    onSave(productToSave);
  };

  const profitMargin = useMemo(() => {
    const priceNum = parseFloat(formData.price.replace('$', '').replace(',', ''));
    const costNum = formData.costPrice;
    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(costNum)) {
      return (((priceNum - costNum) / priceNum) * 100).toFixed(2);
    }
    return 'N/A';
  }, [formData.price, formData.costPrice]);

  const formFieldWrapperClass = "mb-5 p-4 border border-gray-200/80 rounded-md bg-[var(--light-bg)]/50";
  const labelClass = "block text-sm font-medium text-[var(--text-dark-primary)] mb-1.5 uppercase tracking-wide";
  const inputClass = `w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm placeholder:normal-case`;
  const selectClass = inputClass;
  const textareaClass = inputClass + " min-h-[80px]";
  const toggleLabelClass = "flex items-center space-x-2 text-sm text-[var(--text-dark-primary)] cursor-pointer";
  const toggleSwitchClass = "relative inline-flex items-center h-5 rounded-full w-9 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--accent-color-primary)]/50";
  const toggleCircleClass = "inline-block w-3.5 h-3.5 transform bg-white rounded-full transition-transform duration-200 ease-in-out";

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-5">
            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 uppercase`}>Título y Descripción</h3>
            <div>
              <label htmlFor="name" className={labelClass}>Título del Producto</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className={inputClass}/>
            </div>
            <div>
              <label htmlFor="description" className={labelClass}>Descripción</label>
              <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={4} required className={textareaClass}/>
            </div>

            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 mt-6 uppercase`}>Categoría y Subcategoría</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="categoryId" className={labelClass}>Categoría</label>
                <select name="categoryId" id="categoryId" value={formData.categoryId} onChange={handleChange} required className={selectClass}>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="subcategoryId" className={labelClass}>Subcategoría (Opcional)</label>
                <input type="text" name="subcategoryId" id="subcategoryId" value={formData.subcategoryId || ''} onChange={handleChange} className={inputClass} placeholder="Ej: Correr, Floral"/>
              </div>
            </div>

            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 mt-6 uppercase`}>Códigos de Identificación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="barcodeType" className={labelClass}>Tipo de Código de Barras</label>
                <select name="barcodeType" id="barcodeType" value={formData.barcodeType} onChange={handleChange} className={selectClass}>
                  <option value="">No aplica</option>
                  <option value="EAN/GTIN">EAN/GTIN</option>
                  <option value="UPC">UPC</option>
                  <option value="ISBN">ISBN</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label htmlFor="eanGtin" className={labelClass}>EAN/GTIN (Si aplica)</label>
                <input type="text" name="eanGtin" id="eanGtin" value={formData.eanGtin || ''} onChange={handleChange} className={inputClass} placeholder="Ej: 1234567890123"/>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="sku" className={labelClass}>Código Interno (SKU)</label>
                <input type="text" name="sku" id="sku" value={formData.sku} onChange={handleChange} required className={inputClass}/>
              </div>
              <div className="pt-2">
                <label className={toggleLabelClass}>
                    <input type="checkbox" name="autoSku" checked={!!formData.autoSku} onChange={handleChange} className="sr-only" />
                    <span className={`${toggleSwitchClass} ${formData.autoSku ? 'bg-['+ACCENT_COLOR+']' : 'bg-gray-300'}`}>
                        <span className={`${toggleCircleClass} ${formData.autoSku ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </span>
                    <span>Generar SKU automáticamente (UI)</span>
                </label>
              </div>
            </div>

            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 mt-6 uppercase`}>Especificaciones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="productCondition" className={labelClass}>Estado del Producto</label>
                <select name="productCondition" id="productCondition" value={formData.productCondition} onChange={handleChange} className={selectClass}>
                  <option value="Nuevo">Nuevo</option>
                  <option value="Usado">Usado</option>
                  <option value="Reacondicionado">Reacondicionado</option>
                </select>
              </div>
              <div>
                <label htmlFor="unitType" className={labelClass}>Unidad de Venta</label>
                <select name="unitType" id="unitType" value={formData.unitType} onChange={handleChange} className={selectClass}>
                  <option value="Paquete">Paquete</option>
                  <option value="Par">Par</option>
                  <option value="Pieza">Pieza</option>
                  <option value="Set">Set</option>
                </select>
              </div>
              <div>
                <label htmlFor="brand" className={labelClass}>Marca (Opcional)</label>
                <input type="text" name="brand" id="brand" value={formData.brand || ''} onChange={handleChange} className={inputClass} placeholder="Ej: Nike, Adidas"/>
              </div>
            </div>
          </div>
        );
      case 'stock':
        return (
          <div className="space-y-5">
            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 uppercase`}>Control de Inventario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="stock" className={labelClass}>Existencias</label>
                <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} required step="1" min="0" className={inputClass}/>
              </div>
              <div>
                <label htmlFor="lowStockNotificationThreshold" className={labelClass}>Notificarme debajo de (unidades)</label>
                <input type="number" name="lowStockNotificationThreshold" id="lowStockNotificationThreshold" value={formData.lowStockNotificationThreshold ?? ''} onChange={handleChange} step="1" min="0" placeholder="Ej: 5" className={inputClass}/>
              </div>
            </div>

            {formData.categoryId === 'calzado' && (
              <div className={formFieldWrapperClass}>
                <label htmlFor="calzadoSizes" className={`${labelClass} mb-2`}>
                  Tallas Disponibles (MX)
                </label>
                <div className="flex items-center gap-2">
                     <select
                          ref={sizeCalzadoSelectRef}
                          id="calzadoSizes"
                          value={currentSizeCalzadoSelect}
                          onChange={(e) => setCurrentSizeCalzadoSelect(e.target.value)}
                          className={`${selectClass} flex-grow`}
                      >
                          <option value="">Selecciona talla...</option>
                          {Array.from({ length: (30 - 2) * 2 + 1 }, (_, i) => 2 + i * 0.5).map(num => (
                              <option key={num} value={num.toString()}>{num.toFixed(1)}</option>
                          ))}
                      </select>
                  <button type="button" onClick={handleAddSize} className={`py-2.5 px-4 bg-[${ACCENT_COLOR}]/80 hover:bg-[${ACCENT_COLOR}] text-white text-xs font-medium rounded-md transition-colors uppercase`}>Añadir Talla</button>
                </div>
                {productSizes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {productSizes.map(s => (
                      <span key={s} className="flex items-center bg-gray-200 text-[var(--text-dark-secondary)] text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => handleRemoveSize(s)} className="ml-1.5 text-red-500 hover:text-red-700 text-sm font-bold">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {formData.categoryId === 'ropa' && (
              <div className={formFieldWrapperClass}>
                <label htmlFor="ropaSizes" className={`${labelClass} mb-2`}>
                    Tallas Disponibles (XCH, CH, M, G, XG)
                </label>
                <div className="flex items-center gap-2">
                     <select
                          ref={sizeRopaSelectRef}
                          id="ropaSizes"
                          value={currentSizeRopaSelect}
                          onChange={(e) => setCurrentSizeRopaSelect(e.target.value)}
                          className={`${selectClass} flex-grow`}
                      >
                          {predefinedRopaSizes.map(size => (
                              <option key={size} value={size}>{size}</option>
                          ))}
                      </select>
                  <button type="button" onClick={handleAddSize} className={`py-2.5 px-4 bg-[${ACCENT_COLOR}]/80 hover:bg-[${ACCENT_COLOR}] text-white text-xs font-medium rounded-md transition-colors uppercase`}>Añadir Talla</button>
                </div>
                {productSizes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {productSizes.map(s => (
                      <span key={s} className="flex items-center bg-gray-200 text-[var(--text-dark-secondary)] text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => handleRemoveSize(s)} className="ml-1.5 text-red-500 hover:text-red-700 text-sm font-bold">&times;</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formData.categoryId === 'perfumes' && (
              <div className={formFieldWrapperClass}>
                <label htmlFor="volumeMl" className={`${labelClass} mb-2`}>VOLÚMEN ML</label>
                 <select
                      name="volumeMl"
                      id="volumeMl"
                      ref={volumeSelectRef}
                      value={formData.volumeMl || ''}
                      onChange={handleChange}
                      className={`${selectClass} flex-grow`}
                  >
                      <option value="">Selecciona volumen...</option>
                      {predefinedPerfumeVolumes.map(vol => (
                          <option key={vol} value={vol.toString()}>{vol} ml</option>
                      ))}
                  </select>
              </div>
            )}
          </div>
        );
      case 'photos':
        return (
          <div className="space-y-5">
            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 uppercase`}>Imágenes del Producto</h3>
            <div>
              <label className={`${labelClass} mb-2`}>Imágenes de Galería</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, 'gallery')}
                    className={`block w-full text-xs text-[var(--text-dark-secondary)] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[${ACCENT_COLOR}]/20 file:text-[${ACCENT_COLOR}] hover:file:bg-[${ACCENT_COLOR}]/30 cursor-pointer`}/>
              {formImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formImages.map((img) => (
                    <div key={img.id} className={`relative border-2 rounded-md overflow-hidden group ${img.isMain ? `border-[${ACCENT_COLOR}] shadow-lg` : 'border-gray-300/70'}`}>
                      <img src={img.url} alt="Previsualización Galería" className="w-full h-24 object-cover"/>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 space-y-1">
                        {!img.isMain && ( <button type="button" onClick={() => handleSetMainImage(img.id)} title="Marcar como principal" className="text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded hover:bg-blue-600 w-full uppercase">Principal</button> )}
                        <button type="button" onClick={() => handleDeleteImage(img.id, 'gallery')} title="Eliminar imagen" className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600 w-full uppercase">Eliminar</button>
                      </div>
                      {img.isMain && (<div className={`absolute top-1 right-1 bg-[${ACCENT_COLOR}] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase`}>PRINCIPAL</div>)}
                    </div>
                  ))}
                </div>
              )}
              {formImages.length === 0 && (<p className="text-xs text-red-500 mt-1 uppercase">Sube al menos una imagen para la galería.</p>)}
            </div>
            <div>
              <label className={`${labelClass} mb-2`}>Imágenes de Vista 360° (Opcional, en secuencia)</label>
              <input type="file" multiple accept="image/*" onChange={(e) => handleImageChange(e, 'spin')}
                    className={`block w-full text-xs text-[var(--text-dark-secondary)] file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[${ACCENT_COLOR}]/20 file:text-[${ACCENT_COLOR}] hover:file:bg-[${ACCENT_COLOR}]/30 cursor-pointer`}/>
              {formSpinImages.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {formSpinImages.map((img, index) => (
                    <div key={img.id} className="relative border-2 border-gray-300/70 rounded-md overflow-hidden group">
                      <span className="absolute top-1 left-1 bg-black/50 text-white text-[9px] px-1.5 py-0.5 rounded-sm font-semibold">{index + 1}</span>
                      <img src={img.url} alt={`Vista 360 ${index + 1}`} className="w-full h-24 object-cover"/>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1">
                        <button type="button" onClick={() => handleDeleteImage(img.id, 'spin')} title="Eliminar imagen de vista 360" className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600 w-full uppercase">Eliminar</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formSpinImages.length > 0 && formSpinImages.length < 2 && (<p className="text-xs text-orange-500 mt-1 uppercase">Para una buena vista 360°, se recomiendan al menos 2 imágenes.</p>)}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="space-y-5">
            <h3 className={`text-lg font-semibold text-[${ACCENT_COLOR}] border-b border-[${ACCENT_COLOR}]/30 pb-2 mb-4 uppercase`}>Definición de Precios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
                <div>
                  <label htmlFor="price" className={labelClass}>Precio de Venta Base ($)</label>
                  <input type="text" name="price" id="price" value={formData.price} onChange={handleChange} required placeholder="Ej: $29.99" className={inputClass}/>
                   {formData.categoryId === 'perfumes' && formData.volumeMl && (
                        <p className="text-xs text-gray-500 mt-1">Este precio se aplicará al Volumen ({formData.volumeMl}ML).</p>
                    )}
                </div>
                <div>
                  <label htmlFor="costPrice" className={labelClass}>Precio de Costo ($)</label>
                  <input type="number" name="costPrice" id="costPrice" value={formData.costPrice} onChange={handleChange} required step="0.01" min="0" placeholder="Ej: 15.00" className={inputClass}/>
                </div>
                <div className="md:col-span-2 bg-[var(--light-bg)]/60 p-3 rounded-md border border-gray-200/70">
                    <label className={`${labelClass} text-xs`}>Margen de Ganancia</label>
                    <p className={`text-xl font-semibold text-[${ACCENT_COLOR}]`}>
                      {profitMargin === 'N/A' || profitMargin === '0.00' ? '%' : `${profitMargin}%`}
                    </p>
                </div>
            </div>

            {(formData.categoryId === 'calzado' || formData.categoryId === 'ropa') && formData.sizes && formData.sizes.length > 0 && (
              <div className="mt-6 border-t border-gray-200/80 pt-4">
                <h4 className={`${labelClass} text-base mb-2`}>PRECIOS POR TALLA (OPCIONAL)</h4>
                <p className="text-xs text-[var(--text-dark-secondary)] mb-3">
                  Si diferentes tallas tienen precios distintos, especifícalos aquí. Si no, se usará el Precio de Venta Base para esa talla.
                </p>
                <div className="space-y-3">
                  {formData.sizes.map(size => {
                    const currentSizePrice = formData.sizePrices?.find(sp => sp.size === size)?.price || '';
                    return (
                      <div key={size} className="grid grid-cols-2 gap-3 items-center">
                        <label htmlFor={`price_size_${size.replace(/\s+/g, '-')}`} className="text-sm text-[var(--text-dark-primary)]">
                          Precio para Talla {size} ($):
                        </label>
                        <input
                          type="text"
                          id={`price_size_${size.replace(/\s+/g, '-')}`}
                          value={currentSizePrice}
                          onChange={(e) => handleSizePriceChange(size, e.target.value)}
                          placeholder={`${formData.price || '$0.00'}`}
                          className={inputClass + " text-sm"}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabId: ActiveTab; label: string; currentTab: ActiveTab; onClick: (tabId: ActiveTab) => void }> = ({ tabId, label, currentTab, onClick }) => (
    <button
      type="button"
      role="tab"
      aria-selected={currentTab === tabId}
      aria-controls={`tab-panel-${tabId}`}
      id={`tab-${tabId}`}
      onClick={() => onClick(tabId)}
      className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
                  ${currentTab === tabId ? `bg-[${ACCENT_COLOR}] text-white shadow-md` : `text-[var(--text-dark-primary)] hover:bg-[${ACCENT_COLOR}]/10`}`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className={`bg-[var(--light-bg-alt)] rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col border border-[${ACCENT_COLOR}]/50`}>
        <header className={`px-6 py-4 border-b border-[${ACCENT_COLOR}]/30`}>
            <h2 className={`text-xl font-semibold text-[${ACCENT_COLOR}] tracking-wide uppercase`}>
            {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            {product && <span className="text-sm text-[var(--text-dark-secondary)] normal-case ml-2">- {product.name}</span>}
            </h2>
        </header>

        <div className="flex flex-grow overflow-hidden">
            <aside className="w-1/4 sm:w-1/5 bg-[var(--light-bg)]/30 border-r border-gray-200/80 p-4 space-y-2 overflow-y-auto scrollbar-thin">
                <TabButton tabId="general" label="Información General" currentTab={activeTab} onClick={setActiveTab} />
                <TabButton tabId="stock" label="Existencias y Variaciones" currentTab={activeTab} onClick={setActiveTab} />
                <TabButton tabId="photos" label="Fotos" currentTab={activeTab} onClick={setActiveTab} />
                <TabButton tabId="pricing" label="Precio" currentTab={activeTab} onClick={setActiveTab} />
            </aside>

            <form onSubmit={handleSubmit} className="w-3/4 sm:w-4/5 p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--accent-color-primary)] scrollbar-track-gray-100">
                <div role="tabpanel" id={`tab-panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                    {renderTabContent()}
                </div>
            </form>
        </div>

        <footer className={`px-6 py-4 border-t border-[${ACCENT_COLOR}]/30 flex justify-end space-x-3 bg-[var(--light-bg)]/30 rounded-b-lg`}>
            <button type="button" onClick={onCancel}
                    className={`py-2 px-4 border border-gray-300/90 rounded-md shadow-sm text-sm font-medium text-[var(--text-dark-secondary)]
                               hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors uppercase`}>
              Cancelar
            </button>
            <button formAction="submit" type="submit"
                    className={`py-2 px-5 bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-semibold rounded-md shadow-sm
                               focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[${ACCENT_COLOR}]/80 transition-colors uppercase`}>
              {product ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ProductForm;
