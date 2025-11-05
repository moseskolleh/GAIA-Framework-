# How to Pull Latest Changes and Test

## Step 1: Pull Latest Code

```bash
cd /home/user/GAIA-Framework-
git fetch origin claude/gaia-dynamic-model-selection-011CUpXEu7JQGtmT2Za44bYz
git reset --hard origin/claude/gaia-dynamic-model-selection-011CUpXEu7JQGtmT2Za44bYz
```

## Step 2: Verify Files Exist

```bash
ls -la assets/
```

You should see:
- ✓ ai-models-database.csv (4273 bytes)
- ✓ workbook-data.json (27713 bytes)
- ✓ README.md

## Step 3: Open Test File First

Open this file in your browser: `/home/user/GAIA-Framework-/test-assets-loading.html`

You should see:
- ✅ CSV File Test - SUCCESS
- ✅ JSON File Test - SUCCESS

## Step 4: Open Main App

If the test passes, open: `/home/user/GAIA-Framework-/index.html`

**IMPORTANT:**
- Clear browser cache: Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac)
- Make sure you're opening the file from the correct directory

## Step 5: If Still Not Working

If you're still getting the error, you need to serve the files with a local server (browsers can block file:// access to CSV files).

### Option A: Python Server
```bash
cd /home/user/GAIA-Framework-
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Option B: Node.js Server
```bash
cd /home/user/GAIA-Framework-
npx serve
```

## Expected Result

When opening index.html, the browser console should show:
```
✓ Loaded 54 AI models
✓ Loaded workbook data with 8 sheets
✓ GAIA Dashboard initialized successfully
✓ Current model: o3
✓ Database: 54 models loaded
```

The dropdown should show 54 models grouped by provider.
