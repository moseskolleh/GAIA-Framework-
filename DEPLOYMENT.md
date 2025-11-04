# 🚀 GAIA Framework - Deployment Guide

Complete guide for deploying the GAIA Framework web application to GitHub Pages.

---

## 📋 Pre-Deployment Checklist

✅ All files committed to repository
✅ `index.html` is in the root directory
✅ GitHub Pages configuration files created
✅ Repository is public (required for free GitHub Pages)
✅ All features tested locally

---

## 🌐 GitHub Pages Deployment

### Method 1: Via GitHub Website (Recommended)

1. **Navigate to Repository Settings**
   ```
   https://github.com/moseskolleh/GAIA-Framework-/settings
   ```

2. **Find Pages Section**
   - Click on "Pages" in the left sidebar
   - Or go directly to: `https://github.com/moseskolleh/GAIA-Framework-/settings/pages`

3. **Configure Source**
   - **Source**: Deploy from a branch
   - **Branch**: `main`
   - **Folder**: `/ (root)`
   - Click **Save**

4. **Wait for Deployment**
   - GitHub Actions will build and deploy your site
   - Usually takes 2-3 minutes
   - Watch the Actions tab for progress

5. **Access Your Site**
   ```
   https://moseskolleh.github.io/GAIA-Framework-/
   ```

### Method 2: Via GitHub CLI

If you have GitHub CLI installed:

```bash
# Enable GitHub Pages
gh api repos/moseskolleh/GAIA-Framework-/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/

# Check status
gh api repos/moseskolleh/GAIA-Framework-/pages
```

---

## 📁 Deployed Files

The following files will be deployed:

### Essential Files
- ✅ `index.html` - Main application (42KB)
- ✅ `README.md` - Project documentation
- ✅ `LICENSE` - MIT License

### Configuration Files
- ✅ `_config.yml` - GitHub Pages/Jekyll configuration
- ✅ `.nojekyll` - Bypass Jekyll processing
- ✅ `robots.txt` - SEO and crawler instructions
- ✅ `sitemap.xml` - Site structure for search engines

### Source Files (Not Deployed)
- ❌ `GAIA_Complete_Tool.xlsx` - Original Excel file (excluded)
- ❌ `extract_excel_data.py` - Python script (excluded)
- ❌ `src/` - Development files (excluded)

---

## 🔧 Configuration Files Explained

### `_config.yml`
Jekyll configuration for GitHub Pages. Sets title, description, and build settings.

### `.nojekyll`
Empty file that tells GitHub Pages to skip Jekyll processing. Required since we're using a custom HTML app.

### `robots.txt`
Tells search engine crawlers which pages to index:
- Allows all pages
- Points to sitemap
- Blocks source files and scripts

### `sitemap.xml`
XML sitemap for search engines. Helps Google/Bing index the site properly.

---

## 🎯 Post-Deployment Steps

### 1. Verify Deployment

Visit your site and check:
- [ ] Page loads correctly
- [ ] All 8 sheets are accessible
- [ ] Search functionality works
- [ ] CSV export works
- [ ] Charts render properly
- [ ] Dark mode toggle works
- [ ] Mobile responsive design works

### 2. Test on Different Devices

- [ ] Desktop (Chrome, Firefox, Safari, Edge)
- [ ] Tablet (iPad, Android tablets)
- [ ] Mobile (iPhone, Android phones)

### 3. Check Performance

```bash
# Test with Lighthouse (Chrome DevTools)
# Target scores:
# - Performance: 90+
# - Accessibility: 95+
# - Best Practices: 95+
# - SEO: 100
```

### 4. Monitor GitHub Actions

```
https://github.com/moseskolleh/GAIA-Framework-/actions
```

Watch for any deployment errors or warnings.

---

## 🔄 Updating the Deployed Site

### Quick Updates (Content Only)

1. Edit `index.html` locally
2. Test changes locally (open in browser)
3. Commit changes:
   ```bash
   git add index.html
   git commit -m "Update: [describe your changes]"
   git push origin main
   ```
4. GitHub Pages auto-deploys in ~2 minutes

### Data Updates (Excel Changes)

1. Update `GAIA_Complete_Tool.xlsx`
2. Run extraction script:
   ```bash
   python3 extract_excel_data.py
   ```
3. Rebuild `index.html` with new data
4. Commit and push:
   ```bash
   git add index.html src/workbook-data.json
   git commit -m "Data update: [describe changes]"
   git push origin main
   ```

### Major Updates (New Features)

1. Create a feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```
2. Make your changes
3. Test thoroughly
4. Create pull request
5. Review and merge to main
6. Deployment happens automatically

---

## 🐛 Troubleshooting

### Site Not Loading

**Problem**: Getting 404 error
**Solution**:
1. Check GitHub Pages settings are correct
2. Ensure `index.html` is in root directory
3. Verify repository is public
4. Wait 5 minutes and force-refresh (Ctrl+F5)

### Styles Not Applying

**Problem**: Page loads but looks broken
**Solution**:
1. Check browser console for errors (F12)
2. Verify all CSS is embedded in `index.html`
3. Clear browser cache
4. Try incognito/private mode

### Charts Not Rendering

**Problem**: Data view works but charts are blank
**Solution**:
1. Open browser console (F12)
2. Look for JavaScript errors
3. Verify `workbookData` object exists
4. Check if switching to Charts tab triggers rendering

### Search Not Working

**Problem**: Search box doesn't filter results
**Solution**:
1. Check JavaScript console for errors
2. Verify search function is defined
3. Test with simple search terms
4. Check if data is loading correctly

---

## 🔐 Security Considerations

### Best Practices
- ✅ No API keys or secrets in code
- ✅ All data is static (no backend)
- ✅ HTTPS enforced by GitHub Pages
- ✅ No external dependencies (no CDN risks)

### Privacy
- ℹ️ No cookies used
- ℹ️ No analytics tracking (unless you add Google Analytics)
- ℹ️ No user data collection
- ℹ️ All processing happens in browser (client-side only)

---

## 📊 Analytics (Optional)

### Adding Google Analytics

1. Get your GA4 Measurement ID from Google Analytics
2. Add to `_config.yml`:
   ```yaml
   google_analytics: G-XXXXXXXXXX
   ```
3. Or add directly to `index.html`:
   ```html
   <head>
     <!-- Google Analytics -->
     <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
     <script>
       window.dataLayer = window.dataLayer || [];
       function gtag(){dataLayer.push(arguments);}
       gtag('js', new Date());
       gtag('config', 'G-XXXXXXXXXX');
     </script>
   </head>
   ```

---

## 🌟 Custom Domain (Optional)

### Set Up Custom Domain

1. **Purchase a domain** (e.g., from Namecheap, GoDaddy)

2. **Configure DNS** at your registrar:
   ```
   Type: A
   Name: @
   Value: 185.199.108.153
   Value: 185.199.109.153
   Value: 185.199.110.153
   Value: 185.199.111.153

   Type: CNAME
   Name: www
   Value: moseskolleh.github.io
   ```

3. **Create CNAME file** in repository root:
   ```bash
   echo "your-domain.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push origin main
   ```

4. **Enable in GitHub Settings**:
   - Go to Settings → Pages
   - Custom domain: `your-domain.com`
   - Save
   - Enable "Enforce HTTPS" (wait 24 hours first)

---

## 📈 Performance Optimization

### Current Performance
- File size: 42 KB (gzipped: ~12 KB)
- Load time: <1 second
- No external dependencies
- All resources embedded

### Further Optimizations
1. **Minify HTML**: Remove whitespace and comments
2. **Compress Data**: Use more compact JSON representation
3. **Lazy Load Charts**: Only render when Charts tab is active (already implemented!)
4. **Service Worker**: Add offline support (advanced)

---

## ✅ Deployment Verification Checklist

After deployment, verify these items:

### Functionality
- [ ] All 8 sheets load correctly
- [ ] Sheet dropdown works
- [ ] Search filters data properly
- [ ] CSV export downloads files
- [ ] Dark mode toggles correctly
- [ ] Theme preference persists
- [ ] Charts render on Charts tab
- [ ] All 5 charts display correctly
- [ ] Charts adapt to dark mode

### Responsiveness
- [ ] Mobile menu works
- [ ] Tables scroll horizontally on small screens
- [ ] Charts resize properly
- [ ] Touch interactions work on mobile
- [ ] No horizontal overflow issues

### SEO & Accessibility
- [ ] Page title is correct
- [ ] Meta description is present
- [ ] Images have alt text (if any)
- [ ] Semantic HTML used
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG standards

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🎉 Success!

Your GAIA Framework is now live at:
```
https://moseskolleh.github.io/GAIA-Framework-/
```

Share it with:
- Colleagues and team members
- Stakeholders and decision-makers
- Research community
- Social media (#GreenAI #SustainableAI)

---

## 📞 Support

Having issues? Check:
1. [GitHub Issues](https://github.com/moseskolleh/GAIA-Framework-/issues)
2. [GitHub Discussions](https://github.com/moseskolleh/GAIA-Framework-/discussions)
3. [GitHub Pages Documentation](https://docs.github.com/en/pages)

---

**Happy Deploying! 🚀🌱**

*GAIA Framework - Green AI for a Sustainable Future*
