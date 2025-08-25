import { useState } from 'preact/hooks';
import { Sun, Moon, Calendar, ChevronLeft, ChevronRight } from 'lucide-preact';
import { DatePicker } from './DatePicker';
import type { DevotionalEntry } from '../types/devotional';

interface DevotionalViewProps {
  devotional: DevotionalEntry | null;
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function DevotionalView({ devotional, currentDate, onDateChange }: DevotionalViewProps) {
  const [activeTime, setActiveTime] = useState<'morning' | 'evening'>('morning');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const navigateDate = (direction: 'prev' | 'next') => {
    // Get current month/day
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    
    // Create a list of all available dates (01-01 to 12-31)
    const allDates: Array<{month: number, day: number}> = [];
    for (let month = 1; month <= 12; month++) {
      const daysInMonth = new Date(2024, month, 0).getDate(); // Using 2024 (leap year) for max days
      for (let day = 1; day <= daysInMonth; day++) {
        allDates.push({ month, day });
      }
    }
    
    // Find current index
    const currentIndex = allDates.findIndex(d => d.month === currentMonth && d.day === currentDay);
    
    // Calculate new index with wrapping
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % allDates.length;
    } else {
      newIndex = currentIndex === 0 ? allDates.length - 1 : currentIndex - 1;
    }
    
    // Create new date
    const newDateInfo = allDates[newIndex];
    const newDate = new Date(currentDate.getFullYear(), newDateInfo.month - 1, newDateInfo.day);
    onDateChange(newDate);
  };

  const handleDatePickerChange = (date: Date) => {
    onDateChange(date);
    setShowDatePicker(false);
  };

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
    <div style={{ minHeight: '100vh', background: 'var(--color-cream)', position: 'relative' }}>
      {/* Compact Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        maxWidth: '42rem',
        margin: '0 auto',
        gap: '1rem'
      }}>
        {/* Date Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          flex: 1,
          justifyContent: 'center'
        }}>
          <button
            onClick={() => navigateDate('prev')}
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brown-600)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              width: '40px',
              height: '40px',
              flexShrink: 0
            }}
          >
            <ChevronLeft size={18} />
          </button>
          
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-brown-700)',
              fontSize: '0.875rem',
              fontWeight: '500',
              padding: '0.5rem 0.75rem',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)',
              minWidth: '100px',
              justifyContent: 'center'
            }}
          >
            <Calendar size={16} />
            <span>
              {isToday ? 'Today' : currentDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </button>
          
          <button
            onClick={() => navigateDate('next')}
            style={{
              background: 'rgba(255,255,255,0.8)',
              border: 'none',
              padding: '0.5rem',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-brown-600)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              width: '40px',
              height: '40px',
              flexShrink: 0
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Morning/Evening Toggle */}
        <div style={{ 
          display: 'flex',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '20px',
          padding: '2px',
          gap: '2px',
          backdropFilter: 'blur(10px)',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTime('morning')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              padding: '0.375rem 0.75rem',
              border: 'none',
              borderRadius: '18px',
              background: activeTime === 'morning' ? 'var(--color-brown-800)' : 'transparent',
              color: activeTime === 'morning' ? 'white' : 'var(--color-brown-600)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <Sun size={12} />
            Morning
          </button>
          <button
            onClick={() => setActiveTime('evening')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.25rem',
              padding: '0.375rem 0.75rem',
              border: 'none',
              borderRadius: '18px',
              background: activeTime === 'evening' ? 'var(--color-brown-800)' : 'transparent',
              color: activeTime === 'evening' ? 'white' : 'var(--color-brown-600)',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            <Moon size={12} />
            Evening
          </button>
        </div>
      </div>

      {/* Devotional Content - No Card Styling */}
      <div style={{
        maxWidth: '42rem',
        margin: '0 auto',
        padding: '0 1rem 2rem 1rem'
      }}>
        <div className="verse-reference" style={{
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          {currentReading.verse}
        </div>
        
        <div style={{ 
          fontStyle: 'italic',
          color: 'var(--color-brown-700)',
          marginBottom: '2rem',
          fontSize: '1.125rem',
          lineHeight: '1.7',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.6)',
          padding: '1rem',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          "{currentReading.text}"
        </div>
        
        <div className="reading-content" style={{
          background: 'rgba(255,255,255,0.7)',
          padding: '1.5rem',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {currentReading.content.split('\n').map((paragraph, index) => (
            <p key={index} style={{ marginBottom: paragraph.trim() ? '1rem' : '0' }}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Beautiful Date Picker */}
      {showDatePicker && (
        <DatePicker
          currentDate={currentDate}
          onDateChange={handleDatePickerChange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}