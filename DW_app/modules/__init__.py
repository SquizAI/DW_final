"""
Data Wrangling Suite Modules Package
"""

__version__ = "1.0.0"

# Import all module functions
from .home import home_page
from .data_upload import data_upload_page
from .data_integration import data_integration_page
from .data_wrangling import data_wrangling_page
from .data_binning import data_binning_page
from .lambda_feature_engineering import lambda_feature_engineering_page
from .data_analysis import data_analysis_page
from .feature_importance import feature_importance_page
from .ai_insights import ai_insights_page
from .classification import classification_page
from .data_export import data_export_page
from .final_report import final_report_page

# Import utility functions
from .utils import (
    create_module_header,
    create_3d_scatter,
    create_correlation_heatmap,
    create_pca_visualization,
    analyze_dataset,
    review_data,
    log_activity,
    log_error
)

# Export all page functions and utilities
__all__ = [
    'home_page',
    'data_upload_page',
    'data_integration_page',
    'data_wrangling_page',
    'data_binning_page',
    'lambda_feature_engineering_page',
    'data_analysis_page',
    'feature_importance_page',
    'ai_insights_page',
    'classification_page',
    'data_export_page',
    'final_report_page',
    # Utility functions
    'create_module_header',
    'create_3d_scatter',
    'create_correlation_heatmap',
    'create_pca_visualization',
    'analyze_dataset',
    'review_data',
    'log_activity',
    'log_error'
] 