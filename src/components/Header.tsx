import { Settings } from 'lucide-preact';

interface HeaderProps {
  currentView: 'devotional' | 'about';
  onViewChange: (view: 'devotional' | 'about') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header style={{ 
      background: 'var(--color-warm-white)', 
      borderBottom: '1px solid var(--color-brown-100)',
      padding: '1rem 0 0.75rem 0'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
            Spurgeon's Morning & Evening
          </h1>
          
          <button
            onClick={() => onViewChange(currentView === 'about' ? 'devotional' : 'about')}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brown-600)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              target.style.background = 'var(--color-brown-100)';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLElement;
              target.style.background = 'none';
            }}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}