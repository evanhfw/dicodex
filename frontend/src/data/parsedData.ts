// Types for parsed student data from HTML

export type ParsedStudentStatus = 
  | "Special Attention" 
  | "Lagging" 
  | "Ideal" 
  | "Ahead";

export type CourseStatus = "Completed" | "In Progress" | "Not Started";

export interface Course {
  name: string;
  progress: string; // e.g., "39%"
  status: CourseStatus;
}

export interface ParsedStudent {
  name: string;
  status: ParsedStudentStatus | null;
  courses: Course[];
  imageUrl?: string;
}

export interface StudentData {
  students: ParsedStudent[];
  parsedAt: string; // ISO timestamp
  totalStudents: number;
}

// Status mapping from HTML to app format
export const statusMap: Record<string, ParsedStudentStatus> = {
  "Need Special Attention": "Special Attention",
  "Special Attention": "Special Attention",
  "Ideal": "Ideal",
  "Lagging": "Lagging",
  "Ahead": "Ahead",
  "On Track": "Ideal", // fallback mapping
};

// Helper function to map status
export const mapStatus = (htmlStatus: string | null): ParsedStudentStatus | null => {
  if (!htmlStatus) return null;
  return statusMap[htmlStatus] || null;
};

// Helper function to calculate average progress for a student
export const calculateAverageProgress = (courses: Course[]): number => {
  if (courses.length === 0) return 0;
  
  const total = courses.reduce((sum, course) => {
    const progress = parseFloat(course.progress.replace('%', ''));
    return sum + progress;
  }, 0);
  
  return Math.round(total / courses.length);
};

// Helper function to get status color class
export const getStatusColor = (status: ParsedStudentStatus | null): string => {
  switch (status) {
    case "Special Attention":
      return "status-red";
    case "Lagging":
      return "status-yellow";
    case "Ideal":
      return "status-green";
    case "Ahead":
      return "status-blue";
    default:
      return "text-muted-foreground";
  }
};

// Helper function to get course statistics
export const getCourseStats = (students: ParsedStudent[]) => {
  const courseMap = new Map<string, {
    totalEnrolled: number;
    completed: number;
    inProgress: number;
    notStarted: number;
    totalProgress: number;
  }>();

  students.forEach(student => {
    student.courses.forEach(course => {
      if (!courseMap.has(course.name)) {
        courseMap.set(course.name, {
          totalEnrolled: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalProgress: 0,
        });
      }

      const stats = courseMap.get(course.name)!;
      stats.totalEnrolled++;
      stats.totalProgress += parseFloat(course.progress.replace('%', ''));

      if (course.status === "Completed") {
        stats.completed++;
      } else if (course.status === "In Progress") {
        stats.inProgress++;
      } else {
        stats.notStarted++;
      }
    });
  });

  return Array.from(courseMap.entries()).map(([name, stats]) => ({
    name,
    ...stats,
    averageProgress: Math.round(stats.totalProgress / stats.totalEnrolled),
    completionRate: Math.round((stats.completed / stats.totalEnrolled) * 100),
  }));
};

// Helper function to get status counts
export const getStatusCounts = (students: ParsedStudent[]) => {
  const counts: Record<ParsedStudentStatus, number> = {
    "Special Attention": 0,
    "Lagging": 0,
    "Ideal": 0,
    "Ahead": 0,
  };

  students.forEach(student => {
    if (student.status) {
      counts[student.status]++;
    }
  });

  return counts;
};

// Helper function to filter students by status
export const getStudentsByStatus = (
  students: ParsedStudent[],
  status: ParsedStudentStatus
) => {
  return students.filter(s => s.status === status);
};

// Helper function to get students enrolled in a specific course with their progress
export const getStudentsByCourse = (
  students: ParsedStudent[], 
  courseName: string
) => {
  return students
    .map(student => {
      const course = student.courses.find(c => c.name === courseName);
      if (!course) return null;
      
      return {
        studentName: student.name,
        studentStatus: student.status,
        courseProgress: parseFloat(course.progress.replace('%', '')),
        courseStatus: course.status,
        course: course,
      };
    })
    .filter(Boolean) as Array<{
      studentName: string;
      studentStatus: ParsedStudentStatus | null;
      courseProgress: number;
      courseStatus: CourseStatus;
      course: Course;
    }>;
};
