from fastapi import APIRouter, HTTPException
from db import get_connection
from DB.category_db_operations import get_macro_categories
from DB.sub_category_db_operations import get_sub_categories

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/macro")
def read_macro_categories():
    conn = get_connection()

    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al database non riuscita")

    try:
        rows = get_macro_categories(conn)
        return {
            "ok": True,
            "data": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()
        
        
@router.get("/sub")
def read_sub_categories(macro_category_id: int = None):
    conn = get_connection()

    if conn is None:
        raise HTTPException(status_code=500, detail="Connessione al database non riuscita")

    try:
        rows = get_sub_categories(conn, macro_category_id)
        return {
            "ok": True,
            "data": rows
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()