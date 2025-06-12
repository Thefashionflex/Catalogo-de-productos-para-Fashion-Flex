
import React, { useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';

const ACCENT_COLOR = 'var(--accent-color-primary)';
const ALL_ORDER_STATUSES: OrderStatus[] = ['Enviado', 'En espera de pago', 'En espera de envío', 'Cancelado', 'Entregado'];

interface ChangeOrderStatusModalProps {
  order: Order;
  onClose: () => void;
  onSave: (orderId: string, newStatus: OrderStatus) => void;
}

const ChangeOrderStatusModal: React.FC<ChangeOrderStatusModalProps> = ({ order, onClose, onSave }) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);

  useEffect(() => {
    setSelectedStatus(order.status);
  }, [order]);

  const handleSave = () => {
    if (selectedStatus !== order.status) {
      onSave(order.id, selectedStatus);
    } else {
      onClose(); // Close if status hasn't changed, or handle as no-op
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70]" 
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="change-status-modal-title"
        onClick={onClose}
    >
      <div 
        className="bg-[var(--light-bg-alt)] p-6 rounded-lg shadow-xl w-full max-w-md relative border border-[${ACCENT_COLOR}]/40"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-3 right-3 p-1.5 rounded-full text-[var(--text-dark-secondary)] hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/50`}
          aria-label="Cerrar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="change-status-modal-title" className={`text-xl font-semibold text-[${ACCENT_COLOR}] mb-2 uppercase`}>
          Cambiar Estado del Pedido
        </h2>
        <p className="text-sm text-[var(--text-dark-secondary)] mb-1">Pedido ID: <span className="font-medium">{order.id}</span></p>
        <p className="text-sm text-[var(--text-dark-secondary)] mb-4">Cliente: <span className="font-medium">{order.customerName}</span></p>
        
        <div className="mb-5">
          <label htmlFor="orderStatus" className="block text-sm font-medium text-[var(--text-dark-primary)] mb-1 uppercase">
            Nuevo Estado
          </label>
          <select
            id="orderStatus"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className={`w-full p-2.5 border border-gray-300/70 rounded-md shadow-sm focus:outline-none focus:ring-1 
                       focus:ring-[${ACCENT_COLOR}]/80 bg-[var(--light-bg)]/70 text-sm`}
          >
            {ALL_ORDER_STATUSES.map(status => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className={`py-2 px-4 border border-gray-300/90 rounded-md shadow-sm text-sm font-medium text-[var(--text-dark-secondary)]
                       hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-colors uppercase`}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className={`py-2 px-5 bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-semibold rounded-md shadow-sm
                       focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[${ACCENT_COLOR}]/80 transition-colors uppercase`}
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeOrderStatusModal;
