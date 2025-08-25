#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function fixTypography(text) {
  return text
    // Convert Unicode escapes to actual characters first
    .replace(/\\u2014/g, '—')  // em dash
    .replace(/\\u2013/g, '–')  // en dash
    .replace(/\\u2009/g, ' ')  // thin space
    .replace(/\\u00a0/g, ' ')  // non-breaking space
    .replace(/\\u2026/g, '…')  // ellipsis
    
    // Clean up any remaining carriage returns and normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    
    // Normalize multiple spaces
    .replace(/  +/g, ' ')
    
    // Fix common typography issues
    .replace(/\s+—/g, '—')     // Remove space before em dash
    .replace(/—\s+/g, '—')     // Remove space after em dash
    .replace(/\.\.\./g, '…')   // Convert three dots to ellipsis
    
    // Remove trailing whitespace from each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

function processJson() {
  const inputFile = path.join(__dirname, '../data/spurgeon.json');
  const outputFile = path.join(__dirname, '../data/spurgeon-fixed.json');
  
  console.log('Reading raw spurgeon.json...');
  const rawData = fs.readFileSync(inputFile, 'utf8');
  
  console.log('Parsing JSON...');
  const data = JSON.parse(rawData);
  
  console.log(`Processing ${data.length} devotional entries...`);
  
  let processed = 0;
  const fixedData = data.map(entry => {
    const fixed = {
      ...entry,
      keyverse: fixTypography(entry.keyverse),
      body: fixTypography(entry.body)
    };
    
    processed++;
    if (processed % 50 === 0) {
      console.log(`Processed ${processed}/${data.length} entries...`);
    }
    
    return fixed;
  });
  
  console.log('Writing fixed data...');
  fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2));
  
  console.log(`✅ Typography fixed! Output written to: ${outputFile}`);
  console.log(`📊 Processed ${fixedData.length} devotional entries`);
}

// Run the script
try {
  processJson();
} catch (error) {
  console.error('❌ Error processing typography:', error);
  process.exit(1);
}