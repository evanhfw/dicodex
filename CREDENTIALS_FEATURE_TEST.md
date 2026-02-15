# Credentials Feature Testing Guide

## Changes Summary

### Backend Changes
1. ✅ `ScraperService` now accepts optional `email` and `password` parameters
2. ✅ `POST /api/scrape` endpoint accepts credentials in request body
3. ✅ Pydantic model `ScrapeRequest` for request validation

### Frontend Changes
1. ✅ New `CredentialsForm` component for credential input
2. ✅ Updated `UploadPage` with new "Auto Scrape" tab (default)
3. ✅ Automatic polling for scraper status
4. ✅ Real-time notifications for scraping progress

## Testing Checklist

### Backend API Testing

**1. Test API Documentation**
```bash
# Start containers
docker-compose -f docker-compose.dev.yml up

# Open API docs
# http://localhost:3000/docs
```

Expected: Should see updated `/api/scrape` endpoint with `email` and `password` fields in request body

**2. Test Valid Credentials via API**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@student.devacademy.id",
    "password": "your-password"
  }'
```

Expected Response:
```json
{
  "status": "started",
  "message": "Scraping started in background. Check /api/scrape/status for progress."
}
```

**3. Test Invalid Email Format**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'
```

Expected: HTTP 422 with validation error

**4. Test Missing Credentials**
```bash
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected: HTTP 422 with validation error for missing fields

**5. Test Scraper Status**
```bash
# Check status while scraping
curl http://localhost:3000/api/scrape/status
```

Expected Response:
```json
{
  "running": true,
  "last_run": null,
  "last_error": null,
  "last_result": null
}
```

After completion:
```json
{
  "running": false,
  "last_run": "2026-02-15T12:00:00.000000+00:00",
  "last_error": null,
  "last_result": {
    "success": true,
    "file": "CAC-19_20260215T120000Z.json",
    "students": 25
  }
}
```

### Frontend Testing

**1. Test Credentials Form UI**
- Navigate to http://localhost:8080/
- Should see "Auto Scrape" tab as default
- Form should have Email and Password fields
- Submit button should be disabled until both fields are filled

**2. Test Email Validation**
- Enter invalid email (e.g., "test")
- Try to submit
- Expected: HTML5 validation error or form validation message

**3. Test Successful Scraping Flow**
1. Enter valid Dicoding email and password
2. Click "Start Scraping"
3. Expected behaviors:
   - Submit button shows "Scraping in progress..." with loading spinner
   - Toast notification: "Scraping started!"
   - Password field is cleared
   - Polling starts automatically
   - After 2-5 minutes: "Scraping complete!" notification
   - Page auto-refreshes to show new data

**4. Test Multiple Users**
- User A scrapes with their credentials
- User B scrapes with their credentials
- Expected: Each user's data is saved separately (timestamped files)

**5. Test Already Running Error**
1. Start a scrape
2. Try to start another scrape before first completes
3. Expected: Error toast "Scraper is already running"

**6. Test Invalid Credentials**
1. Enter incorrect email/password
2. Submit
3. Expected: After attempting login, scraping fails with error notification

**7. Test Tab Switching**
- Switch between "Auto Scrape", "Upload File", and "Paste HTML" tabs
- Expected: All tabs work independently, state is preserved

**8. Test Instructions**
- Verify instructions section shows both auto-scrape and manual upload options
- Instructions should be clear and accurate

### Integration Testing

**1. End-to-End Flow**
1. Fresh start (no data)
2. Navigate to upload page
3. Enter valid credentials
4. Click "Start Scraping"
5. Wait for completion
6. Verify data appears in dashboard
7. Check that JSON file is created in `backend/output/`

**2. Test Data Persistence**
1. Scrape data with credentials
2. Stop containers: `docker-compose down`
3. Start containers: `docker-compose up`
4. Expected: Scraped data still available (Docker volume persists)

**3. Test API Error Handling**
1. Stop backend container
2. Try to submit credentials in frontend
3. Expected: Error toast with network error message

### Security Testing

**1. Verify Credentials Not Stored**
- Check browser localStorage: Should NOT contain credentials
- Check browser cookies: Should NOT contain credentials
- Check frontend state after submission: Password should be cleared

**2. Verify API Request**
- Use browser DevTools Network tab
- Submit credentials
- Check request payload: Should contain email and password
- Note: In production, use HTTPS to encrypt transmission

**3. Test Rate Limiting (if implemented)**
- Make multiple rapid requests
- Expected: Should be throttled or rate limited

### Performance Testing

**1. Concurrent Scraping Prevention**
- Verify only one scrape can run at a time
- Multiple requests should be rejected with 409 status

**2. Scraping Time**
- Typical scraping time: 2-5 minutes
- Factors: Number of students, network speed, Selenium performance

**3. Polling Performance**
- Polling interval: 5 seconds
- Max attempts: 60 (5 minutes)
- Should not cause excessive load

## Test Results Template

```
Date: _______________
Tester: _______________

Backend Tests:
[ ] API documentation shows updated endpoint
[ ] Valid credentials trigger scraping
[ ] Invalid email format rejected
[ ] Missing credentials rejected
[ ] Scraper status endpoint works
[ ] Concurrent requests rejected

Frontend Tests:
[ ] Credentials form displays correctly
[ ] Email validation works
[ ] Successful scraping flow complete
[ ] Password cleared after submission
[ ] Polling works correctly
[ ] Error handling works
[ ] Tab switching works
[ ] Instructions are clear

Integration Tests:
[ ] End-to-end flow successful
[ ] Data persists across container restarts
[ ] Multiple users can use different credentials

Security Tests:
[ ] Credentials not stored in frontend
[ ] Password cleared from state
[ ] Request payload contains credentials

Performance Tests:
[ ] Concurrent scraping prevented
[ ] Scraping completes in reasonable time
[ ] Polling doesn't cause excessive load

Notes:
_________________________________
_________________________________
_________________________________
```

## Known Limitations

1. **No credential storage**: Users must re-enter credentials for each scrape
2. **Session-less**: No authentication/authorization system
3. **Single concurrent scrape**: Only one scrape can run at a time
4. **No retry logic**: Failed scrapes must be manually restarted
5. **No progress indication**: Just binary running/completed status

## Future Improvements

1. Add progress percentage for scraping
2. Implement user sessions with credential storage (encrypted)
3. Add background job queue for multiple concurrent scrapes
4. Add retry logic with exponential backoff
5. Implement WebSocket for real-time progress updates
6. Add scraping history view
7. Add credential validation before starting scrape
8. Implement rate limiting and CAPTCHA
