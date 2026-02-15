"""
API Routes for Student Dashboard
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from app.services.scraper import ScraperService
from app.utils.file_handler import FileHandler
from app.utils.parser import DataTransformer


class ScrapeRequest(BaseModel):
    """Request model for scraping with credentials"""
    email: EmailStr
    password: str


router = APIRouter()
scraper_service = ScraperService()
file_handler = FileHandler()
transformer = DataTransformer()

@router.get("/students")
async def get_students() -> Dict[str, Any]:
    """
    Get the latest student data
    
    Returns transformed student data from the most recent scrape
    """
    try:
        # Get latest JSON file
        latest_data = await file_handler.get_latest_data()
        
        if not latest_data:
            raise HTTPException(
                status_code=404,
                detail="No student data found. Please run scraper first."
            )
        
        # Transform to frontend format
        transformed = transformer.transform_dicodex_to_dashboard(latest_data)
        
        return transformed
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading data: {str(e)}")


@router.post("/scrape")
async def trigger_scrape(
    credentials: ScrapeRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, str]:
    """
    Trigger a new scraping job with user-provided credentials
    
    Args:
        credentials: User's Dicoding email and password
    
    Returns:
        Status message indicating scraping has started
    
    Runs the scraper in the background and returns immediately
    """
    if scraper_service.is_running():
        raise HTTPException(
            status_code=409,
            detail="Scraper is already running. Please wait for it to complete."
        )
    
    # Run scraper in background with provided credentials
    background_tasks.add_task(
        scraper_service.run_scraper,
        email=credentials.email,
        password=credentials.password
    )
    
    return {
        "status": "started",
        "message": "Scraping started in background. Check /api/scrape/status for progress."
    }


@router.get("/scrape/status")
async def get_scrape_status() -> Dict[str, Any]:
    """
    Get the current status of the scraper
    
    Returns information about whether scraper is running and last run time
    """
    status = scraper_service.get_status()
    return status


@router.get("/files")
async def list_files() -> Dict[str, Any]:
    """
    List all available scraped data files
    
    Returns a list of JSON files with metadata (size, timestamps)
    """
    try:
        files = await file_handler.list_all_files()
        return {"files": files, "total": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing files: {str(e)}")


@router.get("/files/{filename}")
async def get_file_by_name(filename: str) -> Dict[str, Any]:
    """
    Get data from a specific file
    
    Args:
        filename: Name of the JSON file (e.g., "CAC-19_20260215T074815Z.json")
    """
    try:
        data = await file_handler.get_file_by_name(filename)
        
        if not data:
            raise HTTPException(status_code=404, detail=f"File not found: {filename}")
        
        # Transform to frontend format
        transformed = transformer.transform_dicodex_to_dashboard(data)
        
        return transformed
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
