import bcrypt
import flask
from flask import Flask, render_template, url_for, jsonify, request, session
from dotenv import load_dotenv
import data_manager
from util import json_response, is_logged_in
import mimetypes
import queries
from queries import get_statuses


mimetypes.add_type('application/javascript', '.js')
app = Flask(__name__)
app.secret_key = 'ff907d51-fb85-40d3-bab3-7635b7f9fa74'
load_dotenv()


@app.route("/")
def index():
    """
    This is a one-pager which shows all the boards and cards
    """
    return render_template('index.html')


@app.route('/api/v1/login', methods=['POST'])
def api_login():
    username = request.form['username']
    password = request.form['password']

    errors = []

    user = queries.get_user_by_name(username)
    if not user:
        errors.append(f"{username} not exists")
        response = flask.jsonify(errors), 404
        return response
    is_password_correct = bcrypt.checkpw(password.encode("utf-8"), user['password'].encode("utf-8"))

    if is_password_correct:
        flask.session['username'] = username
        flask.session['is_logged'] = True
        return flask.jsonify(errors), 200
    else:
        return flask.jsonify(['Password incorrect!']), 401


@app.route('/api/v1/logout', methods=['POST'])
def api_logout():
    session.clear()
    return flask.redirect("/")


# @app.route('/api/v1/logout', methods=['POST'])
# def api_logout():
#     if 'username' in flask.session:
#         del flask.session['username']
#     if 'is_logged' in flask.session:
#         del flask.session['is_logged']
#     return flask.jsonify({"message": "Logged out successfully"}), 200


@app.route('/api/v1/register', methods=['POST'])
def api_register():
    username = request.form['username']
    password = request.form['password']
    repeat_password = request.form['repeat_password']
    email = request.form['email']
    errors = []
    if not password == repeat_password:
        errors.append("Passwords not match")
    if len(password) < 4:
        errors.append("Password too short")
    if len(username) < 4:
        errors.append("Username too short")
    if queries.check_user_by_name(username) > 0:
        errors.append("User already exists")
    if len(errors) > 0:
        return flask.jsonify(errors), 401
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    user_id = queries.add_user(username, email, hashed_password.decode("utf-8"))
    if user_id:
        return flask.jsonify(errors), 200


# @app.route("/logout")
# def logout():
#     session.pop('username', None)
#     session.pop('user_id', None)
#     return flask.redirect("/")


@app.route("/api/boards")
@json_response
def get_boards():
    """
    All the boards
    """
    return queries.get_boards()


@app.route("/api/boards/<int:board_id>/cards/")
@json_response
def get_cards_for_board(board_id: int):
    """
    All cards that belongs to a board
    :param board_id: id of the parent board
    """
    return queries.get_cards_for_board(board_id)


@app.route("/api/cards")
@json_response
def get_cards():
    return queries.get_cards()


@app.route('/api/statuses', methods=['GET'])
def handle_get_statuses():
    statuses = get_statuses()
    return jsonify(statuses), 200


@app.route("/api/boards", methods=["POST"])
@json_response
def create_board():
    print("Starting create_board route handler...")
    try:
        data = request.get_json()
        title = data.get("title")
        if not title:
            print("Error: Title is missing.")
            return {"success": False, "message": "Title is required"}, 400

        board_id = queries.create_board(title)
        print("Board ID from create_board route handler:", board_id)

        if board_id:
            return {"success": True, "board_id": board_id}, 201
        else:
            return {"success": False, "message": "Failed to create board"}, 500
    except Exception as e:
        print("Unexpected error in create_board route handler:", e)
        return {"success": False, "message": "An unexpected error occurred."}, 500


@app.route("/api/cards/<int:card_id>", methods=['DELETE'])
@json_response
def delete_card(card_id: int):
    """
    Delete a card by its ID
    """
    return queries.delete_card(card_id)


@app.route("/api/boards/<int:board_id>", methods=['DELETE'])
@json_response
def delete_board(board_id: int):
    """
    Delete a board by its ID
    """
    try:
        # Usuń tablicę o podanym ID
        data_manager.execute_modify("DELETE FROM boards WHERE id = %(board_id)s", {"board_id": board_id})
        return {"message": "Board deleted successfully."}
    except Exception as e:
        # Jeśli coś pójdzie nie tak, zwróć błąd
        return {"message": f"Error: {str(e)}"}, 500


# Aktualizacja tablicy
@app.route("/api/boards/<int:board_id>", methods=["PUT"])
def update_board_title(board_id):
    data = request.get_json()

    print("Received data:", data)

    new_title = data.get("title")

    print("New title:", new_title)

    if not new_title:
        return jsonify({"success": False, "message": "Tytuł jest wymagany"}), 400

    # Aktualizuje tytuł w bazie danych
    success = queries.update_board_title(board_id, new_title)

    print("Update result:", success)

    if success:
        return jsonify({"success": True, "message": "Tytuł został pomyślnie zaktualizowany"}), 200
    else:
        return jsonify({"success": False, "message": "Nie udało się zaktualizować tytułu"}), 500


@app.route("/api/cards", methods=["POST"])
@json_response
def create_card():
    try:
        data = request.get_json()
        title = data.get("title")
        board_id = data.get("board_id")
        status_id = data.get("status_id")

        if not title or not board_id or not status_id:
            return {"success": False, "message": "Title, board_id, and status_id are required"}, 400

        card_id = queries.add_card(title, board_id, status_id)

        if card_id:
            return {"success": True, "card_id": card_id}, 201
        else:
            return {"success": False, "message": "Failed to create card"}, 500
    except Exception as e:
        return {"success": False, "message": f"An unexpected error occurred: {str(e)}"}, 500


# Częściowa aktualizacja karty
@app.route("/api/cards/<int:card_id>", methods=['PATCH'])
@json_response
def patch_card(card_id: int):
    """
    Partially update a card by its ID
    """
    data = request.get_json()
    # Assuming you might update the title or description
    new_title = data.get('title')
    new_description = data.get('description')
    return queries.patch_card(card_id, new_title, new_description)


def main():
    app.run(debug=True)

    # Serving the favicon
    with app.app_context():
        app.add_url_rule('/favicon.ico', redirect_to=url_for('static', filename='favicon/favicon.ico'))


if __name__ == '__main__':
    main()
