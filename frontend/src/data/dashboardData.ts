export type StudentStatus = "Special Attention" | "Lagging" | "Ideal" | "Ahead";

export interface Student {
  id: number;
  name: string;
  status: StudentStatus;
  assignmentsSubmitted: string[]; // IDs of submitted assignments
  attendanceRate: number; // 0–100
  weeklyProgress: number[]; // 6 data points for sparkline
}

export interface Assignment {
  id: string;
  name: string;
}

export interface WeeklyAttendance {
  week: string;
  rate: number;
}

// Active assignments
export const assignments: Assignment[] = [
  { id: "a1", name: "Module 1: Intro to Python" },
  { id: "a2", name: "Module 2: Web Basics" },
  { id: "a3", name: "Module 3: Data Viz" },
  { id: "a4", name: "Module 4: APIs & Integration" },
];

// 25 students with realistic dummy data
export const students: Student[] = [
  { id: 1, name: "Aisyah Tan", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 95, weeklyProgress: [60, 65, 72, 78, 85, 90] },
  { id: 2, name: "Brandon Lee", status: "Ahead", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 98, weeklyProgress: [70, 75, 82, 88, 92, 97] },
  { id: 3, name: "Chitra Devi", status: "Lagging", assignmentsSubmitted: ["a1", "a2"], attendanceRate: 72, weeklyProgress: [40, 42, 45, 48, 50, 52] },
  { id: 4, name: "Daniel Ng", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 90, weeklyProgress: [55, 60, 68, 74, 80, 85] },
  { id: 5, name: "Elena Koh", status: "Special Attention", assignmentsSubmitted: ["a1"], attendanceRate: 55, weeklyProgress: [30, 28, 32, 30, 35, 33] },
  { id: 6, name: "Farid Hassan", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 92, weeklyProgress: [50, 58, 65, 72, 78, 84] },
  { id: 7, name: "Grace Lim", status: "Ahead", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 100, weeklyProgress: [65, 72, 80, 87, 93, 98] },
  { id: 8, name: "Hafiz Rahman", status: "Lagging", assignmentsSubmitted: ["a1", "a2", "a3"], attendanceRate: 68, weeklyProgress: [35, 38, 42, 45, 48, 50] },
  { id: 9, name: "Indira Patel", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 88, weeklyProgress: [52, 58, 64, 70, 76, 82] },
  { id: 10, name: "James Wong", status: "Special Attention", assignmentsSubmitted: ["a1", "a2"], attendanceRate: 50, weeklyProgress: [25, 22, 28, 25, 30, 28] },
  { id: 11, name: "Kavitha Raj", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 93, weeklyProgress: [58, 64, 70, 76, 82, 88] },
  { id: 12, name: "Liam Chen", status: "Ahead", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 97, weeklyProgress: [68, 74, 80, 86, 92, 96] },
  { id: 13, name: "Mei Ling Teo", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3"], attendanceRate: 85, weeklyProgress: [48, 55, 62, 68, 74, 80] },
  { id: 14, name: "Nurul Amin", status: "Lagging", assignmentsSubmitted: ["a1"], attendanceRate: 65, weeklyProgress: [32, 35, 38, 40, 42, 45] },
  { id: 15, name: "Oscar Yap", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 91, weeklyProgress: [54, 60, 66, 73, 79, 86] },
  { id: 16, name: "Priya Sharma", status: "Ahead", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 96, weeklyProgress: [62, 70, 78, 84, 90, 95] },
  { id: 17, name: "Qian Wei", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 89, weeklyProgress: [50, 56, 63, 70, 77, 83] },
  { id: 18, name: "Ryan Tan", status: "Lagging", assignmentsSubmitted: ["a1", "a2"], attendanceRate: 70, weeklyProgress: [38, 40, 43, 46, 48, 51] },
  { id: 19, name: "Siti Nurhaliza", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 94, weeklyProgress: [56, 62, 69, 75, 82, 89] },
  { id: 20, name: "Timothy Goh", status: "Special Attention", assignmentsSubmitted: [], attendanceRate: 45, weeklyProgress: [20, 18, 22, 20, 24, 22] },
  { id: 21, name: "Uma Krishnan", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3"], attendanceRate: 87, weeklyProgress: [46, 53, 60, 66, 72, 78] },
  { id: 22, name: "Victor Loh", status: "Ahead", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 99, weeklyProgress: [66, 73, 81, 88, 94, 99] },
  { id: 23, name: "Wendy Chua", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 86, weeklyProgress: [44, 52, 60, 67, 74, 80] },
  { id: 24, name: "Xavier Sim", status: "Lagging", assignmentsSubmitted: ["a1", "a2", "a3"], attendanceRate: 73, weeklyProgress: [36, 39, 44, 47, 50, 53] },
  { id: 25, name: "Yasmin Othman", status: "Ideal", assignmentsSubmitted: ["a1", "a2", "a3", "a4"], attendanceRate: 90, weeklyProgress: [52, 58, 65, 72, 78, 85] },
];

// Weekly attendance data for bar chart
export const weeklyAttendance: WeeklyAttendance[] = [
  { week: "Week 1", rate: 92 },
  { week: "Week 2", rate: 88 },
  { week: "Week 3", rate: 85 },
  { week: "Week 4", rate: 82 },
];

// Program timeline
export interface Milestone {
  date: Date;
  label: string;
  type: "deadline" | "event" | "checkpoint";
}

export const programTimeline = {
  startDate: new Date("2026-01-05"),
  endDate: new Date("2026-04-05"),
  today: new Date("2026-02-07"),
  totalDays: 90,
};

export const milestones: Milestone[] = [
  { date: new Date("2026-01-05"), label: "Orientation & Kickoff", type: "event" },
  { date: new Date("2026-01-19"), label: "Module 1 Deadline", type: "deadline" },
  { date: new Date("2026-02-02"), label: "Module 2 Deadline", type: "deadline" },
  { date: new Date("2026-02-14"), label: "Mid-Program Review", type: "checkpoint" },
  { date: new Date("2026-02-23"), label: "Module 3 Deadline", type: "deadline" },
  { date: new Date("2026-03-09"), label: "Module 4 Deadline", type: "deadline" },
  { date: new Date("2026-03-23"), label: "Final Project Kickoff", type: "event" },
  { date: new Date("2026-04-05"), label: "Demo Day & Graduation", type: "event" },
];

// Get students who haven't submitted a specific assignment with their progress
export const getStudentsForAssignment = (assignmentId: string) => {
  return students
    .filter((s) => !s.assignmentsSubmitted.includes(assignmentId))
    .map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      progress: Math.round(
        (s.assignmentsSubmitted.length / assignments.length) * 100
      ),
      attendanceRate: s.attendanceRate,
    }));
};

// Computed helpers
export const getStatusColor = (status: StudentStatus): string => {
  switch (status) {
    case "Special Attention": return "status-red";
    case "Lagging": return "status-yellow";
    case "Ideal": return "status-green";
    case "Ahead": return "status-blue";
  }
};

export const getStatusCounts = () => {
  const counts = { "Special Attention": 0, Lagging: 0, Ideal: 0, Ahead: 0 };
  students.forEach((s) => counts[s.status]++);
  return counts;
};

export const getStudentsByStatus = (status: StudentStatus) => {
  return students
    .filter((s) => s.status === status)
    .map((s) => ({
      id: s.id,
      name: s.name,
      status: s.status,
      attendanceRate: s.attendanceRate,
      assignmentsSubmitted: s.assignmentsSubmitted.length,
      totalAssignments: assignments.length,
    }));
};

export const getUnsubmittedCounts = () => {
  return assignments.map((assignment) => {
    const pending = students.filter(
      (s) => !s.assignmentsSubmitted.includes(assignment.id)
    ).length;
    return { ...assignment, pending };
  }).sort((a, b) => b.pending - a.pending);
};
