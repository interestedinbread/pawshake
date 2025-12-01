import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Upload', to: '/upload' },
  { label: 'Summary', to: '/summary' },
  { label: 'Q&A', to: '/qa' },
  { label: 'Compare', to: '/compare' },
  { label: 'Claim Checklist', to: '/claim-checklist'}
];

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-dark-bg)]">
      <header className="border-b bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full">
              <img 
                src="noun-paw-print.svg"
                className='h-auto w-auto'/>
            </div>
            <div>
              <p className="text-4xl font-semibold text-[var(--color-dark-text-primary)] font-['Nunito']">Policy Boi</p>
              <p className="text-sm italic text-[var(--color-dark-text-secondary)] font-['Inter']">Understand policies • File claims confidently</p>
            </div>
          </div>

          <nav className="hidden gap-6 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden flex-col text-right md:flex">
                <span className="text-sm font-semibold text-[var(--color-dark-text-primary)]">{user.email}</span>
                <span className="text-xs text-[var(--color-dark-text-muted)]">Authenticated user</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-dark-card)] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <nav className="border-t md:hidden bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
            <div className="flex flex-col px-4 py-3 space-y-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'text-[var(--color-dark-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-dark-card)]'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
      </main>

      <footer className="border-t bg-[var(--color-dark-surface)] border-[var(--color-dark-border)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm md:flex-row text-[var(--color-dark-text-muted)]">
          <span>© {new Date().getFullYear()} Policy Boi</span>
        </div>
      </footer>
    </div>
  );
}
