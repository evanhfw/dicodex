"""
File Handler Utility
Manages scraped JSON data files
"""
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import os


class FileHandler:
    """Handle file operations for scraped data"""
    
    def __init__(self, output_dir: str = "/app/output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    async def get_latest_data(self) -> Optional[Dict[str, Any]]:
        """
        Get data from the most recent JSON file
        
        Returns:
            JSON data from latest file or None if no files exist
        """
        files = list(self.output_dir.glob("*.json"))
        
        if not files:
            return None
        
        # Sort by modification time, newest first
        files.sort(key=lambda f: f.stat().st_mtime, reverse=True)
        latest_file = files[0]
        
        return self._read_json_file(latest_file)
    
    async def get_file_by_name(self, filename: str) -> Optional[Dict[str, Any]]:
        """
        Get data from a specific file
        
        Args:
            filename: Name of the JSON file
            
        Returns:
            JSON data or None if file doesn't exist
        """
        file_path = self.output_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {filename}")
        
        return self._read_json_file(file_path)
    
    async def list_all_files(self) -> List[Dict[str, Any]]:
        """
        List all JSON files with metadata
        
        Returns:
            List of file info dicts with name, size, created, modified
        """
        files = list(self.output_dir.glob("*.json"))
        
        file_list = []
        for file_path in files:
            stat = file_path.stat()
            file_list.append({
                "name": file_path.name,
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
            })
        
        # Sort by modification time, newest first
        file_list.sort(key=lambda f: f["modified"], reverse=True)
        
        return file_list
    
    def _read_json_file(self, file_path: Path) -> Dict[str, Any]:
        """
        Read and parse JSON file
        
        Args:
            file_path: Path to JSON file
            
        Returns:
            Parsed JSON data
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in file {file_path.name}: {e}")
        except Exception as e:
            raise IOError(f"Error reading file {file_path.name}: {e}")
    
    async def delete_file(self, filename: str) -> bool:
        """
        Delete a specific file
        
        Args:
            filename: Name of the file to delete
            
        Returns:
            True if deleted, False if file doesn't exist
        """
        file_path = self.output_dir / filename
        
        if not file_path.exists():
            return False
        
        file_path.unlink()
        return True
    
    async def get_file_count(self) -> int:
        """Get total number of JSON files"""
        return len(list(self.output_dir.glob("*.json")))
