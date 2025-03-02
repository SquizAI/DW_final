"""
Visualization Processor Module

This module defines the VisualizationProcessor class for handling data visualization operations.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
import json
import base64
from io import BytesIO
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from matplotlib.figure import Figure

from ..node_processor import NodeProcessor
from ..exceptions import NodeExecutionError, DataValidationError
from ..data_manager import DataManager

logger = logging.getLogger(__name__)

class VisualizationProcessor(NodeProcessor):
    """
    Processor for visualization nodes.
    
    Handles various visualization types:
    - Bar charts
    - Line charts
    - Scatter plots
    - Histograms
    - Box plots
    - Heatmaps
    - Pie charts
    - Correlation matrices
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the VisualizationProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        super().__init__(node_id, node_config)
        
        # Extract visualization type from config
        self.visualization_type = node_config.get("visualization_type", "bar")
        
        # Common options
        self.title = node_config.get("title", "")
        self.x_label = node_config.get("x_label", "")
        self.y_label = node_config.get("y_label", "")
        self.x_column = node_config.get("x_column", "")
        self.y_column = node_config.get("y_column", "")
        self.color_column = node_config.get("color_column", "")
        self.size_column = node_config.get("size_column", "")
        self.category_column = node_config.get("category_column", "")
        self.columns = node_config.get("columns", [])
        self.figsize = node_config.get("figsize", (10, 6))
        self.palette = node_config.get("palette", "viridis")
        self.style = node_config.get("style", "darkgrid")
        self.orientation = node_config.get("orientation", "vertical")
        self.stacked = node_config.get("stacked", False)
        self.normalize = node_config.get("normalize", False)
        self.cumulative = node_config.get("cumulative", False)
        self.bins = node_config.get("bins", 10)
        self.kde = node_config.get("kde", False)
        self.legend = node_config.get("legend", True)
        self.grid = node_config.get("grid", True)
        self.dpi = node_config.get("dpi", 100)
        self.format = node_config.get("format", "png")
        
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the visualization node.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary with visualization results
        """
        self.update_progress(10, "starting visualization")
        
        # Get input dataframe
        if "default" not in input_data:
            raise NodeExecutionError(
                message="No input data provided",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        df = input_data["default"]
        
        if not isinstance(df, pd.DataFrame):
            raise NodeExecutionError(
                message=f"Input data is not a DataFrame: {type(df).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        self.update_progress(20, "creating visualization")
        
        try:
            # Set seaborn style
            sns.set_style(self.style)
            
            # Create visualization based on type
            if self.visualization_type == "bar":
                fig, image_data, metadata = self._create_bar_chart(df)
            elif self.visualization_type == "line":
                fig, image_data, metadata = self._create_line_chart(df)
            elif self.visualization_type == "scatter":
                fig, image_data, metadata = self._create_scatter_plot(df)
            elif self.visualization_type == "histogram":
                fig, image_data, metadata = self._create_histogram(df)
            elif self.visualization_type == "box":
                fig, image_data, metadata = self._create_box_plot(df)
            elif self.visualization_type == "heatmap":
                fig, image_data, metadata = self._create_heatmap(df)
            elif self.visualization_type == "pie":
                fig, image_data, metadata = self._create_pie_chart(df)
            elif self.visualization_type == "correlation":
                fig, image_data, metadata = self._create_correlation_matrix(df)
            else:
                raise NodeExecutionError(
                    message=f"Unsupported visualization type: {self.visualization_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            self.update_progress(90, "visualization created")
            
            # Clean up
            plt.close(fig)
            
            return {
                "default": df,
                "image": image_data,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.exception(f"Error creating visualization in node {self.node_id}")
            raise NodeExecutionError(
                message=f"Error creating visualization: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _create_bar_chart(self, df: pd.DataFrame) -> tuple:
        """
        Create a bar chart.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.x_column or self.x_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid x column: {self.x_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create bar chart
        if self.y_column and self.y_column in df.columns:
            # If y column is specified, use it
            if self.category_column and self.category_column in df.columns:
                # Grouped bar chart
                pivot_df = df.pivot(index=self.x_column, columns=self.category_column, values=self.y_column)
                pivot_df.plot(kind='bar', ax=ax, stacked=self.stacked)
            else:
                # Simple bar chart
                sns.barplot(x=self.x_column, y=self.y_column, data=df, ax=ax, palette=self.palette)
        else:
            # If no y column, use value counts of x column
            value_counts = df[self.x_column].value_counts()
            value_counts.plot(kind='bar', ax=ax)
        
        # Set labels and title
        ax.set_xlabel(self.x_label or self.x_column)
        ax.set_ylabel(self.y_label or self.y_column or "Count")
        ax.set_title(self.title or f"Bar Chart of {self.x_column}")
        
        # Show grid if specified
        ax.grid(self.grid)
        
        # Rotate x-axis labels if there are many categories
        if len(df[self.x_column].unique()) > 5:
            plt.xticks(rotation=45, ha='right')
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "bar",
            "x_column": self.x_column,
            "y_column": self.y_column,
            "category_column": self.category_column,
            "stacked": self.stacked,
            "title": self.title,
            "x_label": self.x_label,
            "y_label": self.y_label
        }
        
        return fig, image_data, metadata
    
    def _create_line_chart(self, df: pd.DataFrame) -> tuple:
        """
        Create a line chart.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.x_column or self.x_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid x column: {self.x_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        if not self.y_column or self.y_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid y column: {self.y_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create line chart
        if self.category_column and self.category_column in df.columns:
            # Multiple lines by category
            for category, group in df.groupby(self.category_column):
                group.plot(x=self.x_column, y=self.y_column, ax=ax, label=category)
        else:
            # Simple line chart
            df.plot(x=self.x_column, y=self.y_column, ax=ax)
        
        # Set labels and title
        ax.set_xlabel(self.x_label or self.x_column)
        ax.set_ylabel(self.y_label or self.y_column)
        ax.set_title(self.title or f"Line Chart of {self.y_column} vs {self.x_column}")
        
        # Show grid if specified
        ax.grid(self.grid)
        
        # Show legend if specified
        if self.legend:
            ax.legend()
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "line",
            "x_column": self.x_column,
            "y_column": self.y_column,
            "category_column": self.category_column,
            "title": self.title,
            "x_label": self.x_label,
            "y_label": self.y_label
        }
        
        return fig, image_data, metadata
    
    def _create_scatter_plot(self, df: pd.DataFrame) -> tuple:
        """
        Create a scatter plot.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.x_column or self.x_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid x column: {self.x_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        if not self.y_column or self.y_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid y column: {self.y_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create scatter plot
        if self.color_column and self.color_column in df.columns:
            scatter = ax.scatter(
                x=df[self.x_column],
                y=df[self.y_column],
                c=df[self.color_column] if pd.api.types.is_numeric_dtype(df[self.color_column]) else None,
                s=df[self.size_column] if self.size_column and self.size_column in df.columns else None,
                alpha=0.7
            )
            
            # Add color bar if color column is numeric
            if pd.api.types.is_numeric_dtype(df[self.color_column]):
                plt.colorbar(scatter, ax=ax, label=self.color_column)
            else:
                # If color column is categorical, use a categorical plot
                sns.scatterplot(
                    x=self.x_column,
                    y=self.y_column,
                    hue=self.color_column,
                    size=self.size_column if self.size_column and self.size_column in df.columns else None,
                    data=df,
                    ax=ax,
                    palette=self.palette
                )
        else:
            ax.scatter(x=df[self.x_column], y=df[self.y_column], alpha=0.7)
        
        # Set labels and title
        ax.set_xlabel(self.x_label or self.x_column)
        ax.set_ylabel(self.y_label or self.y_column)
        ax.set_title(self.title or f"Scatter Plot of {self.y_column} vs {self.x_column}")
        
        # Show grid if specified
        ax.grid(self.grid)
        
        # Show legend if specified and applicable
        if self.legend and self.color_column and not pd.api.types.is_numeric_dtype(df[self.color_column]):
            ax.legend()
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "scatter",
            "x_column": self.x_column,
            "y_column": self.y_column,
            "color_column": self.color_column,
            "size_column": self.size_column,
            "title": self.title,
            "x_label": self.x_label,
            "y_label": self.y_label
        }
        
        return fig, image_data, metadata
    
    def _create_histogram(self, df: pd.DataFrame) -> tuple:
        """
        Create a histogram.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.x_column or self.x_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid column: {self.x_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create histogram
        if self.category_column and self.category_column in df.columns:
            # Multiple histograms by category
            for category, group in df.groupby(self.category_column):
                sns.histplot(
                    data=group,
                    x=self.x_column,
                    bins=self.bins,
                    kde=self.kde,
                    label=category,
                    ax=ax,
                    alpha=0.5,
                    cumulative=self.cumulative
                )
            
            if self.legend:
                ax.legend()
        else:
            # Simple histogram
            sns.histplot(
                data=df,
                x=self.x_column,
                bins=self.bins,
                kde=self.kde,
                ax=ax,
                cumulative=self.cumulative
            )
        
        # Set labels and title
        ax.set_xlabel(self.x_label or self.x_column)
        ax.set_ylabel(self.y_label or "Frequency")
        ax.set_title(self.title or f"Histogram of {self.x_column}")
        
        # Show grid if specified
        ax.grid(self.grid)
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "histogram",
            "x_column": self.x_column,
            "category_column": self.category_column,
            "bins": self.bins,
            "kde": self.kde,
            "cumulative": self.cumulative,
            "title": self.title,
            "x_label": self.x_label,
            "y_label": self.y_label
        }
        
        return fig, image_data, metadata
    
    def _create_box_plot(self, df: pd.DataFrame) -> tuple:
        """
        Create a box plot.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.y_column or self.y_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid y column: {self.y_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create box plot
        if self.x_column and self.x_column in df.columns:
            # Box plot grouped by x column
            sns.boxplot(x=self.x_column, y=self.y_column, data=df, ax=ax, palette=self.palette)
        else:
            # Simple box plot
            sns.boxplot(y=self.y_column, data=df, ax=ax)
        
        # Set labels and title
        if self.x_column:
            ax.set_xlabel(self.x_label or self.x_column)
        ax.set_ylabel(self.y_label or self.y_column)
        ax.set_title(self.title or f"Box Plot of {self.y_column}")
        
        # Show grid if specified
        ax.grid(self.grid)
        
        # Rotate x-axis labels if there are many categories
        if self.x_column and len(df[self.x_column].unique()) > 5:
            plt.xticks(rotation=45, ha='right')
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "box",
            "x_column": self.x_column,
            "y_column": self.y_column,
            "title": self.title,
            "x_label": self.x_label,
            "y_label": self.y_label
        }
        
        return fig, image_data, metadata
    
    def _create_heatmap(self, df: pd.DataFrame) -> tuple:
        """
        Create a heatmap.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Get columns to include in heatmap
        columns = self.columns if self.columns else df.select_dtypes(include=['number']).columns.tolist()
        
        # Filter out non-existent columns
        columns = [col for col in columns if col in df.columns]
        
        if len(columns) < 2:
            raise NodeExecutionError(
                message="At least two numeric columns are required for a heatmap",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create correlation matrix
        corr_matrix = df[columns].corr()
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create heatmap
        sns.heatmap(
            corr_matrix,
            annot=True,
            cmap=self.palette,
            linewidths=0.5,
            ax=ax,
            vmin=-1,
            vmax=1
        )
        
        # Set title
        ax.set_title(self.title or "Correlation Heatmap")
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "heatmap",
            "columns": columns,
            "title": self.title
        }
        
        return fig, image_data, metadata
    
    def _create_pie_chart(self, df: pd.DataFrame) -> tuple:
        """
        Create a pie chart.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Validate columns
        if not self.category_column or self.category_column not in df.columns:
            raise NodeExecutionError(
                message=f"Invalid category column: {self.category_column}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Get value counts
        if self.y_column and self.y_column in df.columns:
            # Use y column as values
            values = df.groupby(self.category_column)[self.y_column].sum()
        else:
            # Use counts as values
            values = df[self.category_column].value_counts()
        
        # Create pie chart
        wedges, texts, autotexts = ax.pie(
            values,
            labels=values.index,
            autopct='%1.1f%%',
            startangle=90,
            shadow=False
        )
        
        # Make text more readable
        for text in texts:
            text.set_fontsize(10)
        for autotext in autotexts:
            autotext.set_fontsize(8)
            autotext.set_color('white')
        
        # Set title
        ax.set_title(self.title or f"Pie Chart of {self.category_column}")
        
        # Equal aspect ratio ensures that pie is drawn as a circle
        ax.axis('equal')
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "pie",
            "category_column": self.category_column,
            "value_column": self.y_column,
            "title": self.title
        }
        
        return fig, image_data, metadata
    
    def _create_correlation_matrix(self, df: pd.DataFrame) -> tuple:
        """
        Create a correlation matrix visualization.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Tuple of (figure, image_data, metadata)
        """
        # Get columns to include in correlation matrix
        columns = self.columns if self.columns else df.select_dtypes(include=['number']).columns.tolist()
        
        # Filter out non-existent columns
        columns = [col for col in columns if col in df.columns]
        
        if len(columns) < 2:
            raise NodeExecutionError(
                message="At least two numeric columns are required for a correlation matrix",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Create correlation matrix
        corr_matrix = df[columns].corr()
        
        # Create figure
        fig, ax = plt.subplots(figsize=self.figsize)
        
        # Create heatmap
        mask = np.triu(np.ones_like(corr_matrix, dtype=bool))
        sns.heatmap(
            corr_matrix,
            mask=mask,
            annot=True,
            cmap=self.palette,
            linewidths=0.5,
            ax=ax,
            vmin=-1,
            vmax=1
        )
        
        # Set title
        ax.set_title(self.title or "Correlation Matrix")
        
        # Adjust layout
        fig.tight_layout()
        
        # Convert to image data
        image_data = self._fig_to_image(fig)
        
        # Create metadata
        metadata = {
            "type": "correlation",
            "columns": columns,
            "title": self.title
        }
        
        return fig, image_data, metadata
    
    def _fig_to_image(self, fig: Figure) -> str:
        """
        Convert a matplotlib figure to a base64-encoded image.
        
        Args:
            fig: Matplotlib figure
            
        Returns:
            Base64-encoded image data
        """
        buf = BytesIO()
        fig.savefig(buf, format=self.format, dpi=self.dpi)
        buf.seek(0)
        img_data = base64.b64encode(buf.read()).decode('utf-8')
        return f"data:image/{self.format};base64,{img_data}"
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        return ["default"]
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        return ["default", "image", "metadata"]
    
    def validate_inputs(self, input_data: Dict[str, Any]) -> None:
        """
        Validate the input data for this node.
        
        Args:
            input_data: Dictionary of input data
            
        Raises:
            DataValidationError: If validation fails
        """
        super().validate_inputs(input_data)
        
        # Check that input data is a DataFrame
        if "default" in input_data and not isinstance(input_data["default"], pd.DataFrame):
            raise DataValidationError(
                message=f"Input data is not a DataFrame: {type(input_data['default']).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) 