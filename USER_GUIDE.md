# GAIA Framework - User Guide

## 🚀 Quick Start (2 Minutes)

### Step 1: Open the Dashboard
```bash
# Open in your browser:
open ./index.html

# Or double-click index.html
```

### Step 2: View Current Assessment
The dashboard immediately shows:
- **Current Model**: o3 (OpenAI)
- **Monthly Impact**: Energy, Water, Carbon, Cost
- **Grade**: F 🔴 (Needs improvement!)
- **Top Recommendation**: Switch to Claude-3.5 Sonnet

### Step 3: Change Your Model
1. Click **[Change Model]** button
2. Search or browse 54 AI models
3. Click any model to select it
4. Dashboard updates instantly!

### Step 4: Explore Features
Click the ▼ arrows to expand sections:
- 🤖 **Model Selector** - Choose from 54 models
- 🧮 **Calculator** - Test different scenarios
- 📊 **Comparison** - Compare multiple models
- 🔄 **Alternatives** - Find better options
- 🌍 **Equivalents** - Understand real-world impact

---

## 📋 Feature Guide

### 1. Dynamic Model Selection

#### How to Search Models
```
1. Expand "🤖 AI MODEL SELECTOR"
2. Type in search box: "claude" or "openai"
3. Use filters:
   - Provider: OpenAI, Anthropic, Meta, etc.
   - License: Open Source / Proprietary
4. Click model to select
```

#### Model Information Shown
- Model name and provider
- Energy per 1M tokens (Wh)
- Water per 1M tokens (L)
- Carbon per 1M tokens (g CO2e)
- Cost per 1M tokens ($)
- Environmental indicator (🟢🟡🔴)

### 2. Interactive Calculator

#### Adjust Parameters
```
Monthly Queries: 1,000 → 100,000
Avg Tokens:      100   → 10,000
PUE:             1.0   → 2.0
WUE:             0.1   → 2.0
CIF:             0.1   → 1.0
```

#### What Happens
- Results update in real-time
- See impact of different usage levels
- Test "what if" scenarios
- Apply settings to dashboard

#### Example Use Case
```
Question: "What if we double our queries?"

1. Expand Calculator
2. Move "Monthly Queries" slider to 20,000
3. See new impact:
   - Energy doubles
   - Costs double
   - Grade might change
4. Decide: Keep current or optimize?
```

### 3. Model Comparison

#### Compare Up to 5 Models
```
1. Expand "📊 MODEL COMPARISON"
2. Select models from selector
3. View side-by-side table
4. Best values highlighted green
5. Worst values highlighted red
```

#### Comparison Metrics
- Energy per month (kWh)
- Water per month (L)
- Carbon per month (kg CO2e)
- Cost per month ($)
- Environmental Score
- Grade (A+ to F)

### 4. Finding Better Alternatives

#### Top 10 Recommendations
```
1. Expand "🔄 ALTERNATIVE MODEL ANALYSIS"
2. View models sorted by improvement
3. See savings percentages:
   - Energy: -90%
   - Water: -95%
   - Carbon: -90%
4. Select model from list
```

#### Understanding Savings
```
Example: Switch from o3 to Claude-3.5 Sonnet
✓ Save 193 kWh/month (90% reduction)
✓ Save 720 L/month (95% reduction)
✓ Save 68 kg CO2e/month (90% reduction)
✓ Save $125/month in costs
✓ Improve grade from F to A 🟢
```

### 5. Environmental Equivalents

#### Real-World Context
Your monthly impact equals:
- 💡 **1,285 hours** of LED lighting
- 🚗 **302 km** driven in a car
- ☕ **3,040 cups** of drinking water
- 🌳 **3.6 trees** needed for 1 year
- 🏠 **0.24 homes** powered for 1 day
- 🚿 **12 showers** (10 min each)

### 6. Mitigation Strategies

#### Three Levels of Action

**Organization Level** (Biggest Impact)
- Switch to efficient models (40-60% reduction)
- Choose renewable cloud regions (30-50% reduction)
- Implement query limits (20-30% reduction)

**Team Level** (Medium Impact)
- Batch similar requests (15-25% reduction)
- Use caching for common queries (10-20% reduction)
- Optimize prompts (10-15% reduction)

**Individual Level** (Easy Wins)
- Use simpler models for routine tasks (20-30% reduction)
- Query during off-peak hours (5-10% reduction)
- Personal carbon budget (5-10% reduction)

### 7. Calculation Details

#### For Technical Users
Expand "⚙️ CALCULATION ENGINE DETAILS" to see:
- All input parameters
- Per-query calculations
- Monthly totals with infrastructure
- Formulas used
- Step-by-step breakdown

---

## 🎯 Common Use Cases

### Use Case 1: Find the Greenest Model
```
Goal: Minimize environmental impact

Steps:
1. Expand "🔄 ALTERNATIVE MODEL ANALYSIS"
2. Look at #1 ranked model
3. Check if it meets your needs
4. Click model to select
5. Review new impact

Result: Lowest possible environmental score
```

### Use Case 2: Balance Cost and Impact
```
Goal: Optimize for both cost and environment

Steps:
1. Expand "📊 MODEL COMPARISON"
2. Add 5 models:
   - 2 open source (free)
   - 2 efficient proprietary
   - 1 high-performance
3. Compare Cost vs Environmental Score
4. Choose best balance

Result: Optimal cost/impact ratio
```

### Use Case 3: Plan for Growth
```
Goal: Understand impact at 10x usage

Steps:
1. Expand "🧮 REAL-TIME IMPACT CALCULATOR"
2. Move "Monthly Queries" to 100,000
3. See projected impact
4. Test different models at this scale
5. Plan infrastructure accordingly

Result: Informed growth planning
```

### Use Case 4: Quarterly Review
```
Goal: Review and optimize quarterly

Steps:
1. Open dashboard
2. Review current grade
3. Check if still optimal
4. View alternatives
5. Apply recommendation if better
6. Document in mitigation plan

Result: Continuous optimization
```

### Use Case 5: Executive Report
```
Goal: Present to leadership

Show:
1. Current monthly impact (Energy, Water, Carbon)
2. Environmental & Benefit scores
3. Grade (with color coding)
4. Top recommendation with savings
5. Real-world equivalents for context
6. Mitigation strategies for action plan

Result: Clear, actionable executive summary
```

---

## 🎨 Understanding the Dashboard

### Color Coding System

#### Environmental Score
- 🟢 **Green (< 35)**: Good - Recommended
- 🟡 **Yellow (35-70)**: Moderate - Monitor closely
- 🔴 **Red (> 70)**: Critical - Action required

#### Grades
- **A+** 🟢: Excellent (< 20 score, > 80 benefit)
- **A** 🟢: Very Good (20-35 score, > 70 benefit)
- **B** 🟡: Good (35-50 score, > 50 benefit)
- **C** 🟡: Fair (35-50 score, 50-70 benefit)
- **D** 🟠: Poor (50-70 score, > 50 benefit)
- **F** 🔴: Unacceptable (> 70 score OR low benefit)

### Reading the Metrics

#### Energy (kWh)
- **What**: Electricity consumed per month
- **Why**: Primary environmental cost
- **Context**: 1 kWh = 6 hours of LED lighting

#### Water (Liters)
- **What**: Water used for cooling per month
- **Why**: Often overlooked impact
- **Context**: 1 L = 4 cups of drinking water

#### Carbon (kg CO2e)
- **What**: Greenhouse gas emissions per month
- **Why**: Climate change contribution
- **Context**: 1 kg = 4 km driven in a car

#### Cost ($)
- **What**: Estimated monthly API costs
- **Why**: Financial impact
- **Context**: Based on input tokens + output estimate

---

## 💡 Tips & Best Practices

### Tip 1: Start with Open Source
```
Open source models are often:
✓ Free ($0 cost)
✓ Efficient (lower energy)
✓ Transparent (known specs)

Try: Llama-3.3-70B, Mistral-Small-3, DeepSeek-R1
```

### Tip 2: Use Simpler Models for Simple Tasks
```
Don't use o3 for:
- Simple Q&A
- Basic classification
- Routine queries

Instead use:
- GPT-4o mini
- Claude-3.5 Haiku
- Llama-3.2-3B

Save 90%+ on energy!
```

### Tip 3: Batch Similar Requests
```
Instead of: 100 individual queries
Do: 10 batched queries with 10 items each

Savings:
- 15-25% energy reduction
- Faster processing
- Better cost efficiency
```

### Tip 4: Optimize Your Prompts
```
Bad Prompt (1,500 tokens):
"I want you to analyze this document and tell me
everything about it in great detail..."

Good Prompt (500 tokens):
"Summarize key findings from this document in 3 bullets."

Savings: 67% fewer tokens = 67% less impact
```

### Tip 5: Monitor Regularly
```
Set calendar reminder:
- Monthly: Review dashboard
- Quarterly: Check for new models
- Annually: Reassess strategy

Stay optimized continuously!
```

---

## 🔧 Troubleshooting

### Problem: Dashboard Not Loading
```
Solutions:
1. Check browser console (F12)
2. Ensure assets/ai-models-database.csv exists
3. Try different browser (Chrome, Firefox)
4. Clear browser cache
5. Refresh page (Ctrl+R / Cmd+R)
```

### Problem: Model Not Updating
```
Solutions:
1. Click model again to reselect
2. Refresh page
3. Clear localStorage (Application > Storage)
4. Check console for errors
```

### Problem: Calculations Seem Wrong
```
Verify:
1. Check input parameters (queries, tokens)
2. Verify infrastructure settings (PUE, WUE, CIF)
3. Compare with Calculation Details section
4. Reference VERIFICATION_REPORT.md
```

### Problem: Section Won't Expand
```
Solutions:
1. Click header area (not just icon)
2. Wait for animation (300ms)
3. Try different section
4. Refresh page if persistent
```

---

## 📚 Additional Resources

### Documentation Files
- **VERIFICATION_REPORT.md** - Technical details & testing
- **COMPLETE_WORKFLOW.md** - Original Excel guide
- **DEPLOYMENT.md** - GitHub Pages setup

### Learning More
- **What is PUE?** Power Usage Effectiveness (datacenter efficiency)
- **What is WUE?** Water Usage Effectiveness (cooling efficiency)
- **What is CIF?** Carbon Intensity Factor (grid emissions)

### Getting Help
- Check console for errors (F12 > Console)
- Review verification report for calculations
- Compare results with Excel tool
- Contact: gaia-support@example.com

---

## ⚡ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Ctrl+F / Cmd+F | Search models |
| Tab | Navigate between inputs |
| Space | Toggle section (when focused) |
| Ctrl+R / Cmd+R | Refresh dashboard |
| F12 | Open developer console |

---

## 📊 Sample Workflows

### Workflow 1: New Project Setup (5 minutes)
```
1. Open dashboard
2. Expand Model Selector
3. Filter by "Open Source"
4. Compare top 5 efficient models
5. Select best fit for your use case
6. Expand Calculator
7. Adjust to expected usage
8. Document in project plan
9. Set up monitoring
```

### Workflow 2: Monthly Review (10 minutes)
```
1. Open dashboard
2. Review current month's impact
3. Check if grade improved
4. Expand Alternatives
5. See if better models available
6. Expand Mitigation Strategies
7. Implement 2-3 high-priority items
8. Apply any model changes
9. Document in report
10. Set reminder for next month
```

### Workflow 3: Executive Presentation (3 minutes)
```
1. Open dashboard
2. Screenshot executive summary
3. Note: Grade, Score, Costs
4. Screenshot recommendation
5. Screenshot real-world equivalents
6. Copy mitigation strategies
7. Create 5-slide deck:
   - Current state
   - Recommendation
   - Savings
   - Context
   - Action plan
```

---

## 🎓 Training Checklist

### For End Users
- [ ] Open dashboard successfully
- [ ] Understand color coding (🟢🟡🔴)
- [ ] Read current assessment
- [ ] Select a different model
- [ ] View environmental equivalents
- [ ] Understand grades (A+ to F)

### For Analysts
- [ ] Use model search and filters
- [ ] Compare multiple models
- [ ] Use interactive calculator
- [ ] Interpret savings percentages
- [ ] Review alternatives table
- [ ] Understand mitigation strategies

### For Administrators
- [ ] Review calculation details
- [ ] Verify formulas match Excel
- [ ] Configure infrastructure settings
- [ ] Export data for reporting
- [ ] Train team members
- [ ] Set up regular monitoring

---

## 🚀 Next Steps

### Immediate (This Week)
1. ✅ Open dashboard
2. ✅ Select your current model
3. ✅ Enter your monthly query volume
4. ✅ Review grade and recommendations
5. ✅ Apply one mitigation strategy

### Short-term (This Month)
1. Test 3-5 alternative models
2. Measure actual vs estimated impact
3. Implement 3 mitigation strategies
4. Train team on dashboard
5. Set up monthly review process

### Long-term (This Quarter)
1. Integrate into project planning
2. Add to quarterly reviews
3. Track savings over time
4. Expand to other teams
5. Contribute improvements

---

**Version:** 2.0
**Last Updated:** November 5, 2025
**Status:** Ready for Production

**Need Help?** Check VERIFICATION_REPORT.md or open an issue on GitHub.
