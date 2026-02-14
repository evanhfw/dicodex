import { ParsedStudent, Course, mapStatus } from '@/data/parsedData';

export interface ParseResult {
  success: boolean;
  students?: ParsedStudent[];
  error?: string;
}

/**
 * Parse student data from HTML string
 * Extracts student names, status, and course progress
 */
export const parseStudentHTML = (htmlString: string): ParseResult => {
  try {
    // Validate input
    if (!htmlString || htmlString.trim().length === 0) {
      return {
        success: false,
        error: 'HTML content is empty',
      };
    }

    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Check for parsing errors
    const parserError = doc.querySelector('parsererror');
    if (parserError) {
      return {
        success: false,
        error: 'Invalid HTML structure',
      };
    }

    // Find all student sections by h3 tags with specific class
    const studentHeaders = doc.querySelectorAll('h3.text-3xl.font-semibold');

    if (studentHeaders.length === 0) {
      return {
        success: false,
        error: 'No students found in HTML. Make sure the HTML structure is correct.',
      };
    }

    const students: ParsedStudent[] = [];

    studentHeaders.forEach((h3) => {
      const studentName = h3.textContent?.trim() || '';
      
      if (!studentName) return;

      // Find the parent container
      let container = h3.parentElement;
      while (container && !container.classList.contains('container')) {
        container = container.parentElement;
      }

      if (!container) return;

      // Extract status from profile section
      let status: string | null = null;
      const profileSection = container.querySelector('section.profile');
      
      if (profileSection) {
        const profileText = profileSection.textContent || '';
        
        // Check for status keywords
        const statusKeywords = [
          'Need Special Attention',
          'Special Attention',
          'Lagging',
          'Ideal',
          'Ahead',
          'On Track'
        ];
        
        for (const keyword of statusKeywords) {
          if (profileText.includes(keyword)) {
            status = keyword;
            break;
          }
        }
      }

      // Extract courses
      const courses: Course[] = [];
      const courseContainers = container.querySelectorAll('div.border-b.p-6');

      courseContainers.forEach((courseDiv) => {
        // Find progress bar with width style
        const progressBar = courseDiv.querySelector<HTMLElement>('div[style*="width:"]');
        
        if (progressBar && progressBar.style.width) {
          const percentage = progressBar.style.width;
          
          // Get the text content to extract course name
          const fullText = courseDiv.textContent || '';
          const parts = fullText.split('|').map(p => p.trim());
          const courseName = parts[0];

          // Skip if not a valid course (e.g., "Total Point", etc.)
          if (courseName && 
              courseName.length > 10 && 
              courseName.length < 200 &&
              !courseName.includes('Total Point') &&
              !courseName.includes('Attendance')) {
            
            // Extract course status
            let courseStatus: Course['status'] = 'Not Started';
            if (fullText.includes('Completed')) {
              courseStatus = 'Completed';
            } else if (fullText.includes('In Progress')) {
              courseStatus = 'In Progress';
            }

            courses.push({
              name: courseName,
              progress: percentage,
              status: courseStatus,
            });
          }
        }
      });

      // Add student to list
      students.push({
        name: studentName,
        status: mapStatus(status),
        courses,
      });
    });

    if (students.length === 0) {
      return {
        success: false,
        error: 'No valid student data found in HTML',
      };
    }

    return {
      success: true,
      students,
    };
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred while parsing HTML',
    };
  }
};

/**
 * Validate file size (max 10MB)
 */
export const validateFileSize = (file: File): boolean => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
};

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};
