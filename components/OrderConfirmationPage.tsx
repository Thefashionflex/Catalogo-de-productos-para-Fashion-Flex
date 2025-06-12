import React from 'react';
import { Link } from 'react-router-dom';

const ACCENT_COLOR = 'var(--accent-color-primary)';

const OrderConfirmationPage: React.FC = () => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white p-6`}>
      <div className="grainy-overlay"></div>
      
      <div className="relative z-10 text-center bg-[var(--light-bg-alt)]/80 backdrop-blur-md p-8 md:p-12 rounded-xl shadow-2xl w-full max-w-lg border border-[${ACCENT_COLOR}]/30">
        <div className="mb-6">
          <svg className={`w-16 h-16 text-[${ACCENT_COLOR}] mx-auto`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className={`text-3xl md:text-4xl font-medium font-['Anton'] text-[${ACCENT_COLOR}] mb-4 tracking-wider uppercase`}>
          ¡Pedido Confirmado!
        </h1>
        <p className="text-md md:text-lg text-[var(--text-dark-secondary)] mb-8 tracking-wide">
          GRACIAS POR TU COMPRA. HEMOS RECIBIDO TU PEDIDO Y LO ESTAMOS PROCESANDO. RECIBIRÁS UNA CONFIRMACIÓN POR CORREO ELECTRÓNICO EN BREVE.
        </p>
        <Link
          to="/"
          className={`inline-block bg-[${ACCENT_COLOR}] hover:bg-opacity-90 text-white font-bold py-3 px-8 rounded-md
                     transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] tracking-wider text-base uppercase
                     focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/70 focus:ring-offset-2 focus:ring-offset-[var(--light-bg-alt)]`}
        >
          Seguir Comprando
        </Link>
      </div>
      <footer className={`text-[var(--text-dark-secondary)] py-8 text-center mt-12 z-10`}>
          <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} SPORT FLEX. GRACIAS POR TU PREFERENCIA.</p>
       </footer>
    </div>
  );
};

export default OrderConfirmationPage;
