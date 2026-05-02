from QUERY.dashboard_queries import GET_DASHBOARD_QUERY

def get_dashboard_summary(conn, user_id):
    
    cursor = conn.cursor()
    cursor.execute(GET_DASHBOARD_QUERY, (user_id,))
    
    row= cursor.fetchone()
    column_names = [desc[0] for desc in cursor.description]
    
    result = dict (zip(column_names, row))
    
    cursor.close()
    return result

