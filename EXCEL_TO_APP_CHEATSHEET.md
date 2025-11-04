# 🚀 Excel to Web App - Quick Reference Card

## 📋 Copy-Paste Prompts for Claude Code

### 1️⃣ EXTRACT DATA FROM EXCEL
```
I have an Excel workbook at ./assets/MY_FILE.xlsx

Please:
1. Read all sheets from the Excel file
2. Extract complete data (all rows and columns)
3. Convert to JSON format
4. Save as ./src/workbook-data.json
5. Show me a summary: sheet names, row counts, column counts

Handle empty cells as empty strings and preserve all data structure.
```

---

### 2️⃣ CREATE THE WEB APP
```
Create a beautiful single-page web app that displays my Excel data.

REQUIREMENTS:
✓ Use vanilla JavaScript only (no React/frameworks)
✓ Single HTML file with embedded CSS, JS, and data
✓ Dropdown menu to select sheets
✓ Professional table display with formatting
✓ Responsive design (mobile + desktop)
✓ Modern design: purple/blue gradients, green accents
✓ Glass-morphism effects on cards
✓ Smooth transitions when switching sheets
✓ Hover effects on table cells
✓ Custom scrollbars

STYLING RULES:
- Header rows: green gradient background, white text
- Section headers: purple background
- Label cells (first column): gray background, bold
- Empty rows: create spacing
- All text: readable and well-spaced

Save as: ./src/index.html
```

---

### 3️⃣ OPTIMIZE FOR PRODUCTION
```
Optimize the HTML file for production deployment:

1. Minify CSS (remove extra whitespace)
2. Ensure all assets are embedded
3. Add SEO meta tags
4. Add viewport meta tag
5. Verify UTF-8 encoding
6. Test data integrity
7. Save optimized version as ./index.html (root directory)
```

---

### 4️⃣ CREATE README
```
Create a professional README.md with:

1. Project title: "[My Project Name] - Data Dashboard"
2. Description of what the app does
3. Features list
4. How to use the app
5. Data source information
6. Technology used
7. Deployment instructions
8. Placeholder for live demo link
9. License (MIT)
10. Contact/support info

Make it well-formatted with emojis and sections.
```

---

### 5️⃣ ADD SEARCH FEATURE (Optional)
```
Add a search feature to the app:

1. Search box above the table
2. Filters rows in real-time as user types
3. Case-insensitive search
4. Searches all columns in current sheet
5. Shows "No results" message when nothing matches
6. Debounced for performance (300ms delay)
7. Clear button to reset search
```

---

### 6️⃣ ADD EXPORT FEATURE (Optional)
```
Add a "Download as CSV" button:

1. Downloads the currently displayed sheet
2. Preserves all data formatting
3. Filename: [SheetName].csv
4. Button styled to match the theme
5. Shows success message after download
```

---

### 7️⃣ ADD DARK MODE (Optional)
```
Add a dark/light mode toggle:

1. Toggle button in header
2. Smooth transition between modes
3. Dark mode: dark background, light text
4. Save preference in localStorage
5. Default to user's system preference
6. Update all colors appropriately
```

---

### 8️⃣ FIX ISSUES
```
The app has an issue: [DESCRIBE ISSUE]

Please debug and fix:
1. Check browser console for errors
2. Verify data is loading correctly
3. Test all functionality
4. Add console.log statements if needed
5. Explain what was wrong and how you fixed it
```

---

## 💻 Essential Git Commands

### Initial Setup
```bash
# Create project folder
mkdir my-excel-app
cd my-excel-app

# Initialize git
git init

# Create folders
mkdir src assets

# Copy your Excel file
cp /path/to/file.xlsx ./assets/

# Create .gitignore
echo "node_modules/
.DS_Store
*.log" > .gitignore
```

---

### Push to GitHub
```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Excel data app"

# Add GitHub remote (replace USERNAME and REPO)
git remote add origin https://github.com/USERNAME/REPO.git

# Push
git branch -M main
git push -u origin main
```

---

### Update After Changes
```bash
# Check what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Update: [describe what you changed]"

# Push to GitHub
git push origin main
```

---

## 🌐 GitHub Pages Setup

### Option 1: Via Website
1. Go to your repo on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** (left sidebar)
4. Source: **main** branch, **/ (root)** folder
5. Click **Save**
6. Wait 2 minutes
7. Visit: `https://USERNAME.github.io/REPO/`

### Option 2: Via Command Line (if you have GitHub CLI)
```bash
# Enable GitHub Pages
gh api repos/USERNAME/REPO/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/
```

---

## 🐛 Quick Troubleshooting

### App Shows Blank Page
```bash
# Check if data exists
grep "const workbookData" ./index.html

# Open browser console (F12) and check for errors

# Ask Claude Code:
"The app is blank. Please debug by adding console.log 
statements and check if workbookData is defined and 
the init function is being called."
```

### GitHub Pages Not Working
```bash
# Verify index.html in root
ls -la ./index.html

# Check if repo is public (must be public for free Pages)

# Wait 2-5 minutes after enabling Pages

# Force refresh
git add .
git commit -m "Trigger Pages rebuild"  
git push origin main
```

### Data Missing or Wrong
```
"The extracted data is missing some information. Please:
1. Re-examine the Excel file more carefully
2. Check for merged cells or hidden rows
3. Verify all sheets are included
4. Show me first 5 rows of each sheet to verify
5. Preserve exact data types and formatting"
```

---

## 📂 Project Structure

```
my-excel-app/
│
├── index.html          # ← Main app (for GitHub Pages)
├── README.md          # ← Documentation
├── .gitignore         # ← Git ignore rules
│
├── assets/
│   └── workbook.xlsx  # ← Your original Excel file
│
└── src/
    ├── index.html              # ← Development version
    └── workbook-data.json      # ← Extracted data
```

---

## 🎨 Customization Prompts

### Change Colors
```
Update the color scheme:
- Primary gradient: #[COLOR1] to #[COLOR2]
- Accent color: #[COLOR3]
- Update all CSS to match this theme
```

### Change Layout
```
Modify the layout to:
1. [Describe desired layout change]
2. Keep the responsive design
3. Maintain current functionality
```

### Add Logo
```
Add space for a logo:
1. Header area, top-left
2. Size: 50px height
3. Placeholder for now
4. Explain how to add actual logo later
```

---

## ⚡ Performance Tips

### For Large Files (1000+ rows)
```
The app is slow with large data. Optimize:
1. Virtual scrolling (only render visible rows)
2. Pagination (100 rows per page)
3. Lazy load sheets
4. Add loading indicators
5. Compress embedded JSON
```

### For Many Sheets (10+ sheets)
```
Add sheet organization:
1. Group sheets by category
2. Add sheet search/filter
3. Show sheet preview on hover
4. Add "Recently viewed" section
```

---

## 🔗 Useful Links

- **Claude Code Docs:** https://docs.claude.com/claude-code
- **GitHub Pages:** https://pages.github.com
- **Git Cheatsheet:** https://training.github.com/downloads/github-git-cheat-sheet.pdf
- **Test Responsiveness:** https://responsivedesignchecker.com

---

## 📞 Getting Help

### From Claude Code
```
I'm stuck on [PROBLEM]. Can you:
1. Diagnose the issue
2. Explain what's wrong
3. Provide a fix
4. Test that it works
```

### Testing Checklist
- [ ] All sheets visible in dropdown?
- [ ] Data matches Excel file?
- [ ] Works on mobile?
- [ ] No console errors?
- [ ] Loads in under 3 seconds?
- [ ] Deployed to GitHub Pages?

---

## ✅ Success Criteria

Your app is ready when:
- ✓ All data from Excel is visible and accurate
- ✓ Beautiful, professional design
- ✓ Responsive on all devices
- ✓ Fast and smooth interactions
- ✓ Hosted on GitHub Pages
- ✓ Shareable URL works
- ✓ Zero console errors

---

## 🎯 Next Steps After Completion

1. **Share it:** Send the URL to colleagues
2. **Update data:** Replace Excel file, re-run extraction, push to GitHub
3. **Add features:** Search, export, charts, filters
4. **Custom domain:** Point your domain to GitHub Pages
5. **Analytics:** Add Google Analytics to track usage

---

**Print this page and keep it handy!** 🖨️

These prompts and commands will handle 90% of your Excel-to-app workflow.
