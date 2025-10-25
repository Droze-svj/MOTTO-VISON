/**
 * Math Solver Service
 * Helps solve math problems with step-by-step explanations
 */

interface MathProblem {
  problem: string;
  type: 'arithmetic' | 'algebra' | 'calculus' | 'geometry' | 'statistics' | 'general';
}

interface MathSolution {
  problem: string;
  solution: string;
  steps: string[];
  explanation: string;
  answer: string;
}

class MathSolverService {
  private static instance: MathSolverService;

  private constructor() {
    console.log('[Math Solver] Service initialized');
  }

  static getInstance(): MathSolverService {
    if (!MathSolverService.instance) {
      MathSolverService.instance = new MathSolverService();
    }
    return MathSolverService.instance;
  }

  /**
   * Solve math problem with step-by-step explanation
   */
  async solve(problem: string): Promise<MathSolution> {
    console.log(`[Math Solver] Solving: ${problem}`);

    const problemType = this.detectProblemType(problem);
    
    // Try to evaluate if it's a simple arithmetic expression
    const arithmeticResult = this.tryArithmetic(problem);
    
    if (arithmeticResult) {
      return arithmeticResult;
    }

    // For complex problems, provide structured guidance
    return this.provideGuidance(problem, problemType);
  }

  /**
   * Detect type of math problem
   */
  private detectProblemType(problem: string): MathProblem['type'] {
    const lower = problem.toLowerCase();

    if (lower.match(/\+|-|\*|\/|×|÷/) && !lower.match(/[a-z]{2,}/)) {
      return 'arithmetic';
    }
    if (lower.includes('x') || lower.includes('equation') || lower.includes('solve for')) {
      return 'algebra';
    }
    if (lower.includes('derivative') || lower.includes('integral') || lower.includes('limit')) {
      return 'calculus';
    }
    if (lower.includes('area') || lower.includes('perimeter') || lower.includes('angle')) {
      return 'geometry';
    }
    if (lower.includes('mean') || lower.includes('median') || lower.includes('probability')) {
      return 'statistics';
    }

    return 'general';
  }

  /**
   * Try to solve arithmetic problems
   */
  private tryArithmetic(problem: string): MathSolution | null {
    try {
      // Extract mathematical expression
      const expression = problem.replace(/[^0-9+\-*/().]/g, '');
      
      if (!expression) return null;

      // Safely evaluate (very basic, in production use a proper math library)
      // For demo purposes only - use math.js or similar in production
      const result = this.safeEval(expression);
      
      if (result !== null) {
        return {
          problem,
          solution: `${expression} = ${result}`,
          steps: [
            `1. Expression: ${expression}`,
            `2. Calculate: ${result}`,
          ],
          explanation: 'This is a basic arithmetic calculation.',
          answer: result.toString(),
        };
      }
    } catch (e) {
      // Not a simple arithmetic problem
    }

    return null;
  }

  /**
   * Safe evaluation of simple arithmetic (basic implementation)
   */
  private safeEval(expr: string): number | null {
    try {
      // Only allow numbers and basic operators
      if (!/^[\d+\-*/().\s]+$/.test(expr)) {
        return null;
      }
      
      // Very basic evaluation (use math.js in production!)
      const result = Function(`'use strict'; return (${expr})`)();
      
      return typeof result === 'number' && !isNaN(result) ? result : null;
    } catch {
      return null;
    }
  }

  /**
   * Provide guidance for complex problems
   */
  private provideGuidance(problem: string, type: MathProblem['type']): MathSolution {
    const guides = {
      algebra: {
        steps: [
          '1. Identify the variable (usually x)',
          '2. Move all terms with variables to one side',
          '3. Move constants to the other side',
          '4. Simplify both sides',
          '5. Solve for the variable',
        ],
        explanation: 'For algebra problems, isolate the variable step by step.',
      },
      calculus: {
        steps: [
          '1. Identify the function',
          '2. Determine what operation needed (derivative/integral)',
          '3. Apply relevant rules (power rule, chain rule, etc.)',
          '4. Simplify the result',
          '5. Check your answer',
        ],
        explanation: 'For calculus, apply the appropriate rules and simplify.',
      },
      geometry: {
        steps: [
          '1. Draw a diagram if not provided',
          '2. Label all known measurements',
          '3. Identify the formula needed',
          '4. Substitute values into formula',
          '5. Calculate the answer',
        ],
        explanation: 'For geometry, visualization is key. Draw it out!',
      },
      statistics: {
        steps: [
          '1. Organize the data',
          '2. Identify what to find (mean, median, etc.)',
          '3. Apply the formula',
          '4. Calculate step by step',
          '5. Interpret the result',
        ],
        explanation: 'For statistics, organize data first, then apply formulas.',
      },
      general: {
        steps: [
          '1. Read the problem carefully',
          '2. Identify what is given and what to find',
          '3. Choose appropriate method/formula',
          '4. Work through step by step',
          '5. Verify your answer makes sense',
        ],
        explanation: 'Break down the problem systematically.',
      },
    };

    const guide = guides[type] || guides.general;

    return {
      problem,
      solution: 'Let me help you solve this step by step!',
      steps: guide.steps,
      explanation: guide.explanation,
      answer: '[Follow the steps above to find the answer]',
    };
  }

  /**
   * Format solution as text
   */
  formatSolution(solution: MathSolution): string {
    let text = `📐 Math Problem:\n${solution.problem}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📝 Step-by-Step Solution:\n\n`;
    
    for (const step of solution.steps) {
      text += `${step}\n`;
    }
    
    text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `💡 Explanation:\n${solution.explanation}\n\n`;
    text += `✅ Answer: ${solution.answer}\n`;
    
    return text;
  }
}

export default MathSolverService.getInstance();
