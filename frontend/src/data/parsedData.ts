// Types for parsed student data from HTML

export type ParsedStudentStatus = 
  | "Special Attention" 
  | "Lagging" 
  | "Ideal" 
  | "Ahead";

export type CourseStatus = "Completed" | "In Progress" | "Not Started";

export type AssignmentStatus = "Completed" | "Uncompleted";

export type CheckinMood = "good" | "neutral" | "bad";

export interface CheckinGoal {
  title: string;   // course name
  items: string[]; // topics learned
}

export interface DailyCheckin {
  date: string;            // e.g. "Sat, Feb 14, 2026"
  mood: CheckinMood;
  goals: CheckinGoal[];
  reflection: string;
}

export interface PointHistory {
  date: string;
  description: string;
  points: number;
}

export interface Assignment {
  name: string;
  status: AssignmentStatus;
}

export interface Course {
  name: string;
  progress: string; // e.g., "39%"
  status: CourseStatus;
}

export interface StudentProfile {
  university: string;
  major: string;
  photoUrl: string;
  profileLink: string;
}

export interface ParsedStudent {
  name: string;
  status: ParsedStudentStatus | null;
  courses: Course[];
  assignments?: Assignment[];
  dailyCheckins?: DailyCheckin[];
  pointHistories?: PointHistory[];
  imageUrl?: string;
  profile?: StudentProfile;
}

export interface MentorInfo {
  group: string;       // e.g. "CAC-19"
  mentorCode: string;  // e.g. "facil-cac-19"
  name: string;
}

export interface StudentData {
  students: ParsedStudent[];
  parsedAt: string; // ISO timestamp
  totalStudents: number;
  mentor?: MentorInfo;
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

// Helper function to get assignment statistics across all students
export const getAssignmentStats = (students: ParsedStudent[]) => {
  const assignmentMap = new Map<string, {
    totalStudents: number;
    completed: number;
    uncompleted: number;
  }>();

  students.forEach(student => {
    (student.assignments || []).forEach(assignment => {
      if (!assignmentMap.has(assignment.name)) {
        assignmentMap.set(assignment.name, {
          totalStudents: 0,
          completed: 0,
          uncompleted: 0,
        });
      }

      const stats = assignmentMap.get(assignment.name)!;
      stats.totalStudents++;
      if (assignment.status === 'Completed') {
        stats.completed++;
      } else {
        stats.uncompleted++;
      }
    });
  });

  return Array.from(assignmentMap.entries()).map(([name, stats]) => ({
    name,
    ...stats,
    completionRate: stats.totalStudents > 0
      ? Math.round((stats.completed / stats.totalStudents) * 100)
      : 0,
  }));
};

// Helper: parse a check-in date string like "Sat, Feb 14, 2026" to a Date
export const parseCheckinDate = (dateStr: string): Date => {
  // Remove day-of-week prefix like "Sat, "
  const cleaned = dateStr.replace(/^\w+,\s*/, '');
  return new Date(cleaned);
};

// Helper function to get daily check-in statistics across all students
export const getCheckinStats = (students: ParsedStudent[]) => {
  let totalCheckins = 0;
  let moodGood = 0;
  let moodNeutral = 0;
  let moodBad = 0;
  const missingStudents: string[] = [];
  const streaks: { name: string; streak: number }[] = [];

  students.forEach(student => {
    const checkins = student.dailyCheckins || [];
    totalCheckins += checkins.length;

    if (checkins.length === 0) {
      missingStudents.push(student.name);
      streaks.push({ name: student.name, streak: 0 });
      return;
    }

    checkins.forEach(ci => {
      if (ci.mood === 'good') moodGood++;
      else if (ci.mood === 'neutral') moodNeutral++;
      else moodBad++;
    });

    // Calculate streak (consecutive days from most recent)
    const sortedDates = checkins
      .map(ci => parseCheckinDate(ci.date).getTime())
      .sort((a, b) => b - a); // newest first

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = sortedDates[i - 1] - sortedDates[i];
      if (diff <= 86400000 * 1.5) { // ~1.5 days to handle timezone variance
        streak++;
      } else {
        break;
      }
    }
    streaks.push({ name: student.name, streak });
  });

  streaks.sort((a, b) => b.streak - a.streak);

  return {
    totalCheckins,
    moodGood,
    moodNeutral,
    moodBad,
    missingStudents,
    streaks,
  };
};

// Helper function to get heatmap data for the check-in calendar
export const getCheckinHeatmapData = (students: ParsedStudent[]) => {
  // 1. Collect all actual check-in dates
  const checkinDates = new Set<string>();
  let minDateVal = new Date().getTime(); // Start with today

  students.forEach(student => {
    (student.dailyCheckins || []).forEach(ci => {
      const d = parseCheckinDate(ci.date);
      const time = d.getTime();
      checkinDates.add(d.toISOString().split('T')[0]); // YYYY-MM-DD
      if (time < minDateVal) minDateVal = time;
    });
  });

  // 2. Determine range: Min(earliest checkin, today) to Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDateVal = today.getTime();
  
  // Ensure minDate is not in the future (fallback to 2 weeks ago if no data)
  if (minDateVal > maxDateVal) {
    minDateVal = maxDateVal - (14 * 24 * 60 * 60 * 1000); 
  }

  // 3. Generate continuous date array
  const allDates: string[] = [];
  const currentDate = new Date(minDateVal);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate.getTime() <= maxDateVal) {
    allDates.push(currentDate.toISOString().split('T')[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // 4. Build rows
  const rows = students.map(student => {
    const checkinMap = new Map<string, DailyCheckin>();
    (student.dailyCheckins || []).forEach(ci => {
      const d = parseCheckinDate(ci.date);
      checkinMap.set(d.toISOString().split('T')[0], ci);
    });

    return {
      name: student.name,
      cells: allDates.map(date => {
        const checkin = checkinMap.get(date);
        return {
          date,
          hasCheckin: !!checkin,
          mood: checkin?.mood || null,
          goals: checkin?.goals || [],
          reflection: checkin?.reflection || "",
        };
      }),
    };
  });

  return { dates: allDates, rows };
};
