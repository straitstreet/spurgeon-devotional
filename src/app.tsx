import { useState, useEffect } from 'preact/hooks';
import { DevotionalView } from './components/DevotionalView';
import { Header } from './components/Header';
import { About } from './components/About';
import { devotionalData as rawDevotionalData, getReading } from './data/devotional-data.js';
import type { DevotionalData, DevotionalEntry } from './types/devotional';

type View = 'devotional' | 'about';

export function App() {
  const [currentView, setCurrentView] = useState<View>('devotional');
  const [devotionalData, setDevotionalData] = useState<DevotionalData | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use pre-loaded binary data for ultra-fast loading
    const transformed = {
      title: rawDevotionalData.meta.title,
      description: rawDevotionalData.meta.description,
      year: rawDevotionalData.meta.year,
      devotionals: {}
    };
    
    // Transform binary format to expected format
    Object.entries(rawDevotionalData.readings).forEach(([date, readings]: [string, any[]]) => {
      transformed.devotionals[date] = {};
      
      readings.forEach((reading: number[]) => {
        const [timeFlag, dateIdx, verseIdx, textIdx, contentIdx] = reading;
        const time = timeFlag === 0 ? 'morning' : 'evening';
        
        transformed.devotionals[date][time] = {
          date: rawDevotionalData.tables.dates[dateIdx],
          time: time === 'morning' ? 'Morning' : 'Evening',
          verse: rawDevotionalData.tables.verses[verseIdx],
          text: rawDevotionalData.tables.texts[textIdx],
          content: rawDevotionalData.tables.contents[contentIdx]
        };
      });
    });
    
    setDevotionalData(transformed);
    setLoading(false);
  }, []);

  const getTodaysReading = (): DevotionalEntry | null => {
    if (!devotionalData) return null;
    
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const dateKey = `${month}-${day}`;
    
    
    return devotionalData.devotionals[dateKey] || null;
  };

  if (loading) {
    return (
      <div className="loading">
        <div>Loading devotional...</div>
      </div>
    );
  }

  return (
    <div id="app">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
      />
      
      <main style={{ flex: 1 }}>
        {currentView === 'devotional' ? (
          <DevotionalView 
            devotional={getTodaysReading()}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        ) : (
          <About />
        )}
      </main>
    </div>
  );
}