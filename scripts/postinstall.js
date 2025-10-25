/*
  Re-create minimal Fabric provider stub expected by RN 0.73 Pods build
  so builds succeed even if node_modules is freshly installed.
*/
const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileIfMissing(filePath, content) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

const fabricDir = path.join(__dirname, '..', 'node_modules', 'react-native', 'React', 'Fabric');
ensureDir(fabricDir);

const headerPath = path.join(fabricDir, 'RCTThirdPartyFabricComponentsProvider.h');
const implPath = path.join(fabricDir, 'RCTThirdPartyFabricComponentsProvider.mm');

const headerContent = `#import <React/RCTComponentViewProtocol.h>\n\n#ifdef __cplusplus\nextern \"C\" {\n#endif\n\nClass<RCTComponentViewProtocol> RCTThirdPartyFabricComponentsProvider(const char *name);\n\n#ifdef __cplusplus\n}\n#endif\n`;

const implContent = `#import <React/RCTThirdPartyFabricComponentsProvider.h>\n\n#ifdef __cplusplus\nextern \"C\" {\n#endif\n\nClass<RCTComponentViewProtocol> RCTThirdPartyFabricComponentsProvider(const char *name) {\n  return nil;\n}\n\n#ifdef __cplusplus\n}\n#endif\n`;

const wroteHeader = writeFileIfMissing(headerPath, headerContent);
const wroteImpl = writeFileIfMissing(implPath, implContent);

if (wroteHeader || wroteImpl) {
  console.log('[postinstall] Wrote Fabric provider stub to', fabricDir);
} else {
  console.log('[postinstall] Fabric provider stub already present');
}


