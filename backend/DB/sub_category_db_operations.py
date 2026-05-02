from QUERY.sub_category import GET_SUB_CATEGORY, GET_SUB_CATEGORY_BY_MACRO_ID


def get_sub_categories(conn, macro_category_id = None):
    cursor = conn.cursor()
    
    if macro_category_id is not None:
        cursor.execute(GET_SUB_CATEGORY_BY_MACRO_ID, (macro_category_id,))
    else:
        cursor.execute(GET_SUB_CATEGORY)
        
    rows = cursor.fetchall()
    column_name = [desc[0] for desc in cursor.description]
    
    result = []
    
    for row in rows:
        record = dict(zip(column_name, row))
        result.append(record)
    
    cursor.close()
    return result 