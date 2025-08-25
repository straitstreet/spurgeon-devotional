#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const DIST_DIR = './dist';
const OUTPUT_FILE = './worker.js';

function getAllFiles(dir, files = []) {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

function getMimeType(filename) {
  const ext = extname(filename).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.webmanifest': 'application/manifest+json'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

function buildWorker() {
  const files = getAllFiles(DIST_DIR);
  const fileMap = {};
  
  // Read all files and create a map
  for (const filePath of files) {
    const relativePath = filePath.replace(/^\.?[\/\\]*dist[\/\\]*/, '');
    const content = readFileSync(filePath, 'utf-8');
    const mimeType = getMimeType(filePath);
    
    fileMap[relativePath] = {
      content,
      mimeType
    };
  }
  
  // Generate worker script
  const workerScript = `
// Auto-generated Cloudflare Worker for Spurgeon Devotional
const FILES = ${JSON.stringify(fileMap, null, 2)};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    let pathname = url.pathname;
    
    // Handle root path
    if (pathname === '/') {
      pathname = '/index.html';
    }
    
    // Remove leading slash
    const filePath = pathname.startsWith('/') ? pathname.slice(1) : pathname;
    
    // Check if file exists
    if (FILES[filePath]) {
      const file = FILES[filePath];
      return new Response(file.content, {
        headers: {
          'Content-Type': file.mimeType,
          'Cache-Control': file.mimeType.includes('html') 
            ? 'public, max-age=300' 
            : 'public, max-age=31536000'
        }
      });
    }
    
    // For SPA routing, serve index.html for non-asset paths
    if (!filePath.includes('.') && FILES['index.html']) {
      const indexFile = FILES['index.html'];
      return new Response(indexFile.content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};`;

  writeFileSync(OUTPUT_FILE, workerScript);
  console.log(`✅ Worker script generated: ${OUTPUT_FILE}`);
  console.log(`📦 Embedded ${files.length} files`);
}

buildWorker();