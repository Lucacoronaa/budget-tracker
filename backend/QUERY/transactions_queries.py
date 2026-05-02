INSERT_TRANSACTION = """
                        INSERT INTO transactions (user_id,
                                                    sub_category_id,
                                                    title,
                                                    description,
                                                    amount,
                                                    transaction_type,
                                                    transaction_date)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id;
                    """
                    
                    
GET_TRANSACTION = """
                select t.id, user_id, sub_category_id, title, description, 
                        amount, transaction_type, transaction_date, t.created_at,
                        t.updated_at, sc.name as sub_category_name, 
                        mc.name as macro_category_name
                from transactions t
                left join sub_categories  sc
                on t.sub_category_id  = SC.id
                left join macro_categories mc 
                on sc.macro_category_id  = mc.id
                where t.user_id = %s
                """

