import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ParsedStudent, StudentData } from '@/data/parsedData';

const STORAGE_KEY = 'student_data';

interface StudentDataContextType {
  studentData: StudentData | null;
  setStudentData: (students: ParsedStudent[]) => void;
  clearStudentData: () => void;
  hasData: () => boolean;
  isLoading: boolean;
}

const StudentDataContext = createContext<StudentDataContextType | undefined>(undefined);

export const StudentDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [studentData, setStudentDataState] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData) as StudentData;
        setStudentDataState(parsed);
      }
    } catch (error) {
      console.error('Failed to load student data from localStorage:', error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setStudentData = (students: ParsedStudent[]) => {
    // #region agent log
    console.log('[DEBUG H3] setStudentData called:', {
      count: students.length,
      firstStatus: students[0]?.status,
      firstCourses: students[0]?.courses?.length
    });
    fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StudentDataContext.tsx:45',message:'setStudentData called',data:{studentsCount:students.length,firstStudentStatus:students[0]?.status,firstStudentCoursesCount:students[0]?.courses?.length},timestamp:Date.now(),runId:'parse',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    const data: StudentData = {
      students,
      parsedAt: new Date().toISOString(),
      totalStudents: students.length,
    };

    setStudentDataState(data);

    // Save to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // #region agent log
      console.log('[DEBUG H3] localStorage saved, size:', JSON.stringify(data).length);
      fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StudentDataContext.tsx:62',message:'localStorage save success',data:{storageKey:STORAGE_KEY,dataSize:JSON.stringify(data).length},timestamp:Date.now(),runId:'parse',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/12c4cefe-f243-4b77-8bbc-000e13cdd64b',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StudentDataContext.tsx:68',message:'localStorage save failed',data:{error:String(error)},timestamp:Date.now(),runId:'parse',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      console.error('Failed to save student data to localStorage:', error);
    }
  };

  const clearStudentData = () => {
    setStudentDataState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear student data from localStorage:', error);
    }
  };

  const hasData = (): boolean => {
    return studentData !== null && studentData.students.length > 0;
  };

  return (
    <StudentDataContext.Provider
      value={{
        studentData,
        setStudentData,
        clearStudentData,
        hasData,
        isLoading,
      }}
    >
      {children}
    </StudentDataContext.Provider>
  );
};

export const useStudentData = (): StudentDataContextType => {
  const context = useContext(StudentDataContext);
  if (context === undefined) {
    throw new Error('useStudentData must be used within a StudentDataProvider');
  }
  return context;
};
