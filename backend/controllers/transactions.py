from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from db import get_connection

from auth_utils import get_current_user
from DB.transactions_db_operations import create_transaction, transition_by_id_user

router = APIRouter(prefix="/transactions", tags=["transactions"])

class TransactionCreateRequest(BaseModel):
    sub_category_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    amount : float
    transaction_type : str
    transaction_date : str
    

@router.post("/")
def create_new_transaction(payload: TransactionCreateRequest, 
                           current_user: dict = Depends(get_current_user),):
    
    conn = get_connection()
    
    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al DB non riuscita")
    
    try:
        user_id = current_user["id"]
        transaction_id = create_transaction(conn=conn,
            user_id=user_id,
            sub_category_id=payload.sub_category_id,
            title=payload.title,
            description=payload.description,
            amount=payload.amount,
            transaction_type=payload.transaction_type,
            transaction_date=payload.transaction_date,)
        
        return {
            "ok": True,
            "message": "Transazione inserita correttamente",
            "transaction_id": transaction_id,
            "user_id": user_id,
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
        
@router.get("/")
def read_transaction(current_user: dict = Depends(get_current_user),):
    
    conn = get_connection()
    
    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al Db non riuscita")
    
    try:
        user_id = current_user["id"]
        rows = transition_by_id_user(conn, user_id)
        
        return {
            "ok": True,
            "data": rows
        }
    
    except Exception as e:
        print("PRINT GET ERRORE:", str(e))
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()