
GET_SUB_CATEGORY="""
                        SELECT *
                        FROM sub_categories
                        where is_active = true;
"""


GET_SUB_CATEGORY_BY_MACRO_ID = """
                                select *
                                from sub_categories
                                where is_active = true
                                and macro_category_id = %s;


"""

