import data_manager
import util


def add_user(username, email, hashed_password):
    return data_manager.execute_modify("""
                    INSERT INTO users (username, email, password) 
                    VALUES (%(username)s, %(email)s, %(hashed_password)s) RETURNING user_id;""",
                   {"username": username, "email": email, "hashed_password": hashed_password})['user_id']


def get_user_by_name(username):
    return data_manager.execute_select("select * from users where username = %(username)s", {"username": username}, False)


def check_user_by_name(username):
    return data_manager.execute_select("SELECT count(user_id) AS count FROM users WHERE username = %(username)s", {"username": username}, False)["count"]


def get_card_status(status_id):
    """
    Find the first status matching the given id
    :param status_id:
    :return: str
    """
    status = data_manager.execute_select(
        """
        SELECT * FROM statuses s
        WHERE s.id = %(status_id)s
        ;
        """
        , {"status_id": status_id})

    return status


def get_boards():
    """
    Gather all boards
    :return:
    """
    # remove this code once you implement the database
    #return [{"title": "board1", "id": 1}, {"title": "board2", "id": 2}]

    return data_manager.execute_select(
        """
        SELECT * FROM boards
        ;
        """
    )


def get_cards_for_board(board_id):

    matching_cards = data_manager.execute_select(
        """
        SELECT * FROM cards
        WHERE cards.board_id = %(board_id)s
        ;
        """
        , {"board_id": board_id})

    return matching_cards


def get_statuses():
    """
    Gather all statuses
    :return:
    """
    return data_manager.execute_select(
        """
        SELECT * FROM statuses
        ;
        """
    )


def create_board(title):
    print("Starting create_board in queries...")
    query = """
    INSERT INTO boards (title)
    VALUES (%(title)s)
    RETURNING id;
    """
    params = {"title": title}
    try:
        board_id = data_manager.execute_modify(query, params)
        print("Board ID from create_board in queries:", board_id)
        return board_id
    except Exception as e:
        print("Error in create_board in queries:", e)
        return None


def update_board_title(board_id, title):
    """
    Update a board's title by its ID
    """
    query = """
    UPDATE boards
    SET title = %(title)s
    WHERE id = %(board_id)s;
    """
    params = {"title": title, "board_id": board_id}

    # Zakładam, że execute_modify zwraca True, jeśli operacja się powiedzie, i None w przeciwnym razie.
    success = data_manager.execute_modify(query, params)

    # Jeśli success jest None, przypisz wartość False
    if success is None:
        success = False

    return success


def delete_card(card_id):
    """
    Delete a card by its ID
    """
    query = """
    DELETE FROM cards
    WHERE id = %(card_id)s;
    """
    params = {"card_id": card_id}
    data_manager.execute_modify(query, params)
    return {"status": "success", "message": "Card deleted successfully."}


def add_card(title, board_id, status_id):
    """
    Add a new card with the given title, board_id, and status_id
    """
    # Pobierz najwyższą wartość card_order dla danej tablicy
    order_query = """
    SELECT MAX(card_order) FROM cards WHERE board_id = %(board_id)s;
    """
    max_order = data_manager.execute_select(order_query, {"board_id": board_id})
    next_order = max_order[0]["max"] + 1 if max_order[0]["max"] else 1

    # Dodaj kartę z odpowiednią wartością card_order
    query = """
    INSERT INTO cards (title, board_id, status_id, card_order)
    VALUES (%(title)s, %(board_id)s, %(status_id)s, %(card_order)s)
    RETURNING id;
    """
    params = {"title": title, "board_id": board_id, "status_id": status_id, "card_order": next_order}
    return data_manager.execute_modify(query, params)


def update_board_title(board_id, new_title):
    query = """
    UPDATE boards
    SET title = %(title)s
    WHERE id = %(board_id)s;
    """
    params = {"title": new_title, "board_id": board_id}
    result = data_manager.execute_modify(query, params)
    return result


def delete_board(board_id):
    # Usunięcie powiązanych kart
    data_manager.execute_modify(
        """
        DELETE FROM cards
        WHERE board_id = %(board_id)s
        """,
        {"board_id": board_id}
    )

    # Usunięcie tablicy
    data_manager.execute_modify(
        """
        DELETE FROM boards
        WHERE id = %(board_id)s
        """,
        {"board_id": board_id}
    )
    return {"status": "success", "message": "Board and its cards deleted successfully."}


def patch_card(card_id, title=None, description=None):
    """
    Partially update a card by its ID
    """
    query_parts = ["UPDATE cards SET"]
    params = {"card_id": card_id}

    if title:
        query_parts.append("title = %(title)s")
        params["title"] = title
    if description:
        query_parts.append("description = %(description)s")
        params["description"] = description

    query_parts.append("WHERE id = %(card_id)s;")
    query = " ".join(query_parts)

    data_manager.execute_modify(query, params)
    return {"status": "success", "message": "Card updated successfully."}