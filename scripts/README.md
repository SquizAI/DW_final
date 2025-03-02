# Data Whisperer Scripts

This directory contains utility scripts for the Data Whisperer project.

## Documentation Scripts

### auto_update_docs.sh

This script automatically generates documentation for the project based on the codebase.

#### Usage

```bash
./scripts/auto_update_docs.sh
```

#### What it does

- Generates documentation for frontend components
- Generates documentation for frontend features
- Generates documentation for API modules
- Generates documentation for backend modules
- Creates a main documentation index

#### Output

Documentation is generated in the `docs` directory with the following structure:

```
docs/
├── README.md                  # Main documentation index
├── components/                # Component documentation
├── features/                  # Feature documentation
├── api/                       # API documentation
└── backend/                   # Backend documentation
```

### watch_and_update.sh

This script watches for file changes and automatically updates the documentation.

#### Prerequisites

This script requires `fswatch` to be installed:

- On macOS: `brew install fswatch`
- On Ubuntu: `sudo apt-get install fswatch`

#### Usage

```bash
./scripts/watch_and_update.sh
```

#### What it does

- Watches for changes in the `frontend/src` and `backend/app` directories
- Automatically runs `auto_update_docs.sh` when changes are detected
- Provides real-time documentation updates as you code

#### Stopping the script

Press `Ctrl+C` to stop watching for changes.

## Adding to Git Hooks (Optional)

You can add the documentation update script to your Git pre-commit hook to ensure documentation is always up-to-date:

1. Create or edit `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Run documentation update script
./scripts/auto_update_docs.sh

# Add generated documentation to the commit
git add docs/

# Continue with the commit
exit 0
```

2. Make the hook executable:

```bash
chmod +x .git/hooks/pre-commit
```

This will automatically update the documentation before each commit. 