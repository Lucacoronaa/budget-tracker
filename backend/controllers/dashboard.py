from fastapi import APIRouter, HTTPException, Depends
from db import get_connection
from DB.dashboard_db_operations import get_dashboard_summary
from auth_utils import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def read_dashboard_summary (current_user: dict= Depends(get_current_user),):
    
    conn = get_connection()
    
    if conn is None:
        raise HTTPException (status_code=500, detail="Connesione al db non riuscita")
    
    try:
        user_id = current_user["id"]
        summmary = get_dashboard_summary(conn, user_id)
        
        return {
            "ok": True,
            "data": summmary
        }
        
    except Exception as e:
        print("ERRORE DASHBOARD:",  str(e))
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()