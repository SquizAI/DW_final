#!/bin/bash

# track_file_changes.sh
# Script to track file changes and update application hierarchy documentation

# Configuration
PROJECT_ROOT="$(pwd)"
DOCS_DIR="${PROJECT_ROOT}/docs"
HIERARCHY_FILE="${DOCS_DIR}/APPLICATION_HIERARCHY.md"
CHANGES_LOG="${DOCS_DIR}/CHANGES_LOG.md"

# Create docs directory if it doesn't exist
mkdir -p "${DOCS_DIR}"

# Initialize hierarchy file if it doesn't exist
if [ ! -f "${HIERARCHY_FILE}" ]; then
  echo "# Application Hierarchy" > "${HIERARCHY_FILE}"
  echo "" >> "${HIERARCHY_FILE}"
  echo "This document provides an overview of the application's file structure and organization." >> "${HIERARCHY_FILE}"
  echo "" >> "${HIERARCHY_FILE}"
  echo "Last updated: $(date)" >> "${HIERARCHY_FILE}"
  echo "" >> "${HIERARCHY_FILE}"
fi

# Initialize changes log if it doesn't exist
if [ ! -f "${CHANGES_LOG}" ]; then
  echo "# Changes Log" > "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  echo "This document tracks changes made to the application." >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
fi

# Function to update the hierarchy file
update_hierarchy() {
  echo "Updating application hierarchy documentation..."
  
  # Update timestamp
  sed -i '' "s/Last updated: .*/Last updated: $(date)/" "${HIERARCHY_FILE}"
  
  # Frontend structure
  echo "## Frontend Structure" > "${DOCS_DIR}/frontend_structure.md"
  echo "" >> "${DOCS_DIR}/frontend_structure.md"
  echo '```' >> "${DOCS_DIR}/frontend_structure.md"
  find "${PROJECT_ROOT}/frontend/src" -type f -not -path "*/node_modules/*" -not -path "*/\.*" | sort | sed "s|${PROJECT_ROOT}/||" >> "${DOCS_DIR}/frontend_structure.md"
  echo '```' >> "${DOCS_DIR}/frontend_structure.md"
  
  # Backend structure
  echo "## Backend Structure" > "${DOCS_DIR}/backend_structure.md"
  echo "" >> "${DOCS_DIR}/backend_structure.md"
  echo '```' >> "${DOCS_DIR}/backend_structure.md"
  find "${PROJECT_ROOT}/backend" -type f -not -path "*/node_modules/*" -not -path "*/\.*" -not -path "*/venv/*" -not -path "*/__pycache__/*" | sort | sed "s|${PROJECT_ROOT}/||" >> "${DOCS_DIR}/backend_structure.md"
  echo '```' >> "${DOCS_DIR}/backend_structure.md"
  
  # Combine structures
  cat "${DOCS_DIR}/frontend_structure.md" "${DOCS_DIR}/backend_structure.md" > "${DOCS_DIR}/temp_hierarchy.md"
  
  # Update main hierarchy file (preserving the header)
  head -5 "${HIERARCHY_FILE}" > "${DOCS_DIR}/temp_header.md"
  cat "${DOCS_DIR}/temp_header.md" "${DOCS_DIR}/temp_hierarchy.md" > "${HIERARCHY_FILE}"
  
  # Clean up temporary files
  rm "${DOCS_DIR}/frontend_structure.md" "${DOCS_DIR}/backend_structure.md" "${DOCS_DIR}/temp_hierarchy.md" "${DOCS_DIR}/temp_header.md"
  
  echo "Hierarchy documentation updated."
}

# Function to log a new file
log_new_file() {
  local file_path="$1"
  local file_type="$2"
  local description="$3"
  
  echo "## $(date): New ${file_type} - ${file_path}" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  echo "**Description:** ${description}" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  echo "**Path:** \`${file_path}\`" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  
  echo "Logged new file: ${file_path}"
}

# Function to log a modified file
log_modified_file() {
  local file_path="$1"
  local description="$2"
  
  echo "## $(date): Modified - ${file_path}" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  echo "**Description:** ${description}" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  echo "**Path:** \`${file_path}\`" >> "${CHANGES_LOG}"
  echo "" >> "${CHANGES_LOG}"
  
  echo "Logged modified file: ${file_path}"
}

# Main function to track a file change
track_file_change() {
  local file_path="$1"
  local change_type="$2"  # "new" or "modified"
  local file_type="$3"    # "component", "utility", "api", etc.
  local description="$4"
  
  if [ "${change_type}" = "new" ]; then
    log_new_file "${file_path}" "${file_type}" "${description}"
  elif [ "${change_type}" = "modified" ]; then
    log_modified_file "${file_path}" "${description}"
  else
    echo "Error: Invalid change type. Use 'new' or 'modified'."
    exit 1
  fi
  
  # Update the hierarchy documentation
  update_hierarchy
}

# Check if the script is being called with arguments
if [ $# -ge 3 ]; then
  track_file_change "$@"
else
  # If no arguments, just update the hierarchy
  update_hierarchy
fi

echo "File tracking complete." 