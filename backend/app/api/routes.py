"""
API Routes for Student Dashboard
All endpoints are protected by API Key authentication (when API_KEY is configured).
Job management is backed by ARQ + Redis.
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
from arq.jobs import Job, JobStatus

from app.api.auth import require_api_key
from app.utils.file_handler import FileHandler
from app.utils.parser import DataTransformer


class ScrapeRequest(BaseModel):
    """Request model for scraping with credentials"""
    email: EmailStr
    password: str


router = APIRouter(dependencies=[Depends(require_api_key)])
file_handler = FileHandler()
transformer = DataTransformer()


@router.get("/students")
async def get_students() -> Dict[str, Any]:
    """
    Get the latest student data

    Returns transformed student data from the most recent scrape
    """
    try:
        latest_data = await file_handler.get_latest_data()

        if not latest_data:
            raise HTTPException(
                status_code=404,
                detail="No student data found. Please run scraper first."
            )

        transformed = transformer.transform_dicodex_to_dashboard(latest_data)
        return transformed
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading data: {str(e)}")


@router.post("/scrape")
async def trigger_scrape(
    credentials: ScrapeRequest,
    request: Request,
) -> Dict[str, Any]:
    """
    Trigger a new scraping job with user-provided credentials.

    The job is enqueued in Redis via ARQ. Returns a job_id for polling.
    ARQ worker handles concurrency (max 5) and queueing automatically.
    """
    arq_pool = request.app.state.arq_pool

    job = await arq_pool.enqueue_job(
        "scrape_task",
        credentials.email,
        credentials.password,
    )

    if job is None:
        raise HTTPException(
            status_code=409,
            detail="A job with the same parameters is already queued or running.",
        )

    return {
        "status": "queued",
        "job_id": job.job_id,
        "message": f"Scraping job queued. Check /api/scrape/status/{job.job_id} for progress.",
    }


@router.get("/scrape/status")
async def get_scrape_status(request: Request) -> Dict[str, Any]:
    """
    Get aggregated scraper status (backward compatible).

    Returns basic info about the ARQ worker queue.
    """
    arq_pool = request.app.state.arq_pool

    # Get queue info from Redis
    queued_jobs = await arq_pool.queued_jobs()

    return {
        "queued_count": len(queued_jobs) if queued_jobs else 0,
        "jobs": [
            {"job_id": j.job_id, "function": j.function, "enqueue_time": str(j.enqueue_time)}
            for j in (queued_jobs or [])[:20]
        ],
    }


@router.get("/scrape/status/{job_id}")
async def get_job_status(job_id: str, request: Request) -> Dict[str, Any]:
    """
    Get the status of a specific scraping job.

    Possible statuses: queued, in_progress, complete, not_found, deferred
    """
    arq_pool = request.app.state.arq_pool
    job = Job(job_id=job_id, redis=arq_pool)
    status = await job.status()

    response: Dict[str, Any] = {
        "job_id": job_id,
        "status": status.value,
    }

    # Map ARQ status to our "running" boolean for frontend compatibility
    if status == JobStatus.queued:
        response["running"] = True
        response["message"] = "Job is queued, waiting for available worker slot."
    elif status == JobStatus.in_progress:
        response["running"] = True
        response["message"] = "Scraping in progress..."
    elif status == JobStatus.complete:
        response["running"] = False
        info = await job.info()
        if info and info.result is not None:
            response["result"] = info.result
        elif info and info.result is None:
            response["result"] = {"success": False, "error": "Job completed with no result"}
    elif status == JobStatus.not_found:
        response["running"] = False
        response["result"] = None
        response["message"] = "Job not found or expired."
    else:
        response["running"] = False

    return response


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

        transformed = transformer.transform_dicodex_to_dashboard(data)
        return transformed
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"File not found: {filename}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading file: {str(e)}")
