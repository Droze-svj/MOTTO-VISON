const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Build configuration
const config = {
  mac: {
    icon: path.join(__dirname, '../assets/icon.icns'),
    target: ['dmg', 'zip']
  },
  win: {
    icon: path.join(__dirname, '../assets/icon.ico'),
    target: ['nsis', 'portable']
  },
  linux: {
    icon: path.join(__dirname, '../assets/icon.png'),
    target: ['AppImage', 'deb']
  }
};

// Build function
async function build() {
  const platform = process.argv[2];
  
  if (!platform || !['mac', 'win', 'linux', 'all'].includes(platform)) {
    console.error('Please specify a platform: mac, win, linux, or all');
    process.exit(1);
  }

  try {
    // Install dependencies
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    // Build React app
    console.log('Building React app...');
    execSync('npm run build', { stdio: 'inherit' });

    // Build for specific platform(s)
    if (platform === 'all') {
      await buildForPlatform('mac');
      await buildForPlatform('win');
      await buildForPlatform('linux');
    } else {
      await buildForPlatform(platform);
    }

    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

async function buildForPlatform(platform) {
  console.log(`Building for ${platform}...`);
  
  const platformConfig = config[platform];
  const buildCommand = `electron-builder --${platform} --config.${platform}.icon=${platformConfig.icon} --config.${platform}.target=${platformConfig.target.join(',')}`;
  
  try {
    execSync(buildCommand, { stdio: 'inherit' });
    console.log(`${platform} build completed successfully!`);
  } catch (error) {
    console.error(`${platform} build failed:`, error);
    throw error;
  }
}

// Run build
build(); 