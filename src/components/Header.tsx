import { Book, Info } from 'lucide-preact';

interface HeaderProps {
  currentView: 'devotional' | 'about';
  onViewChange: (view: 'devotional' | 'about') => void;
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  return (
    <header style={{ 
      background: 'var(--color-warm-white)', 
      borderBottom: '1px solid var(--color-brown-100)',
      padding: '1rem 0'
    }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '1rem'
        }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>
            Spurgeon Devotional
          </h1>
        </div>
        
        <nav className="nav-pill">
          <button
            className={currentView === 'devotional' ? 'active' : ''}
            onClick={() => onViewChange('devotional')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Book size={16} />
            Daily Reading
          </button>
          <button
            className={currentView === 'about' ? 'active' : ''}
            onClick={() => onViewChange('about')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Info size={16} />
            About
          </button>
        </nav>
      </div>
    </header>
  );
}