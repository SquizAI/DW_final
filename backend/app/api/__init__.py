from fastapi import APIRouter
from app.api.auth.router import router as auth_router
from app.api.users.router import router as users_router
from app.api.datasets.router import router as datasets_router
from app.api.workflows.router import router as workflows_router
from app.api.agentic.routes import router as agentic_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(datasets_router, prefix="/datasets", tags=["datasets"])
api_router.include_router(workflows_router, prefix="/workflows", tags=["workflows"])
api_router.include_router(agentic_router, prefix="/agentic", tags=["agentic"]) 