import { useState } from 'preact/hooks';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-preact';

interface DatePickerProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePicker({ currentDate, onDateChange, onClose }: DatePickerProps) {
  const [viewDate, setViewDate] = useState(new Date(currentDate));
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const selectedDate = new Date(currentDate);
  selectedDate.setHours(0, 0, 0, 0);
  
  const viewMonth = viewDate.getMonth();
  const viewYear = viewDate.getFullYear();
  
  // Get first day of month and days in month
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  // Generate calendar days
  const days = [];
  
  // Previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(firstDayOfMonth);
    date.setDate(date.getDate() - (i + 1));
    days.push({ date, isCurrentMonth: false });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(viewYear, viewMonth, day);
    days.push({ date, isCurrentMonth: true });
  }
  
  // Next month's leading days
  const remainingSlots = 42 - days.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingSlots; day++) {
    const date = new Date(viewYear, viewMonth + 1, day);
    days.push({ date, isCurrentMonth: false });
  }
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };
  
  const handleDateClick = (date: Date) => {
    onDateChange(date);
    onClose();
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        padding: '1.5rem',
        maxWidth: '320px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid var(--color-brown-100)'
        }}>
          <button
            onClick={() => navigateMonth('prev')}
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
              transition: 'background 0.2s ease'
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
            <ChevronLeft size={20} />
          </button>
          
          <h3 style={{
            margin: 0,
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'var(--color-brown-800)'
          }}>
            {MONTHS[viewMonth]} {viewYear}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
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
              transition: 'background 0.2s ease'
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
            <ChevronRight size={20} />
          </button>
        </div>
        
        {/* Day headers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          marginBottom: '0.5rem'
        }}>
          {DAYS.map(day => (
            <div
              key={day}
              style={{
                padding: '0.5rem 0.25rem',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: '500',
                color: 'var(--color-brown-500)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '2px'
        }}>
          {days.map(({ date, isCurrentMonth }, index) => {
            const isToday = date.getTime() === today.getTime();
            const isSelected = date.getTime() === selectedDate.getTime();
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                style={{
                  padding: '0.75rem 0.25rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: isSelected 
                    ? 'var(--color-brown-800)' 
                    : isToday 
                    ? 'var(--color-brown-100)' 
                    : 'transparent',
                  color: isSelected 
                    ? 'white' 
                    : isToday 
                    ? 'var(--color-brown-800)' 
                    : isCurrentMonth 
                    ? 'var(--color-brown-700)' 
                    : 'var(--color-brown-300)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isToday || isSelected ? '600' : '400',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '2.5rem'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    const target = e.target as HTMLElement;
                    target.style.background = 'var(--color-brown-100)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    const target = e.target as HTMLElement;
                    target.style.background = isToday ? 'var(--color-brown-100)' : 'transparent';
                  }
                }}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        
        {/* Quick actions */}
        <div style={{
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--color-brown-100)',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => handleDateClick(today)}
            style={{
              background: 'var(--color-brown-50)',
              border: '1px solid var(--color-brown-200)',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--color-brown-700)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              const target = e.target as HTMLElement;
              target.style.background = 'var(--color-brown-100)';
            }}
            onMouseOut={(e) => {
              const target = e.target as HTMLElement;
              target.style.background = 'var(--color-brown-50)';
            }}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}