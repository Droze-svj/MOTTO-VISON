/**
 * Code Assistant Service
 * Helps with programming tasks, code generation, debugging
 */

interface CodeRequest {
  task: string;
  language?: string;
  framework?: string;
  complexity?: 'beginner' | 'intermediate' | 'advanced';
}

interface CodeResponse {
  code: string;
  explanation: string;
  tips: string[];
  documentation?: string;
}

class CodeAssistantService {
  private static instance: CodeAssistantService;

  private constructor() {
    console.log('[Code Assistant] Service initialized');
  }

  static getInstance(): CodeAssistantService {
    if (!CodeAssistantService.instance) {
      CodeAssistantService.instance = new CodeAssistantService();
    }
    return CodeAssistantService.instance;
  }

  /**
   * Generate code based on request
   */
  async generateCode(request: CodeRequest): Promise<CodeResponse> {
    const { task, language = 'javascript', complexity = 'intermediate' } = request;

    console.log(`[Code Assistant] Generating ${language} code for: ${task}`);

    // Detect what kind of code task
    const taskType = this.detectCodeTask(task);

    return this.generateCodeByType(taskType, task, language, complexity);
  }

  /**
   * Detect type of coding task
   */
  private detectCodeTask(task: string): string {
    const lower = task.toLowerCase();

    if (lower.includes('function') || lower.includes('method')) return 'function';
    if (lower.includes('class') || lower.includes('object')) return 'class';
    if (lower.includes('api') || lower.includes('fetch') || lower.includes('request')) return 'api';
    if (lower.includes('component') || lower.includes('react')) return 'component';
    if (lower.includes('loop') || lower.includes('iterate')) return 'loop';
    if (lower.includes('sort') || lower.includes('filter')) return 'array';
    if (lower.includes('async') || lower.includes('promise')) return 'async';

    return 'general';
  }

  /**
   * Generate code by type
   */
  private generateCodeByType(
    type: string,
    task: string,
    language: string,
    complexity: string
  ): CodeResponse {
    const templates = {
      function: {
        code: `// ${task}\nfunction myFunction(param) {\n  // TODO: Implement logic\n  return result;\n}`,
        explanation: 'This function template provides a starting structure.',
        tips: [
          '✓ Use descriptive function names',
          '✓ Add comments for complex logic',
          '✓ Handle edge cases',
          '✓ Return meaningful values',
        ],
      },
      class: {
        code: `// ${task}\nclass MyClass {\n  constructor() {\n    // Initialize properties\n  }\n\n  method() {\n    // TODO: Implement\n  }\n}`,
        explanation: 'This class structure follows object-oriented principles.',
        tips: [
          '✓ Use clear class names',
          '✓ Keep methods focused',
          '✓ Encapsulate data',
          '✓ Follow SOLID principles',
        ],
      },
      api: {
        code: `// ${task}\nasync function fetchData() {\n  try {\n    const response = await fetch('API_URL');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}`,
        explanation: 'This handles API requests with proper error handling.',
        tips: [
          '✓ Always use try-catch',
          '✓ Handle errors gracefully',
          '✓ Check response status',
          '✓ Parse data carefully',
        ],
      },
      component: {
        code: `// ${task}\nimport React from 'react';\n\nfunction MyComponent() {\n  return (\n    <div>\n      {/* Your component UI */}\n    </div>\n  );\n}\n\nexport default MyComponent;`,
        explanation: 'This React component follows modern best practices.',
        tips: [
          '✓ Keep components small',
          '✓ Use hooks for state',
          '✓ Extract reusable logic',
          '✓ Follow naming conventions',
        ],
      },
      general: {
        code: `// ${task}\n// TODO: Implement your solution here\n\nconsole.log('Start coding!');`,
        explanation: 'Here\'s a starting point. Break down the problem into smaller steps.',
        tips: [
          '✓ Start with pseudocode',
          '✓ Test as you go',
          '✓ Comment your code',
          '✓ Keep it simple (KISS)',
        ],
      },
    };

    const template = templates[type] || templates.general;

    return {
      code: template.code,
      explanation: template.explanation,
      tips: template.tips,
      documentation: `// Language: ${language}\n// Complexity: ${complexity}`,
    };
  }

  /**
   * Format code response
   */
  formatResponse(response: CodeResponse): string {
    let text = `💻 Code:\n\n\`\`\`\n${response.code}\n\`\`\`\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💡 Explanation:\n${response.explanation}\n\n`;
    text += `📝 Best Practices:\n${response.tips.join('\n')}\n`;
    
    return text;
  }
}

export default CodeAssistantService.getInstance();
