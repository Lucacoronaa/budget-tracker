GET_USER_BY_EMAIL = """
            select id, email, password_hash,created_at, updated_at
            from users
            where email = %s
"""
    
    
POST_USER = """
            INSERT INTO users (email, password_hash)
            values (%s, %s)
            returning id
"""
