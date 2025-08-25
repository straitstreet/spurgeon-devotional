#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import readline from 'readline';

const colors = {
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  cyan: '\x1b[36m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const execSilent = (command) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
};

const question = (prompt) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

const parseCommits = (gitLog) => {
  const commits = gitLog.split('\n').filter(line => line.trim());
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    other: []
  };

  commits.forEach(commit => {
    const msg = commit.toLowerCase();
    
    // Categorize commits based on keywords
    if (msg.includes('feat:') || msg.includes('feature:') || msg.includes('add') || msg.includes('new')) {
      categories.features.push(commit);
    } else if (msg.includes('fix:') || msg.includes('bug:') || msg.includes('fixes') || msg.includes('resolve')) {
      categories.fixes.push(commit);
    } else if (msg.includes('improve') || msg.includes('enhance') || msg.includes('update') || msg.includes('optimize')) {
      categories.improvements.push(commit);
    } else if (!msg.includes('merge') && !msg.includes('bump version') && commit.length > 10) {
      categories.other.push(commit);
    }
  });

  return categories;
};

const generateReleaseNotes = (version, commits, type = 'web') => {
  const { features, fixes, improvements, other } = commits;
  
  let notes = '';
  
  if (type === 'web') {
    // GitHub/Web release format (Markdown)
    notes = `## 🙏 Spurgeon Devotional v${version}\n\n`;
    notes += `*Daily devotional readings from Charles Spurgeon's "Morning & Evening"*\n\n`;
    
    if (features.length > 0) {
      notes += `### ✨ New Features\n`;
      features.forEach(feat => {
        const clean = feat.replace(/^[a-f0-9]+\s+/, '').replace(/feat:|feature:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    if (improvements.length > 0) {
      notes += `### 🔧 Improvements\n`;
      improvements.forEach(imp => {
        const clean = imp.replace(/^[a-f0-9]+\s+/, '').replace(/improve:|enhance:|update:|optimize:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    if (fixes.length > 0) {
      notes += `### 🐛 Bug Fixes\n`;
      fixes.forEach(fix => {
        const clean = fix.replace(/^[a-f0-9]+\s+/, '').replace(/fix:|bug:|fixes:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    if (other.length > 0) {
      notes += `### 📝 Other Changes\n`;
      other.slice(0, 5).forEach(change => {
        const clean = change.replace(/^[a-f0-9]+\s+/, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    // Add standard footer
    notes += `---\n\n`;
    notes += `**About Spurgeon Devotional**\n`;
    notes += `A beautiful, lightweight devotional app featuring Charles Spurgeon's beloved "Morning & Evening" daily readings. Available as a Progressive Web App and on Google Play Store.\n\n`;
    notes += `📖 **365 days** of spiritual encouragement\n`;
    notes += `⚡ **Fast & lightweight** - works offline\n`;
    notes += `📱 **Cross-platform** - web, Android, and PWA\n`;
    notes += `🎨 **Beautiful design** inspired by classic devotional books\n\n`;
    notes += `*"This devotional has been a blessing to millions for over 150 years"*`;
    
  } else if (type === 'playstore') {
    // Google Play Store format (plain text, concise)
    notes = `🙏 Spurgeon Devotional v${version}\n\n`;
    
    const allChanges = [...features, ...improvements, ...fixes];
    if (allChanges.length > 0) {
      notes += `What's new in this version:\n\n`;
      allChanges.slice(0, 4).forEach(change => {
        const clean = change.replace(/^[a-f0-9]+\s+/, '').replace(/(feat:|fix:|improve:|feature:|bug:|enhance:|update:|optimize:)/i, '').trim();
        const emoji = change.toLowerCase().includes('fix') ? '🐛' : 
                      change.toLowerCase().includes('feat') ? '✨' : '🔧';
        notes += `${emoji} ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
    } else {
      notes += `This version includes performance improvements and bug fixes.\n`;
    }
    
    notes += `\n📖 Daily readings from Charles Spurgeon's beloved "Morning & Evening"\n`;
    notes += `⚡ Fast, offline-capable, and beautifully designed\n`;
    notes += `🎯 Perfect for daily devotional time\n\n`;
    notes += `Thank you for using Spurgeon Devotional! 🙏`;
    
  } else if (type === 'changelog') {
    // CHANGELOG.md format
    notes = `## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n`;
    
    if (features.length > 0) {
      notes += `### Added\n`;
      features.forEach(feat => {
        const clean = feat.replace(/^[a-f0-9]+\s+/, '').replace(/feat:|feature:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    if (improvements.length > 0) {
      notes += `### Changed\n`;
      improvements.forEach(imp => {
        const clean = imp.replace(/^[a-f0-9]+\s+/, '').replace(/improve:|enhance:|update:|optimize:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
    
    if (fixes.length > 0) {
      notes += `### Fixed\n`;
      fixes.forEach(fix => {
        const clean = fix.replace(/^[a-f0-9]+\s+/, '').replace(/fix:|bug:|fixes:/i, '').trim();
        notes += `- ${clean.charAt(0).toUpperCase() + clean.slice(1)}\n`;
      });
      notes += `\n`;
    }
  }
  
  return notes;
};

const editReleaseNotes = async (notes, type) => {
  // Write to temp file for editing
  const tempFile = `/tmp/release-notes-${type}.txt`;
  fs.writeFileSync(tempFile, notes);
  
  log(`\n${colors.cyan}📝 Generated ${type} release notes. Review and edit if needed:${colors.reset}`);
  log(colors.yellow + '─'.repeat(60) + colors.reset);
  console.log(notes);
  log(colors.yellow + '─'.repeat(60) + colors.reset);
  
  const edit = await question(`Edit these release notes? (y/n): `);
  if (edit.toLowerCase() === 'y' || edit.toLowerCase() === 'yes') {
    const editor = process.env.EDITOR || 'nano';
    try {
      execSync(`${editor} ${tempFile}`, { stdio: 'inherit' });
      return fs.readFileSync(tempFile, 'utf8');
    } catch (error) {
      log('Editor failed, using original notes', colors.yellow);
      return notes;
    }
  }
  
  return notes;
};

const generateAllReleaseNotes = async (version, isInteractive = true) => {
  log(`${colors.bold}${colors.blue}📝 Generating Release Notes for v${version}${colors.reset}`);
  
  // Get git log since last tag
  const lastTag = execSilent('git describe --tags --abbrev=0') || 'HEAD~10';
  const gitLog = execSilent(`git log ${lastTag}..HEAD --oneline --no-merges`);
  
  if (!gitLog) {
    log('⚠️  No commits found since last release', colors.yellow);
    const commits = { features: [], fixes: [], improvements: [], other: ['Initial release'] };
    return generateBasicReleaseNotes(version, commits);
  }
  
  log(`📊 Found ${gitLog.split('\n').length} commits since ${lastTag}`);
  
  const commits = parseCommits(gitLog);
  
  // Generate different formats
  const webNotes = generateReleaseNotes(version, commits, 'web');
  const playStoreNotes = generateReleaseNotes(version, commits, 'playstore');
  const changelogNotes = generateReleaseNotes(version, commits, 'changelog');
  
  let finalNotes = {
    web: webNotes,
    playstore: playStoreNotes,
    changelog: changelogNotes
  };
  
  if (isInteractive) {
    // Allow editing
    finalNotes.web = await editReleaseNotes(webNotes, 'web');
    finalNotes.playstore = await editReleaseNotes(playStoreNotes, 'play-store');
  }
  
  // Save to files
  fs.writeFileSync('release-notes-web.md', finalNotes.web);
  fs.writeFileSync('release-notes-playstore.txt', finalNotes.playstore);
  
  // Update CHANGELOG.md
  let changelog = '';
  if (fs.existsSync('CHANGELOG.md')) {
    changelog = fs.readFileSync('CHANGELOG.md', 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  // Add new entry at the top
  const changelogLines = changelog.split('\n');
  const insertIndex = changelogLines.findIndex(line => line.startsWith('## [')) || 3;
  changelogLines.splice(insertIndex, 0, finalNotes.changelog);
  
  fs.writeFileSync('CHANGELOG.md', changelogLines.join('\n'));
  
  log(`\n${colors.green}✅ Release notes generated successfully!${colors.reset}`);
  log(`📄 Web release notes: release-notes-web.md`);
  log(`📱 Play Store notes: release-notes-playstore.txt`);
  log(`📋 Changelog updated: CHANGELOG.md`);
  
  return finalNotes;
};

const generateBasicReleaseNotes = (version, commits) => {
  return {
    web: `## 🙏 Spurgeon Devotional v${version}\n\n*Daily devotional readings from Charles Spurgeon's "Morning & Evening"*\n\n### What's New\n- Performance improvements and bug fixes\n\n---\n\n**About Spurgeon Devotional**\nA beautiful, lightweight devotional app featuring Charles Spurgeon's beloved "Morning & Evening" daily readings.`,
    playstore: `🙏 Spurgeon Devotional v${version}\n\nThis version includes performance improvements and bug fixes.\n\n📖 Daily readings from Charles Spurgeon's "Morning & Evening"\n⚡ Fast, offline-capable, and beautifully designed\n\nThank you for using Spurgeon Devotional! 🙏`,
    changelog: `## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n### Changed\n- Performance improvements and bug fixes\n\n`
  };
};

// Export for use in other scripts
export { generateAllReleaseNotes, generateReleaseNotes, parseCommits };

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const version = process.argv[2] || JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  generateAllReleaseNotes(version).catch(error => {
    log(`❌ Failed to generate release notes: ${error.message}`, colors.red);
    process.exit(1);
  });
}