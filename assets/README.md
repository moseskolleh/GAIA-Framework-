# GAIA Framework Assets

This folder contains all data files and resources for the GAIA Framework application.

## Files:

### ai-models-database.csv
- Contains 54 AI models with environmental impact data
- Columns: model_name, provider, energy_wh, water_l, carbon_gco2e, parameters_b, context_length, license, hardware, cost_per_1m_input, cost_per_1m_output
- Energy, water, and carbon values are per 1,000 tokens (not per 1M tokens)

### workbook-data.json
- Contains all 8 Excel workbook sheets in JSON format
- Sheets: Dashboard, AI Impact Assessment, Calculation Engine, Decision Matrix, Reference Data, Weekly Monitor, Mitigation Strategies, Documentation
- Used by the documentation section to display Excel sheet contents

## Path Usage:

All asset files are loaded using relative paths from index.html:
- `./assets/ai-models-database.csv`
- `./assets/workbook-data.json`
