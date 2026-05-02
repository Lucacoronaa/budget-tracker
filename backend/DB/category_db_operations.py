from QUERY.macro_category import GET_MACRO_CATEGORIES

def get_macro_categories(conn):
    cursor = conn.cursor()
    cursor.execute(GET_MACRO_CATEGORIES)
    rows = cursor.fetchall()

    column_names = [desc[0] for desc in cursor.description]
    result = []

    for row in rows:
        record = dict(zip(column_names, row))
        result.append(record)

    cursor.close()
    return result