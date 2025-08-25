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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`);
};

const exec = (command, description) => {
  log(`${colors.blue}🔨 ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`);
    return false;
  }
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

const getGitStatus = () => {
  const status = execSilent('git status --porcelain');
  const branch = execSilent('git rev-parse --abbrev-ref HEAD');
  const unpushedCommits = execSilent('git log @{u}.. --oneline 2>/dev/null').split('\n').filter(line => line.length > 0);
  
  return {
    hasChanges: status.length > 0,
    status: status,
    branch: branch || 'main',
    unpushedCommits: unpushedCommits.length,
    files: status.split('\n').filter(line => line.length > 0)
  };
};

const showGitStatus = (gitStatus) => {
  log(`\n${colors.bold}📊 Git Status:${colors.reset}`);
  log(`🌿 Branch: ${colors.cyan}${gitStatus.branch}${colors.reset}`);
  log(`📝 Changed files: ${gitStatus.files.length}`);
  log(`📤 Unpushed commits: ${gitStatus.unpushedCommits}`);
  
  if (gitStatus.files.length > 0) {
    log(`\n${colors.yellow}Modified files:${colors.reset}`);
    gitStatus.files.slice(0, 10).forEach(file => {
      const [status, filename] = file.trim().split(/\s+/, 2);
      const statusIcon = {
        'M': '📝', '??': '➕', 'A': '✨', 'D': '🗑️', 'R': '🔄'
      }[status] || '📄';
      log(`  ${statusIcon} ${filename}`);
    });
    
    if (gitStatus.files.length > 10) {
      log(`  ... and ${gitStatus.files.length - 10} more files`);
    }
  }
};

const commitChanges = async (gitStatus) => {
  log(`\n${colors.bold}${colors.magenta}📝 COMMIT CHANGES${colors.reset}`);
  
  if (!gitStatus.hasChanges) {
    log('✅ No changes to commit', colors.green);
    return true;
  }
  
  // Show what will be committed
  log('\n📋 Files to be committed:');
  exec('git add -A', 'Adding all changes');
  
  const staged = execSilent('git diff --cached --name-status');
  staged.split('\n').forEach(line => {
    if (line.trim()) {
      const [status, filename] = line.split('\t');
      const statusIcon = {
        'M': '📝', 'A': '✨', 'D': '🗑️', 'R': '🔄'
      }[status] || '📄';
      log(`  ${statusIcon} ${filename}`);
    }
  });
  
  // Get commit message
  const commitMessage = await question('\n💭 Commit message (or press enter for auto-generated): ');
  
  let finalMessage;
  if (commitMessage.length > 0) {
    finalMessage = commitMessage;
  } else {
    // Auto-generate commit message based on changes
    const changedFiles = staged.split('\n').map(line => line.split('\t')[1]).filter(f => f);
    const hasCode = changedFiles.some(f => f.match(/\.(js|ts|tsx|jsx|css|html)$/));
    const hasDocs = changedFiles.some(f => f.match(/\.(md|txt)$/));
    const hasConfig = changedFiles.some(f => f.match(/\.(json|toml|yml|yaml)$/));
    
    if (hasCode && hasDocs) {
      finalMessage = 'feat: update app functionality and documentation';
    } else if (hasCode) {
      finalMessage = 'feat: improve app functionality and user experience';
    } else if (hasDocs) {
      finalMessage = 'docs: update documentation and guides';
    } else if (hasConfig) {
      finalMessage = 'config: update configuration and build settings';
    } else {
      finalMessage = 'chore: update project files';
    }
    
    log(`📝 Auto-generated message: "${finalMessage}"`);
  }
  
  // Commit with proper formatting
  const commitCmd = `git commit -m "${finalMessage}"`;
  return exec(commitCmd, 'Committing changes');
};

const pushChanges = async (gitStatus) => {
  log(`\n${colors.bold}${colors.cyan}📤 PUSH TO REMOTE${colors.reset}`);
  
  const remote = execSilent('git remote get-url origin');
  if (!remote) {
    log('⚠️  No remote repository configured', colors.yellow);
    return false;
  }
  
  log(`📡 Remote: ${remote.replace(/https:\/\/[^@]*@/, 'https://***@')}`);
  
  const pushCmd = `git push origin ${gitStatus.branch}`;
  return exec(pushCmd, `Pushing to ${gitStatus.branch}`);
};

const deployApp = async () => {
  log(`\n${colors.bold}${colors.green}🚀 DEPLOYMENT${colors.reset}`);
  
  const deployChoice = await question('Deploy to? (1=Cloudflare, 2=Both platforms, 3=Skip): ');
  
  switch (deployChoice) {
    case '1':
      return exec('bun run deploy:cf', 'Deploying to Cloudflare');
    case '2':
      log('📱 Full deployment with release management...');
      execSync('bun run release', { stdio: 'inherit' });
      return true;
    case '3':
      log('⏭️  Skipping deployment', colors.yellow);
      return true;
    default:
      log('❌ Invalid deployment option', colors.red);
      return false;
  }
};

const updateDocs = async () => {
  log(`\n${colors.bold}${colors.blue}📚 UPDATE DOCUMENTATION${colors.reset}`);
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const version = packageJson.version;
  
  // Update README with latest commands
  if (fs.existsSync('README.md')) {
    let readme = fs.readFileSync('README.md', 'utf8');
    
    // Update version badge if it exists
    readme = readme.replace(/version-v\d+\.\d+\.\d+/g, `version-v${version}`);
    
    // Add/update quick start section
    const quickStartSection = `
## 🚀 Quick Start

\`\`\`bash
# Preview locally
bun run preview:all          # Multi-platform preview
bun run dev                  # Development server with live reload

# Test on devices  
bun run preview:android:quick  # Quick Android test

# Deploy everywhere
bun run release              # Interactive deployment
\`\`\`
`;

    if (!readme.includes('Quick Start')) {
      // Add after title/description
      const lines = readme.split('\n');
      const insertIndex = lines.findIndex(line => line.startsWith('##')) || 3;
      lines.splice(insertIndex, 0, quickStartSection);
      readme = lines.join('\n');
    }
    
    fs.writeFileSync('README.md', readme);
    log('📝 Updated README.md with latest commands', colors.green);
  }
  
  // Create/update development docs
  const devGuide = `# 🛠️ Development Guide

## Available Commands

### Preview & Testing
\`\`\`bash
bun run preview:all           # Multi-platform preview (web + Android)
bun run dev                   # Development server (live reload)
bun run preview               # Web preview only  
bun run preview:android       # Interactive Android preview
bun run preview:android:quick # Quick Android test
\`\`\`

### Building
\`\`\`bash
bun run build                # Web build only
bun run build:all            # Build for all platforms
\`\`\`

### Deployment
\`\`\`bash
bun run release              # Interactive release (both platforms)
bun run deploy:cf            # Cloudflare only
bun run deploy:playstore     # Play Store only
\`\`\`

### Utilities
\`\`\`bash
bun run setup:keystore       # Setup Android signing
bun run release-notes        # Generate release notes
bun run workflow             # Complete git workflow
\`\`\`

## Development Workflow

1. **Make changes** to your code
2. **Preview locally**: \`bun run preview:all\`
3. **Test thoroughly** on web and Android
4. **Commit and deploy**: \`bun run workflow\`

## Quick Links

- [Android Preview Guide](ANDROID-PREVIEW.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Release Notes](CHANGELOG.md)

Updated: ${new Date().toISOString().split('T')[0]} (v${version})
`;

  fs.writeFileSync('DEVELOPMENT.md', devGuide);
  log('📝 Updated DEVELOPMENT.md', colors.green);
  
  return true;
};

const main = async () => {
  log(`${colors.bold}${colors.blue}🔄 Complete Workflow: Commit → Push → Deploy${colors.reset}`);
  
  const startTime = Date.now();
  
  // Check git status
  const gitStatus = getGitStatus();
  showGitStatus(gitStatus);
  
  if (!gitStatus.hasChanges && gitStatus.unpushedCommits === 0) {
    log(`\n${colors.green}✅ Everything is up to date!${colors.reset}`);
    
    const action = await question('What would you like to do? (1=Deploy anyway, 2=Exit): ');
    if (action !== '1') {
      log('👋 Nothing to do, exiting...');
      return;
    }
  }
  
  // Workflow steps
  let success = true;
  
  // 1. Update documentation
  if (success) {
    success = await updateDocs();
  }
  
  // 2. Commit changes  
  if (success && gitStatus.hasChanges) {
    success = await commitChanges(gitStatus);
  }
  
  // 3. Push to remote
  if (success && (gitStatus.hasChanges || gitStatus.unpushedCommits > 0)) {
    success = await pushChanges(gitStatus);
  }
  
  // 4. Deploy
  if (success) {
    const shouldDeploy = await question('\n🚀 Deploy now? (y/n): ');
    if (shouldDeploy.toLowerCase() === 'y') {
      success = await deployApp();
    }
  }
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  log(`\n${colors.bold}📊 WORKFLOW SUMMARY${colors.reset}`);
  log(`⏱️  Total time: ${duration}s`);
  log(`📝 Documentation: ${success ? '✅ Updated' : '❌ Failed'}`);
  log(`💾 Commit: ${gitStatus.hasChanges ? (success ? '✅ Success' : '❌ Failed') : '⏭️  Skipped'}`);
  log(`📤 Push: ${gitStatus.hasChanges || gitStatus.unpushedCommits > 0 ? (success ? '✅ Success' : '❌ Failed') : '⏭️  Skipped'}`);
  
  if (success) {
    log(`\n${colors.bold}${colors.green}🎉 Workflow completed successfully!${colors.reset}`);
    log(`\n${colors.bold}What's next?${colors.reset}`);
    log(`• 🌐 Web app: Check Cloudflare dashboard`);
    log(`• 📱 Android: Check Play Console for review status`);
    log(`• 📊 Analytics: Monitor app performance`);
  } else {
    log(`\n${colors.bold}${colors.red}❌ Workflow failed${colors.reset}`);
    log(`Check the errors above and try again`);
    process.exit(1);
  }
};

main().catch(error => {
  log(`❌ Workflow failed: ${error.message}`, colors.red);
  process.exit(1);
});