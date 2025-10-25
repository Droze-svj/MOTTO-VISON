/**
 * File Understanding Service
 * Understands any file type and provides context-aware assistance
 */

interface FileAnalysis {
  fileName: string;
  fileType: string;
  fileCategory: 'code' | 'document' | 'config' | 'data' | 'media' | 'other';
  language?: string;
  purpose: string;
  structure: {
    elements: string[];
    complexity: 'simple' | 'medium' | 'complex';
    size: string;
  };
  context: {
    domain: string;
    framework?: string;
    dependencies?: string[];
    relatedFiles?: string[];
  };
  suggestions: string[];
  helpfulActions: string[];
}

class FileUnderstandingService {
  private static instance: FileUnderstandingService;

  private constructor() {
    console.log('[File Understanding] Service initialized');
  }

  static getInstance(): FileUnderstandingService {
    if (!FileUnderstandingService.instance) {
      FileUnderstandingService.instance = new FileUnderstandingService();
    }
    return FileUnderstandingService.instance;
  }

  /**
   * Analyze and understand a file
   */
  async analyzeFile(fileName: string, content?: string, fileSize?: number): Promise<FileAnalysis> {
    console.log(`[File Understanding] Analyzing: ${fileName}`);

    const fileType = this.detectFileType(fileName);
    const fileCategory = this.categorizeFile(fileType);
    const language = this.detectLanguage(fileName, content);
    const purpose = this.identifyPurpose(fileName, fileType, content);
    
    const structure = this.analyzeStructure(content, fileType, fileSize);
    const context = this.extractContext(fileName, fileType, content);
    const suggestions = this.generateSuggestions(fileName, fileType, fileCategory);
    const helpfulActions = this.getHelpfulActions(fileCategory, fileType);

    return {
      fileName,
      fileType,
      fileCategory,
      language,
      purpose,
      structure,
      context,
      suggestions,
      helpfulActions,
    };
  }

  /**
   * Detect file type from name
   */
  private detectFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    const typeMap: Record<string, string> = {
      // Code
      'js': 'JavaScript',
      'jsx': 'React JSX',
      'ts': 'TypeScript',
      'tsx': 'React TSX',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'php': 'PHP',
      
      // Web
      'html': 'HTML',
      'css': 'CSS',
      'scss': 'SCSS',
      'sass': 'Sass',
      'less': 'Less',
      
      // Config
      'json': 'JSON',
      'yaml': 'YAML',
      'yml': 'YAML',
      'toml': 'TOML',
      'xml': 'XML',
      'env': 'Environment Variables',
      
      // Documents
      'md': 'Markdown',
      'txt': 'Text',
      'pdf': 'PDF',
      'doc': 'Word Document',
      'docx': 'Word Document',
      
      // Data
      'csv': 'CSV',
      'sql': 'SQL',
      'db': 'Database',
      
      // Media
      'png': 'PNG Image',
      'jpg': 'JPEG Image',
      'jpeg': 'JPEG Image',
      'gif': 'GIF Image',
      'svg': 'SVG Image',
      'mp4': 'MP4 Video',
      'mp3': 'MP3 Audio',
    };

    return typeMap[extension] || extension.toUpperCase();
  }

  /**
   * Categorize file into main category
   */
  private categorizeFile(fileType: string): FileAnalysis['fileCategory'] {
    const codeTypes = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'React JSX', 'React TSX'];
    const docTypes = ['Markdown', 'Text', 'PDF', 'Word Document'];
    const configTypes = ['JSON', 'YAML', 'TOML', 'XML', 'Environment Variables'];
    const dataTypes = ['CSV', 'SQL', 'Database'];
    const mediaTypes = ['PNG Image', 'JPEG Image', 'GIF Image', 'SVG Image', 'MP4 Video', 'MP3 Audio'];

    if (codeTypes.includes(fileType) || fileType.includes('HTML') || fileType.includes('CSS')) return 'code';
    if (docTypes.includes(fileType)) return 'document';
    if (configTypes.includes(fileType)) return 'config';
    if (dataTypes.includes(fileType)) return 'data';
    if (mediaTypes.includes(fileType)) return 'media';

    return 'other';
  }

  /**
   * Detect programming language
   */
  private detectLanguage(fileName: string, content?: string): string | undefined {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const langMap: Record<string, string> = {
      'js': 'JavaScript',
      'jsx': 'JavaScript (React)',
      'ts': 'TypeScript',
      'tsx': 'TypeScript (React)',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin',
      'php': 'PHP',
      'html': 'HTML',
      'css': 'CSS',
    };

    return langMap[extension || ''];
  }

  /**
   * Identify file purpose
   */
  private identifyPurpose(fileName: string, fileType: string, content?: string): string {
    const lower = fileName.toLowerCase();

    // Common file purposes
    if (lower.includes('test') || lower.includes('spec')) return 'Testing file';
    if (lower.includes('config')) return 'Configuration file';
    if (lower.includes('readme')) return 'Documentation/README';
    if (lower.includes('package')) return 'Package/dependency configuration';
    if (lower.includes('index')) return 'Main entry point';
    if (lower.includes('app')) return 'Application file';
    if (lower.includes('component')) return 'UI component';
    if (lower.includes('service')) return 'Service/business logic';
    if (lower.includes('util') || lower.includes('helper')) return 'Utility/helper functions';
    if (lower.includes('model')) return 'Data model';
    if (lower.includes('controller')) return 'Controller logic';
    if (lower.includes('route')) return 'Routing configuration';
    if (lower.includes('style')) return 'Styling file';

    // By file type
    if (fileType === 'JSON') return 'JSON configuration/data file';
    if (fileType === 'Markdown') return 'Documentation file';
    if (fileType === 'Environment Variables') return 'Environment configuration';
    if (fileType.includes('CSS')) return 'Stylesheet';

    return `${fileType} file`;
  }

  /**
   * Analyze file structure
   */
  private analyzeStructure(content?: string, fileType?: string, fileSize?: number): FileAnalysis['structure'] {
    const elements: string[] = [];
    let complexity: 'simple' | 'medium' | 'complex' = 'medium';

    if (content) {
      const lines = content.split('\n').length;
      
      // Detect elements based on content
      if (content.includes('function ') || content.includes('const ') || content.includes('let ')) {
        elements.push('Functions/Variables');
      }
      if (content.includes('class ')) {
        elements.push('Classes');
      }
      if (content.includes('import ') || content.includes('require(')) {
        elements.push('Imports');
      }
      if (content.includes('export ')) {
        elements.push('Exports');
      }
      if (content.includes('interface ') || content.includes('type ')) {
        elements.push('Type Definitions');
      }

      // Assess complexity
      if (lines < 50) complexity = 'simple';
      else if (lines > 200) complexity = 'complex';

      return {
        elements,
        complexity,
        size: `${lines} lines`,
      };
    }

    return {
      elements: ['Unknown structure'],
      complexity: 'medium',
      size: fileSize ? `${Math.round(fileSize / 1024)}KB` : 'Unknown size',
    };
  }

  /**
   * Extract file context
   */
  private extractContext(fileName: string, fileType: string, content?: string): FileAnalysis['context'] {
    const context: FileAnalysis['context'] = {
      domain: 'General',
    };

    // Detect framework
    if (content) {
      if (content.includes('react')) context.framework = 'React';
      else if (content.includes('vue')) context.framework = 'Vue';
      else if (content.includes('angular')) context.framework = 'Angular';
      else if (content.includes('express')) context.framework = 'Express';
      else if (content.includes('django')) context.framework = 'Django';
      else if (content.includes('flask')) context.framework = 'Flask';
    }

    // Detect domain from file path/name
    const lower = fileName.toLowerCase();
    if (lower.includes('component') || lower.includes('ui')) context.domain = 'UI/Frontend';
    else if (lower.includes('service') || lower.includes('api')) context.domain = 'Backend/Services';
    else if (lower.includes('model') || lower.includes('schema')) context.domain = 'Data/Models';
    else if (lower.includes('test')) context.domain = 'Testing';
    else if (lower.includes('config')) context.domain = 'Configuration';

    // Detect dependencies (simplified)
    if (content) {
      const imports = content.match(/import .* from ['"](.*)['"];?/g);
      if (imports && imports.length > 0) {
        context.dependencies = imports.slice(0, 5).map(imp => {
          const match = imp.match(/from ['"](.*)['"];?/);
          return match ? match[1] : '';
        }).filter(Boolean);
      }
    }

    return context;
  }

  /**
   * Generate helpful suggestions
   */
  private generateSuggestions(fileName: string, fileType: string, category: string): string[] {
    const suggestions: string[] = [];

    if (category === 'code') {
      suggestions.push('Add comments for complex logic');
      suggestions.push('Follow naming conventions');
      suggestions.push('Keep functions small and focused');
      suggestions.push('Add error handling');
      suggestions.push('Write tests for critical functions');
    }

    if (category === 'document') {
      suggestions.push('Use clear headings and structure');
      suggestions.push('Include code examples if technical');
      suggestions.push('Keep language simple and clear');
      suggestions.push('Add table of contents for long documents');
    }

    if (category === 'config') {
      suggestions.push('Document each configuration option');
      suggestions.push('Use environment variables for secrets');
      suggestions.push('Validate configuration at startup');
      suggestions.push('Provide sensible defaults');
    }

    return suggestions;
  }

  /**
   * Get helpful actions user can take
   */
  private getHelpfulActions(category: string, fileType: string): string[] {
    const actions: string[] = [];

    if (category === 'code') {
      actions.push('Explain the code');
      actions.push('Find and fix bugs');
      actions.push('Refactor for better readability');
      actions.push('Add documentation');
      actions.push('Optimize performance');
      actions.push('Add error handling');
      actions.push('Write tests');
    }

    if (category === 'document') {
      actions.push('Improve clarity');
      actions.push('Fix grammar and spelling');
      actions.push('Restructure content');
      actions.push('Add examples');
      actions.push('Summarize');
    }

    if (category === 'config') {
      actions.push('Explain settings');
      actions.push('Validate configuration');
      actions.push('Add missing options');
      actions.push('Document parameters');
    }

    if (category === 'data') {
      actions.push('Analyze data structure');
      actions.push('Find patterns');
      actions.push('Clean data');
      actions.push('Generate insights');
    }

    return actions;
  }

  /**
   * Generate help for specific file action
   */
  async helpWithFile(
    fileName: string,
    action: string,
    content?: string,
    additionalContext?: string
  ): Promise<string> {
    const analysis = await this.analyzeFile(fileName, content);
    
    console.log(`[File Understanding] Helping with "${action}" for ${fileName}`);

    let response = `## Help with ${fileName}\n\n`;
    response += `**File Type:** ${analysis.fileType}\n`;
    response += `**Purpose:** ${analysis.purpose}\n\n`;

    // Action-specific help
    if (action.toLowerCase().includes('explain')) {
      response += this.generateExplanation(analysis, content);
    } else if (action.toLowerCase().includes('fix') || action.toLowerCase().includes('debug')) {
      response += this.generateDebuggingHelp(analysis, content);
    } else if (action.toLowerCase().includes('improve') || action.toLowerCase().includes('refactor')) {
      response += this.generateImprovementSuggestions(analysis);
    } else if (action.toLowerCase().includes('document')) {
      response += this.generateDocumentationHelp(analysis);
    } else {
      response += `**What you can do:**\n`;
      for (const helpfulAction of analysis.helpfulActions) {
        response += `• ${helpfulAction}\n`;
      }
    }

    return response;
  }

  private generateExplanation(analysis: FileAnalysis, content?: string): string {
    let text = `**Explanation:**\n\n`;
    text += `This is a ${analysis.purpose.toLowerCase()} `;
    if (analysis.language) text += `written in ${analysis.language}`;
    text += `.\n\n`;

    if (analysis.structure.elements.length > 0) {
      text += `**Contains:**\n`;
      for (const element of analysis.structure.elements) {
        text += `• ${element}\n`;
      }
      text += `\n`;
    }

    if (analysis.context.framework) {
      text += `**Framework:** ${analysis.context.framework}\n\n`;
    }

    text += `**Complexity:** ${analysis.structure.complexity.charAt(0).toUpperCase() + analysis.structure.complexity.slice(1)}\n`;
    text += `**Size:** ${analysis.structure.size}\n`;

    return text;
  }

  private generateDebuggingHelp(analysis: FileAnalysis, content?: string): string {
    let text = `**Debugging Help:**\n\n`;
    text += `Common issues in ${analysis.fileType} files:\n\n`;

    if (analysis.fileCategory === 'code') {
      text += `• Check for syntax errors\n`;
      text += `• Verify all imports are correct\n`;
      text += `• Look for undefined variables\n`;
      text += `• Check function return values\n`;
      text += `• Validate data types\n`;
      text += `• Review error handling\n`;
    }

    return text;
  }

  private generateImprovementSuggestions(analysis: FileAnalysis): string {
    let text = `**Improvement Suggestions:**\n\n`;
    
    for (const suggestion of analysis.suggestions) {
      text += `• ${suggestion}\n`;
    }

    return text;
  }

  private generateDocumentationHelp(analysis: FileAnalysis): string {
    let text = `**Documentation Help:**\n\n`;
    text += `To document this ${analysis.purpose.toLowerCase()}:\n\n`;
    text += `• Add file header comment explaining purpose\n`;
    text += `• Document each function/method\n`;
    text += `• Explain complex logic inline\n`;
    text += `• Include usage examples\n`;
    text += `• Note any dependencies or requirements\n`;

    return text;
  }

  /**
   * Format file analysis
   */
  formatAnalysis(analysis: FileAnalysis): string {
    let text = `📄 File Analysis: ${analysis.fileName}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `**Type:** ${analysis.fileType}\n`;
    text += `**Category:** ${analysis.fileCategory.charAt(0).toUpperCase() + analysis.fileCategory.slice(1)}\n`;
    if (analysis.language) text += `**Language:** ${analysis.language}\n`;
    text += `**Purpose:** ${analysis.purpose}\n\n`;

    text += `**Structure:**\n`;
    text += `• Complexity: ${analysis.structure.complexity}\n`;
    text += `• Size: ${analysis.structure.size}\n`;
    if (analysis.structure.elements.length > 0) {
      text += `• Contains: ${analysis.structure.elements.join(', ')}\n`;
    }
    text += `\n`;

    text += `**Context:**\n`;
    text += `• Domain: ${analysis.context.domain}\n`;
    if (analysis.context.framework) text += `• Framework: ${analysis.context.framework}\n`;
    if (analysis.context.dependencies && analysis.context.dependencies.length > 0) {
      text += `• Dependencies: ${analysis.context.dependencies.length} found\n`;
    }
    text += `\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `**💡 Suggestions:**\n`;
    for (const suggestion of analysis.suggestions) {
      text += `• ${suggestion}\n`;
    }
    text += `\n`;

    text += `**🎯 I can help you:**\n`;
    for (const action of analysis.helpfulActions) {
      text += `• ${action}\n`;
    }

    return text;
  }
}

export default FileUnderstandingService.getInstance();
