from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Create router
router = APIRouter()

# Models
class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str = "user"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None

class User(UserBase):
    id: str
    avatar: Optional[str] = None
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    class Config:
        from_attributes = True

# Mock user database - in a real app, this would be in a database
USERS_DB = {
    "user_1": {
        "id": "user_1",
        "name": "John Doe",
        "email": "john@example.com",
        "password": "password123",  # In a real app, this would be hashed
        "role": "admin",
        "avatar": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1180&q=80",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    },
    "user_2": {
        "id": "user_2",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "password": "password456",  # In a real app, this would be hashed
        "role": "user",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80",
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
}

# Helper function to convert user dict to User model
def user_dict_to_model(user_dict):
    user_copy = user_dict.copy()
    user_copy.pop("password", None)  # Remove password
    return User(**user_copy)

# Endpoints
@router.get("/", response_model=List[User])
async def get_users():
    """Get all users"""
    return [user_dict_to_model(user) for user in USERS_DB.values()]

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Get a specific user by ID"""
    if user_id not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user_dict_to_model(USERS_DB[user_id])

@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Create a new user"""
    # Check if email already exists
    for existing_user in USERS_DB.values():
        if existing_user["email"] == user.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Create new user
    user_id = f"user_{len(USERS_DB) + 1}"
    new_user = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "password": user.password,  # In a real app, this would be hashed
        "role": user.role,
        "avatar": None,
        "created_at": datetime.now(),
        "updated_at": datetime.now()
    }
    
    USERS_DB[user_id] = new_user
    return user_dict_to_model(new_user)

@router.put("/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update a user"""
    if user_id not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields
    user_data = USERS_DB[user_id]
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if value is not None:
            user_data[field] = value
    
    user_data["updated_at"] = datetime.now()
    USERS_DB[user_id] = user_data
    
    return user_dict_to_model(user_data)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str):
    """Delete a user"""
    if user_id not in USERS_DB:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    del USERS_DB[user_id]
    return None 