# Data Whisperer Technical Overview - Part 4: Configuration, Deployment & Developer Tools

## 8. Configuration & Environment

### 8.1 Environment Management

- **./env.example** - REFERENCE
  - Example environment variables file
  - Contains all required environment variables with example values
  - Used as a template for setting up `.env` files
  - Categories: Server settings, database connections, API keys, feature flags

- **./.env** - ACTIVE (not tracked in git)
  - Local development environment variables
  - Contains sensitive information like API keys and database credentials
  - Should not be committed to version control

- **./backend/.env** - ACTIVE (not tracked in git)
  - Backend-specific environment variables
  - Used when running the backend independently

- **./frontend/.env** - ACTIVE (not tracked in git)
  - Frontend-specific environment variables
  - Used when running the frontend independently
  - Contains public API URLs and frontend configuration

### 8.2 Backend Configuration

- **./backend/config.py** - PRIMARY ACTIVE
  - Core backend configuration
  - Imports: os, dotenv
  - Features:
    - Environment variable loading
    - Configuration validation
    - Default value fallbacks
    - Environment-based configuration switching
  - Called by: Most backend modules
  - Calls: Environment variable access

- **./backend/app/config.py** - ACTIVE NEWER VERSION
  - Modern configuration management
  - Imports: pydantic, BaseSettings
  - Features:
    - Type-validated settings
    - Hierarchical configuration
    - Environment mapping
  - Called by: Newer backend modules
  - Calls: Pydantic validation

- **./backend/app/settings.py** - ACTIVE
  - Application settings implementation
  - Imports: config.py, pydantic
  - Features:
    - Application-specific settings
    - Default values
    - Documentation
  - Called by: Application modules requiring settings
  - Calls: config.py

- **./backend/app/constants.py** - ACTIVE
  - Application constants
  - Features:
    - Magic string avoidance
    - Status codes
    - Fixed values
  - Called by: Various application modules
  - Usage: Centralized constant management

### 8.3 Frontend Configuration

- **./frontend/vite.config.ts** - PRIMARY ACTIVE
  - Vite bundler configuration
  - Imports: vite plugins, path
  - Features:
    - Build configuration
    - Development server settings
    - Plugin configuration
    - Path aliases
  - Used by: Vite build and development processes

- **./frontend/tsconfig.json** - ACTIVE
  - TypeScript configuration
  - Features:
    - TypeScript compiler options
    - Import aliases
    - Type checking rules
  - Used by: TypeScript compiler, IDE integration

- **./frontend/package.json** - ACTIVE
  - Frontend package dependencies
  - Scripts for development, building, testing
  - Project metadata
  - Used by: npm/yarn package management

- **./frontend/src/config/index.ts** - ACTIVE
  - Frontend application configuration
  - Imports: environment variables
  - Features:
    - API endpoint URLs
    - Feature flags
    - Environment detection
  - Called by: Service modules, components
  - Calls: Environment variable access

- **./frontend/src/config/routes.ts** - ACTIVE
  - Frontend route configuration
  - Imports: React components
  - Features:
    - Route definitions
    - Route metadata
    - Access control information
  - Called by: Router component
  - Calls: Route components

- **./frontend/src/themes/index.ts** - ACTIVE
  - Application theming configuration
  - Imports: theme types
  - Features:
    - Color schemes
    - Typography
    - Spacing
    - Component theming
  - Called by: ThemeProvider, styled components
  - Calls: Theme utilities

### 8.4 Database Configuration

- **./backend/app/alembic.ini** - ACTIVE
  - Alembic migration configuration
  - Features:
    - Migration script location
    - Database URL (template)
    - Migration logging
  - Used by: Alembic migration commands

- **./backend/migrations/script.py.mako** - ACTIVE
  - Migration script template
  - Used by: Alembic to generate migration files
  - Features: Standard migration script structure

- **./backend/migrations/versions/** - ACTIVE
  - Migration script versions
  - Auto-generated alembic migration files
  - Features: Database schema changes over time

- **./backend/app/database_url.py** - ACTIVE
  - Database URL construction
  - Imports: config
  - Features:
    - URL construction from environment
    - Connection parameter handling
    - Environment-specific configurations
  - Called by: database.py
  - Calls: Environment configuration

## 9. Docker & Deployment

### 9.1 Docker Configuration

- **./Dockerfile** - PRIMARY ACTIVE
  - Main application Dockerfile
  - Features:
    - Multi-stage build
    - Base image selection
    - Dependency installation
    - Application configuration
    - Entry point definition
  - Used by: Docker build process, CI/CD pipeline

- **./docker-compose.yml** - PRIMARY ACTIVE
  - Docker Compose configuration
  - Features:
    - Service definitions (backend, frontend, database)
    - Network configuration
    - Volume mounts
    - Environment variables
    - Dependency ordering
  - Used by: Docker Compose for local development and testing

- **./docker-compose.prod.yml** - PRODUCTION
  - Production Docker Compose configuration
  - Features:
    - Production-specific settings
    - Volume persistence
    - Scaling configuration
    - Performance optimizations
  - Used by: Production deployment

- **./backend/Dockerfile** - ACTIVE
  - Backend-specific Dockerfile
  - Features:
    - Python environment setup
    - Dependency installation
    - Backend-specific configuration
  - Used by: Backend-only container builds

- **./frontend/Dockerfile** - ACTIVE
  - Frontend-specific Dockerfile
  - Features:
    - Node environment setup
    - Dependency installation
    - Build process
    - Nginx configuration for serving
  - Used by: Frontend-only container builds

### 9.2 Deployment Scripts

- **./scripts/deploy.sh** - ACTIVE
  - Deployment automation script
  - Features:
    - Environment setup
    - Docker build
    - Container deployment
    - Database migration
  - Used by: Deployment workflows, CI/CD

- **./scripts/setup_env.sh** - ACTIVE
  - Environment setup script
  - Features:
    - Environment variable file generation
    - Configuration validation
  - Used by: Initial setup, CI/CD

- **./scripts/backup_db.sh** - ACTIVE
  - Database backup script
  - Features:
    - Database dump
    - Backup rotation
    - Compression
  - Used by: Scheduled backups, pre-deployment

- **./scripts/healthcheck.sh** - ACTIVE
  - Application health check script
  - Features:
    - API endpoint testing
    - Service availability verification
    - Status reporting
  - Used by: Monitoring systems, Docker health checks

- **./backend/entrypoint.sh** - ACTIVE
  - Backend container entry point script
  - Features:
    - Startup sequence
    - Database migration
    - Server startup
    - Signal handling
  - Used by: Backend Docker container

- **./frontend/nginx.conf** - ACTIVE
  - Nginx configuration for frontend
  - Features:
    - Static file serving
    - SPA routing
    - Caching
    - Compression
    - Proxy configuration for API
  - Used by: Frontend Docker container

### 9.3 CI/CD Configuration

- **./.github/workflows/main.yml** - ACTIVE
  - GitHub Actions workflow configuration
  - Features:
    - Build pipeline
    - Test automation
    - Deployment automation
    - Environment configuration
  - Used by: GitHub Actions CI/CD

- **./.github/workflows/pr_checks.yml** - ACTIVE
  - Pull request validation workflow
  - Features:
    - Code linting
    - Type checking
    - Test execution
    - Build verification
  - Used by: GitHub Actions PR validation

- **./.github/ISSUE_TEMPLATE/** - ACTIVE
  - Issue templates for GitHub
  - Includes: bug_report.md, feature_request.md
  - Features: Structured issue reporting

- **./.github/PULL_REQUEST_TEMPLATE.md** - ACTIVE
  - Pull request template
  - Features: Structured PR description format

## 10. Developer Tools & Testing

### 10.1 Linting & Formatting

- **./backend/.flake8** - ACTIVE
  - Flake8 Python linter configuration
  - Features:
    - Linting rules
    - Ignored rules
    - Excluded paths
  - Used by: Flake8 linter, CI/CD

- **./backend/pyproject.toml** - ACTIVE
  - Python project configuration
  - Features:
    - Black formatter configuration
    - isort import sorter configuration
    - mypy type checking configuration
  - Used by: Python development tools

- **./frontend/.eslintrc.js** - ACTIVE
  - ESLint configuration
  - Features:
    - Linting rules
    - Plugin configuration
    - TypeScript integration
  - Used by: ESLint, IDE integration, CI/CD

- **./frontend/.prettierrc** - ACTIVE
  - Prettier code formatter configuration
  - Features:
    - Formatting rules
    - File inclusions
  - Used by: Prettier, IDE integration, CI/CD

- **./frontend/stylelint.config.js** - ACTIVE
  - Stylelint CSS linter configuration
  - Features:
    - CSS linting rules
    - Plugin configuration
  - Used by: Stylelint, IDE integration, CI/CD

### 10.2 Testing Configuration

- **./backend/pytest.ini** - ACTIVE
  - Pytest configuration
  - Features:
    - Test discovery rules
    - Plugin configuration
    - Test markers
  - Used by: Pytest test runner

- **./backend/conftest.py** - ACTIVE
  - Pytest fixtures and configuration
  - Imports: pytest, testing utilities
  - Features:
    - Test fixtures
    - Common test utilities
    - Mock configurations
  - Used by: Backend test modules

- **./frontend/jest.config.js** - ACTIVE
  - Jest test configuration
  - Features:
    - Test environment
    - Module mocking
    - Coverage reporting
  - Used by: Jest test runner

- **./frontend/vitest.config.ts** - ALTERNATIVE/NEWER
  - Vitest configuration (alternative to Jest)
  - Features:
    - Similar to Jest but Vite-integrated
    - Fast HMR-enabled testing
  - Used if: Moving to Vitest from Jest

- **./frontend/cypress.json** - ACTIVE
  - Cypress end-to-end test configuration
  - Features:
    - Browser configuration
    - Screenshot settings
    - Plugin configuration
  - Used by: Cypress test runner

- **./frontend/playwright.config.ts** - ALTERNATIVE
  - Playwright end-to-end test configuration
  - Features:
    - Multi-browser testing
    - Screenshot settings
    - Device emulation
  - Used if: Moving to Playwright from Cypress

### 10.3 Testing Files

#### 10.3.1 Backend Testing

- **./backend/tests/** - PRIMARY ACTIVE
  - Backend test directory
  - Contains:
    - Unit tests
    - Integration tests
    - Fixtures
    - Mocks

- **./backend/tests/unit/** - ACTIVE
  - Unit test modules
  - Contains tests for individual functions and classes
  - Follows structure of main code directories

- **./backend/tests/integration/** - ACTIVE
  - Integration test modules
  - Tests multiple components working together
  - Focuses on API endpoints and workflows

- **./backend/tests/conftest.py** - ACTIVE
  - Common test fixtures
  - Mock data and utilities

#### 10.3.2 Frontend Testing

- **./frontend/src/__tests__/** - PRIMARY ACTIVE
  - Frontend test directory
  - Contains:
    - Component tests
    - Hook tests
    - Utility tests
    - State management tests

- **./frontend/src/__tests__/components/** - ACTIVE
  - Component test modules
  - Unit tests for React components
  - Snapshot tests

- **./frontend/src/__tests__/hooks/** - ACTIVE
  - Hook test modules
  - Tests for custom React hooks

- **./frontend/src/__tests__/utils/** - ACTIVE
  - Utility function tests
  - Tests for helper functions and services

- **./frontend/cypress/integration/** - ACTIVE
  - Cypress end-to-end test files
  - Test real user workflows
  - Full application integration tests

- **./frontend/cypress/fixtures/** - ACTIVE
  - Test data fixtures for Cypress
  - Mock API responses

### 10.4 Documentation

- **./README.md** - PRIMARY ACTIVE
  - Main project README
  - Features:
    - Project overview
    - Setup instructions
    - Development workflow
    - Architecture overview
  - Used by: New developers, project documentation

- **./docs/** - ACTIVE
  - Documentation directory
  - Contains detailed documentation files

- **./docs/architecture.md** - ACTIVE
  - Architecture documentation
  - Details system architecture and design decisions

- **./docs/api.md** - ACTIVE
  - API documentation
  - Describes API endpoints and response formats

- **./docs/deployment.md** - ACTIVE
  - Deployment documentation
  - Instructions for deploying the application

- **./docs/development.md** - ACTIVE
  - Development documentation
  - Development workflow and best practices

- **./PERSISTENCE.md** - ACTIVE
  - Database persistence documentation
  - Details the database schema and data storage approach

- **./KAGGLE_INTEGRATION_STATUS.md** - ACTIVE
  - Kaggle integration documentation
  - Details on Kaggle API integration features and status

- **./DATASET_ORGANIZATION.md** - ACTIVE
  - Dataset organization documentation
  - Details on how datasets are organized and managed

- **./backend/app/api/openapi.json** - AUTO-GENERATED
  - OpenAPI specification
  - Generated by FastAPI
  - Used for API documentation

## 11. Dependencies & External Libraries

### 11.1 Backend Dependencies

- **./backend/requirements.txt** - PRIMARY ACTIVE
  - Core backend dependencies
  - Features:
    - FastAPI and dependencies
    - Database libraries
    - Data processing libraries
    - AI/ML libraries
  - Used by: pip installation, Docker builds

- **./backend/requirements-dev.txt** - ACTIVE
  - Development dependencies
  - Features:
    - Testing libraries
    - Linting tools
    - Development utilities
  - Used by: Development environment setup

- **./backend/poetry.lock**, **./backend/pyproject.toml** - ALTERNATIVE
  - Poetry dependency management
  - More modern dependency management
  - Used if: Migrating from pip to poetry

### 11.2 Frontend Dependencies

- **./frontend/package.json** - PRIMARY ACTIVE
  - Frontend dependencies
  - Features:
    - React and dependencies
    - UI libraries
    - State management
    - Build tools
  - Used by: npm/yarn installation, Docker builds

- **./frontend/yarn.lock** or **./frontend/package-lock.json** - ACTIVE
  - Locked dependencies
  - Ensures consistent installations
  - Used by: yarn/npm installation 