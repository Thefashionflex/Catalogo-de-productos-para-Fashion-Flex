
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ACCENT_COLOR = 'var(--accent-color-primary)';
const NUM_TRAILS = 7; // For consistency if we add trails here later

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || "/admin";

  // Basic cursor dot movement (trails are more complex and currently in CatalogPage)
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
   useEffect(() => {
    cursorDotRef.current = document.querySelector('.cursor-dot');
    const mainDot = cursorDotRef.current;

    if (!mainDot) {
      console.warn("Custom cursor dot not found in DOM for LoginPage.");
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


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[var(--light-bg)] via-[var(--light-bg-alt)] to-[var(--light-bg)] font-['Montserrat'] text-[var(--text-dark-primary)] selection:bg-[${ACCENT_COLOR}] selection:text-white p-6`}>
      <div className="grainy-overlay"></div>
      
      <div className="relative z-10 text-center mb-12">
        <h1
          className={`text-7xl md:text-8xl font-['Anton'] uppercase tracking-[0.1em] md:tracking-[0.15em] text-[${ACCENT_COLOR}] select-none`}
          aria-label="Sport Flex Admin Login"
        >
          SPORT FLEX
        </h1>
        <p className={`text-lg text-[var(--text-dark-secondary)] tracking-wider uppercase`}>Panel de Administración</p>
      </div>

      <div className="relative z-10 bg-[var(--light-bg-alt)]/80 backdrop-blur-md p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-md border border-[${ACCENT_COLOR}]/30">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[var(--text-dark-primary)] mb-1.5 tracking-wide uppercase"
            >
              Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`appearance-none block w-full px-4 py-3 border border-gray-300/70 rounded-md shadow-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/80
                         focus:border-[${ACCENT_COLOR}] sm:text-sm bg-[var(--light-bg)]/70 text-[var(--text-dark-primary)]
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
              placeholder="sport.flex"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[var(--text-dark-primary)] mb-1.5 tracking-wide uppercase"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`appearance-none block w-full px-4 py-3 border border-gray-300/70 rounded-md shadow-sm
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[${ACCENT_COLOR}]/80
                         focus:border-[${ACCENT_COLOR}] sm:text-sm bg-[var(--light-bg)]/70 text-[var(--text-dark-primary)]
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]`}
              placeholder="••••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100/50 border border-red-500/30 p-3 rounded-md text-center tracking-wide">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm
                         font-medium text-[var(--light-bg-alt)] bg-[${ACCENT_COLOR}] hover:bg-opacity-90
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[${ACCENT_COLOR}]
                         transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] tracking-wider uppercase`}
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
       <footer className={`text-[var(--text-dark-secondary)] py-8 text-center mt-12 z-10`}>
          <p className="tracking-wider text-sm uppercase">&copy; {new Date().getFullYear()} SPORT FLEX ADMINISTRACIÓN.</p>
       </footer>
    </div>
  );
};

export default LoginPage;
