# Testing Guide

## Pre-Testing Checklist

Before running the application, ensure:

- [x] Docker installed (version 20.10+)
- [x] Docker Compose installed (version 2.0+)
- [x] `.env` file created with Dicoding credentials
- [x] Port 8080, 3000, and 4444 are available

## Quick Test Commands

```bash
# 1. Build and start all containers (development mode)
docker-compose -f docker-compose.dev.yml up --build

# Wait for all services to start (watch the logs)
# You should see:
# - frontend: Server running at http://0.0.0.0:8080
# - backend: Application startup complete
# - selenium: Started Selenium Standalone

# 2. In a new terminal, verify services are running
docker-compose -f docker-compose.dev.yml ps

# Expected output:
# NAME                                  STATUS
# student-dashboard-backend-dev         Up
# student-dashboard-frontend-dev        Up
# student-dashboard-selenium-dev        Up
```

## Test Scenarios

### 1. Backend Health Check

```bash
# Test backend is responding
curl http://localhost:3000/health

# Expected: {"status":"ok"}
```

### 2. API Documentation

Open in browser: http://localhost:3000/docs

Expected: FastAPI Swagger UI showing all endpoints

### 3. Frontend Access

Open in browser: http://localhost:8080

Expected: Dashboard loads with UI (may show "No data" until scraping)

### 4. Trigger Scraping

**Method A: Via API**
```bash
# Start scraping (runs in background)
curl -X POST http://localhost:3000/api/scrape

# Check status
curl http://localhost:3000/api/scrape/status

# Expected: {"running":true,"last_run":null,"last_error":null,"last_result":null}
```

**Method B: Via API Docs UI**
1. Go to http://localhost:3000/docs
2. Click on `POST /api/scrape`
3. Click "Try it out"
4. Click "Execute"

### 5. Monitor Scraping Progress

```bash
# Watch backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# You should see:
# - Selenium connection established
# - Login attempt
# - Page navigation
# - Data extraction
# - JSON file saved
```

### 6. View Scraped Data

After scraping completes (takes 2-5 minutes):

```bash
# List scraped files
curl http://localhost:3000/api/files

# Get student data
curl http://localhost:3000/api/students | jq
```

### 7. Frontend Data Display

Refresh http://localhost:8080

Expected: Dashboard shows student data with:
- KPI cards with metrics
- Student grid with progress
- Course progress table

### 8. Selenium Debug (Optional)

Open VNC viewer: http://localhost:7900

Password: `secret`

You can watch the browser automation in real-time!

## Common Issues & Solutions

### Issue: Backend fails to start

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
# Rebuild backend container
docker-compose -f docker-compose.dev.yml build backend
docker-compose -f docker-compose.dev.yml up backend
```

### Issue: Frontend shows CORS error

**Error:** `Access to XMLHttpRequest blocked by CORS`

**Solution:** Check that backend is running on port 3000 and CORS middleware is configured

### Issue: Scraper fails to login

**Error:** `EMAIL/PASSWORD empty` or `Login form components not found`

**Solution:**
1. Verify `.env` file has correct credentials
2. Check `docker-compose.dev.yml` passes env vars to backend
3. Restart backend: `docker-compose -f docker-compose.dev.yml restart backend`

### Issue: Port already in use

**Error:** `bind: address already in use`

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :8080  # or :3000 or :4444

# Stop the service or change port in docker-compose
```

### Issue: Selenium container crashes

**Error:** `selenium exited with code 1`

**Solution:**
```bash
# Increase shared memory
# Already set to 2gb in docker-compose.yml
# If still failing, check Docker resource limits
docker stats
```

## Performance Testing

### Build Time Test

```bash
# Time the build
time docker-compose -f docker-compose.dev.yml build

# Expected:
# - Frontend: 1-3 minutes (npm install)
# - Backend: 30-60 seconds (uv sync)
```

### Scraping Time Test

```bash
# Trigger scrape and measure
time curl -X POST http://localhost:3000/api/scrape

# Expected: Returns immediately (background task)
# Actual scraping: 2-5 minutes depending on student count
```

### Frontend Load Test

```bash
# Install Apache Bench if not available
# ab -n 100 -c 10 http://localhost:8080/

# Or use hey:
# hey -n 100 -c 10 http://localhost:8080/
```

## Production Testing

```bash
# Build production images
docker-compose build

# Start production mode
docker-compose up -d

# Check all services
docker-compose ps

# Test frontend (should serve static files via Nginx)
curl -I http://localhost:8080/

# Expected: nginx server header
```

## Cleanup After Testing

```bash
# Stop all containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (delete all scraped data)
docker-compose -f docker-compose.dev.yml down -v

# Remove all images (clean slate)
docker-compose -f docker-compose.dev.yml down --rmi all

# Remove dangling images
docker image prune -f
```

## Test Data Validation

After successful scrape, verify data structure:

```bash
# Get latest file
LATEST=$(ls -t backend/output/*.json | head -1)

# Validate JSON structure
jq '.metadata.student_total' $LATEST
jq '.students[0].profile.name' $LATEST
jq '.students[0].progress.course_progress.items[0].course' $LATEST

# Check mentor info
jq '.mentor' $LATEST
```

## Continuous Testing

For development workflow with hot-reload:

```bash
# Terminal 1: Run containers
docker-compose -f docker-compose.dev.yml up

# Terminal 2: Watch frontend logs
docker-compose -f docker-compose.dev.yml logs -f frontend

# Terminal 3: Watch backend logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Make code changes
# - Frontend changes: Auto-reload in browser
# - Backend changes: Uvicorn auto-restarts
```

## Success Criteria

✅ All containers start without errors
✅ Backend health check returns 200 OK
✅ Frontend loads in browser
✅ API documentation accessible
✅ Scraping completes successfully
✅ JSON file created in backend/output/
✅ Frontend displays scraped data
✅ No CORS errors in browser console
✅ All API endpoints respond correctly

## Next Steps After Testing

1. Review scraped data accuracy
2. Customize frontend UI if needed
3. Set up scheduled scraping (cron job)
4. Configure production deployment
5. Set up monitoring and logging
6. Add authentication if needed
