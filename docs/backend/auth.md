# auth Backend Module

## Overview

This documentation is automatically generated for the auth backend module.

## Files

```
backend/app/api/auth/__init__.py
backend/app/api/auth/router.py
```

## Endpoints

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:@router.get("/me")
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:@router.post("/login", response_model=Token)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:@router.post("/logout")
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:@router.post("/refresh", response_model=Token)
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:@router.post("/register", response_model=Token)
```

## Models

```
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:class Token(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    access_token: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    refresh_token: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    token_type: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:class TokenData(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    sub: Optional[str] = None
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:class UserLogin(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    email: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    password: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py:class UserRegister(BaseModel):
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    name: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    email: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    password: str
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-# Mock user database - in a real app, this would be in a database
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-USERS_DB = {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-    "john@example.com": {
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-        "id": "user_1",
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-        "name": "John Doe",
/Users/mattysquarzoni/Documents/PRJCT_CODE_LOCAL/DW_class_stuff/DW_final/backend/app/api/auth/router.py-        "email": "john@example.com",
```

## Last Updated

Wed Feb 26 21:17:52 EST 2025
