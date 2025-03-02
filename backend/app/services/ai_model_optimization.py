from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import make_scorer, accuracy_score, r2_score, f1_score
import optuna
import openai
from app.config import settings

class AutoMLOptimizer:
    def __init__(self, task_type: str = 'classification'):
        self.task_type = task_type
        self.best_model = None
        self.best_params = None
        self.feature_importance = None
        self.optimization_history = []

    async def optimize_model(
        self,
        X: pd.DataFrame,
        y: pd.Series,
        n_trials: int = 100,
        timeout: int = 3600,
    ) -> Dict[str, Any]:
        """
        Automatically optimize model hyperparameters using Optuna and AI guidance.
        """
        try:
            # Get AI suggestions for hyperparameter ranges
            param_suggestions = await self._get_ai_parameter_suggestions(X, y)
            
            # Create Optuna study
            study = optuna.create_study(direction="maximize")
            
            # Define objective function
            def objective(trial):
                params = {}
                for param, config in param_suggestions.items():
                    if config["type"] == "int":
                        params[param] = trial.suggest_int(
                            param, config["low"], config["high"], log=config.get("log", False)
                        )
                    elif config["type"] == "float":
                        params[param] = trial.suggest_float(
                            param, config["low"], config["high"], log=config.get("log", False)
                        )
                    elif config["type"] == "categorical":
                        params[param] = trial.suggest_categorical(param, config["choices"])

                # Create and evaluate model
                model = self._create_model(params)
                scores = cross_val_score(
                    model, X, y, 
                    cv=5, 
                    scoring=self._get_scoring_metric()
                )
                return scores.mean()

            # Run optimization
            study.optimize(objective, n_trials=n_trials, timeout=timeout)

            # Train final model with best parameters
            self.best_params = study.best_params
            self.best_model = self._create_model(self.best_params)
            self.best_model.fit(X, y)

            # Calculate feature importance
            self.feature_importance = self._calculate_feature_importance(X)

            # Get AI insights about the optimization
            optimization_insights = await self._get_ai_optimization_insights(
                study,
                X,
                y,
                self.best_params,
                self.feature_importance
            )

            return {
                "best_params": self.best_params,
                "best_score": study.best_value,
                "feature_importance": self.feature_importance,
                "optimization_history": study.trials_dataframe().to_dict(),
                "insights": optimization_insights,
            }

        except Exception as e:
            print(f"Error in model optimization: {e}")
            return {"error": str(e)}

    async def _get_ai_parameter_suggestions(
        self,
        X: pd.DataFrame,
        y: pd.Series
    ) -> Dict[str, Dict[str, Any]]:
        """
        Get AI suggestions for hyperparameter ranges based on data characteristics.
        """
        try:
            # Prepare context for AI
            context = {
                "task_type": self.task_type,
                "n_samples": len(X),
                "n_features": X.shape[1],
                "feature_types": X.dtypes.astype(str).to_dict(),
                "class_distribution": y.value_counts().to_dict() if self.task_type == "classification" else None,
                "target_stats": {
                    "mean": float(y.mean()),
                    "std": float(y.std()),
                    "min": float(y.min()),
                    "max": float(y.max()),
                } if self.task_type == "regression" else None,
            }

            prompt = f"""Suggest optimal hyperparameter ranges for {self.task_type} task:
            {context}
            
            Consider:
            1. Dataset size and dimensionality
            2. Feature characteristics
            3. Target distribution
            4. Computational constraints
            5. Model complexity trade-offs
            
            Format response as a JSON object with parameter ranges."""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a hyperparameter optimization expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in parameter suggestions: {e}")
            return self._get_default_param_ranges()

    def _get_default_param_ranges(self) -> Dict[str, Dict[str, Any]]:
        """Get default hyperparameter ranges."""
        if self.task_type == "classification":
            return {
                "n_estimators": {"type": "int", "low": 50, "high": 500, "log": True},
                "max_depth": {"type": "int", "low": 3, "high": 20},
                "min_samples_split": {"type": "int", "low": 2, "high": 20},
                "min_samples_leaf": {"type": "int", "low": 1, "high": 10},
            }
        else:
            return {
                "n_estimators": {"type": "int", "low": 50, "high": 500, "log": True},
                "max_depth": {"type": "int", "low": 3, "high": 30},
                "min_samples_split": {"type": "int", "low": 2, "high": 20},
                "min_samples_leaf": {"type": "int", "low": 1, "high": 10},
            }

    def _create_model(self, params: Dict[str, Any]):
        """Create model with specified parameters."""
        if self.task_type == "classification":
            return RandomForestClassifier(**params, random_state=42)
        else:
            return RandomForestRegressor(**params, random_state=42)

    def _get_scoring_metric(self):
        """Get appropriate scoring metric."""
        if self.task_type == "classification":
            return make_scorer(f1_score, average='weighted')
        else:
            return make_scorer(r2_score)

    def _calculate_feature_importance(self, X: pd.DataFrame) -> Dict[str, float]:
        """Calculate feature importance scores."""
        if self.best_model is None:
            return {}
        
        importance = self.best_model.feature_importances_
        return dict(zip(X.columns, importance))

    async def _get_ai_optimization_insights(
        self,
        study: optuna.Study,
        X: pd.DataFrame,
        y: pd.Series,
        best_params: Dict[str, Any],
        feature_importance: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Get AI insights about the optimization process and results.
        """
        try:
            # Prepare optimization context
            context = {
                "study_statistics": {
                    "n_trials": len(study.trials),
                    "best_score": study.best_value,
                    "best_params": best_params,
                },
                "parameter_importance": study.get_param_importances(),
                "feature_importance": feature_importance,
                "data_stats": {
                    "n_samples": len(X),
                    "n_features": X.shape[1],
                },
            }

            prompt = f"""Analyze the model optimization results:
            {context}
            
            Provide insights about:
            1. Parameter sensitivity and importance
            2. Feature importance patterns
            3. Model complexity analysis
            4. Potential improvements
            5. Performance trade-offs
            
            Format response as a JSON object with detailed insights."""

            response = await openai.ChatCompletion.acreate(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": "You are a model optimization expert."},
                    {"role": "user", "content": prompt}
                ],
                response_format={ "type": "json_object" }
            )

            return response.choices[0].message.content

        except Exception as e:
            print(f"Error in optimization insights: {e}")
            return {
                "parameter_insights": [],
                "feature_insights": [],
                "improvement_suggestions": []
            }

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Make predictions using the best model."""
        if self.best_model is None:
            raise ValueError("Model has not been trained yet")
        return self.best_model.predict(X)

    def predict_proba(self, X: pd.DataFrame) -> np.ndarray:
        """Get prediction probabilities for classification."""
        if self.task_type != "classification" or self.best_model is None:
            raise ValueError("Probability predictions only available for trained classification models")
        return self.best_model.predict_proba(X)

    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores."""
        return self.feature_importance or {} 