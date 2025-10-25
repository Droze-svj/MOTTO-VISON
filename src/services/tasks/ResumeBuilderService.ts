/**
 * Resume/CV Builder Service
 * Helps create professional resumes and CVs
 */

interface ResumeRequest {
  name?: string;
  role?: string;
  experience?: string[];
  skills?: string[];
  style?: 'professional' | 'creative' | 'minimal';
}

interface ResumeOutline {
  sections: {
    title: string;
    content: string[];
    tips: string[];
  }[];
}

class ResumeBuilderService {
  private static instance: ResumeBuilderService;

  private constructor() {
    console.log('[Resume Builder] Service initialized');
  }

  static getInstance(): ResumeBuilderService {
    if (!ResumeBuilderService.instance) {
      ResumeBuilderService.instance = new ResumeBuilderService();
    }
    return ResumeBuilderService.instance;
  }

  /**
   * Generate resume outline
   */
  async generateOutline(request: ResumeRequest): Promise<ResumeOutline> {
    const { role = 'Professional', style = 'professional' } = request;

    console.log(`[Resume Builder] Creating ${style} resume for: ${role}`);

    return {
      sections: [
        {
          title: 'Contact Information',
          content: [
            '• Full Name',
            '• Phone: (XXX) XXX-XXXX',
            '• Email: your.email@example.com',
            '• LinkedIn: linkedin.com/in/yourname',
            '• Location: City, State',
          ],
          tips: [
            'Use a professional email address',
            'Make sure phone number is current',
            'Include LinkedIn profile',
          ],
        },
        {
          title: 'Professional Summary',
          content: [
            `Dynamic ${role} with [X] years of experience in [industry/field]. Proven track record of [key achievement]. Skilled in [key skills]. Passionate about [relevant interest].`,
          ],
          tips: [
            '2-3 sentences max',
            'Focus on value you bring',
            'Tailor to the job description',
          ],
        },
        {
          title: 'Work Experience',
          content: [
            '**Job Title** | Company Name | Dates',
            '• Achieved [quantifiable result]',
            '• Led [project or initiative]',
            '• Improved [metric] by [percentage]',
            '• Collaborated with [teams/stakeholders]',
            '',
            '**Previous Job Title** | Company | Dates',
            '• [Achievement with numbers]',
            '• [Responsibility or project]',
          ],
          tips: [
            'Use action verbs (Led, Achieved, Improved)',
            'Include quantifiable results',
            'Most recent first',
            '3-5 bullet points per job',
          ],
        },
        {
          title: 'Education',
          content: [
            '**Degree** | University Name | Graduation Year',
            '• Major: [Your Major]',
            '• GPA: X.X (if 3.5+)',
            '• Relevant Coursework: [courses]',
            '• Honors: [if any]',
          ],
          tips: [
            'Include GPA if 3.5 or higher',
            'List relevant coursework',
            'Mention honors and awards',
          ],
        },
        {
          title: 'Skills',
          content: [
            '**Technical:** [Software, tools, languages]',
            '**Soft Skills:** [Communication, leadership, etc.]',
            '**Languages:** [English (Native), Spanish (Fluent)]',
          ],
          tips: [
            'Group by category',
            'Be honest about proficiency',
            'Match job requirements',
          ],
        },
        {
          title: 'Projects (Optional)',
          content: [
            '**Project Name** | Link',
            '• Description of project',
            '• Technologies used',
            '• Impact or results',
          ],
          tips: [
            'Include relevant projects',
            'Show your work',
            'Add links if available',
          ],
        },
      ],
    };
  }

  /**
   * Format resume
   */
  formatResume(outline: ResumeOutline): string {
    let text = `📄 Resume/CV Template\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const section of outline.sections) {
      text += `## ${section.title}\n\n`;
      for (const line of section.content) {
        text += `${line}\n`;
      }
      text += `\n📝 Tips:\n`;
      for (const tip of section.tips) {
        text += `${tip}\n`;
      }
      text += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    }

    return text;
  }
}

export default ResumeBuilderService.getInstance();
