from DB.auth_db_operation import get_user_by_email, post_create_user
from fastapi import APIRouter, HTTPException, Depends
from db import get_connection
from pydantic import BaseModel, EmailStr
import bcrypt
from security import create_access_token, hash_password, verify_password
from auth_utils import get_current_user
router = APIRouter(prefix="/auth", tags=["auth"])

class RegisterRequests(BaseModel):
    email: EmailStr
    password: str
    
class LoginRequest(BaseModel):
    email: EmailStr
    password: str




@router.post("/register")
def register(payload: RegisterRequests):
    conn = get_connection()

    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al database non riuscita")

    try:
        existing_user = get_user_by_email(conn, payload.email)
        
        if existing_user is not None:
            raise HTTPException(status_code=400, detail="Email già registrata")
        
        password_hash = hash_password(payload.password)
        
        user_id = post_create_user(conn, payload.email, password_hash)
        
        return{
            "ok": True,
            "message": "Utente registrato correttamente",
            "user_id": user_id
        }
        
    except HTTPException:
        raise            
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
        
        
        
@router.post("/login")
def login_user(payload: LoginRequest):
    
    conn = get_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al database non riuscita")
    
    try:
        
        user = get_user_by_email(conn, payload.email)
        if user is None:
            raise HTTPException(status_code=401, detail="Credenziali non valide")
        
        password_is_valid = verify_password(payload.password, user["password_hash"])
        if not password_is_valid:
            raise HTTPException(status_code=401, detail="Credenziali non valide")
        
        access_token = create_access_token(data={
            "sub": str(user["id"]),
            "email": user["email"]
        })
        
        return {
            "ok": True,
            "message": "Login effettuato con successo",
            "access_token": access_token,
            "token_type": "bearer",
            "user":{
                "id": user["id"],
                "email": user["email"]
            }}
        
    except HTTPException:
        raise            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
        
        
@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "ok": True,
        "user":{
            "id": current_user["id"],
            "email": current_user["email"]
        }
    }       
        
        