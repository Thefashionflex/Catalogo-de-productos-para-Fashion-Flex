
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Order, OrderItemDetails, OrderStatus } from '../types';
import { ProductItem } from '../types'; // Assuming ProductItem is needed for product details
import { CATALOG_DATA } from '../constants'; // To get some product images for mock data
import ChangeOrderStatusModal from './ChangeOrderStatusModal'; // Import the new modal


const ACCENT_COLOR = 'var(--accent-color-primary)';

// Helper to get a random product image for mock data
const getRandomProductImage = (): string => {
    const allItems = CATALOG_DATA.flatMap(cat => cat.items);
    if (allItems.length === 0) return 'https://picsum.photos/seed/defaultproduct/100/100';
    const randomItem = allItems[Math.floor(Math.random() * allItems.length)];
    return randomItem.imageUrl;
};

// Mock Data for Orders
const MOCK_ORDERS: Order[] = [
  {
    id: '6578-4753', orderDate: new Date(2025, 4, 21, 14, 8).toISOString(), customerName: 'Pedro Rodriguez',
    items: [{ productId: 'cal1', productName: 'Zapatillas Runner Max', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$129.99', selectedSize: '27 MX' }],
    status: 'Enviado', totalAmount: 129.99
  },
  {
    id: '2451-7285', orderDate: new Date(2025, 4, 20, 9, 45).toISOString(), customerName: 'Hijo Paty',
    items: [{ productId: 'per1', productName: 'Aqua Sport EDT 100 ml', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$59.99', selectedVolume: 100 }],
    status: 'En espera de pago', totalAmount: 59.99
  },
  {
    id: '2194-9198', orderDate: new Date(2025, 4, 16, 8, 56).toISOString(), customerName: 'Dulce Maria',
    items: [{ productId: 'rop1', productName: 'Camiseta Técnica DryFit', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$39.99', selectedSize: 'M' }],
    status: 'En espera de pago', totalAmount: 39.99
  },
  {
    id: '4708-2004', orderDate: new Date(2025, 4, 12, 20, 55).toISOString(), customerName: 'Emilio Suarez',
    items: [
        { productId: 'acc1', productName: 'Guante de Boxeo Pro', imageUrl: getRandomProductImage(), quantity: 2, priceAtPurchase: '$49.99' },
        { productId: 'cal2', productName: 'Botas de Fútbol Strike', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$99.99', selectedSize: '26.5 MX' }
    ],
    status: 'En espera de pago', totalAmount: 199.97
  },
   {
    id: '2272-9837', orderDate: new Date(2025, 4, 12, 20, 51).toISOString(), customerName: 'Pao López',
    items: [{ productId: 'per2', productName: 'Energy Boost Parfum 50 ml', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$79.99', selectedVolume: 50 }],
    status: 'Enviado', totalAmount: 79.99
  },
  {
    id: '3101-6292', orderDate: new Date(2025, 4, 12, 20, 44).toISOString(), customerName: 'Miguel Luna',
    items: [{ productId: 'rop2', productName: 'Leggings Compresión Max', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$54.99', selectedSize: 'CH' }],
    status: 'Enviado', totalAmount: 54.99
  },
   {
    id: '3579-0861', orderDate: new Date(2025, 4, 12, 20, 6).toISOString(), customerName: 'Edrei Torres',
    items: [
        { productId: 'cal1', productName: 'Zapatillas Runner Max', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$129.99', selectedSize: '28 MX' },
        { productId: 'acc2', productName: 'Cuerda para Saltar Speed', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$19.99' }
    ],
    status: 'En espera de envío', totalAmount: 149.98
  },
   {
    id: '8876-1234', orderDate: new Date(2025, 3, 10, 10, 0).toISOString(), customerName: 'Ana García',
    items: [{ productId: 'cal1', productName: 'Zapatillas Runner Max', imageUrl: getRandomProductImage(), quantity: 1, priceAtPurchase: '$129.99', selectedSize: '26 MX' }],
    status: 'Entregado', totalAmount: 129.99
  },
  {
    id: '9900-5678', orderDate: new Date(2025, 3, 5, 15, 30).toISOString(), customerName: 'Carlos Pérez',
    items: [{ productId: 'per1', productName: 'Aqua Sport EDT 100 ml', imageUrl: getRandomProductImage(), quantity: 2, priceAtPurchase: '$59.99', selectedVolume: 100 }],
    status: 'Cancelado', totalAmount: 119.98
  },
];

const OrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'Todos'>('Todos');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Order | 'totalItems'; direction: 'ascending' | 'descending' } | null>(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrderForStatusChange, setSelectedOrderForStatusChange] = useState<Order | null>(null);

  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    cursorDotRef.current = document.querySelector('.cursor-dot');
    const mainDot = cursorDotRef.current;
    if (!mainDot) return;
    const updateCursor = (e: MouseEvent) => { if (mainDot) { mainDot.style.left = `${e.clientX}px`; mainDot.style.top = `${e.clientY}px`; } };
    document.addEventListener('mousemove', updateCursor);
    return () => document.removeEventListener('mousemove', updateCursor);
  }, []);

  const handleOpenChangeStatusModal = (order: Order) => {
    setSelectedOrderForStatusChange(order);
    setIsStatusModalOpen(true);
  };

  const handleCloseChangeStatusModal = () => {
    setSelectedOrderForStatusChange(null);
    setIsStatusModalOpen(false);
  };

  const handleChangeOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus, orderDate: new Date().toISOString() } : order // Update orderDate as well
      )
    );
    handleCloseChangeStatusModal();
  };


  const filteredOrders = useMemo(() => {
    let VfilteredOrders = [...orders];

    if (searchTerm) {
      VfilteredOrders = VfilteredOrders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => 
            item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.productId.toLowerCase().includes(searchTerm.toLowerCase()) // Assuming productId can be a SKU
        )
      );
    }

    if (statusFilter !== 'Todos') {
      VfilteredOrders = VfilteredOrders.filter(order => order.status === statusFilter);
    }

    if (startDateFilter) {
      VfilteredOrders = VfilteredOrders.filter(order => new Date(order.orderDate) >= new Date(startDateFilter));
    }
    if (endDateFilter) {
      // Add 1 day to endDate to make it inclusive
      const inclusiveEndDate = new Date(endDateFilter);
      inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);
      VfilteredOrders = VfilteredOrders.filter(order => new Date(order.orderDate) < inclusiveEndDate);
    }
    
    return VfilteredOrders;
  }, [orders, searchTerm, statusFilter, startDateFilter, endDateFilter]);

  const sortedOrders = useMemo(() => {
    let sortableOrders = [...filteredOrders];
    if (sortConfig !== null) {
      sortableOrders.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'totalItems') {
            aValue = a.items.reduce((sum, item) => sum + item.quantity, 0);
            bValue = b.items.reduce((sum, item) => sum + item.quantity, 0);
        } else {
            aValue = a[sortConfig.key as keyof Order];
            bValue = b[sortConfig.key as keyof Order];
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableOrders;
  }, [filteredOrders, sortConfig]);

  const requestSort = (key: keyof Order | 'totalItems') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key: keyof Order | 'totalItems') => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'Enviado': return 'bg-green-100 text-green-700 border-green-300';
      case 'Entregado': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'En espera de pago': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'En espera de envío': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Cancelado': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const summaryStats = useMemo(() => {
    const paidOrders = orders.filter(o => o.status === 'Enviado' || o.status === 'Entregado');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingPaymentCount = orders.filter(o => o.status === 'En espera de pago').length;
    const pendingShipmentCount = orders.filter(o => o.status === 'En espera de envío').length;
    return {
        totalRevenue: totalRevenue.toFixed(2),
        paidOrdersCount: paidOrders.length,
        pendingPaymentCount,
        pendingShipmentCount
    };
  }, [orders]);

  const displayedOrdersSummary = useMemo(() => {
    const total = sortedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    return {
        totalAmount: total.toFixed(2),
        count: sortedOrders.length
    };
  }, [sortedOrders]);


  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white`}>
      <div className="grainy-overlay"></div>
      
      <header className={`bg-[var(--light-bg-alt)]/80 backdrop-blur-lg py-6 shadow-lg border-b border-[${ACCENT_COLOR}]/30 sticky top-0 z-30`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className={`text-2xl font-['Anton'] tracking-wider text-[${ACCENT_COLOR}] uppercase`}>
            Gestión de Pedidos
          </h1>
          <Link to="/admin" className={`text-sm text-[${ACCENT_COLOR}] hover:underline uppercase`}>
            &larr; Volver al Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 flex-grow">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[var(--light-bg-alt)]/70 p-5 rounded-lg shadow-md border border-gray-200/80">
                <h3 className="text-sm font-medium text-[var(--text-dark-secondary)] uppercase">Total Ingresos (Pagados)</h3>
                <p className={`text-2xl font-bold text-[${ACCENT_COLOR}]`}>${summaryStats.totalRevenue}</p>
            </div>
            <div className="bg-[var(--light-bg-alt)]/70 p-5 rounded-lg shadow-md border border-gray-200/80">
                <h3 className="text-sm font-medium text-[var(--text-dark-secondary)] uppercase">Pedidos Pagados</h3>
                <p className={`text-2xl font-bold text-[${ACCENT_COLOR}]`}>{summaryStats.paidOrdersCount}</p>
            </div>
            <div className="bg-[var(--light-bg-alt)]/70 p-5 rounded-lg shadow-md border border-gray-200/80">
                <h3 className="text-sm font-medium text-[var(--text-dark-secondary)] uppercase">Pendientes de Pago</h3>
                <p className={`text-2xl font-bold text-blue-600`}>{summaryStats.pendingPaymentCount}</p>
            </div>
            <div className="bg-[var(--light-bg-alt)]/70 p-5 rounded-lg shadow-md border border-gray-200/80">
                <h3 className="text-sm font-medium text-[var(--text-dark-secondary)] uppercase">Pendientes de Envío</h3>
                <p className={`text-2xl font-bold text-yellow-600`}>{summaryStats.pendingShipmentCount}</p>
            </div>
        </div>

        {/* Filters and Actions */}
        <div className="mb-6 p-4 bg-[var(--light-bg-alt)]/70 rounded-lg shadow border border-gray-200/80 flex flex-wrap items-end gap-4">
            <div className="flex-grow min-w-[200px]">
                <label htmlFor="searchTerm" className="block text-xs font-medium text-[var(--text-dark-secondary)] uppercase mb-1">Buscar Pedido</label>
                <input 
                    type="text" id="searchTerm" placeholder="ID, Cliente, Producto, SKU..."
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm"
                />
            </div>
             <div className="flex-grow min-w-[150px]">
                <label htmlFor="startDate" className="block text-xs font-medium text-[var(--text-dark-secondary)] uppercase mb-1">Desde</label>
                <input type="date" id="startDate" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)}
                       className="w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm"/>
            </div>
            <div className="flex-grow min-w-[150px]">
                <label htmlFor="endDate" className="block text-xs font-medium text-[var(--text-dark-secondary)] uppercase mb-1">Hasta</label>
                <input type="date" id="endDate" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)}
                       className="w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm"/>
            </div>
            <div className="flex-grow min-w-[180px]">
                 <label htmlFor="statusFilter" className="block text-xs font-medium text-[var(--text-dark-secondary)] uppercase mb-1">Estado</label>
                <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'Todos')}
                        className="w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm">
                    <option value="Todos">Todos los estados</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="En espera de pago">En espera de pago</option>
                    <option value="En espera de envío">En espera de envío</option>
                    <option value="Cancelado">Cancelado</option>
                </select>
            </div>
            <button
                disabled
                title="Funcionalidad no implementada"
                className={`bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2.5 px-4 rounded-md text-sm tracking-wide uppercase
                            transition-colors duration-150 opacity-50 cursor-not-allowed`}
            >
                Nuevo Pedido
            </button>
        </div>

        {/* Orders Table */}
        <div className="bg-[var(--light-bg-alt)]/70 backdrop-blur-sm p-1 sm:p-2 md:p-4 rounded-lg shadow-xl border border-gray-200/80 overflow-x-auto">
          {sortedOrders.length > 0 ? (
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className={`border-b-2 border-[${ACCENT_COLOR}]/50`}>
                <tr>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('orderDate')}>Fecha y Hora {getSortIndicator('orderDate')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('id')}>Código {getSortIndicator('id')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('customerName')}>Cliente {getSortIndicator('customerName')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase">Productos</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('status')}>Estado {getSortIndicator('status')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] text-right uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('totalItems')}>Artículos {getSortIndicator('totalItems')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] text-right uppercase cursor-pointer hover:bg-gray-100" onClick={() => requestSort('totalAmount')}>Valor Total {getSortIndicator('totalAmount')}</th>
                  <th className="py-3 px-3 font-semibold tracking-wider text-[var(--text-dark-primary)] text-center uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-200/60 hover:bg-[var(--light-bg)]/40 transition-colors duration-150">
                    <td className="py-2.5 px-3 text-[var(--text-dark-secondary)] whitespace-nowrap">{new Date(order.orderDate).toLocaleString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2.5 px-3 font-medium text-[var(--accent-color-primary)] whitespace-nowrap">{order.id}</td>
                    <td className="py-2.5 px-3 text-[var(--text-dark-secondary)] whitespace-nowrap">{order.customerName}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center space-x-1">
                        {order.items.slice(0, 2).map((item, idx) => (
                           <img key={idx} src={item.imageUrl} alt={item.productName} title={`${item.productName} (x${item.quantity}) ${item.selectedSize ? 'Talla: '+item.selectedSize : ''} ${item.selectedVolume ? 'Vol: '+item.selectedVolume+'ML' : ''}`} 
                                className="w-9 h-9 object-cover rounded border border-gray-200"/>
                        ))}
                        {order.items.length > 2 && (
                            <span className="flex items-center justify-center w-9 h-9 bg-gray-200 text-gray-600 text-xs font-semibold rounded border border-gray-300">
                                +{order.items.length - 2}
                            </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-dark-secondary)] text-right whitespace-nowrap">{order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td className="py-2.5 px-3 text-[var(--text-dark-secondary)] text-right whitespace-nowrap">${order.totalAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                       <button
                          onClick={() => handleOpenChangeStatusModal(order)}
                          className={`bg-transparent hover:bg-[${ACCENT_COLOR}]/10 text-[${ACCENT_COLOR}] border border-[${ACCENT_COLOR}]/50
                                     font-semibold py-1 px-3 rounded-md text-xs tracking-wide uppercase transition-colors duration-150`}
                          title="Cambiar estado del pedido"
                        >
                          Cambiar Estado
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-[var(--text-dark-secondary)] py-10 uppercase">
              {searchTerm || statusFilter !== 'Todos' || startDateFilter || endDateFilter ? "No se encontraron pedidos con los filtros aplicados." : "No hay pedidos para mostrar."}
            </p>
          )}
        </div>
        {sortedOrders.length > 0 && (
             <div className="mt-4 flex justify-end">
                <div className="bg-blue-50 p-3 rounded-lg shadow border border-blue-200 text-right">
                    <p className="text-sm font-medium text-blue-700 uppercase">Total (Filtrado)</p>
                    <p className="text-xl font-bold text-blue-800">${displayedOrdersSummary.totalAmount}</p>
                    <p className="text-xs text-blue-600">({displayedOrdersSummary.count} pedidos)</p>
                </div>
            </div>
        )}
      </main>

       {isStatusModalOpen && selectedOrderForStatusChange && (
        <ChangeOrderStatusModal
          order={selectedOrderForStatusChange}
          onClose={handleCloseChangeStatusModal}
          onSave={handleChangeOrderStatus}
        />
      )}

      <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[${ACCENT_COLOR}]/30 text-[var(--text-dark-secondary)] py-6 text-center mt-auto`}>
        <div className="container mx-auto px-6">
          <p className="tracking-wider text-xs uppercase">&copy; {new Date().getFullYear()} SPORT FLEX. GESTIÓN DE PEDIDOS.</p>
        </div>
      </footer>
    </div>
  );
};

export default OrderManagementPage;
