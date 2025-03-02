# Data Whisperer Technical Overview - Part 1: Architecture & Frontend Core

## 1. Project Architecture Overview

Data Whisperer is a comprehensive data analysis and transformation platform built with a modern tech stack:

### 1.1 Technology Stack

- **Frontend**:
  - React with TypeScript (TSX)
  - Vite for build tooling
  - Mantine UI for components
  - ReactFlow for workflow visualization
  - Framer Motion for animations
  - GraphQL client for some API requests
  - Axios for REST API requests

- **Backend**:
  - FastAPI (Python) for the primary API framework
  - SQLAlchemy ORM for database operations
  - PostgreSQL for persistent data storage
  - Alembic for database migrations
  - JWT for authentication

- **Containerization**:
  - Docker for application containerization
  - docker-compose for multi-container management

### 1.2 Application Architecture

The application follows a client-server architecture with:

- Decoupled frontend and backend services
- REST API for primary communication
- GraphQL for specific data-intensive operations
- Microservices approach for specialized functions (Kaggle integration, workflow engine)
- Database persistence layer with PostgreSQL
- File-based storage for datasets and temporary files

### 1.3 Core Subsystems

1. **Authentication & User Management**
   - JWT-based authentication
   - Role-based access control
   - User profiles and preferences

2. **Dataset Management**
   - Dataset upload, storage, and organization
   - Dataset metadata tracking
   - Dataset previewing and exploration

3. **Workflow Engine**
   - Visual workflow builder
   - Node-based processing pipeline
   - Execution engine for data transformations

4. **Kaggle Integration**
   - Dataset discovery and search
   - Dataset download and import
   - Local dataset management

5. **AI & Analysis**
   - AI-powered data insights
   - Automated data quality checks
   - Visualization recommendations

## 2. Frontend Core Structure

### 2.1 Entry Points & Configuration

#### 2.1.1 Main Application Entry

- **frontend/src/main.tsx** - PRIMARY ACTIVE
  - Entry point for the React application
  - Imports: React, ReactDOM, App component, global styles
  - Renders the root application component
  - Called by: Vite build process when the application starts

- **frontend/src/App.tsx** - PRIMARY ACTIVE
  - Main application component
  - Imports: React, router, theme, context providers
  - Wraps the application with necessary providers
  - Renders the router component
  - Called by: main.tsx
  - Calls: router.tsx, context providers

- **frontend/src/router.tsx** - PRIMARY ACTIVE
  - Central routing configuration
  - Imports: React Router, layout components, page components
  - Defines: Public routes, protected routes
  - Implements: AuthGuard, GuestGuard for route protection
  - Called by: App.tsx
  - Calls: Layout components, page components

- **frontend/src/routes/index.tsx** - SECONDARY ACTIVE
  - Alternative/supporting router configuration
  - Imports: React Router
  - Used by: Some parts of the application for specific routing
  - Called by: Specific page components

#### 2.1.2 Configuration Files

- **frontend/src/config/api.ts** - PRIMARY ACTIVE
  - API configuration settings
  - Defines: API base URL, timeout settings, headers
  - Used by: api/index.ts

- **frontend/src/config/agents.ts** - ACTIVE
  - Configuration for AI agents
  - Defines: Agent types, capabilities, endpoints
  - Used by: AI-related components

- **frontend/src/theme.ts**, **frontend/src/styles/theme.ts** - PRIMARY ACTIVE
  - Application theming configuration
  - Defines: Color schemes, spacing, typography, breakpoints
  - Used by: App.tsx, component styling

### 2.2 Core Layout Structure

#### 2.2.1 Layout Components

- **frontend/src/layouts/ProtectedLayout.tsx** - PRIMARY ACTIVE
  - Layout for authenticated routes
  - Imports: React, Layout components, AuthContext
  - Features: Authentication checking, navigation sidebar, header
  - Called by: router.tsx for protected routes
  - Calls: Header, Sidebar, Footer components

- **frontend/src/layouts/PublicLayout.tsx** - PRIMARY ACTIVE
  - Layout for public/unauthenticated routes
  - Imports: React, Layout components
  - Features: Simplified header, footer
  - Called by: router.tsx for public routes
  - Calls: Header, Footer components (simplified versions)

- **frontend/src/components/Layout/AppLayout.tsx** - PRIMARY ACTIVE
  - General application layout wrapper
  - Imports: React, Mantine components
  - Features: Consistent page structure
  - Called by: Both layout components and some pages directly
  - Calls: Header, Sidebar, main content rendering

- **frontend/src/components/Layout/Header.tsx** - PRIMARY ACTIVE
  - Application header component
  - Imports: React, Mantine components, Logo
  - Features: Navigation, user menu, search
  - Called by: AppLayout.tsx
  - Calls: Logo, navigation components, user menu

- **frontend/src/components/Layout/Sidebar.tsx** - PRIMARY ACTIVE
  - Navigation sidebar component
  - Imports: React, Mantine components
  - Features: Main navigation menu, collapsible sections
  - Called by: AppLayout.tsx, ProtectedLayout.tsx
  - Calls: NavMenu, navigation items

- **frontend/src/components/Layout/Footer.tsx** - PRIMARY ACTIVE
  - Application footer component
  - Imports: React, Mantine components
  - Features: Links, copyright, social icons
  - Called by: Layout components
  - Calls: Social icon components

#### 2.2.2 Navigation Components

- **frontend/src/components/NavBar.tsx** - PRIMARY ACTIVE
  - Top navigation bar
  - Imports: React, Mantine components
  - Features: Main navigation links, responsive design
  - Called by: Some page components, layout components

- **frontend/src/components/navigation/NavMenu.tsx** - PRIMARY ACTIVE
  - Navigation menu component
  - Imports: React, Mantine components
  - Features: Dynamic menu generation
  - Called by: Sidebar.tsx
  - Calls: Router navigation functions

### 2.3 Core UI Components

- **frontend/src/components/ui/Logo.tsx** - PRIMARY ACTIVE
  - Application logo component
  - Imports: React, IconBrain
  - Features: Consistent branding
  - Called by: Header, Footer, LandingPage

- **frontend/src/components/ui/Card.tsx** - PRIMARY ACTIVE
  - Enhanced card component
  - Imports: React, Mantine Card
  - Features: Consistent styling, additional functionality
  - Called by: Various page components

- **frontend/src/components/ui/ErrorBoundary.tsx** - PRIMARY ACTIVE
  - Error handling component
  - Imports: React error boundary
  - Features: Graceful error handling
  - Called by: App.tsx, some page components

- **frontend/src/components/ui/PageHeader.tsx** - PRIMARY ACTIVE
  - Consistent page header component
  - Imports: React, Mantine components
  - Features: Title, breadcrumbs, actions
  - Called by: Various page components

- **frontend/src/components/ui/IconWrapper.tsx** - PRIMARY ACTIVE
  - Icon wrapper for consistent sizing/styling
  - Imports: React
  - Features: Standardized icon display
  - Called by: Various components using icons

### 2.4 Styling and Themes

- **frontend/src/index.css** - PRIMARY ACTIVE
  - Global CSS styles
  - Features: Base styling, CSS variables, resets
  - Imported by: main.tsx

- **frontend/src/App.css** - PRIMARY ACTIVE
  - App-specific styles
  - Features: Component styling specific to App
  - Imported by: App.tsx

- **frontend/src/styles/global.css**, **frontend/src/styles/globals.css** - PRIMARY ACTIVE
  - Additional global styles
  - Features: Utility classes, global overrides
  - Imported by: various components

- **frontend/src/utils/animations.ts** - PRIMARY ACTIVE
  - Animation utility functions
  - Features: Reusable animation configurations
  - Used by: Components with animations

## 3. API & Backend Integration

### 3.1 API Client

- **frontend/src/api/index.ts** - PRIMARY ACTIVE
  - Central API client
  - Imports: axios, GraphQL client libraries
  - Features:
    - Axios instance configuration
    - Request/response interceptors
    - Authentication header management
    - Error handling with status codes (401, 404, etc.)
    - TypeScript interfaces for data models
  - Called by: Components and services requiring API access
  - Calls: Backend API endpoints

### 3.2 Service Modules

- **frontend/src/services/fileService.ts** - PRIMARY ACTIVE
  - File upload and management service
  - Imports: API client
  - Features: File upload, download, listing
  - Called by: File-related components
  - Calls: API file endpoints

- **frontend/src/services/kaggle.ts** - PRIMARY ACTIVE
  - Kaggle integration service
  - Imports: API client
  - Features: Dataset search, download, management
  - Called by: Kaggle-related components
  - Calls: API Kaggle endpoints

- **frontend/src/services/workflow.ts**, **frontend/src/services/workflowService.ts** - PRIMARY ACTIVE
  - Workflow management services
  - Imports: API client, workflow types
  - Features: Workflow CRUD operations, execution
  - Called by: Workflow-related components
  - Calls: API workflow endpoints

- **frontend/src/services/ai/AIContextProvider.tsx** - ACTIVE
  - AI service context provider
  - Imports: React, API client
  - Features: AI capabilities throughout the app
  - Called by: Components requiring AI features
  - Calls: API AI endpoints 