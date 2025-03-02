"""
Data Transformation Processor Module

This module defines the DataTransformationProcessor class for handling data transformations
such as filtering, aggregation, joining, and feature engineering.
"""

import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union, Callable
import re
from datetime import datetime
from sklearn.preprocessing import StandardScaler, MinMaxScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

from ..node_processor import NodeProcessor
from ..exceptions import NodeExecutionError, DataValidationError
from ..data_manager import DataManager

logger = logging.getLogger(__name__)

class DataTransformationProcessor(NodeProcessor):
    """
    Processor for data transformation nodes.
    
    Handles various data transformations:
    - Filtering (rows and columns)
    - Aggregation
    - Joining/merging datasets
    - Feature engineering
    - Data cleaning
    - Type conversions
    - Normalization/scaling
    """
    
    def __init__(self, node_id: str, node_config: Dict[str, Any]):
        """
        Initialize the DataTransformationProcessor.
        
        Args:
            node_id: The ID of the node
            node_config: Configuration for the node
        """
        super().__init__(node_id, node_config)
        
        # Extract transformation type from config
        self.transformation_type = node_config.get("transformation_type", "filter")
        
        # Common options
        self.input_column = node_config.get("input_column", "")
        self.output_column = node_config.get("output_column", "")
        self.inplace = node_config.get("inplace", True)
        self.drop_na = node_config.get("drop_na", False)
        self.columns = node_config.get("columns", [])
        
    def execute(self, input_data: Dict[str, Any], data_manager: DataManager) -> Dict[str, Any]:
        """
        Execute the data transformation node.
        
        Args:
            input_data: Dictionary of input data
            data_manager: DataManager instance for data handling
            
        Returns:
            Dictionary with transformed data
        """
        self.update_progress(10, "starting transformation")
        
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
        
        # Create a copy if not inplace
        if not self.inplace:
            df = df.copy()
        
        self.update_progress(20, "applying transformation")
        
        try:
            # Apply transformation based on type
            if self.transformation_type == "filter_rows":
                df = self._filter_rows(df)
            elif self.transformation_type == "filter_columns":
                df = self._filter_columns(df)
            elif self.transformation_type == "rename_columns":
                df = self._rename_columns(df)
            elif self.transformation_type == "sort":
                df = self._sort_data(df)
            elif self.transformation_type == "aggregate":
                df = self._aggregate_data(df)
            elif self.transformation_type == "join":
                df = self._join_data(df, input_data)
            elif self.transformation_type == "pivot":
                df = self._pivot_data(df)
            elif self.transformation_type == "unpivot":
                df = self._unpivot_data(df)
            elif self.transformation_type == "type_conversion":
                df = self._convert_types(df)
            elif self.transformation_type == "handle_missing":
                df = self._handle_missing_values(df)
            elif self.transformation_type == "normalize":
                df = self._normalize_data(df)
            elif self.transformation_type == "one_hot_encode":
                df = self._one_hot_encode(df)
            elif self.transformation_type == "binning":
                df = self._bin_data(df)
            elif self.transformation_type == "text_processing":
                df = self._process_text(df)
            elif self.transformation_type == "date_processing":
                df = self._process_dates(df)
            elif self.transformation_type == "custom_formula":
                df = self._apply_custom_formula(df)
            else:
                raise NodeExecutionError(
                    message=f"Unsupported transformation type: {self.transformation_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            self.update_progress(80, "transformation applied")
            
            # Drop NA values if configured
            if self.drop_na:
                df = df.dropna()
                self.update_progress(90, "NA values dropped")
            
            # Generate data profile
            profile = self._generate_data_profile(df)
            
            return {
                "default": df,
                "profile": profile
            }
            
        except Exception as e:
            logger.exception(f"Error applying transformation in node {self.node_id}")
            raise NodeExecutionError(
                message=f"Error applying transformation: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _filter_rows(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Filter rows based on conditions.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Filtered DataFrame
        """
        filter_type = self.node_config.get("filter_type", "condition")
        
        if filter_type == "condition":
            column = self.node_config.get("filter_column", "")
            operator = self.node_config.get("filter_operator", "==")
            value = self.node_config.get("filter_value", "")
            
            if not column or column not in df.columns:
                raise NodeExecutionError(
                    message=f"Invalid filter column: {column}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            try:
                if operator == "==":
                    return df[df[column] == value]
                elif operator == "!=":
                    return df[df[column] != value]
                elif operator == ">":
                    return df[df[column] > value]
                elif operator == ">=":
                    return df[df[column] >= value]
                elif operator == "<":
                    return df[df[column] < value]
                elif operator == "<=":
                    return df[df[column] <= value]
                elif operator == "in":
                    if not isinstance(value, list):
                        value = [value]
                    return df[df[column].isin(value)]
                elif operator == "not in":
                    if not isinstance(value, list):
                        value = [value]
                    return df[~df[column].isin(value)]
                elif operator == "contains":
                    return df[df[column].astype(str).str.contains(str(value), na=False)]
                elif operator == "starts_with":
                    return df[df[column].astype(str).str.startswith(str(value), na=False)]
                elif operator == "ends_with":
                    return df[df[column].astype(str).str.endswith(str(value), na=False)]
                else:
                    raise NodeExecutionError(
                        message=f"Unsupported filter operator: {operator}",
                        node_id=self.node_id,
                        node_type=self.__class__.__name__
                    )
            except Exception as e:
                raise NodeExecutionError(
                    message=f"Error applying filter: {str(e)}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                ) from e
                
        elif filter_type == "range":
            column = self.node_config.get("filter_column", "")
            min_value = self.node_config.get("min_value", None)
            max_value = self.node_config.get("max_value", None)
            
            if not column or column not in df.columns:
                raise NodeExecutionError(
                    message=f"Invalid filter column: {column}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            try:
                if min_value is not None and max_value is not None:
                    return df[(df[column] >= min_value) & (df[column] <= max_value)]
                elif min_value is not None:
                    return df[df[column] >= min_value]
                elif max_value is not None:
                    return df[df[column] <= max_value]
                else:
                    return df
            except Exception as e:
                raise NodeExecutionError(
                    message=f"Error applying range filter: {str(e)}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                ) from e
                
        elif filter_type == "top_n":
            n = self.node_config.get("n", 10)
            column = self.node_config.get("sort_column", "")
            ascending = self.node_config.get("ascending", False)
            
            if column and column in df.columns:
                return df.sort_values(by=column, ascending=ascending).head(n)
            else:
                return df.head(n)
                
        elif filter_type == "random_sample":
            n = self.node_config.get("n", None)
            frac = self.node_config.get("frac", None)
            random_state = self.node_config.get("random_state", None)
            
            if n is not None:
                return df.sample(n=n, random_state=random_state)
            elif frac is not None:
                return df.sample(frac=frac, random_state=random_state)
            else:
                return df.sample(frac=0.1, random_state=random_state)
                
        else:
            raise NodeExecutionError(
                message=f"Unsupported filter type: {filter_type}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
    
    def _filter_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Filter columns based on selection.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with selected columns
        """
        selection_type = self.node_config.get("selection_type", "include")
        columns = self.node_config.get("columns", [])
        
        if not columns:
            return df
        
        try:
            if selection_type == "include":
                # Keep only specified columns
                valid_columns = [col for col in columns if col in df.columns]
                if not valid_columns:
                    raise NodeExecutionError(
                        message="No valid columns specified for inclusion",
                        node_id=self.node_id,
                        node_type=self.__class__.__name__
                    )
                return df[valid_columns]
                
            elif selection_type == "exclude":
                # Remove specified columns
                return df.drop(columns=[col for col in columns if col in df.columns])
                
            elif selection_type == "pattern":
                # Select columns matching pattern
                pattern = self.node_config.get("pattern", "")
                if not pattern:
                    return df
                
                regex = re.compile(pattern)
                matching_columns = [col for col in df.columns if regex.search(col)]
                return df[matching_columns]
                
            else:
                raise NodeExecutionError(
                    message=f"Unsupported column selection type: {selection_type}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
        except Exception as e:
            if isinstance(e, NodeExecutionError):
                raise
            
            raise NodeExecutionError(
                message=f"Error filtering columns: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _rename_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Rename columns in the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with renamed columns
        """
        rename_dict = self.node_config.get("rename_dict", {})
        
        if not rename_dict:
            return df
        
        try:
            return df.rename(columns=rename_dict)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error renaming columns: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _sort_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Sort the DataFrame based on specified columns and order.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Sorted DataFrame
        """
        sort_columns = self.node_config.get("sort_columns", [])
        ascending = self.node_config.get("ascending", True)
        
        if not sort_columns:
            return df
        
        try:
            return df.sort_values(by=sort_columns, ascending=ascending)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error sorting data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _aggregate_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Aggregate the DataFrame based on specified columns and aggregation functions.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Aggregated DataFrame
        """
        group_columns = self.node_config.get("group_columns", [])
        aggregation_functions = self.node_config.get("aggregation_functions", {})
        
        if not group_columns or not aggregation_functions:
            return df
        
        try:
            return df.groupby(group_columns).agg(aggregation_functions)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error aggregating data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _join_data(self, df: pd.DataFrame, input_data: Dict[str, Any]) -> pd.DataFrame:
        """
        Join the DataFrame with another dataset based on specified conditions.
        
        Args:
            df: Input DataFrame
            input_data: Dictionary of input data
            
        Returns:
            Joined DataFrame
        """
        join_type = self.node_config.get("join_type", "inner")
        left_on = self.node_config.get("left_on", "")
        right_on = self.node_config.get("right_on", "")
        how = self.node_config.get("how", "inner")
        
        if not left_on or not right_on:
            raise NodeExecutionError(
                message="Both left_on and right_on must be specified for joining",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            right_df = input_data["default"]
            
            if not isinstance(right_df, pd.DataFrame):
                raise NodeExecutionError(
                    message=f"Right dataset is not a DataFrame: {type(right_df).__name__}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
            
            return pd.merge(df, right_df, left_on=left_on, right_on=right_on, how=how)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error joining data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _pivot_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Pivot the DataFrame based on specified columns.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Pivoted DataFrame
        """
        index = self.node_config.get("index", "")
        columns = self.node_config.get("columns", [])
        values = self.node_config.get("values", "")
        
        if not index or not columns or not values:
            raise NodeExecutionError(
                message="All of index, columns, and values must be specified for pivoting",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            return df.pivot(index=index, columns=columns, values=values)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error pivoting data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _unpivot_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Unpivot the DataFrame based on specified columns.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Unpivoted DataFrame
        """
        index = self.node_config.get("index", "")
        columns = self.node_config.get("columns", [])
        values = self.node_config.get("values", "")
        
        if not index or not columns or not values:
            raise NodeExecutionError(
                message="All of index, columns, and values must be specified for unpivoting",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            return df.melt(id_vars=index, value_vars=columns, var_name=values, value_name=values)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error unpivoting data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _convert_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Convert the DataFrame to specified data types.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with converted data types
        """
        convert_dict = self.node_config.get("convert_dict", {})
        
        if not convert_dict:
            return df
        
        try:
            return df.astype(convert_dict)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error converting data types: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _handle_missing_values(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Handle missing values in the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with handled missing values
        """
        handle_dict = self.node_config.get("handle_dict", {})
        
        if not handle_dict:
            return df
        
        try:
            for column, strategy in handle_dict.items():
                if strategy == "drop":
                    df = df.dropna(subset=[column])
                elif strategy == "fill":
                    df[column] = df[column].fillna(df[column].mean())
                elif strategy == "fill_median":
                    df[column] = df[column].fillna(df[column].median())
                elif strategy == "fill_mode":
                    df[column] = df[column].fillna(df[column].mode()[0])
                elif strategy == "fill_custom":
                    custom_value = self.node_config.get("custom_value", "")
                    df[column] = df[column].fillna(custom_value)
                else:
                    raise NodeExecutionError(
                        message=f"Unsupported missing value handling strategy: {strategy}",
                        node_id=self.node_id,
                        node_type=self.__class__.__name__
                    )
            return df
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error handling missing values: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _normalize_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Normalized DataFrame
        """
        normalization_type = self.node_config.get("normalization_type", "min_max")
        
        if normalization_type == "min_max":
            scaler = MinMaxScaler()
        elif normalization_type == "standard":
            scaler = StandardScaler()
        else:
            raise NodeExecutionError(
                message=f"Unsupported normalization type: {normalization_type}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            df_array = df.values
            df_array_scaled = scaler.fit_transform(df_array)
            df_scaled = pd.DataFrame(df_array_scaled, columns=df.columns, index=df.index)
            return df_scaled
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error normalizing data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _one_hot_encode(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        One-hot encode the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            One-hot encoded DataFrame
        """
        columns = self.node_config.get("columns", [])
        
        if not columns:
            raise NodeExecutionError(
                message="No columns specified for one-hot encoding",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            return pd.get_dummies(df[columns])
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error one-hot encoding data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _bin_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Bin the DataFrame based on specified columns.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Binned DataFrame
        """
        columns = self.node_config.get("columns", [])
        
        if not columns:
            raise NodeExecutionError(
                message="No columns specified for binning",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            return pd.cut(df[columns], bins=self.node_config.get("bins", 10))
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error binning data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _process_text(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process text data in the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Processed DataFrame
        """
        columns = self.node_config.get("columns", [])
        
        if not columns:
            raise NodeExecutionError(
                message="No columns specified for text processing",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            for column in columns:
                df[column] = df[column].str.lower()
            return df
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error processing text data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _process_dates(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Process date data in the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Processed DataFrame
        """
        columns = self.node_config.get("columns", [])
        
        if not columns:
            raise NodeExecutionError(
                message="No columns specified for date processing",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            for column in columns:
                df[column] = pd.to_datetime(df[column])
            return df
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error processing date data: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _apply_custom_formula(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Apply a custom formula to the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            DataFrame with applied formula
        """
        formula = self.node_config.get("formula", "")
        
        if not formula:
            raise NodeExecutionError(
                message="No formula specified for custom formula transformation",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        try:
            return df.eval(formula)
        except Exception as e:
            raise NodeExecutionError(
                message=f"Error applying custom formula: {str(e)}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) from e
    
    def _generate_data_profile(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Generate a data profile for the DataFrame.
        
        Args:
            df: Input DataFrame
            
        Returns:
            Dictionary with data profile
        """
        profile = {}
        
        profile["shape"] = df.shape
        profile["columns"] = df.columns.tolist()
        profile["dtypes"] = {str(col): str(dtype) for col, dtype in df.dtypes.items()}
        profile["missing_values"] = df.isnull().sum().to_dict()
        profile["unique_values"] = {col: df[col].nunique() for col in df.columns}
        
        # Handle non-serializable objects
        try:
            profile["top_values"] = {col: str(df[col].mode()[0]) if not df[col].empty else None for col in df.columns}
        except:
            profile["top_values"] = {}
            
        try:
            profile["bottom_values"] = {col: str(df[col].tail(1).values[0]) if not df[col].empty else None for col in df.columns}
        except:
            profile["bottom_values"] = {}
            
        # Calculate statistics for numeric columns only
        numeric_cols = df.select_dtypes(include=['number']).columns
        if not numeric_cols.empty:
            profile["mean_values"] = df[numeric_cols].mean().to_dict()
            profile["median_values"] = df[numeric_cols].median().to_dict()
            profile["std_dev_values"] = df[numeric_cols].std().to_dict()
            profile["min_values"] = df[numeric_cols].min().to_dict()
            profile["max_values"] = df[numeric_cols].max().to_dict()
        else:
            profile["mean_values"] = {}
            profile["median_values"] = {}
            profile["std_dev_values"] = {}
            profile["min_values"] = {}
            profile["max_values"] = {}
        
        return profile
    
    def get_required_inputs(self) -> List[str]:
        """
        Get the list of required input names for this node.
        
        Returns:
            List of required input names
        """
        if self.transformation_type == "join":
            return ["default", "right_dataset"]
        return ["default"]
    
    def get_expected_outputs(self) -> List[str]:
        """
        Get the list of expected output names for this node.
        
        Returns:
            List of expected output names
        """
        return ["default", "profile"]
    
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
        
        # For join operations, check that right dataset is a DataFrame
        if self.transformation_type == "join" and "right_dataset" in input_data:
            if not isinstance(input_data["right_dataset"], pd.DataFrame):
                raise DataValidationError(
                    message=f"Right dataset is not a DataFrame: {type(input_data['right_dataset']).__name__}",
                    node_id=self.node_id,
                    node_type=self.__class__.__name__
                )
    
    def validate_outputs(self, output_data: Dict[str, Any]) -> None:
        """
        Validate the output data from this node.
        
        Args:
            output_data: Dictionary of output data
            
        Raises:
            DataValidationError: If validation fails
        """
        super().validate_outputs(output_data)
        
        # Check that output data is a DataFrame
        if "default" in output_data and not isinstance(output_data["default"], pd.DataFrame):
            raise DataValidationError(
                message=f"Output data is not a DataFrame: {type(output_data['default']).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            )
        
        # Check that profile is a dictionary
        if "profile" in output_data and not isinstance(output_data["profile"], dict):
            raise DataValidationError(
                message=f"Profile is not a dictionary: {type(output_data['profile']).__name__}",
                node_id=self.node_id,
                node_type=self.__class__.__name__
            ) 