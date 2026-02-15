"""
Data Transformer
Converts diCodex JSON format to Dashboard frontend format
"""
from typing import Dict, Any, List


class DataTransformer:
    """Transform diCodex scraper data to frontend format"""
    
    @staticmethod
    def map_status(status_badge: str) -> str:
        """Map diCodex status badge to frontend status"""
        status_map = {
            "Need Special Attention": "Special Attention",
            "Special Attention": "Special Attention",
            "Lagging Behind": "Lagging",
            "Lagging": "Lagging",
            "On Ideal Schedule": "Ideal",
            "Ideal": "Ideal",
            "Ahead of Schedule": "Ahead",
            "Ahead": "Ahead",
            "On Track": "Ideal",
        }
        return status_map.get(status_badge, None)
    
    @staticmethod
    def map_course_status(status: str) -> str:
        """Map course status to frontend format"""
        status_map = {
            "Completed": "Completed",
            "In Progress": "In Progress",
            "Not Started": "Not Started",
        }
        return status_map.get(status, "Not Started")
    
    def transform_dicodex_to_dashboard(self, dicodex_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transform diCodex JSON format to Dashboard format
        
        Args:
            dicodex_data: Raw data from diCodex scraper
            
        Returns:
            Transformed data in Dashboard format
        """
        students = []
        
        for student_data in dicodex_data.get("students", []):
            profile = student_data.get("profile", {})
            progress = student_data.get("progress", {})
            course_progress = progress.get("course_progress", {})
            
            # Transform courses
            courses = []
            for course in course_progress.get("items", []):
                courses.append({
                    "name": course.get("course", ""),
                    "progress": course.get("progress_percent", "0%"),
                    "status": self.map_course_status(course.get("status", "Not Started"))
                })
            
            # Build student object
            student = {
                "name": profile.get("name", ""),
                "status": self.map_status(profile.get("status_badge", "")),
                "courses": courses,
                # Optional: include additional data if needed
                "profile": {
                    "university": profile.get("university", ""),
                    "major": profile.get("major", ""),
                    "photo_url": profile.get("photo_url", ""),
                    "profile_link": profile.get("profile_link", ""),
                }
            }
            
            students.append(student)
        
        # Build response
        return {
            "students": students,
            "metadata": {
                "parsedAt": dicodex_data.get("metadata", {}).get("generated_at_utc", ""),
                "totalStudents": len(students),
                "sourceUrl": dicodex_data.get("metadata", {}).get("source_url", ""),
                "mentor": dicodex_data.get("mentor", {}),
            }
        }
    
    def get_status_counts(self, students: List[Dict[str, Any]]) -> Dict[str, int]:
        """Get count of students by status"""
        counts = {
            "Special Attention": 0,
            "Lagging": 0,
            "Ideal": 0,
            "Ahead": 0,
        }
        
        for student in students:
            status = student.get("status")
            if status in counts:
                counts[status] += 1
        
        return counts
    
    def get_course_stats(self, students: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get statistics for each course"""
        course_map = {}
        
        for student in students:
            for course in student.get("courses", []):
                name = course.get("name")
                if name not in course_map:
                    course_map[name] = {
                        "name": name,
                        "totalEnrolled": 0,
                        "completed": 0,
                        "inProgress": 0,
                        "notStarted": 0,
                        "totalProgress": 0,
                    }
                
                stats = course_map[name]
                stats["totalEnrolled"] += 1
                
                progress_str = course.get("progress", "0%").replace("%", "")
                try:
                    progress = int(progress_str)
                except ValueError:
                    progress = 0
                
                stats["totalProgress"] += progress
                
                status = course.get("status")
                if status == "Completed":
                    stats["completed"] += 1
                elif status == "In Progress":
                    stats["inProgress"] += 1
                else:
                    stats["notStarted"] += 1
        
        # Calculate averages
        result = []
        for stats in course_map.values():
            if stats["totalEnrolled"] > 0:
                stats["averageProgress"] = round(stats["totalProgress"] / stats["totalEnrolled"])
                stats["completionRate"] = round((stats["completed"] / stats["totalEnrolled"]) * 100)
            else:
                stats["averageProgress"] = 0
                stats["completionRate"] = 0
            
            result.append(stats)
        
        return result
