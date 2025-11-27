import { NavLink } from 'react-router-dom';
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

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--color-dark-bg)' }}>
      <header className="border-b" style={{ backgroundColor: 'var(--color-dark-surface)', borderColor: 'var(--color-dark-border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full font-semibold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-dark-bg)' }}>
              PI
            </div>
            <div>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>Pet Insurance Assistant</p>
              <p className="text-sm" style={{ color: 'var(--color-dark-text-secondary)' }}>Understand policies • File claims faster</p>
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
                <span className="text-sm font-semibold" style={{ color: 'var(--color-dark-text-primary)' }}>{user.email}</span>
                <span className="text-xs" style={{ color: 'var(--color-dark-text-muted)' }}>Authenticated user</span>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <nav className="border-t md:hidden" style={{ backgroundColor: 'var(--color-dark-surface)', borderColor: 'var(--color-dark-border)' }}>
          <div className="flex justify-around px-2 py-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${
                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-dark-text-secondary)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
      </main>

      <footer className="border-t" style={{ backgroundColor: 'var(--color-dark-surface)', borderColor: 'var(--color-dark-border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm md:flex-row" style={{ color: 'var(--color-dark-text-muted)' }}>
          <span>© {new Date().getFullYear()} Pet Insurance Assistant.</span>
          <span>Build smarter claim experiences for pet owners.</span>
        </div>
      </footer>
    </div>
  );
}
