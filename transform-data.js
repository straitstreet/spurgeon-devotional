// Transform spurgeon.json from flat array to grouped format
import fs from 'fs';

const rawData = JSON.parse(fs.readFileSync('./data/spurgeon.json', 'utf-8'));

const transformed = {
  title: "Morning and Evening by Charles H. Spurgeon",
  description: "Daily devotional readings for morning and evening by the Prince of Preachers",
  year: new Date().getFullYear(),
  devotionals: {}
};

// Group by date and combine morning/evening readings
const grouped = {};

rawData.forEach(reading => {
  const { date, time, keyverse, body } = reading;
  const [month, day] = date.split('-');
  const formattedDate = `${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  if (!grouped[formattedDate]) {
    grouped[formattedDate] = {};
  }

  // Extract date and title from body
  const lines = body.split('\r\n');
  const dateTitle = lines[0].trim();
  const verse = keyverse;
  
  // Get main content (skip date line and verse repetition)
  let content = lines.slice(3).join('\n').trim();
  
  // If content is still empty, try parsing the entire body
  if (!content && body) {
    // Split on the verse and take the part after it
    const verseIndex = body.indexOf(keyverse);
    if (verseIndex > -1) {
      content = body.substring(verseIndex + keyverse.length).trim();
      // Remove leading newlines and whitespace
      content = content.replace(/^\s*\n\s*/, '');
    } else {
      content = body;
    }
  }
  
  const timeKey = time === 'am' ? 'morning' : 'evening';
  
  grouped[formattedDate][timeKey] = {
    date: dateTitle.replace(/\u2014.*/, '').trim(),
    time: timeKey === 'morning' ? 'Morning' : 'Evening',
    verse: verse.replace(/^"(.+)"\s*—\s*(.+)$/, '$2'),
    text: verse.replace(/^"(.+)"\s*—\s*(.+)$/, '$1'),
    content: content
  };
});

transformed.devotionals = grouped;

// Write transformed data with compression optimizations
const output = JSON.stringify(transformed, null, 0);
fs.writeFileSync('./data/spurgeon-transformed.json', output);

// Also create a compressed binary version
const compressed = JSON.stringify(transformed, (key, value) => {
  if (typeof value === 'string') {
    // Remove extra whitespace and normalize line endings
    return value.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  }
  return value;
}, 0);

fs.writeFileSync('./data/spurgeon-compressed.json', compressed);

console.log(`Transformed ${rawData.length} readings into ${Object.keys(grouped).length} daily devotionals`);
console.log(`Original size: ${(fs.statSync('./data/spurgeon.json').size / 1024).toFixed(1)}KB`);
console.log(`Transformed size: ${(output.length / 1024).toFixed(1)}KB`);
console.log(`Compressed size: ${(compressed.length / 1024).toFixed(1)}KB`);