from QUERY.transactions_queries import INSERT_TRANSACTION, GET_TRANSACTION

def create_transaction(conn, user_id, sub_category_id,title,description,
                       amount,transaction_type,transaction_date):
    
    cursor = conn.cursor()
    cursor.execute(INSERT_TRANSACTION, (user_id,
            sub_category_id,
            title,
            description,
            amount,
            transaction_type,
            transaction_date,
        ),)
    
    transaction_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    
    return transaction_id


def transition_by_id_user (conn, user_id):
    
    cursor = conn.cursor()
    cursor.execute(GET_TRANSACTION, (user_id,))
    rows = cursor.fetchall()
    
    column_names = [desc[0] for desc in cursor.description]
    
    result = []
    for row in rows:
        record = dict(zip(column_names, row))
        result.append(record)
        
    cursor.close()
    return result
    