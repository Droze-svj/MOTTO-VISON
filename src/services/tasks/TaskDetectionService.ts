/**
 * Task Detection Service
 * Detects what kind of task the user needs help with
 */

type TaskType = 
  | 'presentation'
  | 'math'
  | 'essay'
  | 'message'
  | 'email'
  | 'code'
  | 'resume'
  | 'social'
  | 'study'
  | 'brainstorm'
  | 'meeting'
  | 'assignment'
  | 'homework'
  | 'general';

interface DetectedTask {
  type: TaskType;
  confidence: number;
  details: {
    subject?: string;
    complexity?: 'simple' | 'medium' | 'complex';
    urgency?: 'low' | 'normal' | 'high';
    context?: string[];
  };
}

class TaskDetectionService {
  private static instance: TaskDetectionService;

  // Keywords for each task type
  private taskPatterns = {
    presentation: [
      'presentation', 'slides', 'powerpoint', 'keynote', 'pitch deck',
      'slide deck', 'present', 'ppt', 'slideshow', 'deck',
    ],
    math: [
      'calculate', 'solve', 'math', 'equation', 'formula', 'algebra',
      'geometry', 'calculus', 'statistics', 'problem', 'compute',
      'add', 'subtract', 'multiply', 'divide', 'integral', 'derivative',
    ],
    essay: [
      'essay', 'write', 'paper', 'article', 'report', 'thesis',
      'paragraph', 'composition', 'draft', 'writing', 'document',
    ],
    message: [
      'message', 'text', 'reply', 'respond', 'chat', 'dm', 'sms',
      'whatsapp', 'telegram', 'quick message',
    ],
    email: [
      'email', 'mail', 'letter', 'correspondence', 'professional email',
      'business email', 'formal email', 'send email',
    ],
    code: [
      'code', 'function', 'programming', 'debug', 'script', 'algorithm',
      'api', 'component', 'class', 'method', 'javascript', 'python',
      'react', 'coding', 'developer', 'program',
    ],
    resume: [
      'resume', 'cv', 'curriculum vitae', 'job application', 'cover letter',
      'career', 'work experience', 'professional summary',
    ],
    social: [
      'tweet', 'post', 'instagram', 'facebook', 'linkedin', 'social media',
      'twitter', 'caption', 'hashtag', 'share',
    ],
    study: [
      'study', 'flashcard', 'exam', 'quiz', 'learn', 'review',
      'notes', 'memorize', 'test prep', 'study guide',
    ],
    brainstorm: [
      'brainstorm', 'ideas', 'creative', 'think', 'suggest', 'generate ideas',
      'come up with', 'ideation', 'concept',
    ],
    meeting: [
      'meeting', 'agenda', 'standup', 'sync', 'conference', 'call',
      'discussion', 'team meeting', 'meeting notes',
    ],
    assignment: [
      'assignment', 'research paper', 'lab report', 'case study',
      'book report', 'project', 'term paper', 'literature review',
      'annotated bibliography', 'analysis', 'compare and contrast',
    ],
    homework: [
      'homework', 'practice problems', 'exercises', 'worksheet',
      'daily work', 'help with', 'question about', 'don\'t understand',
    ],
  };

  private constructor() {
    console.log('[Task Detection] Service initialized');
  }

  static getInstance(): TaskDetectionService {
    if (!TaskDetectionService.instance) {
      TaskDetectionService.instance = new TaskDetectionService();
    }
    return TaskDetectionService.instance;
  }

  /**
   * Detect what task the user needs help with
   */
  detectTask(input: string): DetectedTask {
    const normalizedInput = input.toLowerCase();

    // Check each task type
    const scores: Record<TaskType, number> = {
      presentation: 0,
      math: 0,
      essay: 0,
      message: 0,
      email: 0,
      general: 0,
    };

    // Score based on keyword matches
    for (const [taskType, patterns] of Object.entries(this.taskPatterns)) {
      for (const pattern of patterns) {
        if (normalizedInput.includes(pattern)) {
          scores[taskType as TaskType] = (scores[taskType as TaskType] || 0) + 1;
        }
      }
    }

    // Find highest score
    const sortedTasks = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([type]) => type !== 'general');

    const topTask = sortedTasks[0];
    const taskType = (topTask && topTask[1] > 0 ? topTask[0] : 'general') as TaskType;
    const confidence = topTask ? Math.min(topTask[1] / 3, 1) : 0;

    // Extract details
    const details = this.extractTaskDetails(normalizedInput, taskType);

    return {
      type: taskType,
      confidence,
      details,
    };
  }

  /**
   * Extract task-specific details
   */
  private extractTaskDetails(input: string, taskType: TaskType): DetectedTask['details'] {
    const details: DetectedTask['details'] = {};

    // Detect subject
    const subjects = {
      math: ['algebra', 'calculus', 'geometry', 'statistics', 'trigonometry'],
      presentation: ['business', 'sales', 'marketing', 'education', 'pitch'],
      essay: ['argumentative', 'narrative', 'expository', 'persuasive', 'research'],
    };

    if (subjects[taskType]) {
      for (const subject of subjects[taskType]) {
        if (input.includes(subject)) {
          details.subject = subject;
          break;
        }
      }
    }

    // Detect complexity
    if (input.includes('simple') || input.includes('basic') || input.includes('quick')) {
      details.complexity = 'simple';
    } else if (input.includes('complex') || input.includes('advanced') || input.includes('detailed')) {
      details.complexity = 'complex';
    } else {
      details.complexity = 'medium';
    }

    // Detect urgency
    if (input.includes('urgent') || input.includes('asap') || input.includes('quickly') || input.includes('now')) {
      details.urgency = 'high';
    } else if (input.includes('whenever') || input.includes('no rush')) {
      details.urgency = 'low';
    } else {
      details.urgency = 'normal';
    }

    return details;
  }

  /**
   * Check if input is asking for help with a task
   */
  isTaskRequest(input: string): boolean {
    const detected = this.detectTask(input);
    return detected.type !== 'general' && detected.confidence > 0.3;
  }
}

export default TaskDetectionService.getInstance();
