# Data Whisperer

Data Whisperer is a comprehensive data analysis and workflow automation platform designed to empower data professionals, analysts, and business users to extract meaningful insights from their data without extensive coding.

## Project Structure

```
DW_final/
├── backend/                # Backend code (Python/FastAPI)
│   ├── app/                # Application code
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   └── workflow_engine/# Workflow execution engine
│   ├── data/               # Data storage
│   └── main.py             # Entry point
├── frontend/               # Frontend code (React/TypeScript)
│   ├── public/             # Static assets
│   └── src/                # Source code
│       ├── api/            # API client code
│       ├── components/     # Reusable UI components
│       ├── features/       # Feature modules
│       └── pages/          # Page components
├── docs/                   # Documentation (auto-generated)
└── scripts/                # Utility scripts
```

## Features

- **Visual Workflow Editor**: Create data processing pipelines with a drag-and-drop interface
- **Comprehensive Node Library**: Pre-built nodes for various data operations
- **Automated Data Quality**: Automatically analyze and improve data quality
- **Interactive Data Exploration**: Browse, filter, and visualize data in real-time
- **Intelligent Insights**: Automatically discover insights in your data
- **Collaborative Environment**: Share workflows and insights with team members
- **Enterprise Integration**: Seamlessly integrate with existing data infrastructure

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Python 3.9+
- PostgreSQL (optional, SQLite is used by default)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at http://localhost:8000.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm start
   ```

The frontend will be available at http://localhost:3000.

## Documentation

The project includes auto-generated documentation in the `docs` directory. To update the documentation:

```bash
./scripts/auto_update_docs.sh
```

To automatically update documentation when files change:

```bash
./scripts/watch_and_update.sh
```

See [scripts/README.md](scripts/README.md) for more information about the utility scripts.

## Development Workflow

1. Start the backend server
2. Start the frontend development server
3. Start the documentation watcher (optional)
4. Make changes to the code
5. Test your changes
6. Commit your changes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Material-UI](https://mui.com/)
- [React Flow](https://reactflow.dev/) 