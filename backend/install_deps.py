import subprocess
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def install_dependencies():
    """Install required dependencies"""
    logger.info("Installing required dependencies...")
    
    # List of required packages
    packages = [
        "fastapi",
        "uvicorn[standard]",
        "python-multipart",
        "python-dotenv",
        "sqlalchemy",
        "kaggle",
        "pandas",
        "numpy",
        "requests",
        "pydantic",
        "alembic"
    ]
    
    # Install packages
    for package in packages:
        logger.info(f"Installing {package}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            logger.info(f"Successfully installed {package}")
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to install {package}: {e}")
    
    logger.info("Dependency installation completed")

if __name__ == "__main__":
    install_dependencies() 