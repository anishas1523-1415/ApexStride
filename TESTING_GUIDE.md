# 🧪 LOCAL TESTING GUIDE - Complete Setup & Verification

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd web
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔍 Manual Testing Flows

### Test Flow 1: Authentication

**Step 1: Signup**
1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Fill form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test@123456`
4. Click "Create Account"

**Expected Results:**
- ✅ Form validates (password 8+ chars)
- ✅ Redirects to dashboard on success
- ✅ User data stored in Supabase
- ✅ JWT token in localStorage

**Step 2: Login**
1. Logout via profile page
2. Click "Sign In"
3. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test@123456`
4. Click "Sign In"

**Expected Results:**
- ✅ Redirects to dashboard
- ✅ Navbar shows username
- ✅ Token persists on reload
- ✅ Can access protected routes

**Step 3: Route Protection**
1. Logout
2. Try accessing http://localhost:3000/dashboard

**Expected Results:**
- ✅ Redirects to login page
- ✅ Cannot access analysis pages

---

### Test Flow 2: Homepage & Sport Cards

**Step 1: Card Display**
1. After login, view homepage
2. Verify all 5 cards display:
   - ✅ Cricket (🏏)
   - ✅ Football (⚽)
   - ✅ Weightlifting (🏋️)
   - ✅ Badminton (🏸)
   - ✅ Athletic Running (🏃)

**Step 2: Card Animations**
1. Hover over cricket card

**Expected Results:**
- ✅ Card lifts upward (scale 1.05, y: -10px)
- ✅ Glow effect pulses
- ✅ Smooth transition

**Step 3: Sport Entry Animation**
1. Click on Cricket card

**Expected Results:**
- ✅ Icon animates (bat swing rotation)
- ✅ Page redirects to upload page
- ✅ Sport pre-selected in form

---

### Test Flow 3: Video Upload Form

**Step 1: Sport Selection**
1. Navigate to upload page
2. Click different sports

**Expected Results:**
- ✅ Role options update dynamically
- ✅ Cricket shows: Batsman, Bowler
- ✅ Football shows: Striker, Goalkeeper, Defender
- ✅ Badminton shows: Singles, Doubles
- ✅ Previous selections reset

**Step 2: Cascading Dropdowns**
1. Select Cricket → Batsman

**Expected Results:**
- ✅ Shot options appear: Cover Drive, Sweep Shot, etc.

1. Switch to Bowler

**Expected Results:**
- ✅ Shot options change: Fast Bowling, Spin Bowling, etc.

**Step 3: File Upload**
1. Click video upload area
2. Select a video file (or create test video)

**Expected Results:**
- ✅ Filename displays in drop zone
- ✅ File size validated (<500MB)
- ✅ Error shows if too large

**Step 4: Form Validation**
1. Try submitting without video

**Expected Results:**
- ✅ Error: "Please select a video file"

1. Try submitting without role/shot

**Expected Results:**
- ✅ Error messages for missing selections

---

### Test Flow 4: UI/UX & Design

**Step 1: Dark Stadium Theme**
```
Verify Colors:
- Background: Pure black (#000000)
- Cards: Dark blue (#0F172A)
- Neon Green: #00FF00 (buttons, text)
- Neon Cyan: #00FFFF (accents)
```

1. Open browser DevTools → Inspect element
2. Check background-color on body

**Expected:**
- ✅ `rgb(0, 0, 0)` or `#000000`

**Step 2: Glow Effects**
1. Hover over any neon-green button

**Expected Results:**
- ✅ Box shadow with green glow
- ✅ Shadow effect: `0 0 20px rgba(0, 255, 0, 0.4)`

**Step 3: Glassmorphism**
1. Inspect card element
2. Check computed styles

**Expected:**
- ✅ `backdrop-filter: blur(10px)`
- ✅ `background: rgba(255, 255, 255, 0.05)`
- ✅ Border with transparency

**Step 4: Animations**
1. Check Network tab (no delays)
2. Use Chrome DevTools → Performance tab

**Expected:**
- ✅ Frame rate: 60 FPS
- ✅ Animations smooth (<100ms frame time)
- ✅ No jank or stuttering

---

### Test Flow 5: Responsive Design

**Mobile View (375px)**
1. Open DevTools → Toggle device toolbar
2. Select "iPhone SE"
3. Verify layout:
   - ✅ Navbar hamburger menu visible
   - ✅ Cards stack vertically
   - ✅ Text readable
   - ✅ Buttons full width

**Tablet View (768px)**
1. Select "iPad"
2. Verify layout:
   - ✅ 2-column grid for sport cards
   - ✅ Sidebar nav visible
   - ✅ Form inputs sized appropriately

**Desktop View (1920px)**
1. Maximize window
2. Verify layout:
   - ✅ 5-column sport card grid
   - ✅ Max-width container (1280px)
   - ✅ Full navigation visible

---

## 🔧 Debugging Tips

### Check Token Storage
```javascript
// Browser console
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

### Monitor API Calls
1. Open DevTools → Network tab
2. Perform actions (signup, login, upload)
3. Look for:
   - ✅ POST `/api/v1/auth/signup` (200)
   - ✅ POST `/api/v1/auth/login` (200)
   - ✅ GET `/api/v1/auth/me` (200)

### Check Console Errors
```bash
# Should see no errors:
# ❌ DO NOT SEE: TypeError, ReferenceError, 404s
# ✅ OK TO SEE: Warnings about missing env vars (handled)
```

### Performance Check
```javascript
// Browser console
performance.now() // Should be <3 seconds for page load
```

---

## 🧬 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | Latest | ✅ Full support |
| Firefox | Latest | ✅ Full support |
| Safari | Latest | ✅ Full support |
| Edge | Latest | ✅ Full support |
| Mobile Safari | iOS 14+ | ✅ Full support |
| Chrome Mobile | Latest | ✅ Full support |

---

## 🚨 Common Issues & Solutions

### Issue: CORS Error
```
Error: Access to XMLHttpRequest blocked by CORS policy
```

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` in `.env.local`
2. Verify backend is running on correct port
3. Restart Next.js dev server

### Issue: 404 on API Calls
```
Error: GET http://localhost:8000/api/v1/auth/me 404
```

**Solution:**
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Verify port is 8000
3. Check backend is not crashing

### Issue: Token Not Persisting
```
Error: localStorage is not available in SSR
```

**Solution:**
1. Component properly uses 'use client' directive
2. Token operations in useEffect (client-side only)
3. Check browser privacy settings (incognito may block localStorage)

### Issue: Animations Janky
```
Problem: Cards stutter on hover
```

**Solution:**
1. Check GPU acceleration enabled
2. Close other browser tabs
3. Verify Tailwind build includes animation classes

---

## ✅ Final Verification Checklist

Before considering implementation complete:

- [ ] npm run dev starts without errors
- [ ] No console errors or warnings
- [ ] Can signup with new account
- [ ] Can login with created account  
- [ ] Homepage displays correctly
- [ ] All 5 sport cards visible
- [ ] Sport card animations work
- [ ] Upload form cascades correctly
- [ ] Dark Stadium colors visible
- [ ] Neon glows render properly
- [ ] Glassmorphism effect on cards
- [ ] Responsive at 375px, 768px, 1920px
- [ ] No CORS errors
- [ ] Token persists on reload
- [ ] Route protection works
- [ ] Animations smooth (60fps)
- [ ] Mobile navigation works
- [ ] Logout clears session

---

## 📊 Performance Benchmarks

**Target Metrics:**
- Page Load: <3s
- First Contentful Paint: <1.5s
- Lighthouse Score: >85
- Core Web Vitals:
  - LCP: <2.5s
  - FID: <100ms
  - CLS: <0.1

**Check Performance:**
```bash
npm run build
# Then audit with Lighthouse (DevTools → Audits)
```

---

## 🎯 Success Criteria

✅ **All tests pass**
✅ **No console errors**
✅ **Smooth 60fps animations**
✅ **Fully responsive**
✅ **Production-ready code**

---

**Testing Complete!** Ready for deployment.
