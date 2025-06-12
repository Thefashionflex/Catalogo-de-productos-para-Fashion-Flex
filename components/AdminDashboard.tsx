
import React, {useEffect, useRef} from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // Importar Link

const ACCENT_COLOR = 'var(--accent-color-primary)';

const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Basic cursor dot movement
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
   useEffect(() => {
    cursorDotRef.current = document.querySelector('.cursor-dot');
    const mainDot = cursorDotRef.current;

    if (!mainDot) {
      console.warn("Custom cursor dot not found in DOM for AdminDashboard.");
      return;
    }

    const updateCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      if (mainDot) {
        mainDot.style.left = `${clientX}px`;
        mainDot.style.top = `${clientY}px`;
      }
    };
    document.addEventListener('mousemove', updateCursor);
    return () => {
      document.removeEventListener('mousemove', updateCursor);
    };
  }, []);


  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white`}>
      <div className="grainy-overlay"></div>
      
      <header className={`bg-[var(--light-bg-alt)]/80 backdrop-blur-lg py-6 shadow-lg border-b border-[${ACCENT_COLOR}]/30 sticky top-0 z-40`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <h1 className={`text-2xl font-['Anton'] tracking-wider text-[${ACCENT_COLOR}] uppercase`}>
            SPORT FLEX - ADMIN
          </h1>
          <button
            onClick={handleLogout}
            className={`bg-transparent hover:bg-[${ACCENT_COLOR}] text-[${ACCENT_COLOR}] hover:text-[var(--light-bg-alt)]
                       border border-[${ACCENT_COLOR}] font-semibold py-2 px-4 rounded-md
                       transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] text-sm tracking-wide uppercase`}
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="bg-[var(--light-bg-alt)]/70 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-xl border border-gray-200/80">
          <h2 className={`text-3xl md:text-4xl font-medium text-[${ACCENT_COLOR}] mb-6 tracking-wide uppercase`}>
            Bienvenido, {user?.username || 'Administrador'}!
          </h2>
          <p className="text-[var(--text-dark-secondary)] mb-4 text-lg">
            Este es el panel de administración. Desde aquí podrás gestionar el catálogo de productos, pedidos y usuarios de la plataforma.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            <Link 
              to="/admin/products"
              className={`block p-6 bg-[var(--light-bg)] hover:bg-[var(--light-bg-alt)] border border-[${ACCENT_COLOR}]/30 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] group`}
            >
              <h3 className={`text-xl font-semibold text-[${ACCENT_COLOR}] mb-2 group-hover:underline uppercase`}>Gestión de Productos</h3>
              <p className="text-[var(--text-dark-secondary)] text-sm">
                Añadir, editar o eliminar productos. Administrar imágenes, precios, stock y más.
              </p>
            </Link>
            <Link 
              to="/admin/orders"
              className={`block p-6 bg-[var(--light-bg)] hover:bg-[var(--light-bg-alt)] border border-[${ACCENT_COLOR}]/30 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] group`}
            >
              <h3 className={`text-xl font-semibold text-[${ACCENT_COLOR}] mb-2 group-hover:underline uppercase`}>Gestión de Pedidos</h3>
              <p className="text-[var(--text-dark-secondary)] text-sm">
                Visualizar historial de pedidos, filtrar y ver detalles. Actualizar estados (próximamente).
              </p>
            </Link>
            <div 
              className={`block p-6 bg-gray-100 border border-gray-300/50 rounded-lg shadow-md opacity-60 cursor-not-allowed`}
            >
              <h3 className={`text-xl font-semibold text-gray-600 mb-2 uppercase`}>Gestión de Usuarios (Próximamente)</h3>
              <p className="text-gray-500 text-sm">
                Administrar usuarios y sus roles en la plataforma.
              </p>
            </div>
          </div>

          <p className="text-[var(--text-dark-secondary)] text-lg mt-10 uppercase">
            Otras funcionalidades futuras incluirán:
          </p>
          <ul className="list-disc list-inside text-[var(--text-dark-secondary)] mt-2 space-y-1 pl-4 text-lg">
            <li className="uppercase">Gestión de Categorías Avanzada</li>
            <li className="uppercase">Analíticas de Ventas Detalladas</li>
          </ul>
        </div>
      </main>

      <footer className={`bg-[var(--light-bg-alt)]/70 border-t border-[${ACCENT_COLOR}]/30 text-[var(--text-dark-secondary)] py-8 text-center`}>
        <div className="container mx-auto px-6">
          <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} SPORT FLEX. PANEL DE ADMINISTRACIÓN.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;