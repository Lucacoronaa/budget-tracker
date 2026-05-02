from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from db import get_connection
from DB.auth_db_operation import get_user_by_email
from security import decode_access_token

bearer_scheme = HTTPBearer()


def get_current_user(credentials: HTTPAuthorizationCredentials=Depends(bearer_scheme)):
    
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="token non vlaido o scaduto")
    
    email = payload.get("email")
    user_id = payload.get("sub")
    if email is None or user_id is None:
        raise HTTPException(status_code=401, detail="Payload token non valido")
    
    conn = get_connection()
    
    if conn is None:
        raise HTTPException(status_code=500, detail="COnnessione al db non riuscita")
    
    try:
        user = get_user_by_email(conn, email)
        if user is None:
            raise HTTPException(status_code=401, detail="Utente non trovato")    
        return user
    
    finally:
        conn.close()