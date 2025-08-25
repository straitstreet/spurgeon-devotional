// Ultra-optimized data compression for spurgeon devotional
import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/spurgeon-transformed.json', 'utf-8'));

// Create ultra-compressed format
const optimized = {
  t: data.title,
  d: data.description, 
  y: data.year,
  r: {} // readings
};

// Create lookup tables for common strings
const commonWords = {};
const verses = {};
let wordId = 0;
let verseId = 0;

Object.entries(data.devotionals).forEach(([date, day]) => {
  const compressedDay = {};
  
  ['morning', 'evening'].forEach(time => {
    if (day[time]) {
      const reading = day[time];
      
      // Store verse reference separately if not already stored
      if (!verses[reading.verse]) {
        verses[reading.verse] = verseId++;
      }
      
      compressedDay[time[0]] = { // 'm' or 'e'
        d: reading.date,
        v: verses[reading.verse],
        t: reading.text,
        c: reading.content
      };
    }
  });
  
  optimized.r[date] = compressedDay;
});

// Add lookup tables
optimized.v = Object.keys(verses); // verse references

const result = JSON.stringify(optimized);

// Create gzip-style compression simulation by removing common patterns
const ultraCompressed = result
  .replace(/,"c":/g, ',c:')
  .replace(/,"d":/g, ',d:')
  .replace(/,"t":/g, ',t:')
  .replace(/,"v":/g, ',v:')
  .replace(/,"m":/g, ',m:')
  .replace(/,"e":/g, ',e:');

fs.writeFileSync('./data/spurgeon-optimized.json', result);
fs.writeFileSync('./public/data/spurgeon.json', result);

console.log(`Original: ${(fs.statSync('./data/spurgeon.json').size / 1024).toFixed(1)}KB`);
console.log(`Transformed: ${(fs.statSync('./data/spurgeon-transformed.json').size / 1024).toFixed(1)}KB`);
console.log(`Optimized: ${(result.length / 1024).toFixed(1)}KB`);
console.log(`Verses indexed: ${Object.keys(verses).length}`);