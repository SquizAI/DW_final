# users Backend Module

## Overview

This documentation is automatically generated for the users backend module.

## Files

```
backend/app/api/users/__init__.py
backend/app/api/users/router.py
```

## Endpoints

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:@router.get("/", response_model=List[User])
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:@router.get("/{user_id}", response_model=User)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:@router.post("/", response_model=User, status_code=status.HTTP_201_CREATED)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:@router.put("/{user_id}", response_model=User)
```

## Models

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:class UserBase(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    email: EmailStr
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    name: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    role: str = "user"
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-class UserCreate(UserBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    password: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py:class UserUpdate(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    email: Optional[EmailStr] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    name: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    role: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    avatar: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-class User(UserBase):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    id: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    avatar: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    created_at: datetime = datetime.now()
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/users/router.py-    updated_at: datetime = datetime.now()
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025
