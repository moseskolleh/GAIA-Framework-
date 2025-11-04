# 🌱 GAIA Framework

## Green Artificial Intelligence Assessment Framework

A comprehensive tool for measuring, assessing, and optimizing the environmental impact of AI systems. Track energy consumption, water usage, and carbon emissions across different AI models and make data-driven decisions for sustainable AI deployment.

---

## ✨ Features

- **📊 Multi-Sheet Data Dashboard** - 8 comprehensive sheets covering all aspects of AI impact assessment
- **🔍 Real-time Search** - Instantly filter data across any sheet with live search
- **📥 CSV Export** - Download any sheet as CSV for further analysis
- **🎨 Beautiful UI** - Modern glass-morphism design with smooth animations
- **📱 Fully Responsive** - Works perfectly on desktop, tablet, and mobile devices
- **⚡ Lightning Fast** - Single-page application with no external dependencies
- **♻️ Sustainable Focus** - Built to help reduce AI's environmental footprint

---

## 🚀 Deployment Status

> **⚠️ Not Yet Deployed** - The live site will be available after:
> 1. Merging the pull request to `main` branch
> 2. Enabling GitHub Pages in repository settings
>
> **Future URL:** `https://moseskolleh.github.io/GAIA-Framework-/`
>
> 📖 See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment instructions.

---

## 📋 What's Inside

### 1. Dashboard
Quick overview of current AI model assessment with key metrics:
- Active model information
- Monthly environmental impact (energy, water, carbon)
- Efficiency grade and recommendations
- Quick action alerts

### 2. AI Impact Assessment
Complete assessment workflow:
- Model selection and configuration
- Task definition and parameters
- Environmental impact calculations
- Benefit assessment
- Final eco-efficiency grade

### 3. Calculation Engine
Behind-the-scenes calculations:
- Per-query impact metrics
- Monthly totals
- Comparative analysis
- Real-world equivalents

### 4. Decision Matrix
Clear grading criteria from A+ to F:
- Environmental impact thresholds
- Benefit score requirements
- Color-coded recommendations
- Action guidelines

### 5. Reference Data
Comprehensive model database:
- 18+ AI models (OpenAI, Anthropic, Meta, DeepSeek)
- Energy, water, and carbon metrics per model
- Hardware specifications
- Environmental multipliers (PUE, WUE, CIF)

### 6. Weekly Monitor
Track usage over time:
- Daily metrics breakdown
- Weekly performance indicators
- Variance tracking
- Alert system

### 7. Mitigation Strategies
Actionable reduction strategies:
- Organization-level initiatives (40-60% reduction)
- Team-level optimizations (10-25% reduction)
- Individual actions (5-30% reduction)
- Implementation timelines and priorities

### 8. Documentation
Complete user guide:
- How to use the tool
- Metrics explanations
- Formula references
- Decision rules
- Support resources

---

## 💻 How to Use

### Online (Recommended)
Simply visit the **[live demo](https://moseskolleh.github.io/GAIA-Framework-)** - no installation required!

### Local Usage
1. **Download** the repository:
   ```bash
   git clone https://github.com/moseskolleh/GAIA-Framework-.git
   cd GAIA-Framework-
   ```

2. **Open** `index.html` in your web browser:
   ```bash
   # On macOS
   open index.html

   # On Linux
   xdg-open index.html

   # On Windows
   start index.html
   ```

3. **That's it!** No build process, no dependencies, no configuration needed.

---

## 🎯 How It Works

1. **Select a Sheet** - Choose from 8 different data sheets using the dropdown
2. **Search Data** - Type in the search box to filter rows in real-time
3. **View Details** - Browse through professionally formatted tables
4. **Export Data** - Download any sheet as CSV for external analysis
5. **Make Decisions** - Use the insights to optimize your AI deployments

---

## 🛠️ Technology Stack

- **Vanilla JavaScript** - No frameworks, pure performance
- **HTML5** - Modern semantic markup
- **CSS3** - Beautiful gradients, glass-morphism, and animations
- **No Dependencies** - 100% self-contained single file
- **GitHub Pages** - Free, fast, and reliable hosting

---

## 📊 Data Source

All data is extracted from `GAIA_Complete_Tool.xlsx` using automated scripts. The assessment framework is based on:

- Real-world AI model specifications
- Industry-standard environmental metrics
- Data center efficiency multipliers (PUE, WUE, CIF)
- Peer-reviewed research on AI sustainability

---

## 🔄 Updating the Data

To update with new Excel data:

1. **Replace** the Excel file:
   ```bash
   cp /path/to/new-file.xlsx GAIA_Complete_Tool.xlsx
   ```

2. **Extract** the data:
   ```bash
   python3 extract_excel_data.py
   ```

3. **Rebuild** index.html with new data (follow the workflow guide)

4. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Update: Refreshed data"
   git push origin main
   ```

---

## 📁 Project Structure

```
GAIA-Framework-/
│
├── index.html                      # Main web app (GitHub Pages)
├── gaia-workbook-viewer.html      # Original viewer
├── README.md                       # This file
│
├── GAIA_Complete_Tool.xlsx        # Source Excel data
├── extract_excel_data.py          # Data extraction script
│
├── COMPLETE_WORKFLOW.md           # Detailed workflow guide
├── EXCEL_TO_APP_CHEATSHEET.md     # Quick reference card
├── SKILL.md                        # Framework methodology
├── INDEX.md                        # Documentation index
│
└── src/
    ├── index.html                  # Development version
    └── workbook-data.json         # Extracted JSON data
```

---

## 🎨 Customization

### Change Colors
Edit the CSS gradient values in `index.html`:
```css
/* Primary gradient (purple/blue) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Accent color (green) */
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

### Add More Features
The codebase is well-commented and easy to extend:
- Search functionality: `performSearch()` function
- Export feature: `exportToCSV()` function
- Rendering logic: `renderTable()` function

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** - Open an issue with details
2. **Suggest Features** - Share your ideas for improvements
3. **Submit PRs** - Fork, create a branch, make changes, submit PR
4. **Improve Docs** - Help make the documentation better
5. **Share** - Tell others about GAIA Framework

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify and distribute
- ✅ Use privately
- ✅ Sublicense

---

## 🌍 Impact

By using GAIA Framework, organizations can:

- **Reduce AI carbon footprint by 30-60%** through informed model selection
- **Save costs** on energy and compute resources
- **Meet sustainability goals** with data-driven decisions
- **Demonstrate environmental responsibility** to stakeholders
- **Contribute to a greener AI future** 🌱

---

## 📞 Support & Resources

- **Framework Version**: 1.0
- **Last Updated**: November 2025
- **Documentation**: See included .md files
- **Issues**: [GitHub Issues](https://github.com/moseskolleh/GAIA-Framework-/issues)
- **Discussions**: [GitHub Discussions](https://github.com/moseskolleh/GAIA-Framework-/discussions)

---

## 🙏 Acknowledgments

- Built with guidance from the Excel-to-Web-App Quick Reference Card
- Environmental data based on industry research and real-world measurements
- Inspired by the global movement toward sustainable AI

---

## 📈 Roadmap

Future enhancements planned:

- [ ] Dark/Light mode toggle
- [ ] Advanced filtering and sorting
- [ ] Data visualization charts
- [ ] Multi-sheet comparison view
- [ ] PDF export functionality
- [ ] Custom model calculator
- [ ] API integration
- [ ] Mobile app version

---

## ⭐ Star This Project

If you find GAIA Framework useful, please give it a star on GitHub! It helps others discover the tool.

---

**Made with 💚 for a sustainable AI future**

🌱 **GAIA Framework** - *Green AI for a Sustainable Tomorrow*
