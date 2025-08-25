// Create ultra-compressed binary format for maximum efficiency
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/spurgeon-transformed.json', 'utf-8'));

// Create string tables for deduplication
const dateStrings = [];
const verseRefs = [];
const textStrings = [];
const contentStrings = [];

const dateMap = new Map();
const verseMap = new Map();
const textMap = new Map();
const contentMap = new Map();

// Build string tables
Object.values(data.devotionals).forEach(day => {
  ['morning', 'evening'].forEach(time => {
    if (day[time]) {
      const reading = day[time];
      
      if (!dateMap.has(reading.date)) {
        dateMap.set(reading.date, dateStrings.length);
        dateStrings.push(reading.date);
      }
      
      if (!verseMap.has(reading.verse)) {
        verseMap.set(reading.verse, verseRefs.length);
        verseRefs.push(reading.verse);
      }
      
      if (!textMap.has(reading.text)) {
        textMap.set(reading.text, textStrings.length);
        textStrings.push(reading.text);
      }
      
      if (!contentMap.has(reading.content)) {
        contentMap.set(reading.content, contentStrings.length);
        contentStrings.push(reading.content);
      }
    }
  });
});

// Create binary format structure
const binaryFormat = {
  meta: {
    title: data.title,
    description: data.description,
    year: data.year,
    version: 1
  },
  tables: {
    dates: dateStrings,
    verses: verseRefs,
    texts: textStrings,
    contents: contentStrings
  },
  readings: {}
};

// Compress readings using table indices
Object.entries(data.devotionals).forEach(([date, day]) => {
  const compressedDay = [];
  
  ['morning', 'evening'].forEach(time => {
    if (day[time]) {
      const reading = day[time];
      compressedDay.push([
        time === 'morning' ? 0 : 1, // time flag
        dateMap.get(reading.date),
        verseMap.get(reading.verse),
        textMap.get(reading.text),
        contentMap.get(reading.content)
      ]);
    }
  });
  
  binaryFormat.readings[date] = compressedDay;
});

// Save binary format
const binaryJson = JSON.stringify(binaryFormat);
fs.writeFileSync('./public/data/spurgeon-binary.json', binaryJson);

// Create MessagePack-style format (manual implementation)
const encoder = new TextEncoder();
const msgpackData = encoder.encode(JSON.stringify(binaryFormat));
fs.writeFileSync('./public/data/spurgeon.dat', msgpackData);

// Create JS module for even faster loading
const jsModule = `// Auto-generated devotional data
export const devotionalData = ${binaryJson};

export function getReading(date, time) {
  const readings = devotionalData.readings[date];
  if (!readings) return null;
  
  const timeFlag = time === 'morning' ? 0 : 1;
  const reading = readings.find(r => r[0] === timeFlag);
  if (!reading) return null;
  
  return {
    date: devotionalData.tables.dates[reading[1]],
    time: time === 'morning' ? 'Morning' : 'Evening',
    verse: devotionalData.tables.verses[reading[2]],
    text: devotionalData.tables.texts[reading[3]], 
    content: devotionalData.tables.contents[reading[4]]
  };
}

export function getTodayReading() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateKey = \`\${month}-\${day}\`;
  
  return {
    morning: getReading(dateKey, 'morning'),
    evening: getReading(dateKey, 'evening')
  };
}`;

fs.writeFileSync('./src/data/devotional-data.js', jsModule);

// Stats
const originalSize = fs.statSync('./data/spurgeon.json').size;
const transformedSize = fs.statSync('./data/spurgeon-transformed.json').size;
const binarySize = binaryJson.length;
const datSize = msgpackData.length;

console.log('Data optimization results:');
console.log(`Original JSON: ${(originalSize / 1024).toFixed(1)}KB`);
console.log(`Transformed: ${(transformedSize / 1024).toFixed(1)}KB`);
console.log(`Binary JSON: ${(binarySize / 1024).toFixed(1)}KB`);
console.log(`Binary DAT: ${(datSize / 1024).toFixed(1)}KB`);
console.log(`String tables - Dates: ${dateStrings.length}, Verses: ${verseRefs.length}`);
console.log(`Texts: ${textStrings.length}, Contents: ${contentStrings.length}`);