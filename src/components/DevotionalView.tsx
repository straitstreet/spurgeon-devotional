import { useState } from 'preact/hooks';
import { Sun, Moon, Calendar } from 'lucide-preact';
import type { DevotionalEntry } from '../types/devotional';

interface DevotionalViewProps {
  devotional: DevotionalEntry | null;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DevotionalView({ devotional, currentDate }: DevotionalViewProps) {
  const [activeTime, setActiveTime] = useState<'morning' | 'evening'>('morning');

  if (!devotional) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card text-center">
          <h2 className="mb-4">No devotional available</h2>
          <p style={{ color: 'var(--color-brown-600)' }}>
            We don't have a devotional reading for {currentDate.toLocaleDateString()}.
          </p>
        </div>
      </div>
    );
  }

  const currentReading = devotional[activeTime];
  const today = new Date();
  const isToday = currentDate.toDateString() === today.toDateString();

  return (
    <div className="container" style={{ padding: '2rem 1rem' }}>
      {/* Date Display */}
      <div className="text-center mb-6">
        <h2 style={{ 
          color: 'var(--color-brown-700)', 
          marginBottom: '0.5rem',
          fontWeight: '400'
        }}>
          {isToday ? 'Today' : currentDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric', 
            month: 'long',
            day: 'numeric'
          })}
        </h2>
      </div>

      {/* Morning/Evening Toggle */}
      <div className="text-center mb-8">
        <div className="nav-pill" style={{ maxWidth: '300px', margin: '0 auto' }}>
          <button
            className={activeTime === 'morning' ? 'active' : ''}
            onClick={() => setActiveTime('morning')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Sun size={16} />
            Morning
          </button>
          <button
            className={activeTime === 'evening' ? 'active' : ''}
            onClick={() => setActiveTime('evening')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Moon size={16} />
            Evening
          </button>
        </div>
      </div>

      {/* Devotional Content */}
      <div className="card">
        <div className="verse-reference">
          {currentReading.verse}
        </div>
        
        <div style={{ 
          fontStyle: 'italic',
          color: 'var(--color-brown-700)',
          marginBottom: '1.5rem',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          "{currentReading.text}"
        </div>
        
        <div className="reading-content">
          {currentReading.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Navigation hint for future */}
      <div className="text-center" style={{ marginTop: '2rem' }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: 'var(--color-brown-600)',
          opacity: 0.7
        }}>
          More devotionals and navigation coming soon
        </p>
      </div>
    </div>
  );
}