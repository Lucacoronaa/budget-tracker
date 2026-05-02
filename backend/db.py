import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    try:
        database_url = os.getenv("DATABASE_URL")

        if not database_url:
            print("DATABASE_URL mancante nel file .env")
            return None

        conn = psycopg2.connect(database_url)
        print("Connessione al database riuscita")
        return conn

    except Exception as e:
        print("Errore durante la connessione al DB:", str(e))
        return None


if __name__ == "__main__":
    conn = get_connection()
    if conn:
        print("connessione riuscita")
        conn.close()