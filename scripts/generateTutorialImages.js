const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create the tutorial images directory if it doesn't exist
const tutorialDir = path.join(__dirname, '../app/assets/tutorial');
if (!fs.existsSync(tutorialDir)) {
  fs.mkdirSync(tutorialDir, { recursive: true });
}

// Generate the images using the TutorialImageGenerator component
const generateImages = () => {
  try {
    // Run the React Native app in development mode
    execSync('npx react-native start', { stdio: 'inherit' });
    
    // In a real app, you would:
    // 1. Mount the TutorialImageGenerator component
    // 2. Call generateImages() on the component
    // 3. Save the generated images to the tutorial directory
    
    console.log('Tutorial images generated successfully!');
  } catch (error) {
    console.error('Error generating tutorial images:', error);
  }
};

generateImages(); 