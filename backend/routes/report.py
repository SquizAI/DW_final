from typing import List, Dict, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import pandas as pd
from ..services.report_generator import ReportGenerator
from ..services.data_service import get_active_dataset

router = APIRouter(prefix="/api/report", tags=["report"])

class ReportSection(BaseModel):
    id: str
    title: str
    type: str
    description: str
    status: str = "pending"

class ReportConfig(BaseModel):
    title: str
    description: str
    sections: List[str]
    format: str = "pdf"
    options: Dict[str, bool] = {
        "include_code": True,
        "include_charts": True,
        "include_statistics": True,
    }

@router.get("/sections")
async def get_report_sections() -> List[ReportSection]:
    """Get available report sections."""
    return [
        ReportSection(
            id="data_summary",
            title="Data Summary",
            type="overview",
            description="Basic dataset information and statistics",
        ),
        ReportSection(
            id="feature_analysis",
            title="Feature Analysis",
            type="analysis",
            description="Detailed analysis of individual features",
        ),
        ReportSection(
            id="correlation_analysis",
            title="Correlation Analysis",
            type="analysis",
            description="Analysis of relationships between features",
        ),
        ReportSection(
            id="distribution_analysis",
            title="Distribution Analysis",
            type="analysis",
            description="Analysis of feature distributions",
        ),
        ReportSection(
            id="feature_importance",
            title="Feature Importance",
            type="analysis",
            description="Analysis of feature importance for prediction",
        ),
    ]

@router.post("/preview/{section_id}")
async def preview_section(section_id: str) -> Dict:
    """Preview a specific report section."""
    try:
        # Get active dataset
        data = get_active_dataset()
        if data is None:
            raise HTTPException(status_code=404, detail="No active dataset found")

        # Initialize report generator
        generator = ReportGenerator(data)

        # Generate section content
        content = generator._generate_section_content(
            section_id,
            options={
                "include_code": True,
                "include_charts": True,
                "include_statistics": True,
            }
        )

        if content is None:
            raise HTTPException(status_code=404, detail=f"Section {section_id} not found")

        return content

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_report(config: ReportConfig):
    """Generate a report with the specified configuration."""
    try:
        # Get active dataset
        data = get_active_dataset()
        if data is None:
            raise HTTPException(status_code=404, detail="No active dataset found")

        # Initialize report generator
        generator = ReportGenerator(data)

        # Generate report
        output = generator.generate_report(
            title=config.title,
            description=config.description,
            sections=config.sections,
            format=config.format,
            options=config.options,
        )

        # Return file response
        filename = f"report_{pd.Timestamp.now().strftime('%Y%m%d_%H%M%S')}"
        content_type = {
            "pdf": "application/pdf",
            "html": "text/html",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "md": "text/markdown",
        }[config.format]

        return {
            "filename": f"{filename}.{config.format}",
            "content_type": content_type,
            "content": output.getvalue(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 