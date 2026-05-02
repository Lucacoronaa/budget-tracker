from QUERY.auth_queries import GET_USER_BY_EMAIL, POST_USER

def get_user_by_email(conn,email):
    
    cursor = conn.cursor()
    cursor.execute(GET_USER_BY_EMAIL, (email,))
    row = cursor.fetchone()
    
    if row is None:
        cursor.close()
        return None
    
    columns_name = [desc[0] for desc in cursor.description]
    result = dict(zip(columns_name, row))
    
    cursor.close()
    return result



def post_create_user(conn, email, password_hash):

    cursor = conn.cursor()
    cursor.execute(POST_USER, (email, password_hash))
    
    user_id = cursor.fetchone()[0]
    conn.commit()
    conn.close()
    
    return user_id