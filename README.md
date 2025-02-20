# Data Whisperer 🌟

An AI-powered data analysis and visualization platform built with Streamlit and OpenAI.

## Features 🚀

- **Smart Data Import**: Automatic schema detection and quality assessment
- **AI-Powered Analysis**: Get instant insights and patterns from your data
- **Interactive Visualizations**: Beautiful, responsive charts and graphs
- **Data Cleaning**: Automated data cleaning suggestions and operations
- **Feature Engineering**: AI-assisted feature creation and transformation
- **Machine Learning**: Binary classification with automated resampling
- **Kaggle Integration**: Direct dataset search and import from Kaggle

## Installation 🛠️

1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-whisperer.git
cd data-whisperer
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp .env.example .env
```
Then edit `.env` with your API keys and credentials.

## Configuration 🔧

1. **Kaggle API Setup**:
   - Go to [Kaggle Account Settings](https://www.kaggle.com/account)
   - Create a new API token
   - Add credentials to `.env` file

2. **OpenAI API Setup**:
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Add it to `.env` file

## Usage 💻

1. Start the application:
```bash
streamlit run DW_app/app.py
```

2. Open your browser and navigate to:
```
http://localhost:8501
```

## Project Structure 📁

```
DW_app/
├── app.py                 # Main application entry point
├── assets/               # Static assets (images, CSS)
├── components/           # Reusable UI components
├── modules/             # Feature modules
│   ├── ai_handler.py    # AI integration
│   ├── data_upload.py   # Data import
│   ├── data_analysis.py # Analysis tools
│   └── ...
└── utils/              # Helper functions
```

## Features in Detail 📊

### Data Import
- CSV, Excel, JSON file support
- Kaggle dataset integration
- Database connections
- URL imports

### AI Analysis
- Automated data profiling
- Pattern detection
- Correlation analysis
- Outlier detection
- Feature importance

### Visualization
- Interactive charts
- 3D visualizations
- Correlation heatmaps
- Time series analysis
- Custom plot suggestions

### Data Processing
- Automated cleaning
- Feature engineering
- Data transformation
- Type conversion
- Missing value handling

## Contributing 🤝

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Streamlit](https://streamlit.io/) for the amazing web framework
- [OpenAI](https://openai.com/) for the powerful AI capabilities
- [Kaggle](https://www.kaggle.com/) for the dataset integration
- [Plotly](https://plotly.com/) for interactive visualizations

## Support 💬

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap 🗺️

- [ ] Advanced ML model training
- [ ] Custom visualization templates
- [ ] Automated report generation
- [ ] Real-time data processing
- [ ] Collaborative features

---
Made with ❤️ by [Your Name] 