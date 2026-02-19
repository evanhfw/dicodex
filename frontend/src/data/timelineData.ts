// Real curriculum timeline data for DBS diCodex 2026 H1
// Extracted from the official curriculum spreadsheet

export type MilestoneType = 'deadline' | 'event' | 'checkpoint' | 'ilt';

export interface TimelineMilestone {
  date: Date;
  label: string;
  type: MilestoneType;
}

export interface ProgramTimelineData {
  learningPath: string;
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  milestones: TimelineMilestone[];
}

// ─── AI Learning Path (CAC) ───────────────────────────────────────────────────

const aiMilestones: TimelineMilestone[] = [
  // Week 0 — Orientation
  { date: new Date('2026-02-09'), label: 'Orientasi & Technical Briefing', type: 'event' },

  // Week 1
  { date: new Date('2026-02-16'), label: 'AI Class Deadline (Minggu 0)', type: 'deadline' },
  { date: new Date('2026-02-18'), label: 'AI Class Deadline (Minggu 1)', type: 'deadline' },

  // Week 2 — ILT 1
  { date: new Date('2026-02-23'), label: 'Tech ILT 1: AI - Understanding the Basics of Python Programming', type: 'ilt' },

  // MA1 Cut-off
  { date: new Date('2026-03-03'), label: 'MA1 Cut-off', type: 'checkpoint' },
  { date: new Date('2026-03-02'), label: 'AI Class Deadline (Minggu 2)', type: 'deadline' },

  // Week 3
  { date: new Date('2026-03-01'), label: 'Assignment SS 2 Deadline', type: 'deadline' },

  // Week 4
  { date: new Date('2026-03-09'), label: '[Wajib] Financial Literacy #1', type: 'event' },
  { date: new Date('2026-03-15'), label: 'Assignment SS 2 Deadline', type: 'deadline' },
  { date: new Date('2026-03-09'), label: 'Tech ILT 2: AI - Intro to Supervised Learning', type: 'ilt' },

  // Week 5 — Libur Lebaran
  { date: new Date('2026-03-16'), label: 'Libur Lebaran dan Hari Raya Nyepi', type: 'event' },

  // Week 6
  { date: new Date('2026-03-23'), label: 'Belajar ML untuk Pemula (Story/Prediksi)', type: 'checkpoint' },

  // Week 7
  { date: new Date('2026-03-30'), label: 'Tech ILT 3: AI - Unsupervised Learning', type: 'ilt' },
  { date: new Date('2026-03-30'), label: '[Wajib] Team Meeting #1', type: 'event' },
  { date: new Date('2026-04-05'), label: 'Assignment SS 3 Deadline', type: 'deadline' },

  // Week 8 — ILT 3
  { date: new Date('2026-04-06'), label: 'Belajar Fundamental Deep Learning (Neural Network & Keras)', type: 'checkpoint' },

  // Week 9
  { date: new Date('2026-04-13'), label: '[Wajib] Financial Literacy #3', type: 'event' },
  { date: new Date('2026-04-13'), label: 'Belajar Fundamental Deep Learning (Submission Proyek)', type: 'checkpoint' },

  // MA2 Cut-off
  { date: new Date('2026-04-14'), label: 'MA2 Cut-off', type: 'checkpoint' },

  // Week 10
  { date: new Date('2026-04-20'), label: 'Fundamental Deep Learning (Discriminative AI vs Generative AI)', type: 'checkpoint' },
  { date: new Date('2026-04-26'), label: 'Assignment SS 4 Deadline', type: 'deadline' },

  // Week 11 — Tech ILT 4
  { date: new Date('2026-04-27'), label: 'Tech ILT 4: AI - Deep Learning, Computer Vision & Time Series', type: 'ilt' },
  { date: new Date('2026-05-11'), label: 'AI Class Deadline (Capstone)', type: 'deadline' },

  // Week 12
  { date: new Date('2026-05-04'), label: 'Belajar Fundamental Deep Learning (Lulus)', type: 'checkpoint' },
  { date: new Date('2026-05-10'), label: 'Assignment SS 5 Deadline', type: 'deadline' },

  // Week 13 — Tech ILT 5
  { date: new Date('2026-05-11'), label: 'Tech ILT 5: AI - Game Changer: NLP & Generative AI', type: 'ilt' },

  // MA3 / Assignment Soft Skills Cut-off
  { date: new Date('2026-05-19'), label: 'MA3 & Assignment Soft Skills Cut-off', type: 'checkpoint' },

  // Week 14
  { date: new Date('2026-05-18'), label: 'Membangun Proyek Deep Learning Tingkat Mahir (Object Detection)', type: 'checkpoint' },
  { date: new Date('2026-05-24'), label: 'Assignment SS 6 Deadline', type: 'deadline' },

  // Week 15 — Tech ILT 6
  { date: new Date('2026-05-25'), label: 'Tech ILT 6: AI - Beyond the Template: Building Flexible Models', type: 'ilt' },
  { date: new Date('2026-05-25'), label: '[Wajib] Team Meeting #2', type: 'event' },

  // Week 16
  { date: new Date('2026-06-01'), label: 'Membangun Proyek Deep Learning Tingkat Mahir (Ujian Akhir)', type: 'checkpoint' },
  { date: new Date('2026-06-07'), label: 'Assignment SS 7 Deadline', type: 'deadline' },
  { date: new Date('2026-06-01'), label: 'Tech ILT 7: AI - Building Time Series Prediction Models', type: 'ilt' },

  // MA4 / Final Deadline
  { date: new Date('2026-06-08'), label: 'AI Class Deadline (Final)', type: 'deadline' },

  // MA4 Cut-off
  { date: new Date('2026-06-30'), label: 'MA4 Cut-off', type: 'checkpoint' },

  // Week 17
  { date: new Date('2026-06-08'), label: 'Membangun Proyek Deep Learning Tingkat Mahir (Lulus)', type: 'checkpoint' },

  // Week 18-19 — Penilaian Akhir
  { date: new Date('2026-06-15'), label: 'Penilaian Akhir oleh Assessor', type: 'event' },

  // Week 20-21 — Penilaian Juri
  { date: new Date('2026-06-29'), label: 'Penilaian Akhir oleh Juri', type: 'event' },

  // Week 22 — Pengolahan Nilai
  { date: new Date('2026-07-13'), label: 'Pengolahan Nilai Transkrip Akhir', type: 'event' },

  // Week 23 — Transkrip
  { date: new Date('2026-07-20'), label: 'Transkrip Akhir', type: 'event' },

  // Week 24 — Sertifikat
  { date: new Date('2026-07-27'), label: 'Sertifikat', type: 'event' },
];

const AI_TIMELINE: ProgramTimelineData = {
  learningPath: 'AI',
  startDate: new Date('2026-02-09'),
  endDate: new Date('2026-07-27'),
  totalWeeks: 24,
  milestones: aiMilestones.sort((a, b) => a.date.getTime() - b.date.getTime()),
};

// ─── DS Learning Path (CDC) — Data Scientist ─────────────────────────────────

const dsMilestones: TimelineMilestone[] = [
  // Week 0 — Orientation
  { date: new Date('2026-02-09'), label: 'Orientasi & Technical Briefing', type: 'event' },

  // Week 0–1 Deadlines
  { date: new Date('2026-02-16'), label: 'DS Class Deadline (Minggu 0)', type: 'deadline' },
  { date: new Date('2026-02-18'), label: 'DS Class Deadline (Minggu 1-a)', type: 'deadline' },
  { date: new Date('2026-02-20'), label: 'DS Class Deadline (Minggu 1-b)', type: 'deadline' },

  // Week 2 — ILT 1
  { date: new Date('2026-02-23'), label: 'Tech ILT 1: DS - Understanding the Basics of Python Programming', type: 'ilt' },
  { date: new Date('2026-03-01'), label: 'Assignment SS 1 Deadline', type: 'deadline' },

  // MA1 Cut-off
  { date: new Date('2026-03-03'), label: 'MA1 Cut-off', type: 'checkpoint' },
  { date: new Date('2026-03-05'), label: 'DS Class Deadline (Minggu 2)', type: 'deadline' },

  // Week 3
  // (courses: Memulai Pemrograman dengan Python s.d Lulus, Belajar ML Pemula s.d Regresi)

  // Week 4
  { date: new Date('2026-03-09'), label: '[Wajib] Financial Literacy #1', type: 'event' },
  { date: new Date('2026-03-09'), label: 'Tech ILT 2: DS - Intro to Supervised Learning', type: 'ilt' },
  { date: new Date('2026-03-15'), label: 'Assignment SS 2 Deadline', type: 'deadline' },

  // Week 5 — Libur Lebaran
  { date: new Date('2026-03-16'), label: 'Libur Lebaran dan Hari Raya Nyepi', type: 'event' },

  // Week 6
  { date: new Date('2026-03-23'), label: 'Belajar ML untuk Pemula (s.d Ujian Akhir)', type: 'checkpoint' },

  // Week 7
  { date: new Date('2026-03-30'), label: '[Wajib] Financial Literacy #2', type: 'event' },
  { date: new Date('2026-04-08'), label: 'DS Class Deadline (Minggu 7)', type: 'deadline' },

  // Week 8
  { date: new Date('2026-04-06'), label: '[Wajib] Team Meeting #1', type: 'event' },
  { date: new Date('2026-04-06'), label: 'Tech ILT 3: DS - Unsupervised Learning: Techniques & Practical Applications', type: 'ilt' },
  { date: new Date('2026-04-12'), label: 'Assignment SS 3 Deadline', type: 'deadline' },

  // Week 9
  { date: new Date('2026-04-13'), label: '[Wajib] Financial Literacy #3', type: 'event' },
  { date: new Date('2026-04-30'), label: 'DS Class Deadline (Minggu 9)', type: 'deadline' },

  // MA2 Cut-off
  { date: new Date('2026-04-14'), label: 'MA2 Cut-off', type: 'checkpoint' },

  // Week 10 — Tech ILT 4
  { date: new Date('2026-04-20'), label: 'Tech ILT 4: DS - Developing Projects for Data Analysis', type: 'ilt' },
  { date: new Date('2026-04-26'), label: 'Assignment SS 4 Deadline', type: 'deadline' },

  // MA3 — Kelas Tech
  { date: new Date('2026-04-30'), label: 'MA3: Lulus Belajar Fundamental Analisis Data (submission)', type: 'checkpoint' },

  // Week 11 — Capstone start
  { date: new Date('2026-04-27'), label: 'Capstone dimulai', type: 'event' },

  // Week 12
  { date: new Date('2026-05-10'), label: 'Assignment SS 5 Deadline', type: 'deadline' },
  { date: new Date('2026-05-04'), label: 'Tech ILT 5: DS - Data Processing Essentials', type: 'ilt' },
  { date: new Date('2026-05-18'), label: 'DS Class Deadline (Minggu 12)', type: 'deadline' },

  // Assignment Soft Skills Cut-off
  { date: new Date('2026-05-19'), label: 'Assignment Soft Skills Cut-off', type: 'checkpoint' },

  // Week 13
  // (courses: Belajar Fundamental Pemrosesan Data s.d Lulus)

  // Week 14
  { date: new Date('2026-05-24'), label: 'Assignment SS 6 Deadline', type: 'deadline' },
  { date: new Date('2026-05-18'), label: 'Tech ILT 6: DS - Applied Probability Through Data Exploration', type: 'ilt' },

  // MA4
  // Week 15
  { date: new Date('2026-05-25'), label: '[Wajib] Team Meeting #2', type: 'event' },
  { date: new Date('2026-06-08'), label: 'DS Class Deadline (Final)', type: 'deadline' },

  // Week 16
  { date: new Date('2026-06-01'), label: 'Tech ILT 7: DS - Statistics for Data Scientists', type: 'ilt' },
  { date: new Date('2026-06-07'), label: 'Assignment SS 7 Deadline', type: 'deadline' },

  // MA4 Cut-off
  { date: new Date('2026-06-30'), label: 'MA4 Cut-off', type: 'checkpoint' },

  // Week 18 — Penilaian Akhir
  { date: new Date('2026-06-15'), label: 'Penilaian Akhir oleh Assessor', type: 'event' },

  // Week 19-20 — Penilaian Juri
  { date: new Date('2026-06-22'), label: 'Penilaian Akhir oleh Juri', type: 'event' },

  // Week 22 — Pengolahan Nilai
  { date: new Date('2026-07-13'), label: 'Pengolahan Nilai Transkrip Akhir', type: 'event' },

  // Week 23 — Transkrip
  { date: new Date('2026-07-20'), label: 'Transkrip Akhir', type: 'event' },

  // Week 24 — Sertifikat
  { date: new Date('2026-07-27'), label: 'Sertifikat', type: 'event' },
];

const DS_TIMELINE: ProgramTimelineData = {
  learningPath: 'DS',
  startDate: new Date('2026-02-09'),
  endDate: new Date('2026-07-27'),
  totalWeeks: 24,
  milestones: dsMilestones.sort((a, b) => a.date.getTime() - b.date.getTime()),
};

// ─── FC Learning Path (CFC) — Full-Stack Developer ───────────────────────────

const fcMilestones: TimelineMilestone[] = [
  // Week 0 — Orientation
  { date: new Date('2026-02-09'), label: 'Orientasi & Technical Briefing', type: 'event' },

  // Week 0 Deadline
  { date: new Date('2026-02-16'), label: 'FS Class Deadline (Minggu 0)', type: 'deadline' },

  // Week 1
  { date: new Date('2026-02-26'), label: 'FS Class Deadline (Minggu 1)', type: 'deadline' },

  // Week 2 — Tech ILT 1
  { date: new Date('2026-02-23'), label: 'Tech ILT 1: FS - Front-End Basics: Building Your First Web Application', type: 'ilt' },
  { date: new Date('2026-03-01'), label: 'Assignment SS 1 Deadline', type: 'deadline' },

  // MA1 Cut-off
  { date: new Date('2026-03-03'), label: 'MA1 Cut-off', type: 'checkpoint' },

  // Week 3
  { date: new Date('2026-03-12'), label: 'FS Class Deadline (Minggu 3)', type: 'deadline' },

  // Week 4
  { date: new Date('2026-03-09'), label: '[Wajib] Financial Literacy #1', type: 'event' },
  { date: new Date('2026-03-09'), label: 'Tech ILT 2: FS - Interactive Web: Introduction to DOM Manipulation', type: 'ilt' },
  { date: new Date('2026-03-15'), label: 'Assignment SS 2 Deadline', type: 'deadline' },

  // Week 5 — Libur Lebaran
  { date: new Date('2026-03-16'), label: 'Libur Lebaran dan Hari Raya Nyepi', type: 'event' },

  // Week 6
  { date: new Date('2026-04-02'), label: 'FS Class Deadline (Minggu 6)', type: 'deadline' },

  // Week 7
  { date: new Date('2026-03-30'), label: '[Wajib] Financial Literacy #2', type: 'event' },

  // MA2 Cut-off
  { date: new Date('2026-04-14'), label: 'MA2 Cut-off', type: 'checkpoint' },

  // Week 8
  { date: new Date('2026-04-06'), label: '[Wajib] Team Meeting #1', type: 'event' },
  { date: new Date('2026-04-06'), label: 'Tech ILT 3: FS - React 101: Building Your First React Application', type: 'ilt' },
  { date: new Date('2026-04-09'), label: 'FS Class Deadline (Minggu 8)', type: 'deadline' },
  { date: new Date('2026-04-12'), label: 'Assignment SS 3 Deadline', type: 'deadline' },

  // Week 9
  { date: new Date('2026-04-13'), label: '[Wajib] Financial Literacy #3', type: 'event' },
  { date: new Date('2026-04-20'), label: 'FS Class Deadline (Minggu 9)', type: 'deadline' },

  // MA3 — Kelas Tech
  { date: new Date('2026-04-30'), label: 'MA3: Lulus Belajar Fundamental Aplikasi Web React (submission)', type: 'checkpoint' },

  // Week 10 — Tech ILT 4
  { date: new Date('2026-04-20'), label: 'Tech ILT 4: FS - Back-End Integration: Asynchronous JavaScript Requests & Fetch', type: 'ilt' },
  { date: new Date('2026-04-26'), label: 'Assignment SS 4 Deadline', type: 'deadline' },
  { date: new Date('2026-04-27'), label: 'FS Class Deadline (Minggu 10)', type: 'deadline' },

  // Week 11 — Capstone start
  { date: new Date('2026-04-27'), label: 'Capstone dimulai', type: 'event' },
  { date: new Date('2026-05-08'), label: 'FS Class Deadline (Minggu 11)', type: 'deadline' },

  // Week 12
  { date: new Date('2026-05-04'), label: 'Tech ILT 5: FS - Backend Essentials: Intro to Server-Side Programming with Node.js', type: 'ilt' },
  { date: new Date('2026-05-10'), label: 'Assignment SS 5 Deadline', type: 'deadline' },

  // Assignment Soft Skills Cut-off
  { date: new Date('2026-05-19'), label: 'Assignment Soft Skills Cut-off', type: 'checkpoint' },

  // Week 13
  { date: new Date('2026-06-25'), label: 'FS Class Deadline (Minggu 13-15)', type: 'deadline' },

  // Week 14
  { date: new Date('2026-05-18'), label: 'Tech ILT 6: FS - From REST to AI: Bringing Intelligence to Your Back-End', type: 'ilt' },
  { date: new Date('2026-05-24'), label: 'Assignment SS 6 Deadline', type: 'deadline' },

  // Week 15
  { date: new Date('2026-05-25'), label: '[Wajib] Team Meeting #2', type: 'event' },
  { date: new Date('2026-06-08'), label: 'FS Class Deadline (Final)', type: 'deadline' },

  // Week 16
  { date: new Date('2026-06-01'), label: 'Tech ILT 7: FS - Behind the Scenes: How Applications Identify and Control Users', type: 'ilt' },
  { date: new Date('2026-06-07'), label: 'Assignment SS 7 Deadline', type: 'deadline' },

  // MA4 Cut-off
  { date: new Date('2026-06-30'), label: 'MA4 Cut-off', type: 'checkpoint' },

  // Week 18 — Penilaian Akhir
  { date: new Date('2026-06-15'), label: 'Penilaian Akhir oleh Assessor', type: 'event' },

  // Week 19 — Penilaian Juri
  { date: new Date('2026-06-27'), label: 'Penilaian Akhir oleh Juri', type: 'event' },

  // Week 21 — Pengolahan Nilai
  { date: new Date('2026-07-06'), label: 'Pengolahan Nilai Transkrip Akhir', type: 'event' },

  // Week 23 — Transkrip
  { date: new Date('2026-07-20'), label: 'Transkrip Akhir', type: 'event' },

  // Week 24 — Sertifikat
  { date: new Date('2026-07-27'), label: 'Sertifikat', type: 'event' },
];

const FC_TIMELINE: ProgramTimelineData = {
  learningPath: 'FC',
  startDate: new Date('2026-02-09'),
  endDate: new Date('2026-07-27'),
  totalWeeks: 24,
  milestones: fcMilestones.sort((a, b) => a.date.getTime() - b.date.getTime()),
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export type LearningPath = 'AI' | 'DS' | 'FC' | 'unknown';

/**
 * Derive learning path from mentor group string
 * e.g. "CAC-19" → "AI", "CDC-05" → "DS", "CFC-12" → "FC"
 */
export const getLearningPath = (mentorGroup?: string): LearningPath => {
  if (!mentorGroup) return 'unknown';
  const prefix = mentorGroup.split('-')[0].toUpperCase();
  if (prefix === 'CAC') return 'AI';
  if (prefix === 'CDC') return 'DS';
  if (prefix === 'CFC') return 'FC';
  return 'unknown';
};

/**
 * Get the timeline data for a given learning path.
 * Falls back to AI if the path is unknown or not yet implemented.
 */
export const getTimelineForPath = (path: LearningPath): ProgramTimelineData => {
  switch (path) {
    case 'AI':
      return AI_TIMELINE;
    case 'DS':
      return DS_TIMELINE;
    case 'FC':
      return FC_TIMELINE;
    default:
      return AI_TIMELINE; // fallback
  }
};
