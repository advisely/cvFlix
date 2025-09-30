## EMERGENCY FIX VALIDATION

### Problem Fixed ✅
- **Root Cause**: highlights page was calling /api/upload (expects experienceId) instead of /api/upload/highlights (expects highlightId)
- **Missing Parameter**: MediaType parameter was not being sent
- **Line 172**: Now correctly calls /api/upload/highlights
- **Line 170**: Now correctly sends mediaType parameter

### Changes Applied
1. **Endpoint Fix**: /api/upload → /api/upload/highlights
2. **Parameter Addition**: Added formData.append("mediaType", type);
3. **Preserved Functionality**: experiences still uses /api/upload correctly

### Validation Steps
- [x] Backup created at page.tsx.backup
- [x] Correct endpoint /api/upload/highlights used
- [x] Required mediaType parameter added  
- [x] highlightId parameter maintained
- [x] experiences upload remains unchanged

### Expected Result
✅ Media upload in highlights should now work without 400 Bad Request errors
✅ Both highlights and experiences upload functionality preserved
