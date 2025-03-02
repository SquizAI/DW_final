#!/bin/bash

# auto_update_docs.sh
# Script to automatically update documentation when files change

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCS_DIR="${PROJECT_ROOT}/docs"
COMPONENTS_DIR="${PROJECT_ROOT}/frontend/src/components"
FEATURES_DIR="${PROJECT_ROOT}/frontend/src/features"
API_DIR="${PROJECT_ROOT}/frontend/src/api"
BACKEND_DIR="${PROJECT_ROOT}/backend"

# Create docs directory if it doesn't exist
mkdir -p "${DOCS_DIR}"
mkdir -p "${DOCS_DIR}/components"
mkdir -p "${DOCS_DIR}/features"
mkdir -p "${DOCS_DIR}/api"
mkdir -p "${DOCS_DIR}/backend"

echo "Project root: ${PROJECT_ROOT}"
echo "Docs directory: ${DOCS_DIR}"
echo "Components directory: ${COMPONENTS_DIR}"
echo "Features directory: ${FEATURES_DIR}"
echo "API directory: ${API_DIR}"
echo "Backend directory: ${BACKEND_DIR}"

# Function to generate component documentation
generate_component_docs() {
  local component_dir="$1"
  local component_name=$(basename "$component_dir")
  local doc_file="${DOCS_DIR}/components/${component_name}.md"
  
  echo "Generating documentation for component: ${component_name}"
  
  # Create or update documentation file
  cat > "$doc_file" << EOF
# ${component_name} Component

## Overview

This documentation is automatically generated for the ${component_name} component.

## Files

\`\`\`
$(find "$component_dir" -type f 2>/dev/null | sort | sed "s|${PROJECT_ROOT}/||")
\`\`\`

## Dependencies

\`\`\`
$(grep -r "import" "$component_dir" 2>/dev/null | grep -v "from './" | sort | uniq)
\`\`\`

## Usage

Check the component files for usage examples.

## Last Updated

$(date)
EOF

  echo "Documentation generated: ${doc_file}"
}

# Function to generate feature documentation
generate_feature_docs() {
  local feature_dir="$1"
  local feature_name=$(basename "$feature_dir")
  local doc_file="${DOCS_DIR}/features/${feature_name}.md"
  
  echo "Generating documentation for feature: ${feature_name}"
  
  # Create or update documentation file
  cat > "$doc_file" << EOF
# ${feature_name} Feature

## Overview

This documentation is automatically generated for the ${feature_name} feature.

## Files

\`\`\`
$(find "$feature_dir" -type f 2>/dev/null | sort | sed "s|${PROJECT_ROOT}/||")
\`\`\`

## Components

$(for comp_dir in $(find "$feature_dir" -type d -name "components" -o -name "component" 2>/dev/null); do
  find "$comp_dir" -type d -mindepth 1 -maxdepth 1 2>/dev/null | while read -r dir; do
    echo "- $(basename "$dir")"
  done
done)

## Dependencies

\`\`\`
$(grep -r "import" "$feature_dir" 2>/dev/null | grep -v "from './" | sort | uniq)
\`\`\`

## Last Updated

$(date)
EOF

  echo "Documentation generated: ${doc_file}"
}

# Function to generate API documentation
generate_api_docs() {
  local api_file="$1"
  local api_name=$(basename "$api_file" .ts)
  local doc_file="${DOCS_DIR}/api/${api_name}.md"
  
  echo "Generating documentation for API: ${api_name}"
  
  # Create or update documentation file
  cat > "$doc_file" << EOF
# ${api_name} API

## Overview

This documentation is automatically generated for the ${api_name} API.

## File

\`\`\`
${api_file#${PROJECT_ROOT}/}
\`\`\`

## Endpoints

\`\`\`
$(grep -E "export const" "$api_file" 2>/dev/null | sed 's/export const //' | sed 's/ = async.*//')
\`\`\`

## Types

\`\`\`
$(grep -E "export (interface|type)" "$api_file" -A 20 2>/dev/null | grep -v "^--$")
\`\`\`

## Last Updated

$(date)
EOF

  echo "Documentation generated: ${doc_file}"
}

# Function to generate backend documentation
generate_backend_docs() {
  local backend_module="$1"
  local module_name=$(basename "$backend_module")
  local doc_file="${DOCS_DIR}/backend/${module_name}.md"
  
  echo "Generating documentation for backend module: ${module_name}"
  
  # Create or update documentation file
  cat > "$doc_file" << EOF
# ${module_name} Backend Module

## Overview

This documentation is automatically generated for the ${module_name} backend module.

## Files

\`\`\`
$(find "$backend_module" -type f -name "*.py" 2>/dev/null | sort | sed "s|${PROJECT_ROOT}/||")
\`\`\`

## Endpoints

\`\`\`
$(grep -r "@router\." "$backend_module" 2>/dev/null | sort)
\`\`\`

## Models

\`\`\`
$(grep -r "class.*BaseModel" "$backend_module" -A 10 2>/dev/null | grep -v "^--$")
\`\`\`

## Last Updated

$(date)
EOF

  echo "Documentation generated: ${doc_file}"
}

# Function to update main documentation index
update_main_index() {
  local index_file="${DOCS_DIR}/README.md"
  
  echo "Updating main documentation index"
  
  # Create or update index file
  cat > "$index_file" << EOF
# Data Whisperer Documentation

Welcome to the automatically generated documentation for Data Whisperer.

## Components

$(find "${DOCS_DIR}/components" -type f -name "*.md" 2>/dev/null | sort | while read -r file; do
  name=$(basename "$file" .md)
  echo "- [${name}](./components/${name}.md)"
done)

## Features

$(find "${DOCS_DIR}/features" -type f -name "*.md" 2>/dev/null | sort | while read -r file; do
  name=$(basename "$file" .md)
  echo "- [${name}](./features/${name}.md)"
done)

## API

$(find "${DOCS_DIR}/api" -type f -name "*.md" 2>/dev/null | sort | while read -r file; do
  name=$(basename "$file" .md)
  echo "- [${name}](./api/${name}.md)"
done)

## Backend

$(find "${DOCS_DIR}/backend" -type f -name "*.md" 2>/dev/null | sort | while read -r file; do
  name=$(basename "$file" .md)
  echo "- [${name}](./backend/${name}.md)"
done)

## Last Updated

$(date)
EOF

  echo "Main index updated: ${index_file}"
}

# Main function
main() {
  echo "Starting documentation generation..."
  
  # Generate component documentation
  if [ -d "$COMPONENTS_DIR" ]; then
    find "$COMPONENTS_DIR" -type d -mindepth 1 -maxdepth 1 2>/dev/null | while read -r dir; do
      generate_component_docs "$dir"
    done
  else
    echo "Components directory not found: $COMPONENTS_DIR"
  fi
  
  # Generate feature documentation
  if [ -d "$FEATURES_DIR" ]; then
    find "$FEATURES_DIR" -type d -mindepth 1 -maxdepth 1 2>/dev/null | while read -r dir; do
      generate_feature_docs "$dir"
    done
  else
    echo "Features directory not found: $FEATURES_DIR"
  fi
  
  # Generate API documentation
  if [ -d "$API_DIR" ]; then
    find "$API_DIR" -type f -name "*.ts" 2>/dev/null | while read -r file; do
      generate_api_docs "$file"
    done
  else
    echo "API directory not found: $API_DIR"
  fi
  
  # Generate backend documentation
  if [ -d "$BACKEND_DIR" ]; then
    find "$BACKEND_DIR/app" -type d -mindepth 2 -maxdepth 2 2>/dev/null | while read -r dir; do
      generate_backend_docs "$dir"
    done
  else
    echo "Backend directory not found: $BACKEND_DIR"
  fi
  
  # Update main index
  update_main_index
  
  echo "Documentation generation completed."
}

# Run the main function
main 