export interface DevotionalReading {
  date: string;
  time: 'Morning' | 'Evening';
  verse: string;
  text: string;
  content: string;
}

export interface DevotionalEntry {
  morning: DevotionalReading;
  evening: DevotionalReading;
}

export interface DevotionalData {
  title: string;
  description: string;
  year: number;
  devotionals: Record<string, DevotionalEntry>;
}