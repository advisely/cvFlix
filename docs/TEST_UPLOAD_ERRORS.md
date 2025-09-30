# Upload Error Handling Test Plan

## Test the Error Handling System

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to Experiences Page
Go to: http://localhost:3000/boss/experiences

### 3. Test Scenarios

#### A. File Size Error (Original Issue)
1. Click "Add Experience"
2. Try uploading a file larger than 10MB for images or 50MB for videos
3. **Expected**: 
   - Error alert appears immediately
   - Clear message: "File too large. Maximum size for [images: 10MB/videos: 50MB]. (X.XXMb)"
   - No retry button (size errors not recoverable)
   - Save functionality remains working

#### B. Invalid File Format
1. Try uploading a .txt or .pdf file
2. **Expected**:
   - Immediate validation error
   - Message: "Invalid file format. Only images and videos are supported."
   - No retry button

#### C. Network Error Simulation
1. Start uploading a valid file
2. Disconnect internet during upload
3. **Expected**:
   - Error alert with network message
   - Retry button available
   - Can retry up to 3 times

#### D. Success Flow
1. Upload a valid image/video file < 10MB/50MB
2. **Expected**:
   - Progress bar during upload
   - Success message: "File uploaded successfully!"
   - Media appears in preview grid
   - Save button works properly

#### E. Max Files Test
1. Upload 5 files (maxCount for homepage media)
2. Try uploading a 6th file
3. **Expected**:
   - Error: "Maximum number of files (5) reached. Please remove some files first."

### 4. Language Test
1. Switch to French using language switcher
2. Repeat error tests
3. **Expected**: All error messages appear in French

### 5. Other Pages to Test
- Skills: http://localhost:3000/boss/skills
- Education: http://localhost:3000/boss/education  
- Highlights: http://localhost:3000/boss/highlights
- Certifications: http://localhost:3000/boss/certifications

Note: Skills, Education, Highlights, and Certifications still use old upload system and will not have enhanced error handling yet.
