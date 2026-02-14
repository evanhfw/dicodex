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
  // #region agent log
  console.log('[DEBUG H1] parseStudentHTML called, htmlLength:', htmlString?.length || 0);
  fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'htmlParser.ts:19',message:'parseStudentHTML called',data:{htmlLength:htmlString?.length || 0},timestamp:Date.now(),runId:'parse',hypothesisId:'H1'})}).catch(()=>{});
  // #endregion
  
  try {
    // Validate input
    if (!htmlString || htmlString.trim().length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'htmlParser.ts:26',message:'HTML empty validation failed',data:{},timestamp:Date.now(),runId:'parse',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
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

      // Extract status from div.w-full.py-3.text-center > p
      let status: string | null = null;
      
      // Find the status paragraph
      const statusDiv = container.querySelector('div.w-full.py-3.text-center');
      // #region agent log
      console.log('[DEBUG STATUS]', studentName, 'statusDiv found:', !!statusDiv);
      // #endregion
      
      if (statusDiv) {
        const statusP = statusDiv.querySelector('p');
        // #region agent log
        console.log('[DEBUG STATUS]', studentName, 'statusP found:', !!statusP, 'text:', statusP?.textContent?.trim());
        // #endregion
        
        if (statusP) {
          // Get text and normalize all whitespace (including newlines, tabs, etc)
          const rawText = statusP.textContent || '';
          const statusText = rawText.replace(/\s+/g, ' ').trim();
          
          // #region agent log
          console.log('[DEBUG STATUS]', studentName, 'normalized statusText:', statusText, 'length:', statusText.length);
          // #endregion
          
          // Check for status keywords - use includes for flexibility
          if (statusText.includes('Need Special Attention')) {
            status = 'Need Special Attention';
          } else if (statusText.includes('Special Attention')) {
            status = 'Special Attention';
          } else if (statusText.includes('Lagging')) {
            status = 'Lagging';
          } else if (statusText.includes('Ideal')) {
            status = 'Ideal';
          } else if (statusText.includes('Ahead')) {
            status = 'Ahead';
          } else if (statusText.includes('On Track')) {
            status = 'On Track';
          }
          
          // #region agent log
          console.log('[DEBUG STATUS]', studentName, 'final status:', status);
          // #endregion
        }
      } else {
        // #region agent log
        // Try to find what divs we DO have
        const allDivs = container.querySelectorAll('div[class*="w-full"]');
        console.log('[DEBUG STATUS]', studentName, 'statusDiv NOT FOUND, total w-full divs:', allDivs.length);
        // #endregion
      }

      // Extract courses from section.attendances
      const courses: Course[] = [];
      const attendanceSections = container.querySelectorAll('section.attendances');
      
      // #region agent log
      console.log('[DEBUG COURSES]', studentName, 'attendanceSections found:', attendanceSections.length);
      // #endregion

      attendanceSections.forEach((section, sectionIdx) => {
        // Find all progress bars in this section
        const progressBars = section.querySelectorAll<HTMLElement>('div[style*="width:"]');
        // #region agent log
        console.log('[DEBUG COURSES]', studentName, 'section', sectionIdx, 'progressBars:', progressBars.length);
        // #endregion
        
        progressBars.forEach((progressBar, barIdx) => {
          if (progressBar.style.width) {
            const percentage = progressBar.style.width;
            
            // Find the parent container that has the course information (border-b class)
            let courseContainer: HTMLElement | null = progressBar.parentElement;
            let depth = 0;
            while (courseContainer && depth < 10) {
              if (courseContainer.classList.contains('border-b')) {
                break;
              }
              courseContainer = courseContainer.parentElement;
              depth++;
            }
            
            // #region agent log
            if (barIdx < 2) {
              console.log('[DEBUG COURSES]', studentName, 'bar', barIdx, 'found border-b:', !!courseContainer?.classList.contains('border-b'), 'at depth:', depth);
            }
            // #endregion
            
            if (courseContainer && courseContainer.classList.contains('border-b')) {
              // Get the text content - it's all in one line
              const fullText = courseContainer.textContent?.trim() || '';
              
              // #region agent log
              if (barIdx < 2) {
                console.log('[DEBUG COURSES]', studentName, 'bar', barIdx, 'fullText preview:', fullText.substring(0, 100));
              }
              // #endregion
              
              // Pattern: "Course Name39%In ProgressIn Progress" or "Course Name0%Not StartedNot Started"
              // Split by newlines first to get the first meaningful line
              const lines = fullText.split('\n').map(l => l.trim()).filter(l => l);
              let courseName = lines[0] || '';
              
              // If first line has percentage, extract before it
              const percentMatch = courseName.match(/^(.+?)(\d+%).*$/);
              if (percentMatch) {
                courseName = percentMatch[1].trim();
              }
              
              // #region agent log
              if (barIdx < 2) {
                console.log('[DEBUG COURSES]', studentName, 'bar', barIdx, 'courseName after cleanup:', courseName, 'len:', courseName.length);
              }
              // #endregion
              
              // Skip if not a valid course (more lenient validation)
              if (courseName && 
                  courseName.length >= 5 && 
                  courseName.length < 200 &&
                  !courseName.toLowerCase().includes('total point') &&
                  !courseName.toLowerCase().includes('course progress') &&
                  !courseName.toLowerCase().includes('your learning') &&
                  !courseName.toLowerCase().includes('attendance') &&
                  !courseName.toLowerCase().includes('last updated')) {
                
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
          }
        });
      });

      // Add student to list
      students.push({
        name: studentName,
        status: mapStatus(status),
        courses,
      });
    });

    if (students.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'htmlParser.ts:155',message:'No students extracted',data:{studentHeadersFound:doc.querySelectorAll('h3.text-3xl.font-semibold').length},timestamp:Date.now(),runId:'parse',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      return {
        success: false,
        error: 'No valid student data found in HTML',
      };
    }

    // #region agent log
    console.log('[DEBUG H2] Parser SUCCESS:', {
      totalStudents: students.length,
      firstStudent: students[0]?.name,
      firstStatus: students[0]?.status,
      firstCourses: students[0]?.courses?.length
    });
    fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'htmlParser.ts:165',message:'Parser success',data:{totalStudents:students.length,firstStudentName:students[0]?.name,firstStudentStatus:students[0]?.status,firstStudentCourses:students[0]?.courses?.length},timestamp:Date.now(),runId:'parse',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

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
