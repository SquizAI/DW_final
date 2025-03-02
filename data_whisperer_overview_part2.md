# Data Whisperer Technical Overview - Part 2: Frontend Pages & Features

## 4. Frontend Pages

### 4.1 Public Pages

- **frontend/src/pages/LandingPage.tsx** - PRIMARY ACTIVE
  - Main landing page for unauthenticated users
  - Imports: React, Mantine components, MatrixBackground, animations
  - Features:
    - Interactive sections with smooth scrolling
    - Animated background effects
    - Feature highlights and call-to-action
    - Integration with animations and visual effects
  - Called by: router.tsx (public routes)
  - Calls: MatrixBackground, navigation functions

- **frontend/src/pages/LoginPage.tsx** - PRIMARY ACTIVE
  - User login interface
  - Imports: React, Mantine components, AuthContext
  - Features: 
    - Login form with validation
    - Error handling for authentication
    - Social login options
    - Password reset link
  - Called by: router.tsx (public routes)
  - Calls: AuthContext login functions, navigation redirects

- **frontend/src/pages/RegisterPage.tsx** - PRIMARY ACTIVE
  - User registration interface
  - Imports: React, Mantine components, AuthContext
  - Features:
    - Registration form with validation
    - Terms and conditions acceptance
    - Email verification process
  - Called by: router.tsx (public routes)
  - Calls: AuthContext registration functions

- **frontend/src/pages/ForgotPasswordPage.tsx** - PRIMARY ACTIVE
  - Password recovery request
  - Imports: React, Mantine components, AuthContext
  - Features: 
    - Email input for password reset
    - Success/error notifications
  - Called by: router.tsx (public routes)
  - Calls: AuthContext password recovery functions

- **frontend/src/pages/ResetPasswordPage.tsx** - PRIMARY ACTIVE
  - Password reset interface
  - Imports: React, Mantine components, AuthContext
  - Features:
    - Token validation
    - New password form with confirmation
    - Password strength requirements
  - Called by: router.tsx (public routes)
  - Calls: AuthContext password reset functions

### 4.2 Core Application Pages

- **frontend/src/pages/Dashboard.tsx**, **frontend/src/pages/Dashboard/index.tsx** - PRIMARY ACTIVE
  - Main dashboard for authenticated users
  - Imports: React, Mantine components, various dashboard components
  - Features:
    - Data summary cards
    - Recent activities
    - Quick access to key features
    - Personalized recommendations
  - Called by: router.tsx (protected routes)
  - Calls: Various dashboard components, API data fetching

- **frontend/src/pages/DataUploadPage.tsx** - PRIMARY ACTIVE
  - Data upload interface
  - Imports: React, FileUpload component, fileService
  - Features:
    - File drag and drop
    - Upload progress tracking
    - File validation
    - Multiple file handling
  - Called by: router.tsx (protected routes)
  - Calls: FileUpload component, fileService functions

- **frontend/src/pages/KaggleManagerPage.tsx** - PRIMARY ACTIVE
  - Kaggle dataset management
  - Imports: React, KaggleExplorer, KaggleDatasetBrowser
  - Features:
    - Search Kaggle datasets
    - Browse and filter results
    - Download datasets
    - Manage local Kaggle datasets
  - Called by: router.tsx (protected routes)
  - Calls: KaggleExplorer, API Kaggle endpoints

- **frontend/src/pages/WorkflowBuilderPage.tsx** - PRIMARY ACTIVE
  - Workflow creation interface
  - Imports: React, WorkflowBuilder components
  - Features:
    - Visual node-based workflow editor
    - Node configuration panels
    - Workflow execution
    - Workflow saving/loading
  - Called by: router.tsx (protected routes)
  - Calls: WorkflowBuilder, workflow context functions

- **frontend/src/pages/DataWranglingPage.tsx** - PRIMARY ACTIVE
  - Data preparation and transformation
  - Imports: React, data wrangling components
  - Features:
    - Data cleaning operations
    - Column management
    - Data filtering and transformation
  - Called by: router.tsx (protected routes)
  - Calls: Wrangling feature components, API endpoints

- **frontend/src/pages/DataAnalysisPage.tsx** - PRIMARY ACTIVE
  - Data analysis interface
  - Imports: React, analysis components
  - Features:
    - Data exploration tools
    - Statistical analysis
    - Visualization creation
  - Called by: router.tsx (protected routes)
  - Calls: Analysis feature components, API endpoints

- **frontend/src/pages/VisualizationsPage.tsx** - PRIMARY ACTIVE
  - Data visualization hub
  - Imports: React, visualization components
  - Features:
    - Chart gallery
    - Interactive visualization creation
    - Visualization export
  - Called by: router.tsx (protected routes)
  - Calls: Visualization components, API endpoints

### 4.3 Specialized Pages

- **frontend/src/pages/CodeNotebook.tsx** - ACTIVE
  - Interactive code notebook
  - Imports: React, CodeEditor component
  - Features:
    - Code execution environment
    - Cell-based editing
    - Results display
  - Called by: router.tsx (protected routes)
  - Calls: CodeEditor component, API code execution endpoints

- **frontend/src/pages/AIInsightsPage.tsx** - ACTIVE
  - AI-powered insights
  - Imports: React, AI components
  - Features:
    - Automated data insights
    - AI recommendations
    - Natural language queries
  - Called by: router.tsx (protected routes)
  - Calls: AI components, API AI endpoints

- **frontend/src/pages/ProfilePage.tsx** - ACTIVE
  - User profile management
  - Imports: React, Mantine components, AuthContext
  - Features:
    - Profile information editing
    - Password changing
    - Notification settings
  - Called by: router.tsx (protected routes)
  - Calls: AuthContext functions, API user endpoints

- **frontend/src/pages/SettingsPage.tsx** - ACTIVE
  - Application settings
  - Imports: React, Mantine components
  - Features:
    - Theme selection
    - Language settings
    - Application preferences
  - Called by: router.tsx (protected routes)
  - Calls: Settings context functions, API settings endpoints

### 4.4 Domain-Specific Pages

- **frontend/src/pages/analysis/**.* - ACTIVE
  - Analysis-focused pages
  - Contains: AI.tsx, Explore.tsx, Visualize.tsx
  - Features: Specialized analysis interfaces

- **frontend/src/pages/automation/**.* - ACTIVE
  - Automation-focused pages
  - Contains: Classify.tsx, Workflows.tsx
  - Features: Specialized automation interfaces

- **frontend/src/pages/data/**.* - ACTIVE
  - Data-focused pages
  - Contains: Binning.tsx, Integration.tsx, Wrangling.tsx
  - Features: Specialized data management interfaces

- **frontend/src/pages/export/**.* - ACTIVE
  - Export-focused pages
  - Contains: Data.tsx, Report.tsx
  - Features: Data and report export interfaces

- **frontend/src/pages/features/**.* - ACTIVE
  - Feature engineering pages
  - Contains: Engineering.tsx, Importance.tsx
  - Features: Feature manipulation interfaces

## 5. Key Frontend Features

### 5.1 Authentication System

- **frontend/src/contexts/AuthContext.tsx** - PRIMARY ACTIVE
  - Authentication context provider
  - Imports: React context, API services
  - Features:
    - User authentication state management
    - Login/logout functions
    - Registration functions
    - Password reset functions
    - Token management
  - Called by: App.tsx (provider wrapping)
  - Used by: Layout components, authentication guards, pages requiring auth

### 5.2 File Management

- **frontend/src/components/FileUpload.tsx** - PRIMARY ACTIVE
  - File upload component
  - Imports: React, Mantine components, fileService
  - Features:
    - Drag and drop functionality
    - Multi-file upload
    - Progress tracking
    - File validation
  - Called by: DataUploadPage.tsx, other pages requiring uploads
  - Calls: fileService functions, API file endpoints

- **frontend/src/contexts/FileContext.tsx** - PRIMARY ACTIVE
  - File context provider
  - Imports: React context, fileService
  - Features:
    - File state management
    - File operation functions
    - Upload tracking
  - Called by: App.tsx or specific page wrappers
  - Used by: Components requiring file operations

### 5.3 Kaggle Integration

- **frontend/src/components/KaggleExplorer.tsx** - PRIMARY ACTIVE
  - Kaggle dataset explorer
  - Imports: React, Mantine components, kaggle service
  - Features:
    - Search interface for Kaggle datasets
    - Results filtering
    - Dataset previews
    - Download functionality
  - Called by: KaggleManagerPage.tsx
  - Calls: kaggle service functions, API Kaggle endpoints

- **frontend/src/components/KaggleDatasetBrowser.tsx** - PRIMARY ACTIVE
  - Local Kaggle dataset browser
  - Imports: React, Mantine components, kaggle service
  - Features:
    - Browse downloaded Kaggle datasets
    - Dataset management
    - Dataset deletion
    - Import to workflow
  - Called by: KaggleManagerPage.tsx, KaggleExplorer.tsx (in some flows)
  - Calls: kaggle service functions, API Kaggle endpoints

### 5.4 Workflow Builder

- **frontend/src/components/WorkflowBuilder.tsx**, **frontend/src/components/WorkflowBuilder/index.tsx** - PRIMARY ACTIVE
  - Main workflow builder component
  - Imports: React, ReactFlow, workflow context
  - Features:
    - Canvas for node-based workflow editing
    - Node connection management
    - Workflow execution controls
    - Workflow save/load
  - Called by: WorkflowBuilderPage.tsx
  - Calls: Workflow node components, workflow service functions

- **frontend/src/features/workflow/WorkflowContext.tsx** - PRIMARY ACTIVE
  - Workflow state management
  - Imports: React context, workflow service
  - Features:
    - Workflow state management
    - Node management functions
    - Workflow operation functions
  - Called by: WorkflowBuilderPage.tsx (provider wrapping)
  - Used by: All workflow-related components

- **frontend/src/features/workflow/WorkflowCanvas.tsx** - PRIMARY ACTIVE
  - ReactFlow canvas for workflow
  - Imports: React, ReactFlow, workflow context
  - Features:
    - Canvas rendering and interaction
    - Node placement and connection
    - Panning and zooming
  - Called by: WorkflowBuilder component
  - Calls: Node components, workflow context functions

- **frontend/src/features/workflow/nodes/**.* - PRIMARY ACTIVE
  - Individual node type implementations
  - Various files for different node types (analysis, transformation, etc.)
  - Features:
    - Node-specific UI and behavior
    - Node configuration interfaces
    - Node execution logic
  - Called by: WorkflowCanvas.tsx
  - Calls: Workflow context functions, specific API endpoints

### 5.5 Data Analysis & Visualization

- **frontend/src/features/workflow/DataPreview.tsx** - PRIMARY ACTIVE
  - Data preview component
  - Imports: React, Mantine components
  - Features:
    - Tabular data display
    - Pagination
    - Column sorting and filtering
    - Basic statistics
  - Called by: Various data-handling components
  - Calls: API data preview endpoints

- **frontend/src/features/workflow/DataVisualizationPanel.tsx** - PRIMARY ACTIVE
  - Visualization creation panel
  - Imports: React, visualization libraries
  - Features:
    - Chart type selection
    - Data mapping to visual elements
    - Visualization customization
    - Export options
  - Called by: WorkflowBuilderPage.tsx, VisualizationsPage.tsx
  - Calls: API visualization endpoints

- **frontend/src/features/workflow/DataQualityPanel.tsx** - ACTIVE
  - Data quality assessment
  - Imports: React, Mantine components
  - Features:
    - Data quality metrics
    - Issue detection
    - Automated fixes
  - Called by: Data wrangling pages, workflow pages
  - Calls: API data quality endpoints

### 5.6 AI Integration

- **frontend/src/components/AIAssistant/AIAssistant.tsx** - PRIMARY ACTIVE
  - AI assistant component
  - Imports: React, Mantine components, AI service
  - Features:
    - Natural language interface
    - Context-aware suggestions
    - Task automation
  - Called by: Various pages requiring AI assistance
  - Calls: API AI endpoints

- **frontend/src/features/AIWorkflow/AIWorkflowChat.tsx** - PRIMARY ACTIVE
  - AI chat for workflow assistance
  - Imports: React, Mantine components, AI service, workflow context
  - Features:
    - Workflow-specific AI assistance
    - Workflow suggestions
    - Natural language workflow creation
  - Called by: WorkflowBuilderPage.tsx
  - Calls: API AI endpoints, workflow context functions

- **frontend/src/components/AIToolGarden.tsx** - ACTIVE
  - Collection of AI tools
  - Imports: React, various AI components
  - Features:
    - AI tool discovery and access
    - Tool categories and filtering
  - Called by: Pages requiring AI tool access
  - Calls: Various AI components

### 5.7 Visual Effects & Animation

- **frontend/src/components/MatrixBackground.tsx** - PRIMARY ACTIVE
  - Matrix-style background animation
  - Imports: React, canvas manipulation
  - Features:
    - Animated digital rain effect
    - Performance optimization
    - Customization options
  - Called by: LandingPage.tsx, some UI elements
  - Used for: Visual theming

- **frontend/src/components/MatrixRain.tsx**, **frontend/src/components/MiamiMatrixRain.tsx**, **frontend/src/components/MiamiMatrixRain3D.tsx** - ACTIVE
  - Variations of matrix-style animations
  - Imports: React, Three.js (for 3D version)
  - Features:
    - Different visual styles of matrix animations
    - 3D effects (MiamiMatrixRain3D)
  - Called by: Various pages for visual effects
  - Used for: Visual theming

- **frontend/src/components/MatrixCorridor.tsx** - ACTIVE
  - 3D corridor animation
  - Imports: React, Three.js
  - Features:
    - Matrix-themed 3D corridor effect
    - Camera movement
  - Called by: Some pages for immersive backgrounds
  - Used for: Visual theming 